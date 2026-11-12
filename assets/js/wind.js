/* =============================================================================
   SkyShield — Insurance page: wind-damage video hero
   Autoplays the muted looping clip, drives the 5-stage tracker from the video's
   own timeline (rAF-synced progress bars), lets visitors seek by stage, pause /
   resume, and parks the clip when it scrolls out of view. Under reduced-motion
   or capture mode the poster frame is shown and nothing autoplays.
   ========================================================================== */
(function () {
  "use strict";

  var hero = document.querySelector(".wind-hero");
  if (!hero) return;
  var video = hero.querySelector(".wind-video");
  var items = Array.prototype.slice.call(hero.querySelectorAll(".wind-stages li"));
  var now = hero.querySelector(".wind-now");
  var toggle = hero.querySelector(".wind-toggle");
  if (!video) return;

  var SS = window.SkyShield || {};
  var reduceMotion = SS.reduceMotion === true ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia("(max-width: 760px)").matches;

  var stages = items.map(function (li) {
    return { el: li, from: parseFloat(li.getAttribute("data-from")) || 0, to: parseFloat(li.getAttribute("data-to")) || 0,
      label: (li.querySelector("span") || li).textContent.replace(/^\s*\d+\s*/, "").trim() };
  });

  /* ---- Stage tracker ------------------------------------------------------ */
  var activeIdx = -1;
  function render(t) {
    var idx = -1;
    stages.forEach(function (s, i) {
      var p = s.to > s.from ? (t - s.from) / (s.to - s.from) : 0;
      p = Math.max(0, Math.min(1, p));
      s.el.style.setProperty("--p", p.toFixed(4));
      var active = t >= s.from && t < s.to;
      if (active) idx = i;
      s.el.classList.toggle("is-active", active);
      s.el.classList.toggle("is-done", t >= s.to);
    });
    if (idx === -1 && t >= stages[stages.length - 1].to) idx = stages.length - 1;
    if (idx !== activeIdx && idx > -1) {
      activeIdx = idx;
      if (now) {
        var b = now.querySelector("b"), sp = now.querySelector("span");
        if (b) b.textContent = String(idx + 1).padStart(2, "0");
        if (sp) sp.textContent = stages[idx].label;
      }
      items.forEach(function (li, i) { li.setAttribute("aria-current", i === idx ? "step" : "false"); });
    }
  }

  var raf = 0;
  function loop() { render(video.currentTime); raf = window.requestAnimationFrame(loop); }
  function startLoop() { stopLoop(); loop(); }
  function stopLoop() { if (raf) window.cancelAnimationFrame(raf); raf = 0; }
  video.addEventListener("play", startLoop);
  video.addEventListener("pause", function () { stopLoop(); render(video.currentTime); });
  video.addEventListener("seeked", function () { render(video.currentTime); });
  render(0);

  /* ---- Source selection + autoplay --------------------------------------- */
  var src = (small && video.getAttribute("data-src-sm")) || video.getAttribute("data-src");
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;

  var userPaused = false;
  function setPaused(paused) {
    hero.classList.toggle("is-paused", paused);
    if (toggle) {
      toggle.setAttribute("aria-pressed", paused ? "true" : "false");
      toggle.setAttribute("aria-label", paused ? "Play animation" : "Pause animation");
    }
  }
  function tryPlay() {
    var p = video.play();
    if (p && typeof p.catch === "function") p.catch(function () { hero.classList.add("is-static"); setPaused(true); });
  }

  if (reduceMotion) {
    // Keep the poster; load lazily only if the visitor presses play.
    hero.classList.add("is-static");
    setPaused(true);
  } else if (src) {
    video.src = src;
    video.addEventListener("loadeddata", function () { hero.classList.add("is-ready"); }, { once: true });
    tryPlay();
    // Park the clip while it is off-screen (battery), resume when it returns.
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (userPaused) return;
          if (e.isIntersecting) tryPlay(); else video.pause();
        });
      }, { threshold: 0.05 }).observe(hero);
    }
  }

  /* ---- Controls ----------------------------------------------------------- */
  if (toggle) toggle.addEventListener("click", function () {
    if (!video.getAttribute("src") && src) video.src = src;
    if (video.paused) { userPaused = false; hero.classList.remove("is-static"); setPaused(false); tryPlay(); }
    else { userPaused = true; video.pause(); setPaused(true); }
  });

  stages.forEach(function (s) {
    var btn = s.el.querySelector("button") || s.el;
    btn.addEventListener("click", function () {
      if (!video.getAttribute("src") && src) video.src = src;
      var seek = function () { video.currentTime = s.from + 0.05; render(video.currentTime); };
      if (video.readyState >= 1) seek(); else video.addEventListener("loadedmetadata", seek, { once: true });
      if (!userPaused) { hero.classList.remove("is-static"); setPaused(false); tryPlay(); }
    });
  });
})();
