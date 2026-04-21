/**
 * Validation test: ensures every word in the word lists returns
 * complete data from the Dictionary API (no empty critical fields).
 *
 * Usage:  node tests/validate-words.js [--level simple] [--sample 20]
 *
 * Checks: meaning, usage, etymology, pronunciation, partOfSpeech
 * Reports any words with missing fields so they can be fixed.
 */

const REQUIRED_FIELDS = ['meaning', 'usage', 'etymology', 'partOfSpeech'];
const SOFT_FIELDS = ['pronunciation']; // warn but don't fail
const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
const DELAY_MS = 350; // rate-limit courtesy

// ── Parse CLI args ──────────────────────────────────────
const args = process.argv.slice(2);
function getArg(name) {
    const idx = args.indexOf('--' + name);
    return idx >= 0 && args[idx + 1] ? args[idx + 1] : null;
}

const targetLevel = getArg('level');
const sampleSize = parseInt(getArg('sample') || '0', 10);

// ── Load word lists ─────────────────────────────────────
// Inline-require the data files (they set globals)
const vm = require('vm');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
function loadGlobal(file) {
    const code = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInThisContext(code, { filename: file });
}

loadGlobal('data/words.js');
loadGlobal('data/wordlist.js');
loadGlobal('data/dictionary-api.js');

// ── Polyfill chrome.storage for Node ────────────────────
globalThis.chrome = { storage: { local: { get: async () => ({}), set: async () => {} } } };

// ── Test runner ─────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function validateWord(wordStr, level) {
    try {
        const data = await fetchWordData(wordStr, level);
        const missing = REQUIRED_FIELDS.filter(f => !data[f] || data[f].trim() === '');
        const softMissing = SOFT_FIELDS.filter(f => !data[f] || data[f].trim() === '');
        return { word: wordStr, level, ok: missing.length === 0, missing, softMissing, data };
    } catch (e) {
        return { word: wordStr, level, ok: false, missing: ['FETCH_ERROR'], softMissing: [], error: e.message };
    }
}

async function run() {
    const levels = targetLevel ? [targetLevel] : ['simple', 'medium', 'complex', 'competitive'];
    const results = { pass: 0, fail: 0, warnings: 0, failures: [] };

    for (const level of levels) {
        let words = (typeof WORD_LISTS !== 'undefined' && WORD_LISTS[level]) || [];
        if (sampleSize > 0 && sampleSize < words.length) {
            // Random sample
            const shuffled = [...words].sort(() => Math.random() - 0.5);
            words = shuffled.slice(0, sampleSize);
        }

        console.log(`\n── ${level.toUpperCase()} (${words.length} words) ──`);

        for (let i = 0; i < words.length; i++) {
            const w = words[i];
            const result = await validateWord(w, level);
            if (result.ok) {
                results.pass++;
                if (result.softMissing.length) {
                    results.warnings++;
                    console.log(`  ⚠ ${w}: soft missing [${result.softMissing.join(', ')}]`);
                }
            } else {
                results.fail++;
                results.failures.push(result);
                console.log(`  ✗ ${w}: missing [${result.missing.join(', ')}]`);
            }

            // Progress indicator every 50 words
            if ((i + 1) % 50 === 0) {
                console.log(`  ... checked ${i + 1}/${words.length}`);
            }

            await sleep(DELAY_MS);
        }
    }

    // ── Summary ─────────────────────────────────────────
    console.log('\n══════════════════════════════════════');
    console.log(`  PASS: ${results.pass}   FAIL: ${results.fail}   WARN: ${results.warnings}`);
    console.log('══════════════════════════════════════');

    if (results.failures.length > 0) {
        console.log('\nFailed words:');
        for (const f of results.failures) {
            console.log(`  ${f.level}/${f.word} → missing: ${f.missing.join(', ')}`);
        }
        process.exit(1);
    } else {
        console.log('\nAll words have complete data ✓');
        process.exit(0);
    }
}

run().catch(e => { console.error('Fatal:', e); process.exit(2); });
