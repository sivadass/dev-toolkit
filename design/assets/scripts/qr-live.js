(function () {
  var MAX_CONTENT_LENGTH = 2000;
  var MIN_SIZE = 128;
  var MAX_SIZE = 1024;
  var HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
  var DEBOUNCE_MS = 120;

  var QR = typeof QRCode !== "undefined" ? QRCode : null;
  if (QR && !QR.toDataURL && QR.default) QR = QR.default;

  var textEl = document.getElementById("qr-text");
  var sizeEl = document.getElementById("qr-size");
  var eccEl = document.getElementById("qr-ecc");
  var fgEl = document.getElementById("qr-fg");
  var bgEl = document.getElementById("qr-bg");
  var stageEl = document.querySelector("[data-qr-stage]");
  var placeholderEl = document.querySelector("[data-qr-placeholder]");
  var liveEl = document.querySelector("[data-qr-live]");
  var metaEl = document.querySelector("[data-qr-meta]");
  var pngBtn = document.querySelector("[data-qr-download-png]");
  var svgBtn = document.querySelector("[data-qr-download-svg]");
  var fgSwatch = document.querySelector("[data-qr-swatch-fg]");
  var bgSwatch = document.querySelector("[data-qr-swatch-bg]");
  var fgPicker = document.querySelector("[data-qr-picker-fg]");
  var bgPicker = document.querySelector("[data-qr-picker-bg]");

  if (!textEl || !stageEl || !placeholderEl || !liveEl || !QR || typeof QR.toDataURL !== "function") {
    return;
  }

  var debounceTimer = null;
  var latestPng = "";
  var latestSvg = "";
  var latestSize = 256;
  var requestId = 0;

  function clampSize(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return 256;
    return Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.round(n)));
  }

  function normalizeHex(value, fallback) {
    var trimmed = String(value || "").trim();
    return HEX_COLOR.test(trimmed) ? trimmed.toLowerCase() : fallback;
  }

  function isValidContent(content) {
    var text = content.trim();
    return text.length > 0 && text.length <= MAX_CONTENT_LENGTH;
  }

  function setActive(isActive) {
    stageEl.classList.toggle("is-dimmed", !isActive);
    stageEl.classList.toggle("is-ready", isActive);
    placeholderEl.hidden = isActive;
    liveEl.hidden = !isActive;
    if (metaEl) metaEl.hidden = !isActive;
    if (pngBtn) pngBtn.disabled = !isActive;
    if (svgBtn) svgBtn.disabled = !isActive;
    if (!isActive) {
      latestPng = "";
      latestSvg = "";
      liveEl.removeAttribute("src");
      liveEl.alt = "";
    }
  }

  function syncSwatches() {
    var fg = normalizeHex(fgEl && fgEl.value, "#222222");
    var bg = normalizeHex(bgEl && bgEl.value, "#ffffff");
    if (fgSwatch) fgSwatch.style.background = fg;
    if (bgSwatch) bgSwatch.style.background = bg;
    if (fgPicker && fgPicker.value !== fg) fgPicker.value = fg;
    if (bgPicker && bgPicker.value !== bg) bgPicker.value = bg;
  }

  function bindPicker(picker, textInput) {
    if (!picker || !textInput) return;
    picker.addEventListener("input", function () {
      textInput.value = picker.value.toLowerCase();
      scheduleRender();
    });
  }

  function updateMeta(size) {
    if (!metaEl) return;
    metaEl.textContent = size + "×" + size + "px";
  }

  function render() {
    syncSwatches();
    var content = textEl.value;
    if (!isValidContent(content)) {
      setActive(false);
      return;
    }

    var size = clampSize(sizeEl ? sizeEl.value : 256);
    var fg = normalizeHex(fgEl && fgEl.value, "#222222");
    var bg = normalizeHex(bgEl && bgEl.value, "#ffffff");
    var ecc = (eccEl && eccEl.value) || "M";
    var id = ++requestId;

    Promise.all([
      QR.toDataURL(content.trim(), {
        errorCorrectionLevel: ecc,
        margin: 1,
        width: size,
        color: { dark: fg, light: bg },
      }),
      QR.toString(content.trim(), {
        type: "svg",
        errorCorrectionLevel: ecc,
        margin: 1,
        width: size,
        color: { dark: fg, light: bg },
      }),
    ])
      .then(function (results) {
        if (id !== requestId) return;
        latestPng = results[0];
        latestSvg = results[1];
        latestSize = size;
        liveEl.src = latestPng;
        liveEl.alt = "QR code for " + content.trim();
        stageEl.style.setProperty("--qr-preview-size", size + "px");
        updateMeta(size);
        setActive(true);
      })
      .catch(function () {
        if (id !== requestId) return;
        setActive(false);
      });
  }

  function scheduleRender() {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(render, DEBOUNCE_MS);
  }

  function downloadDataUrl(href, filename) {
    var a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
  }

  function downloadSvg(svgString, filename) {
    var blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    downloadDataUrl(url, filename);
    URL.revokeObjectURL(url);
  }

  ;[textEl, sizeEl, eccEl, fgEl, bgEl].forEach(function (el) {
    if (!el) return;
    el.addEventListener("input", scheduleRender);
    el.addEventListener("change", scheduleRender);
  });

  bindPicker(fgPicker, fgEl);
  bindPicker(bgPicker, bgEl);

  if (pngBtn) {
    pngBtn.addEventListener("click", function () {
      if (!latestPng) return;
      downloadDataUrl(latestPng, "qr-code-" + latestSize + ".png");
    });
  }

  if (svgBtn) {
    svgBtn.addEventListener("click", function () {
      if (!latestSvg) return;
      downloadSvg(latestSvg, "qr-code-" + latestSize + ".svg");
    });
  }

  if (liveEl.getAttribute("src")) {
    latestPng = liveEl.getAttribute("src");
    setActive(true);
  }

  render();
})();
