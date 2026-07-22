/* ══════════════════════════════════════════════════════════════════
   EP MEDIA OS — GSAP ANIMATION ENGINE
   All ScrollTrigger, reveal, counter, stagger, tilt, and hero
   blur-in animations. Requires GSAP + ScrollTrigger loaded first.

   CDN (load before this file):
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

   Data attributes driven — no custom JS needed per page:
     data-gsap="blur-in"           → hero blur-in
     data-gsap="blur-in" data-delay="0.3"
     .reveal                       → scroll reveal (Pattern A)
     data-counter="42" data-suffix="+"  → animated counter
     .ep-stagger-parent            → children stagger in
   ══════════════════════════════════════════════════════════════════ */

(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('EP GSAP: GSAP or ScrollTrigger not loaded.');
    return;
  }
  if (typeof EPCore !== 'undefined' && EPCore.prefersReducedMotion()) return;

  gsap.registerPlugin(ScrollTrigger);

  /* ── Default easing ── */
  const E_OUT   = 'power3.out';
  const E_INOUT = 'power2.inOut';


  /* ════ HERO: Blur-In Load Animation ════
     Use on hero eyebrow, title, sub, actions.
     data-gsap="blur-in" data-delay="0.2"
  ════════════════════════════════════════ */
  gsap.utils.toArray('[data-gsap="blur-in"]').forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.to(el, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.5,
      delay: delay + 0.3,
      ease: E_OUT,
    });
    gsap.set(el, { opacity: 0, y: 20, filter: 'blur(12px)' });
  });

  /* Scroll indicator fade in */
  const scrollIndicator = document.querySelector('.ep-hero-scroll');
  if (scrollIndicator) {
    gsap.to(scrollIndicator, {
      opacity: 1,
      duration: 1,
      delay: 2,
      ease: 'power1.out',
    });
  }


  /* ════ SECTION REVEALS ════
     .reveal class → scroll-driven blur-up.
     Apply to any element that should reveal as it enters viewport.
     Already initialized with opacity:0/translateY/blur in ep-base.css.
  ════════════════════════════════════════ */
  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1.2,
      ease: E_OUT,
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        end: 'top 55%',
        scrub: 0.4,
        toggleActions: 'play none none reverse',
      },
    });
  });


  /* ════ STAGGER CHILDREN ════
     .ep-stagger-parent → children fade up in sequence.
     Optional: data-stagger="0.1" on parent to override delay.
  ════════════════════════════════════════ */
  gsap.utils.toArray('.ep-stagger-parent').forEach(parent => {
    const stagger = parseFloat(parent.dataset.stagger || 0.08);
    const children = Array.from(parent.children);
    gsap.from(children, {
      opacity: 0,
      y: 48,
      stagger,
      duration: 0.9,
      ease: E_OUT,
      scrollTrigger: {
        trigger: parent,
        start: 'top 80%',
      },
    });
  });


  /* ════ COUNTERS ════
     data-counter="42" data-suffix="%"
  ════════════════════════════════════════ */
  gsap.utils.toArray('[data-counter]').forEach(el => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
      onUpdate() { el.textContent = prefix + Math.round(obj.val) + suffix; },
    });
  });


  /* ════ PINNED SCROLL STORYTELLING ════
     Pattern B — sticky section with phase transitions.
     Usage:
       <section id="ep-story" data-gsap="story">
         <div class="story-phases"> (position: sticky)
           <div class="story-phase" data-phase="1">...</div>
           <div class="story-phase" data-phase="2">...</div>
           <div class="story-phase" data-phase="3">...</div>
         </div>
       </section>
  ════════════════════════════════════════ */
  const storySection = document.querySelector('[data-gsap="story"]');
  if (storySection) {
    const phases = storySection.querySelectorAll('.story-phase');
    if (phases.length >= 2) {
      phases.forEach((p, i) => {
        if (i > 0) gsap.set(p, { opacity: 0, y: 50 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: storySection,
          start: 'top top',
          end: `+=${phases.length * 100}%`,
          scrub: 1,
        },
      });

      phases.forEach((phase, i) => {
        if (i < phases.length - 1) {
          tl.to(phase, { opacity: 0, y: -50, duration: 1 });
          tl.to(phases[i + 1], { opacity: 1, y: 0, duration: 1 }, '<0.5');
        }
      });
    }
  }


  /* ════ CARD HOVER TILT ════
     .ep-tilt → 3D perspective tilt on mousemove.
     Add class to any card element.
  ════════════════════════════════════════ */
  document.querySelectorAll('.ep-tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, {
        rotateY: cx * 7,
        rotateX: -cy * 5,
        scale: 1.01,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 900,
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.6,
        ease: E_OUT,
      });
    });
  });


  /* ════ MAGNETIC BUTTONS ════
     .ep-btn--primary, .ep-btn--ghost → subtle magnet pull.
  ════════════════════════════════════════ */
  document.querySelectorAll('.ep-btn--primary, .ep-btn--ghost, .ep-magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.28;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
      gsap.to(btn, { x: dx, y: dy, duration: 0.3, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: E_OUT });
    });
  });


  /* ════ PARALLAX IMAGE SECTIONS ════
     .ep-parallax → subtle vertical shift on scroll.
     Works best on full-bleed <img> inside overflow:hidden containers.
  ════════════════════════════════════════ */
  gsap.utils.toArray('.ep-parallax').forEach(el => {
    const speed = parseFloat(el.dataset.parallaxSpeed || 0.15);
    gsap.to(el, {
      yPercent: -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });


  /* ════ HORIZONTAL SCROLL ROW ════
     .ep-h-scroll-track → horizontal card scroll via CSS.
     ScrollTrigger handles iOS momentum; no pin needed.
     data-gsap="h-scroll" triggers fade on scroll.
  ════════════════════════════════════════ */


  /* ── Refresh after assets load ── */
  window.addEventListener('load', () => ScrollTrigger.refresh());

})();
