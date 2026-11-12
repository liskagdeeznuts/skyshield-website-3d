/* =============================================================================
   SkyShield: live progress tracker in the phone (insurance page, #process)
   The phone shows a mini version of the customer progress dashboard. On desktop
   it advances as you scroll through the five phases; on phones (where the list
   is below the phone) it cycles on its own while visible.
   Reduced motion / capture: shows the finished state.
   ========================================================================== */
(function () {
  "use strict";
  var screen = document.querySelector("[data-tracker]");
  var copy = document.querySelector(".proc-copy");
  if (!screen) return;
  var SS = window.SkyShield || {};
  var gsap = SS.gsap || window.gsap, ST = SS.ScrollTrigger || window.ScrollTrigger;
  var reduce = !!SS.reduceMotion || !!SS.isCapture || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var steps = [].slice.call(screen.querySelectorAll(".tk-step"));
  var phases = copy ? [].slice.call(copy.querySelectorAll(".phase")) : [];
  var meter = screen.querySelector(".tk-meter i");
  var note = screen.querySelector(".tk-note-b");
  var cur = -1, noteTimer;

  function set(i) {
    i = Math.max(0, Math.min(steps.length - 1, i));
    if (i === cur) return;
    cur = i;
    steps.forEach(function (s, k) { s.classList.toggle("is-done", k < i); s.classList.toggle("is-now", k === i); });
    phases.forEach(function (p, k) { p.classList.toggle("is-now", k === i); });
    if (meter) meter.style.transform = "scaleX(" + ((i + 1) / steps.length).toFixed(3) + ")";
    if (note) {
      clearTimeout(noteTimer);
      note.classList.add("is-swapping");
      noteTimer = setTimeout(function () { note.textContent = steps[i].getAttribute("data-note") || ""; note.classList.remove("is-swapping"); }, 160);
    }
  }

  if (reduce || !steps.length) {
    steps.forEach(function (s) { s.classList.add("is-done"); });
    if (meter) meter.style.transform = "scaleX(1)";
    var last = steps[steps.length - 1];
    if (note && last) note.textContent = last.getAttribute("data-note") || "";
    return;
  }
  set(0);

  var desktop = window.matchMedia("(min-width: 901px)");
  var timer = null, triggers = [];
  function teardown() {
    clearInterval(timer); timer = null;
    triggers.forEach(function (t) { t.kill(); }); triggers = [];
    if (copy) copy.classList.remove("is-tracking");
  }
  function setup() {
    teardown();
    if (desktop.matches && ST && phases.length) {
      copy.classList.add("is-tracking");
      phases.forEach(function (p, i) {
        triggers.push(ST.create({ trigger: p, start: "top 62%", onEnter: function () { set(i); }, onLeaveBack: function () { set(i - 1); } }));
      });
      set(0);
    } else if ("IntersectionObserver" in window) {
      // Phone layout: cycle through the phases while the phone is on screen
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !timer) timer = setInterval(function () { set((cur + 1) % steps.length); }, 2400);
          else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; }
        });
      }, { threshold: 0.4 });
      io.observe(screen);
      triggers.push({ kill: function () { io.disconnect(); } });
    }
  }
  setup();
  if (desktop.addEventListener) desktop.addEventListener("change", setup); else if (desktop.addListener) desktop.addListener(setup);
})();
