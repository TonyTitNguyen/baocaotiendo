# baocaotiendo — Báo cáo tiến độ Thẩm mỹ Kangnam

Vietnamese progress dashboard for Kangnam beauty clinic. Static site, GitHub Pages.

<!-- Last updated: 2026-05-15 -->

## What this dir is

Single-page vanilla JS dashboard. No framework, no build step, no npm. Backend = Google Apps Script + one Google Sheet cell as JSON blob.

## Stack

- **Frontend**: `index.html` + `css/{base,layout,components,responsive}.css` + `js/{seed,config,storage,app}.js`. Script load order matters — see `index.html:96-97`.
- **Backend**: `apps-script/Code.gs` deployed as Web App.
- **Transport**: JSONP GET for read, `fetch` no-cors POST for write (chosen to bypass CORS on static hosting).
- **Persistence**: Google Sheet, sheet name `DATA`, cell `B2` stores the whole app state as a JSON string.

## Data shape (window.SEED_DATA / cloud state)

```
{ members:[{id,name,role}], projects:[{id,code,name,...,leaderId,progress}],
  tasks:[{id,code,title,projectId,assigneeId,status,priority,start,due,tags[]}],
  activities:[{id,text,time}] }
```

Status enums: `planning|todo|doing|review|done`. Priority: `low|medium|high`. UI labels in `js/app.js:2` (`labels` map) — Vietnamese.

## Active focus

UI polish iteration cycle complete (README changelog tracks waves: WOW Signature → Showcase → Ultimate final → Clean no-notes patch). Current state = stable. No open feature initiative recorded in repo.

## Local constraints

- **No build tools.** Do not introduce webpack/vite/npm/bundlers. Plain script tags only.
- **No frameworks.** Do not migrate to React/Vue. App is intentionally one `js/app.js` file.
- **Language = Vietnamese.** All user-facing strings, labels, toasts in Vietnamese. Status enum *keys* stay English; only display labels translate.
- **Single-cell storage.** Whole state JSON-serialized into `B2`. Do not normalize across rows — Apps Script code assumes one row.
- **JSONP / no-cors required.** Apps Script Web App responses are not CORS-friendly; do not "fix" to `fetch` GET — it will break.
- **Date format**: ISO `YYYY-MM-DD` in storage, `vi-VN` locale for display.
- **HTML escape**: use `clean()` helper at `js/app.js:4` for any user-input rendering. Do not template-inject raw strings.

## Security note

`js/config.js` ships real `scriptUrl` + `token` in source. Public repo = leaked write access to the sheet. Before changes that touch config: confirm repo visibility with user. Do not commit new tokens.

## Conventions

- IDs generated via `id()` helper at `js/app.js:5` — `prefix + base36(timestamp+rand)`.
- Codes (`DA001`, `CV001`) via `code()` helper, auto-incrementing.
- Save pipeline: `persist(msg)` → `Store.save` (noop) + `render()` + `debouncedPush()` cloud sync.
- DOM helpers `$` and `$$` defined at top of `app.js`. Use them.

## Commands

- Local preview: open `index.html` directly or `python3 -m http.server 8000`.
- Deploy: push to `main`, GitHub Pages serves root.
- Apps Script: edit in script.google.com → re-deploy as new version when `Code.gs` changes.

## Files NOT to touch without asking

- `apps-script/Code.gs` — backend contract. Breaking change requires Apps Script re-deploy by user.
- `js/seed.js` — production fallback data; rewriting wipes demo state.
- `js/config.js` — contains secrets.
