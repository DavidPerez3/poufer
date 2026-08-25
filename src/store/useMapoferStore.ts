import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { clampNeed, INITIAL_NEEDS, MapoferNeeds } from '@/domain/mapofer';

const MAX_OFFLINE_HOURS = 48;
const DECAY_PER_HOUR = {
  hunger: 4,
  hygiene: 2,
  sleep: 3,
  boredom: 5,
} as const;

type MapoferStore = MapoferNeeds & {
  mapocoins: number;
  lastUpdatedAt: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  applyElapsedTime: (now?: number) => void;
  eat: () => void;
  shower: () => void;
  rest: () => void;
  watchAnime: () => void;
  reset: () => void;
};

const touchTime = () => Date.now();

export const useMapoferStore = create<MapoferStore>()(
  persist(
    (set, get) => ({
      ...INITIAL_NEEDS,
      mapocoins: 0,
      lastUpdatedAt: touchTime(),
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      applyElapsedTime: (now = touchTime()) => {
        const previous = get().lastUpdatedAt;
        const elapsedHours = Math.min(
          MAX_OFFLINE_HOURS,
          Math.max(0, (now - previous) / 3_600_000),
        );

        if (elapsedHours < 0.001) return;

        set((state) => ({
          hunger: clampNeed(state.hunger - DECAY_PER_HOUR.hunger * elapsedHours),
          hygiene: clampNeed(state.hygiene - DECAY_PER_HOUR.hygiene * elapsedHours),
          sleep: clampNeed(state.sleep - DECAY_PER_HOUR.sleep * elapsedHours),
          boredom: clampNeed(state.boredom + DECAY_PER_HOUR.boredom * elapsedHours),
          lastUpdatedAt: now,
        }));
      },

      eat: () => {
        get().applyElapsedTime();
        set((state) => ({
          hunger: clampNeed(state.hunger + 28),
          hygiene: clampNeed(state.hygiene - 2),
        }));
      },

      shower: () => {
        get().applyElapsedTime();
        set((state) => ({
          hygiene: clampNeed(state.hygiene + 42),
          boredom: clampNeed(state.boredom + 2),
        }));
      },

      rest: () => {
        get().applyElapsedTime();
        set((state) => ({
          sleep: clampNeed(state.sleep + 36),
          hunger: clampNeed(state.hunger - 6),
          boredom: clampNeed(state.boredom - 8),
        }));
      },

      watchAnime: () => {
        get().applyElapsedTime();
        set((state) => ({
          boredom: clampNeed(state.boredom - 38),
          sleep: clampNeed(state.sleep - 4),
        }));
      },

      reset: () =>
        set({
          ...INITIAL_NEEDS,
          mapocoins: 0,
          lastUpdatedAt: touchTime(),
        }),
    }),
    {
      name: 'poufer-state-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hunger: state.hunger,
        hygiene: state.hygiene,
        sleep: state.sleep,
        boredom: state.boredom,
        mapocoins: state.mapocoins,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
      onRehydrateStorage: () => (state) => {
        state?.applyElapsedTime(Date.now());
        state?.setHasHydrated(true);
      },
    },
  ),
);
