import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buyItem,
  claimDailyReward,
  DAILY_REWARD_COOLDOWN_MS,
  DAILY_REWARD_MAPOCOINS,
  getDailyRewardRemainingMs,
  grantMapocoins,
  type EconomyState,
} from '../src/domain/economy';
import { INITIAL_INVENTORY, ITEMS } from '../src/domain/items';

const economyState = (mapocoins = 100): EconomyState => ({
  mapocoins,
  inventory: { ...INITIAL_INVENTORY },
  lastDailyRewardAt: null,
  transactions: [],
});

test('comprar un objeto descuenta Mapocoins y suma inventario', () => {
  const now = 10_000;
  const outcome = buyItem(economyState(), 'kebab', now);

  assert.equal(outcome.result, 'purchased');
  assert.equal(outcome.state.mapocoins, 100 - ITEMS.kebab.priceMapocoins!);
  assert.equal(outcome.state.inventory.kebab, 1);
  assert.deepEqual(outcome.state.transactions[0], {
    id: `purchase-kebab-${now}`,
    kind: 'purchase',
    amount: -ITEMS.kebab.priceMapocoins!,
    label: ITEMS.kebab.name,
    createdAt: now,
  });
});

test('una compra sin saldo no altera el estado', () => {
  const state = economyState(2);
  const outcome = buyItem(state, 'chicken', 20_000);

  assert.equal(outcome.result, 'insufficient-funds');
  assert.equal(outcome.state, state);
  assert.equal(outcome.state.inventory.chicken, 0);
});

test('la recompensa diaria se cobra una sola vez durante el cooldown', () => {
  const now = 30_000;
  const claimed = claimDailyReward(economyState(0), now);
  const repeated = claimDailyReward(claimed.state, now + 1_000);

  assert.equal(claimed.result, 'claimed');
  assert.equal(claimed.state.mapocoins, DAILY_REWARD_MAPOCOINS);
  assert.equal(repeated.result, 'cooldown');
  assert.equal(repeated.state, claimed.state);
  assert.equal(getDailyRewardRemainingMs(now, now + 1_000), DAILY_REWARD_COOLDOWN_MS - 1_000);
});

test('la recompensa vuelve a estar disponible al terminar el cooldown', () => {
  const now = 40_000;
  const state = { ...economyState(0), lastDailyRewardAt: now };

  assert.equal(getDailyRewardRemainingMs(now, now + DAILY_REWARD_COOLDOWN_MS), 0);
  assert.equal(claimDailyReward(state, now + DAILY_REWARD_COOLDOWN_MS).result, 'claimed');
});

test('las futuras recompensas usan un abono genérico y saneado', () => {
  const state = economyState(10);
  const rewarded = grantMapocoins(state, 24.9, 'Turno de almacén', 'work-1', 50_000);

  assert.equal(rewarded.mapocoins, 34);
  assert.equal(rewarded.transactions[0]?.label, 'Turno de almacén');
  assert.equal(grantMapocoins(state, -50, 'Inválida', 'bad', 50_000), state);
});
