/* ══════════════════════════════════════════════════════════════════
   EP MEDIA OS — FORMS ENGINE
   Netlify form submission, validation, confirmation, multi-step.
   Works with ep-forms.css.

   Usage (single-page form):
     <script src="/core/js/ep-forms.js" defer></script>
     Targets: form[data-netlify="true"]
     Auto-runs EPForms.init() on DOMContentLoaded.

   Usage (multi-step form):
     Same script. Use EPForms.initMultiStep('#form-id') manually.
   ══════════════════════════════════════════════════════════════════ */

const EPForms = (() => {

  /* ──────────────────────────────────────────
     NETLIFY SUBMISSION
     Handles form POST + shows confirmation.
     Confirmation element: .ep-form-confirm
     Form wrapper: .ep-form-card (hidden on success)
  ────────────────────────────────────────── */
  function handleSubmit(form) {
    const confirm  = document.querySelector('.ep-form-confirm');
    const formCard = document.querySelector('.ep-form-card');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        highlightErrors(form);
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled = true;
      }

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString(),
        });

        if (res.ok) {
          if (formCard) formCard.style.display = 'none';
          if (confirm)  confirm.classList.add('visible');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          throw new Error(`Server error: ${res.status}`);
        }
      } catch (err) {
        console.error('EP Form error:', err);
        if (submitBtn) {
          submitBtn.textContent = 'Try Again';
          submitBtn.disabled = false;
        }
        showFormError(form, 'Something went wrong. Please try again or email us directly.');
      }
    });
  }


  /* ──────────────────────────────────────────
     VALIDATION HELPERS
  ────────────────────────────────────────── */
  function highlightErrors(form) {
    const required = form.querySelectorAll('[required]');
    let first = null;

    required.forEach(el => {
      const field = el.closest('.ep-form-field');
      if (!el.value.trim() || (el.type === 'checkbox' && !el.checked)) {
        el.classList.add('error');
        if (field) field.classList.add('has-error');
        if (!first) first = el;
      } else {
        el.classList.remove('error');
        if (field) field.classList.remove('has-error');
      }
    });

    if (first) {
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first.focus();
    }
  }

  function showFormError(form, msg) {
    let errEl = form.querySelector('.ep-form-global-error');
    if (!errEl) {
      errEl = document.createElement('p');
      errEl.className = 'ep-form-global-error';
      errEl.style.cssText = 'color:#e05555;font-size:0.8rem;text-align:center;margin-top:12px;';
      form.querySelector('[type="submit"]')?.insertAdjacentElement('afterend', errEl);
    }
    errEl.textContent = msg;
  }

  /* Clear error on input */
  function attachLiveValidation(form) {
    form.querySelectorAll('.ep-form-input, .ep-form-select, .ep-form-textarea').forEach(el => {
      el.addEventListener('input', () => {
        el.classList.remove('error');
        const field = el.closest('.ep-form-field');
        if (field) field.classList.remove('has-error');
      });
    });
  }


  /* ──────────────────────────────────────────
     MULTI-STEP FORM
     Usage:
       EPForms.initMultiStep('#my-form', {
         steps: '.ob-step',        // step selector
         progress: '.ob-ps',       // progress dot selector
         nextBtn: '.ob-btn-next',  // next button selector
         backBtn: '.ob-btn-back',  // back button selector
         reviewFn: buildReview,    // optional: called before last step
       })
  ────────────────────────────────────────── */
  function initMultiStep(formSelector, opts = {}) {
    const form = document.querySelector(formSelector);
    if (!form) return;

    const steps    = [...form.querySelectorAll(opts.steps    || '.ob-step')];
    const dots     = [...form.querySelectorAll(opts.progress || '.ob-ps')];
    const nextBtns = [...form.querySelectorAll(opts.nextBtn  || '.ob-btn-next')];
    const backBtns = [...form.querySelectorAll(opts.backBtn  || '.ob-btn-back')];

    let current = 0;

    const setStep = (n) => {
      steps.forEach((s, i) => s.classList.toggle('active', i === n));
      dots.forEach((d, i) => {
        d.classList.toggle('active', i === n);
        d.classList.toggle('done', i < n);
      });
      current = n;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const validateStep = (n) => {
      const step = steps[n];
      const fields = [...step.querySelectorAll('[required]')];
      let valid = true;
      fields.forEach(el => {
        if (!el.value.trim() || (el.type === 'checkbox' && !el.checked)) {
          el.classList.add('error');
          valid = false;
        }
      });
      if (!valid) {
        const firstErr = step.querySelector('.error');
        firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return valid;
    };

    nextBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (!validateStep(current)) return;
        if (opts.reviewFn && current === steps.length - 2) opts.reviewFn();
        if (current < steps.length - 1) setStep(current + 1);
      });
    });

    backBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (current > 0) setStep(current - 1);
      });
    });

    setStep(0);

    /* Final submission */
    handleSubmit(form);
  }


  /* ──────────────────────────────────────────
     AUTO-INIT
     Single-step forms: just include this script.
     Multi-step: call EPForms.initMultiStep() manually.
  ────────────────────────────────────────── */
  function init() {
    document.querySelectorAll('form[data-netlify="true"]').forEach(form => {
      /* Skip multi-step forms (identified by data-multistep attr) */
      if (form.dataset.multistep !== undefined) return;
      attachLiveValidation(form);
      handleSubmit(form);
    });
  }

  document.addEventListener('DOMContentLoaded', init);


  /* Public API */
  return {
    init,
    initMultiStep,
    handleSubmit,
    highlightErrors,
  };

})();
