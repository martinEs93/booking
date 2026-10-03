/* Core Cruises | IBE shell | v6.0
 * Self-contained navigation behavior for suche.corecruises.de.
 * Does not touch IBE controls/forms/events.
 */
(() => {
  'use strict';

  function initCoreCruisesIbeShell() {
    const button = document.getElementById('ccHomeMenu');
    const nav = document.getElementById('ccHomeNav');

    if (button && nav) {
      const close = () => {
        nav.classList.remove('is-open');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-label', 'Menü öffnen');
      };

      button.addEventListener('click', () => {
        const open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      });

      nav.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a')) close();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
          close();
          button.focus();
        }
      });

      window.matchMedia('(min-width: 1181px)').addEventListener('change', (event) => {
        if (event.matches) close();
      });
    }

    document.querySelectorAll('[data-cc-year]').forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoreCruisesIbeShell, { once: true });
  } else {
    initCoreCruisesIbeShell();
  }
})();
