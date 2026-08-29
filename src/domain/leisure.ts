import type { NeedEffects } from '@/domain/gameBalance';
import { advanceNeeds, applyNeedEffects, type TimedNeeds } from '@/domain/gameEngine';

export type LeisureActivityId = 'anime' | 'techno' | 'night-walk';
export type LeisureCategory = 'calm' | 'music' | 'outdoor';

export type LeisureActivity = {
  id: LeisureActivityId;
  name: string;
  description: string;
  icon: string;
  category: LeisureCategory;
  durationMinutes: number;
  effects: NeedEffects;
};

export const LEISURE_ACTIVITIES: Readonly<Record<LeisureActivityId, LeisureActivity>> = {
  anime: {
    id: 'anime',
    name: 'Ver anime',
    description: 'Actividad tranquila: capítulo, sofá y cero responsabilidades.',
    icon: '📺',
    category: 'calm',
    durationMinutes: 45,
    effects: { boredom: -34, sleep: -5, bladder: 3 },
  },
  techno: {
    id: 'techno',
    name: 'Escuchar temazos',
    description: 'Un pequeño calentamiento para la futura fase Rave.',
    icon: '🎧',
    category: 'music',
    durationMinutes: 25,
    effects: { boredom: -25, energy: -6, sweat: 4 },
  },
  'night-walk': {
    id: 'night-walk',
    name: 'Paseo nocturno',
    description: 'Una vuelta corta bajo los neones para despejarse.',
    icon: '🌃',
    category: 'outdoor',
    durationMinutes: 30,
    effects: { boredom: -20, energy: -7, hunger: -4, hygiene: -2 },
  },
};

export const LEISURE_ACTIVITY_LIST = Object.values(LEISURE_ACTIVITIES);

export type LastLeisureActivity = {
  activityId: LeisureActivityId;
  completedAt: number;
};

export function performLeisureActivity(
  state: TimedNeeds,
  activityId: LeisureActivityId,
  now: number,
  hygieneDecayPerHour = 0,
): TimedNeeds {
  const current = advanceNeeds(state, now, { hygieneDecayPerHour });
  return {
    ...applyNeedEffects(current, LEISURE_ACTIVITIES[activityId].effects),
    lastUpdatedAt: current.lastUpdatedAt,
  };
}
