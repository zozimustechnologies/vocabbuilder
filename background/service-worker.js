// ── Background Service Worker ────────────────────────────
// Opens the side panel on action click, handles alarms
// for daily reminders, badge updates, and init state.

const DEFAULT_STATE = {
    onboardingComplete: false,
    currentLevel: 'simple',
    dailyGoal: 3,
    remembered: [],
    recycled: [],
    shownWordIds: [],
    streak: { current: 0, longest: 0, lastActiveDate: '' },
    todayStats: { date: '', wordsShown: 0, wordsRemembered: 0, wordsRecycled: 0 },
    badges: { monthly: {}, streaks: {}, lifetime: {} }
};

// ── Side Panel: open on action click ────────────────────
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => { /* older Edge versions may not support this */ });

// ── Install / Update ────────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
    const stored = await chrome.storage.local.get('vocabState');
    if (!stored.vocabState) {
        await chrome.storage.local.set({ vocabState: DEFAULT_STATE });
    } else {
        // Migrate existing installs
        const s = stored.vocabState;
        let changed = false;
        if (s.badges === undefined) { s.badges = { monthly: {}, streaks: {}, lifetime: {} }; changed = true; }
        if (s.onboardingComplete === undefined) { s.onboardingComplete = true; changed = true; }
        if (changed) { await chrome.storage.local.set({ vocabState: s }); }
    }

    chrome.alarms.create('dailyReminder', { periodInMinutes: 60 * 12 });
    chrome.alarms.create('streakCheck', { periodInMinutes: 60 * 24 });
});

// ── Alarm Handlers ──────────────────────────────────────
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'dailyReminder') {
        const { vocabState } = await chrome.storage.local.get('vocabState');
        if (!vocabState) { return; }
        const today = new Date().toISOString().split('T')[0];
        const todayTotal = vocabState.todayStats.date === today
            ? vocabState.todayStats.wordsRemembered + vocabState.todayStats.wordsRecycled
            : 0;
        if (todayTotal === 0) {
            chrome.notifications.create('dailyReminder', {
                type: 'basic', iconUrl: 'icons/icon-128.png',
                title: 'Vocabulary Builder',
                message: 'Your word of the day is ready! 📖 Click to learn a new word.'
            });
        }
    }

    if (alarm.name === 'streakCheck') {
        const { vocabState } = await chrome.storage.local.get('vocabState');
        if (!vocabState || !vocabState.streak.lastActiveDate) { return; }
        const today = new Date().toISOString().split('T')[0];
        const diff = Math.floor((new Date(today) - new Date(vocabState.streak.lastActiveDate)) / 86400000);
        if (diff === 1 && vocabState.streak.current > 5) {
            chrome.notifications.create('streakWarning', {
                type: 'basic', iconUrl: 'icons/icon-128.png',
                title: 'Vocabulary Builder',
                message: `Don't lose your ${vocabState.streak.current}-day streak! Just 1 word to keep it alive. 🔥`
            });
        }
    }
});

// ── Notification Click ──────────────────────────────────
chrome.notifications.onClicked.addListener(() => {
    chrome.sidePanel.open({ windowId: undefined }).catch(() => {});
});

// ── Badge Update ────────────────────────────────────────
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.vocabState) {
        const st = changes.vocabState.newValue;
        if (st && st.streak.current > 0) {
            chrome.action.setBadgeText({ text: `${st.streak.current}` });
            chrome.action.setBadgeBackgroundColor({ color: '#da3633' });
        } else {
            chrome.action.setBadgeText({ text: '' });
        }
    }
});
