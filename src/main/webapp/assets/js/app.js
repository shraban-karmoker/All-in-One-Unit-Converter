(() => {
'use strict';
const $ = s => document.querySelector(s), CX = window.CX;
const DEFAULTS = {theme: 'light', decimals: 6};
const S = {cat: 'length', from: 'meter', to: 'kilometer', theme: CX.theme, decimals: CX.decimals, history: [], favs: []};
const QUICK = [['length','mile','kilometer','1'],['weight','kilogram','pound','1'],['temperature','celsius','fahrenheit','37'],
               ['data','gb','mb','1'],['speed','kmh','mph','100'],['volume','gallon','liter','1']];
let saveTimer, lastSaved = '';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const U = (c, u) => CATEGORIES[c] && CATEGORIES[c].units[u];
const sym = (c, u) => U(c, u) ? U(c, u)[1] : u;
const nameOf = (c, u) => U(c, u) ? U(c, u)[0] : u;

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2200); }

async function api(path, method = 'GET', data) {
  let url = CX.ctx + '/api' + path; const o = {method, credentials: 'same-origin'};
  if (data && method === 'POST') o.body = new URLSearchParams(data); else if (data) url += '?' + new URLSearchParams(data);
  const r = await fetch(url, o); if (!r.ok) throw new Error(r.status); return r.json();
}

/* ---------- rendering ---------- */
function applyTheme() { document.documentElement.dataset.theme = S.theme; $('#themeBtn').textContent = S.theme === 'dark' ? '☀️' : '🌙'; }

function renderNav() {
  $('#nav').innerHTML = Object.entries(CATEGORIES).map(([k, c]) =>
    `<button class="nav-item${k === S.cat ? ' active' : ''}" data-cat="${k}"><span class="ico">${c.icon}</span>${c.name}</button>`).join('');
  const rec = [...new Set(S.history.map(h => h.category))].filter(k => CATEGORIES[k]).slice(0, 4);
  $('#recent').innerHTML = rec.map(k => `<button class="chip" data-cat="${k}">${CATEGORIES[k].icon} ${CATEGORIES[k].name}</button>`).join('')
    || '<span class="muted">Convert something to see it here.</span>';
}

function renderQuick() {
  $('#quick').innerHTML = QUICK.map((q, i) => {
    const c = convert(q[0], q[1], q[2], Number(q[3]), S.decimals);
    return `<button class="quick" data-q="${i}"><small>${CATEGORIES[q[0]].name}</small><b>${q[3]} ${esc(sym(q[0], q[1]))} = ${esc(c.text)} ${esc(sym(q[0], q[2]))}</b></button>`;
  }).join('');
}

function renderLists() {
  $('#historyList').innerHTML = S.history.map(h =>
    `<li><button class="item" data-load="h" data-id="${h.id}"><b>${esc(h.value)} ${esc(sym(h.category, h.from))} → ${esc(h.result)} ${esc(sym(h.category, h.to))}</b>
     <small>${esc((CATEGORIES[h.category] || {}).name || h.category)} · ${esc(h.created)}</small></button>
     <button class="x" data-del="h" data-id="${h.id}" aria-label="Delete entry">✕</button></li>`).join('') || '<li class="muted">No history yet. Your conversions are saved automatically.</li>';
  $('#favList').innerHTML = S.favs.map(f =>
    `<li><button class="item" data-load="f" data-id="${f.id}"><b>${esc(nameOf(f.category, f.from))} → ${esc(nameOf(f.category, f.to))}</b>
     <small>${esc((CATEGORIES[f.category] || {}).name || f.category)}</small></button>
     <button class="x" data-del="f" data-id="${f.id}" aria-label="Remove favorite">✕</button></li>`).join('') || '<li class="muted">No favorites yet. Press “Favorite” on any conversion.</li>';
  renderFavBtn();
}

const favOf = () => S.favs.find(f => f.category === S.cat && f.from === S.from && f.to === S.to);
function renderFavBtn() { $('#favBtn').textContent = favOf() ? '★ Saved' : '☆ Favorite'; }

function fillSelects() {
  const opts = Object.entries(CATEGORIES[S.cat].units).map(([k, u]) => `<option value="${k}">${u[0]} (${u[1]})</option>`).join('');
  $('#fromUnit').innerHTML = opts; $('#toUnit').innerHTML = opts;
  $('#fromUnit').value = S.from; $('#toUnit').value = S.to;
}

function selectCategory(cat, from, to) {
  const keys = Object.keys(CATEGORIES[cat].units);
  S.cat = cat; S.from = keys.includes(from) ? from : keys[0];
  S.to = keys.includes(to) ? to : keys.find(k => k !== S.from);
  $('#title').textContent = CATEGORIES[cat].icon + ' ' + CATEGORIES[cat].name + ' Converter';
  document.body.classList.remove('nav-open');
  renderNav(); fillSelects(); renderFavBtn(); compute();
}

/* ---------- core ---------- */
function compute() {
  const raw = $('#input').value, r = parseInput(raw, S.cat, S.from);
  $('#error').textContent = r.error || ''; $('#input').classList.toggle('invalid', !!r.error);
  clearTimeout(saveTimer);
  if (r.value === undefined) { $('#output').value = ''; $('#formula').textContent = '—'; $('#steps').innerHTML = ''; return; }
  const c = convert(S.cat, S.from, S.to, r.value, S.decimals);
  $('#output').value = c.text; $('#formula').textContent = c.formula;
  $('#steps').innerHTML = c.steps.map(s => `<li>${esc(s)}</li>`).join('');
  const entry = {category: S.cat, from: S.from, to: S.to, value: raw.trim(), result: c.text}, key = Object.values(entry).join('|');
  saveTimer = setTimeout(() => {            // save to history once typing pauses
    if (key === lastSaved) return; lastSaved = key;
    api('/history', 'POST', entry).then(loadHistory).catch(() => {});
  }, 900);
}

