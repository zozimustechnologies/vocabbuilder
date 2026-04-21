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
            return { ...cached[cacheKey], level: level || cached[cacheKey].level };
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

    return {
        id: wordStr.toLowerCase(),
        word: (entry.word || wordStr).charAt(0).toUpperCase() + (entry.word || wordStr).slice(1),
        pronunciation: phonetic,
        partOfSpeech: firstMeaning?.partOfSpeech || '',
        etymology: '',
        meaning: firstDef?.definition || '',
        usage: firstDef?.example || '',
        synonyms: [...synonyms].slice(0, 5),
        antonyms: [...antonyms].slice(0, 5),
        mnemonic: '',
        level: level || 'simple',
        homonyms: homonyms.length > 0 ? homonyms : undefined
    };
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
