# Tiến độ: Chuyển đổi Google Sheets → Supabase

<!-- Last updated: 2026-05-15 -->

## Trạng thái tổng: 🟡 Phase 1 còn lại (cần làm tay)

---

## Phase 1 — Supabase Setup (ngoài code) ← BẠN CẦN LÀM

- [ ] Tạo project Supabase mới tại supabase.com
- [ ] Vào SQL Editor → chạy toàn bộ file `docs/schema.sql`
- [ ] Copy `Project URL` từ Settings → API → dán vào `js/config.js` thay `PASTE_SUPABASE_URL`
- [ ] Copy `anon public key` từ Settings → API → dán vào `js/config.js` thay `PASTE_SUPABASE_ANON_KEY`
- [ ] Export data hiện tại từ app (nút Export JSON trong UI)
- [ ] Seed data: mở browser console, chạy script seed ở cuối `docs/schema.sql`

## Phase 2 — Frontend code ✅ XONG

- [x] `index.html:96` — thêm `<script src="cdn.jsdelivr.net/supabase-js@2/umd/supabase.js">`
- [x] `js/config.js` — thay `scriptUrl`/`token` → `supabaseUrl`/`supabaseKey` (placeholder)
- [x] `js/storage.js` — viết lại: `_sb` client, `Store.pull()`, `Store.push()`, xóa `Store.cloud()`
- [x] `js/app.js:3` — xóa biến `cloud`
- [x] `js/app.js:95` — `cloudOK()` đọc `window.CLOUD_CONFIG.supabaseUrl`
- [x] `js/app.js:95` — `cloudStatus()` text đổi sang "Supabase" + `.saving` class
- [x] `js/app.js` — xóa `jsonpRequest` (14 dòng)
- [x] `js/app.js:96` — `pushCloud()` dùng `Store.push(data)`
- [x] `js/app.js:97` — `pullCloud()` dùng `Store.pull()`
- [x] `js/app.js:98` — `debouncedPush()` đọc `window.CLOUD_CONFIG.syncDebounceMs`
- [x] `js/app.js` — xóa `saveCloud()`
- [x] `js/app.js:100` — DOMContentLoaded: overlay-aware init pull (timeout 10s)

## Phase 2b — UI/UX ✅ XONG

- [x] `index.html` — `#syncText` default → "Đang kết nối..."
- [x] `index.html` — `#cloudMini` default → "Đang kết nối..."
- [x] `index.html` — thêm `#loadOverlay` div (spinner + text "Đang tải dữ liệu...")
- [x] `css/components.css` — `.sync.saving i` pulse animation
- [x] `css/components.css` — `#loadOverlay` + `.load-spinner` + `@keyframes spin`
- [x] `js/app.js` — `cloudStatus()` add/remove `.saving` class on pill

## Phase 3 — Cleanup Apps Script

- [ ] Archive hoặc xóa `apps-script/Code.gs`
- [ ] Archive hoặc xóa `GOOGLE_SHEETS_SETUP.md`
- [ ] Cập nhật `README.md` — ghi backend đổi sang Supabase
- [ ] Cập nhật `.claude/CLAUDE.md` — sửa stack/transport section

## Phase 4 — Kiểm tra (sau khi điền credentials)

- [ ] Mở `index.html` local → data load từ Supabase (không phải seed)
- [ ] Tạo project mới → kiểm tra Supabase Dashboard → Table Editor có row mới
- [ ] Tạo task → kiểm tra FK `project_id` đúng
- [ ] Xóa project → task cascade xóa theo (check Table Editor)
- [ ] Mở 2 tab — tab 1 sửa → tab 2 pull → data đồng bộ
- [ ] Mất mạng → app vẫn chạy trên in-memory seed (không crash)

---

## Ghi chú tiến độ

| Ngày | Phase | Ghi chú |
|---|---|---|
| 2026-05-15 | 1 | Lập kế hoạch |
| 2026-05-15 | 2 | Code xong — chờ credentials |
