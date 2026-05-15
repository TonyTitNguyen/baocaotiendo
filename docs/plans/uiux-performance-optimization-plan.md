# UI/UX and Performance Optimization Plan

Updated: 2026-05-15

## Summary

- Re-orient the app from "showcase dashboard" to "operator dashboard": faster scanning, fewer decorative layers, quicker actions.
- Optimize for a shared internal team and a few hundred tasks, not for marketing-style visual impact.
- Tackle this in two linked tracks: data/render performance first, then visual simplification and workflow UX.

## Key Changes

- Replace the current full-app rerender in `js/app.js` with page-scoped rendering.
  - `setPage()` only toggles visibility and renders the active page if needed.
  - Data mutations re-render only affected areas instead of calling one global `render()`.
  - Hidden pages are not rebuilt on every save.
- Add derived indexes once per state update instead of repeated lookup work inside templates.
  - `membersById`, `projectsById`
  - grouped task counts by assignee, project, status, and due date
  - precomputed overdue/soon lists for dashboard and task page
- Change the storage contract in `js/storage.js`.
  - stop `upsert()`-ing the full `members/projects/tasks/activities` arrays on every save
  - move to row-level CRUD methods such as `saveProject`, `saveTask`, `deleteTask`, `saveMember`, `appendActivity`
  - keep `pull()` for initial load, but write only changed rows afterward
- Reduce expensive UI effects in `css/components.css`.
  - cut most `backdrop-filter` usage on cards, toolbar, sidebar, and modal overlays
  - reduce hover lift/shadow intensity and remove non-essential continuous animations
  - keep one branded background treatment, but remove stacked glass/blur effects from high-density screens
- Simplify the information architecture.
  - shrink the hero into a compact summary strip
  - make overdue, upcoming, and quick actions the first visual priority
  - reduce banner and decorative copy on Projects, Tasks, and Kanban
  - treat Kanban as secondary; optimize the Tasks table as the main working surface
- Improve task speed for staff.
  - add quick filters like `Qua han`, `7 ngay toi`, `Dang lam`, `Cua toi`
  - persist active filters/search in memory during navigation
  - make create/edit flows require fewer clicks and stronger defaults
- Improve scalability for "hundreds of tasks".
  - paginate or chunk long task/activity lists
  - debounce text filters slightly
  - group calendar data once instead of filtering all tasks for each day cell
  - precompute member workload instead of filtering tasks/projects per member card

## Interfaces

- Replace the generic sync path:
  - from `persist() -> render() -> debouncedPush(full data)`
  - to `persist(entityChange) -> partial UI update -> debounced remote write for changed entity only`
- Replace broad storage methods with entity-level methods:
  - `pullAll()`
  - `saveProject(project)`
  - `saveTask(task)`
  - `deleteProject(id)`
  - `deleteTask(id)`
  - `saveMember(member)`
  - `deleteMemberAndReassign(oldId, newId)`
  - `appendActivity(activity)`
- Add a lightweight derived-state layer in `js/app.js`.
  - `buildViewModel(data)` returns lookup maps and grouped lists used by renderers
  - page renderers consume the view model instead of recomputing `.find()` and `.filter()` chains inside HTML builders

## Test Plan

- Performance checks with seeded data around:
  - 20-30 members
  - 40-60 projects
  - 300-500 tasks
  - 100+ activities
- Verify:
  - page switch does not rebuild unrelated screens
  - creating/editing one task updates only the task view, related dashboard counters, and the affected project progress
  - Supabase writes send only changed rows
  - typing in search/filter inputs stays responsive
  - mobile still works, but desktop remains the primary optimized layout
- UX review:
  - top actions are visible without scrolling
  - overdue work is identifiable in under 3 seconds
  - common flows like add task, edit status, and filter by project take fewer clicks than today

## Assumptions

- The dashboard is for internal staff, so operator efficiency is more important than "premium showcase" styling.
- The app stays vanilla JS with script tags only; no framework, build tool, or component library is introduced.
- The target scale is hundreds of tasks, so selective rendering and incremental sync are enough; full virtualization is not required in this pass.
- Brand feel stays pink/Kangnam, but visual polish must stop competing with readability and speed.
