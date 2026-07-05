/* ══════════════════════════════════════════════════════════════════
   EP MEDIA OS — CORE ENGINE
   Shared bootstrapper for all EP/client projects.
   Nav scroll, mobile menu, progress bar, email popup, utilities.
   Load on every page.

   Usage: <script src="/core/js/ep-core.js" defer></script>
   ══════════════════════════════════════════════════════════════════ */

const EPCore = (() => {

  /* ──────────────────────────────────────────
     NAV SCROLL
     Adds .scrolled after threshold px of scroll.
     Selector: auto-detects common EP nav IDs/classes,
     or pass custom selector.
     Data override: data-scroll-threshold="40"
  ────────────────────────────────────────── */
  function initNav(selector = '#main-nav, .ep-nav, #p-nav, [data-ep-nav]') {
    const nav = document.querySelector(selector);
    if (!nav) return;
    const threshold = parseInt(nav.dataset.scrollThreshold, 10) || 40;
    const tick = () => nav.classList.toggle('scrolled', window.scrollY > threshold);
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }


  /* ──────────────────────────────────────────
     MOBILE MENU
     Hamburger + slide-in panel + overlay.
     Closes on outside click, overlay click, Escape key, nav links.

     Required HTML attrs:
       hamburger: data-ep-hamburger
       menu panel: data-ep-menu, id="ep-mobile-menu"
       overlay (optional): data-ep-overlay
       close buttons: .mobile-close
  ────────────────────────────────────────── */
  function initMobileMenu() {
    const hamburger = document.querySelector('#hamburger, [data-ep-hamburger]');
    const menu      = document.querySelector('#ep-mobile-menu, [data-ep-menu]');
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

    hamburger.addEventListener('click', () =>
      menu.classList.contains('open') ? close() : open()
    );

    if (overlay) overlay.addEventListener('click', close);
    menu.querySelectorAll('.mobile-close').forEach(btn => btn.addEventListener('click', close));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', e => {
      if (menu.classList.contains('open') &&
          !menu.contains(e.target) &&
          !hamburger.contains(e.target)) close();
    });
  }


  /* ──────────────────────────────────────────
     SCROLL PROGRESS BAR
     Scales element from scaleX(0) to scaleX(1).
     CSS: transform-origin: left on the element.
     HTML: <div id="progress-bar"></div>
     or:   <div data-ep-progress></div>
  ────────────────────────────────────────── */
  function initProgressBar() {
    const bar = document.querySelector('#progress-bar, [data-ep-progress]');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const max = scrollHeight - clientHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollTop / max) : 0})`;
    }, { passive: true });
  }


  /* ──────────────────────────────────────────
     EMAIL POPUP
     Once per session. Configurable via body data attrs.

     <body data-popup-key="ep_seen"
           data-popup-color="gold"
           data-popup-delay="2000">

     Popup: id="ep-popup"
     Close triggers: [data-popup-close]

     Color variants: gold (default) | green | white
  ────────────────────────────────────────── */
  function initPopup() {
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

    popup.querySelectorAll('[data-popup-close]').forEach(el =>
      el.addEventListener('click', dismiss)
    );

    setTimeout(() => popup.classList.add('ep-popup--visible'), delay);
  }


  /* ──────────────────────────────────────────
     THEME COLOR META
     Sets the browser chrome color to EP black
     unless already present in the <head>.
  ────────────────────────────────────────── */
  function initThemeColor(color = '#050505') {
    if (document.querySelector('meta[name="theme-color"]')) return;
    const meta = Object.assign(document.createElement('meta'), {
      name: 'theme-color',
      content: color,
    });
    document.head.appendChild(meta);
  }


  /* ──────────────────────────────────────────
     AUTO-INIT on DOMContentLoaded
  ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMobileMenu();
    initProgressBar();
    initPopup();
    initThemeColor();
  });


  /* ──────────────────────────────────────────
     UTILITIES — exported on the public API
  ────────────────────────────────────────── */

  /** Returns true if user prefers reduced motion */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Returns true on touch-primary devices */
  const isTouchDevice = () =>
    window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  /** Current viewport dimensions */
  const viewport = () => ({ w: window.innerWidth, h: window.innerHeight });

  /** Run fn immediately if DOM ready, otherwise defer */
  const onReady = fn =>
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', fn, { once: true })
      : fn();

  /** Debounce a function */
  const debounce = (fn, ms = 100) => {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  };

  /** Clamp a number between min and max */
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /** Linear interpolation */
  const lerp = (a, b, t) => a + (b - a) * t;

  /** Map a value from one range to another */
  const mapRange = (val, inMin, inMax, outMin, outMax) =>
    ((val - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;


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
    debounce,
    clamp,
    lerp,
    mapRange,
  };

})();
