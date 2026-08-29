import type { ActiveItemEffect } from '@/domain/items';
import { deriveMood, moodLabel, type EyeState, type MapoferMood, type MapoferVitals } from '@/domain/mapofer';

export type MapoferStatus = MapoferMood | 'fino' | 'sudando' | 'borracho' | 'resacoso';

export type MapoferAppearance = {
  status: MapoferStatus;
  eyeState: EyeState;
  isAltered: boolean;
  isSweating: boolean;
  alteredIntensity: number;
  drunkIntensity: number;
  isDrunk: boolean;
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
  const drunkIntensity = currentEffects.reduce(
    (highest, effect) => Math.max(highest, effect.drunkIntensity), 0,
  );
  const isAltered = alteredIntensity > 0 || vitals.altered >= 18;
  const isSweating = vitals.sweat >= 15;
  const isDrunk = drunkIntensity > 0 || vitals.drunkenness >= 18;
  const isHungover = vitals.hangover >= 28 && vitals.drunkenness < 22;

  return {
    status: isAltered ? 'fino' : isDrunk ? 'borracho' : isHungover ? 'resacoso' : vitals.sweat >= 62 ? 'sudando' : deriveMood(vitals),
    eyeState: isAltered ? 'dilated' : isDrunk ? 'drunk' : isHungover || vitals.sleep < 32 ? 'tired' : 'normal',
    isAltered,
    isSweating,
    alteredIntensity,
    drunkIntensity,
    isDrunk,
  };
}

export const statusLabel: Record<MapoferStatus, string> = {
  ...moodLabel,
  fino: 'FINO',
  sudando: 'SUDANDO',
  borracho: 'BORRACHO',
  resacoso: 'RESACOSO',
};
