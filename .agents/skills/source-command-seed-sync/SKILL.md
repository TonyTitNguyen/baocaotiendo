---
name: "source-command-seed-sync"
description: "Re-format and validate js/seed.js demo data"
---

# source-command-seed-sync

Use this skill when the user asks to run the migrated source command `seed-sync`.

## Command Template

`js/seed.js` is the fallback data when cloud config is missing. It is one minified line. Use this command to:

1. Read `js/seed.js`.
2. Pretty-print `window.SEED_DATA` to verify structure (members/projects/tasks/activities).
3. Check referential integrity:
   - Every `task.projectId` exists in `projects[].id`.
   - Every `task.assigneeId` and `project.leaderId` exists in `members[].id`.
   - Status values ∈ `{planning, todo, doing, review, done}`.
   - Priority values ∈ `{low, medium, high}`.
   - Date strings ISO `YYYY-MM-DD`.
4. If user asks to add/edit seed entries, edit minified form in place — keep single-line.
5. Report violations as `[file:line]` findings.
