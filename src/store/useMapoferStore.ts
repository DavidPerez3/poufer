import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';

import { BASIC_ACTIONS, type BasicActionId } from '@/domain/gameBalance';
import { performBathroomAction, type BathroomActionId, type CartoonPoop } from '@/domain/bathroom';
import {
  playRoulette,
  playSlots,
  type CasinoPlayResult,
  type CasinoResult,
  type CasinoWager,
  type RouletteBet,
  type SlotSymbol,
} from '@/domain/casino';
import {
  buyItem,
  claimDailyReward,
  STARTING_MAPOCOINS,
  type DailyRewardResult,
  type EconomyTransaction,
  type PurchaseResult,
} from '@/domain/economy';
import { advanceNeeds, applyNeedEffects } from '@/domain/gameEngine';
import { consumeItem } from '@/domain/itemEngine';
import { performLeisureActivity, type LastLeisureActivity, type LeisureActivityId } from '@/domain/leisure';
import {
  INITIAL_INVENTORY,
  ITEMS,
  type ActiveItemEffect,
  type Inventory,
  type ItemId,
} from '@/domain/items';
import { INITIAL_VITALS, normalizeVitals, type MapoferVitals } from '@/domain/mapofer';
import {
  calculateWorkResult,
  completeWorkShift,
  type WorkJobId,
  type WorkPerformance,
  type WorkResult,
} from '@/domain/work';

const STORAGE_VERSION = 9;
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

function normalizePoops(value: unknown): CartoonPoop[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).flatMap((candidate, index): CartoonPoop[] => {
    if (!candidate || typeof candidate !== 'object') return [];
    const poop = candidate as Partial<CartoonPoop>;
    const expression = poop.expression === 'worried' || poop.expression === 'angry' ? poop.expression : 'happy';
    return [{
      id: typeof poop.id === 'string' ? poop.id : `recovered-${index}`,
      expression,
      createdAt: Number.isFinite(poop.createdAt) ? poop.createdAt! : 0,
    }];
  });
}

function normalizeLastActivity(value: unknown): LastLeisureActivity | null {
  if (!value || typeof value !== 'object') return null;
  const activity = value as Partial<LastLeisureActivity>;
  if (
    (activity.activityId !== 'anime' && activity.activityId !== 'techno' && activity.activityId !== 'night-walk') ||
    !Number.isFinite(activity.completedAt)
  ) return null;
  return { activityId: activity.activityId, completedAt: activity.completedAt! };
}

function normalizeTransactions(value: unknown): EconomyTransaction[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 12).flatMap((candidate): EconomyTransaction[] => {
    if (!candidate || typeof candidate !== 'object') return [];
    const transaction = candidate as Partial<EconomyTransaction>;
    if (
      typeof transaction.id !== 'string' ||
      (transaction.kind !== 'purchase' && transaction.kind !== 'reward' && transaction.kind !== 'casino') ||
      !Number.isFinite(transaction.amount) ||
      typeof transaction.label !== 'string' ||
      !Number.isFinite(transaction.createdAt)
    ) return [];
    return [{
      id: transaction.id,
      kind: transaction.kind,
      amount: Math.trunc(transaction.amount!),
      label: transaction.label.slice(0, 60),
      createdAt: transaction.createdAt!,
    }];
  });
}

const SLOT_SYMBOLS: readonly SlotSymbol[] = ['🍒', '🍋', '🔔', '💎', '7️⃣'];

