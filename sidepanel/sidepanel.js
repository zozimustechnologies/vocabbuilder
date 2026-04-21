(function () {
    'use strict';

    // ── Constants ────────────────────────────────────────
    const SPACED_INTERVALS = [1, 3, 7, 14, 30];
    const MOTIVATIONAL_QUOTES = [
        '"The limits of my language mean the limits of my world." — Wittgenstein',
        '"One word at a time — that\'s how vocabularies are built."',
        '"A word after a word after a word is power." — Margaret Atwood',
        '"You\'re building a vocabulary that impresses."',
        '"Language is the dress of thought." — Samuel Johnson',
        '"Every expert was once a beginner."',
        '"Small daily improvements lead to stunning results."'
    ];
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    // TODO: Replace with actual store URLs once published
    const EXTENSION_STORE_URL = 'https://microsoftedge.microsoft.com/addons/detail/vocabulary-builder/PLACEHOLDER';

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

    // ── App State ───────────────────────────────────────
    let state = null;
    let currentView = 'word';
    let reviewingWord = null;
    let searchQuery = '';
    let badgeToastTimeout = null;

    // ── DOM References ──────────────────────────────────
    const contentEl = document.getElementById('content');
    const navBar = document.getElementById('nav-bar');
    const streakCountEl = document.getElementById('streak-count');
    const headerEl = document.getElementById('app-header');
    const footerEl = document.getElementById('app-footer');
    const settingsCog = document.getElementById('settings-cog');

    // ── Init ────────────────────────────────────────────
    loadState().then(() => {
        if (!state.onboardingComplete) {
            renderOnboarding();
        } else {
            showAppChrome();
            render();
        }
    });

    // ── Storage ─────────────────────────────────────────
    async function loadState() {
        const result = await chrome.storage.local.get('vocabState');
        state = result.vocabState || { ...DEFAULT_STATE };
        // Ensure badges structure exists
        if (!state.badges) { state.badges = { monthly: {}, streaks: {}, lifetime: {} }; }
        if (!state.badges.monthly) { state.badges.monthly = {}; }
        if (!state.badges.streaks) { state.badges.streaks = {}; }
        if (!state.badges.lifetime) { state.badges.lifetime = {}; }
        migrateWordIds();
        ensureTodayStats();
        updateStreak();
    }

    // Migrate old-format IDs ('simple-01') to word strings ('candid')
    function migrateWordIds() {
        if (state._wordIdsMigrated) { return; }
        const idToWord = {};
        if (typeof WORDS !== 'undefined') {
            WORDS.forEach(w => { idToWord[w.id] = w.word.toLowerCase(); });
        }
        const migrate = id => idToWord[id] || id;
        state.remembered = state.remembered.map(r => ({ ...r, wordId: migrate(r.wordId) }));
        state.recycled = state.recycled.map(r => ({ ...r, wordId: migrate(r.wordId) }));
        state.shownWordIds = state.shownWordIds.map(migrate);
        state._wordIdsMigrated = true;
    }

    async function saveState() {
        await chrome.storage.local.set({ vocabState: state });
    }

    function getToday() { return new Date().toISOString().split('T')[0]; }

    function ensureTodayStats() {
        const today = getToday();
        if (state.todayStats.date !== today) {
            state.todayStats = { date: today, wordsShown: 0, wordsRemembered: 0, wordsRecycled: 0 };
        }
    }

    function updateStreak() {
        const today = getToday();
        const last = state.streak.lastActiveDate;
        if (!last) { return; }
        if (daysBetween(last, today) > 1) { state.streak.current = 0; }
    }

    function markActive() {
        const today = getToday();
        if (state.streak.lastActiveDate === today) { return; }
        const diff = state.streak.lastActiveDate ? daysBetween(state.streak.lastActiveDate, today) : -1;
        state.streak.current = (diff === 1) ? state.streak.current + 1 : 1;
        if (state.streak.current > state.streak.longest) { state.streak.longest = state.streak.current; }
        state.streak.lastActiveDate = today;
    }

    function daysBetween(a, b) {
        return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
    }

    function calcNextDate(from, attempts) {
        const days = SPACED_INTERVALS[Math.min(attempts - 1, SPACED_INTERVALS.length - 1)];
        const d = new Date(from);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    }

    // ── Word Selection (async — uses WORD_LISTS + API) ────
    async function getCurrentWord() {
        const today = getToday();
        const level = state.currentLevel;

        // 1. Recycled words due today
        const due = state.recycled.filter(r => r.nextShowDate <= today);
        if (due.length > 0) {
            return await fetchWordData(due[0].wordId, level);
        }

        // 2. New word from word list for current level
        const usedIds = new Set([
            ...state.remembered.map(r => r.wordId),
            ...state.recycled.map(r => r.wordId)
        ]);
        const wordList = (typeof WORD_LISTS !== 'undefined' && WORD_LISTS[level]) || [];
        const available = wordList.filter(w => !usedIds.has(w.toLowerCase()));
        if (available.length > 0) {
            const todayNum = parseInt(today.replace(/-/g, ''), 10);
            const pick = available[(todayNum + state.todayStats.wordsShown) % available.length];
            return await fetchWordData(pick, level);
        }

        // 3. Next-soonest recycled word
        if (state.recycled.length > 0) {
            const sorted = [...state.recycled].sort((a, b) => a.nextShowDate.localeCompare(b.nextShowDate));
            return await fetchWordData(sorted[0].wordId, level);
        }

        return null;
    }

    // ── Actions ─────────────────────────────────────────
    async function gotIt(wordId) {
        ensureTodayStats();
        markActive();
        state.recycled = state.recycled.filter(r => r.wordId !== wordId);
        if (!state.remembered.find(r => r.wordId === wordId)) {
            state.remembered.push({ wordId, rememberedDate: getToday() });
        }
        if (!state.shownWordIds.includes(wordId)) { state.shownWordIds.push(wordId); }
        state.todayStats.wordsRemembered += 1;
        state.todayStats.wordsShown += 1;
        const newBadges = checkBadges(state);
        await saveState();
        reviewingWord = null;
        render();
        if (newBadges.length) { showBadgeToast(newBadges[0]); }
    }

    async function notYet(wordId) {
        ensureTodayStats();
        markActive();
        const today = getToday();
        const existing = state.recycled.find(r => r.wordId === wordId);
        if (existing) {
            existing.attempts += 1;
            existing.lastAttemptDate = today;
            existing.nextShowDate = calcNextDate(today, existing.attempts);
        } else {
            state.recycled.push({ wordId, nextShowDate: calcNextDate(today, 1), attempts: 1, lastAttemptDate: today });
        }
        if (!state.shownWordIds.includes(wordId)) { state.shownWordIds.push(wordId); }
        state.todayStats.wordsRecycled += 1;
        state.todayStats.wordsShown += 1;
        checkBadges(state);
        await saveState();
        reviewingWord = null;
        render();
    }

    async function changeLevel(level) { state.currentLevel = level; await saveState(); render(); }
    async function changeDailyGoal(goal) { state.dailyGoal = goal; await saveState(); render(); }

    async function resetProgress() {
        if (!confirm('Reset all progress? This cannot be undone.')) { return; }
        state = { ...DEFAULT_STATE, onboardingComplete: true, todayStats: { ...DEFAULT_STATE.todayStats, date: getToday() }, badges: { monthly: {}, streaks: {}, lifetime: {} } };
        await saveState();
        render();
    }

    // ── Badge Toast (Celebratory Modal) ───────────────
    function showBadgeToast(badge) {
        const existing = document.querySelector('.badge-toast');
        if (existing) { existing.remove(); }
        const overlay = document.querySelector('.badge-toast-overlay');
        if (overlay) { overlay.remove(); }
        if (badgeToastTimeout) { clearTimeout(badgeToastTimeout); }

        const bg = document.createElement('div');
        bg.className = 'badge-toast-overlay';
        document.body.appendChild(bg);

        const toast = document.createElement('div');
        toast.className = 'badge-toast';
        const shareText = `🏆 I just earned the "${badge.name}" badge on Vocabulary Builder! ${badge.desc}\n\nBuild your vocabulary too:\n${EXTENSION_STORE_URL}`;
        toast.innerHTML = `
            <div class="toast-confetti">🎉</div>
            <div class="toast-icon">🏅</div>
            <div class="toast-title">Badge Unlocked!</div>
            <div class="toast-badge-name">${esc(badge.name)}</div>
            <div class="toast-desc">${esc(badge.desc)}</div>
            <div class="toast-share-section">
                <div class="toast-share-label">Brag about this badge</div>
                <div class="toast-share-btns">
                    <button class="social-btn social-linkedin" data-action="shareBadge" data-platform="linkedin" data-text="${esc(shareText)}" title="LinkedIn">in</button>
                    <button class="social-btn social-facebook" data-action="shareBadge" data-platform="facebook" data-text="${esc(shareText)}" title="Facebook">f</button>
                    <button class="social-btn social-whatsapp" data-action="shareBadge" data-platform="whatsapp" data-text="${esc(shareText)}" title="WhatsApp">w</button>
                    <button class="social-btn social-x" data-action="shareBadge" data-platform="x" data-text="${esc(shareText)}" title="X (Twitter)">𝕏</button>
                    <button class="social-btn social-copy" data-action="shareBadge" data-platform="copy" data-text="${esc(shareText)}" title="Copy text">📋</button>
                </div>
            </div>
            <button class="toast-dismiss">Awesome!</button>`;
        document.body.appendChild(toast);

        const dismiss = () => { toast.remove(); bg.remove(); };
        toast.querySelector('.toast-dismiss').addEventListener('click', dismiss);
        bg.addEventListener('click', dismiss);
    }

    // ── Stats Computation ───────────────────────────────
    function computeStats() {
        const levels = ['simple', 'medium', 'complex', 'competitive'];
        const retentionByLevel = levels.map(level => {
            const rem = state.remembered.filter(r => findWordLevel(r.wordId) === level).length;
            const rec = state.recycled.filter(r => findWordLevel(r.wordId) === level).length;
            const total = rem + rec;
            return { level, remembered: rem, total, percentage: total > 0 ? Math.round((rem / total) * 100) : 0 };
        });
        const totalR = state.remembered.length, totalC = state.recycled.length, totalAll = totalR + totalC;
        return {
            totalRemembered: totalR, totalRecycled: totalC,
            totalShown: state.shownWordIds.length, retentionByLevel,
            overallRetention: totalAll > 0 ? Math.round((totalR / totalAll) * 100) : 0
        };
    }

    // ── Events ──────────────────────────────────────────
    document.addEventListener('click', (e) => {
        // Close badge detail
        if (e.target.classList.contains('badge-overlay') || e.target.classList.contains('bd-close')) {
            document.querySelector('.badge-overlay')?.remove();
            document.querySelector('.badge-detail')?.remove();
            return;
        }

        const target = e.target.closest('[data-action]');
        if (!target) { return; }
        const action = target.dataset.action;
        const value = target.dataset.value;

        switch (action) {
            case 'gotIt': gotIt(value); break;
            case 'notYet': notYet(value); break;
            case 'reviewWord': { reviewWordById(value); break; }
            case 'back': reviewingWord = null; render(); break;
            case 'toggleHomonyms': { const list = document.getElementById('homonym-list'); if (list) { list.style.display = list.style.display === 'none' ? 'block' : 'none'; } break; }
            case 'changeLevel': changeLevel(value); break;
            case 'changeDailyGoal': changeDailyGoal(parseInt(value, 10)); break;
            case 'resetProgress': resetProgress(); break;
            case 'selectOnboardLevel': completeOnboarding(value); break;
            case 'showBadgeDetail': showBadgeDetail(value, target.dataset.badgetype); break;
            case 'shareWord': shareWord(value); break;
            case 'shareBadge': shareBadge(target.dataset.platform, target.dataset.text); break;
        }
    });

    navBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-btn');
        if (!btn) { return; }
        currentView = btn.dataset.view;
        reviewingWord = null;
        searchQuery = '';
        render();
    });

    settingsCog.addEventListener('click', () => {
        currentView = 'settings';
        reviewingWord = null;
        searchQuery = '';
        render();
    });

    document.addEventListener('input', (e) => {
        if (e.target && e.target.classList.contains('search-box')) {
            searchQuery = e.target.value.toLowerCase();
            renderContent();
        }
    });

    // ── Onboarding ──────────────────────────────────────
    function renderOnboarding() {
        headerEl.style.display = 'none';
        footerEl.style.display = 'none';
        contentEl.innerHTML = `
        <div class="onboarding">
            <div class="ob-icon">📖</div>
            <h1>Welcome to Vocab Builder!</h1>
            <p class="ob-subtitle">Pick your starting level. Words will be tailored to your choice.</p>
            <div class="ob-levels">
                <button class="ob-level-btn" data-action="selectOnboardLevel" data-value="simple">
                    <span class="ob-lvl-icon">🌱</span>
                    <div class="ob-lvl-info">
                        <div class="ob-lvl-title">Simple</div>
                        <div class="ob-lvl-desc">Everyday vocabulary — candid, keen, serene</div>
                    </div>
                </button>
                <button class="ob-level-btn" data-action="selectOnboardLevel" data-value="medium">
                    <span class="ob-lvl-icon">📚</span>
                    <div class="ob-lvl-info">
                        <div class="ob-lvl-title">Medium</div>
                        <div class="ob-lvl-desc">Academic & professional — pragmatic, eloquent, cogent</div>
                    </div>
                </button>
                <button class="ob-level-btn" data-action="selectOnboardLevel" data-value="complex">
                    <span class="ob-lvl-icon">🧠</span>
                    <div class="ob-lvl-info">
                        <div class="ob-lvl-title">Complex</div>
                        <div class="ob-lvl-desc">Literary & nuanced — perspicacious, sanguine, ameliorate</div>
                    </div>
                </button>
                <button class="ob-level-btn" data-action="selectOnboardLevel" data-value="competitive">
                    <span class="ob-lvl-icon">🏆</span>
                    <div class="ob-lvl-info">
                        <div class="ob-lvl-title">Competitive</div>
                        <div class="ob-lvl-desc">GMAT, GRE, LSAT grade — loquacious, recondite, pusillanimous</div>
                    </div>
                </button>
            </div>
            <p class="ob-hint">You can change this anytime in Settings ⚙️</p>
        </div>`;
    }

    async function completeOnboarding(level) {
        state.currentLevel = level;
        state.onboardingComplete = true;
        await saveState();
        showAppChrome();
        render();
    }

    function showAppChrome() {
        headerEl.style.display = '';
        footerEl.style.display = '';
    }

    // ── Render ──────────────────────────────────────────
    function render() {
        if (!state) { return; }
        navBar.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === currentView);
        });
        streakCountEl.textContent = state.streak.current;
        renderContent();
    }

    async function renderContent() {
        if (!contentEl || !state) { return; }
        switch (currentView) {
            case 'word': await renderWordView(); break;
            case 'remembered': renderListView('remembered'); break;
            case 'recycled': renderListView('recycled'); break;
            case 'badges': renderBadgesView(); break;
            case 'stats': renderStatsView(); break;
            case 'settings': renderSettingsView(); break;
        }
    }

    // ── Word View ───────────────────────────────────────
    async function renderWordView() {
        const word = reviewingWord || await getCurrentWord();
        if (!word) {
            contentEl.innerHTML = `<div class="empty-state"><div class="empty-icon">🎓</div><h2>All caught up!</h2><p>You've seen all words at the <strong>${esc(state.currentLevel)}</strong> level.</p><p>Try a harder level or come back tomorrow!</p></div>`;
            return;
        }
        const isReview = !!reviewingWord;
        const todayTotal = state.todayStats.wordsRemembered + state.todayStats.wordsRecycled;
        const goalMet = !isReview && todayTotal >= state.dailyGoal && state.dailyGoal > 0;

        let html = '';
        if (goalMet) { html += renderSessionSummary(); }

        html += `<div class="word-card">`;
        html += `<div class="word-card-header"><div class="level-pill level-${word.level}">${esc(word.level)}</div>`;
        html += `<div class="word-title-row"><span class="word-title">${esc(word.word)}</span><button class="share-icon" data-action="shareWord" data-value="${word.id}" title="Copy to clipboard">⧉</button></div>`;
        html += `<div class="word-pronunciation"><span class="ipa">${esc(word.pronunciation)}</span><span class="pos">${esc(word.partOfSpeech)}</span></div></div>`;

        html += `<div class="word-card-body">`;
        html += `<div class="word-section"><h3>Definition</h3><p>${esc(word.meaning)}</p></div>`;
        html += `<div class="word-section"><h3>Etymology</h3><p class="word-etymology">${esc(word.etymology)}</p></div>`;
        html += `<div class="word-section"><h3>Usage</h3><p class="word-usage">"${esc(word.usage)}"</p></div>`;

        if (word.homonyms && word.homonyms.length > 0) {
            html += `<div class="word-section"><span class="homonym-badge" data-action="toggleHomonyms">🔀 Homonym — ${word.homonyms.length} additional meaning${word.homonyms.length > 1 ? 's' : ''}</span>`;
            html += `<div class="homonym-list" id="homonym-list" style="display:none">`;
            for (const h of word.homonyms) {
                html += `<div class="homonym-item"><p class="homonym-meaning">${esc(h.meaning)}</p><p class="homonym-usage">"${esc(h.usage)}"</p></div>`;
            }
            html += `</div></div>`;
        }

        if ((word.synonyms && word.synonyms.length) || (word.antonyms && word.antonyms.length)) {
            html += `<div class="word-associations">`;
            if (word.synonyms?.length) { html += `<div><strong>Synonyms: </strong><span>${word.synonyms.map(esc).join(', ')}</span></div>`; }
            if (word.antonyms?.length) { html += `<div><strong>Antonyms: </strong><span>${word.antonyms.map(esc).join(', ')}</span></div>`; }
            html += `</div>`;
        }

        if (word.mnemonic) {
            html += `<div class="mnemonic-box"><span class="mnemonic-icon">💡</span><span class="mnemonic-text">${esc(word.mnemonic)}</span></div>`;
        }
        html += `</div>`; // body

        if (!isReview) {
            html += `<div class="word-actions"><button class="btn btn-remember" data-action="gotIt" data-value="${word.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Got It</button><button class="btn btn-recycle" data-action="notYet" data-value="${word.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> Not Yet</button></div>`;
        } else {
            html += `<div class="word-actions"><button class="btn btn-back" data-action="back">← Back</button></div>`;
        }
        html += `</div>`; // card

        if (!isReview) {
            const pct = state.dailyGoal > 0 ? Math.min(100, Math.round((todayTotal / state.dailyGoal) * 100)) : 0;
            html += `<div class="today-progress"><div class="progress-label"><span>Today's progress</span><span>${todayTotal} / ${state.dailyGoal}</span></div>`;
            html += `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>`;
        }

        contentEl.innerHTML = html;
    }

    function renderSessionSummary() {
        const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        return `<div class="session-summary"><div class="summary-icon">🎉</div><h2>Daily Goal Reached!</h2><p class="summary-subtitle">Great work! Here's your summary.</p><div class="summary-stats">${statBox(state.todayStats.wordsRemembered,'Remembered')}${statBox(state.todayStats.wordsRecycled,'To Revise')}${statBox(state.streak.current,'Day Streak')}${statBox(state.remembered.length,'Total Words')}</div><p class="motivation">${esc(quote)}</p></div><div style="text-align:center;margin-bottom:10px;"><span style="font-size:11px;color:var(--text-muted);">Keep going — here's your next word:</span></div>`;
    }

    // ── List Views ──────────────────────────────────────
    function renderListView(listType) {
        const isRemembered = listType === 'remembered';
        const items = isRemembered ? state.remembered : state.recycled;
        const title = isRemembered ? 'Remembered Words' : 'Words to Revise';
        const icon = isRemembered ? '✅' : '🔄';
        const enriched = items.map(item => {
            // Word ID is now the word string itself
            const wordStr = item.wordId;
            const capitalized = wordStr.charAt(0).toUpperCase() + wordStr.slice(1);
            // Try to find level from curated words or default to current level
            const curated = typeof WORDS !== 'undefined' ? WORDS.find(w => w.word.toLowerCase() === wordStr.toLowerCase()) : null;
            return { ...item, word: capitalized, level: curated ? curated.level : findWordLevel(wordStr) };
        });
        let filtered = searchQuery ? enriched.filter(item => item.word.toLowerCase().includes(searchQuery)) : enriched;

        let html = `<div class="list-header"><h2>${icon} ${title}</h2><span class="list-count">${items.length}</span></div>`;
        html += `<input class="search-box" type="text" placeholder="Search words..." value="${esc(searchQuery)}">`;

        if (filtered.length === 0) {
            html += items.length === 0
                ? `<div class="empty-state"><div class="empty-icon">${isRemembered ? '📝' : '🔄'}</div><h2>No words yet</h2><p>${isRemembered ? 'Words you mark "Got It" appear here.' : 'Words you mark "Not Yet" appear here for revision.'}</p></div>`
                : `<div class="empty-state"><p>No words match your search.</p></div>`;
        } else {
            html += `<div class="word-list">`;
            for (const item of filtered) {
                html += `<div class="word-list-item" data-action="reviewWord" data-value="${item.wordId}"><span class="item-word">${esc(item.word)}</span><span class="item-level level-${item.level}">${esc(item.level)}</span>`;
                html += isRemembered ? `<span class="item-meta">${item.rememberedDate}</span>` : `<span class="item-meta">#${item.attempts}</span>`;
                html += `</div>`;
            }
            html += `</div>`;
        }
        contentEl.innerHTML = html;
    }

    // ── Badges View ─────────────────────────────────────
    function renderBadgesView() {
        let html = `<div class="badges-view"><h2>🏆 Badges & Achievements</h2>`;

        // ── Streak Badges ───────────────────────────────
        html += `<div class="badge-section"><h3>🔥 Daily Streak Badges</h3><div class="badge-grid">`;
        for (const badge of STREAK_BADGES) {
            const key = String(badge.days);
            const earned = state.badges.streaks[key]?.achieved;
            const cls = earned ? 'earned' : 'locked';
            html += `<div class="badge-item ${cls}" data-action="showBadgeDetail" data-value="${key}" data-badgetype="streak">`;
            html += `<div class="badge-icon">${badge.icon}</div>`;
            html += `<div class="badge-name">${esc(badge.name)}</div>`;
            html += `<div class="badge-progress">${earned ? '✓ Earned' : `${Math.min(state.streak.current, badge.days)}/${badge.days} days`}</div>`;
            html += `</div>`;
        }
        html += `</div></div>`;

        // ── Lifetime Badges ─────────────────────────────
        html += `<div class="badge-section"><h3>📚 Lifetime Words</h3><div class="badge-grid">`;
        const totalRemembered = state.remembered.length;
        for (const badge of LIFETIME_BADGES) {
            const key = String(badge.count);
            const earned = state.badges.lifetime[key]?.achieved;
            const cls = earned ? 'earned' : 'locked';
            html += `<div class="badge-item ${cls}" data-action="showBadgeDetail" data-value="${key}" data-badgetype="lifetime">`;
            html += `<div class="badge-icon">${badge.icon}</div>`;
            html += `<div class="badge-name">${esc(badge.name)}</div>`;
            html += `<div class="badge-progress">${earned ? '✓ Earned' : `${Math.min(totalRemembered, badge.count)}/${badge.count.toLocaleString()}`}</div>`;
            html += `</div>`;
        }
        html += `</div></div>`;

        // ── Monthly Badges ──────────────────────────────
        html += `<div class="badge-section"><h3>�️ Monthly Challenges</h3><div class="monthly-badge-list">`;
        const now = new Date();
        // Show current month + previous 5 months
        for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const ym = d.toISOString().slice(0, 7); // "2026-04"
            const mk = String(d.getMonth() + 1).padStart(2, '0');
            const monthDef = MONTHLY_TARGETS[mk];
            if (!monthDef) { continue; }
            const earned = state.badges.monthly[ym]?.achieved;
            const monthCount = state.remembered.filter(r => r.rememberedDate && r.rememberedDate.startsWith(ym)).length;
            const cls = earned ? 'earned' : 'locked';
            html += `<div class="monthly-badge-item ${cls}" data-action="showBadgeDetail" data-value="${ym}" data-badgetype="monthly">`;
            html += `<div class="mb-icon">${earned ? '🏅' : monthDef.icon}</div>`;
            html += `<div class="mb-info"><div class="mb-name">${monthDef.name}</div><div class="mb-target">${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} — ${monthDef.target} words</div></div>`;
            html += `<div class="mb-status">${earned ? '✓ Earned' : `${monthCount}/${monthDef.target}`}</div>`;
            html += `</div>`;
        }
        html += `</div></div>`;

        html += `</div>`;
        contentEl.innerHTML = html;
    }

    function showBadgeDetail(key, type) {
        // Remove existing
        document.querySelector('.badge-overlay')?.remove();
        document.querySelector('.badge-detail')?.remove();

        let icon = '', name = '', desc = '', earned = false, achievedDate = '';

        if (type === 'streak') {
            const badge = STREAK_BADGES.find(b => String(b.days) === key);
            if (!badge) { return; }
            icon = badge.icon; name = badge.name; desc = badge.desc;
            earned = !!state.badges.streaks[key]?.achieved;
            achievedDate = state.badges.streaks[key]?.achievedDate || '';
        } else if (type === 'lifetime') {
            const badge = LIFETIME_BADGES.find(b => String(b.count) === key);
            if (!badge) { return; }
            icon = badge.icon; name = badge.name; desc = badge.desc;
            earned = !!state.badges.lifetime[key]?.achieved;
            achievedDate = state.badges.lifetime[key]?.achievedDate || '';
        } else if (type === 'monthly') {
            const mk = key.slice(5, 7);
            const monthDef = MONTHLY_TARGETS[mk];
            if (!monthDef) { return; }
            icon = monthDef.icon || '🗓️'; name = monthDef.name; desc = `${monthDef.target} words in ${key}`;
            earned = !!state.badges.monthly[key]?.achieved;
            achievedDate = state.badges.monthly[key]?.achievedDate || '';
        }

        const overlay = document.createElement('div');
        overlay.className = 'badge-overlay';
        document.body.appendChild(overlay);

        const detail = document.createElement('div');
        detail.className = `badge-detail ${earned ? 'earned' : ''}`;
        const shareText = `🏆 I earned the "${name}" badge on Vocabulary Builder! ${desc}\n\nBuild your vocabulary too:\n${EXTENSION_STORE_URL}`;
        detail.innerHTML = `
            <div class="bd-icon">${icon}</div>
            <div class="bd-name">${esc(name)}</div>
            <div class="bd-desc">${esc(desc)}</div>
            ${earned
                ? `<div class="bd-date">🏅 Achieved on ${achievedDate}</div>
                   <div class="bd-share-section">
                       <div class="toast-share-label">Share this achievement</div>
                       <div class="toast-share-btns">
                           <button class="social-btn social-linkedin" data-action="shareBadge" data-platform="linkedin" data-text="${esc(shareText)}" title="LinkedIn">in</button>
                           <button class="social-btn social-facebook" data-action="shareBadge" data-platform="facebook" data-text="${esc(shareText)}" title="Facebook">f</button>
                           <button class="social-btn social-whatsapp" data-action="shareBadge" data-platform="whatsapp" data-text="${esc(shareText)}" title="WhatsApp">w</button>
                           <button class="social-btn social-x" data-action="shareBadge" data-platform="x" data-text="${esc(shareText)}" title="X (Twitter)">𝕏</button>
                           <button class="social-btn social-copy" data-action="shareBadge" data-platform="copy" data-text="${esc(shareText)}" title="Copy text">📋</button>
                       </div>
                   </div>`
                : `<div class="bd-locked">🔒 Not yet earned</div>`}
            <button class="bd-close">Close</button>`;
        document.body.appendChild(detail);
    }

    // ── Stats View ──────────────────────────────────────
    function renderStatsView() {
        const stats = computeStats();
        let html = `<div class="stats-view"><h2>📊 Your Progress</h2>`;
        html += `<div class="overall-retention"><div class="big-pct">${stats.overallRetention}%</div><div class="pct-label">Overall Retention</div></div>`;
        html += `<div class="stat-cards">${statCard(stats.totalRemembered,'Remembered')}${statCard(stats.totalRecycled,'To Revise')}${statCard(stats.totalShown,'Total Shown')}${statCard(state.streak.longest,'Best Streak')}</div>`;
        html += `<div class="retention-section"><h3>Retention by Level</h3>`;
        for (const item of stats.retentionByLevel) {
            html += `<div class="retention-item"><span class="level-name">${esc(item.level)}</span><div class="retention-bar"><div class="retention-fill level-${item.level}-fill" style="width:${item.percentage}%"></div></div><span class="retention-pct">${item.percentage}%</span></div>`;
        }
        html += `</div>`;
        html += `<div class="retention-section"><h3>Today</h3><div class="stat-cards">${statCard(state.todayStats.wordsRemembered,'Remembered')}${statCard(state.todayStats.wordsRecycled,'To Revise')}</div></div>`;
        html += `</div>`;
        contentEl.innerHTML = html;
    }

    // ── Settings View ───────────────────────────────────
    function renderSettingsView() {
        const levels = [
            { id: 'simple', title: 'Simple', desc: 'Everyday vocabulary, high frequency' },
            { id: 'medium', title: 'Medium', desc: 'Academic and professional usage' },
            { id: 'complex', title: 'Complex', desc: 'Literary, low-frequency, nuanced' },
            { id: 'competitive', title: 'Competitive', desc: 'GMAT, GRE, LSAT exam-grade words' }
        ];
        const goals = [1, 3, 5, 10];

        let html = `<div class="settings-view"><h2>⚙️ Settings</h2>`;

        html += `<div class="setting-group"><h3>Word Level</h3><div class="level-options">`;
        for (const level of levels) {
            const active = state.currentLevel === level.id ? ' active' : '';
            html += `<button class="level-option${active}" data-action="changeLevel" data-value="${level.id}"><div class="level-radio"></div><div class="level-info"><div class="level-title">${level.title}</div><div class="level-desc">${level.desc}</div></div></button>`;
        }
        html += `</div></div>`;

        html += `<div class="setting-group"><h3>Daily Word Goal</h3><div class="goal-options">`;
        for (const goal of goals) {
            const active = state.dailyGoal === goal ? ' active' : '';
            html += `<button class="goal-option${active}" data-action="changeDailyGoal" data-value="${goal}"><div class="goal-num">${goal}</div><div class="goal-label">word${goal > 1 ? 's' : ''}/day</div></button>`;
        }
        html += `</div></div>`;

        html += `<div class="setting-group"><h3>Danger Zone</h3><button class="btn btn-danger" data-action="resetProgress">🗑️ Reset All Progress</button></div></div>`;
        contentEl.innerHTML = html;
    }

    // ── Helpers ──────────────────────────────────────────
    function statCard(value, label) { return `<div class="stat-card"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`; }
    function statBox(value, label) { return `<div class="summary-stat"><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`; }

    // Find which level a word belongs to from WORD_LISTS
    function findWordLevel(wordStr) {
        const w = wordStr.toLowerCase();
        if (typeof WORD_LISTS === 'undefined') { return state.currentLevel; }
        for (const level of ['simple', 'medium', 'complex', 'competitive']) {
            if (WORD_LISTS[level] && WORD_LISTS[level].some(x => x.toLowerCase() === w)) { return level; }
        }
        return state.currentLevel;
    }

    // Async review word by ID (word string)
    async function reviewWordById(wordId) {
        const data = await fetchWordData(wordId, findWordLevel(wordId));
        if (data) { reviewingWord = data; currentView = 'word'; render(); }
    }
    // ── Share Word ──────────────────────────────────────
    async function shareWord(wordId) {
        const word = await fetchWordData(wordId, findWordLevel(wordId));
        if (!word || !word.meaning) { return; }
        let text = `📖 ${word.word}`;
        if (word.pronunciation) { text += ` (${word.pronunciation})`; }
        if (word.partOfSpeech) { text += ` — ${word.partOfSpeech}`; }
        text += `\n`;
        text += `\n📝 Definition: ${word.meaning}\n`;
        if (word.etymology) { text += `\n📜 Etymology: ${word.etymology}\n`; }
        if (word.usage) { text += `\n💬 Usage: "${word.usage}"\n`; }
        if (word.synonyms?.length) { text += `\n🔗 Synonyms: ${word.synonyms.join(', ')}\n`; }
        if (word.antonyms?.length) { text += `\n🔀 Antonyms: ${word.antonyms.join(', ')}\n`; }
        if (word.mnemonic) { text += `\n💡 Mnemonic: ${word.mnemonic}\n`; }
        if (word.homonyms?.length) {
            text += `\n🔀 Homonyms:\n`;
            for (const h of word.homonyms) { text += `  • ${h.meaning} — "${h.usage}"\n`; }
        }
        text += `\n— Shared via Vocabulary Builder`;
        text += `\n${EXTENSION_STORE_URL}`;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.querySelector('[data-action="shareWord"]');
            if (btn) {
                const orig = btn.textContent;
                btn.textContent = '✓';
                btn.classList.add('share-icon-copied');
                setTimeout(() => { btn.textContent = orig; btn.classList.remove('share-icon-copied'); }, 1500);
            }
        });
    }

    // ── Share Badge to Social Media ─────────────────────
    function shareBadge(platform, text) {
        const encoded = encodeURIComponent(text);
        const storeUrl = encodeURIComponent(EXTENSION_STORE_URL);
        let url = '';
        switch (platform) {
            case 'linkedin':
                url = `https://www.linkedin.com/sharing/share-offsite/?url=${storeUrl}`;
                break;
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${storeUrl}&quote=${encoded}`;
                break;
            case 'whatsapp':
                url = `https://wa.me/?text=${encoded}`;
                break;
            case 'x':
                url = `https://twitter.com/intent/tweet?text=${encoded}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(text).then(() => {
                    const btn = document.querySelector('[data-platform="copy"]');
                    if (btn) {
                        const orig = btn.textContent;
                        btn.textContent = '✓';
                        setTimeout(() => { btn.textContent = orig; }, 1500);
                    }
                });
                return;
        }
        if (url) { chrome.tabs.create({ url }); }
    }

    function esc(str) { if (!str) { return ''; } const el = document.createElement('span'); el.textContent = String(str); return el.innerHTML; }
})();
