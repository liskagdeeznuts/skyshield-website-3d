/* SkyShield — drag-to-compare before/after slider (Shingles page)
   Pointer + touch drag, plus a keyboard-accessible range input.
   The "before" panel is clipped via inset(); the handle tracks the same %. */
(function () {
  "use strict";
  document.querySelectorAll("[data-compare]").forEach(function (root) {
    var before = root.querySelector(".compare-before");
    var handle = root.querySelector(".compare-handle");
    var grip = root.querySelector(".compare-grip");
    var range = root.querySelector(".compare-range");
    var pos = 50;

    function apply(p) {
      pos = Math.max(0, Math.min(100, p));
      before.style.clipPath = "inset(0 " + (100 - pos) + "% 0 0)";
      handle.style.left = pos + "%";
      if (grip) grip.style.left = pos + "%";
      if (range && Number(range.value) !== Math.round(pos)) range.value = String(Math.round(pos));
      root.setAttribute("aria-valuenow", String(Math.round(pos)));
    }

    function fromClientX(clientX) {
      var rect = root.getBoundingClientRect();
      apply(((clientX - rect.left) / rect.width) * 100);
    }

    var dragging = false;
    function down(e) {
      dragging = true;
      root.classList.add("dragging");
      fromClientX(e.touches ? e.touches[0].clientX : e.clientX);
      e.preventDefault();
    }
    function move(e) {
      if (!dragging) return;
      fromClientX(e.touches ? e.touches[0].clientX : e.clientX);
    }
    function up() { dragging = false; root.classList.remove("dragging"); }

    root.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseup", up);
    root.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);

    if (range) {
      range.addEventListener("input", function () { apply(Number(range.value)); });
    }

    apply(50);
  });
})();
