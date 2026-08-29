export type EyeState = 'normal' | 'red' | 'dilated' | 'tired' | 'drunk';

export type MapoferMood =
  | 'contentillo'
  | 'tranquilo'
  | 'aburrido'
  | 'hambriento'
  | 'cansado'
  | 'hecho-polvo';

export type MapoferNeeds = {
  hunger: number;
  hygiene: number;
  sleep: number;
  boredom: number;
};

export type MapoferVitals = MapoferNeeds & {
  craving: number;
  altered: number;
  sweat: number;
  energy: number;
  drunkenness: number;
  hangover: number;
  bladder: number;
  bowel: number;
};

export const INITIAL_NEEDS: MapoferNeeds = {
  hunger: 82,
  hygiene: 88,
  sleep: 78,
  boredom: 28,
};

export const INITIAL_VITALS: MapoferVitals = {
  ...INITIAL_NEEDS,
  craving: 12,
  altered: 0,
  sweat: 0,
  energy: 72,
  drunkenness: 0,
  hangover: 0,
  bladder: 25,
  bowel: 18,
};

export const clampNeed = (value: number) => Math.max(0, Math.min(100, value));

export function normalizeNeeds(needs: Partial<MapoferNeeds>): MapoferNeeds {
  return {
    hunger: clampNeed(Number.isFinite(needs.hunger) ? needs.hunger! : INITIAL_NEEDS.hunger),
    hygiene: clampNeed(Number.isFinite(needs.hygiene) ? needs.hygiene! : INITIAL_NEEDS.hygiene),
    sleep: clampNeed(Number.isFinite(needs.sleep) ? needs.sleep! : INITIAL_NEEDS.sleep),
    boredom: clampNeed(Number.isFinite(needs.boredom) ? needs.boredom! : INITIAL_NEEDS.boredom),
  };
}

export function normalizeVitals(vitals: Partial<MapoferVitals>): MapoferVitals {
  return {
    ...normalizeNeeds(vitals),
    craving: clampNeed(Number.isFinite(vitals.craving) ? vitals.craving! : INITIAL_VITALS.craving),
    altered: clampNeed(Number.isFinite(vitals.altered) ? vitals.altered! : INITIAL_VITALS.altered),
    sweat: clampNeed(Number.isFinite(vitals.sweat) ? vitals.sweat! : INITIAL_VITALS.sweat),
    energy: clampNeed(Number.isFinite(vitals.energy) ? vitals.energy! : INITIAL_VITALS.energy),
    drunkenness: clampNeed(Number.isFinite(vitals.drunkenness) ? vitals.drunkenness! : INITIAL_VITALS.drunkenness),
    hangover: clampNeed(Number.isFinite(vitals.hangover) ? vitals.hangover! : INITIAL_VITALS.hangover),
    bladder: clampNeed(Number.isFinite(vitals.bladder) ? vitals.bladder! : INITIAL_VITALS.bladder),
    bowel: clampNeed(Number.isFinite(vitals.bowel) ? vitals.bowel! : INITIAL_VITALS.bowel),
  };
}

export function deriveMood(needs: MapoferNeeds): MapoferMood {
  if (needs.hunger < 18 || needs.hygiene < 15 || needs.sleep < 15) return 'hecho-polvo';
  if (needs.sleep < 32) return 'cansado';
  if (needs.hunger < 32) return 'hambriento';
  if (needs.boredom > 68) return 'aburrido';
  if (needs.boredom <= 10) return 'contentillo';
  return 'tranquilo';
}

export const moodLabel: Record<MapoferMood, string> = {
  contentillo: 'CONTENTILLO',
  tranquilo: 'TRANQUILO',
  aburrido: 'ABURRIDO',
  hambriento: 'HAMBRIENTO',
  cansado: 'CANSADO',
  'hecho-polvo': 'HECHO POLVO',
};
