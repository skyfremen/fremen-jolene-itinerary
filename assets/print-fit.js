(() => {
  /*
   * iOS Safari does not expose reliable print pagination measurements.
   * Classify itinerary days by content density as soon as the page loads.
   * The shared print stylesheet then applies deterministic compact layouts.
   */
  function classifyDays() {
    document.querySelectorAll('.day').forEach(day => {
      day.classList.remove('print-dense-one-page', 'print-very-dense-one-page');

      /* Day 1 shares the first sheet with the hero/summary and may flow
         naturally if it needs more room. */
      if (day.id === 'day1') return;

      const text = (day.innerText || '').replace(/\s+/g, ' ').trim();
      const chars = text.length;
      const events = day.querySelectorAll('.event').length;
      const longBlocks = [...day.querySelectorAll('.event-card, .note')]
        .filter(el => (el.innerText || '').trim().length >= 220).length;

      const isVeryDense =
        chars >= 1200 ||
        (chars >= 950 && longBlocks >= 2) ||
        (chars >= 900 && events >= 7);

      const isDense =
        chars >= 800 ||
        (chars >= 650 && events >= 6) ||
        (longBlocks >= 2 && chars >= 550);

      if (isVeryDense) day.classList.add('print-very-dense-one-page');
      else if (isDense) day.classList.add('print-dense-one-page');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', classifyDays, { once: true });
  } else {
    classifyDays();
  }

  /* pageshow also covers Safari back/forward cache restores. */
  window.addEventListener('pageshow', classifyDays);

  window.prepareItineraryPrintFit = classifyDays;
})();
