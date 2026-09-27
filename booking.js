const API = 'https://api.corecruises.info/v1';
const token = new URLSearchParams(location.search).get('token');
const form = document.querySelector('#form');
const intro = document.querySelector('#intro');
const cabinsRoot = document.querySelector('#cabins');
const message = document.querySelector('#message');
const nextButton = document.querySelector('#next');
const backButton = document.querySelector('#back');
const submitButton = document.querySelector('#submit');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const displayBirth = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v.split('-').reverse().join('.') : (v || '');
let currentStep = 1;
let personSequence = 0;
let initial = null;

function birthISO(input) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(input.value.trim());
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : '';
  const date = new Date(iso + 'T12:00:00Z');
  const today = new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date());
  const valid = match && !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === iso && iso >= '1900-01-01' && iso <= today;
  input.setCustomValidity(valid ? '' : 'Bitte ein gültiges Geburtsdatum als TT.MM.JJJJ eingeben, z. B. 23.08.1993.');
  return valid ? iso : null;
}

function cabinCount() { return cabinsRoot.querySelectorAll('[data-cabin-card]').length; }
function cabinCard(index) { return cabinsRoot.querySelector(`[data-cabin-card="${index}"]`); }
function cabinSelectOptions(selected) {
  return Array.from({length:cabinCount()}, (_,i) => `<option value="${i+1}" ${Number(selected)===i+1?'selected':''}>Kabine ${i+1}</option>`).join('');
}
function textField(key,label,value='',extra='') {
  return `<label>${label}<input data-field="${key}" value="${esc(value)}" ${extra}></label>`;
}
function travelerCard(data = {}, cabinIndex = 1) {
  const uid = ++personSequence;
  const el = document.createElement('div');
  el.className = 'person-card';
  el.dataset.personKind = 'traveler';
  el.dataset.personUid = String(uid);
  el.innerHTML = `<div class="person-card-head"><div><strong>Mitreisende Person</strong><small> vollständig wie im Reisedokument</small></div><div class="person-card-tools"><label>Kabine<select data-person-cabin aria-label="Kabine dieser Person">${cabinSelectOptions(cabinIndex)}</select></label><button type="button" class="remove-person">Person entfernen</button></div></div>`
    + textField('first_name','Vorname*',data.first_name,'required autocomplete="off"')
    + textField('last_name','Nachname*',data.last_name,'required autocomplete="off"')
    + textField('birth_date','Geburtsdatum*',displayBirth(data.birth_date),'required type="text" inputmode="numeric" placeholder="TT.MM.JJJJ" maxlength="10" data-birth autocomplete="off"')
    + textField('nationality','Staatsangehörigkeit*',data.nationality,'required autocomplete="off"')
    + textField('loyalty_number','Treuenummer Reederei (optional)',data.loyalty_number,'autocomplete="off"');
  el.querySelector('.remove-person').onclick = () => { el.remove(); refreshCabinMeta(); };
  el.querySelector('[data-person-cabin]').onchange = e => {
    const target = cabinCard(Number(e.target.value))?.querySelector('[data-cabin-people]');
    if (target) target.append(el);
    refreshCabinMeta();
  };
  return el;
}
function leadCard(data = {}, cabinIndex = 1) {
  const el = document.createElement('div');
  el.className = 'person-card lead';
  el.dataset.personKind = 'lead';
  el.innerHTML = `<div class="person-card-head"><div><strong>Reiseanmelder</strong><small> Hauptkontakt für diesen Vorgang</small></div><label>Kabine<select name="lead_cabin_index" aria-label="Kabine des Reiseanmelders">${cabinSelectOptions(cabinIndex)}</select></label></div>`
    + `<label>Vorname*<input name="lead_first_name" value="${esc(data.lead_first_name || '')}" required autocomplete="given-name"></label>`
    + `<label>Nachname*<input name="lead_last_name" value="${esc(data.lead_last_name || '')}" required autocomplete="family-name"></label>`
    + `<label>Geburtsdatum*<input name="lead_birth_date" value="${esc(displayBirth(data.lead_birth_date))}" required type="text" inputmode="numeric" placeholder="TT.MM.JJJJ" maxlength="10" data-birth autocomplete="bday"></label>`
    + `<label>Staatsangehörigkeit*<input name="lead_nationality" value="${esc(data.lead_nationality || '')}" required autocomplete="off"></label>`
    + `<label>Treuenummer Reederei (optional)<input name="lead_loyalty_number" value="${esc(data.lead_loyalty_number || '')}" autocomplete="off"></label>`;
  el.querySelector('[name="lead_cabin_index"]').onchange = e => {
    const target = cabinCard(Number(e.target.value))?.querySelector('[data-cabin-people]');
    if (target) target.prepend(el);
    refreshCabinMeta();
  };
  return el;
}
function createCabin(index) {
  const article = document.createElement('article');
  article.className = 'cabin-card';
  article.dataset.cabinCard = String(index);
  article.innerHTML = `<div class="cabin-card-head"><div><h3>Kabine ${index}</h3><span data-cabin-meta>Noch keine Person</span></div></div><div class="cabin-people" data-cabin-people></div><div class="cabin-card-actions"><button type="button" class="secondary add-person">+ Person zu Kabine ${index}</button></div>`;
  article.querySelector('.add-person').onclick = () => { article.querySelector('[data-cabin-people]').append(travelerCard({}, index)); refreshCabinMeta(); };
  cabinsRoot.append(article);
  return article;
}
function refreshLeadCabinOptions() {
  const select = form.elements.lead_cabin_index;
  if (!select) return;
  const selected = Math.min(Math.max(Number(select.value) || 1,1),cabinCount());
  select.innerHTML = cabinSelectOptions(selected);
  select.value = String(selected);
}
function refreshCabinMeta() {
  const count = cabinCount();
  document.querySelector('#cabinCount').textContent = `${count} ${count === 1 ? 'Kabine' : 'Kabinen'}`;
  document.querySelector('#removeCabin').disabled = count <= 1;
  refreshLeadCabinOptions();
  cabinsRoot.querySelectorAll('[data-cabin-card]').forEach(card => {
    const index = Number(card.dataset.cabinCard) || 1;
    const people = card.querySelectorAll('.person-card').length;
    card.querySelector('[data-cabin-meta]').textContent = `${people} ${people === 1 ? 'Person' : 'Personen'}`;
    card.querySelectorAll('[data-person-cabin]').forEach(select => { select.innerHTML = cabinSelectOptions(index); select.value = String(index); });
  });
}
function addCabin() {
  if (cabinCount() >= 20) { showMessage('Maximal 20 Kabinen sind möglich.'); return; }
  createCabin(cabinCount()+1);
  refreshCabinMeta();
}
function removeLastCabin() {
  const count = cabinCount();
  if (count <= 1) return;
  const card = cabinCard(count);
  if (card?.querySelector('.person-card')) {
    showMessage(`Kabine ${count} enthält noch Reisende. Bitte verschiebe bzw. entferne diese Personen zuerst.`);
    card.classList.add('shake'); setTimeout(()=>card.classList.remove('shake'),600); return;
  }
  card?.remove(); refreshCabinMeta(); showMessage('');
}
function showMessage(text) { message.textContent = text || ''; }

