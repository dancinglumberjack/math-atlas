import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, createPetState, normalizePetState, purchase, equip, feed } from '../src/pets-model.mjs';

test('A new learner has a complete free companion and can afford a first snack', () => {
  const state = createPetState();
  assert.equal(state.coins, 20);
  for (const [slot, id] of Object.entries(state.equipped)) {
    assert.ok(state.owned.includes(id));
    assert.equal(catalog.find(item => item.id === id).type, slot);
  }
  assert.equal(new Set(catalog.map(item => item.id)).size, catalog.length);
  for (const item of catalog) {
    assert.ok(Number.isInteger(item.cost) && item.cost >= 0);
    assert.ok(item.name && item.description && item.variant);
    assert.equal(Object.isFrozen(item), true);
  }
  assert.equal(purchase(state, 'berries').ok, true);
  const independent = createPetState();
  state.owned.push('bea');
  state.equipped.pet = 'bea';
  assert.equal(independent.equipped.pet, 'pip');
  assert.equal(independent.owned.includes('bea'), false);
});

test('An end-to-end snack visit spends only once, consumes owned food, and survives saving', () => {
  const start = createPetState();
  const bought = purchase(start, 'berries');
  assert.equal(bought.ok, true);
  assert.equal(bought.state.coins, 15);
  assert.equal(bought.state.food.berries, 1);
  assert.deepEqual(start, createPetState(), 'Purchasing must not mutate a caller’s save');
  const saved = normalizePetState(JSON.parse(JSON.stringify(bought.state)));
  const shared = feed(saved, 'berries');
  assert.equal(shared.ok, true);
  assert.equal(shared.state.coins, 15, 'Sharing a snack cannot mint coins');
  assert.equal(shared.state.careCount, 1);
  assert.equal(shared.state.food.berries, undefined);
  assert.match(shared.message, /Pip/);
  assert.equal(saved.food.berries, 1, 'Feeding must not mutate a caller’s save');
  const second = feed(shared.state, 'berries');
  assert.equal(second.ok, false);
  assert.deepEqual(second.state, shared.state, 'An empty snack bag must not change coins or care count');
  assert.deepEqual(normalizePetState(JSON.parse(JSON.stringify(shared.state))), shared.state);
});

test('A purchased collectible is permanent; equipping and repeat purchase never spend extra', () => {
  const bought = purchase(createPetState(), 'leaf-charm');
  assert.equal(bought.ok, true);
  assert.equal(bought.state.coins, 8);
  assert.ok(bought.state.owned.includes('leaf-charm'));
  assert.equal(bought.state.equipped.charm, 'star-charm', 'Buying must not silently equip');
  const equipped = equip(bought.state, 'charm', 'leaf-charm');
  assert.equal(equipped.ok, true);
  assert.equal(equipped.state.equipped.charm, 'leaf-charm');
  assert.equal(equipped.state.coins, 8);
  const repeated = purchase(equipped.state, 'leaf-charm');
  assert.equal(repeated.ok, false);
  assert.deepEqual(repeated.state, equipped.state);
  const restored = normalizePetState(JSON.parse(JSON.stringify(equipped.state)));
  assert.equal(restored.equipped.charm, 'leaf-charm');
  assert.equal(equip(restored, 'charm', 'star-charm').state.owned.includes('leaf-charm'), true);
});

test('The wallet, ownership and slot rules prevent unsupported transactions', () => {
  const state = createPetState();
  for (const id of ['bea', 'noodle', 'moss', 'observatory', 'midnight-case']) {
    const result = purchase(state, id);
    assert.equal(result.ok, false);
    assert.deepEqual(result.state, state, 'Insufficient funds cannot remove coins or grant items');
  }
  for (const result of [
    purchase(state, 'fake-item'), purchase(state, '__proto__'), purchase(state, 'pip'),
    equip(state, 'pet', 'bea'), equip(state, 'pet', 'star-charm'),
    equip(state, 'food', 'berries'), equip(state, '__proto__', 'pip'),
    feed(state, 'pip'), feed(state, 'toast')
  ]) {
    assert.equal(result.ok, false);
    assert.deepEqual(result.state, state);
  }
  const exactBalance = { ...state, coins: 55 };
  const bought = purchase(exactBalance, 'bea');
  assert.equal(bought.state.coins, 0);
  assert.equal(bought.ok, true);
  assert.equal(equip(bought.state, 'pet', 'bea').state.equipped.pet, 'bea');
});

