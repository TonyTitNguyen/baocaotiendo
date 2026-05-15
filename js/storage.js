const Store = {
  load() {
    return structuredClone(window.SEED_DATA);
  },

  save(data) {
    // Browser persistence disabled. Data is pushed online by pushCloud().
  },

  export(data) {
    const b = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = "bao-cao-tien-do-hoang-dieu-linh.json";
    a.click();
    URL.revokeObjectURL(u);
  },

  cloud() {
    return { ...(window.CLOUD_CONFIG || {}) };
  },

  saveCloud(config) {
    // Disabled. Edit js/config.js instead.
  },

  clearCloud() {
    // Disabled. Edit js/config.js instead.
  }
};
