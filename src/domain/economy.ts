import { ITEMS, type Inventory, type ItemId } from '@/domain/items';

export const STARTING_MAPOCOINS = 250;
export const DAILY_REWARD_MAPOCOINS = 80;
export const DAILY_REWARD_COOLDOWN_MS = 20 * 60 * 60 * 1_000;
export const MAX_TRANSACTION_HISTORY = 12;

export type EconomyTransactionKind = 'purchase' | 'reward';

export type EconomyTransaction = {
  id: string;
  kind: EconomyTransactionKind;
  amount: number;
  label: string;
  createdAt: number;
};

export type EconomyState = {
  mapocoins: number;
  inventory: Inventory;
  lastDailyRewardAt: number | null;
  transactions: EconomyTransaction[];
};

export type PurchaseResult = 'purchased' | 'insufficient-funds' | 'not-for-sale';
export type DailyRewardResult = 'claimed' | 'cooldown';

export function grantMapocoins(
  state: EconomyState,
  amount: number,
  label: string,
  transactionId: string,
  now: number,
): EconomyState {
  const safeAmount = Math.max(0, Math.floor(amount));
  if (safeAmount === 0) return state;

  return {
    ...state,
    mapocoins: state.mapocoins + safeAmount,
    transactions: addTransaction(state.transactions, {
      id: transactionId,
      kind: 'reward',
      amount: safeAmount,
      label,
      createdAt: now,
    }),
  };
}

export function buyItem(
  state: EconomyState,
  itemId: ItemId,
  now: number,
): { result: PurchaseResult; state: EconomyState } {
  const item = ITEMS[itemId];
  const price = item.priceMapocoins;

  if (price === null) return { result: 'not-for-sale', state };
  if (state.mapocoins < price) return { result: 'insufficient-funds', state };

  return {
    result: 'purchased',
    state: {
      ...state,
      mapocoins: state.mapocoins - price,
      inventory: { ...state.inventory, [itemId]: state.inventory[itemId] + 1 },
      transactions: addTransaction(state.transactions, {
        id: `purchase-${itemId}-${now}`,
        kind: 'purchase',
        amount: -price,
        label: item.name,
        createdAt: now,
      }),
    },
  };
}

export function claimDailyReward(
  state: EconomyState,
  now: number,
): { result: DailyRewardResult; state: EconomyState } {
  if (getDailyRewardRemainingMs(state.lastDailyRewardAt, now) > 0) {
    return { result: 'cooldown', state };
  }

  return {
    result: 'claimed',
    state: {
      ...grantMapocoins(
        state,
        DAILY_REWARD_MAPOCOINS,
        'Recompensa diaria',
        `daily-reward-${now}`,
        now,
      ),
      lastDailyRewardAt: now,
    },
  };
}

export function getDailyRewardRemainingMs(lastClaimedAt: number | null, now: number): number {
  if (lastClaimedAt === null) return 0;
  return Math.max(0, lastClaimedAt + DAILY_REWARD_COOLDOWN_MS - now);
}

function addTransaction(
  transactions: EconomyTransaction[],
  transaction: EconomyTransaction,
): EconomyTransaction[] {
  return [transaction, ...transactions].slice(0, MAX_TRANSACTION_HISTORY);
}
