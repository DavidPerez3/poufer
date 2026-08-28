import type { MapoferNeeds } from '@/domain/mapofer';

export const MAX_OFFLINE_HOURS = 48;
export const GAME_TICK_MS = 30_000;

export const NEED_DECAY_PER_HOUR: Readonly<MapoferNeeds> = {
  hunger: 4,
  hygiene: 2,
  sleep: 3,
  boredom: -5,
};

export type BasicActionId = 'eat' | 'shower' | 'rest' | 'watchAnime';

export type NeedEffects = Partial<Record<keyof MapoferNeeds, number>>;

export type BasicAction = {
  id: BasicActionId;
  effects: NeedEffects;
};

export const BASIC_ACTIONS: Readonly<Record<BasicActionId, BasicAction>> = {
  eat: {
    id: 'eat',
    effects: { hunger: 28, hygiene: -2 },
  },
  shower: {
    id: 'shower',
    effects: { hygiene: 42, boredom: 2 },
  },
  rest: {
    id: 'rest',
    effects: { sleep: 36, hunger: -6, boredom: -8 },
  },
  watchAnime: {
    id: 'watchAnime',
    effects: { boredom: -38, sleep: -4 },
  },
};
