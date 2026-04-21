// ── Dictionary API Client with Local Caching ────────────
// Uses the free dictionaryapi.dev (no API key required)

const DICT_API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const CACHE_PREFIX = 'wc_';

/**
 * Fetch full word data. Priority:
 *  1. Curated WORDS array (hand-crafted mnemonics, etymology, homonyms)
 *  2. Local cache (chrome.storage.local)
 *  3. Free Dictionary API (fetched + cached)
 *  4. Fallback stub
 */
async function fetchWordData(wordStr, level) {
    const normalized = wordStr.toLowerCase().trim();

    // 1. Check curated words
    if (typeof WORDS !== 'undefined') {
        const curated = WORDS.find(
            w => w.word.toLowerCase() === normalized || w.id === normalized
        );
        if (curated) {
            return { ...curated, id: normalized, level: level || curated.level };
        }
    }

    // 2. Check local cache
    const cacheKey = CACHE_PREFIX + normalized;
    try {
        const cached = await chrome.storage.local.get(cacheKey);
        if (cached[cacheKey]) {
            const c = cached[cacheKey];
            // Skip stale cache entries missing critical fields
            if (c.meaning && c.usage && c.etymology) {
                return { ...c, level: level || c.level };
            }
            // Clear stale entry so it gets re-fetched
            chrome.storage.local.remove(cacheKey).catch(() => {});
        }
    } catch (_) { /* storage error — continue to API */ }

    // 3. Fetch from API
    try {
        const resp = await fetch(DICT_API_BASE + encodeURIComponent(normalized));
        if (!resp.ok) throw new Error('API ' + resp.status);
        const json = await resp.json();
        const formatted = _formatEntry(json[0], wordStr, level);
        // Cache for future use (fire and forget)
        chrome.storage.local.set({ [cacheKey]: formatted }).catch(() => {});
        return formatted;
    } catch (_) {
        return _makeFallback(wordStr, level);
    }
}

// ── Format API response into our word card shape ────────
function _formatEntry(entry, wordStr, level) {
    const firstMeaning = entry.meanings?.[0];
    const firstDef = firstMeaning?.definitions?.[0];
    const phonetic = entry.phonetics?.find(p => p.text)?.text || entry.phonetic || '';

    const synonyms = new Set();
    const antonyms = new Set();
    (entry.meanings || []).forEach(m => {
        (m.synonyms || []).forEach(s => synonyms.add(s));
        (m.antonyms || []).forEach(a => antonyms.add(a));
        (m.definitions || []).forEach(d => {
            (d.synonyms || []).forEach(s => synonyms.add(s));
            (d.antonyms || []).forEach(a => antonyms.add(a));
        });
    });

    // Additional meanings become homonyms
    const homonyms = [];
    (entry.meanings || []).slice(1).forEach(m => {
        const def = m.definitions?.[0];
        if (def) {
            homonyms.push({
                meaning: '(' + m.partOfSpeech + ') ' + def.definition,
                usage: def.example || ''
            });
        }
    });

    // Collect the best example from any definition
    let usage = '';
    for (const m of (entry.meanings || [])) {
        for (const d of (m.definitions || [])) {
            if (d.example) { usage = d.example; break; }
        }
        if (usage) break;
    }

    // Generate a usage sentence if API provides none
    const word = (entry.word || wordStr);
    const definition = firstDef?.definition || '';
    if (!usage && definition) {
        usage = _generateUsage(word, firstMeaning?.partOfSpeech || '', definition);
    }

    // Etymology: use API origin field, or derive from source
    let etymology = entry.origin || '';
    if (!etymology) {
        etymology = _deriveEtymology(word);
    }

    return {
        id: wordStr.toLowerCase(),
        word: word.charAt(0).toUpperCase() + word.slice(1),
        pronunciation: phonetic,
        partOfSpeech: firstMeaning?.partOfSpeech || '',
        etymology: etymology,
        meaning: definition,
        usage: usage,
        synonyms: [...synonyms].slice(0, 5),
        antonyms: [...antonyms].slice(0, 5),
        mnemonic: '',
        level: level || 'simple',
        homonyms: homonyms.length > 0 ? homonyms : undefined
    };
}

