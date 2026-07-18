/* ============================================================
   Elite Prodigy Sports Group — GSAP Animations
   All ScrollTrigger, pinning, counter, and scroll logic
   ============================================================ */
(function () {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ---- Hero Blur-In (data-gsap="blur-in") ---- */
  gsap.utils.toArray('[data-gsap="blur-in"]').forEach((el) => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.from(el, {
      opacity: 0,
      y: 20,
      filter: 'blur(10px)',
      duration: 1.6,
      delay: delay + 0.4,
      ease: 'power2.out',
    });
  });

  /* ---- Section Reveals (Pattern A — calm, guided) ---- */
  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, y: 36, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          end: 'top 50%',
          scrub: 0.5,
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  /* ---- Pinned Story Section (Pattern B) ---- */
  const storySection = document.getElementById('our-story');
  if (storySection) {
    const phase1 = storySection.querySelector('.story-phase-1');
    const phase2 = storySection.querySelector('.story-phase-2');
    const phase3 = storySection.querySelector('.story-phase-3');

    if (phase1 && phase2 && phase3) {
      // Set initial states
      gsap.set(phase2, { opacity: 0, y: 50 });
      gsap.set(phase3, { opacity: 0, y: 50 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: storySection,
          start: 'top top',
          end: '+=300%',
          scrub: 1,
          /* CSS position:sticky on .story-phases already handles the visual lock.
             Do NOT use GSAP pin here — it fights sticky and corrupts scroll height
             calculations that the hero and all-star pins depend on. */
        },
      });

      tl.to(phase1, { opacity: 0, y: -50, duration: 1 })
        .to(phase2, { opacity: 1, y: 0, duration: 1 }, '<0.5')
        .to(phase2, { opacity: 0, y: -50, duration: 1 }, '+=1')
        .to(phase3, { opacity: 1, y: 0, duration: 1 }, '<0.5');
    }
  }

  /* ---- Horizontal Event Scroll — native CSS only, no GSAP pin ---- */
  // GSAP pin removed: conflicts with overflow-x:auto touch scroll on mobile.
  // Cards scroll via CSS scroll-snap-type: x mandatory on #events-scroll-wrapper.
  if (false) { // disabled
  }

  /* ---- Counter Animations (Pattern D) ---- */
  gsap.utils.toArray('[data-counter]').forEach((el) => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
      onUpdate() {
        el.textContent = Math.round(obj.val) + suffix;
      },
    });
  });

  /* ---- Ecosystem Cards Stagger (Pattern E) ---- */
  const ecoGrid = document.querySelector('.eco-grid');
  if (ecoGrid) {
    gsap.from('.eco-card', {
      opacity: 0,
      y: 60,
      stagger: 0.08,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: ecoGrid, start: 'top 75%' },
    });
  }

  /* ---- Partnership Grid — Mask Wipe Reveal ---- */
  gsap.utils.toArray('.ep-wipe').forEach((el) => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (isMobile) {
      /* Mobile fallback: standard opacity fade */
      gsap.fromTo(el,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 1.1, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        }
      );
      return;
    }
    /* Desktop: animate --wipe-pos CSS custom property left→right */
    gsap.fromTo(el,
      { '--wipe-pos': '0%' },
      {
        '--wipe-pos': '110%',
        duration: 1.4,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          onComplete() { el.classList.add('ep-wipe--done'); },
        },
      }
    );
    /* Children subtle stagger under the wipe */
    gsap.from(el.children, {
      opacity: 0,
      y: 28,
      stagger: 0.08,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 80%' },
    });
  });

  /* ---- Card Hover Tilt ---- */
  gsap.utils.toArray('.eco-card, .event-slide-inner, .partnership-tier').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 6,
        rotateX: -y * 6,
        duration: 0.4,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'power3.out' });
    });
  });

  // Refresh ScrollTrigger after fonts/images load
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
