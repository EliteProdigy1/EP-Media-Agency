/* ══════════════════════════════════════════════════════
   EP CORE — Elite Prodigy Shared Bootstrapper
   Handles nav scroll, mobile menu, progress bar, and
   email popup for all EP pages via data- attributes.
   Load on every page that needs any of these behaviors.
   See MASTER_SPECIFICATION.md §8 for component strategy.
   ══════════════════════════════════════════════════════ */

const EPCore = (() => {

  /* ─────────────────────────────────────────
     NAV SCROLL
     Adds/removes .scrolled on the nav element
     as the page scrolls past a threshold.

     Usage: EPCore.initNav()
     Default selector targets common EP nav IDs/classes.
     Pass a custom selector to override:
       EPCore.initNav('#my-nav')
  ───────────────────────────────────────── */
  function initNav(selector = '#main-nav, #p-nav, [data-ep-nav]') {
    const nav = document.querySelector(selector);
    if (!nav) return;
    const threshold = parseInt(nav.dataset.scrollThreshold, 10) || 40;
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }


  /* ─────────────────────────────────────────
     MOBILE MENU
     Toggles .open class on hamburger + menu panel.
     Closes on outside click and Escape key.

     HTML pattern:
       <button id="hamburger" aria-expanded="false" aria-controls="mobile-menu">
       <nav id="mobile-menu">...</nav>

     Or use data attrs on any element:
       <button data-ep-hamburger>
       <div data-ep-menu>
  ───────────────────────────────────────── */
  function initMobileMenu() {
    const hamburger = document.querySelector('#hamburger, [data-ep-hamburger]');
    const menu      = document.querySelector('#mobile-menu, [data-ep-menu]');
    if (!hamburger || !menu) return;

    const overlay = document.querySelector('[data-ep-overlay]');

    const open = () => {
      menu.classList.add('open');
      menu.setAttribute('aria-hidden', 'false');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      if (overlay) overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      if (overlay) overlay.classList.remove('visible');
      document.body.style.overflow = '';
    };
    const toggle = () => menu.classList.contains('open') ? close() : open();

    hamburger.addEventListener('click', toggle);
    if (overlay) overlay.addEventListener('click', close);

    menu.querySelectorAll('.mobile-close').forEach(btn => btn.addEventListener('click', close));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') &&
          !menu.contains(e.target) &&
          !hamburger.contains(e.target) &&
          !(overlay && overlay.contains(e.target))) close();
    });
  }


  /* ─────────────────────────────────────────
     SCROLL PROGRESS BAR
     Scales a progress bar element [0→1] as
     the user scrolls through the page.

     HTML pattern (add transform-origin: left in CSS):
       <div id="progress-bar"></div>
     Or: <div data-ep-progress></div>
  ───────────────────────────────────────── */
  function initProgressBar() {
    const bar = document.querySelector('#progress-bar, [data-ep-progress]');
    if (!bar) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const maxScroll = scrollHeight - clientHeight;
      bar.style.transform = `scaleX(${maxScroll > 0 ? Math.min(1, scrollTop / maxScroll) : 0})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }


  /* ─────────────────────────────────────────
     EMAIL POPUP
     Shows once per session. Configurable via
     data attrs on <body>:

       <body data-popup-key="ep_seen" data-popup-color="gold">
       <body data-popup-key="ep_youth_seen" data-popup-color="green">
       <body data-popup-key="ep_wellness_seen" data-popup-color="green">

     The popup element must have id="ep-popup".
     Dismiss triggers use [data-popup-close].

     Phase 2 note: replace setTimeout with a
     25% scroll-depth trigger per MASTER_SPEC §18.
  ───────────────────────────────────────── */
  function initPopup() {
    if (window.EP_POPUP_CONFIG) return;
    const popup = document.getElementById('ep-popup');
    if (!popup) return;

    const key   = document.body.dataset.popupKey   || 'ep_seen';
    const color = document.body.dataset.popupColor || 'gold';
    const delay = parseInt(document.body.dataset.popupDelay, 10) || 2000;

    if (sessionStorage.getItem(key)) return;

    popup.dataset.color = color;

    const dismiss = () => {
      popup.classList.remove('ep-popup--visible');
      popup.classList.add('ep-popup--hidden');
      sessionStorage.setItem(key, '1');
    };

    popup.querySelectorAll('[data-popup-close]').forEach(el => {
      el.addEventListener('click', dismiss);
    });

    setTimeout(() => popup.classList.add('ep-popup--visible'), delay);
  }


  /* ─────────────────────────────────────────
     THEME COLOR META
     Sets the browser chrome color to EP black
     on pages that don't have it hardcoded.
     Trivial performance/brand win.
  ───────────────────────────────────────── */
  function initThemeColor(color = '#050505') {
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = color;
  }


  /* ─────────────────────────────────────────
     AUTO-INIT
     If a page includes ep-core.js, these run
     automatically on DOMContentLoaded.
     Individual functions can still be called
     manually if finer timing control is needed.
  ───────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMobileMenu();
    initProgressBar();
    initPopup();
    initThemeColor();
  });


  /* ─────────────────────────────────────────
     UTILITY: PREFERS REDUCED MOTION
     Returns true if the user has requested
     reduced motion at the OS level.
     Use before starting GSAP animations or
     RAF loops to respect accessibility.

     Usage: if (!EPCore.prefersReducedMotion()) startAnimation();
  ───────────────────────────────────────── */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }


  /* ─────────────────────────────────────────
     UTILITY: IS TOUCH DEVICE
     Returns true on touch-primary devices.
     Reliable: checks both pointer coarse and
     the touch events API as fallback.

     Usage: EPCore.isTouchDevice()
  ───────────────────────────────────────── */
  function isTouchDevice() {
    return window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  }


  /* ─────────────────────────────────────────
     UTILITY: VIEWPORT SIZE
     Returns { w, h } for current viewport.
     Cheaper than repeated window.innerWidth
     calls in hot animation paths.

     Usage: const { w, h } = EPCore.viewport();
  ───────────────────────────────────────── */
  function viewport() {
    return { w: window.innerWidth, h: window.innerHeight };
  }


  /* ─────────────────────────────────────────
     UTILITY: ON READY
     Runs fn immediately if DOM is already
     loaded, otherwise waits for the event.
     Safer than checking readyState manually.

     Usage: EPCore.onReady(() => { ... });
  ───────────────────────────────────────── */
  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }


  /* Public API */
  return {
    initNav,
    initMobileMenu,
    initProgressBar,
    initPopup,
    initThemeColor,
    prefersReducedMotion,
    isTouchDevice,
    viewport,
    onReady,
  };

})();
