import assert from 'node:assert/strict';
import test from 'node:test';

import { playRoulette, playSlots, type CasinoWager } from '../src/domain/casino';
import type { EconomyState } from '../src/domain/economy';
import { INITIAL_INVENTORY } from '../src/domain/items';

const economyState = (mapocoins = 100): EconomyState => ({
  mapocoins,
  inventory: { ...INITIAL_INVENTORY },
  lastDailyRewardAt: null,
  transactions: [],
});

function randomSequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

test('tres sietes pagan el premio máximo configurado', () => {
  const outcome = playSlots(economyState(), 10, 1_000, randomSequence([0.99, 0.99, 0.99]));

  assert.equal(outcome.result, 'played');
  if (outcome.result !== 'played' || outcome.game.gameId !== 'slots') return;
  assert.deepEqual(outcome.game.symbols, ['7️⃣', '7️⃣', '7️⃣']);
  assert.equal(outcome.game.multiplier, 8);
  assert.equal(outcome.game.payout, 80);
  assert.equal(outcome.state.mapocoins, 170);
});

test('una tirada sin combinación descuenta solo la apuesta', () => {
  const outcome = playSlots(economyState(), 25, 2_000, randomSequence([0, 0.4, 0.8]));

  assert.equal(outcome.result, 'played');
  if (outcome.result !== 'played') return;
  assert.equal(outcome.game.payout, 0);
  assert.equal(outcome.state.mapocoins, 75);
  assert.equal(outcome.state.transactions[0]?.kind, 'casino');
  assert.equal(outcome.state.transactions[0]?.amount, -25);
});

test('la ruleta paga doble al acertar color y el cero pierde', () => {
  const redWin = playRoulette(economyState(), 10, 'red', 3_000, () => 1 / 37);
  const zero = playRoulette(economyState(), 10, 'red', 4_000, () => 0);

  assert.equal(redWin.result, 'played');
  assert.equal(zero.result, 'played');
  if (redWin.result !== 'played' || zero.result !== 'played' || redWin.game.gameId !== 'roulette' || zero.game.gameId !== 'roulette') return;
  assert.equal(redWin.game.number, 1);
  assert.equal(redWin.game.won, true);
  assert.equal(redWin.state.mapocoins, 110);
  assert.equal(zero.game.number, 0);
  assert.equal(zero.game.color, 'green');
  assert.equal(zero.game.won, false);
});

test('rechaza apuestas inválidas o superiores al saldo sin mutar estado', () => {
  const state = economyState(9);
  const noFunds = playSlots(state, 10, 5_000);
  const invalid = playSlots(state, 12 as CasinoWager, 5_000);

  assert.equal(noFunds.result, 'insufficient-funds');
  assert.equal(invalid.result, 'invalid-wager');
  assert.equal(noFunds.state, state);
  assert.equal(invalid.state, state);
});
