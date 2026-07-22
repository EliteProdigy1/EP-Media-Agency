/* ══════════════════════════════════════════════════════════════════
   EP MEDIA OS — CURSOR ENGINE
   Gold dot + trailing ring + magnetic buttons + card tilt + parallax.
   Desktop only (pointer: fine). Touch devices exit immediately.

   Configurable via data attrs on <body>:
     data-cursor-color="#C9A84C"     (dot + ring color)
     data-cursor-labels="true"       (enable section labels)

   Usage: <script src="/core/js/ep-cursor.js" defer></script>
   ══════════════════════════════════════════════════════════════════ */

(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  /* ── Build cursor DOM ── */
  const dot   = document.createElement('div');
  const ring  = document.createElement('div');
  const label = document.createElement('span');
  dot.className   = 'ep-cursor-dot';
  ring.className  = 'ep-cursor-ring';
  label.className = 'ep-cursor-label';
  document.body.append(dot, ring, label);

  /* ── State ── */
  let dotX = 0, dotY = 0, ringX = 0, ringY = 0;
  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  /* ── RAF loop ── */
  (function tick() {
    dotX  += (mouseX - dotX)  * 0.88;
    dotY  += (mouseY - dotY)  * 0.88;
    ringX += (mouseX - ringX) * 0.10;
    ringY += (mouseY - ringY) * 0.10;

    dot.style.left   = dotX  + 'px';
    dot.style.top    = dotY  + 'px';
    ring.style.left  = ringX + 'px';
    ring.style.top   = ringY + 'px';
    label.style.left = (ringX + 28) + 'px';
    label.style.top  = (ringY - 8)  + 'px';

    requestAnimationFrame(tick);
  })();

  /* ── Visibility ── */
  document.addEventListener('mouseleave', () => {
    dot.style.opacity = ring.style.opacity = label.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = ring.style.opacity = '1';
  });

  /* ── Expand ring on interactive elements ── */
  const INTERACTIVE = [
    'a', 'button', '[role="button"]',
    '.ep-card', '.ep-tilt', '.ep-profile-card',
    '.ep-btn', '.ep-magnetic',
    /* Legacy EP classes */
    '.event-slide-inner', '.partnership-tier', '.allstar-step',
    '.eco-card', '.ep-athlete-card', '.founder-panel',
  ].join(',');

  document.addEventListener('mouseover', e => {
    if (e.target.closest(INTERACTIVE)) {
      ring.style.width = ring.style.height = '52px';
      ring.style.borderColor = 'rgba(201,168,76,0.9)';
      dot.style.width = dot.style.height = '10px';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(INTERACTIVE)) {
      ring.style.width = ring.style.height = '';
      ring.style.borderColor = '';
      dot.style.width = dot.style.height = '';
    }
  });

  /* ── Section-aware cursor labels ── */
  if (document.body.dataset.cursorLabels !== 'false') {
    const LABEL_ZONES = [
      { selector: '#hero',          text: 'SCROLL' },
      { selector: '#events',        text: 'SCROLL' },
      { selector: '#all-star-game', text: 'SCROLL' },
      { selector: '.founder-panel', text: 'MEET'   },
      { selector: '#programs',      text: 'SCROLL' },
      /* Client overrides: add data-cursor-label="EXPLORE" on any section */
    ];

    LABEL_ZONES.forEach(zone => {
      const el = document.querySelector(zone.selector);
      if (!el) return;
      el.addEventListener('mouseenter', () => {
        label.textContent = zone.text;
        label.style.opacity = '1';
      });
      el.addEventListener('mouseleave', () => {
        label.style.opacity = '0';
      });
    });

    /* data-cursor-label on any element */
    document.querySelectorAll('[data-cursor-label]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        label.textContent = el.dataset.cursorLabel;
        label.style.opacity = '1';
      });
      el.addEventListener('mouseleave', () => {
        label.style.opacity = '0';
      });
    });
  }

  /* ── Magnetic buttons ── */
  document.querySelectorAll('.ep-btn--primary, .ep-btn--ghost, .ep-magnetic, .btn-gold').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width  / 2)) * 0.28;
      const dy = (e.clientY - (r.top  + r.height / 2)) * 0.28;
      btn.style.transform  = `translate(${dx}px,${dy}px)`;
      btn.style.transition = 'transform 0.1s ease';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform  = '';
      btn.style.transition = 'transform 0.5s cubic-bezier(.25,.46,.45,.94)';
    });
  });

  /* ── Card tilt ── */
  document.querySelectorAll('.ep-tilt, .event-slide-inner, .partnership-tier, .ep-athlete-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width  - 0.5;
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform  = `perspective(900px) rotateY(${cx*7}deg) rotateX(${-cy*5}deg) scale(1.01)`;
      card.style.transition = 'transform 0.08s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform  = '';
      card.style.transition = 'transform 0.6s cubic-bezier(.25,.46,.45,.94)';
    });
  });

  /* ── Multi-layer parallax (hero + section BGs) ── */
  const PARALLAX_MAP = [
    { sel: '.hero-video-bg',    px: 10, py: 6  },
    { sel: '.ep-hero-video-bg', px: 10, py: 6  },
    { sel: '.hero-overlay',     px: -4, py: -3 },
    { sel: '.hero-content',     px: 6,  py: 4  },
    { sel: '.ep-hero-content',  px: 6,  py: 4  },
    { sel: '.story-tunnel-bg',  px: 8,  py: 5  },
    { sel: '.select-fabric-bg', px: -6, py: -4 },
    { sel: '.spotlight-img',    px: 7,  py: 4  },
  ];

  const parallaxEls = PARALLAX_MAP.map(({ sel, px, py }) => ({
    el: document.querySelector(sel),
    px, py,
  })).filter(x => x.el);

  document.addEventListener('mousemove', e => {
    const nx = e.clientX / window.innerWidth  - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;

    parallaxEls.forEach(({ el, px, py }) => {
      const parent = el.closest('section') || el.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.style.transform = `scale(1.04) translate(${nx * px}px,${ny * py}px)`;
      }
    });
  });

})();
