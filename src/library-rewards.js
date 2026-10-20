(function () {
  'use strict';
  const journey = window.AtlasJourney;
  if (!journey) return;
  const status = document.createElement('p');
  status.id = 'library-reward-message';
  status.className = 'library-reward-message';
  status.setAttribute('role', 'status');
  status.hidden = true;
  document.getElementById('practice-panel')?.append(status);
  function refresh() {
    const state = journey.load();
    const coins = document.getElementById('library-coins');
    if (coins) coins.textContent = state.preferences.rewards ? ' · ' + state.pet.coins + ' coins' : '';
  }
  document.addEventListener('atlaspractice', event => {
    const id = event.detail?.id;
    if (!id) return;
    const first = !journey.load().lessonPractice[id];
    const state = journey.completePractice(id);
    status.hidden = !(first && state.preferences.rewards);
    status.textContent = first ? 'A new idea practiced! +5 coins for your collection. Hints and retries are always welcome.' : '';
  });
  window.addEventListener('hashchange', () => { status.hidden = true; });
  journey.subscribe(refresh);
  refresh();
})();