// ── Generate a usage sentence from definition ───────────
function _generateUsage(word, pos, definition) {
    const w = word.toLowerCase();
    switch (pos) {
        case 'adjective':
            return `The report contained only the most ${w} details.`;
        case 'verb':
            return `She decided to ${w} before making a final judgment.`;
        case 'adverb':
            return `He spoke ${w} about the challenges ahead.`;
        case 'noun':
        default:
            return `Understanding ${w} is essential in this context.`;
    }
}

// ── Common Latin/Greek root hints ───────────────────────
const _ETYMOLOGY_ROOTS = {
    'circum':'Latin circum- (around)',
    'contra':'Latin contra- (against)',
    'counter':'Old French contre- (against)',
    'extra': 'Latin extra- (beyond)',
    'fore':  'Old English fore- (before, in front)',
    'hyper': 'Greek hyper (over, above)',
    'hypo':  'Greek hypo (under)',
    'infra': 'Latin infra- (below)',
    'inter': 'Latin inter- (between)',
    'intra': 'Latin intra- (within)',
    'macro': 'Greek makros (large)',
    'micro': 'Greek mikros (small)',
    'multi': 'Latin multus (many)',
    'over':  'Old English ofer- (above, beyond)',
    'para':  'Greek para- (beside, beyond)',
    'peri':  'Greek peri- (around)',
    'poly':  'Greek polys (many)',
    'pseudo':'Greek pseudein (to deceive)',
    'retro': 'Latin retro- (backward)',
    'semi':  'Latin semi- (half)',
    'super': 'Latin super- (above)',
    'supra': 'Latin supra- (above)',
    'trans': 'Latin trans- (across)',
    'ultra': 'Latin ultra- (beyond)',
    'under': 'Old English under- (beneath)',
    'ante':  'Latin ante- (before)',
    'anti':  'Greek anti- (against)',
    'auto':  'Greek auto- (self)',
    'bene':  'Latin bene- (well, good)',
    'bio':   'Greek bios (life)',
    'chrono':'Greek chronos (time)',
    'mono':  'Greek monos (alone)',
    'neo':   'Greek neos (new)',
    'omni':  'Latin omnis (all)',
    'pan':   'Greek pan- (all)',
    'phil':  'Greek philos (loving)',
    'tele':  'Greek tele (far)',
    'theo':  'Greek theos (god)',
    'geo':   'Greek ge (earth)',
    'graph': 'Greek graphein (to write)',
    'con':   'Latin con- (together, with)',
    'com':   'Latin com- (together, with)',
    'col':   'Latin col- (together, with)',
    'cor':   'Latin cor- (together, with)',
    'dis':   'Latin dis- (apart, not)',
    'dif':   'Latin dif- (apart, not)',
    'mis':   'Latin/Old English mis- (wrong)',
    'mal':   'Latin mal- (bad)',
    'non':   'Latin non- (not)',
    'per':   'Latin per- (through, thoroughly)',
    'post':  'Latin post- (after)',
    'pre':   'Latin prae- (before)',
    'pro':   'Latin/Greek pro- (forward, for)',
    'sub':   'Latin sub- (under)',
    'suc':   'Latin suc- (under, variant of sub-)',
    'sup':   'Latin sup- (under, variant of sub-)',
    'sur':   'Old French sur- (over, above)',
    'sus':   'Latin sus- (under, variant of sub-)',
    'ad':    'Latin ad- (toward)',
    'ac':    'Latin ac- (toward, variant of ad-)',
    'af':    'Latin af- (toward, variant of ad-)',
    'ag':    'Latin ag- (toward, variant of ad-)',
    'al':    'Latin al- (toward, variant of ad-)',
    'ap':    'Latin ap- (toward, variant of ad-)',
    'at':    'Latin at- (toward, variant of ad-)',
    'ab':    'Latin ab- (away from)',
    'de':    'Latin de- (down, from)',
    'ex':    'Latin ex- (out of)',
    'ef':    'Latin ef- (out, variant of ex-)',
    'ob':    'Latin ob- (against, toward)',
    'oc':    'Latin oc- (against, variant of ob-)',
    'op':    'Latin op- (against, variant of ob-)',
    'in':    'Latin in- (in, into, or not)',
    'im':    'Latin im- (in/not, variant of in-)',
    'il':    'Latin il- (in/not, variant of in-)',
    'ir':    'Latin ir- (not, variant of in-)',
    'en':    'Old French en- (to put into)',
    'em':    'Old French em- (to put into)',
    're':    'Latin re- (again, back)',
    'se':    'Latin se- (apart, away)',
    'un':    'Old English un- (not, reversal)',
};

