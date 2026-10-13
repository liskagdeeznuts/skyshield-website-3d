/* SkyShield — shared site behavior
   Nav scroll state, mobile drawer, sticky CTA, scroll-reveal, hero parallax.
   Animations touch only transform/opacity and respect prefers-reduced-motion. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Nav: scrolled border + sticky CTA reveal ---- */
  var nav = document.querySelector(".nav");
  var stickyCta = document.querySelector(".sticky-cta");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("scrolled", y > 8);
    if (stickyCta) stickyCta.classList.toggle("show", y > 620);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });
    document.querySelectorAll(".mobile-drawer a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---- Scroll reveal via IntersectionObserver ---- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- HERO exploded parallax -------------------------------------------
     Each .layer separates along the stack's Z axis as the hero scrolls past.
     We map the hero's scroll progress (0 at top, 1 when scrolled one viewport)
     to a translateZ on each layer + a gentle float on the floating labels.
     transform-only; under reduced motion the layers sit in their resting
     exploded position with no scroll coupling. */
  var stack = document.querySelector(".roof-stack");
  var hero = document.querySelector(".hero");
  if (stack && hero) {
    var layers = Array.prototype.slice.call(stack.querySelectorAll(".layer"));
    var labels = Array.prototype.slice.call(document.querySelectorAll(".r-label"));
    // Resting + max separation (px along Z) per layer, top of stack pulls furthest.
    var spread = layers.map(function (_, i) { return 26 + i * 30; });
    var labelDepth = [0, 1, 2, 3];

    function setProgress(p) {
      // ease the separation a touch for a springier feel
      var e = p < 0 ? 0 : p > 1 ? 1 : p;
      layers.forEach(function (layer, i) {
        var z = spread[i] * (0.35 + 0.65 * e);
        layer.style.setProperty("--z", z.toFixed(1) + "px");
      });
      labels.forEach(function (l, i) {
        var d = labelDepth[i % labelDepth.length];
        var ty = (1 - e) * (10 + d * 6);
        l.style.transform = "translateY(" + ty.toFixed(1) + "px)";
        l.style.opacity = (0.45 + 0.55 * e).toFixed(2);
      });
    }

    if (reduceMotion) {
      setProgress(1); // static, fully-exploded resting state
    } else {
      var ticking = false;
      var update = function () {
        var rect = hero.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        // progress: 0 when hero top at viewport top, 1 after scrolling ~one viewport
        var scrolled = -rect.top;
        var p = scrolled / (vh * 0.9);
        setProgress(p);
        ticking = false;
      };
      window.addEventListener("scroll", function () {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      window.addEventListener("resize", update, { passive: true });
      setProgress(0.18); // initial slightly-separated resting pose before scroll
      window.requestAnimationFrame(update);
    }
  }

  /* ---- Contact form (front-end only; no backend wired) ---- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var msg = form.querySelector(".form-msg");
      if (msg) { msg.classList.add("show"); }
      form.reset();
    });
  }

  /* ---- Mark current year in footer ---- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
