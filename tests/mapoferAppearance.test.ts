import assert from 'node:assert/strict';
import test from 'node:test';

import type { ActiveItemEffect } from '../src/domain/items';
import { deriveAppearance } from '../src/domain/mapoferAppearance';
import { INITIAL_VITALS } from '../src/domain/mapofer';

test('deriva ojos dilatados y estado fino desde un efecto activo', () => {
  const now = 10_000;
  const effects: ActiveItemEffect[] = [
    {
      itemId: 'pill',
      animation: 'take-pill',
      startedAt: now - 1_000,
      expiresAt: now + 60_000,
      alteredIntensity: 1,
    },
  ];

  const appearance = deriveAppearance({ ...INITIAL_VITALS, sweat: 20 }, effects, now);

  assert.equal(appearance.status, 'fino');
  assert.equal(appearance.eyeState, 'dilated');
  assert.equal(appearance.isSweating, true);
  assert.equal(appearance.alteredIntensity, 1);
});

test('ignora efectos caducados', () => {
  const now = 10_000;
  const effects: ActiveItemEffect[] = [
    {
      itemId: 'chicken',
      animation: 'take-chicken',
      startedAt: 1_000,
      expiresAt: 9_000,
      alteredIntensity: 2,
    },
  ];

  const appearance = deriveAppearance(INITIAL_VITALS, effects, now);

  assert.equal(appearance.status, 'tranquilo');
  assert.equal(appearance.eyeState, 'normal');
  assert.equal(appearance.isAltered, false);
});
