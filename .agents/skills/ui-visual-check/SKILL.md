---
name: ui-visual-check
description: Use after any change to css/* or DOM structure in index.html / render functions. No automated tests exist — run a manual visual smoke pass via local server.
---

# UI visual check

This project has no test suite. Visual regression is human-eyeballed. After UI work, run this smoke pass.

## Smoke pass (5 min)

1. **Start server.**
   ```
   python3 -m http.server 8000
   open http://localhost:8000
   ```

2. **Sync pill state** (top right). Should read "Google Sheet" green if `js/config.js` configured. Red OK if local-only test.

3. **Walk every page** — sidebar buttons in order:
   - Tổng quan: stats cards, ring chart, overdue/soon lists, workload bars, project progress.
   - Dự án: table, banner KPI, search, status filter, + Tạo dự án modal.
   - Kanban: 4 columns with cards, search + project filter.
   - Công việc: table, banner KPI, all filters.
   - Lịch: 14-day grid, click a day with deadlines → day modal opens.
   - Thành viên: cards grid, + Thêm thành viên modal, ⌫ delete.
   - Hoạt động: timeline list.

4. **Modals**: open + close each via × button and click-outside backdrop.

5. **Quick add**: top-right `+ Tạo nhanh` → currently routes to project modal.

6. **CRUD round-trip**:
   - Create a project. Verify it shows in table + dashboard count.
   - Create a task under it. Verify Kanban column populated.
   - Edit task → change status to `done`. Verify dashboard `Công việc hoàn thành` counter ticks up.
   - Delete task. Confirm gone everywhere.

7. **Cloud sync** (if configured): reload page. Data should persist.

## Responsive check

- Resize browser to 360px wide. Sidebar should collapse to hamburger.
- Tap hamburger (`#hamb`) → sidebar slides in.
- Tables should scroll horizontally on narrow.

## Console must be clean

No errors. Warnings about missing IDs / dangling refs = bug.

## When you can't run UI

If you have no browser access, say so explicitly. Do not claim a UI change works without verification. Example:
> "Edited css/components.css to add hover state. Cannot verify visually in this environment — please run smoke pass."
