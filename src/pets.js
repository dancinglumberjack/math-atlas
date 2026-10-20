/* Original pocket companions. All ownership stays in this browser's Journey save. */
window.AtlasPets = (() => {
  'use strict';
  const model = () => window.AtlasPetModel;
  const itemById = id => model().catalog.find(item => item.id === id);
  const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const readJourney = () => window.AtlasJourney.load();
  const readPet = () => model().normalizePetState(readJourney().pet);
  let dialog, tab = 'inventory', category = 'pet', previewId = null, statusText = '', cheer = false;
  let initialized = false, opener = null;

  const palettes = {
    'fern-case': ['#699b7b', '#d9eadb', '#3d6853'],
    'peach-case': ['#e6a18b', '#ffded0', '#a65e52'],
    'midnight-case': ['#4c5b83', '#d2dcf1', '#2e3e65']
  };

  function star(x, y, scale, color) {
    return `<path transform="translate(${x} ${y}) scale(${scale})" d="M0-12 3.7-4.4 12-3.7 6 2.2 7.5 10.5 0 6.5-7.5 10.5-6 2.2-12-3.7-3.7-4.4Z" fill="${color}" stroke="#6e6540" stroke-width="1.6" stroke-linejoin="round"/>`;
  }

  function charmArt(id, x = 269, y = 102) {
    const chain = `<path d="M${x - 15} ${y - 40}q27-19 17 14" fill="none" stroke="#b19b6a" stroke-width="6"/><path d="M${x - 15} ${y - 40}q27-19 17 14" fill="none" stroke="#f2dba1" stroke-width="3"/>`;
    const art = id === 'leaf-charm'
      ? `<path d="M-10 12Q-23-8 13-24Q23 12-10 12Z" fill="#9bc88c" stroke="#47725d" stroke-width="2.5"/><path d="M-12 20 9-16M-1 0-10-5M2-4 10-3" stroke="#47725d" stroke-width="2" fill="none"/>`
      : id === 'moon-charm'
        ? '<path d="M9-19A21 21 0 1 0 18 15C-9 18-15-7 9-19Z" fill="#efd38c" stroke="#8d754a" stroke-width="2.5"/><path d="m-8 7 5 2 4-3" fill="none" stroke="#8d754a" stroke-width="2"/>'
        : star(0, 0, 1.7, '#f4ce72') + '<circle cx="-6" cy="0" r="1.7" fill="#5e573c"/><circle cx="6" cy="0" r="1.7" fill="#5e573c"/><path d="M-3 6q3 3 6 0" stroke="#5e573c" stroke-width="1.5" fill="none"/>';
    return chain + `<g transform="translate(${x + 2} ${y}) rotate(9)">${art}</g>`;
  }

  function foodArt(id) {
    if (id === 'berries') return '<path d="M-35 6q4 30 35 30T35 6Z" fill="#e7be90" stroke="#7c5e49" stroke-width="3"/><ellipse cy="6" rx="35" ry="9" fill="#fff1d4" stroke="#7c5e49" stroke-width="3"/><g fill="#d6757a" stroke="#8d525e" stroke-width="2"><circle cx="-17" cy="-5" r="11"/><circle cx="16" cy="-5" r="11"/><circle cy="-18" r="12"/></g><path d="m-4-25 4-11 6 9" fill="#77a46d" stroke="#487657" stroke-width="2"/>';
    if (id === 'crunch') return star(-20, 0, 1.3, '#e7b965') + star(14, -18, 1.1, '#f4d68b') + star(17, 19, 1.25, '#e7b965');
    return '<path d="M-28 28V-9q-13-10-5-24 8-12 32-12t34 12q8 14-5 24v37Z" fill="#cb8d56" stroke="#8b5f40" stroke-width="3"/><path d="M-20 20V-12q-10-8-5-16 5-9 24-9t25 9q5 8-5 16v32Z" fill="#ffe2a6"/><rect x="-8" y="-14" width="17" height="14" rx="3" fill="#f7c45d" transform="rotate(12)"/>';
  }

  function habitatArt(id) {
    if (id === 'observatory') return '<rect x="68" y="89" width="184" height="164" rx="23" fill="#34496b"/>' + star(99, 114, .36, '#f6dfa1') + star(221, 124, .28, '#f6dfa1') + star(174, 107, .24, '#f6dfa1') + '<circle cx="220" cy="111" r="13" fill="#ead9a8"/><circle cx="226" cy="106" r="12" fill="#34496b"/><path d="M69 223q48-24 91-8t91-4v29q-94 31-182 0Z" fill="#71869a"/><path d="M88 191v-15m-8 7h16M231 186v-13m-7 6h14" stroke="#b1c9bb" stroke-width="2"/>';
    if (id === 'treehouse') return '<rect x="68" y="89" width="184" height="164" rx="23" fill="#ecd9b2"/><path d="M83 104v123m24-123v123m106-123v123m24-123v123" stroke="#d6bb8c" stroke-width="2"/><circle cx="161" cy="132" r="27" fill="#98c6cb" stroke="#ab875c" stroke-width="8"/><path d="M161 105v54m-27-27h54" stroke="#ab875c" stroke-width="4"/><path d="M70 228q92-18 180 0v15q-91 26-180 0Z" fill="#b99a70"/><path d="M88 179v-23q17-8 25 5-11 12-25 5m0 13q-22-7-17-17 18-6 17 17" fill="#73956c" stroke="#4c7558" stroke-width="2"/>';
    return '<rect x="68" y="89" width="184" height="164" rx="23" fill="#deeddc"/><circle cx="221" cy="117" r="17" fill="#f1d789"/><path d="M89 126q7-10 16 0 8-5 14 4H85Z" fill="#fffdf0"/><path d="M69 212q42-26 93-5t89-7v40q-93 28-182 0Z" fill="#accc9a"/><path d="M69 232q65-16 119 0t63-5v17q-94 24-182 0Z" fill="#89b58a"/><path d="m91 219 3-10 4 8m123 7 4-10 4 9m-19-4 2-7" stroke="#4c815b" stroke-width="2" fill="none"/><circle cx="106" cy="221" r="3" fill="#f6ebaf"/><circle cx="233" cy="216" r="3" fill="#f6ebaf"/>';
  }

  function petArt(id) {
    const outline = 'stroke="#684f43" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
    const face = '<path d="M144 170q5-5 10 0m15-1q5-5 10 0" fill="none" stroke="#594c42" stroke-width="2.5" stroke-linecap="round"/><ellipse cx="149" cy="180" rx="3.5" ry="5" fill="#443e39"/><ellipse cx="174" cy="180" rx="3.5" ry="5" fill="#443e39"/><circle cx="150" cy="178" r="1" fill="#fff"/><circle cx="175" cy="178" r="1" fill="#fff"/><ellipse cx="138" cy="190" rx="7" ry="4" fill="#e7a08c" opacity=".8"/><ellipse cx="186" cy="190" rx="7" ry="4" fill="#e7a08c" opacity=".8"/>';
    if (id === 'bea') return `<g ${outline}><path d="M139 219q-36 11-37-21l29-20" fill="#7fa9aa"/><path d="M135 207q-10-42 4-59 23-27 48-3 24 28-3 65Z" fill="#8eb9b9"/><path d="M149 149q11-16 20 0" fill="#e8f0d5" stroke="none"/><ellipse cx="162" cy="198" rx="24" ry="28" fill="#e7efdb" stroke="none"/><path d="M186 181q25 4 21 28-17 3-25-9" fill="#6f9c9e"/><path d="m149 223-4 10m2-5-8 4m36-8 4 9m-2-5 8 4" fill="none"/><path d="M157 139q-14-15-4-20l9 17q2-25 12-21l-6 24" fill="#8eb9b9"/><path d="m153 190 10-7 10 7-10 8Z" fill="#e4b47b"/></g>${face}`;
    if (id === 'noodle') return `<g stroke="#9d666e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M178 213q44 20 32-10-14 17-25-6" fill="#df9da5"/><path d="M144 201q-12 24 3 26h27q17-6 0-28" fill="#efb6bb"/><path d="m143 216-11 12 16-1m27-11 11 12-16-1" fill="#e7a7ad"/><path d="m131 165-20-15m17 25-23 2m26 6-19 15m81-33 20-15m-18 25 23 2m-26 6 19 15" fill="none" stroke="#c9818d" stroke-width="7"/><path d="m114 151-4-9m-3 33-8-4m15 25-8 2m108-48 5-8m-2 34 8-4m-14 24 8 2" fill="none" stroke="#e4a0ab" stroke-width="4"/><path d="M126 178q-3-31 35-31 39 0 38 31 0 32-36 32-37 0-37-32Z" fill="#f3c3c6"/><path d="M155 194q8 8 16 0" fill="none"/></g>${face}`;
    if (id === 'moss') return `<g ${outline}><path d="m126 210-10 14 16-3m45-5 13 10 3-10" fill="#a2b37c"/><ellipse cx="157" cy="202" rx="38" ry="27" fill="#75946a"/><path d="m126 203 18-17 24 4 17 15-8 16m-33-35 1 25-17 8m17-8 22 13m-22-13 24-21" fill="none" stroke="#4d735c"/><path d="M145 180q-11-32 15-38 31-7 37 21 7 26-23 32" fill="#bac994"/><path d="M132 222h18m22 1h16" fill="none"/><path d="M157 190q7 5 13-1" fill="none" stroke-width="2"/></g>${face}`;
    return `<g ${outline}><path d="M137 211q-32 21-38-8-8-33 17-49 22-15 30 7-25-3-29 15-1 16 17 14" fill="#bf875d"/><path d="M118 156q-16 11-16 31" fill="none" stroke="#dba87c" stroke-width="7"/><path d="M144 200q-10 25 4 28h28q12-9-3-29" fill="#c98b60"/><ellipse cx="161" cy="212" rx="14" ry="16" fill="#f4d7ad" stroke="none"/><path d="m145 226-12 5h22m18-5 13 5h-20" fill="#bd8058"/><path d="m142 157-8-27q9-11 19 18m20 0 12-20q15-1 8 18l-9 15" fill="#c98b60"/><path d="m141 142 3 10m39-11-4 11" fill="none" stroke="#e7bb94" stroke-width="4"/><path d="M129 177q-1-28 33-29 35 0 35 29 0 30-35 31-34-1-33-31Z" fill="#dba171"/><path d="M143 190q19-14 38 0-3 15-19 16-15-1-19-16Z" fill="#f6dcb4" stroke="none"/><path d="m158 190 4 4 5-4" fill="#684f43" stroke-width="2"/><path d="M162 194v8m-6-4q6 8 13 0" fill="none" stroke-width="2"/><path d="M158 201h8v7h-8Z" fill="#fff6dd" stroke-width="1.5"/><path d="m143 211-10-11m46 11 10-10" fill="none" stroke-width="7"/></g>${face}`;
  }

  function renderBuddy(options = {}) {
    const state = model().normalizePetState(options.state || readPet());
    const [base, light, dark] = palettes[state.equipped.case] || palettes['fern-case'];
    const label = options.label || itemById(state.equipped.pet).name + ' in ' + itemById(state.equipped.habitat).name + ', with ' + itemById(state.equipped.case).name + ' and ' + itemById(state.equipped.charm).name;
    const size = Number.isFinite(options.size) ? ` style="width:${Math.max(60, Math.min(600, options.size))}px"` : '';
    return `<svg class="pet-buddy-svg${cheer ? ' pet-cheer' : ''}"${size} viewBox="0 0 320 340" role="img" aria-label="${esc(label)}" xmlns="http://www.w3.org/2000/svg"><ellipse cx="159" cy="319" rx="100" ry="9" fill="#203c31" opacity=".10"/><path d="M135 53v-19q0-20 23-20t23 20v19" fill="none" stroke="${dark}" stroke-width="12"/><path d="M135 53v-19q0-20 23-20t23 20v19" fill="none" stroke="${light}" stroke-width="5"/><rect x="45" y="46" width="230" height="265" rx="43" fill="${dark}"/><rect x="45" y="40" width="230" height="265" rx="43" fill="${base}" stroke="${dark}" stroke-width="3"/><path d="M65 79q0-20 23-21h134" stroke="${light}" stroke-width="5" stroke-linecap="round" fill="none"/><rect x="61" y="82" width="198" height="178" rx="30" fill="${dark}"/>${habitatArt(state.equipped.habitat)}<ellipse cx="161" cy="230" rx="46" ry="7" fill="#355b4a" opacity=".14"/><g class="pet-character">${petArt(state.equipped.pet)}</g><rect x="72" y="266" width="96" height="24" rx="12" fill="${light}"/><text x="120" y="282" text-anchor="middle" fill="${dark}" font-size="11" font-family="system-ui,sans-serif" font-weight="700">${esc(itemById(state.equipped.pet).name.toUpperCase())}</text><circle cx="213" cy="277" r="9" fill="${light}" stroke="${dark}" stroke-width="2"/><circle cx="239" cy="277" r="9" fill="${light}" stroke="${dark}" stroke-width="2"/>${charmArt(state.equipped.charm)}</svg>`;
  }

  function icon(item, state) {
    if (item.type === 'food') return `<svg class="pet-item-art" viewBox="-58 -57 116 114" aria-hidden="true">${foodArt(item.id)}</svg>`;
    if (item.type === 'charm') return `<svg class="pet-item-art" viewBox="-58 -57 116 114" aria-hidden="true">${charmArt(item.id, -2, 10)}</svg>`;
    const preview = model().normalizePetState(state);
    // A preview never changes ownership or the saved selection.
    preview.equipped[item.type] = item.id;
    // renderBuddy normalizes ownership, so add this item to the temporary preview only.
    if (!preview.owned.includes(item.id)) preview.owned.push(item.id);
    return renderBuddy({ state: preview, label: item.name + ' preview' });
  }

  function inventoryMarkup(state) {
    return `<p class="pet-section-intro">Your collection, ready whenever you are. Choose a friend and make a little world of your own.</p><div class="pet-category-tabs" role="group" aria-label="Collection category">${[['pet', 'Friends'], ['habitat', 'Habitats'], ['case', 'Cases'], ['charm', 'Keychains']].map(([id, name]) => `<button type="button" data-pet-category="${id}" aria-pressed="${category === id}">${name}</button>`).join('')}</div><div class="pet-item-grid">${model().catalog.filter(item => item.type === category && state.owned.includes(item.id)).map(item => {
      const selected = state.equipped[item.type] === item.id;
      return `<article class="pet-item-card">${icon(item, state)}<h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><button type="button" class="btn${selected ? '' : ' primary'}" data-pet-equip="${item.id}" ${selected ? 'disabled' : ''}>${selected ? 'Selected' : 'Choose ' + esc(item.name)}</button></article>`;
    }).join('')}</div><p class="pet-soft-note">Want another friend or a new look? Visit the shop. Everything here uses pretend coins earned by learning.</p>`;
  }

  function shopMarkup(state) {
    const item = itemById(previewId);
    const preview = item ? `<section class="pet-purchase-preview" aria-labelledby="pet-preview-title"><div class="pet-preview-art">${icon(item, state)}</div><div><p class="pet-kicker">Take a look first</p><h3 id="pet-preview-title" tabindex="-1">${esc(item.name)}</h3><p>${esc(item.description)}</p><p class="pet-price"><strong>${item.cost} coins</strong> · Your balance: ${state.coins}</p><p class="pet-purchase-note">${item.type === 'food' ? 'Adds one snack. Sharing it with your friend uses that snack.' : 'Yours to keep. Change your selection any time.'}</p><div class="pet-confirm-actions"><button type="button" class="btn primary" data-pet-buy="${item.id}" ${state.coins < item.cost || (item.type === 'food' && (state.food[item.id] || 0) >= 99) ? 'disabled' : ''}>Buy ${esc(item.name)} for ${item.cost} coins</button><button type="button" class="btn" data-pet-cancel>Keep browsing</button></div>${state.coins < item.cost ? `<p class="pet-afford-note">${item.cost - state.coins} more coins needed. Your friend is happy while you explore.</p>` : ''}</div></section>` : '';
    return `<p class="pet-section-intro">Finish a new math mission to earn 15 coins. No real money, mystery boxes, timers, or rush. Your friend never needs you to buy anything.</p>${preview}<div class="pet-category-tabs" role="group" aria-label="Shop category">${[['pet', 'Friends'], ['habitat', 'Habitats'], ['case', 'Cases'], ['charm', 'Keychains'], ['food', 'Snacks']].map(([id, name]) => `<button type="button" data-pet-category="${id}" aria-pressed="${category === id}">${name}</button>`).join('')}</div><div class="pet-item-grid">${model().catalog.filter(item => item.type === category).map(item => {
      const owned = item.type !== 'food' && state.owned.includes(item.id);
      return `<article class="pet-item-card">${icon(item, state)}<h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><div class="pet-card-bottom"><span class="pet-price">${owned ? 'In your collection' : item.cost + ' coins'}${item.type === 'food' ? ` · ${state.food[item.id] || 0} owned` : ''}</span><button type="button" class="btn" data-pet-preview="${item.id}" ${owned ? 'disabled' : ''}>${owned ? 'Owned' : 'Preview ' + esc(item.name)}</button></div></article>`;
    }).join('')}</div>`;
  }

  function careMarkup(state) {
    const name = itemById(state.equipped.pet).name;
    return `<p class="pet-section-intro">${esc(name)} is always happy to see you. Snacks are just for fun. There is no hunger meter, and taking a break never changes your friend.</p><div class="pet-item-grid">${model().catalog.filter(item => item.type === 'food').map(item => `<article class="pet-item-card">${icon(item, state)}<h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><p class="pet-price">${state.food[item.id] || 0} in your snack bag</p><button type="button" class="btn primary" data-pet-feed="${item.id}" ${state.food[item.id] ? '' : 'disabled'}>Share ${esc(item.name)}</button></article>`).join('')}</div><button type="button" class="text-btn pet-snack-shop" data-pet-snacks>Visit the snack shop ↗</button><p class="pet-soft-note">Snacks shared: ${state.careCount}. There is nothing you need to keep up with.</p>`;
  }

  function render() {
    if (!initialized) return;
    const journey = readJourney(), state = model().normalizePetState(journey.pet);
    const mature = ['middle', 'high', 'college'].includes(journey.preferences?.bandId);
    const calm = !!journey.preferences?.calm;
    dialog.classList.toggle('pet-mature', mature);
    dialog.classList.toggle('pet-calm', calm);
    const name = itemById(state.equipped.pet).name;
    dialog.querySelector('#pet-coin-count').textContent = state.coins + ' coins';
    dialog.querySelector('#pet-buddy-preview').innerHTML = renderBuddy();
    dialog.querySelector('#pet-buddy-name').textContent = name + '’s little world';
    const storageAvailable = typeof window.AtlasJourney.storageAvailable === 'function' ? window.AtlasJourney.storageAvailable() : window.AtlasJourney.storageAvailable;
    dialog.querySelector('#pet-storage-note').hidden = storageAvailable !== false;
    dialog.querySelector('#pet-quiet-note').hidden = journey.preferences?.rewards !== false;
    dialog.querySelectorAll('[data-pet-tab]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.petTab === tab));
    });
    dialog.querySelector('#pet-panel-title').textContent = { shop: 'Companion shop', inventory: 'Your things', care: 'Spend a little time together' }[tab];
    dialog.querySelector('#pet-panel-content').innerHTML = tab === 'shop' ? shopMarkup(state) : tab === 'care' ? careMarkup(state) : inventoryMarkup(state);
    dialog.querySelector('#pet-status').textContent = statusText;
    document.querySelectorAll('#pet-wallet,[data-pet-wallet]').forEach(host => { host.textContent = state.coins + ' coins'; });
    document.querySelectorAll('[data-pet-buddy]').forEach(host => { host.innerHTML = renderBuddy(); });
    document.querySelectorAll('[data-pet-reward]').forEach(host => { host.hidden = journey.preferences?.rewards === false; });
  }

  function focusAfter(selector) {
    const node = dialog.querySelector(selector);
    if (node) { node.focus(); node.scrollIntoView?.({ block: 'nearest' }); }
  }

  function applyResult(result) {
    statusText = result.message;
    if (result.ok) window.AtlasJourney.update({ pet: result.state });
    render();
    focusAfter('#pet-status');
  }

  function onAction(event) {
    const button = event.target.closest('button');
    if (!button || !dialog.contains(button)) return;
    if (button.hasAttribute('data-pet-close')) { dialog.close(); return; }
    if (button.dataset.petTab) {
      tab = button.dataset.petTab; previewId = null; statusText = '';
      if (tab === 'inventory' && category === 'food') category = 'pet';
      render(); focusAfter('#pet-panel-title'); return;
    }
    if (button.dataset.petCategory) {
      category = button.dataset.petCategory; previewId = null;
      render(); focusAfter(`[data-pet-category="${category}"]`); return;
    }
    if (button.dataset.petPreview) {
      previewId = button.dataset.petPreview;
      render(); focusAfter('#pet-preview-title'); return;
    }
    if (button.hasAttribute('data-pet-cancel')) {
      const previous = previewId; previewId = null;
      render(); focusAfter(`[data-pet-preview="${previous}"]`); return;
    }
    if (button.dataset.petBuy) {
      if (button.dataset.petBuy !== previewId) return;
      const result = model().purchase(readPet(), button.dataset.petBuy);
      if (result.ok) previewId = null;
      applyResult(result); return;
    }
    if (button.dataset.petEquip) {
      const item = itemById(button.dataset.petEquip);
      if (item) applyResult(model().equip(readPet(), item.type, item.id));
      return;
    }
    if (button.dataset.petFeed) {
      const result = model().feed(readPet(), button.dataset.petFeed);
      cheer = result.ok;
      applyResult(result);
      if (result.ok) window.setTimeout(() => {
        cheer = false;
        document.querySelectorAll('.pet-cheer').forEach(svg => svg.classList.remove('pet-cheer'));
      }, 1200);
      return;
    }
    if (button.hasAttribute('data-pet-snacks')) {
      tab = 'shop'; category = 'food'; previewId = null; statusText = '';
      render(); focusAfter('#pet-panel-title');
    }
  }

  function open(options = {}) {
    if (!initialized) init();
    if (!initialized) return;
    opener = document.activeElement;
    if (options.tab && ['shop', 'inventory', 'care'].includes(options.tab)) tab = options.tab;
    previewId = null; statusText = '';
    render();
    if (!dialog.open) dialog.showModal();
    focusAfter('#pet-close');
  }

  function init() {
    if (initialized || !window.AtlasJourney || !window.AtlasPetModel) return;
    initialized = true;
    dialog = document.createElement('dialog');
    dialog.id = 'pets-dialog';
    dialog.className = 'pets-dialog';
    dialog.setAttribute('aria-labelledby', 'pet-dialog-title');
    dialog.innerHTML = `<div class="pet-dialog-heading"><div><p class="pet-kicker">A little company for the journey</p><h2 id="pet-dialog-title">Pocket companions</h2></div><button type="button" class="text-btn" id="pet-close" data-pet-close aria-label="Close pocket companions">Close ✕</button></div><div class="pet-wallet-row"><span id="pet-coin-count" class="pet-wallet"></span><span>Earned through math. Yours to spend.</span></div><p id="pet-storage-note" class="pet-storage-note" hidden>Your browser is not saving right now. You can still explore, but this collection will reset when you leave.</p><p id="pet-quiet-note" class="pet-storage-note" hidden>Rewards are hidden in your learning view. You can still visit your companion here.</p><div class="pet-home"><div id="pet-buddy-preview"></div><div class="pet-home-copy"><h3 id="pet-buddy-name"></h3><p>A friend to explore with. Always glad you’re here. Always fine when you take a break.</p><p>New friends, habitats, cases, and keychains are yours to keep. Try a look before you spend your coins.</p></div></div><div class="pet-main-tabs" role="group" aria-label="Companion activities"><button type="button" data-pet-tab="inventory" aria-pressed="true">Your things</button><button type="button" data-pet-tab="shop" aria-pressed="false">Shop</button><button type="button" data-pet-tab="care" aria-pressed="false">Care</button></div><p id="pet-status" class="pet-status" role="status" aria-live="polite" tabindex="-1"></p><section aria-labelledby="pet-panel-title"><h3 id="pet-panel-title" class="pet-panel-title" tabindex="-1"></h3><div id="pet-panel-content"></div></section><p class="pet-footer-note">Saved only in this browser. There are no real-money purchases and no timers to keep up with.</p>`;
    document.body.appendChild(dialog);
    dialog.addEventListener('click', onAction);
    dialog.addEventListener('close', () => {
      if (opener?.isConnected) opener.focus();
    });
    document.addEventListener('click', event => {
      const button = event.target.closest('#pets-open,[data-open-pets]');
      if (button) { event.preventDefault(); open(); }
    });
    window.AtlasJourney.subscribe(render);
    render();
  }

  return { init, open, renderBuddy };
})();
