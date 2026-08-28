import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { BASIC_ACTIONS, type BasicActionId } from '@/domain/gameBalance';
import { advanceNeeds, applyNeedEffects } from '@/domain/gameEngine';
import { INITIAL_NEEDS, normalizeNeeds, type MapoferNeeds } from '@/domain/mapofer';

const STORAGE_VERSION = 1;
const isStaticWebRender = Platform.OS === 'web' && typeof window === 'undefined';
const staticRenderStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

type MapoferStore = MapoferNeeds & {
  mapocoins: number;
  lastUpdatedAt: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  applyElapsedTime: (now?: number) => void;
  performBasicAction: (actionId: BasicActionId, now?: number) => void;
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
        set((state) => advanceNeeds(state, now));
      },

      performBasicAction: (actionId, now = touchTime()) =>
        set((state) => {
          const current = advanceNeeds(state, now);
          return {
            ...applyNeedEffects(current, BASIC_ACTIONS[actionId].effects),
            lastUpdatedAt: current.lastUpdatedAt,
          };
        }),

      eat: () => get().performBasicAction('eat'),
      shower: () => get().performBasicAction('shower'),
      rest: () => get().performBasicAction('rest'),
      watchAnime: () => get().performBasicAction('watchAnime'),

      reset: () =>
        set({
          ...INITIAL_NEEDS,
          mapocoins: 0,
          lastUpdatedAt: touchTime(),
        }),
    }),
    {
      name: 'poufer-state-v1',
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => (isStaticWebRender ? staticRenderStorage : AsyncStorage)),
      partialize: (state) => ({
        hunger: state.hunger,
        hygiene: state.hygiene,
        sleep: state.sleep,
        boredom: state.boredom,
        mapocoins: state.mapocoins,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<MapoferStore> | undefined;
        const needs = normalizeNeeds(saved ?? {});
        return {
          ...current,
          ...needs,
          mapocoins: Number.isFinite(saved?.mapocoins)
            ? Math.max(0, Math.floor(saved!.mapocoins!))
            : current.mapocoins,
          lastUpdatedAt: Number.isFinite(saved?.lastUpdatedAt)
            ? saved!.lastUpdatedAt!
            : current.lastUpdatedAt,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (!error) state?.applyElapsedTime(Date.now());
        if (state) {
          state.setHasHydrated(true);
        } else {
          useMapoferStore.setState({ hasHydrated: true });
        }
      },
    },
  ),
);
