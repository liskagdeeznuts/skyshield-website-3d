/* =============================================================================
   SkyShield: Storm explainer (insurance page, #wind)
   Wind / Hail tabs over one muted, looping video. Step captions (HTML, site
   fonts) follow the timeline; click a step to jump to it. Autoplays while in
   view and pauses when scrolled away. Steps live in the page as buttons with
   data-t = start time in seconds, so the copy can be edited without touching JS.
   Reduced motion: no autoplay, the play button starts it.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector("[data-storm]");
  if (!root) return;
  var SS = window.SkyShield || {};
  var reduce = !!SS.reduceMotion || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var video = root.querySelector(".storm-video");
  var tabs = [].slice.call(root.querySelectorAll("[data-storm-tab]"));
  var lists = [].slice.call(root.querySelectorAll("[data-storm-steps]"));
  var panel = root.querySelector("[role=tabpanel]");
  var cap = root.querySelector(".storm-cap");
  var capN = cap && cap.querySelector(".sc-n"), capT = cap && cap.querySelector(".sc-t");
  var toggle = root.querySelector(".storm-toggle");
  var barI = root.querySelector(".storm-bar i");
  var small = window.matchMedia("(max-width: 720px)");
  var current = null, steps = [], active = -1, inView = false, userPaused = false, capTimer;

  video.muted = true; video.defaultMuted = true;
  video.removeAttribute("controls");

  function srcFor(kind) {
    return video.getAttribute("data-src-" + kind + (small.matches ? "-sm" : "")) || video.getAttribute("data-src-" + kind);
  }
  function setPaused(isPaused) {
    if (!toggle) return;
    toggle.classList.toggle("is-paused", isPaused);
    toggle.setAttribute("aria-label", isPaused ? "Play animation" : "Pause animation");
  }
  function play() {
    var p = video.play();
    if (p && p.catch) p.catch(function () { setPaused(true); });
  }
  function setActive(i, instant) {
    if (i === active || !steps[i]) return;
    active = i;
    steps.forEach(function (s, k) {
      s.el.classList.toggle("is-active", k === i);
      if (k === i) s.el.setAttribute("aria-current", "step"); else s.el.removeAttribute("aria-current");
    });
    if (cap) {
      clearTimeout(capTimer);
      var apply = function () { capN.textContent = steps[i].n; capT.textContent = steps[i].label; cap.classList.remove("is-swapping"); };
      if (instant) apply(); else { cap.classList.add("is-swapping"); capTimer = setTimeout(apply, 180); }
    }
    // Mobile carousel: bring the active card into view without moving the page
    var list = steps[i].el.closest(".storm-steps");
    if (list && list.scrollWidth > list.clientWidth + 4) {
      var li = steps[i].el.parentNode;
      list.scrollTo({ left: Math.max(0, li.offsetLeft - list.offsetLeft - 4), behavior: instant ? "auto" : "smooth" });
    }
  }
  function stepForTime(t) {
    var k = 0;
    for (var i = 0; i < steps.length; i++) if (t + 0.05 >= steps[i].t) k = i;
    return k;
  }
  function select(kind, focusTab) {
    if (!kind || kind === current) return;
    current = kind;
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-storm-tab") === kind;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      if (on) { if (panel) panel.setAttribute("aria-labelledby", t.id); if (focusTab) t.focus(); }
    });
    lists.forEach(function (l) { l.hidden = l.getAttribute("data-storm-steps") !== kind; });
    var list = root.querySelector('[data-storm-steps="' + kind + '"]');
    steps = [].slice.call(list ? list.querySelectorAll(".storm-step") : []).map(function (b) {
      var n = b.querySelector(".ss-n"), t = b.querySelector(".ss-t");
      return { el: b, t: parseFloat(b.getAttribute("data-t")) || 0, n: n ? n.textContent : "", label: t ? t.textContent : "" };
    });
    active = -1;
    var poster = video.getAttribute("data-poster-" + kind);
    if (poster) video.setAttribute("poster", poster);
    var label = video.getAttribute("data-label-" + kind);
    if (label) video.setAttribute("aria-label", label);
    video.src = srcFor(kind);
    video.load();
    if (barI) barI.style.transform = "scaleX(0)";
    setActive(0, true);
    if (inView && !userPaused && !reduce) play(); else setPaused(true);
  }

  video.addEventListener("timeupdate", function () { setActive(stepForTime(video.currentTime)); });
  video.addEventListener("play", function () { setPaused(false); });
  video.addEventListener("pause", function () { setPaused(true); });
  (function tick() {
    if (barI && video.duration && !video.paused) barI.style.transform = "scaleX(" + (video.currentTime / video.duration).toFixed(4) + ")";
    requestAnimationFrame(tick);
  })();

  lists.forEach(function (l) {
    l.addEventListener("click", function (e) {
      var b = e.target.closest(".storm-step");
      if (!b) return;
      var t = parseFloat(b.getAttribute("data-t")) || 0;
      try { video.currentTime = t + 0.02; } catch (err) {}
      setActive(stepForTime(t + 0.02));
      userPaused = false;
      play();
    });
  });
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { userPaused = false; select(t.getAttribute("data-storm-tab")); });
    t.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      var next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      userPaused = false;
      select(next.getAttribute("data-storm-tab"), true);
    });
  });
  if (toggle) toggle.addEventListener("click", function () {
    if (video.paused) { userPaused = false; play(); } else { userPaused = true; video.pause(); }
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        inView = e.isIntersecting && e.intersectionRatio >= 0.35;
        if (inView) { if (!userPaused && !reduce) play(); }
        else if (!video.paused) video.pause();
      });
    }, { threshold: [0, 0.35, 0.7] }).observe(video);
  }
  var onSize = function () {
    if (!current) return;
    var t = video.currentTime, k = current, wasPlaying = !video.paused;
    current = null; select(k);
    video.addEventListener("loadedmetadata", function once() { video.removeEventListener("loadedmetadata", once); try { video.currentTime = t; } catch (e) {} if (wasPlaying) play(); });
  };
  if (small.addEventListener) small.addEventListener("change", onSize); else if (small.addListener) small.addListener(onSize);

  select(tabs[0] ? tabs[0].getAttribute("data-storm-tab") : "wind");
})();
