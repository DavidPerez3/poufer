import type { NeedEffects } from '@/domain/gameBalance';

export type ItemCategory = 'pharmacy' | 'food' | 'drink' | 'smoke';
export type ItemAnimation = 'take-pill' | 'take-chicken';
export type ItemId = 'pill' | 'chicken';

export type ItemDefinition = {
  id: ItemId;
  name: string;
  category: ItemCategory;
  description: string;
  icon: string;
  priceMapocoins: number | null;
  effects: NeedEffects;
  activeEffect: {
    durationMs: number;
    alteredIntensity: number;
  };
  animation: ItemAnimation;
};

const MINUTE_MS = 60_000;

export const ITEMS: Readonly<Record<ItemId, ItemDefinition>> = {
  pill: {
    id: 'pill',
    name: 'Pastilla',
    category: 'pharmacy',
    description: 'Una cápsula cartoon de procedencia argumentalmente dudosa.',
    icon: '💊',
    priceMapocoins: null,
    effects: { energy: 24, craving: -18, altered: 34, sweat: 18, sleep: -9 },
    activeEffect: { durationMs: 8 * MINUTE_MS, alteredIntensity: 1 },
    animation: 'take-pill',
  },
  chicken: {
    id: 'chicken',
    name: 'Pollo',
    category: 'pharmacy',
    description: 'Una bolsita absurda con un pollo dibujado. Objeto 100 % ficticio.',
    icon: '🐔',
    priceMapocoins: null,
    effects: { energy: 36, craving: -28, altered: 48, sweat: 31, sleep: -16, hygiene: -5 },
    activeEffect: { durationMs: 6 * MINUTE_MS, alteredIntensity: 2 },
    animation: 'take-chicken',
  },
};

export const PHARMACY_ITEMS = [ITEMS.pill, ITEMS.chicken] as const;

export type Inventory = Record<ItemId, number>;

export const INITIAL_INVENTORY: Inventory = {
  pill: 3,
  chicken: 2,
};

export type ActiveItemEffect = {
  itemId: ItemId;
  animation: ItemAnimation;
  startedAt: number;
  expiresAt: number;
  alteredIntensity: number;
};
