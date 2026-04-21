// ── Badge Definitions ────────────────────────────────────

const MONTHLY_TARGETS = {
    '01': { target: 45, name: 'January Journeyman' },
    '02': { target: 40, name: 'February Phrasecraft' },
    '03': { target: 50, name: 'March Wordsmith' },
    '04': { target: 50, name: 'April Articulator' },
    '05': { target: 60, name: 'May Maverick' },
    '06': { target: 55, name: 'June Juggernaut' },
    '07': { target: 50, name: 'July Lexicon' },
    '08': { target: 55, name: 'August Ace' },
    '09': { target: 60, name: 'September Scholar' },
    '10': { target: 55, name: 'October Orator' },
    '11': { target: 50, name: 'November Narrator' },
    '12': { target: 45, name: 'December Diplomat' }
};

const STREAK_BADGES = [
    { days: 3,    name: 'Spark Starter',      icon: '⚡', desc: '3-day streak' },
    { days: 7,    name: 'Week Warrior',        icon: '🗡️', desc: '7-day streak' },
    { days: 15,   name: 'Fortnight Force',     icon: '🛡️', desc: '15-day streak' },
    { days: 30,   name: 'Monthly Maestro',     icon: '🎯', desc: '30-day streak' },
    { days: 90,   name: 'Quarter Conqueror',   icon: '🏔️', desc: '90-day streak' },
    { days: 180,  name: 'Half-Year Hero',      icon: '🦅', desc: '180-day streak' },
    { days: 365,  name: 'Annual Ace',          icon: '👑', desc: '1-year streak' },
    { days: 730,  name: 'Biennial Baron',      icon: '💎', desc: '2-year streak' },
    { days: 1095, name: 'Triennial Titan',     icon: '🏆', desc: '3-year streak' }
];

const LIFETIME_BADGES = [
    { count: 50,    name: 'First Fifty',          icon: '🎯', desc: 'Learn 50 words' },
    { count: 100,   name: 'Word Seedling',       icon: '🌱', desc: 'Learn 100 words' },
    { count: 200,   name: 'Vocabulary Sprout',    icon: '🌿', desc: 'Learn 200 words' },
    { count: 300,   name: 'Lexicon Explorer',     icon: '🧭', desc: 'Learn 300 words' },
    { count: 500,   name: 'Word Warrior',         icon: '⚔️', desc: 'Learn 500 words' },
    { count: 900,   name: 'Syntax Sage',          icon: '📜', desc: 'Learn 900 words' },
    { count: 1200,  name: 'Diction Duke',         icon: '🏰', desc: 'Learn 1,200 words' },
    { count: 1500,  name: 'Eloquence Knight',     icon: '🗡️', desc: 'Learn 1,500 words' },
    { count: 2000,  name: 'Language Luminary',     icon: '✨', desc: 'Learn 2,000 words' },
    { count: 2500,  name: 'Rhetoric Monarch',     icon: '👑', desc: 'Learn 2,500 words' },
    { count: 3000,  name: 'Polyglot Phoenix',     icon: '🔥', desc: 'Learn 3,000 words' },
    { count: 4000,  name: 'Verbosity Virtuoso',   icon: '🎻', desc: 'Learn 4,000 words' },
    { count: 5000,  name: 'Lexicon Legend',        icon: '🐉', desc: 'Learn 5,000 words' },
    { count: 10000, name: 'Word Wizard Supreme',   icon: '🧙', desc: 'Learn 10,000 words' }
];

/**
 * Check and award any newly earned badges.
 * Mutates state.badges in-place. Returns array of newly earned badge descriptions.
 */
function checkBadges(state) {
    const today = new Date().toISOString().split('T')[0];
    const newlyEarned = [];

    // ── Monthly badges ──────────────────────────────────
    // Count words remembered this month
    const yearMonth = today.slice(0, 7);     // "2026-04"
    const monthKey = today.slice(5, 7);      // "04"
    const monthDef = MONTHLY_TARGETS[monthKey];
    if (monthDef && !state.badges.monthly[yearMonth]?.achieved) {
        const monthWords = state.remembered.filter(r => r.rememberedDate && r.rememberedDate.startsWith(yearMonth)).length;
        if (monthWords >= monthDef.target) {
            if (!state.badges.monthly[yearMonth]) { state.badges.monthly[yearMonth] = {}; }
            state.badges.monthly[yearMonth].achieved = true;
            state.badges.monthly[yearMonth].achievedDate = today;
            state.badges.monthly[yearMonth].count = monthWords;
            newlyEarned.push({ type: 'monthly', name: monthDef.name, desc: `${monthWords}/${monthDef.target} words in ${yearMonth}` });
        }
    }

    // ── Streak badges ───────────────────────────────────
    for (const badge of STREAK_BADGES) {
        const key = String(badge.days);
        if (!state.badges.streaks[key]?.achieved && state.streak.current >= badge.days) {
            state.badges.streaks[key] = { achieved: true, achievedDate: today };
            newlyEarned.push({ type: 'streak', name: badge.name, desc: badge.desc });
        }
    }

    // ── Lifetime badges ─────────────────────────────────
    const totalRemembered = state.remembered.length;
    for (const badge of LIFETIME_BADGES) {
        const key = String(badge.count);
        if (!state.badges.lifetime[key]?.achieved && totalRemembered >= badge.count) {
            state.badges.lifetime[key] = { achieved: true, achievedDate: today };
            newlyEarned.push({ type: 'lifetime', name: badge.name, desc: badge.desc });
        }
    }

    return newlyEarned;
}
