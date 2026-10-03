/* Core Cruises | IBE template integration | v5.0
 * Header/mobile navigation is handled by the same corecruises-home.js
 * used on www.corecruises.de.
 *
 * This file intentionally does not touch IBE selectors, forms, dates,
 * booking events, cookies, localStorage, sessionStorage or network requests.
 */
(() => {
  'use strict';

  function initIbeShell() {
    /* Fallback for the footer year in case the main-site script is delayed. */
    document.querySelectorAll('[data-cc-year]').forEach((node) => {
      if (!node.textContent.trim()) node.textContent = String(new Date().getFullYear());
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIbeShell, { once: true });
  } else {
    initIbeShell();
  }
})();
