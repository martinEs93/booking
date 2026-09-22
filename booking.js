const API = 'https://api.corecruises.info/v1';
const token = new URLSearchParams(location.search).get('token');
const form = document.querySelector('#form'), intro = document.querySelector('#intro'), travelers = document.querySelector('#travelers'), message = document.querySelector('#message');
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
let cabins = [], personSequence = 0;
const displayBirth = v => /^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v.split('-').reverse().join('.') : (v || '');
function birthISO(input) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(input.value.trim());
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : '';
  const date = new Date(iso + 'T12:00:00Z');
  const today = new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Berlin'}).format(new Date());
  const valid = match && !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === iso && iso >= '1900-01-01' && iso <= today;
  input.setCustomValidity(valid ? '' : 'Bitte ein gültiges Geburtsdatum als TT.MM.JJJJ eingeben, z. B. 23.08.1993.');
  return valid ? iso : null;
}
function cabinOptions(value) {
  const selected = value || (cabins.length === 1 ? cabins[0].index : '');
  return '<option value="">Bitte auswählen</option>' + cabins.map(c => `<option value="${c.index}" ${Number(selected) === Number(c.index) ? 'selected' : ''}>${esc(c.label)}</option>`).join('');
}
function row(v = {}) {
  const id = ++personSequence;
  const el = document.createElement('div'); el.className = 'traveler';
  const field = (key,label,value,extra='') => `<label>${label}<input name="person_${id}_${key}" data-field="${key}" autocomplete="off" value="${esc(value)}" ${extra}></label>`;
  el.innerHTML = field('first_name','Vorname*',v.first_name,'required') + field('last_name','Nachname*',v.last_name,'required') + field('birth_date','Geburtsdatum*',displayBirth(v.birth_date),'required type="text" inputmode="numeric" placeholder="TT.MM.JJJJ" maxlength="10" data-birth') + field('nationality','Staatsangehörigkeit*',v.nationality,'required') + field('loyalty_number','Treuenummer (optional)',v.loyalty_number) + `<label>Kabine*<select name="person_${id}_cabin" data-field="cabin_index" required>${cabinOptions(v.cabin_index)}</select></label><button type="button" class="secondary" aria-label="Person entfernen">Person entfernen</button>`;
  el.querySelector('button').onclick = () => el.remove();
  return el;
}
// Keep the numeric mobile keyboard; the field supplies the date separators.
form.addEventListener('beforeinput', e => {
  const input = e.target;
  if (!input.matches('[data-birth]') || input.selectionStart !== input.selectionEnd) return;
  const pos = input.selectionStart;
  // Delete the adjacent digit as well when backspace/delete reaches a separator.
  if (e.inputType === 'deleteContentBackward' && input.value[pos - 1] === '.') input.setSelectionRange(Math.max(0, pos - 2), pos);
  if (e.inputType === 'deleteContentForward' && input.value[pos] === '.') input.setSelectionRange(pos, pos + 2);
});
form.addEventListener('input', e => {
  const input = e.target;
  if (!input.matches('[data-birth]')) return;
  const digitsBeforeCursor = input.value.slice(0, input.selectionStart).replace(/\D/g, '').length;
  const digits = input.value.replace(/\D/g, '').slice(0, 8);
  input.value = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('.');
  let cursor = 0, seen = 0;
  while (cursor < input.value.length && seen < digitsBeforeCursor) {
    if (/\d/.test(input.value[cursor])) seen++;
    cursor++;
  }
  if (input.value[cursor] === '.') cursor++;
  input.setSelectionRange(cursor, cursor);
  input.setCustomValidity('');
});
document.querySelector('#add').onclick = () => travelers.append(row());
async function request(options) {
  const response = await fetch(API + '/booking-form?token=' + encodeURIComponent(token), options);
  const data = await response.json(); if(!response.ok) throw new Error(data.error || 'Die Anfrage konnte nicht verarbeitet werden.'); return data;
}
if(!token) intro.textContent = 'Der Formularlink fehlt.';
else request().then(data => {
  cabins = data.cabins || [{index:1,label:'Kabine 1'}];
  form.elements.lead_cabin_index.innerHTML = cabinOptions(data.lead?.lead_cabin_index);
  intro.textContent = `Vorgang ${data.reference}: ${[data.cruise_line,data.ship,data.route].filter(Boolean).join(' · ')}`;
  for(const [key,value] of Object.entries(data.lead || {})) {
    const name = {first_name:'lead_first_name',last_name:'lead_last_name',email:'lead_email'}[key] || key;
    const input = form.elements[name];
    if(input && value !== null && value !== '') input.value = name === 'lead_birth_date' ? displayBirth(value) : value;
  }
  for(const person of data.travelers || []) travelers.append(row(person));
  form.hidden = false;
}).catch(e => { intro.textContent = e.message || 'Dieser Formularlink ist ungültig oder abgelaufen.'; });
form.onsubmit = async event => {
  event.preventDefault(); message.textContent = '';
  const data = Object.fromEntries([...new FormData(form)].filter(([name]) => !name.startsWith('person_')));
  data.lead_birth_date = birthISO(form.elements.lead_birth_date);
  data.travelers = [...travelers.querySelectorAll('.traveler')].map(el => Object.fromEntries([...el.querySelectorAll('[data-field]')].map(input => [input.dataset.field, input.dataset.field === 'birth_date' ? birthISO(input) : input.value.trim()])));
  if(!form.reportValidity()) return;
  const button = form.querySelector('[type="submit"]'); button.disabled = true;
  try {
    const result = await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
    form.hidden = true; document.querySelector('#done').hidden = false; document.querySelector('#reference').textContent = `Vorgang ${result.reference}`;
  } catch(e) {message.textContent = e.message || 'Die Daten konnten nicht übermittelt werden.';}
  finally {button.disabled = false;}
};