function normalizeCasinoResult(value: unknown): CasinoResult | null {
  if (!value || typeof value !== 'object') return null;
  const result = value as Partial<CasinoResult>;
  if (
    (result.gameId !== 'slots' && result.gameId !== 'roulette') ||
    (result.wager !== 10 && result.wager !== 25 && result.wager !== 50) ||
    !Number.isFinite(result.payout) || !Number.isFinite(result.net) ||
    typeof result.won !== 'boolean' || !Number.isFinite(result.playedAt)
  ) return null;

  const base = {
    wager: result.wager,
    payout: Math.max(0, Math.floor(result.payout!)),
    net: Math.trunc(result.net!),
    won: result.won,
    playedAt: result.playedAt!,
  };
  if (result.gameId === 'slots') {
    const slot = result as Partial<Extract<CasinoResult, { gameId: 'slots' }>>;
    if (!Array.isArray(slot.symbols) || slot.symbols.length !== 3 || !slot.symbols.every((symbol) => SLOT_SYMBOLS.includes(symbol))) return null;
    return { ...base, gameId: 'slots', symbols: [slot.symbols[0], slot.symbols[1], slot.symbols[2]], multiplier: Number.isFinite(slot.multiplier) ? Math.max(0, slot.multiplier!) : 0 };
  }
  const roulette = result as Partial<Extract<CasinoResult, { gameId: 'roulette' }>>;
  if (!Number.isFinite(roulette.number) || !roulette.bet || !['red', 'black', 'even', 'odd'].includes(roulette.bet) || !roulette.color || !['green', 'red', 'black'].includes(roulette.color)) return null;
  return { ...base, gameId: 'roulette', number: Math.max(0, Math.min(36, Math.floor(roulette.number!))), bet: roulette.bet, color: roulette.color };
}

function normalizeWorkResult(value: unknown): WorkResult | null {
  if (!value || typeof value !== 'object') return null;
  const result = value as Partial<WorkResult>;
  if (
    (result.jobId !== 'cashier' && result.jobId !== 'forklift') ||
    !Number.isFinite(result.correct) || !Number.isFinite(result.mistakes) ||
    !Number.isFinite(result.elapsedSeconds) || !Number.isFinite(result.score) ||
    !Number.isFinite(result.reward) || !Number.isFinite(result.completedAt)
  ) return null;
  return {
    jobId: result.jobId,
    correct: Math.max(0, Math.floor(result.correct!)),
    mistakes: Math.max(0, Math.floor(result.mistakes!)),
    elapsedSeconds: Math.max(1, Math.floor(result.elapsedSeconds!)),
    score: Math.max(0, Math.floor(result.score!)),
    reward: Math.max(0, Math.floor(result.reward!)),
    completedAt: result.completedAt!,
  };
}

export type UseItemResult = 'used' | 'out-of-stock';
export type BathroomResult = 'done' | 'not-needed' | 'nothing-to-clean';

