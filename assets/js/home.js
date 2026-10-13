/* =============================================================================
   SkyShield — Home page scroll mechanics
   1) Hero parallax (orbs + content drift)
   2) Roof System: pinned scroll MECHANIC DEMO — placeholder layers explode apart,
      floating labels + progress bars reveal in sequence
   3) Why-us: pinned numbered feature scroll (sticky number/title tracks active item)
   Stats count-up is handled by lib.js (data-count). Color zones come from per-section bg.
   Under capture / reduced-motion the resting (final) layout is rendered statically.
   ========================================================================== */
(function () {
  "use strict";
  var SS = window.SkyShield || {};
  var gsap = SS.gsap, ScrollTrigger = SS.ScrollTrigger;
  var motion = !SS.reduceMotion && SS.hasGSAP && ScrollTrigger;

  /* ---- Roof System: canvas frame-scrub + scroll-synced product links ------ */
  (function () {
    var canvas = document.querySelector(".roof-canvas");
    var blocks = Array.prototype.slice.call(document.querySelectorAll(".roof-block"));
    var markers = Array.prototype.slice.call(document.querySelectorAll(".roof-marker"));
    if (!canvas || !gsap) return;
    var ctx = canvas.getContext("2d");
    var FRAMES = 120;
    var pad = function (n) { return ("000" + n).slice(-3); };
    var imgs = new Array(FRAMES);
    var loaded = 0, sized = false, curr = -1;
    var roofNarrow = window.matchMedia("(max-width: 1020px)").matches;

    function sizeFrom(img) { if (!sized) { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; sized = true; } }
    function draw(i) {
      i = Math.max(0, Math.min(FRAMES - 1, i | 0));
      var img = imgs[i];
      if (!img || !img.complete || !img.naturalWidth) return false; // frame not ready yet
      if (i === curr) return true;
      sizeFrom(img); curr = i;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return true;
    }
    // Source clip ASSEMBLES the roof (frame 1 exploded -> frame 120 assembled).
    // Reverse it: scroll progress 0 = assembled (resting), 1 = fully exploded.
    function frameForProgress(p) { return Math.round((1 - p) * (FRAMES - 1)); }
    var restFrame = (motion && !roofNarrow) ? FRAMES - 1 : 0; // desktop motion rests assembled; mobile/static show exploded

    for (var k = 0; k < FRAMES; k++) {
      (function (idx) {
        var im = new Image();
        im.onload = function () {
          loaded++;
          if (!sized) sizeFrom(im);
          if (loaded === 1) draw(restFrame);
          if (loaded === FRAMES && ScrollTrigger) ScrollTrigger.refresh();
        };
        im.src = "assets/roof-frames/frame_" + pad(idx + 1) + ".jpg";
        imgs[idx] = im;
      })(k);
    }
    // Keep trying until the resting frame is actually loaded and painted
    var paint = setInterval(function () { if (draw(restFrame)) clearInterval(paint); }, 40);

    // Hover/focus a block -> light up its marker on the roof, and vice versa
    blocks.forEach(function (b, i) {
      var m = markers[i];
      if (!m) return;
      var on = function () { m.classList.add("is-hot"); };
      var off = function () { m.classList.remove("is-hot"); };
      b.addEventListener("mouseenter", on); b.addEventListener("mouseleave", off);
      b.addEventListener("focus", on); b.addEventListener("blur", off);
    });

    // Reveal blocks + their roof markers up to idx (sticky), highlight the active one
    function activateTo(idx) {
      for (var i = 0; i < blocks.length; i++) {
        if (i <= idx) { blocks[i].classList.add("is-in"); if (markers[i]) markers[i].classList.add("is-in"); }
        blocks[i].classList.toggle("is-active", i === idx);
        if (markers[i]) markers[i].classList.toggle("is-active", i === idx);
      }
    }

    if (!motion) {
      blocks.forEach(function (b) { b.classList.add("is-in"); });
      markers.forEach(function (m) { m.classList.add("is-in"); });
      return;
    }

    if (roofNarrow) {
      // Mobile: static exploded frame on top (all layers visible + marked), blocks reveal as a list
      markers.forEach(function (m) { m.classList.add("is-in"); });
      blocks.forEach(function (b) {
        ScrollTrigger.create({ trigger: b, start: "top 90%", once: true, onEnter: function () { b.classList.add("is-in"); } });
      });
      return;
    }

    // Desktop: pin, scrub frames to scroll, reveal + highlight blocks in sync (top layer first)
    var prog = { p: 0 };
    gsap.timeline({
      scrollTrigger: { trigger: ".roofsys", start: "top top", end: "+=220%", pin: ".roofsys-pin", scrub: 0.5 }
    }).to(prog, { p: 1, ease: "none", onUpdate: function () {
      draw(frameForProgress(prog.p));
      activateTo(Math.min(blocks.length - 1, Math.floor(prog.p * blocks.length)));
    } }, 0);
  })();

  /* ---- Hero parallax ------------------------------------------------------ */
  if (motion) {
    var orbScrub = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(".hero-orb--1", { yPercent: 30, scrollTrigger: orbScrub });
    gsap.to(".hero-orb--2", { yPercent: -22, scrollTrigger: orbScrub });
    gsap.to(".hero-inner", { yPercent: 12, autoAlpha: 0.3, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "30% top", end: "bottom top", scrub: true } });
  }

  /* ---- Why-us: pinned numbered feature scroll ----------------------------- */
  var grid = document.querySelector(".features-grid");
  var items = Array.prototype.slice.call(document.querySelectorAll(".feature-item"));
  var numEl = document.querySelector("[data-feature-num]");
  var titleEl = document.querySelector("[data-feature-title]");

  function setActive(i) {
    if (numEl) numEl.textContent = ("0" + (i + 1)).slice(-2);
    if (titleEl) {
      var h = items[i].querySelector("h3");
      if (h) titleEl.textContent = h.textContent;
    }
    items.forEach(function (it, j) { it.classList.toggle("is-active", j === i); });
  }

  if (motion && items.length && grid) {
    grid.classList.add("is-motion");
    setActive(0);
    // Scrollspy: the active feature is the last one whose top has passed viewport
    // center. Tall items (min-height ~52vh) give each feature real scroll distance,
    // so the big number and the copy on the right advance together, one at a time.
    items.forEach(function (it, i) {
      ScrollTrigger.create({
        trigger: it,
        start: "top center",
        onEnter: function () { setActive(i); },
        onLeaveBack: function () { setActive(Math.max(0, i - 1)); }
      });
    });
  }

  /* ---- Keep pins honest after fonts/images settle ------------------------- */
  if (motion) {
    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
})();
