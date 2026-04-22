# VocabBuilder Developer Documentation

This is the **GitHub Pages branch** for VocabBuilder — a developer-focused documentation site.

## What's in this Branch

This branch contains **only the website files** for GitHub Pages and is kept separate from the main project. It includes:

- `index.html` — Main developer documentation page
- `css/style.css` — Styling (dark theme, GitHub-style)
- `js/script.js` — Interactive features (smooth scroll, copy-to-clipboard)
- `images/` — Diagrams and assets

## Live Site

The documentation is published at: **https://zozimustechnologies.github.io/vocabbuilder**

## Documentation Sections

1. **Overview** — Project description, tech stack
2. **Architecture** — Extension architecture, component diagram, file structure
3. **Development Setup** — Prerequisites, local installation, debugging
4. **Code Structure** — Guide to key files and components
5. **Key Features** — Spaced repetition, badges, streaks, reminders
6. **Contributing** — How to add words, fix bugs, submit PRs
7. **API Reference** — Data model, storage structure, functions

## Updating the Documentation

To update the documentation:

1. Edit files in this branch (`index.html`, `css/style.css`, `js/script.js`)
2. Test locally: Open `index.html` in a browser
3. Commit changes: `git commit -m "Update docs: [description]"`
4. Push to this branch: `git push origin docs`
5. GitHub Pages auto-publishes (takes ~30 seconds)

## Local Testing

To preview the site locally:

```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use a local server (Python 3)
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

## Branch Purpose

- ✅ **Developer onboarding** — New contributors understand the architecture
- ✅ **Project documentation** — Comprehensive setup and code reference
- ✅ **Technical showcase** — Demonstrate extension architecture
- ❌ **NOT** for user documentation or marketing
- ❌ **NOT** for word lists or user tutorials

## Relationship to Main Branch

- **Main branch** (`main`) — Project source code (extension files)
- **Docs branch** (`docs`) — Website files only (lightweight, separate)
- Both branches are published independently
- Changes to main don't affect docs, and vice versa

## Feedback & Issues

If you find errors or have suggestions for the documentation, please open an issue in the main repository: https://github.com/zozimustechnologies/vocabbuilder/issues
