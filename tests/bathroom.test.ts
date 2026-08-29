import assert from 'node:assert/strict';
import test from 'node:test';

import { performBathroomAction } from '../src/domain/bathroom';
import { INITIAL_VITALS } from '../src/domain/mapofer';

test('cagar vacía el intestino y crea una caca cartoon persistible', () => {
  const outcome = performBathroomAction(
    { ...INITIAL_VITALS, bowel: 80, hygiene: 70, poops: [] },
    'poop',
    12_000,
  );

  assert.equal(outcome.result, 'done');
  assert.equal(outcome.state.bowel, 0);
  assert.equal(outcome.state.hygiene, 65);
  assert.equal(outcome.state.poops.length, 1);
  assert.equal(outcome.state.poops[0]?.expression, 'happy');
});

test('no permite forzar el baño cuando Mapofer no lo necesita', () => {
  const state = { ...INITIAL_VITALS, bladder: 5, bowel: 5, poops: [] };

  assert.equal(performBathroomAction(state, 'pee', 1).result, 'not-needed');
  assert.equal(performBathroomAction(state, 'poop', 1).result, 'not-needed');
});

test('limpiar retira todas las cacas y recupera higiene limitada', () => {
  const outcome = performBathroomAction(
    {
      ...INITIAL_VITALS,
      hygiene: 40,
      poops: [
        { id: 'one', expression: 'happy', createdAt: 1 },
        { id: 'two', expression: 'worried', createdAt: 2 },
      ],
    },
    'clean',
    3,
  );

  assert.equal(outcome.state.poops.length, 0);
  assert.equal(outcome.state.hygiene, 48);
});
