---
name: "source-command-check-secrets"
description: "Audit for leaked secrets before commit/push"
---

# source-command-check-secrets

Use this skill when the user asks to run the migrated source command `check-secrets`.

## Command Template

Verify `js/config.js` does not contain real production credentials before allowing a commit/push to a public repo.

Checks:
1. Read `js/config.js`. Confirm `scriptUrl` is the placeholder `PASTE_APPS_SCRIPT_WEB_APP_URL_HERE` (or empty) AND `token` is the placeholder `PASTE_SYNC_KEY_HERE` (or empty).
2. Run `git remote -v` and `gh repo view --json visibility 2>/dev/null` to determine if repo is public.
3. If repo is public AND real secrets are present → BLOCK, output:
   ```
   CRITICAL: secrets in js/config.js leak to public repo.
   - scriptUrl: <masked>
   - token: <masked>
   Action: rotate the Apps Script SECRET in apps-script/Code.gs AND replace js/config.js values with placeholders before commit.
   ```
4. Run `grep -rn "AKfycb\|kangnam-progress\|linh-beauty" -- . ':!.git'` to catch leaked values elsewhere.
5. Report `PASS` if clean.
