import {
  MAX_OFFLINE_HOURS,
  VITAL_CHANGE_PER_HOUR,
  type NeedEffects,
} from '@/domain/gameBalance';
import { clampNeed, normalizeVitals, type MapoferVitals } from '@/domain/mapofer';

export type TimedNeeds = MapoferVitals & {
  lastUpdatedAt: number;
};

const HOUR_MS = 3_600_000;

export function applyNeedEffects(needs: MapoferVitals, effects: NeedEffects): MapoferVitals {
  return {
    hunger: clampNeed(needs.hunger + (effects.hunger ?? 0)),
    hygiene: clampNeed(needs.hygiene + (effects.hygiene ?? 0)),
    sleep: clampNeed(needs.sleep + (effects.sleep ?? 0)),
    boredom: clampNeed(needs.boredom + (effects.boredom ?? 0)),
    craving: clampNeed(needs.craving + (effects.craving ?? 0)),
    altered: clampNeed(needs.altered + (effects.altered ?? 0)),
    sweat: clampNeed(needs.sweat + (effects.sweat ?? 0)),
    energy: clampNeed(needs.energy + (effects.energy ?? 0)),
    drunkenness: clampNeed(needs.drunkenness + (effects.drunkenness ?? 0)),
    hangover: clampNeed(needs.hangover + (effects.hangover ?? 0)),
  };
}

export function advanceNeeds(state: TimedNeeds, now: number): TimedNeeds {
  const safeNow = Number.isFinite(now) ? now : Date.now();
  const safePrevious = Number.isFinite(state.lastUpdatedAt) ? state.lastUpdatedAt : safeNow;
  const elapsedHours = Math.min(
    MAX_OFFLINE_HOURS,
    Math.max(0, (safeNow - safePrevious) / HOUR_MS),
  );
  const needs = normalizeVitals(state);

  if (elapsedHours === 0) {
    return { ...needs, lastUpdatedAt: Math.max(safePrevious, safeNow) };
  }

  return {
    hunger: clampNeed(needs.hunger - VITAL_CHANGE_PER_HOUR.hunger * elapsedHours),
    hygiene: clampNeed(needs.hygiene - VITAL_CHANGE_PER_HOUR.hygiene * elapsedHours),
    sleep: clampNeed(needs.sleep - VITAL_CHANGE_PER_HOUR.sleep * elapsedHours),
    boredom: clampNeed(needs.boredom - VITAL_CHANGE_PER_HOUR.boredom * elapsedHours),
    craving: clampNeed(needs.craving - VITAL_CHANGE_PER_HOUR.craving * elapsedHours),
    altered: clampNeed(needs.altered - VITAL_CHANGE_PER_HOUR.altered * elapsedHours),
    sweat: clampNeed(needs.sweat - VITAL_CHANGE_PER_HOUR.sweat * elapsedHours),
    energy: clampNeed(needs.energy - VITAL_CHANGE_PER_HOUR.energy * elapsedHours),
    drunkenness: clampNeed(needs.drunkenness - VITAL_CHANGE_PER_HOUR.drunkenness * elapsedHours),
    hangover: clampNeed(
      needs.hangover - VITAL_CHANGE_PER_HOUR.hangover * elapsedHours +
        Math.min(needs.drunkenness, VITAL_CHANGE_PER_HOUR.drunkenness * elapsedHours) * 0.28,
    ),
    lastUpdatedAt: safeNow,
  };
}