async function loadHistory() {
  try { S.history = await api('/history'); $('#status').textContent = ''; }
  catch { $('#status').textContent = 'Server unavailable: conversions still work, but history and favorites are not saved.'; }
  renderLists(); renderNav();
}
async function loadFavs() { try { S.favs = await api('/favorites'); } catch {} renderLists(); }
const saveSettings = () => api('/settings', 'POST', {theme: S.theme, decimals: S.decimals}).catch(() => toast('Settings could not be saved to the server.'));

/* ---------- events ---------- */
$('#input').addEventListener('input', compute);
$('#fromUnit').addEventListener('change', e => { S.from = e.target.value; renderFavBtn(); compute(); });
$('#toUnit').addEventListener('change', e => { S.to = e.target.value; renderFavBtn(); compute(); });
$('#swapBtn').onclick = () => { [S.from, S.to] = [S.to, S.from]; fillSelects(); renderFavBtn(); compute(); };
$('#clearBtn').onclick = () => { $('#input').value = ''; compute(); $('#input').focus(); };
$('#copyBtn').onclick = async () => {
  const v = $('#output').value; if (!v) return toast('Nothing to copy yet.');
  try { await navigator.clipboard.writeText(v); } catch { $('#output').select(); document.execCommand('copy'); }
  toast('Copied ' + v);
};
$('#favBtn').onclick = async () => {
  try {
    const f = favOf();
    if (f) await api('/favorites', 'DELETE', {id: f.id}); else await api('/favorites', 'POST', {category: S.cat, from: S.from, to: S.to});
    await loadFavs(); toast(f ? 'Removed from favorites' : 'Added to favorites');
  } catch { toast('Server unavailable.'); }
};
$('#clearHistory').onclick = async () => { try { await api('/history', 'DELETE'); await loadHistory(); toast('History cleared'); } catch { toast('Server unavailable.'); } };
$('#themeBtn').onclick = () => { S.theme = S.theme === 'dark' ? 'light' : 'dark'; applyTheme(); saveSettings(); };
$('#menuBtn').onclick = () => document.body.classList.toggle('nav-open');
$('#scrim').onclick = () => document.body.classList.remove('nav-open');

$('#settingsBtn').onclick = () => { $('#decimals').value = S.decimals; $('#decVal').textContent = S.decimals; $('#themeSel').value = S.theme; $('#settings').showModal(); };
$('#decimals').oninput = e => $('#decVal').textContent = e.target.value;
$('#cancelBtn').onclick = () => $('#settings').close();
$('#saveBtn').onclick = () => { S.decimals = +$('#decimals').value; S.theme = $('#themeSel').value; applyTheme(); compute(); renderQuick(); saveSettings(); $('#settings').close(); toast('Settings saved'); };
$('#resetBtn').onclick = () => { Object.assign(S, DEFAULTS); $('#input').value = ''; applyTheme(); selectCategory('length'); renderQuick(); saveSettings(); $('#settings').close(); toast('Defaults restored'); };

$('#search').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase(), box = $('#results'), hits = [];
  if (!q) return box.classList.remove('open');
  for (const [k, c] of Object.entries(CATEGORIES)) {
    if (c.name.toLowerCase().includes(q)) hits.push([c.icon + ' ' + c.name, 'Category', k + ':']);
    for (const [u, x] of Object.entries(c.units))
      if (x[0].toLowerCase().includes(q) || x[1].toLowerCase() === q) hits.push([`${x[0]} (${x[1]})`, c.name, k + ':' + u]);
  }
  box.innerHTML = hits.slice(0, 8).map(h => `<li><button data-pick="${h[2]}">${esc(h[0])}<small>${esc(h[1])}</small></button></li>`).join('') || '<li class="none">No matching units.</li>';
  box.classList.add('open');
});
$('#search').addEventListener('keydown', e => { if (e.key === 'Escape') $('#results').classList.remove('open'); });

document.addEventListener('click', async e => {
  if (!e.target.closest('.search')) $('#results').classList.remove('open');
  const b = e.target.closest('[data-cat],[data-q],[data-load],[data-del],[data-tab],[data-pick]'); if (!b) return;
  const d = b.dataset;
  if (d.cat) selectCategory(d.cat);
  else if (d.q !== undefined) { const q = QUICK[d.q]; $('#input').value = q[3]; selectCategory(q[0], q[1], q[2]); }
  else if (d.pick) { const [c, u] = d.pick.split(':'); selectCategory(c, u || undefined); $('#results').classList.remove('open'); $('#search').value = ''; }
  else if (d.load) {
    const x = (d.load === 'h' ? S.history : S.favs).find(i => String(i.id) === d.id); if (!x) return;
    if (d.load === 'h') { $('#input').value = x.value; lastSaved = [x.category, x.from, x.to, x.value, x.result].join('|'); }
    selectCategory(x.category, x.from, x.to);
  } else if (d.del) {
    try { await api(d.del === 'h' ? '/history' : '/favorites', 'DELETE', {id: d.id}); await (d.del === 'h' ? loadHistory() : loadFavs()); }
    catch { toast('Server unavailable.'); }
  } else if (d.tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === d.tab));
    $('#historyList').hidden = d.tab !== 'h'; $('#favList').hidden = d.tab !== 'f'; $('#clearHistory').hidden = d.tab !== 'h';
  }
});

/* ---------- start ---------- */
applyTheme(); renderQuick(); selectCategory('length', 'meter', 'kilometer'); loadHistory(); loadFavs();
})();
