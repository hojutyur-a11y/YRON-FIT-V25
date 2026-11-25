# VYRON FIT V25 — Professional preparation (25.1.0)

Arabic-first fitness web application with a dark visual identity and green accents.

## Project files

- `index.html` — GitHub Pages entry point.
- `VYRON_FIT_V25.html` — preserved original V25 runtime; `index.html` is currently an exact copy.
- `src/modules/` — retained JavaScript module source files.
- `tests/header-stability/` — supplied Playwright tests for header/navigation stability.
- `reference/` — visual reference images.
- `CHANGES.md` — historical development notes supplied with V25.

**Architecture note:** the standalone HTML contains an embedded module/import-map runtime. Editing `src/modules/` does not automatically rebuild the embedded runtime in `index.html`. Do not assume source-module edits affect the deployed app until a verified build/synchronization workflow is implemented and tested.

## Local preview

Open `index.html` in a modern browser. For deployment-like testing, use a local static server because browser storage, service-worker behavior, and file-origin restrictions may differ under `file://`.

## Development checks

Requirements: Node.js 20+ and npm.

```bash
npm install
npx playwright install chromium
npm run check:project
npm run test:header
```

Optional stress run:

```bash
npm run test:header:stress
```

The header suite launches Chromium and checks header visibility, navigation transitions, reload behavior, and browser-local data preservation. It can take several minutes. Stress mode seeds synthetic records only in its isolated test browser.

## GitHub Pages deployment

1. Push the repository to GitHub.
2. Keep it private unless you intentionally want the source public.
3. Open **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Wait for deployment and open the generated site URL.

GitHub Pages serves static files; it does not provide a backend, user authentication service, or cloud database for this project.

## Data and privacy

The runtime uses browser-side persistence patterns, including local storage and IndexedDB. Treat this as device/browser-local data, not cloud synchronization. Clearing browser data, changing browsers/devices, or private browsing can affect persistence. Use the app's backup/export functions where available.

Never commit personal data exports, API keys, passwords, access tokens, or `.env` files.

## Release discipline

- Preserve `VYRON_FIT_V25.html` as the known-good baseline.
- Make changes on a separate Git branch.
- Review diffs before merging.
- Run project validation and browser regression tests after changes.
- Do not remove a feature or rewrite a module without a documented reason and a regression test.

## Scope and limitations

This preparation adds repository structure, documentation, static validation, and browser-test setup. It does **not** claim every fitness feature has been manually verified on Android, and it does not silently redesign application UI. A separate feature-by-feature functional audit is required before calling the app production-ready.

## PWA support (V25)

The GitHub Pages entry point (`index.html`) now includes a web app manifest, install icons, and a service worker. Serve the site over HTTPS (GitHub Pages does this) and open it in a supported browser. After the first successful online load, the app shell is cached for a basic offline reopen. Third-party resources (such as Google Fonts) may still require a network connection on first use. Browser-local user data remains on that device; the service worker does not synchronize data to the cloud.

PWA files: `manifest.webmanifest`, `service-worker.js`, `icon-192.png`, and `icon-512.png`. `index.html` and `VYRON_FIT_V25.html` are kept identical; GitHub Pages serves `index.html`.
