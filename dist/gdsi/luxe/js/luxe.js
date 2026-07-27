/* ══════════════════════════════════════════════════════════════════
   EP LUXE — Luxury Portfolio Framework · engine bundle  (v2.0.0)
   ──────────────────────────────────────────────────────────────────
   Reusable, client-agnostic engines. Progressive enhancement:
   uses GSAP + ScrollTrigger when present on the page, and falls back
   to native IntersectionObserver / rAF when they are not — so the
   page is fully functional offline and on any host.

   Engines:  Core(util) · Nav · Animation(reveal) · Parallax · Story
   Public:   window.EPLuxe.init(opts)  (auto-runs on DOMContentLoaded)
             window.EPLuxe.renderStories(mountSelector, data)
   ══════════════════════════════════════════════════════════════════ */
(function (w, d) {
  'use strict';

  /* ── Core / Utility library ── */
  var U = {
    $:  function (s, c) { return (c || d).querySelector(s); },
    $$: function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); },
    on: function (el, ev, fn, o) { if (el) el.addEventListener(ev, fn, o || false); },
    raf: function (fn) { var t = false; return function () { if (!t) { requestAnimationFrame(function () { fn(); t = false; }); t = true; } }; },
    esc: function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); },
    hasGSAP: function () { return !!(w.gsap && w.ScrollTrigger); },
    reduced: function () { return w.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; }
  };

  /* ── Navigation engine ── */
  var Nav = {
    init: function () {
      var nav = U.$('.lx-nav'); if (!nav) return;
      var solid = function () { nav.classList.toggle('is-solid', w.scrollY > 40); };
      solid(); U.on(w, 'scroll', U.raf(solid), { passive: true });
      var burg = U.$('.lx-burg', nav);
      U.on(burg, 'click', function () {
        var o = nav.classList.toggle('is-open');
        if (burg) burg.setAttribute('aria-expanded', o);
      });
      U.$$('.lx-links a', nav).forEach(function (a) {
        U.on(a, 'click', function () { nav.classList.remove('is-open'); if (burg) burg.setAttribute('aria-expanded', false); });
      });
    }
  };

  /* ── Animation engine — scroll reveals (GSAP → IO fallback) ── */
  var Anim = {
    init: function () {
      var els = U.$$('.lx-rv'); if (!els.length) return;
      if (U.reduced()) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
      if (U.hasGSAP()) {
        els.forEach(function (el) {
          w.ScrollTrigger.create({ trigger: el, start: 'top 84%', once: true,
            onEnter: function () { el.classList.add('is-in'); } });
        });
      } else if ('IntersectionObserver' in w) {
        var io = new IntersectionObserver(function (en) {
          en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
        }, { threshold: 0.16 });
        els.forEach(function (el) { io.observe(el); });
      } else { els.forEach(function (e) { e.classList.add('is-in'); }); }
    }
  };

  /* ── Parallax engine — subtle image drift on [data-lx-parallax] ── */
  var Parallax = {
    init: function () {
      if (U.reduced()) return;
      var imgs = U.$$('[data-lx-parallax] img'); if (!imgs.length) return;
      var depth = 42;
      var run = function () {
        imgs.forEach(function (img) {
          var host = img.closest('[data-lx-parallax]'); if (!host) return;
          var r = host.getBoundingClientRect();
          if (r.bottom < 0 || r.top > innerHeight) return;
          var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
          img.style.transform = 'translateY(' + (p * -depth) + 'px)';
        });
      };
      U.on(w, 'scroll', U.raf(run), { passive: true }); run();
    }
  };

  /* ── Project Story engine — render cinematic chapters from data ──
     data: [{ id, category, title, overview, philosophy,
              heroImg, detailImg, revealImg, revealCaption, placeholder }]  */
  var Story = {
    render: function (mount, list) {
      var host = typeof mount === 'string' ? U.$(mount) : mount;
      if (!host || !list || !list.length) return;
      host.innerHTML = list.map(function (s) {
        var tag = s.placeholder ? '<span class="lx-tag">Working placeholder · client photo</span>' : '';
        return '' +
        '<article class="lx-story" id="' + U.esc(s.id) + '">' +
          '<div class="lx-story__hero" data-lx-parallax>' + tag +
            '<img src="' + U.esc(s.heroImg) + '" alt="' + U.esc(s.title) + '" loading="lazy">' +
            '<div class="lx-wrap lx-story__label">' +
              '<span class="lx-eyebrow lx-rv">' + U.esc(s.category) + '</span>' +
              '<h3 class="lx-rv lx-rv-2">' + U.esc(s.title) + '</h3>' +
            '</div>' +
          '</div>' +
          '<div class="lx-wrap"><div class="lx-story__body">' +
            '<div class="lx-story__text lx-rv">' +
              '<h4>' + U.esc(s.overview) + '</h4>' +
              '<p>' + U.esc(s.philosophy) + '</p>' +
            '</div>' +
            '<figure class="lx-story__detail lx-rv lx-rv-2">' +
              '<img src="' + U.esc(s.detailImg || s.heroImg) + '" alt="Detail — ' + U.esc(s.title) + '" loading="lazy">' +
            '</figure>' +
          '</div></div>' +
          '<figure class="lx-story__reveal" data-lx-parallax>' +
            '<img src="' + U.esc(s.revealImg || s.heroImg) + '" alt="Finished — ' + U.esc(s.title) + '" loading="lazy">' +
            (s.revealCaption ? '<figcaption>' + U.esc(s.revealCaption) + '</figcaption>' : '') +
          '</figure>' +
        '</article>';
      }).join('');
    }
  };

  /* ── Boot ── */
  var EPLuxe = {
    version: '2.0.0',
    util: U,
    renderStories: function (mount, data) { Story.render(mount, data); },
    init: function (opts) {
      opts = opts || {};
      if (opts.stories && opts.storyMount) Story.render(opts.storyMount, opts.stories);
      else if (w.EP_LUXE_STORIES) Story.render('#lx-stories', w.EP_LUXE_STORIES);
      Nav.init();
      Anim.init();      // after stories render so injected .lx-rv are observed
      Parallax.init();
    }
  };
  w.EPLuxe = EPLuxe;
  if (d.readyState === 'loading') U.on(d, 'DOMContentLoaded', function () { EPLuxe.init(); });
  else EPLuxe.init();
})(window, document);
