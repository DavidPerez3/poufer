import type { NeedEffects } from '@/domain/gameBalance';

export type ItemCategory = 'pharmacy' | 'food' | 'drink' | 'smoke';
export type ItemAnimation = 'take-pill' | 'take-chicken' | 'drink' | 'smoke' | 'eat';
export type ItemId = 'pill' | 'chicken' | 'beer' | 'vermouth' | 'mixed-drink' | 'shot' | 'cigarette' | 'joint' | 'kebab' | 'pizza' | 'burger' | 'fries' | 'sandwich';

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
    drunkIntensity: number;
    smokeIntensity: number;
    redEyeIntensity: number;
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
    activeEffect: { durationMs: 8 * MINUTE_MS, alteredIntensity: 1, drunkIntensity: 0, smokeIntensity: 0, redEyeIntensity: 0 },
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
    activeEffect: { durationMs: 6 * MINUTE_MS, alteredIntensity: 2, drunkIntensity: 0, smokeIntensity: 0, redEyeIntensity: 0 },
    animation: 'take-chicken',
  },
  beer: {
    id: 'beer', name: 'Cerveza', category: 'drink', icon: '🍺', priceMapocoins: null,
    description: 'Una cerveza fría del Barpofer.',
    effects: { drunkenness: 14, hangover: 3, hygiene: -2, boredom: -6, sleep: -2 },
    activeEffect: { durationMs: 7 * MINUTE_MS, alteredIntensity: 0, drunkIntensity: 1, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'drink',
  },
  vermouth: {
    id: 'vermouth', name: 'Marianito rojo', category: 'drink', icon: '🍷', priceMapocoins: null,
    description: 'El clásico vermú rojo, versión cartoon.',
    effects: { drunkenness: 18, hangover: 5, hygiene: -2, boredom: -8 },
    activeEffect: { durationMs: 8 * MINUTE_MS, alteredIntensity: 0, drunkIntensity: 1, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'drink',
  },
  'mixed-drink': {
    id: 'mixed-drink', name: 'Cubata', category: 'drink', icon: '🥃', priceMapocoins: null,
    description: 'Vaso enorme, hielo sospechoso y cero elegancia.',
    effects: { drunkenness: 27, hangover: 9, hygiene: -4, boredom: -11, sleep: -5 },
    activeEffect: { durationMs: 10 * MINUTE_MS, alteredIntensity: 0, drunkIntensity: 2, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'drink',
  },
  shot: {
    id: 'shot', name: 'Chupito', category: 'drink', icon: '🥃', priceMapocoins: null,
    description: 'Pequeño, rápido y con consecuencias grandes.',
    effects: { drunkenness: 22, hangover: 8, hygiene: -3, energy: 4 },
    activeEffect: { durationMs: 6 * MINUTE_MS, alteredIntensity: 0, drunkIntensity: 2, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'drink',
  },
  cigarette: {
    id: 'cigarette', name: 'Cigarro', category: 'smoke', icon: '🚬', priceMapocoins: null,
    description: 'Paquete, mechero y una nube cartoon bastante poco elegante.',
    effects: { craving: -8, boredom: -5, hygiene: -3 },
    activeEffect: { durationMs: 3 * MINUTE_MS, alteredIntensity: 0, drunkIntensity: 0, smokeIntensity: 1, redEyeIntensity: 0 },
    animation: 'smoke',
  },
  joint: {
    id: 'joint', name: 'Porro', category: 'smoke', icon: '🌿', priceMapocoins: null,
    description: 'Un canuto ficticio que deja a Mapofer mirando el techo y pensando en kebabs.',
    effects: { craving: -12, altered: 8, hunger: -18, boredom: -14, sleep: -5, hygiene: -4 },
    activeEffect: { durationMs: 8 * MINUTE_MS, alteredIntensity: 0, drunkIntensity: 0, smokeIntensity: 2, redEyeIntensity: 2 },
    animation: 'smoke',
  },
  kebab: {
    id: 'kebab', name: 'Kebab', category: 'food', icon: '🌯', priceMapocoins: null,
    description: 'La respuesta oficial a los ojos rojos y las malas decisiones.',
    effects: { hunger: 38, hygiene: -4, sleep: -3, bladder: 8, bowel: 15 },
    activeEffect: { durationMs: 20_000, alteredIntensity: 0, drunkIntensity: 0, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'eat',
  },
  pizza: {
    id: 'pizza', name: 'Pizza', category: 'food', icon: '🍕', priceMapocoins: null,
    description: 'Una pizza cartoon con más queso que estabilidad estructural.',
    effects: { hunger: 32, hygiene: -3, bladder: 5, bowel: 12 },
    activeEffect: { durationMs: 20_000, alteredIntensity: 0, drunkIntensity: 0, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'eat',
  },
  burger: {
    id: 'burger', name: 'Hamburguesa', category: 'food', icon: '🍔', priceMapocoins: null,
    description: 'Doble de todo, incluida la futura visita al baño.',
    effects: { hunger: 35, hygiene: -3, bowel: 16 },
    activeEffect: { durationMs: 20_000, alteredIntensity: 0, drunkIntensity: 0, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'eat',
  },
  fries: {
    id: 'fries', name: 'Patatas', category: 'food', icon: '🍟', priceMapocoins: null,
    description: 'Crujientes, saladas y sorprendentemente fáciles de perder por el sofá.',
    effects: { hunger: 19, hygiene: -2, bladder: 7, bowel: 7 },
    activeEffect: { durationMs: 20_000, alteredIntensity: 0, drunkIntensity: 0, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'eat',
  },
  sandwich: {
    id: 'sandwich', name: 'Bocata', category: 'food', icon: '🥖', priceMapocoins: null,
    description: 'Un señor bocata para recuperar algo parecido a la dignidad.',
    effects: { hunger: 29, hygiene: -2, bladder: 4, bowel: 10 },
    activeEffect: { durationMs: 20_000, alteredIntensity: 0, drunkIntensity: 0, smokeIntensity: 0, redEyeIntensity: 0 }, animation: 'eat',
  },
};

export const PHARMACY_ITEMS = [ITEMS.pill, ITEMS.chicken] as const;
export const BAR_ITEMS = [ITEMS.beer, ITEMS.vermouth, ITEMS['mixed-drink'], ITEMS.shot] as const;
export const SMOKE_ITEMS = [ITEMS.cigarette, ITEMS.joint] as const;
export const FOOD_ITEMS = [ITEMS.kebab, ITEMS.pizza, ITEMS.burger, ITEMS.fries, ITEMS.sandwich] as const;

export type Inventory = Record<ItemId, number>;

export const INITIAL_INVENTORY: Inventory = {
  pill: 3,
  chicken: 2,
  beer: 4,
  vermouth: 3,
  'mixed-drink': 2,
  shot: 3,
  cigarette: 5,
  joint: 3,
  kebab: 3,
  pizza: 3,
  burger: 3,
  fries: 4,
  sandwich: 3,
};

export type ActiveItemEffect = {
  itemId: ItemId;
  animation: ItemAnimation;
  startedAt: number;
  expiresAt: number;
  alteredIntensity: number;
  drunkIntensity: number;
  smokeIntensity: number;
  redEyeIntensity: number;
};
