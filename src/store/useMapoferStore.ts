import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { BASIC_ACTIONS, type BasicActionId } from '@/domain/gameBalance';
import { advanceNeeds, applyNeedEffects } from '@/domain/gameEngine';
import { consumeItem } from '@/domain/itemEngine';
import {
  INITIAL_INVENTORY,
  ITEMS,
  type ActiveItemEffect,
  type Inventory,
  type ItemId,
} from '@/domain/items';
import { INITIAL_VITALS, normalizeVitals, type MapoferVitals } from '@/domain/mapofer';

const STORAGE_VERSION = 4;
const isStaticWebRender = Platform.OS === 'web' && typeof window === 'undefined';
const staticRenderStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function normalizeActiveEffects(value: unknown): ActiveItemEffect[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((candidate): ActiveItemEffect[] => {
    if (!candidate || typeof candidate !== 'object') return [];
    const effect = candidate as Partial<ActiveItemEffect>;
    if (
      !effect.itemId || !(effect.itemId in ITEMS) ||
      !Number.isFinite(effect.startedAt) ||
      !Number.isFinite(effect.expiresAt)
    ) {
      return [];
    }

    const item = ITEMS[effect.itemId];
    return [{
      itemId: effect.itemId,
      animation: item.animation,
      startedAt: effect.startedAt!,
      expiresAt: effect.expiresAt!,
      alteredIntensity: item.activeEffect.alteredIntensity,
      drunkIntensity: item.activeEffect.drunkIntensity,
      smokeIntensity: item.activeEffect.smokeIntensity,
      redEyeIntensity: item.activeEffect.redEyeIntensity,
    }];
  });
}

export type UseItemResult = 'used' | 'out-of-stock';

type MapoferStore = MapoferVitals & {
  mapocoins: number;
  inventory: Inventory;
  activeEffects: ActiveItemEffect[];
  lastUpdatedAt: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  applyElapsedTime: (now?: number) => void;
  performBasicAction: (actionId: BasicActionId, now?: number) => void;
  useItem: (itemId: ItemId, now?: number) => UseItemResult;
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
      ...INITIAL_VITALS,
      mapocoins: 0,
      inventory: INITIAL_INVENTORY,
      activeEffects: [],
      lastUpdatedAt: touchTime(),
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      applyElapsedTime: (now = touchTime()) => {
        set((state) => ({
          ...advanceNeeds(state, now),
          activeEffects: state.activeEffects.filter((effect) => effect.expiresAt > now),
        }));
      },

      performBasicAction: (actionId, now = touchTime()) =>
        set((state) => {
          const current = advanceNeeds(state, now);
          return {
            ...applyNeedEffects(current, BASIC_ACTIONS[actionId].effects),
            lastUpdatedAt: current.lastUpdatedAt,
          };
        }),

      useItem: (itemId, now = touchTime()) => {
        if (get().inventory[itemId] <= 0) return 'out-of-stock';

        set((state) => {
          const outcome = consumeItem(state, itemId, now);
          return outcome.state;
        });

        return 'used';
      },

      eat: () => get().performBasicAction('eat'),
      shower: () => get().performBasicAction('shower'),
      rest: () => get().performBasicAction('rest'),
      watchAnime: () => get().performBasicAction('watchAnime'),

      reset: () =>
        set({
          ...INITIAL_VITALS,
          mapocoins: 0,
          inventory: INITIAL_INVENTORY,
          activeEffects: [],
          lastUpdatedAt: touchTime(),
        }),
    }),
    {
      name: 'poufer-state-v1',
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => (isStaticWebRender ? staticRenderStorage : AsyncStorage)),
      migrate: (persistedState) => persistedState as MapoferStore,
      partialize: (state) => ({
        hunger: state.hunger,
        hygiene: state.hygiene,
        sleep: state.sleep,
        boredom: state.boredom,
        craving: state.craving,
        altered: state.altered,
        sweat: state.sweat,
        energy: state.energy,
        drunkenness: state.drunkenness,
        hangover: state.hangover,
        mapocoins: state.mapocoins,
        inventory: state.inventory,
        activeEffects: state.activeEffects,
        lastUpdatedAt: state.lastUpdatedAt,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<MapoferStore> | undefined;
        const vitals = normalizeVitals(saved ?? {});
        const savedInventory = saved?.inventory;
        const inventory: Inventory = {
          pill: Number.isFinite(savedInventory?.pill)
            ? Math.max(0, Math.floor(savedInventory!.pill))
            : INITIAL_INVENTORY.pill,
          chicken: Number.isFinite(savedInventory?.chicken)
            ? Math.max(0, Math.floor(savedInventory!.chicken))
            : INITIAL_INVENTORY.chicken,
          beer: Number.isFinite(savedInventory?.beer) ? Math.max(0, Math.floor(savedInventory!.beer)) : INITIAL_INVENTORY.beer,
          vermouth: Number.isFinite(savedInventory?.vermouth) ? Math.max(0, Math.floor(savedInventory!.vermouth)) : INITIAL_INVENTORY.vermouth,
          'mixed-drink': Number.isFinite(savedInventory?.['mixed-drink']) ? Math.max(0, Math.floor(savedInventory!['mixed-drink'])) : INITIAL_INVENTORY['mixed-drink'],
          shot: Number.isFinite(savedInventory?.shot) ? Math.max(0, Math.floor(savedInventory!.shot)) : INITIAL_INVENTORY.shot,
          cigarette: Number.isFinite(savedInventory?.cigarette) ? Math.max(0, Math.floor(savedInventory!.cigarette)) : INITIAL_INVENTORY.cigarette,
          joint: Number.isFinite(savedInventory?.joint) ? Math.max(0, Math.floor(savedInventory!.joint)) : INITIAL_INVENTORY.joint,
        };
        return {
          ...current,
          ...vitals,
          mapocoins: Number.isFinite(saved?.mapocoins)
            ? Math.max(0, Math.floor(saved!.mapocoins!))
            : current.mapocoins,
          inventory,
          activeEffects: normalizeActiveEffects(saved?.activeEffects),
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
