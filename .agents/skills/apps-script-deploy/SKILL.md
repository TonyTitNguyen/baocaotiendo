---
name: apps-script-deploy
description: Use when editing apps-script/Code.gs or troubleshooting the sync pill / Google Sheet connection. Walkthrough for re-deploying the Web App and verifying.
---

# Apps Script deploy

The Google Apps Script Web App is the backend. Editing `apps-script/Code.gs` in this repo does NOT auto-deploy — the user must paste into script.google.com.

## When to redeploy

- `Code.gs` changed in any way (logic, SECRET, sheet name).
- `SECRET` rotated for security.
- Sheet renamed or moved.

## Steps (read to user — do not execute)

```
1. Open https://script.google.com — pick project bound to the data sheet.
2. Replace contents with current apps-script/Code.gs.
3. If SECRET changed: also update token in js/config.js to match.
4. Deploy → Manage deployments → pencil icon on existing → Version: New version → Deploy.
5. Web App URL stays the same. Do NOT change scriptUrl in js/config.js unless deploy URL actually changed (new deployment, not new version).
```

## SECRET rotation flow

```
1. Pick new SECRET (e.g., `kangnam-progress-2026-rotated-<random>`).
2. apps-script/Code.gs line 2: const SECRET = "<new>";
3. Deploy new version (above).
4. js/config.js line 11: token: "<new>",
5. Hard refresh dashboard. Sync pill should re-connect.
6. If pill red: cache. Wait 30s, refresh again. Apps Script propagation delay.
```

## Common breakage

| Symptom | Cause | Fix |
|---|---|---|
| Sync pill stuck "Đang tải" | Wrong scriptUrl or CORS issue | Verify scriptUrl matches deployed Web App URL exactly. |
| Sync pill red `unauthorized` | token ≠ SECRET | Match `js/config.js` token to `Code.gs` SECRET. |
| Data not saving | "Who has access" not Anyone | Re-deploy with access: Anyone. |
| `invalid_json` | POST body malformed | Frontend bug; check `pushCloud()` in `js/app.js`. |
| Reload loses data | Sheet not bound or wrong tab name | Sheet name must be `DATA` (see `SHEET_NAME` in Code.gs). |

## Backend contract — do not break

- `doGet({ token, callback })` → JSONP `{ ok, data, updatedAt }` or `{ ok:false, error }`.
- `doPost(body={ token, data })` → JSON `{ ok, updatedAt }` or `{ ok:false, error }`.
- Storage cell: `B2` of sheet `DATA`. Column `C2` = `updatedAt`.

Frontend assumes this contract. Changing response shape requires updating `pullCloud` / `pushCloud` in `js/app.js`.
