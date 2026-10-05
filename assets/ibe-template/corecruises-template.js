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

/* v4.8 - footer year + homepage offers experience */
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

/* v4.8 - CruiseCompass homepage editorial layer + combined offer filters */
(() => {
  'use strict';

  const normalize = (value) => String(value || '')
    .toLocaleLowerCase('de-DE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const cardTitle = (card) =>
    card.querySelector('.card-body .h3, .card-title, h2, h3')?.textContent?.trim()
    || card.textContent
    || '';

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

  const lineDefinitions = [
    {id: 'msc', label: 'MSC', match: (v) => /(^|\W)msc(\W|$)/.test(v)},
    {id: 'aida', label: 'AIDA', match: (v) => v.includes('aida')},
    {id: 'mein-schiff', label: 'Mein Schiff', match: (v) => v.includes('mein schiff') || v.includes('tui cruises')},
    {id: 'costa', label: 'Costa', match: (v) => v.includes('costa')},
    {id: 'explora', label: 'Explora Journeys', match: (v) => v.includes('explora')},
    {id: 'ncl', label: 'Norwegian Cruise Line', match: (v) => v.includes('norwegian') || /(^|\W)ncl(\W|$)/.test(v)},
    {id: 'royal', label: 'Royal Caribbean', match: (v) => v.includes('royal caribbean')}
  ];

  const offerLine = (text) => {
    const value = normalize(text);
    return lineDefinitions.find((line) => line.match(value))?.id || 'other';
  };

  const setCurrentNav = () => {
    const isHome = location.pathname === '/' || location.pathname === '';

    document.querySelectorAll('.cc-shell-nav a, .cc-shell-mobile__nav a').forEach((link) => {
      link.removeAttribute('aria-current');
      const url = new URL(link.href, location.href);

      if (isHome && url.hostname === 'suche.corecruises.de' && url.pathname === '/') {
        link.setAttribute('aria-current', 'page');
      } else if (
        !isHome &&
        url.hostname === 'suche.corecruises.de' &&
        url.pathname.startsWith('/search')
      ) {
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
    const parent = offersContainer.parentNode;
    if (!parent) return;

    if (!document.querySelector('.cc-index-offers-intro')) {
      const intro = document.createElement('section');
      intro.className = 'cc-index-offers-intro';
      intro.innerHTML = `
        <span class="cc-index-offers-intro__kicker">Angebote &amp; Aktionen</span>
        <h1>Besondere Reisen. Aktuelle Aktionen.</h1>
        <p>Entdecke ausgewählte Wochenaktionen, Frühbuchervorteile und Last-Minute-Angebote. Mit einem Klick gelangst du direkt zu den passenden Reisen – und wenn du unsicher bist, beraten wir dich persönlich.</p>
        <a href="https://www.corecruises.de/angebote-und-aktionen/">Mehr darüber, worauf es bei Kreuzfahrtangeboten ankommt →</a>
      `;
      parent.insertBefore(intro, offersContainer);
    }

    const cards = [...offers.querySelectorAll(':scope > .col')];

    cards.forEach((card) => {
      const titleText = cardTitle(card);
      card.dataset.ccOfferCategory = offerCategory(titleText);
      card.dataset.ccOfferLine = offerLine(titleText);
    });

    let selectedType = 'all';
    let selectedLine = 'all';

    let emptyState = document.querySelector('.cc-index-empty');
    if (!emptyState) {
      emptyState = document.createElement('p');
      emptyState.className = 'cc-index-empty';
      emptyState.hidden = true;
      emptyState.setAttribute('role', 'status');
      emptyState.setAttribute('aria-live', 'polite');
      emptyState.textContent = 'Für diese Kombination sind aktuell keine Aktionen vorhanden.';
      parent.insertBefore(emptyState, offersContainer);
    }

    const applyFilters = () => {
      let visible = 0;

      cards.forEach((card) => {
        const matchesType =
          selectedType === 'all' ||
          card.dataset.ccOfferCategory === selectedType;

        const matchesLine =
          selectedLine === 'all' ||
          card.dataset.ccOfferLine === selectedLine;

        const show = matchesType && matchesLine;
        card.hidden = !show;
        if (show) visible += 1;
      });

      emptyState.hidden = visible !== 0;
    };

    let typeTabs = document.querySelector('.cc-index-tabs');
    if (!typeTabs) {
      typeTabs = document.createElement('nav');
      typeTabs.className = 'cc-index-tabs';
      typeTabs.setAttribute('aria-label', 'Angebotstyp filtern');

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
          selectedType = value;

          typeTabs.querySelectorAll('.cc-index-tab').forEach((node) => {
            node.setAttribute(
              'aria-pressed',
              node === button ? 'true' : 'false'
            );
          });

          applyFilters();
        });

        typeTabs.appendChild(button);
      });

      parent.insertBefore(typeTabs, offersContainer);
    }

    const presentLineIds = [...new Set(
      cards.map((card) => card.dataset.ccOfferLine)
    )];

    const orderedLines = lineDefinitions
      .filter((line) => presentLineIds.includes(line.id))
      .map((line) => [line.id, line.label]);

    if (presentLineIds.includes('other')) {
      orderedLines.push(['other', 'Weitere Reedereien']);
    }

    if (orderedLines.length > 1 && !document.querySelector('.cc-index-line-filter')) {
      const lineFilter = document.createElement('div');
      lineFilter.className = 'cc-index-line-filter';

      const label = document.createElement('span');
      label.className = 'cc-index-line-filter__label';
      label.textContent = 'Reederei';

      const lineTabs = document.createElement('nav');
      lineTabs.className = 'cc-index-line-tabs';
      lineTabs.setAttribute('aria-label', 'Reederei filtern');

      [['all', 'Alle Reedereien'], ...orderedLines].forEach(([value, text], index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cc-index-line-tab';
        button.dataset.ccLineFilter = value;
        button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        button.textContent = text;

        button.addEventListener('click', () => {
          selectedLine = value;

          lineTabs.querySelectorAll('.cc-index-line-tab').forEach((node) => {
            node.setAttribute(
              'aria-pressed',
              node === button ? 'true' : 'false'
            );
          });

          applyFilters();
        });

        lineTabs.appendChild(button);
      });

      lineFilter.append(label, lineTabs);
      parent.insertBefore(lineFilter, offersContainer);
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

    applyFilters();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceHomepage, {once: true});
  } else {
    enhanceHomepage();
  }
})();

