import { applyNeedEffects } from '@/domain/gameEngine';
import type { MapoferVitals } from '@/domain/mapofer';

export type PoopExpression = 'happy' | 'worried' | 'angry';

export type CartoonPoop = {
  id: string;
  expression: PoopExpression;
  createdAt: number;
};

export type BathroomActionId = 'shower' | 'pee' | 'poop' | 'clean';

export type BathroomState = MapoferVitals & {
  poops: CartoonPoop[];
};

export type BathroomOutcome = {
  state: BathroomState;
  result: 'done' | 'not-needed' | 'nothing-to-clean';
};

const expressions: PoopExpression[] = ['happy', 'worried', 'angry'];

export function performBathroomAction(
  state: BathroomState,
  action: BathroomActionId,
  now: number,
): BathroomOutcome {
  if (action === 'pee' && state.bladder < 15) return { state, result: 'not-needed' };
  if (action === 'poop' && state.bowel < 25) return { state, result: 'not-needed' };
  if (action === 'clean' && state.poops.length === 0) return { state, result: 'nothing-to-clean' };

  if (action === 'shower') {
    return { state: { ...state, ...applyNeedEffects(state, { hygiene: 45, sweat: -55 }) }, result: 'done' };
  }
  if (action === 'pee') {
    return { state: { ...state, ...applyNeedEffects(state, { bladder: -75, hygiene: -1 }) }, result: 'done' };
  }
  if (action === 'poop') {
    const poop: CartoonPoop = {
      id: `${now}-${state.poops.length}`,
      expression: expressions[state.poops.length % expressions.length],
      createdAt: now,
    };
    return {
      state: {
        ...state,
        ...applyNeedEffects(state, { bowel: -80, hygiene: -5 }),
        poops: [...state.poops, poop],
      },
      result: 'done',
    };
  }

  return {
    state: {
      ...state,
      ...applyNeedEffects(state, { hygiene: Math.min(18, state.poops.length * 4) }),
      poops: [],
    },
    result: 'done',
  };
}

export const poopFace: Record<PoopExpression, string> = {
  happy: '•ᴗ•',
  worried: '•﹏•',
  angry: 'ಠ益ಠ',
};
