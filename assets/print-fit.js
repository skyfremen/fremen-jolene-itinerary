(() => {
  /*
   * Browser print pagination is not exposed reliably enough to measure exact
   * A4 overflow before the print dialog. Use a deterministic content-density
   * heuristic instead. Dense days get a stronger print-only compact layout;
   * normal days remain unchanged.
   */
  function classifyDays() {
    document.querySelectorAll('.day').forEach(day => {
      day.classList.remove('print-dense-one-page');

      /* Day 1 shares the first sheet with the hero/summary, so do not force
         dense-day fitting there. It may continue naturally to page 2. */
      if (day.id === 'day1') return;

      const text = (day.innerText || '').replace(/\s+/g, ' ').trim();
      const chars = text.length;
      const events = day.querySelectorAll('.event').length;
      const longBlocks = [...day.querySelectorAll('.event-card, .note')]
        .filter(el => (el.innerText || '').trim().length >= 220).length;

      /* Tuned for itinerary pages: a text-heavy day such as Beijing Day 3
         is compacted, while ordinary 4-6 event days keep normal sizing. */
      const isDense =
        chars >= 900 ||
        (chars >= 700 && events >= 6) ||
        (longBlocks >= 2 && chars >= 600);

      if (isDense) day.classList.add('print-dense-one-page');
    });
  }

  function bindPrintButtons() {
    document.querySelectorAll('.print-btn').forEach(button => {
      button.onclick = event => {
        event.preventDefault();
        classifyDays();
        requestAnimationFrame(() => window.print());
      };
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    classifyDays();
    bindPrintButtons();
  });
  window.addEventListener('beforeprint', classifyDays);
  window.addEventListener('pageshow', classifyDays);

  window.prepareItineraryPrintFit = classifyDays;
})();
