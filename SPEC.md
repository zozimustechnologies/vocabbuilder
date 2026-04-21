# Vocabulary Builder — Product Specification

**Version:** 2.0  
**Last Updated:** April 21, 2026  
**Status:** Implemented (Edge Extension — Manifest V3)  
**Publisher:** [Zozimus Technologies](https://github.com/zozimustechnologies)

---

## 1. Vision

Vocabulary Builder is a daily-habit-driven word learning browser extension designed for students, professionals, and competitive exam aspirants (GMAT, GRE, LSAT, CAT, etc.). It combines spaced repetition science with a clean, low-friction UX in your browser's side panel to make learning words stick — not just for a test, but for life.

---

## 2. Target Audience

| Segment | Need |
|---|---|
| **Competitive exam aspirants** | GMAT, GRE, LSAT, CAT-level vocabulary with contextual usage |
| **ESL learners** | Build everyday and academic English vocabulary |
| **Professionals** | Sharpen communication for writing, presentations, public speaking |
| **Lifelong learners** | Casual daily habit — "word-a-day" users |

---

## 3. Platform & Architecture

### 3.1 Platform

- **Microsoft Edge / Google Chrome extension** (Manifest V3)
- Opens in the browser **side panel** (not a popup)
- No build step — pure HTML, CSS, and JavaScript
- All data stored locally via `chrome.storage.local`

### 3.2 Extension Manifest

| Field | Value |
|---|---|
| Manifest version | 3 |
| Side panel | `sidepanel/sidepanel.html` |
| Background | `background/service-worker.js` |
| Permissions | `storage`, `alarms`, `notifications`, `sidePanel` |
| Action | Click extension icon → opens side panel |

### 3.3 Technology Stack

| Component | Technology |
|---|---|
| UI | Vanilla HTML5 + CSS3 (dark theme, GitHub-style) |
| Logic | Vanilla ES2020 JavaScript (IIFE module) |
| Storage | `chrome.storage.local` (key: `vocabState`) |
| Scheduling | `chrome.alarms` (daily reminder + streak check) |
| Notifications | `chrome.notifications` |
| Side Panel | `chrome.sidePanel` API |
| Icons | SVG source → generated PNGs (16, 32, 48, 128px) |

### 3.4 Brand

| Element | Value |
|---|---|
| Gradient | `linear-gradient(135deg, #3d7ea6 0%, #1a4a6e 100%)` |
| Dark theme | GitHub-style (`--bg-primary: #0d1117`) |
| Donate button | Red, links to `https://wise.com/pay/business/sandeepchadda?utm_source=open_link` |
| Copyright | © Zozimus Technologies → `https://github.com/zozimustechnologies` |

---

## 4. Word Levels

Words are organized into four progressive tiers:

| Level | Description | Example Words |
|---|---|---|
| **Simple** | Everyday vocabulary, high frequency | *candid, keen, quaint, serene* |
| **Medium** | Academic and professional usage | *pragmatic, ephemeral, lucid, eloquent* |
| **Complex** | Literary, low-frequency, nuanced meaning | *perspicacious, sanguine, ameliorate, obfuscate* |
| **Competitive** | Exam-grade words (GMAT, GRE, LSAT) | *loquacious, recondite, pusillanimous, pulchritude* |

- Users select their starting level during **first-time onboarding**.
- Users can switch levels freely at any time via **Settings**.

---

## 5. First-Time Onboarding

On first open (when `onboardingComplete === false`):

1. Header and footer are **hidden**.
2. A full-screen **level picker** is shown with four level buttons, each with an icon, title, and description.
3. User picks a level → `onboardingComplete` is set to `true`, the selected level is saved, and the main app UI appears.
4. A hint at the bottom states: *"You can change this anytime in Settings ⚙️"*

After onboarding, the header (brand bar + navigation) and footer (donate + copyright) are shown.

---

## 6. Daily Word Experience

Each day, the user is presented a **Word Card** containing:

| Element | Details |
|---|---|
| **Level pill** | Color-coded badge (Simple=green, Medium=blue, Complex=yellow, Competitive=red) |
| **Word** | Displayed prominently in large text |
| **Pronunciation** | IPA phonetic transcription |
| **Part of speech** | Shown alongside pronunciation |
| **Definition** | Primary definition |
| **Etymology** | Language of origin, root breakdown |
| **Usage sentence** | Contextual example sentence in italics, bordered |
| **Homonym badge** | Shown when word has multiple distinct meanings; click to expand |
| **Synonyms & Antonyms** | Shown beneath definition for associative learning |
| **Mnemonic hint** | 💡 A short, memorable trick to recall the word |
| **Share button** | 📋 Copies full word info + extension link to clipboard |
| **Got It / Not Yet** | Action buttons (hidden during review mode) |

### 6.1 Word Selection Logic

1. First: show **recycled words** that are due (spaced repetition `nextShowDate <= today`)
2. Then: show **new words** at the current level that haven't been seen
3. Fallback: show the next-soonest recycled word
4. Empty: show "All caught up!" empty state

---

## 7. Share Word Feature

Every word card includes a **Share** button below the card body. When clicked:

1. The word's full details are formatted as plain text:
   - Word, pronunciation, part of speech
   - Definition, etymology, usage
   - Synonyms, antonyms
   - Mnemonic hint
   - Homonym meanings (if any)
   - Attribution line: *"— Shared via Vocabulary Builder"*
   - Extension store link (placeholder until published)
2. Text is copied to the user's **clipboard** via `navigator.clipboard.writeText()`.
3. The button text changes to **"✅ Copied to clipboard!"** for 2 seconds.

### 7.1 Store Links (To Be Updated)

| Store | URL |
|---|---|
| Edge Add-ons | `PLACEHOLDER` — update once published |
| Chrome Web Store | `PLACEHOLDER` — update once published |

> **Note:** The `EXTENSION_STORE_URL` constant in `sidepanel.js` must be updated with the actual store URL once the extension is published.

---

## 8. Spaced Repetition

When a user taps **"Not Yet"**, the word enters the recycled queue with increasing intervals:

| Attempt | Reappears After |
|---|---|
| 1st miss | 1 day |
| 2nd miss | 3 days |
| 3rd miss | 7 days |
| 4th miss | 14 days |
| 5th+ miss | 30 days |

When a user taps **"Got It"**, the word moves to the **Remembered** list with the date recorded. If a recycled word is later remembered, it is removed from recycled and added to remembered.

---

## 9. Navigation & Views

The side panel has the following navigation:

| Tab | Icon | View |
|---|---|---|
| **Word** | 📝 | Word of the Day card |
| **Got It** | ✅ | Remembered words list (searchable) |
| **Recycle** | 🔄 | Recycled words list (searchable) |
| **Badges** | 🏆 | Badges & achievements |
| **Stats** | 📊 | Progress analytics |

Additional navigation:
- **⚙️ Settings cog** — in header brand bar, navigates to Settings view
- **🔥 Streak badge** — shows current streak count in header

### 9.1 Word Lists (Got It / Recycle)

- Searchable with a text filter
- Each word shows: word name, level badge (color-coded), date remembered or attempt count
- Click any word to open its full Word Card in review mode (with "← Back" button instead of Got It/Not Yet)

---

## 10. Gamification & Badges

### 10.1 Badge Categories

Badges are organized into three categories:

#### Daily Streak Badges

Earned by maintaining consecutive active days:

| Days | Badge Name | Icon | Description |
|---|---|---|---|
| 3 | Spark Starter | ⚡ | 3-day streak |
| 7 | Week Warrior | 🗡️ | 7-day streak |
| 15 | Fortnight Force | 🛡️ | 15-day streak |
| 30 | Monthly Maestro | 🎯 | 30-day streak |
| 90 | Quarter Conqueror | 🏔️ | 90-day streak |
| 180 | Half-Year Hero | 🦅 | 180-day streak |
| 365 | Annual Ace | 👑 | 1-year streak |
| 730 | Biennial Baron | 💎 | 2-year streak |
| 1095 | Triennial Titan | 🏆 | 3-year streak |

#### Lifetime Word Badges

Earned by total words remembered:

| Count | Badge Name | Icon | Description |
|---|---|---|---|
| 100 | Word Seedling | 🌱 | Learn 100 words |
| 200 | Vocabulary Sprout | 🌿 | Learn 200 words |
| 300 | Lexicon Explorer | 🧭 | Learn 300 words |
| 500 | Word Warrior | ⚔️ | Learn 500 words |
| 900 | Syntax Sage | 📜 | Learn 900 words |
| 1,200 | Diction Duke | 🏰 | Learn 1,200 words |
| 1,500 | Eloquence Knight | 🗡️ | Learn 1,500 words |
| 2,000 | Language Luminary | ✨ | Learn 2,000 words |
| 2,500 | Rhetoric Monarch | 👑 | Learn 2,500 words |
| 3,000 | Polyglot Phoenix | 🔥 | Learn 3,000 words |
| 4,000 | Verbosity Virtuoso | 🎻 | Learn 4,000 words |
| 5,000 | Lexicon Legend | 🐉 | Learn 5,000 words |
| 10,000 | Word Wizard Supreme | 🧙 | Learn 10,000 words |

#### Monthly Challenge Badges

Earned by remembering a target number of words in a calendar month:

| Month | Badge Name | Target |
|---|---|---|
| January | January Journeyman | 45 words |
| February | February Phrasecraft | 40 words |
| March | March Wordsmith | 50 words |
| April | April Articulator | 50 words |
| May | May Maverick | 60 words |
| June | June Juggernaut | 55 words |
| July | July Lexicon | 50 words |
| August | August Ace | 55 words |
| September | September Scholar | 60 words |
| October | October Orator | 55 words |
| November | November Narrator | 50 words |
| December | December Diplomat | 45 words |

### 10.2 Badge Display

- **Badges view** shows all three badge sections in a grid layout
- **Earned badges** have a gold border and "✓ Earned" status
- **Locked badges** are grayed out with progress shown (e.g., "5/30 days")
- **Click any badge** → modal overlay showing: icon, name, description, and **achievement date** (or "🔒 Not yet earned")
- Monthly badges are shown in a list view for the last 6 months

### 10.3 Badge Checking & Toasts

- After every **Got It** or **Not Yet** action, `checkBadges(state)` is called
- Newly earned badges trigger a **toast notification** (animated popup at top of screen for 3.5 seconds)
- Toast shows: 🏅 icon, badge name, and description

---

## 11. Stats & Analytics

The Stats view displays:

| Metric | Display |
|---|---|
| Overall retention % | Large percentage with label |
| Total remembered | Stat card |
| Total recycled | Stat card |
| Total shown | Stat card |
| Best streak | Stat card |
| Retention by level | Bar chart per level (Simple/Medium/Complex/Competitive) |
| Today's stats | Words remembered + recycled today |

### Retention Calculation

```
retention = remembered / (remembered + recycled) × 100
```

Calculated both overall and per-level.

---

## 12. Settings

Accessible via the ⚙️ cog button in the header. Contains:

| Setting | Options |
|---|---|
| **Word Level** | Simple, Medium, Complex, Competitive (radio buttons) |
| **Daily Word Goal** | 1, 3, 5, or 10 words per day |
| **Reset Progress** | Danger zone — clears all data with confirmation dialog |

---

## 13. Daily Progress

- A **progress bar** is shown below the word card (non-review mode)
- Shows "Today's progress: X / Y" where Y is the daily goal
- When daily goal is met, a **Session Summary** appears above the word card:
  - 🎉 "Daily Goal Reached!" heading
  - Stats: words remembered, recycled, current streak, total words
  - Motivational quote
  - User can continue beyond the daily goal

---

## 14. Streak System

| Rule | Behavior |
|---|---|
| Increment | +1 when user interacts on a new day (Got It or Not Yet) |
| Continue | If `lastActiveDate` was yesterday, streak continues |
| Reset | If more than 1 day gap, streak resets to 1 |
| Display | 🔥 counter in header brand bar |
| Tracked | `streak.current` and `streak.longest` |

---

## 15. Background Service Worker

The service worker (`background/service-worker.js`) handles:

1. **`chrome.sidePanel.setPanelBehavior`** — opens side panel on action click
2. **Daily reminder alarm** — fires at 9 AM, sends notification with word-of-the-day prompt
3. **Streak check alarm** — fires at midnight, checks/resets streak
4. **State migration** — adds `badges` and `onboardingComplete` fields for users upgrading from older versions

---

## 16. Data Model

### State Shape (`vocabState`)

```javascript
{
    onboardingComplete: boolean,
    currentLevel: 'simple' | 'medium' | 'complex' | 'competitive',
    dailyGoal: number,                  // 1, 3, 5, or 10
    remembered: [                       // Words marked "Got It"
        { wordId: string, rememberedDate: 'YYYY-MM-DD' }
    ],
    recycled: [                         // Words marked "Not Yet"
        { wordId: string, nextShowDate: 'YYYY-MM-DD', attempts: number, lastAttemptDate: 'YYYY-MM-DD' }
    ],
    shownWordIds: string[],             // All words ever shown
    streak: {
        current: number,
        longest: number,
        lastActiveDate: 'YYYY-MM-DD'
    },
    todayStats: {
        date: 'YYYY-MM-DD',
        wordsShown: number,
        wordsRemembered: number,
        wordsRecycled: number
    },
    badges: {
        monthly: { 'YYYY-MM': { achieved: boolean, achievedDate: 'YYYY-MM-DD', count: number } },
        streaks: { 'days': { achieved: boolean, achievedDate: 'YYYY-MM-DD' } },
        lifetime: { 'count': { achieved: boolean, achievedDate: 'YYYY-MM-DD' } }
    }
}
```

### Word Data Shape

```javascript
{
    id: string,                         // e.g., 'simple-01'
    word: string,
    pronunciation: string,              // IPA
    partOfSpeech: string,
    etymology: string,
    meaning: string,
    usage: string,
    synonyms: string[],
    antonyms: string[],
    mnemonic: string,
    level: 'simple' | 'medium' | 'complex' | 'competitive',
    homonyms?: [{ meaning: string, usage: string }]
}
```

---

## 17. Word Database

- **40 curated words** (10 per level) in `data/words.js`
- Global `WORDS` array accessible to the side panel
- Each word has full metadata: pronunciation, etymology, meaning, usage, synonyms, antonyms, mnemonic
- Homonym support for words with multiple distinct meanings

---

## 18. File Structure

```
vocabbuilder/
├── manifest.json                 # Extension manifest (Manifest V3)
├── background/
│   └── service-worker.js         # Alarms, notifications, sidePanel behavior
├── sidepanel/
│   ├── sidepanel.html            # Main UI (header, nav, content, footer)
│   ├── sidepanel.css             # Complete dark-theme styling
│   └── sidepanel.js              # All app logic (onboarding, views, badges, share)
├── data/
│   ├── words.js                  # Word database (40 words, 4 levels)
│   └── badges.js                 # Badge definitions + checkBadges() logic
├── icons/
│   ├── icon.svg                  # Source SVG (open book with floating letters)
│   ├── icon-16.png               # 16×16 generated PNG
│   ├── icon-32.png               # 32×32 generated PNG
│   ├── icon-48.png               # 48×48 generated PNG
│   └── icon-128.png              # 128×128 generated PNG
├── generate-icons.js             # Node script to generate PNGs from SVG
├── SPEC.md                       # This specification
└── README.md                     # Project readme
```

---

## 19. Accessibility & UX

| Requirement | Implementation |
|---|---|
| Dark theme | GitHub-style dark colors throughout |
| Color contrast | WCAG-friendly contrast ratios |
| Animations | Subtle fade-in and pop animations for cards and toasts |
| Keyboard nav | Standard button/focus navigation |
| Scrollbar | Custom styled thin scrollbar |
| Responsive | Fits side panel width (~400px) |

---

## 20. Notifications & Engagement

| Trigger | Notification |
|---|---|
| Daily reminder (9 AM) | *"📖 Your word of the day is ready!"* |
| Streak at risk (midnight check) | Streak is checked and reset if no activity |

---

## 21. Future Enhancements

- [ ] Audio pronunciation (TTS or pre-recorded)
- [ ] Expand word database beyond 40 words
- [ ] Quiz mode (multiple choice, fill-in-the-blank)
- [ ] Export to Anki / CSV
- [ ] Sync across devices (cloud storage)
- [ ] Custom word lists (import your own)
- [ ] Themed word packs ("100 Words for GMAT", "Business English", etc.)
- [ ] Level promotion suggestions based on retention rate
- [ ] Streak freeze (allow 1 missed day without breaking streak)
- [ ] Leaderboard / social features
- [ ] Publish to Edge Add-ons store
- [ ] Publish to Chrome Web Store
- [ ] Update `EXTENSION_STORE_URL` in `sidepanel.js` with actual store links

---

## 22. Store Listing (Draft)

**Name:** Vocabulary Builder  
**Short Description:** Build your vocabulary daily with spaced repetition — right in your browser. Perfect for GMAT, GRE, LSAT, and everyday learning.  
**Category:** Education  
**Author:** Zozimus Technologies

---

## 23. Donate

Support development:  
[❤️ Donate via Wise](https://wise.com/pay/business/sandeepchadda?utm_source=open_link)
