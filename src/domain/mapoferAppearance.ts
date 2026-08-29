import type { ActiveItemEffect } from '@/domain/items';
import { deriveMood, moodLabel, type EyeState, type MapoferMood, type MapoferVitals } from '@/domain/mapofer';

export type MapoferStatus = MapoferMood | 'fino' | 'sudando' | 'borracho' | 'resacoso' | 'fumando' | 'empanado';

export type MapoferAppearance = {
  status: MapoferStatus;
  eyeState: EyeState;
  isAltered: boolean;
  isSweating: boolean;
  alteredIntensity: number;
  drunkIntensity: number;
  isDrunk: boolean;
  smokeIntensity: number;
  redEyeIntensity: number;
};

type AppearanceFlags = {
  vitals: MapoferVitals;
  isAltered: boolean;
  isDrunk: boolean;
  isHungover: boolean;
  smokeIntensity: number;
  redEyeIntensity: number;
};

function deriveStatus(flags: AppearanceFlags): MapoferStatus {
  if (flags.redEyeIntensity > 0) return 'empanado';
  if (flags.isAltered) return 'fino';
  if (flags.isDrunk) return 'borracho';
  if (flags.smokeIntensity > 0) return 'fumando';
  if (flags.isHungover) return 'resacoso';
  if (flags.vitals.sweat >= 62) return 'sudando';
  return deriveMood(flags.vitals);
}

function deriveEyeState(flags: AppearanceFlags): EyeState {
  if (flags.redEyeIntensity > 0) return 'red';
  if (flags.isAltered) return 'dilated';
  if (flags.isDrunk) return 'drunk';
  if (flags.isHungover || flags.vitals.sleep < 32) return 'tired';
  return 'normal';
}

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
  const smokeIntensity = currentEffects.reduce(
    (highest, effect) => Math.max(highest, effect.smokeIntensity), 0,
  );
  const redEyeIntensity = currentEffects.reduce(
    (highest, effect) => Math.max(highest, effect.redEyeIntensity), 0,
  );
  const isAltered = alteredIntensity > 0 || vitals.altered >= 18;
  const isSweating = vitals.sweat >= 15;
  const isDrunk = drunkIntensity > 0 || vitals.drunkenness >= 18;
  const isHungover = vitals.hangover >= 28 && vitals.drunkenness < 22;
  const flags = { vitals, isAltered, isDrunk, isHungover, smokeIntensity, redEyeIntensity };

  return {
    status: deriveStatus(flags),
    eyeState: deriveEyeState(flags),
    isAltered,
    isSweating,
    alteredIntensity,
    drunkIntensity,
    isDrunk,
    smokeIntensity,
    redEyeIntensity,
  };
}

export const statusLabel: Record<MapoferStatus, string> = {
  ...moodLabel,
  fino: 'FINO',
  sudando: 'SUDANDO',
  borracho: 'BORRACHO',
  resacoso: 'RESACOSO',
  fumando: 'FUMANDO',
  empanado: 'EMPANADO',
};