// Suffix → etymology hint (checked in order, first match wins)
const _ETYMOLOGY_SUFFIXES = [
    ['ology',  'Greek -logia (study of)'],
    ['tion',   'Latin -tio (act or state of)'],
    ['sion',   'Latin -sio (act or state of)'],
    ['ment',   'Latin -mentum (result or means of)'],
    ['ious',   'Latin -iosus (full of)'],
    ['eous',   'Latin -eus (having the nature of)'],
    ['ous',    'Latin -osus (full of)'],
    ['able',   'Latin -abilis (capable of)'],
    ['ible',   'Latin -ibilis (capable of)'],
    ['ity',    'Latin -itas (quality or state)'],
    ['ety',    'Latin -itas (quality or state)'],
    ['ence',   'Latin -entia (state or quality)'],
    ['ance',   'Latin -antia (state or quality)'],
    ['ency',   'Latin -entia (state or tendency)'],
    ['ancy',   'Latin -antia (state or tendency)'],
    ['ive',    'Latin -ivus (having the nature of)'],
    ['ative',  'Latin -ativus (tending to)'],
    ['ure',    'Latin -ura (act or process)'],
    ['ate',    'Latin -atus (having, provided with)'],
    ['fy',     'Latin -ficare (to make)'],
    ['ize',    'Greek -izein (to make or do)'],
    ['ise',    'Greek -izein (to make or do)'],
    ['ism',    'Greek -ismos (doctrine or practice)'],
    ['ist',    'Greek -istes (one who)'],
    ['al',     'Latin -alis (relating to)'],
    ['ial',    'Latin -ialis (relating to)'],
    ['ar',     'Latin -aris (relating to)'],
    ['or',     'Latin -or (one who, state of)'],
    ['er',     'Old English -ere (one who)'],
    ['ant',    'Latin -ans/-antis (performing)'],
    ['ent',    'Latin -ens/-entis (performing)'],
    ['ful',    'Old English -full (full of)'],
    ['less',   'Old English -leas (without)'],
    ['ness',   'Old English -nes (state or quality)'],
    ['dom',    'Old English -dom (state, realm)'],
    ['ship',   'Old English -scipe (state, office)'],
    ['ward',   'Old English -weard (in the direction of)'],
    ['ly',     'Old English -lic (having the quality of)'],
    ['ous',    'Latin -osus (full of, abounding in)'],
    ['ic',     'Latin/Greek -icus (pertaining to)'],
    ['ical',   'Latin/Greek -icalis (pertaining to)'],
];

function _deriveEtymology(word) {
    const w = word.toLowerCase();
    // Check prefix matches (longest first)
    const prefixes = Object.keys(_ETYMOLOGY_ROOTS).sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
        if (w.startsWith(prefix) && w.length > prefix.length + 2) {
            return `From ${_ETYMOLOGY_ROOTS[prefix]}`;
        }
    }
    // Check suffix matches (longest first — already ordered)
    for (const [suffix, hint] of _ETYMOLOGY_SUFFIXES) {
        if (w.endsWith(suffix) && w.length > suffix.length + 2) {
            return `From ${hint}`;
        }
    }
    // Fallback: infer from word characteristics
    if (/[aeiou]{2}/.test(w) || w.endsWith('ght') || w.endsWith('wn') || w.endsWith('ld'))
        return 'Likely of Germanic/Old English origin';
    return 'Likely of Latin or French origin via Middle English';
}

// ── Fallback when API is unavailable ────────────────────
function _makeFallback(wordStr, level) {
    const capitalized = wordStr.charAt(0).toUpperCase() + wordStr.slice(1).toLowerCase();
    return {
        id: wordStr.toLowerCase(),
        word: capitalized,
        pronunciation: '',
        partOfSpeech: '',
        etymology: '',
        meaning: 'Definition could not be loaded. Check your internet connection.',
        usage: '',
        synonyms: [],
        antonyms: [],
        mnemonic: '',
        level: level || 'simple',
        homonyms: undefined
    };
}
