const SHEET_NAME = "DATA";
const SECRET = "DOI_SYNC_KEY_RIENG_CUA_BAN";

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["key", "json", "updatedAt"]);
    sheet.appendRow(["app_state", "{}", new Date()]);
  }

  return sheet;
}

function doGet(e) {
  const token = e.parameter.token;
  const callback = e.parameter.callback;

  if (token !== SECRET) {
    return output_({ ok: false, error: "unauthorized" }, callback);
  }

  const sheet = getSheet_();
  const raw = sheet.getRange("B2").getValue() || "{}";
  const updatedAt = sheet.getRange("C2").getValue();

  let data = {};
  try {
    data = JSON.parse(raw);
  } catch (error) {
    data = {};
  }

  return output_({
    ok: true,
    data,
    updatedAt
  }, callback);
}

function doPost(e) {
  let body = {};

  try {
    body = JSON.parse(e.postData.contents || "{}");
  } catch (error) {
    return output_({ ok: false, error: "invalid_json" });
  }

  if (body.token !== SECRET) {
    return output_({ ok: false, error: "unauthorized" });
  }

  const sheet = getSheet_();
  sheet.getRange("A2").setValue("app_state");
  sheet.getRange("B2").setValue(JSON.stringify(body.data || {}));
  sheet.getRange("C2").setValue(new Date());

  return output_({ ok: true, updatedAt: new Date().toISOString() });
}

function output_(payload, callback) {
  const text = callback
    ? callback + "(" + JSON.stringify(payload) + ")"
    : JSON.stringify(payload);

  return ContentService
    .createTextOutput(text)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
