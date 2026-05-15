---
name: vietnamese-labels
description: Use when adding UI text, error messages, toasts, or modal labels. All user-facing strings must be Vietnamese. Enum keys stay English.
---

# Vietnamese labels

## Rule

- **Enum keys / IDs / class names / status values**: English (`doing`, `done`, `high`).
- **Anything the user sees**: Vietnamese.

## Canonical translations

| Concept | Vietnamese |
|---|---|
| Project | Dự án |
| Task | Công việc |
| Member | Thành viên |
| Leader | Phụ trách / Leader |
| Assignee | Người thực hiện |
| Status | Trạng thái |
| Priority | Ưu tiên |
| Budget | Ngân sách |
| Progress | Tiến độ |
| Deadline / Due | Hạn / Ngày hết hạn |
| Start date | Ngày bắt đầu |
| End date | Ngày kết thúc |
| Description | Mô tả |
| Tags | Tags (kept English in UI) |
| Overdue | Quá hạn |
| Upcoming | Sắp đến hạn |
| Dashboard | Tổng quan |
| Calendar | Lịch |
| Activity | Hoạt động |
| Save | Lưu |
| Cancel | Hủy |
| Delete | Xóa |
| Edit | Sửa / ✎ |
| Create | Tạo |
| Add | Thêm |

## Status labels (from `js/app.js:2`)

```js
labels = {
  planning: 'Lên kế hoạch',
  todo:     'Cần làm',
  doing:    'Đang thực hiện',
  review:   'Đang xem xét',
  done:     'Hoàn thành',
  high:     'Cao',
  medium:   'Trung bình',
  low:      'Thấp'
}
```

When adding a status, add BOTH the enum key (in code) AND a Vietnamese label here.

## Tone

- Formal but friendly. Avoid "bạn" / "anh chị" in UI chrome.
- Toast messages start with verb past tense + object: `Đã tạo dự án`, `Đã xóa công việc`, `Đã cập nhật thành viên`.
- Empty states: full sentence, encouraging. Example: `Chưa có dự án — bấm + Tạo dự án để bắt đầu.`

## Numbers / dates

- Currency: `money()` helper uses `vi-VN` locale + ` đ` suffix. Always.
- Compact: `compact()` produces `tr` (million), `tỷ` (billion). Vietnamese units only.
- Dates: `fdate()` uses `toLocaleDateString('vi-VN')` → `dd/mm/yyyy`.

## Do not

- Mix English UI strings in. `"Save"` button = wrong.
- Translate enum keys (`hoanthanh` instead of `done`) — breaks logic.
- Use Google Translate-grade phrasing. Read existing toast messages and match register.