// Keep the numeric mobile keyboard; the field supplies the date separators.
form.addEventListener('beforeinput', e => {
  const input = e.target;
  if (!(input instanceof HTMLInputElement) || !input.matches('[data-birth]') || input.selectionStart !== input.selectionEnd) return;
  const pos = input.selectionStart;
  if (e.inputType === 'deleteContentBackward' && input.value[pos - 1] === '.') input.setSelectionRange(Math.max(0, pos - 2), pos);
  if (e.inputType === 'deleteContentForward' && input.value[pos] === '.') input.setSelectionRange(pos, pos + 2);
});
form.addEventListener('input', e => {
  const input = e.target;
  if (!(input instanceof HTMLInputElement) || !input.matches('[data-birth]')) return;
  const digitsBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
  const digits = input.value.replace(/\D/g, '').slice(0, 8);
  input.value = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('.');
  let cursor = 0, seen = 0;
  while (cursor < input.value.length && seen < digitsBeforeCursor) { if (/\d/.test(input.value[cursor])) seen++; cursor++; }
  if (input.value[cursor] === '.') cursor++;
  input.setSelectionRange(cursor, cursor);
  input.setCustomValidity('');
});

function stepElement(step) { return form.querySelector(`[data-step="${step}"]`); }
function validateStep(step) {
  const root = stepElement(step); if (!root) return true;
  const birthInputs = [...root.querySelectorAll('[data-birth]')];
  birthInputs.forEach(birthISO);
  const invalid = [...root.querySelectorAll('input,select')].find(el => el.required && !el.checkValidity());
  if (invalid) { invalid.reportValidity(); invalid.focus({preventScroll:true}); invalid.scrollIntoView({behavior:'smooth',block:'center'}); return false; }
  if (step === 1 && cabinCount() < 1) { showMessage('Bitte mindestens eine Kabine anlegen.'); return false; }
  if (step === 1) {
    const emptyCabin = [...root.querySelectorAll('[data-cabin-card]')].find(card => !card.querySelector('.person-card'));
    if (emptyCabin) {
      const index = Number(emptyCabin.dataset.cabinCard) || 1;
      showMessage(`Kabine ${index} ist noch leer. Bitte mindestens eine Person zuordnen oder die Kabine entfernen.`);
      emptyCabin.classList.add('shake');
      emptyCabin.scrollIntoView({behavior:'smooth',block:'center'});
      setTimeout(()=>emptyCabin.classList.remove('shake'),600);
      return false;
    }
  }
  return true;
}
function personSnapshot(card) {
  const get = key => card.querySelector(`[data-field="${key}"]`)?.value.trim() || '';
  return {first_name:get('first_name'),last_name:get('last_name'),birth_date:get('birth_date'),nationality:get('nationality')};
}
function renderReview() {
  const chunks = [];
  cabinsRoot.querySelectorAll('[data-cabin-card]').forEach(card => {
    const index = Number(card.dataset.cabinCard);
    const people = [...card.querySelectorAll('.person-card')].map(person => {
      if (person.dataset.personKind === 'lead') return {first_name:form.elements.lead_first_name.value.trim(),last_name:form.elements.lead_last_name.value.trim(),birth_date:form.elements.lead_birth_date.value.trim(),nationality:form.elements.lead_nationality.value.trim(),lead:true};
      return {...personSnapshot(person),lead:false};
    });
    chunks.push(`<article class="review-cabin"><h3>Kabine ${index} · ${people.length} ${people.length===1?'Person':'Personen'}</h3>${people.map(p=>`<div class="review-person"><strong>${esc([p.first_name,p.last_name].filter(Boolean).join(' '))}${p.lead?' · Reiseanmelder':''}</strong><span>geb. ${esc(p.birth_date)} · ${esc(p.nationality)}</span></div>`).join('')}</article>`);
  });
  chunks.push(`<article class="review-contact"><h3>Kontakt</h3><dl><dt>E-Mail</dt><dd>${esc(form.elements.lead_email.value)}</dd><dt>Telefon</dt><dd>${esc(form.elements.lead_phone.value)}</dd><dt>Adresse</dt><dd>${esc(`${form.elements.lead_street.value}, ${form.elements.lead_postal_code.value} ${form.elements.lead_city.value}, ${form.elements.lead_country.value}`)}</dd><dt>Notfallkontakt</dt><dd>${esc(`${form.elements.emergency_name.value} · ${form.elements.emergency_phone.value}`)}</dd></dl></article>`);
  document.querySelector('#reviewSummary').innerHTML = chunks.join('');
}
function setStep(step) {
  currentStep = Math.max(1,Math.min(3,step)); showMessage('');
  form.querySelectorAll('[data-step]').forEach(section => { const active = Number(section.dataset.step) === currentStep; section.hidden = !active; section.classList.toggle('is-active',active); });
  form.querySelectorAll('[data-step-button]').forEach(button => { const n=Number(button.dataset.stepButton); button.classList.toggle('is-active',n===currentStep); button.classList.toggle('is-done',n<currentStep); });
  backButton.hidden = currentStep === 1;
  nextButton.hidden = currentStep === 3;
  submitButton.hidden = currentStep !== 3;
  if (currentStep === 3) renderReview();
  form.querySelector('.steps')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function travelerPayload() {
  return [...cabinsRoot.querySelectorAll('[data-cabin-card]')].flatMap(card => {
    const cabinIndex = Number(card.dataset.cabinCard);
    return [...card.querySelectorAll('.person-card[data-person-kind="traveler"]')].map(person => {
      const obj = Object.fromEntries([...person.querySelectorAll('[data-field]')].map(input => [input.dataset.field, input.dataset.field === 'birth_date' ? birthISO(input) : input.value.trim()]));
      obj.cabin_index = cabinIndex; return obj;
    });
  });
}
function payload() {
  return {
    lead_first_name: form.elements.lead_first_name.value.trim(),
    lead_last_name: form.elements.lead_last_name.value.trim(),
    lead_birth_date: birthISO(form.elements.lead_birth_date),
    lead_nationality: form.elements.lead_nationality.value.trim(),
    lead_loyalty_number: form.elements.lead_loyalty_number.value.trim(),
    lead_email: form.elements.lead_email.value.trim(),
    lead_phone: form.elements.lead_phone.value.trim(),
    lead_street: form.elements.lead_street.value.trim(),
    lead_postal_code: form.elements.lead_postal_code.value.trim(),
    lead_city: form.elements.lead_city.value.trim(),
    lead_country: form.elements.lead_country.value.trim(),
    emergency_name: form.elements.emergency_name.value.trim(),
    emergency_phone: form.elements.emergency_phone.value.trim(),
    cabin_count: cabinCount(),
    lead_cabin_index: Number(form.elements.lead_cabin_index.value),
    data_accuracy: form.elements.data_accuracy.checked ? form.elements.data_accuracy.value : '',
    travelers: travelerPayload(),
  };
}

async function request(options) {
  const response = await fetch(API + '/booking-form?token=' + encodeURIComponent(token), options);
  const data = await response.json(); if(!response.ok) throw new Error(data.error || 'Die Anfrage konnte nicht verarbeitet werden.'); return data;
}
function hydrate(data) {
  initial = data;
  const lead = data.lead || {};
  const maxIndex = Math.max(1,Number(data.cabin_count)||1,Number(lead.lead_cabin_index)||1,...(data.travelers||[]).map(p=>Number(p.cabin_index)||1));
  for(let i=1;i<=maxIndex;i++) createCabin(i);
  const leadIndex = Math.min(Math.max(Number(lead.lead_cabin_index)||1,1),maxIndex);
  cabinCard(leadIndex).querySelector('[data-cabin-people]').append(leadCard(lead,leadIndex));
  for(const person of data.travelers || []) {
    const index=Math.min(Math.max(Number(person.cabin_index)||1,1),maxIndex);
    cabinCard(index).querySelector('[data-cabin-people]').append(travelerCard(person,index));
  }
  for(const [key,value] of Object.entries(lead)) {
    const input = form.elements[key];
    if(input && value !== null && value !== '' && !['lead_first_name','lead_last_name','lead_birth_date','lead_nationality','lead_loyalty_number','lead_cabin_index'].includes(key)) input.value = value;
  }
  form.elements.lead_email.value = lead.lead_email || '';
  const trip = [data.cruise_line,data.ship,data.route].filter(Boolean).join(' · ');
  intro.textContent = trip ? `Vorgang ${data.reference} · ${trip}` : `Vorgang ${data.reference} · Bitte ergänze eure Reisegruppe und Kabinenaufteilung.`;
  refreshCabinMeta();
  form.hidden = false;
  setStep(1);
}

nextButton.onclick = () => { if(validateStep(currentStep)) setStep(currentStep+1); };
backButton.onclick = () => setStep(currentStep-1);
document.querySelector('#addCabin').onclick = addCabin;
document.querySelector('#removeCabin').onclick = removeLastCabin;
form.querySelectorAll('[data-step-button]').forEach(button => button.onclick = () => { const target=Number(button.dataset.stepButton); if(target<currentStep)setStep(target); });

if(!token) intro.textContent = 'Der Formularlink fehlt.';
else request().then(hydrate).catch(e => { intro.textContent = e.message || 'Dieser Formularlink ist ungültig oder abgelaufen.'; });

form.onsubmit = async event => {
  event.preventDefault(); showMessage('');
  if (!validateStep(1) || !validateStep(2)) return;
  if (!form.elements.data_accuracy.checked) { form.elements.data_accuracy.reportValidity(); return; }
  const data = payload();
  submitButton.disabled = true;
  try {
    const result = await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    form.hidden = true; document.querySelector('#done').hidden = false; document.querySelector('#reference').textContent = `Vorgang ${result.reference}`;
    window.scrollTo({top:0,behavior:'smooth'});
  } catch(e) { showMessage(e.message || 'Die Daten konnten nicht übermittelt werden.'); }
  finally {submitButton.disabled = false;}
};
