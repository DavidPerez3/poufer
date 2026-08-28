import assert from 'node:assert/strict';
import test from 'node:test';

import { advanceNeeds, applyNeedEffects, type TimedNeeds } from '../src/domain/gameEngine';

const HOUR_MS = 3_600_000;

const healthyState: TimedNeeds = {
  hunger: 80,
  hygiene: 80,
  sleep: 80,
  boredom: 20,
  craving: 12,
  altered: 0,
  sweat: 0,
  energy: 72,
  lastUpdatedAt: 1_000,
};

test('aplica el deterioro proporcional al tiempo transcurrido', () => {
  const result = advanceNeeds(healthyState, healthyState.lastUpdatedAt + HOUR_MS);

  assert.deepEqual(result, {
    hunger: 76,
    hygiene: 78,
    sleep: 77,
    boredom: 25,
    craving: 13,
    altered: 0,
    sweat: 0,
    energy: 70,
    lastUpdatedAt: healthyState.lastUpdatedAt + HOUR_MS,
  });
});

test('limita el progreso offline a 48 horas y los stats a 0-100', () => {
  const result = advanceNeeds(healthyState, healthyState.lastUpdatedAt + 200 * HOUR_MS);

  assert.equal(result.hunger, 0);
  assert.equal(result.hygiene, 0);
  assert.equal(result.sleep, 0);
  assert.equal(result.boredom, 100);
  assert.equal(result.altered, 0);
  assert.equal(result.sweat, 0);
  assert.equal(result.energy, 0);
});

test('no aplica deterioro negativo si el reloj del dispositivo retrocede', () => {
  const result = advanceNeeds(healthyState, healthyState.lastUpdatedAt - HOUR_MS);

  assert.deepEqual(result, healthyState);
});

test('sanea valores persistidos inválidos y limita los efectos', () => {
  const result = applyNeedEffects(
    {
      hunger: 95,
      hygiene: 2,
      sleep: 80,
      boredom: 20,
      craving: 12,
      altered: 0,
      sweat: 0,
      energy: 72,
    },
    { hunger: 20, hygiene: -20, boredom: -50, altered: 130, sweat: 18 },
  );

  assert.deepEqual(result, {
    hunger: 100,
    hygiene: 0,
    sleep: 80,
    boredom: 0,
    craving: 12,
    altered: 100,
    sweat: 18,
    energy: 72,
  });
});
