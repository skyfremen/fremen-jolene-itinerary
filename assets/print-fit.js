(() => {
  const MM_TO_PX = 96 / 25.4;
  const PAGE_HEIGHT_PX = (297 - 20) * MM_TO_PX; // A4 minus 10mm top/bottom margins
  const MAX_OVERFLOW_RATIO = 1.25;
  const FIT_SAFETY = 0.975;
  const MIN_SCALE = 0.80;

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

  function applyAdaptiveFit() {
    clearFitClasses();

    document.querySelectorAll('.day').forEach(day => {
      const available = availableHeightFor(day);
      const height = day.getBoundingClientRect().height;
      const ratio = height / available;

      if (ratio > 1 && ratio <= MAX_OVERFLOW_RATIO) {
        const scale = Math.max(MIN_SCALE, Math.min(0.995, (available / height) * FIT_SAFETY));
        day.style.setProperty('--print-fit-scale', scale.toFixed(4));
        day.classList.add('print-fit-one-page');
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
