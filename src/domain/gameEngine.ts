import {
  MAX_OFFLINE_HOURS,
  NEED_DECAY_PER_HOUR,
  type NeedEffects,
} from '@/domain/gameBalance';
import { clampNeed, normalizeNeeds, type MapoferNeeds } from '@/domain/mapofer';

export type TimedNeeds = MapoferNeeds & {
  lastUpdatedAt: number;
};

const HOUR_MS = 3_600_000;

export function applyNeedEffects(needs: MapoferNeeds, effects: NeedEffects): MapoferNeeds {
  return {
    hunger: clampNeed(needs.hunger + (effects.hunger ?? 0)),
    hygiene: clampNeed(needs.hygiene + (effects.hygiene ?? 0)),
    sleep: clampNeed(needs.sleep + (effects.sleep ?? 0)),
    boredom: clampNeed(needs.boredom + (effects.boredom ?? 0)),
  };
}

export function advanceNeeds(state: TimedNeeds, now: number): TimedNeeds {
  const safeNow = Number.isFinite(now) ? now : Date.now();
  const safePrevious = Number.isFinite(state.lastUpdatedAt) ? state.lastUpdatedAt : safeNow;
  const elapsedHours = Math.min(
    MAX_OFFLINE_HOURS,
    Math.max(0, (safeNow - safePrevious) / HOUR_MS),
  );
  const needs = normalizeNeeds(state);

  if (elapsedHours === 0) {
    return { ...needs, lastUpdatedAt: Math.max(safePrevious, safeNow) };
  }

  return {
    hunger: clampNeed(needs.hunger - NEED_DECAY_PER_HOUR.hunger * elapsedHours),
    hygiene: clampNeed(needs.hygiene - NEED_DECAY_PER_HOUR.hygiene * elapsedHours),
    sleep: clampNeed(needs.sleep - NEED_DECAY_PER_HOUR.sleep * elapsedHours),
    boredom: clampNeed(needs.boredom - NEED_DECAY_PER_HOUR.boredom * elapsedHours),
    lastUpdatedAt: safeNow,
  };
}
