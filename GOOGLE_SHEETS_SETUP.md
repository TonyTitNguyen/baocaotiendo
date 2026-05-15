# Google Sheet Setup

## 1. Tạo Google Sheet

Tạo Google Sheet mới, ví dụ:

```text
Bao cao tien do Hoang Dieu Linh
```

## 2. Mở Apps Script

Trong Google Sheet:

```text
Extensions → Apps Script
```

Copy nội dung file:

```text
apps-script/Code.gs
```

dán vào Apps Script.

## 3. Đổi SECRET

Trong `Code.gs`, đổi dòng:

```js
const SECRET = "DOI_SYNC_KEY_RIENG_CUA_BAN";
```

thành key riêng của bạn, ví dụ:

```js
const SECRET = "linh-beauty-2026-private-key";
```

## 4. Deploy Web App

Trong Apps Script:

```text
Deploy → New deployment → Web app
```

Chọn:

```text
Execute as: Me
Who has access: Anyone
```

Copy `Web App URL`.

## 5. Cấu hình website

Mở:

```text
js/config.js
```

Dán:

```js
scriptUrl: "WEB_APP_URL_CUA_BAN",
token: "SECRET_CUA_BAN",
```

## 6. Deploy GitHub Pages

Upload toàn bộ thư mục lên GitHub Pages.

Nếu cấu hình đúng, góc trên phải sẽ hiện:

```text
Google Sheet
```
