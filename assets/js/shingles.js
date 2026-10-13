/* =============================================================================
   SkyShield — Shingles page interactions
   1) Drag-to-compare before/after slider (pointer + keyboard accessible)
   2) Titan XT color picker (swatch -> live preview + name)
   Shared behavior (nav, sticky CTA, Lenis, reveals) lives in lib.js.
   ========================================================================== */
(function () {
  "use strict";

  /* ---- Drag-to-compare ---------------------------------------------------- */
  Array.prototype.slice.call(document.querySelectorAll("[data-compare]")).forEach(function (cmp) {
    var before = cmp.querySelector(".cmp-before");
    var handle = cmp.querySelector(".cmp-handle");
    var range = cmp.querySelector(".cmp-range");
    if (!before || !handle || !range) return;

    function set(v) {
      v = Math.max(0, Math.min(100, v));
      before.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)"; // show OLD roof from left to v%
      handle.style.left = v + "%";
      range.value = v;
      range.setAttribute("aria-valuenow", Math.round(v));
    }
    range.addEventListener("input", function () { set(parseFloat(range.value)); });

    var dragging = false;
    function fromEvent(e) {
      var r = cmp.getBoundingClientRect();
      var clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
      set(((clientX - r.left) / r.width) * 100);
    }
    cmp.addEventListener("pointerdown", function (e) { dragging = true; fromEvent(e); });
    window.addEventListener("pointermove", function (e) { if (dragging) fromEvent(e); });
    window.addEventListener("pointerup", function () { dragging = false; });

    set(50);
  });

  /* ---- Color picker ------------------------------------------------------- */
  var swatches = Array.prototype.slice.call(document.querySelectorAll(".swatch"));
  var preview = document.querySelector(".cp-preview");
  var nameEl = document.querySelector("[data-color-name]");
  var groupEl = document.querySelector("[data-color-group]");
  function select(sw) {
    swatches.forEach(function (s) { s.classList.remove("is-sel"); s.setAttribute("aria-pressed", "false"); });
    sw.classList.add("is-sel"); sw.setAttribute("aria-pressed", "true");
    if (preview) preview.style.background = sw.dataset.hex;
    if (nameEl) nameEl.textContent = sw.dataset.name;
    if (groupEl) groupEl.textContent = sw.dataset.group;
  }
  swatches.forEach(function (sw) {
    sw.setAttribute("role", "button");
    sw.addEventListener("click", function () { select(sw); });
  });
  // Pre-select Thunderstorm Grey if present, else the first swatch
  if (swatches.length) {
    var def = swatches.filter(function (s) { return s.dataset.name === "Thunderstorm Grey"; })[0] || swatches[0];
    select(def);
  }
})();
