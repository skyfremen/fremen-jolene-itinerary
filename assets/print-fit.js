(() => {
  const MM_TO_PX = 96 / 25.4;
  const PAGE_HEIGHT_PX = (297 - 20) * MM_TO_PX; // A4 minus 10mm top/bottom margins
  const MAX_OVERFLOW_RATIO = 1.25;
  const FIT_SAFETY = 0.985;

  function resetDay(day) {
    day.classList.remove('print-fit-one-page');
    day.style.removeProperty('--print-fit-font-size');
    day.style.removeProperty('--print-fit-line-height');
    day.style.removeProperty('--print-fit-head-margin');
    day.style.removeProperty('--print-fit-head-padding');
    day.style.removeProperty('--print-fit-event-padding');
    day.style.removeProperty('--print-fit-event-gap');
    day.style.removeProperty('--print-fit-time-size');
    day.style.removeProperty('--print-fit-h3-margin');
    day.style.removeProperty('--print-fit-note-margin');
    day.style.removeProperty('--print-fit-tag-y');
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

  function applyFit(day, factor) {
    const f = Math.max(0.80, Math.min(0.99, factor));
    day.classList.add('print-fit-one-page');
    day.style.setProperty('--print-fit-font-size', `${(f * 100).toFixed(1)}%`);
    day.style.setProperty('--print-fit-line-height', Math.max(1.08, 1.35 * f).toFixed(3));
    day.style.setProperty('--print-fit-head-margin', `${Math.max(2.2, 5 * f).toFixed(2)}mm`);
    day.style.setProperty('--print-fit-head-padding', `${Math.max(1.0, 2 * f).toFixed(2)}mm`);
    day.style.setProperty('--print-fit-event-padding', `${Math.max(1.5, 3.2 * f).toFixed(2)}mm`);
    day.style.setProperty('--print-fit-event-gap', `${Math.max(2.0, 4 * f).toFixed(2)}mm`);
    day.style.setProperty('--print-fit-time-size', `${Math.max(7.2, 9 * f).toFixed(2)}pt`);
    day.style.setProperty('--print-fit-h3-margin', `${Math.max(0.35, 1 * f).toFixed(2)}mm`);
    day.style.setProperty('--print-fit-note-margin', `${Math.max(0.6, 1.5 * f).toFixed(2)}mm`);
    day.style.setProperty('--print-fit-tag-y', `${Math.max(0.25, 0.6 * f).toFixed(2)}mm`);
  }

  function applyAdaptiveFit() {
    clearFitClasses();

    document.querySelectorAll('.day').forEach(day => {
      const available = availableHeightFor(day);
      const height = day.getBoundingClientRect().height;
      const ratio = height / available;

      if (ratio > 1 && ratio <= MAX_OVERFLOW_RATIO) {
        const neededFactor = (available / height) * FIT_SAFETY;
        applyFit(day, neededFactor);
      }
    });
  }

  window.addEventListener('beforeprint', applyAdaptiveFit);
  window.addEventListener('afterprint', clearFitClasses);

  if (window.matchMedia) {
    const media = window.matchMedia('print');
    const handler = event => event.matches ? applyAdaptiveFit() : clearFitClasses();
    if (media.addEventListener) media.addEventListener('change', handler);
    else if (media.addListener) media.addListener(handler);
  }
})();
