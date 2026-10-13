/* Hummingbird Roofing — interactions (vanilla, no deps) */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile nav drawer ---- */
  var toggle = document.querySelector('.nav-toggle');
  var backdrop = document.querySelector('.drawer-backdrop');
  function closeMenu(){ document.body.classList.remove('menu-open'); if(toggle) toggle.setAttribute('aria-expanded','false'); }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeMenu);
  document.querySelectorAll('.drawer a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---- Reveal on scroll (stagger via --i) ---- */
  document.querySelectorAll('[data-stagger]').forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.setProperty('--i', i);
      if (!child.hasAttribute('data-reveal')) child.setAttribute('data-reveal', 'up');
    });
  });
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---- Count-up stats ---- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dur = 1600, start = null;
    var isFloat = target % 1 !== 0;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString();
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = isFloat ? target.toFixed(1) : Math.round(target).toLocaleString();
    }
    requestAnimationFrame(frame);
  }
  var nums = document.querySelectorAll('.num[data-count]');
  if (nums.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      nums.forEach(function (n) { n.textContent = parseFloat(n.getAttribute('data-count')).toLocaleString(); });
    } else {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); io2.unobserve(en.target); } });
      }, { threshold: 0.6 });
      nums.forEach(function (n) { io2.observe(n); });
    }
  }

  /* ---- Forms: validate + fake submit ---- */
  document.querySelectorAll('form[data-quote]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (input) {
        var field = input.closest('.field');
        var valid = input.value.trim() !== '' && (input.type !== 'email' || /.+@.+\..+/.test(input.value));
        if (field) field.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) { var bad = form.querySelector('.field.invalid input,.field.invalid select'); if (bad) bad.focus(); return; }
      form.classList.add('sent');
      form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });
    form.querySelectorAll('input,select,textarea').forEach(function (input) {
      input.addEventListener('input', function () {
        var field = input.closest('.field');
        if (field) field.classList.remove('invalid');
      });
    });
  });

  /* ---- Grain texture (subtle SVG noise) ---- */
  var grain = document.querySelector('.hero-grain');
  if (grain) {
    grain.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">' +
      '<filter id="hbn"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>' +
      '<feColorMatrix type="saturate" values="0"/></filter>' +
      '<rect width="100%" height="100%" filter="url(#hbn)" opacity="0.5"/></svg>';
  }

  /* ---- Year ---- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
