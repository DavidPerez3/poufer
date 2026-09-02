import assert from 'node:assert/strict';
import test from 'node:test';

import { consumeItem, type ItemUseState } from '../src/domain/itemEngine';
import { INITIAL_INVENTORY } from '../src/domain/items';
import { INITIAL_VITALS } from '../src/domain/mapofer';

const initialState = (now: number): ItemUseState => ({
  ...INITIAL_VITALS,
  inventory: { ...INITIAL_INVENTORY, pill: 2, chicken: 1, joint: 2 },
  activeEffects: [],
  lastUpdatedAt: now,
});

test('consumeItem consume inventario y crea un efecto activo genérico', () => {
  const now = 50_000;
  const outcome = consumeItem(initialState(now), 'pill', now);

  assert.equal(outcome.result, 'used');
  assert.equal(outcome.state.inventory.pill, 1);
  assert.equal(outcome.state.altered, 34);
  assert.equal(outcome.state.activeEffects.at(-1)?.itemId, 'pill');
  assert.ok(outcome.state.activeEffects.at(-1)!.expiresAt > now);
});

test('consumeItem no produce efectos cuando no queda stock', () => {
  const now = 80_000;
  const state = initialState(now);
  state.inventory.chicken = 0;

  const outcome = consumeItem(state, 'chicken', now);

  assert.equal(outcome.result, 'out-of-stock');
  assert.equal(outcome.state, state);
  assert.equal(outcome.state.altered, 0);
  assert.deepEqual(outcome.state.activeEffects, []);
});

test('el porro aplica hambre y configuración visual sin lógica específica', () => {
  const now = 90_000;
  const outcome = consumeItem(initialState(now), 'joint', now);

  assert.equal(outcome.result, 'used');
  assert.equal(outcome.state.hunger, INITIAL_VITALS.hunger - 18);
  assert.equal(outcome.state.inventory.joint, 1);
  assert.equal(outcome.state.activeEffects.at(-1)?.animation, 'smoke');
  assert.equal(outcome.state.activeEffects.at(-1)?.redEyeIntensity, 2);
});
