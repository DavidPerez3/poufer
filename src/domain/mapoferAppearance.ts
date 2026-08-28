import type { ActiveItemEffect } from '@/domain/items';
import { deriveMood, moodLabel, type EyeState, type MapoferMood, type MapoferVitals } from '@/domain/mapofer';

export type MapoferStatus = MapoferMood | 'fino' | 'sudando';

export type MapoferAppearance = {
  status: MapoferStatus;
  eyeState: EyeState;
  isAltered: boolean;
  isSweating: boolean;
  alteredIntensity: number;
};

export function deriveAppearance(
  vitals: MapoferVitals,
  activeEffects: ActiveItemEffect[],
  now = Date.now(),
): MapoferAppearance {
  const currentEffects = activeEffects.filter((effect) => effect.expiresAt > now);
  const alteredIntensity = currentEffects.reduce(
    (highest, effect) => Math.max(highest, effect.alteredIntensity),
    0,
  );
  const isAltered = alteredIntensity > 0 || vitals.altered >= 18;
  const isSweating = vitals.sweat >= 15;

  return {
    status: isAltered ? 'fino' : vitals.sweat >= 62 ? 'sudando' : deriveMood(vitals),
    eyeState: isAltered ? 'dilated' : vitals.sleep < 32 ? 'tired' : 'normal',
    isAltered,
    isSweating,
    alteredIntensity,
  };
}

export const statusLabel: Record<MapoferStatus, string> = {
  ...moodLabel,
  fino: 'FINO',
  sudando: 'SUDANDO',
};