/* v4.8 - mobile WhatsApp quick contact */
(() => {
  'use strict';

  const addWhatsAppQuickContact = () => {
    if (document.querySelector('.cc-whatsapp-quick')) return;

    const link = document.createElement('a');
    link.className = 'cc-whatsapp-quick';
    link.href = 'https://wa.me/message/BYT2RSP4EVJCI1';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', 'Core Cruises per WhatsApp schreiben');
    link.setAttribute('title', 'Per WhatsApp schreiben');

    link.innerHTML = `
      <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <path d="M16 3a13 13 0 0 0-11.1 19.8L3 29l6.4-1.7A13 13 0 1 0 16 3Zm0 2.3a10.7 10.7 0 0 1 9.2 16.2A10.7 10.7 0 0 1 10 25l-.5-.3-3.8 1 1-3.7-.3-.6A10.7 10.7 0 0 1 16 5.3Zm-5.2 4c-.3 0-.8.1-1.2.6-.4.4-1.5 1.5-1.5 3.7s1.6 4.3 1.8 4.6c.2.3 3.1 4.8 7.6 6.5 3.7 1.5 4.5 1.2 5.3 1.1.8-.1 2.6-1.1 3-2.1.4-1 .4-1.9.3-2.1-.1-.2-.4-.3-1-.6l-3-1.4c-.5-.2-.8-.3-1.2.3-.3.6-1.3 1.6-1.6 1.9-.3.3-.6.4-1.1.1-.5-.2-2.1-.8-4-2.5-1.5-1.3-2.5-3-2.8-3.5-.3-.5 0-.8.2-1 .2-.2.5-.6.7-.8.3-.3.4-.5.6-.9.2-.3.1-.7 0-.9l-1.4-3.4c-.3-.8-.7-.8-1-.8h-.7Z"/>
      </svg>
    `;

    document.body.appendChild(link);
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      addWhatsAppQuickContact,
      {once: true}
    );
  } else {
    addWhatsAppQuickContact();
  }
})();
