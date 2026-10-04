/* Core Cruises | IBE shell v4.0
 * Only the added mobile navigation is addressed. The supplied logo loads directly.
 * No IBE selectors, form events, cookies, storage or network submissions.
 */
(() => {
  'use strict';
  function initCoreCruisesShell() {
    const menu = document.getElementById('cc-shell-mobile-menu');
    if (!(menu instanceof HTMLDetailsElement)) return;
    const summary = menu.querySelector('summary');
    menu.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('a')) menu.open = false;
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.open) {
        menu.open = false;
        summary?.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (menu.open && event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
    });
    window.matchMedia('(min-width: 1200px)').addEventListener('change', (event) => {
      if (event.matches) menu.open = false;
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreCruisesShell, {once: true});
  } else {
    initCoreCruisesShell();
  }
})();

/* v4.4 - footer year + homepage copy */
(() => {
  'use strict';
  const updateYear = () => document.querySelectorAll('[data-cc-year]').forEach(
    node => node.textContent = String(new Date().getFullYear())
  );
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateYear, {once:true});
  } else {
    updateYear();
  }
})();

/* v4.4 - German homepage copy: formal -> Core Cruises du */
(() => {
  'use strict';

  const updateHomepageCopy = () => {
    const home = document.getElementById('home-cruisefinder');
    if (!home) return;

    const title = home.querySelector('.xtc-index-cruisefinder-title h1');
    if (title && title.textContent.trim() === 'Finden Sie Ihre Kreuzfahrt') {
      title.textContent = 'Finde deine Kreuzfahrt';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateHomepageCopy, {once:true});
  } else {
    updateHomepageCopy();
  }
})();
