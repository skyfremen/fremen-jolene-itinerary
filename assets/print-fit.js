(() => {
  const MM_TO_PX = 96 / 25.4;
  const PAGE_HEIGHT_PX = (297 - 20) * MM_TO_PX; // A4 minus 10mm top/bottom margins
  const MAX_OVERFLOW_RATIO = 1.18;

  function clearFitClasses() {
    document.querySelectorAll('.day.print-fit-one-page').forEach(day => {
      day.classList.remove('print-fit-one-page');
    });
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
