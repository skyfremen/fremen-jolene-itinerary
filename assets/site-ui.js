(() => {
  const scriptUrl = document.currentScript?.src || new URL('assets/site-ui.js', document.baseURI).href;
  const versionUrl = new URL('../version.json', scriptUrl);

  const version = document.createElement('div');
  version.className = 'site-version';
  version.textContent = 'v…';
  version.setAttribute('aria-label', 'Site version');
  document.body.appendChild(version);

  fetch(versionUrl, { cache: 'no-store' })
    .then(response => response.ok ? response.json() : Promise.reject())
    .then(data => {
      const label = data.version || data.run_number || data.build || 'unknown';
      version.textContent = `v${label}`;
      const details = [data.sha, data.built_at].filter(Boolean).join(' · ');
      if (details) version.title = details;
    })
    .catch(() => {
      version.textContent = 'v?';
    });

  const topButton = document.createElement('button');
  topButton.type = 'button';
  topButton.className = 'scroll-top';
  topButton.setAttribute('aria-label', 'Scroll to top');
  topButton.setAttribute('title', 'Scroll to top');
  topButton.textContent = '↑';
  document.body.appendChild(topButton);

  const updateVisibility = () => {
    topButton.classList.toggle('is-visible', window.scrollY > 500);
  };

  topButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', updateVisibility, { passive: true });
  updateVisibility();
})();
