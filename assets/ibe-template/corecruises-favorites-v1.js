'use strict';

(() => {
  if (location.hostname !== 'suche.corecruises.de' || location.pathname !== '/offer') return;
  const params = new URLSearchParams(location.search);
  const providerType = String(params.get('t') || '').trim().toUpperCase();
  const cruiseId = String(params.get('cruise_id') || '').trim();
  if (providerType !== 'NS' || !/^[A-Za-z0-9._:-]{1,128}$/.test(cruiseId)) return;

  const root = document.getElementById('cc-ibe-inhalt');
  if (!root || root.querySelector('[data-cc-favorite-cta]')) return;

  const section = document.createElement('aside');
  section.className = 'cc-favorite-cta';
  section.dataset.ccFavoriteCta = '1';
  section.setAttribute('aria-label', 'Reise in Mein Core Cruises merken');

  const copy = document.createElement('div');
  copy.className = 'cc-favorite-cta__copy';
  const kicker = document.createElement('span');
  kicker.className = 'cc-favorite-cta__kicker';
  kicker.textContent = 'Für später merken';
  const title = document.createElement('strong');
  title.textContent = 'Diese Reise in Mein Core Cruises speichern';
  const text = document.createElement('span');
  text.textContent = 'So findest du sie später in deiner persönlichen Merkliste wieder.';
  copy.append(kicker, title, text);

  const target = new URL('https://mein.corecruises.de/');
  target.searchParams.set('action', 'save-favorite');
  target.searchParams.set('t', providerType);
  target.searchParams.set('cruise_id', cruiseId);
  const link = document.createElement('a');
  link.className = 'cc-favorite-cta__action';
  link.href = target.toString();
  link.textContent = 'Reise merken';
  link.setAttribute('rel', 'noopener');

  section.append(copy, link);
  root.prepend(section);
})();
