/* =============================================================================
   SkyShield: Roof System scroll animation (home page, #roof-system)
   One pinned stage. Scrolling first rotates the house in and grows it, then
   lifts each roof layer off in order: Titan XT shingles, Lomanco ridge vent,
   SkyShield underlayment, ice & water barrier, leaving the wood deck.
   Frames live in assets/roof-system/{desktop|mobile}/f_###.webp and are
   painted to a <canvas>. Steps (left cards) and numbered markers stay in sync.
   Reduced motion / capture mode: static exploded frame, everything visible.
   Self-contained: needs only GSAP + ScrollTrigger (and lib.js if present).
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector("[data-rsys]");
  if (!root) return;

  /* ---- Config (written by the frame pipeline; edit by hand if you regenerate) ---- */
  var CFG = /*RSYS_CONFIG*/{"frames":180,"desktop":{"dir":"desktop/","w":1600,"h":900},"mobile":{"dir":"mobile/","w":900,"h":706,"cropX0":14,"cropX1":86,"every":2},"phases":[{"from":0,"to":59,"w":0.26},{"from":59,"to":89,"w":0.15},{"from":89,"to":119,"w":0.19},{"from":119,"to":149,"w":0.14},{"from":149,"to":179,"w":0.14},{"from":179,"to":179,"w":0.12}],"markers":[{"x":20.6,"y":18.9},{"x":21.1,"y":28.0},{"x":20.5,"y":35.8},{"x":20.6,"y":47.2},{"x":20.9,"y":61.8}]}/*END_RSYS_CONFIG*/;

  var SS = window.SkyShield || {};
  var gsap = SS.gsap || window.gsap;
  var ST = SS.ScrollTrigger || window.ScrollTrigger;
  var isCapture = !!SS.isCapture || navigator.webdriver === true || /[?&]capture/.test(location.search);
  var reduce = !!SS.reduceMotion || isCapture || !gsap || !ST ||
    (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var base = root.getAttribute("data-rsys-base") || "assets/roof-system/";
  var canvas = root.querySelector(".rsys-canvas");
  var ctx = canvas.getContext("2d");
  var stage = root.querySelector(".rsys-stage");
  var steps = [].slice.call(root.querySelectorAll(".rsys-step"));
  var markers = [].slice.call(root.querySelectorAll(".rsys-marker"));
  var bar = root.querySelector(".rsys-progress i");
  var mqNarrow = window.matchMedia("(max-width: 1020px)");

  var N = CFG.frames;
  var LAST = N - 1;

  /* Narrow layouts use the mobile set (tighter crop, smaller files) */
  function pickSet() { return mqNarrow.matches ? CFG.mobile : CFG.desktop; }
  var set = pickSet();
  canvas.width = set.w; canvas.height = set.h;

  function src(i) { return base + set.dir + "f_" + ("00" + i).slice(-3) + ".webp"; }

  /* ---- Progressive frame loader: rest/end frames first, then coarse -> fine ---- */
  var imgs = new Array(N), ok = new Array(N), queued = new Array(N);
  var queue = [], inflight = 0, MAX_INFLIGHT = 6, started = false, want = 0, drawn = -1;

  function buildOrder() {
    var order = [0, LAST], seen = {};
    seen[0] = seen[LAST] = true;
    var every = set.every || 1;
    [16, 8, 4, 2, 1].forEach(function (step) {
      if (step < every) return;
      for (var i = 0; i < N; i += step) if (!seen[i]) { seen[i] = true; order.push(i); }
    });
    return order;
  }
  function pump() {
    while (inflight < MAX_INFLIGHT && queue.length) {
      var i = queue.shift();
      if (ok[i] || imgs[i]) continue;
      inflight++;
      (function (idx) {
        var im = new Image();
        im.decoding = "async";
        im.onload = function () {
          inflight--;
          if (imgs[idx] !== im) { pump(); return; } // stale load from a swapped frame set
          ok[idx] = true;
          if (idx === want || drawn < 0 || Math.abs(idx - want) < Math.abs(drawn - want)) paint(want);
          pump();
        };
        im.onerror = function () { inflight--; pump(); };
        im.src = src(idx);
        imgs[idx] = im;
      })(i);
    }
  }
  function startLoading(firstIndex) {
    if (started) return;
    started = true;
    var order = buildOrder();
    if (firstIndex != null) order.unshift(firstIndex);
    order.forEach(function (i) { if (!queued[i]) { queued[i] = true; queue.push(i); } });
    pump();
  }
  /* Draw frame i, or the nearest frame that has loaded so far */
  function paint(i) {
    want = i = Math.max(0, Math.min(LAST, Math.round(i)));
    var k = -1;
    if (ok[i]) k = i;
    else for (var d = 1; d < N; d++) {
      if (i - d >= 0 && ok[i - d]) { k = i - d; break; }
      if (i + d <= LAST && ok[i + d]) { k = i + d; break; }
    }
    if (k < 0 || k === drawn) return;
    drawn = k;
    ctx.drawImage(imgs[k], 0, 0, canvas.width, canvas.height);
  }

  /* ---- Scroll progress -> frame + active step ---- */
  var phases = CFG.phases, bounds = [], acc = 0, total = 0;
  phases.forEach(function (ph) { total += ph.w; });
  phases.forEach(function (ph) { bounds.push([acc / total, (acc + ph.w) / total]); acc += ph.w; });

  function frameAt(p) {
    for (var s = 0; s < phases.length; s++) {
      var b = bounds[s];
      if (p <= b[1] || s === phases.length - 1) {
        var t = b[1] > b[0] ? Math.min(1, Math.max(0, (p - b[0]) / (b[1] - b[0]))) : 1;
        return phases[s].from + t * (phases[s].to - phases[s].from);
      }
    }
    return LAST;
  }
  /* Phase 0 = rotate in (no step). Phases 1..4 lift layers 0..3. Last phase = deck (step 4). */
  function stepAt(p) {
    for (var s = phases.length - 1; s >= 1; s--) if (p >= bounds[s][0]) return s - 1;
    return -1;
  }
  /* A layer's marker appears once that layer has (mostly) lifted into place */
  function markerVisible(k, p) {
    var s = Math.min(k + 1, phases.length - 1);
    var b = bounds[s];
    var at = (k + 1 >= phases.length - 1) ? b[0] : b[0] + (b[1] - b[0]) * 0.6;
    return p >= at;
  }
  var lastStep = -2;
  function setState(p) {
    var a = stepAt(p);
    if (a !== lastStep) {
      lastStep = a;
      steps.forEach(function (el, i) {
        el.classList.toggle("is-in", i <= a);
        el.classList.toggle("is-active", i === a);
        if (i === a) el.setAttribute("aria-current", "step"); else el.removeAttribute("aria-current");
      });
      root.setAttribute("data-step", a);
    }
    markers.forEach(function (m, k) {
      m.classList.toggle("is-in", markerVisible(k, p));
      m.classList.toggle("is-active", k === a);
    });
    if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
  }

  /* Marker coordinates come from the config (percent of the full desktop frame);
     the mobile set is a horizontal crop, so remap x into it. */
  function placeMarkers() {
    var c0 = set.cropX0 || 0, c1 = set.cropX1 || 100;
    stage.style.setProperty("--rsys-ar", set.w + " / " + set.h);
    markers.forEach(function (m, k) {
      var c = CFG.markers[k];
      if (!c) return;
      m.style.setProperty("--x", ((c.x - c0) / (c1 - c0) * 100).toFixed(2) + "%");
      m.style.setProperty("--y", c.y + "%");
    });
  }
  placeMarkers();

  /* Hover a card -> highlight its marker */
  steps.forEach(function (el, i) {
    var m = markers[i];
    if (!m) return;
    var on = function () { m.classList.add("is-hot"); };
    var off = function () { m.classList.remove("is-hot"); };
    el.addEventListener("mouseenter", on); el.addEventListener("mouseleave", off);
    el.addEventListener("focus", on); el.addEventListener("blur", off);
  });

  /* ---- Static mode: exploded frame, everything shown ---- */
  if (reduce) {
    root.classList.add("rsys--static");
    startLoading(LAST);
    want = LAST;
    var tries = 0, t = setInterval(function () { paint(LAST); if (drawn === LAST || ++tries > 250) clearInterval(t); }, 40);
    steps.forEach(function (el) { el.classList.add("is-in"); });
    markers.forEach(function (m) { m.classList.add("is-in"); });
    if (bar) bar.style.transform = "scaleX(1)";
    return;
  }

  root.classList.add("rsys--motion");
  setState(0);
  paint(0);

  /* Start fetching frames when the section gets near (or right after page load) */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { startLoading(0); io.disconnect(); }
    }, { rootMargin: "200% 0px" });
    io.observe(root);
  }
  window.addEventListener("load", function () { setTimeout(function () { startLoading(0); }, 600); });

  var state = { p: 0 };
  function update() {
    paint(frameAt(state.p));
    setState(state.p);
  }
  gsap.timeline({
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: function () { return "+=" + Math.round(window.innerHeight * (mqNarrow.matches ? 3.4 : 4.2)); },
      pin: root.querySelector(".rsys-pin"),
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  }).to(state, { p: 1, ease: "none", onUpdate: update }, 0);

  /* Swap frame sets if the stage crosses the size threshold (rotation, resize) */
  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var next = pickSet();
      if (next === set) return;
      set = next; canvas.width = set.w; canvas.height = set.h; placeMarkers();
      imgs = new Array(N); ok = new Array(N); queued = new Array(N); queue = []; drawn = -1; started = false;
      startLoading(Math.round(frameAt(state.p)));
      update();
    }, 250);
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
