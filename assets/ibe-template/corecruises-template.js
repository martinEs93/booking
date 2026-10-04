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

/* v4.6 - footer year + homepage offers experience */
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

/* v4.6 - CruiseCompass homepage editorial layer + offer tabs */
(() => {
  'use strict';

  const normalize = (value) => String(value || '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const offerCategory = (text) => {
    const value = normalize(text);
    if (value.includes('fruhbuch')) return 'early';
    if (value.includes('last minute')) return 'last';
    if (
      value.includes('catch of the week') ||
      value.includes('verlockung der woche') ||
      value.includes('wochenend') ||
      value.includes('wochenaktion')
    ) return 'weekly';
    return 'special';
  };

  const setCurrentNav = () => {
    const isHome = location.pathname === '/' || location.pathname === '';
    document.querySelectorAll('.cc-shell-nav a, .cc-shell-mobile__nav a').forEach((link) => {
      link.removeAttribute('aria-current');
      const url = new URL(link.href, location.href);
      if (isHome && url.hostname === 'suche.corecruises.de' && url.pathname === '/') {
        link.setAttribute('aria-current', 'page');
      } else if (!isHome && url.hostname === 'suche.corecruises.de' && url.pathname.startsWith('/search')) {
        link.setAttribute('aria-current', 'page');
      }
    });
  };

  const enhanceHomepage = () => {
    setCurrentNav();

    const offers = document.getElementById('home-offers');
    const search = document.getElementById('home-cruisefinder');
    if (!offers || !search) return;

    const title = search.querySelector('.xtc-index-cruisefinder-title h1');
    if (title) title.textContent = 'Finde deine Kreuzfahrt';

    const offersContainer = offers.closest('.container-fluid') || offers;

    if (!document.querySelector('.cc-index-offers-intro')) {
      const intro = document.createElement('section');
      intro.className = 'cc-index-offers-intro';
      intro.innerHTML = `
        <span class="cc-index-offers-intro__kicker">Angebote &amp; Aktionen</span>
        <h1>Besondere Reisen. Aktuelle Aktionen.</h1>
        <p>Entdecke ausgewählte Wochenaktionen, Frühbuchervorteile und Last-Minute-Angebote. Mit einem Klick gelangst du direkt zu den passenden Reisen – und wenn du unsicher bist, beraten wir dich persönlich.</p>
        <a href="https://www.corecruises.de/angebote-und-aktionen/">Mehr darüber, worauf es bei Kreuzfahrtangeboten ankommt →</a>
      `;
      offersContainer.parentNode.insertBefore(intro, offersContainer);
    }

    const cards = [...offers.querySelectorAll(':scope > .col')];
    cards.forEach((col) => { col.dataset.ccOfferCategory = offerCategory(col.textContent); });

    if (!document.querySelector('.cc-index-tabs')) {
      const tabs = document.createElement('nav');
      tabs.className = 'cc-index-tabs';
      tabs.setAttribute('aria-label', 'Angebote filtern');

      [
        ['all', 'Alle'],
        ['early', 'Frühbucher'],
        ['last', 'Last Minute'],
        ['weekly', 'Wochenaktionen'],
        ['special', 'Weitere Specials']
      ].forEach(([value, label], index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cc-index-tab';
        button.dataset.ccOfferFilter = value;
        button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        button.textContent = label;
        button.addEventListener('click', () => {
          tabs.querySelectorAll('.cc-index-tab').forEach((node) => {
            node.setAttribute('aria-pressed', node === button ? 'true' : 'false');
          });
          cards.forEach((card) => {
            card.hidden = value !== 'all' && card.dataset.ccOfferCategory !== value;
          });
        });
        tabs.appendChild(button);
      });
      offersContainer.parentNode.insertBefore(tabs, offersContainer);
    }

    if (!document.querySelector('.cc-index-search-intro')) {
      const searchIntro = document.createElement('section');
      searchIntro.className = 'cc-index-search-intro';
      searchIntro.innerHTML = `
        <div class="cc-index-search-intro__inner">
          <span>Noch nicht das Richtige dabei?</span>
          <h2>Dann finde deine Kreuzfahrt selbst.</h2>
          <p>Wähle Reederei, Schiff, Zeitraum oder Reisedauer und starte direkt in die vollständige Kreuzfahrtsuche.</p>
        </div>
      `;
      search.parentNode.insertBefore(searchIntro, search);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceHomepage, {once:true});
  } else {
    enhanceHomepage();
  }
})();