test('Every catalog collectible can be acquired, selected, saved and restored', () => {
  let state = { ...createPetState(), coins: 1000 };
  let expectedBalance = 1000;
  for (const item of catalog.filter(item => item.type !== 'food' && item.cost > 0)) {
    const bought = purchase(state, item.id);
    assert.equal(bought.ok, true, item.id);
    expectedBalance -= item.cost;
    state = equip(bought.state, item.type, item.id).state;
    assert.equal(state.equipped[item.type], item.id);
    assert.equal(state.coins, expectedBalance);
    state = normalizePetState(JSON.parse(JSON.stringify(state)));
    assert.ok(state.owned.includes(item.id));
    assert.equal(state.equipped[item.type], item.id);
  }
});

test('Food stays bounded, can be replenished and has a cheer for every snack', () => {
  for (const item of catalog.filter(item => item.type === 'food')) {
    const full = { ...createPetState(), coins: 1000, food: { [item.id]: 99 } };
    const blocked = purchase(full, item.id);
    assert.equal(blocked.ok, false);
    assert.deepEqual(blocked.state, full);
    const shared = feed(full, item.id);
    assert.equal(shared.ok, true);
    assert.equal(shared.state.food[item.id], 98);
    assert.equal(shared.state.coins, 1000);
    assert.ok(shared.message.length > 20);
    const replenished = purchase(shared.state, item.id);
    assert.equal(replenished.state.food[item.id], 99);
    assert.equal(replenished.state.coins, 1000 - item.cost);
  }
});

test('Malformed saves recover a usable free companion without invalid purchases or slots', () => {
  for (const input of [null, undefined, true, [], 'oops']) {
    assert.deepEqual(normalizePetState(input), createPetState());
  }
  const recovered = normalizePetState({
    coins: -500, owned: ['bea', 'bea', 'fiction', 'berries', null],
    food: { berries: 3.8, crunch: -2, toast: Infinity, fiction: 80 },
    equipped: { pet: 'bea', habitat: 'observatory', case: 'berries', charm: 'moon-charm' },
    careCount: -10
  });
  assert.equal(recovered.coins, 0);
  assert.equal(recovered.owned.filter(id => id === 'bea').length, 1);
  assert.equal(recovered.owned.includes('berries'), false);
  assert.equal(recovered.owned.includes('fiction'), false);
  assert.deepEqual(recovered.food, { berries: 3 });
  assert.deepEqual(recovered.equipped, { pet: 'bea', habitat: 'meadow', case: 'fern-case', charm: 'star-charm' });
  assert.equal(recovered.careCount, 0);
  const huge = normalizePetState({ coins: 1e300, careCount: 1e300, food: { berries: 1e300 } });
  assert.equal(huge.coins, 10000000);
  assert.equal(huge.food.berries, 99);
  assert.equal(huge.careCount, 1000000);
});

test('A saved collection has no clock, health debt or absence penalty', () => {
  const state = equip(purchase({ ...createPetState(), coins: 100 }, 'noodle').state, 'pet', 'noodle').state;
  const before = JSON.stringify(state);
  const after = normalizePetState(JSON.parse(before));
  assert.equal(JSON.stringify(after), before);
  assert.deepEqual(Object.keys(after).sort(), ['careCount', 'coins', 'equipped', 'food', 'owned']);
  assert.equal(after.coins, 20);
  assert.equal(after.equipped.pet, 'noodle');
});
