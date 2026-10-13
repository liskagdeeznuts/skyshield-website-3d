/* =============================================================================
   SkyShield — shared site behavior (loaded on every page)
   Lenis smooth scroll + GSAP/ScrollTrigger wiring, reusable reveal/stagger,
   count-up util, sticky nav, mobile drawer, sticky floating CTA.
   Exposes window.SkyShield = { lenis, gsap, ScrollTrigger, reduceMotion, countUp, revealAll }.
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  // Capture mode: headless Puppeteer (navigator.webdriver) or ?capture renders the
  // resting layout (reveals shown, no pin/Lenis) so screenshots compare final state.
  var isCapture = navigator.webdriver === true || /[?&]capture/.test(location.search);
  if (isCapture) document.documentElement.classList.add("capture");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || isCapture;
  var hasGSAP = typeof window.gsap !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;

  if (hasGSAP && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---- Lenis smooth scroll (skipped under reduced-motion) ----------------- */
  var lenis = null;
  if (hasLenis && !reduceMotion) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6
    });
    if (hasGSAP && ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    // Anchor links scroll smoothly through Lenis
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      closeDrawer();
    });
  }

  /* ---- Reveal-on-scroll (data-reveal) ------------------------------------- */
  function revealAll() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
    if (reduceMotion || !hasGSAP || !ScrollTrigger) {
      nodes.forEach(function (n) { n.style.opacity = 1; n.style.transform = "none"; n.style.clipPath = "none"; n.style.filter = "none"; });
      return;
    }
    nodes.forEach(function (n) {
      // Stagger children are animated by their group below — skip here to avoid double-binding
      if (n.closest("[data-stagger]")) return;
      var delay = parseFloat(n.getAttribute("data-delay")) || 0;
      var type = n.getAttribute("data-reveal");
      // fromTo with an EXPLICIT visible end-state. (gsap.from would read the CSS
      // hidden state — opacity:0 — as the target and animate 0 -> 0, staying invisible.)
      var from = { opacity: 0 };
      var to = { opacity: 1, duration: 0.95, ease: "power3.out", delay: delay,
        scrollTrigger: { trigger: n, start: "top 88%", once: true } };
      if (type === "up") { from.y = 34; from.filter = "blur(6px)"; to.y = 0; to.filter = "blur(0px)"; }
      else if (type === "left") { from.x = -46; to.x = 0; }
      else if (type === "right") { from.x = 46; to.x = 0; }
      else if (type === "scale") { from.scale = 0.94; from.transformOrigin = "center"; to.scale = 1; }
      else if (type === "clip") { from.opacity = 1; from.clipPath = "inset(0 0 100% 0)"; to.opacity = 1; to.clipPath = "inset(0 0 0% 0)"; }
      gsap.fromTo(n, from, to);
    });
    // Staggered groups: [data-stagger] animates its [data-reveal] children together
    Array.prototype.slice.call(document.querySelectorAll("[data-stagger]")).forEach(function (group) {
      var items = group.querySelectorAll("[data-reveal]");
      gsap.fromTo(items,
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.1,
          scrollTrigger: { trigger: group, start: "top 85%", once: true } }
      );
    });
  }

  /* ---- Count-up utility --------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduceMotion || !hasGSAP) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    var obj = { v: 0 };
    gsap.to(obj, {
      v: target, duration: 1.8, ease: "power2.out",
      onUpdate: function () { el.textContent = obj.v.toFixed(decimals); }
    });
  }
  function initCounts() {
    var stats = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!stats.length) return;
    if (reduceMotion || !hasGSAP || !ScrollTrigger) { stats.forEach(countUp); return; }
    stats.forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: function () { countUp(el); } });
    });
  }

  /* ---- Sticky nav state + floating CTA ------------------------------------ */
  var nav = document.querySelector(".nav");
  var stickyCta = document.querySelector(".sticky-cta");
  function onScroll(y) {
    if (nav) nav.classList.toggle("is-stuck", y > 12);
    if (stickyCta) stickyCta.classList.toggle("is-shown", y > 600);
  }
  if (lenis) lenis.on("scroll", function (e) { onScroll(e.scroll); });
  else window.addEventListener("scroll", function () { onScroll(window.scrollY); }, { passive: true });
  onScroll(window.scrollY);

  // Tuck the floating CTA away once the contact section is in view (avoids overlapping the footer)
  var contactSection = document.querySelector("#contact");
  if (contactSection && stickyCta && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { stickyCta.classList.toggle("near-end", e.isIntersecting); });
    }, { rootMargin: "0px 0px -45% 0px" }).observe(contactSection);
  }

  /* ---- Mobile drawer ------------------------------------------------------ */
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.querySelector(".drawer");
  var backdrop = document.querySelector(".drawer-backdrop");
  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("is-open"); if (backdrop) backdrop.classList.add("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    if (lenis) lenis.stop();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("is-open"); if (backdrop) backdrop.classList.remove("is-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }
  if (toggle) toggle.addEventListener("click", function () {
    drawer && drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
  });
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
  if (drawer) drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeDrawer); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrawer(); });

  /* ---- Contact form (front-end success state) ----------------------------- */
  var form = document.querySelector("form[data-contact]");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.classList.add("is-sent");
  });

  /* ---- Boot --------------------------------------------------------------- */
  function init() {
    revealAll();
    initCounts();
    if (hasGSAP && ScrollTrigger) ScrollTrigger.refresh();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", function () { if (hasGSAP && ScrollTrigger) ScrollTrigger.refresh(); });

  window.SkyShield = {
    lenis: lenis, gsap: gsap, ScrollTrigger: ScrollTrigger,
    reduceMotion: reduceMotion, isCapture: isCapture, hasGSAP: hasGSAP,
    countUp: countUp, revealAll: revealAll
  };
})();
