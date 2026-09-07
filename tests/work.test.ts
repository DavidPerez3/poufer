import assert from 'node:assert/strict';
import test from 'node:test';

import type { EconomyState } from '../src/domain/economy';
import { INITIAL_INVENTORY } from '../src/domain/items';
import { INITIAL_VITALS } from '../src/domain/mapofer';
import { calculateWorkResult, completeWorkShift, WORK_JOBS, type WorkState } from '../src/domain/work';

const workState = (now: number): WorkState => ({
  ...INITIAL_VITALS,
  mapocoins: 100,
  inventory: { ...INITIAL_INVENTORY },
  lastDailyRewardAt: null,
  transactions: [],
  lastUpdatedAt: now,
});

test('el sueldo aumenta con aciertos y bonus de velocidad', () => {
  const fast = calculateWorkResult('cashier', { correct: 6, mistakes: 0, elapsedSeconds: 20 }, 10_000);
  const slow = calculateWorkResult('cashier', { correct: 6, mistakes: 0, elapsedSeconds: 40 }, 10_000);

  assert.equal(fast.reward - slow.reward, WORK_JOBS.cashier.speedBonus);
  assert.ok(fast.score > slow.score);
});

test('los errores reducen el sueldo sin bajar de la recompensa base', () => {
  const result = calculateWorkResult('forklift', { correct: 1, mistakes: 99, elapsedSeconds: 80 }, 20_000);

  assert.equal(result.reward, WORK_JOBS.forklift.baseReward);
  assert.equal(result.score, 0);
});

test('completar un turno abona Mapocoins y desgasta necesidades', () => {
  const state = workState(30_000);
  const outcome = completeWorkShift(state, 'forklift', { correct: 12, mistakes: 1, elapsedSeconds: 28 }, 30_000);

  assert.equal(outcome.state.mapocoins, state.mapocoins + outcome.result.reward);
  assert.ok(outcome.state.energy < state.energy);
  assert.ok(outcome.state.hunger < state.hunger);
  assert.ok(outcome.state.boredom > state.boredom);
  assert.equal(outcome.state.transactions[0]?.label, 'Curro: Carretillero de almacén');
});

test('las recompensas de trabajo conservan el contrato económico genérico', () => {
  const state: EconomyState = workState(40_000);
  const outcome = completeWorkShift(workState(40_000), 'cashier', { correct: 6, mistakes: 0, elapsedSeconds: 10 }, 40_000);

  assert.ok(outcome.state.mapocoins > state.mapocoins);
  assert.equal(outcome.state.transactions[0]?.kind, 'reward');
});
