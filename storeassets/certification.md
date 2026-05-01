Notes for Certification

No test accounts are required. VocabBuilder has no login, no sign-up, and no backend — all data is stored locally using the Chrome Storage API.

How to test the extension:

1. Install the extension and click the side panel icon to open it.
2. On first launch, an onboarding screen appears — select any difficulty level (Simple, Medium, Complex, or Competitive) to begin.
3. The Word view shows a word card with definition, etymology, usage, synonyms, and antonyms. Use Got It or Not Yet to respond.
4. The Got It tab lists all remembered words. The Revise tab lists words scheduled for review.
5. The Badges tab shows streak, lifetime, and monthly achievement badges.
6. The Stats tab shows overall retention percentage and per-level breakdowns.
7. The Settings (cog icon) lets you change the difficulty level and daily word goal.
8. Daily reminder notifications fire at 9 AM via the browser alarms API if the extension has not been opened that day.

External dependency: The extension calls the free, no-auth Dictionary API (https://dictionaryapi.dev/) to fetch word details. No user data is sent — only the word string is looked up. No API key is required.

No purchases, subscriptions, or additional products are needed.
