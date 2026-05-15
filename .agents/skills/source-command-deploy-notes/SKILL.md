---
name: "source-command-deploy-notes"
description: "Print deploy instructions for GitHub Pages + Apps Script"
---

# source-command-deploy-notes

Use this skill when the user asks to run the migrated source command `deploy-notes`.

## Command Template

Print the deployment checklist. This project has TWO deploys: frontend (GitHub Pages) + backend (Apps Script).

Output:

```
=== Frontend (GitHub Pages) ===
1. Verify js/config.js values are correct for target environment.
2. git add -A && git commit -m "<msg>" && git push origin main
3. GitHub Pages auto-publishes from main branch root.
4. Hard refresh browser (Cmd+Shift+R) to bypass cache.

=== Backend (Apps Script) — only if Code.gs changed ===
1. Open https://script.google.com — pick the project bound to the sheet.
2. Paste new contents of apps-script/Code.gs.
3. SECRET in Code.gs must match token in js/config.js.
4. Deploy → Manage deployments → Edit → New version → Deploy.
5. The Web App URL stays the same across versions (do not change scriptUrl in config.js).

=== Verify ===
- Open dashboard; top-right sync pill should read "Google Sheet" (green).
- Create a project; reload — it should persist.
- If pill stays red/loading: token mismatch OR scriptUrl wrong OR sheet permissions broken.
```

Do not run the deploy yourself — user must approve each step.
