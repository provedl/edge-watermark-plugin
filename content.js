(function () {
  const WATERMARK_ID = "__watermark_extension_container__";

  function createWatermark(text) {
    if (document.getElementById(WATERMARK_ID)) return;

    const container = document.createElement("div");
    container.id = WATERMARK_ID;
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 2147483647;
      overflow: hidden;
    `;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const cellWidth = 300;
    const cellHeight = 200;

    canvas.width = cellWidth * ratio;
    canvas.height = cellHeight * ratio;
    ctx.scale(ratio, ratio);
    ctx.rotate((-25 * Math.PI) / 180);
    ctx.font = "16px Microsoft YaHei, sans-serif";
    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cellWidth / 2, cellHeight / 2);

    container.style.backgroundImage = `url(${canvas.toDataURL()})`;
    container.style.backgroundRepeat = "repeat";

    document.documentElement.appendChild(container);
  }

  function removeWatermark() {
    const el = document.getElementById(WATERMARK_ID);
    if (el) el.remove();
  }

  function findMatchingRule(rules) {
    const hostname = window.location.hostname;
    for (const rule of rules) {
      const pattern = rule.site.replace(/^\*\./, "").toLowerCase();
      if (hostname === pattern || hostname.endsWith("." + pattern)) {
        return rule;
      }
    }
    return null;
  }

  function init() {
    chrome.storage.sync.get(["rules", "enabled"], (data) => {
      const enabled = data.enabled !== false;
      const rules = data.rules || [];

      if (!enabled || rules.length === 0) {
        removeWatermark();
        return;
      }

      const matched = findMatchingRule(rules);
      if (matched) {
        createWatermark(matched.text);
      } else {
        removeWatermark();
      }
    });
  }

  init();

  chrome.storage.onChanged.addListener(() => {
    removeWatermark();
    init();
  });
})();
