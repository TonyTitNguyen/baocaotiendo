# Báo cáo tiến độ - Hoàng Diệu Linh — Beauty Cloud Only

Bản này đã chỉnh theo yêu cầu:

- Bỏ lưu dữ liệu dự án/công việc bằng browser storage.
- Ẩn mục `Cloud Sync` khỏi sidebar.
- Dữ liệu được lưu online qua Google Sheet.
- Giao diện giữ concept bệnh viện thẩm mỹ: hồng, tươi, premium.

## Cấu hình Google Sheet

Mở file:

```text
js/config.js
```

Sửa 2 dòng:

```js
scriptUrl: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
token: "PASTE_SYNC_KEY_HERE",
```

Trong đó:

- `scriptUrl`: Web App URL sau khi deploy Google Apps Script.
- `token`: SECRET trùng với dòng `const SECRET = "...";` trong `apps-script/Code.gs`.

## Cách hoạt động

- Khi mở web, web tự tải dữ liệu từ Google Sheet.
- Khi tạo/sửa/xóa dự án hoặc công việc, web tự đẩy dữ liệu mới lên Google Sheet.
- Nếu chưa cấu hình `js/config.js`, web chỉ hiện dữ liệu mẫu tạm thời và không lưu sau khi reload.

## Lưu ý bảo mật

Nếu repo GitHub Pages là public, người khác có thể xem `js/config.js`.
Nếu dữ liệu nội bộ quan trọng, nên để repo private hoặc nâng cấp sang backend có đăng nhập.


## Ghi chú kỹ thuật

Bản này dùng JSONP để tải dữ liệu từ Google Sheet và gửi dữ liệu bằng POST `no-cors`, phù hợp cho GitHub Pages static site.


## Bản fixed clean premium

- Đã bỏ các nút Nhập JSON / Xuất JSON khỏi giao diện.
- Đã ẩn Cloud Sync khỏi menu.
- Đã sửa lỗi JavaScript khiến không bấm được nút sau khi ẩn các nút thừa.
- Web vẫn dùng được khi chưa cấu hình Google Sheet; lúc đó dữ liệu chỉ là tạm trong phiên đang mở.
- Sau khi cấu hình `js/config.js`, dữ liệu sẽ sync lên Google Sheet.


## Bản ultra smooth

- Làm lại phần nhìn để sang và mượt hơn.
- Tối ưu lại card Tổng quan.
- Biểu đồ Phân bổ công việc đã đổi sang layout thanh ngang dày hơn để tránh nhiều khoảng trắng.


## Bản Korean Clinic

- Đổi giao diện sang phong cách bệnh viện thẩm mỹ Hàn Quốc.
- Tông màu: trắng sạch, hồng phấn, blush, mint nhạt.
- Card, modal, button và dashboard mềm mại hơn, ít cảm giác nặng/đậm.
- Giữ nguyên logic GitHub Pages + Google Sheet.


## Kangnam update

- Đổi toàn bộ branding sang `Thẩm mỹ Kangnam`.
- Logo text đổi từ `HL` sang `KN`.
- Phần Lịch đã có nút `×` để xóa lịch/deadline của công việc.
- Khi bấm `×`, công việc vẫn còn trong danh sách Công việc, chỉ xóa ngày hiển thị trên Lịch.


## Calendar update

- Phần Lịch chỉ hiển thị deadline của công việc.
- Không có nút xóa riêng trong Lịch.
- Muốn đổi hoặc bỏ ngày trên Lịch, vào mục Công việc và sửa trường `Ngày hết hạn`.


## Dashboard update

- Trong mục Tổng quan, đã đẩy:
  - `Công việc quá hạn`
  - `Sắp đến hạn 7 ngày`
  lên phía trên cụm:
  - `Phân bổ công việc`
  - `Tiến độ dự án`

- Cả 4 khối trên đều đã có thanh cuộn (`scroll`) để dùng tốt khi sau này có nhiều dự án / công việc.


## Dashboard luxury refinement

- Đã bỏ toàn bộ chữ `Có thanh cuộn`.
- Thêm số lượng ngay trên tiêu đề:
  - Công việc quá hạn
  - Sắp đến hạn 7 ngày
  - Phân bổ công việc
  - Tiến độ dự án
- Làm scroll sang hơn, mượt hơn.
- Giữ chiều cao 4 card overview đều hơn để tổng quan gọn và đẹp.


## WOW Signature pass

- Tinh chỉnh toàn bộ giao diện lên bản premium hơn.
- Sidebar, hero, stats, card, bảng, kanban, modal, calendar đều được làm sang hơn.
- Scrollbar, hover, shadow, chip, badge, spacing và typography đều được nâng cấp để tạo cảm giác “signature / world-class”.


## Final boss calendar

- Phần Lịch đã được làm lại để xử lý tốt trường hợp nhiều deadline trong 1 ngày.
- Mỗi ngày có:
  - badge số lượng deadline
  - danh sách preview có scroll
  - click vào ngày để mở modal xem toàn bộ deadline
- Trong modal chi tiết ngày có:
  - tên công việc
  - dự án
  - người thực hiện
  - trạng thái
  - ưu tiên
  - mô tả (nếu có)


## Super final

- Nâng cấp thêm trang Dự án và Công việc với banner KPI sang hơn.
- Bảng dữ liệu được làm premium hơn, hàng dữ liệu nổi khối hơn.
- Modal tạo dự án / công việc / thành viên được tinh chỉnh lại để nhìn cao cấp hơn.
- Empty state và action buttons được làm đẹp hơn.


## Showcase edition

- Tinh chỉnh thêm logo / brand area để sang hơn.
- Nâng cấp trang Kanban với banner KPI riêng và card nhìn cao cấp hơn.
- Thêm micro-animation tinh tế cho page, button và card.
- Tối ưu toàn bộ cảm giác trình diễn theo hướng showcase / wow.


## Ultimate final

- Tinh chỉnh typography hierarchy để nhìn cao cấp hơn.
- Chuẩn hóa lại badge/status/priority theo hệ màu mềm hơn.
- Tối ưu mobile view.
- Thêm focus state, hover state, press state và micro-animation tinh tế hơn.
- Polish form modal, table, kanban, calendar và empty state.


## Sidebar fixed

- Sửa lỗi sidebar bị tràn/che phần dưới khi màn hình thấp hoặc mở menu mobile.
- Sidebar giờ có thể cuộn dọc nếu nội dung dài.
- Thu gọn card `Signature Edition` và profile trên màn hình thấp để không bị vỡ layout.


## Clean no-notes patch

- Đã bỏ các note/marketing text thừa:
  - Korean Luxury Clinic
  - Elegant · Premium · Signature
  - hero description
  - hero signature chips
  - brand/profile/sidebar extra notes
  - modal subtitles
  - helper text ở Calendar
