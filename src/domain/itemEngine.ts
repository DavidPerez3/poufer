import { advanceNeeds, applyNeedEffects, type TimedNeeds } from '@/domain/gameEngine';
import { ITEMS, type ActiveItemEffect, type Inventory, type ItemId } from '@/domain/items';

export type ItemUseState = TimedNeeds & {
  inventory: Inventory;
  activeEffects: ActiveItemEffect[];
};

export type ItemUseOutcome =
  | { result: 'out-of-stock'; state: ItemUseState }
  | { result: 'used'; state: ItemUseState };

export function consumeItem(state: ItemUseState, itemId: ItemId, now: number): ItemUseOutcome {
  if (state.inventory[itemId] <= 0) return { result: 'out-of-stock', state };

  const item = ITEMS[itemId];
  const current = advanceNeeds(state, now);
  const previousEffects = state.activeEffects.filter(
    (effect) => effect.expiresAt > now && effect.itemId !== itemId,
  );

  return {
    result: 'used',
    state: {
      ...applyNeedEffects(current, item.effects),
      lastUpdatedAt: current.lastUpdatedAt,
      inventory: {
        ...state.inventory,
        [itemId]: Math.max(0, state.inventory[itemId] - 1),
      },
      activeEffects: [
        ...previousEffects,
        {
          itemId,
          animation: item.animation,
          startedAt: now,
          expiresAt: now + item.activeEffect.durationMs,
          alteredIntensity: item.activeEffect.alteredIntensity,
        },
      ],
    },
  };
}
