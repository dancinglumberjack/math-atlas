/** Original Math Atlas companions. No timers, penalties, purchases with money, or network calls. */
export const catalog = Object.freeze([
  { id: 'pip', type: 'pet', name: 'Pip', cost: 0, description: 'A squirrel with excellent questions and absolutely no indoor voice.', variant: 'squirrel' },
  { id: 'bea', type: 'pet', name: 'Bea', cost: 55, description: 'A gentle bird who collects interesting pebbles. Every pebble is interesting.', variant: 'bird' },
  { id: 'noodle', type: 'pet', name: 'Noodle', cost: 80, description: 'An axolotl with six fancy frills and one very tiny idea at a time.', variant: 'axolotl' },
  { id: 'moss', type: 'pet', name: 'Moss', cost: 70, description: 'A turtle who takes the scenic route, including on a straight line.', variant: 'turtle' },
  { id: 'meadow', type: 'habitat', name: 'Pocket Meadow', cost: 0, description: 'A little patch of sunshine. Room for a friend and an unnecessarily large leaf.', variant: 'meadow' },
  { id: 'treehouse', type: 'habitat', name: 'Treehouse Nook', cost: 40, description: 'A cozy woodland room with a round window and a very good view.', variant: 'treehouse' },
  { id: 'observatory', type: 'habitat', name: 'Moonlit Lookout', cost: 65, description: 'A quiet place to watch the stars and ask enormous questions.', variant: 'observatory' },
  { id: 'fern-case', type: 'case', name: 'Fern Case', cost: 0, description: 'A soft green frame for your pocket-sized world.', variant: 'fern' },
  { id: 'peach-case', type: 'case', name: 'Peach Case', cost: 25, description: 'A warm coral frame with a sprinkle of sunshine.', variant: 'peach' },
  { id: 'midnight-case', type: 'case', name: 'Midnight Case', cost: 40, description: 'Deep blue, tiny stars, big explorer energy.', variant: 'midnight' },
  { id: 'star-charm', type: 'charm', name: 'Little Star Keychain', cost: 0, description: 'A friendly star that comes along on every adventure.', variant: 'star' },
  { id: 'leaf-charm', type: 'charm', name: 'Lucky Leaf Keychain', cost: 12, description: 'A leaf for the explorer who likes taking the long way home.', variant: 'leaf' },
  { id: 'moon-charm', type: 'charm', name: 'Sleepy Moon Keychain', cost: 18, description: 'A crescent moon. It is not sleepy; it is thinking with its eyes closed.', variant: 'moon' },
  { id: 'berries', type: 'food', name: 'Berry Bowl', cost: 5, description: 'Three imaginary berries. One imaginary delighted friend.', variant: 'berries' },
  { id: 'crunch', type: 'food', name: 'Star Crunch', cost: 8, description: 'A little crunchy constellation for your companion.', variant: 'crunch' },
  { id: 'toast', type: 'food', name: 'Tiny Toast', cost: 10, description: 'Toast so tiny that even the crumbs have crumbs.', variant: 'toast' }
].map(item => Object.freeze(item)));

const starters = ['pip', 'meadow', 'fern-case', 'star-charm'];
const defaults = { pet: 'pip', habitat: 'meadow', case: 'fern-case', charm: 'star-charm' };
const slots = ['pet', 'habitat', 'case', 'charm'];
const byId = new Map(catalog.map(item => [item.id, item]));
const integer = (value, fallback, ceiling) => typeof value === 'number' && Number.isFinite(value)
  ? Math.min(ceiling, Math.max(0, Math.floor(value))) : fallback;

export function createPetState() {
  return { coins: 20, owned: [...starters], food: {}, equipped: { ...defaults }, careCount: 0 };
}

export function normalizePetState(value) {
  const input = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const owned = [...new Set([...starters, ...(Array.isArray(input.owned) ? input.owned : [])])]
    .filter(id => byId.has(id) && byId.get(id).type !== 'food');
  const equipped = {};
  for (const slot of slots) {
    const id = input.equipped?.[slot];
    equipped[slot] = owned.includes(id) && byId.get(id)?.type === slot ? id : defaults[slot];
  }
  const food = {};
  for (const item of catalog.filter(item => item.type === 'food')) {
    const count = integer(input.food?.[item.id], 0, 99);
    if (count > 0) food[item.id] = count;
  }
  return {
    coins: integer(input.coins, 20, 10000000), owned, food, equipped,
    careCount: integer(input.careCount, 0, 1000000)
  };
}

export function purchase(value, itemId) {
  const state = normalizePetState(value);
  const item = byId.get(itemId);
  if (!item) return { ok: false, state, message: 'That item is not in this shop.' };
  if (item.type !== 'food' && state.owned.includes(item.id)) {
    return { ok: false, state, message: 'You already own ' + item.name + '. You can use it from Your things.' };
  }
  if (item.type === 'food' && (state.food[item.id] || 0) >= 99) {
    return { ok: false, state, message: 'You have a full supply of ' + item.name + '.' };
  }
  if (state.coins < item.cost) {
    return { ok: false, state, message: 'You need ' + (item.cost - state.coins) + ' more coins for ' + item.name + '. Your current things are always yours.' };
  }
  state.coins -= item.cost;
  if (item.type === 'food') state.food[item.id] = (state.food[item.id] || 0) + 1;
  else state.owned.push(item.id);
  return { ok: true, state, message: item.name + ' is yours! ' + (item.type === 'food' ? 'Find it in Care.' : 'Choose it from Your things.') };
}

export function equip(value, slot, itemId) {
  const state = normalizePetState(value);
  const item = byId.get(itemId);
  if (!slots.includes(slot) || item?.type !== slot || !state.owned.includes(itemId)) {
    return { ok: false, state, message: 'Choose something you own for this part of your companion’s world.' };
  }
  state.equipped[slot] = itemId;
  return { ok: true, state, message: item.name + ' is now selected.' };
}

export function feed(value, itemId) {
  const state = normalizePetState(value);
  const item = byId.get(itemId);
  if (item?.type !== 'food' || !(state.food[itemId] > 0)) {
    return { ok: false, state, message: 'Choose a snack you own. Your friend is happy to just hang out, too.' };
  }
  state.food[itemId]--;
  if (!state.food[itemId]) delete state.food[itemId];
  state.careCount = Math.min(1000000, state.careCount + 1);
  const name = byId.get(state.equipped.pet).name;
  const cheers = {
    berries: name + ' says: “Berry good choice!” A tiny happy dance follows.',
    crunch: name + ' says: “A snack of astronomical proportions!” Crunch. Crunch.',
    toast: name + ' says: “I would like to propose a toast. This toast.”'
  };
  return { ok: true, state, message: cheers[itemId] };
}
