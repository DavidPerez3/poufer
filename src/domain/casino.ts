import { MAX_TRANSACTION_HISTORY, type EconomyState } from '@/domain/economy';

export const CASINO_WAGERS = [10, 25, 50] as const;
export type CasinoWager = typeof CASINO_WAGERS[number];
export type CasinoGameId = 'slots' | 'roulette';
export type RouletteBet = 'red' | 'black' | 'even' | 'odd';
export type SlotSymbol = '🍒' | '🍋' | '🔔' | '💎' | '7️⃣';

const SLOT_REEL: readonly SlotSymbol[] = ['🍒', '🍒', '🍋', '🍋', '🔔', '💎', '7️⃣'];
const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

type CasinoResultBase = {
  gameId: CasinoGameId;
  wager: CasinoWager;
  payout: number;
  net: number;
  won: boolean;
  playedAt: number;
};

export type SlotResult = CasinoResultBase & {
  gameId: 'slots';
  symbols: [SlotSymbol, SlotSymbol, SlotSymbol];
  multiplier: number;
};

export type RouletteResult = CasinoResultBase & {
  gameId: 'roulette';
  number: number;
  color: 'green' | 'red' | 'black';
  bet: RouletteBet;
};

export type CasinoResult = SlotResult | RouletteResult;
export type CasinoPlayResult =
  | { result: 'played'; state: EconomyState; game: CasinoResult }
  | { result: 'insufficient-funds' | 'invalid-wager'; state: EconomyState; game: null };

export function playSlots(
  state: EconomyState,
  wager: number,
  now: number,
  random: () => number = Math.random,
): CasinoPlayResult {
  const checkedWager = validateWager(state, wager);
  if (checkedWager !== 'valid') return { result: checkedWager, state, game: null };
  const validWager = wager as CasinoWager;

  const symbols: [SlotSymbol, SlotSymbol, SlotSymbol] = [pickSlot(random), pickSlot(random), pickSlot(random)];
  const multiplier = getSlotMultiplier(symbols);
  const payout = Math.floor(wager * multiplier);
  const game: SlotResult = {
    gameId: 'slots', wager: validWager, symbols, multiplier, payout,
    net: payout - wager, won: payout > wager, playedAt: now,
  };
  return { result: 'played', game, state: settleCasinoPlay(state, game, 'Tragaperras') };
}

export function playRoulette(
  state: EconomyState,
  wager: number,
  bet: RouletteBet,
  now: number,
  random: () => number = Math.random,
): CasinoPlayResult {
  const checkedWager = validateWager(state, wager);
  if (checkedWager !== 'valid') return { result: checkedWager, state, game: null };
  const validWager = wager as CasinoWager;

  const number = Math.min(36, Math.max(0, Math.floor(safeRandom(random()) * 37)));
  const color = number === 0 ? 'green' : RED_NUMBERS.has(number) ? 'red' : 'black';
  const won = number !== 0 && (
    bet === color ||
    (bet === 'even' && number % 2 === 0) ||
    (bet === 'odd' && number % 2 === 1)
  );
  const payout = won ? wager * 2 : 0;
  const game: RouletteResult = {
    gameId: 'roulette', wager: validWager, bet, number, color, payout,
    net: payout - wager, won, playedAt: now,
  };
  return { result: 'played', game, state: settleCasinoPlay(state, game, 'Ruleta') };
}

export function getSlotMultiplier(symbols: readonly SlotSymbol[]): number {
  if (symbols.every((symbol) => symbol === '7️⃣')) return 8;
  if (symbols[0] === symbols[1] && symbols[1] === symbols[2]) return 4;
  if (symbols[0] === symbols[1] || symbols[1] === symbols[2] || symbols[0] === symbols[2]) return 1.25;
  return 0;
}

function validateWager(state: EconomyState, wager: number): 'valid' | 'invalid-wager' | 'insufficient-funds' {
  if (!CASINO_WAGERS.includes(wager as CasinoWager)) return 'invalid-wager';
  if (state.mapocoins < wager) return 'insufficient-funds';
  return 'valid';
}

function pickSlot(random: () => number): SlotSymbol {
  return SLOT_REEL[Math.min(SLOT_REEL.length - 1, Math.floor(safeRandom(random()) * SLOT_REEL.length))];
}

function safeRandom(value: number): number {
  return Number.isFinite(value) ? Math.min(0.999999, Math.max(0, value)) : 0;
}

function settleCasinoPlay(state: EconomyState, game: CasinoResult, label: string): EconomyState {
  return {
    ...state,
    mapocoins: state.mapocoins + game.net,
    transactions: [{
      id: `casino-${game.gameId}-${game.playedAt}`,
      kind: 'casino' as const,
      amount: game.net,
      label,
      createdAt: game.playedAt,
    }, ...state.transactions].slice(0, MAX_TRANSACTION_HISTORY),
  };
}
