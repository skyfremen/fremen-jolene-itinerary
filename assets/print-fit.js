(() => {
  const MM_TO_PX = 96 / 25.4;
  const PAGE_HEIGHT_PX = (297 - 20) * MM_TO_PX; // A4 minus 10mm top/bottom margins
  const MAX_OVERFLOW_RATIO = 1.25;
  const FIT_SAFETY = 0.965;
  const MIN_SCALE = 0.80;

  function getPrintStylesheets() {
    return [...document.querySelectorAll('link[rel="stylesheet"]')]
      .filter(link => (link.getAttribute('href') || '').includes('assets/print.css'));
  }

  function resetDay(day) {
    day.classList.remove('print-fit-one-page');
    day.style.removeProperty('--print-fit-scale');
  }

  function clearFitClasses() {
    document.querySelectorAll('.day').forEach(resetDay);
  }

  function availableHeightFor(day) {
    if (day.id !== 'day1') return PAGE_HEIGHT_PX;

    const header = document.querySelector('header');
    const summary = document.querySelector('.summary-grid');
    const used = (header?.getBoundingClientRect().height || 0) +
      (summary?.getBoundingClientRect().height || 0);

    return Math.max(PAGE_HEIGHT_PX - used, PAGE_HEIGHT_PX * 0.45);
  }

  function calculateFitUsingActivePrintStyles() {
    clearFitClasses();

    document.querySelectorAll('.day').forEach(day => {
      const available = availableHeightFor(day);
      const height = day.getBoundingClientRect().height;
      const ratio = height / available;

      if (ratio > 1 && ratio <= MAX_OVERFLOW_RATIO) {
        let scale = Math.max(MIN_SCALE, Math.min(0.995, (available / height) * FIT_SAFETY));
        day.style.setProperty('--print-fit-scale', scale.toFixed(4));
        day.classList.add('print-fit-one-page');

        // Re-check using the real scaled print layout and make one corrective pass.
        const scaledHeight = day.getBoundingClientRect().height;
        if (scaledHeight > available) {
          scale = Math.max(MIN_SCALE, scale * (available / scaledHeight) * 0.99);
          day.style.setProperty('--print-fit-scale', scale.toFixed(4));
        }
      }
    });
  }

  function preparePrintFit() {
    const links = getPrintStylesheets();
    if (!links.length) return;

    const previousMedia = links.map(link => link.getAttribute('media'));
    const root = document.documentElement;
    const previousVisibility = root.style.visibility;

    // Apply the real print stylesheet briefly, while hidden, so measurements match
    // the layout Chrome will paginate. Keep the resulting fit classes after restoring
    // the normal screen stylesheet state.
    root.style.visibility = 'hidden';
    links.forEach(link => link.setAttribute('media', 'all'));
    void document.body.offsetHeight;

    calculateFitUsingActivePrintStyles();
    void document.body.offsetHeight;

    links.forEach((link, index) => {
      const media = previousMedia[index];
      if (media == null) link.removeAttribute('media');
      else link.setAttribute('media', media);
    });
    root.style.visibility = previousVisibility;
  }

  let resizeTimer;
  function schedulePrepare() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(preparePrintFit, 120);
  }

  window.addEventListener('load', preparePrintFit);
  window.addEventListener('beforeprint', preparePrintFit);
  window.addEventListener('resize', schedulePrepare, { passive: true });
  window.addEventListener('orientationchange', schedulePrepare, { passive: true });

  if (document.fonts?.ready) {
    document.fonts.ready.then(preparePrintFit).catch(() => {});
  }

  // Expose this so any custom print button can explicitly prepare first if needed.
  window.prepareItineraryPrintFit = preparePrintFit;
})();
