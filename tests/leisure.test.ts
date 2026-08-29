import assert from 'node:assert/strict';
import test from 'node:test';

import { performLeisureActivity } from '../src/domain/leisure';
import { INITIAL_VITALS } from '../src/domain/mapofer';

test('ver anime reduce aburrimiento sin saltarse los límites', () => {
  const result = performLeisureActivity(
    { ...INITIAL_VITALS, boredom: 20, lastUpdatedAt: 1_000 },
    'anime',
    1_000,
  );

  assert.equal(result.boredom, 0);
  assert.equal(result.sleep, INITIAL_VITALS.sleep - 5);
  assert.equal(result.bladder, INITIAL_VITALS.bladder + 3);
});

test('cada actividad aplica únicamente su configuración de balance', () => {
  const result = performLeisureActivity(
    { ...INITIAL_VITALS, boredom: 60, lastUpdatedAt: 2_000 },
    'night-walk',
    2_000,
  );

  assert.equal(result.boredom, 40);
  assert.equal(result.energy, INITIAL_VITALS.energy - 7);
  assert.equal(result.hunger, INITIAL_VITALS.hunger - 4);
  assert.equal(result.hygiene, INITIAL_VITALS.hygiene - 2);
});