type MapoferStore = MapoferVitals & {
  mapocoins: number;
  inventory: Inventory;
  activeEffects: ActiveItemEffect[];
  poops: CartoonPoop[];
  leisureSessions: number;
  lastLeisureActivity: LastLeisureActivity | null;
  lastDailyRewardAt: number | null;
  transactions: EconomyTransaction[];
  workShifts: number;
  workBestScores: Record<WorkJobId, number>;
  lastWorkResult: WorkResult | null;
  casinoPlays: number;
  casinoWins: number;
  casinoNet: number;
  lastCasinoResult: CasinoResult | null;
  lastUpdatedAt: number;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  applyElapsedTime: (now?: number) => void;
  performBasicAction: (actionId: BasicActionId, now?: number) => void;
  useItem: (itemId: ItemId, now?: number) => UseItemResult;
  performBathroomAction: (action: BathroomActionId, now?: number) => BathroomResult;
  performActivity: (activityId: LeisureActivityId, now?: number) => void;
  buyItem: (itemId: ItemId, now?: number) => PurchaseResult;
  claimDailyReward: (now?: number) => DailyRewardResult;
  completeWorkShift: (jobId: WorkJobId, performance: WorkPerformance, now?: number) => WorkResult;
  playCasinoSlots: (wager: CasinoWager, now?: number) => CasinoPlayResult;
  playCasinoRoulette: (wager: CasinoWager, bet: RouletteBet, now?: number) => CasinoPlayResult;
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
      mapocoins: STARTING_MAPOCOINS,
      inventory: INITIAL_INVENTORY,
      activeEffects: [],
      poops: [],
      leisureSessions: 0,
      lastLeisureActivity: null,
      lastDailyRewardAt: null,
      transactions: [],
      workShifts: 0,
      workBestScores: { cashier: 0, forklift: 0 },
      lastWorkResult: null,
      casinoPlays: 0,
      casinoWins: 0,
      casinoNet: 0,
      lastCasinoResult: null,
      lastUpdatedAt: touchTime(),
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      applyElapsedTime: (now = touchTime()) => {
        set((state) => ({
          ...advanceNeeds(state, now, { hygieneDecayPerHour: state.poops.length * 0.4 }),
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

      performBathroomAction: (action, now = touchTime()) => {
        let result: BathroomResult = 'done';
        set((state) => {
          const current = advanceNeeds(state, now, { hygieneDecayPerHour: state.poops.length * 0.4 });
          const outcome = performBathroomAction({ ...current, poops: state.poops }, action, now);
          result = outcome.result;
          return { ...outcome.state, lastUpdatedAt: current.lastUpdatedAt };
        });
        return result;
      },

      performActivity: (activityId, now = touchTime()) =>
        set((state) => ({
          ...performLeisureActivity(
            state,
            activityId,
            now,
            state.poops.length * 0.4,
          ),
          leisureSessions: state.leisureSessions + 1,
          lastLeisureActivity: { activityId, completedAt: now },
        })),

      buyItem: (itemId, now = touchTime()) => {
        let result: PurchaseResult = 'not-for-sale';
        set((state) => {
          const outcome = buyItem(state, itemId, now);
          result = outcome.result;
          return outcome.state;
        });
        return result;
      },

      claimDailyReward: (now = touchTime()) => {
        let result: DailyRewardResult = 'cooldown';
        set((state) => {
          const outcome = claimDailyReward(state, now);
          result = outcome.result;
          return outcome.state;
        });
        return result;
      },

      completeWorkShift: (jobId, performance, now = touchTime()) => {
        let result = calculateWorkResult(jobId, performance, now);
        set((state) => {
          const outcome = completeWorkShift(state, jobId, performance, now, state.poops.length * 0.4);
          result = outcome.result;
          return {
            ...outcome.state,
            workShifts: state.workShifts + 1,
            workBestScores: {
              ...state.workBestScores,
              [jobId]: Math.max(state.workBestScores[jobId], outcome.result.score),
            },
            lastWorkResult: outcome.result,
          };
        });
        return result;
      },

      playCasinoSlots: (wager, now = touchTime()) => {
        let result: CasinoPlayResult = { result: 'invalid-wager', state: get(), game: null };
        set((state) => {
          const outcome = playSlots(state, wager, now);
          result = outcome;
          if (outcome.result !== 'played') return state;
          return {
            ...outcome.state,
            casinoPlays: state.casinoPlays + 1,
            casinoWins: state.casinoWins + (outcome.game.won ? 1 : 0),
            casinoNet: state.casinoNet + outcome.game.net,
            lastCasinoResult: outcome.game,
          };
        });
        return result;
      },

      playCasinoRoulette: (wager, bet, now = touchTime()) => {
        let result: CasinoPlayResult = { result: 'invalid-wager', state: get(), game: null };
        set((state) => {
          const outcome = playRoulette(state, wager, bet, now);
          result = outcome;
          if (outcome.result !== 'played') return state;
          return {
            ...outcome.state,
            casinoPlays: state.casinoPlays + 1,
            casinoWins: state.casinoWins + (outcome.game.won ? 1 : 0),
            casinoNet: state.casinoNet + outcome.game.net,
            lastCasinoResult: outcome.game,
          };
        });
        return result;
      },

      eat: () => get().performBasicAction('eat'),
      shower: () => get().performBasicAction('shower'),
      rest: () => get().performBasicAction('rest'),
      watchAnime: () => get().performActivity('anime'),

      reset: () =>
        set({
          ...INITIAL_VITALS,
          mapocoins: STARTING_MAPOCOINS,
          inventory: INITIAL_INVENTORY,
          activeEffects: [],
          poops: [],
          leisureSessions: 0,
          lastLeisureActivity: null,
          lastDailyRewardAt: null,
          transactions: [],
          workShifts: 0,
          workBestScores: { cashier: 0, forklift: 0 },
          lastWorkResult: null,
          casinoPlays: 0,
          casinoWins: 0,
          casinoNet: 0,
          lastCasinoResult: null,
          lastUpdatedAt: touchTime(),
        }),
    }),
    {
      name: 'poufer-state-v1',
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => (isStaticWebRender ? staticRenderStorage : AsyncStorage)),
      migrate: (persistedState, version) => {
        const saved = persistedState as Partial<MapoferStore>;
        if (version < 7) {
          return { ...saved, mapocoins: Math.max(saved.mapocoins ?? 0, STARTING_MAPOCOINS) } as MapoferStore;
        }
        return saved as MapoferStore;
      },
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
        bladder: state.bladder,
        bowel: state.bowel,
        mapocoins: state.mapocoins,
        inventory: state.inventory,
        activeEffects: state.activeEffects,
        poops: state.poops,
        leisureSessions: state.leisureSessions,
        lastLeisureActivity: state.lastLeisureActivity,
        lastDailyRewardAt: state.lastDailyRewardAt,
        transactions: state.transactions,
        workShifts: state.workShifts,
        workBestScores: state.workBestScores,
        lastWorkResult: state.lastWorkResult,
        casinoPlays: state.casinoPlays,
        casinoWins: state.casinoWins,
        casinoNet: state.casinoNet,
        lastCasinoResult: state.lastCasinoResult,
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
          kebab: Number.isFinite(savedInventory?.kebab) ? Math.max(0, Math.floor(savedInventory!.kebab)) : INITIAL_INVENTORY.kebab,
          pizza: Number.isFinite(savedInventory?.pizza) ? Math.max(0, Math.floor(savedInventory!.pizza)) : INITIAL_INVENTORY.pizza,
          burger: Number.isFinite(savedInventory?.burger) ? Math.max(0, Math.floor(savedInventory!.burger)) : INITIAL_INVENTORY.burger,
          fries: Number.isFinite(savedInventory?.fries) ? Math.max(0, Math.floor(savedInventory!.fries)) : INITIAL_INVENTORY.fries,
          sandwich: Number.isFinite(savedInventory?.sandwich) ? Math.max(0, Math.floor(savedInventory!.sandwich)) : INITIAL_INVENTORY.sandwich,
        };
        return {
          ...current,
          ...vitals,
          mapocoins: Number.isFinite(saved?.mapocoins)
            ? Math.max(0, Math.floor(saved!.mapocoins!))
            : current.mapocoins,
          inventory,
          activeEffects: normalizeActiveEffects(saved?.activeEffects),
          poops: normalizePoops(saved?.poops),
          leisureSessions: Number.isFinite(saved?.leisureSessions)
            ? Math.max(0, Math.floor(saved!.leisureSessions!))
            : 0,
          lastLeisureActivity: normalizeLastActivity(saved?.lastLeisureActivity),
          lastDailyRewardAt: Number.isFinite(saved?.lastDailyRewardAt)
            ? Math.max(0, saved!.lastDailyRewardAt!)
            : null,
          transactions: normalizeTransactions(saved?.transactions),
          workShifts: Number.isFinite(saved?.workShifts) ? Math.max(0, Math.floor(saved!.workShifts!)) : 0,
          workBestScores: {
            cashier: Number.isFinite(saved?.workBestScores?.cashier) ? Math.max(0, Math.floor(saved!.workBestScores!.cashier)) : 0,
            forklift: Number.isFinite(saved?.workBestScores?.forklift) ? Math.max(0, Math.floor(saved!.workBestScores!.forklift)) : 0,
          },
          lastWorkResult: normalizeWorkResult(saved?.lastWorkResult),
          casinoPlays: Number.isFinite(saved?.casinoPlays) ? Math.max(0, Math.floor(saved!.casinoPlays!)) : 0,
          casinoWins: Number.isFinite(saved?.casinoWins) ? Math.max(0, Math.floor(saved!.casinoWins!)) : 0,
          casinoNet: Number.isFinite(saved?.casinoNet) ? Math.trunc(saved!.casinoNet!) : 0,
          lastCasinoResult: normalizeCasinoResult(saved?.lastCasinoResult),
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
