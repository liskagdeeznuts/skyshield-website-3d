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
