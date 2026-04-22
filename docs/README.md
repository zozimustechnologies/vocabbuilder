# VocabBuilder Developer Documentation

This is the **GitHub Pages branch** for VocabBuilder — a developer-focused documentation site.

## What's in this Branch

This branch contains the website files in the `docs/` directory (served by GitHub Pages):

- `docs/index.html` — Main developer documentation page
- `docs/css/style.css` — Styling (dark theme, GitHub-style)
- `docs/js/script.js` — Interactive features (smooth scroll, copy-to-clipboard)
- `docs/images/` — Diagrams and assets directory
- `docs/README.md` — This file

All extension source code files are preserved for reference (manifest.json, background/, sidepanel/, data/, etc.).

## Live Site

The documentation is published at: **https://zozimustechnologies.github.io/vocabbuilder**

## Documentation Sections

1. **Hero** — Product description, installation CTAs
2. **Features** — Key capabilities (spaced repetition, badges, streaks, reminders)
3. **Use Cases** — Who benefits from VocabBuilder
4. **Benefits** — Why spaced repetition science works
5. **Getting Started** — 30-second installation guide
6. **For Developers** — Tech stack, architecture, contribution guide

## Updating the Documentation

To update the documentation:

1. Edit files in `docs/` folder (`docs/index.html`, `docs/css/style.css`, `docs/js/script.js`)
2. Test locally: Open `docs/index.html` in a browser
3. Commit changes: `git commit -m "Update docs: [description]"`
4. Push to this branch: `git push origin docs`
5. GitHub Pages auto-publishes (takes ~30 seconds)

## Local Testing

To preview the site locally:

```bash
# Option 1: Open directly in browser
open docs/index.html

# Option 2: Use a local server (Python 3)
python3 -m http.server 8000
# Then visit: http://localhost:8000/docs/
```

## Branch Purpose

- ✅ **User documentation** — Feature overview and installation guide
- ✅ **Developer onboarding** — Architecture and contribution guide
- ✅ **Project showcase** — Demonstrate extension capabilities
- ❌ **NOT** for word lists or user tutorials

## GitHub Pages Configuration

In repo Settings → Pages:
- **Source:** Deploy from branch
- **Branch:** `docs` 
- **Folder:** `/(root)` (serves from docs/ directory automatically)

## Feedback & Issues

If you find errors or have suggestions for the documentation, please open an issue in the main repository: https://github.com/zozimustechnologies/vocabbuilder/issues

