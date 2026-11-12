/* =============================================================================
   SkyShield: Lomanco ridge vent player (shingles page, #ridge-vent)
   When the frame scrolls into view the install clip plays once (vent rolls out
   over the ridge slot, then ridge caps cover it). It then crossfades to the attic
   cross-section where animated airflow loops: cool air in at the soffits, hot
   moist air out at the ridge. "Replay" restarts the install.
   Reduced motion: shows the airflow scene, still.
   ========================================================================== */
(function () {
  "use strict";
  var root = document.querySelector("[data-ridgevent]");
  if (!root) return;
  var SS = window.SkyShield || {};
  var reduce = !!SS.reduceMotion || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  var frame = root.querySelector(".rv-frame");
  var video = root.querySelector(".rv-video");
  var cap = root.querySelector(".rv-cap");
  var capN = cap && cap.querySelector(".rc-n"), capT = cap && cap.querySelector(".rc-t");
  var replay = root.querySelector(".rv-replay");
  var small = window.matchMedia("(max-width: 720px)");
  var cues = [];
  try { cues = JSON.parse(frame.getAttribute("data-cues") || "[]"); } catch (e) { cues = []; }
  var started = false, inView = false, cue = -1, capTimer;

  video.muted = true; video.defaultMuted = true; video.removeAttribute("controls");

  function setCue(i) {
    if (i === cue || !cues[i] || !cap) return;
    cue = i;
    clearTimeout(capTimer);
    cap.classList.add("is-swapping");
    capTimer = setTimeout(function () { capN.textContent = cues[i].n; capT.textContent = cues[i].label; cap.classList.remove("is-swapping"); }, 170);
  }
  function showAir() { frame.classList.add("is-air"); }
  function start() {
    started = true;
    if (reduce) { showAir(); return; }
    if (!video.getAttribute("src")) video.src = video.getAttribute(small.matches && video.getAttribute("data-src-sm") ? "data-src-sm" : "data-src");
    frame.classList.remove("is-air");
    cue = -1; setCue(0);
    try { video.currentTime = 0; } catch (e) {}
    var p = video.play();
    if (p && p.catch) p.catch(showAir);
  }
  video.addEventListener("timeupdate", function () {
    var k = 0;
    for (var i = 0; i < cues.length; i++) if (video.currentTime + 0.05 >= cues[i].t) k = i;
    setCue(k);
  });
  video.addEventListener("ended", showAir);
  video.addEventListener("error", showAir);
  if (replay) replay.addEventListener("click", function () { reduce = false; start(); });

  if (reduce) { showAir(); return; }
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        inView = e.isIntersecting && e.intersectionRatio >= 0.5;
        frame.classList.toggle("is-offscreen", !e.isIntersecting);
        if (inView && !started) start();
        else if (inView && started && video.paused && !video.ended && !frame.classList.contains("is-air")) video.play().catch(showAir);
        else if (!inView && !video.paused) video.pause();
      });
    }, { threshold: [0, 0.5] }).observe(frame);
  } else { start(); }
})();
