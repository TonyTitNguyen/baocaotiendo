window.CLOUD_CONFIG = {
  enabled: true,

  // Cloud-only mode:
  // Paste your Apps Script Web App URL here.
  // Example: "https://script.google.com/macros/s/AKfycbx.../exec"
  scriptUrl: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",

  // Paste the same SECRET value you set in apps-script/Code.gs.
  // Warning: if your GitHub repository is public, this file is also public.
  token: "PASTE_SYNC_KEY_HERE",

  autoSync: true,
  syncDebounceMs: 700
};
