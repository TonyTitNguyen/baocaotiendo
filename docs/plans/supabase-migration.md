# Migrate Cloud Sync from Google Sheet to Supabase

## Summary
- Replace the current Apps Script + Google Sheet whole-document sync with Supabase Postgres + Supabase Auth.
- Keep the frontend as a static GitHub Pages site, keep the current in-memory `data` shape in the UI, and keep the app as plain script-tag JavaScript with no build step.
- Use one shared workspace for all signed-in staff, with auto-save on each mutation and fresh data loaded on page open.

## Interfaces
- Replace `window.CLOUD_CONFIG` from:
  - `scriptUrl`, `token`
- With:
  - `provider: "supabase"`
  - `supabaseUrl`
  - `supabaseAnonKey`
  - `requireLogin: true`
  - `autoSync: true`
  - `syncDebounceMs`
- Keep the frontend runtime shape as:
  - `{ members, projects, tasks, activities }`
- Add Supabase tables mirroring the current shape:
  - `members(id, name, role, created_at, updated_at)`
  - `projects(id, code, name, description, status, priority, budget, leader_id, start_date, end_date, progress, created_at, updated_at)`
  - `tasks(id, code, title, description, project_id, assignee_id, status, priority, start_date, due_date, tags, created_at, updated_at)`
  - `activities(id, text, time, created_at)`
- Add backend helpers where concurrency matters:
  - `create_project(...)` generates unique `DA###` codes from a database sequence
  - `create_task(...)` generates unique `CV###` codes from a database sequence
  - `delete_member_and_reassign(old_member_id, new_member_id)` reassigns tasks/projects, then deletes the member atomically

## Implementation Changes
- Remove Google Sheet-specific transport and UI behavior:
  - delete JSONP read flow
  - delete `fetch(..., { mode: "no-cors" })` write flow
  - replace all “Google Sheet” status/toast copy with “Supabase”
- Add a small Supabase REST client using plain `fetch` only:
  - auth endpoints for sign-in, token refresh, sign-out
  - PostgREST endpoints for table reads and CRUD
  - no npm, no bundler, no framework, no module migration
- Add auth gating:
  - show a login screen before the dashboard
  - store `access_token` and `refresh_token` in `localStorage`
  - restore or refresh session on boot
  - add a sign-out action in the app shell
  - disable public sign-up; users are created manually in Supabase Dashboard
- Keep the current local render model:
  - load all tables into `data` after login
  - keep `render()` and most UI logic working from the local `data` object
  - make entity handlers async and server-backed instead of whole-state sync
- Mutation flow:
  - project/task/member create/update/delete call Supabase directly
  - task mutations still run the existing project progress/status recalculation logic, then persist the affected project row
  - each successful mutation inserts one Vietnamese activity row
  - if activity insert fails but the main mutation succeeds, keep the data change and log the activity failure without rolling back
- Database constraints and policies:
  - authenticated users can read/write all four tables
  - no anonymous table access
  - foreign keys:
    - `projects.leader_id -> members.id`
    - `tasks.project_id -> projects.id ON DELETE CASCADE`
    - `tasks.assignee_id -> members.id`
  - checks for status, priority, and `progress` range to match the current app contract

## Migration and Cutover
- Export the current live dataset once from the existing Google Sheet-backed app into JSON.
- Create `supabase/schema.sql` for tables, sequences, constraints, RLS, and RPC helpers.
- Create a one-off import utility that loads the exported JSON into Supabase in this order:
  - members
  - projects
  - tasks
  - activities
- Verify:
  - row counts match the source
  - all foreign keys resolve
  - project/task codes are preserved for imported rows
  - dashboard renders correctly after login
- After verification, switch `js/config.js` to Supabase config and stop using the Apps Script endpoint.
- Leave `apps-script/Code.gs` untouched for the first pass, but remove it from active setup docs and mark it deprecated.

## Test Plan
- Auth:
  - signed-out users cannot see dashboard data
  - invalid login shows a Vietnamese error
  - valid login loads data
  - reload restores session
  - sign-out clears session and returns to login
- CRUD:
  - create/edit/delete project
  - create/edit/delete task
  - create member
  - delete member with reassignment
  - delete project cascades tasks
- Behavior parity:
  - task edits still update project progress/status the same way as today
  - activity timeline still records Vietnamese messages
  - empty states still render when tables are empty
- Regression:
  - no JSONP requests remain
  - no Google Sheet or Apps Script URL/token remain in active runtime
  - app still works as a static GitHub Pages site with plain script tags only

---

## UI/UX thay đổi kèm theo migration

### Vấn đề cần giải quyết
| Vấn đề | Nguyên nhân | Fix |
|---|---|---|
| Text "Google Sheet" flash khi load | Hardcoded trong HTML trước khi JS chạy | Đổi default → "Đang kết nối..." |
| Seed data hiện 1-3s trước khi Supabase load | Không có loading state khi pull async | Loading overlay phủ UI trong thời gian pull |
| Sync pill không animate khi đang lưu | CSS `.saving` chưa có | Thêm pulse animation cho dot |

### Đã implement

**`index.html`:**
- `#syncText` default: `"Google Sheet"` → `"Đang kết nối..."`
- `#cloudMini` default: `"Google Sheet"` → `"Đang kết nối..."`
- Thêm `#loadOverlay` — full-screen cover với spinner, ẩn sau pull xong hoặc timeout 10s

**`css/components.css` (thêm cuối file):**
- `.sync.saving i` — pulse animation (rose color, blink) khi đang sync
- `#loadOverlay` — `position:fixed`, `backdrop-filter:blur`, centered spinner + text
- `.load-spinner` — CSS border-radius spinner, `animation:spin .85s linear infinite`

**`js/app.js`:**
- `cloudStatus()` → thêm remove/add `.saving` class trên pill
- DOMContentLoaded init — thay `pullCloud(true)` bằng overlay-aware pull:
  - show overlay → `cloudStatus('saving')` → `Store.pull()` → hide overlay → `render()`
  - timeout 10s auto-hide overlay nếu pull treo
  - `.catch` cũng hide overlay (không trap user trong loading state)

### Không thay đổi
- Tất cả render functions (`stat`, `chart`, `kanban`, `members`, etc.)
- Vietnamese labels và toast messages
- Form modals và CRUD flow
- CSS design system (colors, animations, layout)

---

## Assumptions
- The app remains one shared dashboard for all authenticated staff.
- v1 auth uses email/password, and user accounts are provisioned manually in Supabase rather than through public self-sign-up.
- The repo/site may remain public; only the Supabase URL and anon key are exposed in the frontend, and all real protection comes from Auth + RLS.
- `js/seed.js` stays as local demo/fallback data and is not part of the production sync path.
- Real-time subscriptions are out of scope for this migration; fresh load on page open plus save-on-mutation is the target behavior.
