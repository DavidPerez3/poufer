export type EyeState = 'normal' | 'red' | 'dilated' | 'tired' | 'drunk';

export type MapoferMood =
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

export const INITIAL_NEEDS: MapoferNeeds = {
  hunger: 82,
  hygiene: 88,
  sleep: 78,
  boredom: 28,
};

export const clampNeed = (value: number) => Math.max(0, Math.min(100, value));

export function deriveMood(needs: MapoferNeeds): MapoferMood {
  if (needs.hunger < 18 || needs.hygiene < 15 || needs.sleep < 15) return 'hecho-polvo';
  if (needs.sleep < 32) return 'cansado';
  if (needs.hunger < 32) return 'hambriento';
  if (needs.boredom > 68) return 'aburrido';
  return 'tranquilo';
}

export const moodLabel: Record<MapoferMood, string> = {
  tranquilo: 'TRANQUILO',
  aburrido: 'ABURRIDO',
  hambriento: 'HAMBRIENTO',
  cansado: 'CANSADO',
  'hecho-polvo': 'HECHO POLVO',
};
