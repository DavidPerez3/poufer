import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  CASINO_WAGERS,
  type CasinoGameId,
  type CasinoResult,
  type CasinoWager,
  type RouletteBet,
} from '@/domain/casino';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

const ROULETTE_BETS: ReadonlyArray<{ id: RouletteBet; label: string; color: string }> = [
  { id: 'red', label: 'ROJO', color: '#cb304b' },
  { id: 'black', label: 'NEGRO', color: '#262333' },
  { id: 'even', label: 'PAR', color: '#5a3788' },
  { id: 'odd', label: 'IMPAR', color: '#254f78' },
];

export default function CasinoScreen() {
  const router = useRouter();
  const state = useMapoferStore();
  const [game, setGame] = useState<CasinoGameId>('slots');
  const [wager, setWager] = useState<CasinoWager>(10);
  const [bet, setBet] = useState<RouletteBet>('red');
  const [result, setResult] = useState<CasinoResult | null>(state.lastCasinoResult);
  const [feedback, setFeedback] = useState('Solo Mapocoins ficticias · sin dinero real.');
  const shownResult = result ?? state.lastCasinoResult;

  const play = () => {
    const outcome = game === 'slots'
      ? state.playCasinoSlots(wager)
      : state.playCasinoRoulette(wager, bet);

    if (outcome.result === 'insufficient-funds') {
      setFeedback('No tienes suficientes Mapocoins. Toca currar, figura.');
      return;
    }
    if (outcome.result !== 'played') {
      setFeedback('Esa apuesta no es válida.');
      return;
    }

    setResult(outcome.game);
    setFeedback(
      outcome.game.won
        ? `Premio: ${outcome.game.payout} Mapocoins.`
        : `Has perdido ${wager} Mapocoins.`,
    );
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Encendiendo los neones…</Text></View>;
  }

  return (
    <>
      <Head><title>Casino — POUFER</title></Head>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable>
            <View style={styles.heading}><Text style={styles.kicker}>FASE 0.9</Text><Text style={styles.title}>CASINO</Text></View>
          </View>

          <View style={styles.wallet}>
            <Text style={styles.walletSmall}>SALDO</Text>
            <Text style={styles.walletValue}>🪙 {state.mapocoins}</Text>
            <Text style={styles.walletName}>MAPOCOINS</Text>
          </View>

          <View style={styles.tabs}>
            <GameTab active={game === 'slots'} label="🎰 TRAGAPERRAS" onPress={() => setGame('slots')} />
            <GameTab active={game === 'roulette'} label="🎡 RULETA" onPress={() => setGame('roulette')} />
          </View>

          <View style={styles.machine}>
            {game === 'slots'
              ? <SlotsMachine result={shownResult?.gameId === 'slots' ? shownResult : null} />
              : <RouletteMachine result={shownResult?.gameId === 'roulette' ? shownResult : null} />}
          </View>

          {game === 'roulette' ? (
            <View style={styles.betGrid}>
              {ROULETTE_BETS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => setBet(option.id)}
                  style={[
                    styles.betButton,
                    { backgroundColor: option.color },
                    bet === option.id && styles.selectedBet,
                  ]}
                >
                  <Text style={styles.betText}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.hint}>TRES IGUALES = PREMIO · ELIGE CUÁNTO JUGAR</Text>
          )}

          <View style={styles.wagers}>
            {CASINO_WAGERS.map((amount) => (
              <Pressable
                key={amount}
                disabled={state.mapocoins < amount}
                onPress={() => setWager(amount)}
                style={[
                  styles.wager,
                  wager === amount && styles.selectedWager,
                  state.mapocoins < amount && styles.disabled,
                ]}
              >
                <Text style={styles.wagerText}>🪙 {amount}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={play} style={({ pressed }) => [styles.play, pressed && styles.pressed]}>
            <Text style={styles.playText}>{game === 'slots' ? 'GIRAR' : 'LANZAR BOLA'} · 🪙 {wager}</Text>
          </Pressable>

          <View style={styles.footerRow}>
            <View style={styles.feedback}><Text numberOfLines={2} style={styles.feedbackText}>{feedback}</Text></View>
            <View style={styles.stats}>
              <CasinoStat label="PART." value={state.casinoPlays} />
              <CasinoStat label="VICT." value={state.casinoWins} />
              <CasinoStat label="BAL." value={`${state.casinoNet >= 0 ? '+' : ''}${state.casinoNet}`} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

function GameTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </Pressable>
  );
}

function SlotsMachine({ result }: { result: Extract<CasinoResult, { gameId: 'slots' }> | null }) {
  const symbols = result?.symbols ?? ['❔', '❔', '❔'];
  return (
    <>
      <Text style={styles.neon}>MAPOVEGAS</Text>
      <View style={styles.reels}>
        {symbols.map((symbol, index) => (
          <View key={`${symbol}-${index}`} style={styles.reel}><Text style={styles.symbol}>{symbol}</Text></View>
        ))}
      </View>
      <Text style={styles.machineInfo}>
        {result ? (result.multiplier > 0 ? `PREMIO x${result.multiplier}` : 'CASI, PERO NO') : 'TRES IGUALES = PREMIO'}
      </Text>
    </>
  );
}

function RouletteMachine({ result }: { result: Extract<CasinoResult, { gameId: 'roulette' }> | null }) {
  const colorStyle = result?.color === 'red' ? styles.red : result?.color === 'black' ? styles.black : styles.green;
  const colorLabel = result?.color === 'red' ? 'ROJO' : result?.color === 'black' ? 'NEGRO' : 'VERDE';

  return (
    <>
      <Text style={styles.neon}>RULETA POUFER</Text>
      <View style={styles.wheel}>
        <Text style={styles.wheelMarks}>0 · 7 · 18 · 23 · 36</Text>
        <View style={[styles.ball, result && colorStyle]}><Text style={styles.ballText}>{result?.number ?? '?'}</Text></View>
      </View>
      <Text style={styles.machineInfo}>
        {result ? `${colorLabel} · ${result.won ? 'PREMIO x2' : 'PIERDES'}` : 'EL CERO SIEMPRE GANA LA CASA'}
      </Text>
    </>
  );
}

function CasinoStat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#090514' },
  loading: { flex: 1, backgroundColor: '#090514', alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.text },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 7,
    gap: 7,
  },
  header: { minHeight: 40, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { paddingVertical: 8, paddingRight: 16 },
  backText: { color: '#ff72d2', fontWeight: '900', fontSize: 14 },
  heading: { alignItems: 'flex-end' },
  kicker: { color: '#ff72d2', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  wallet: {
    minHeight: 48,
    backgroundColor: '#27103a',
    borderColor: '#a94ce8',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletSmall: { color: '#b886d3', fontSize: 7, fontWeight: '900' },
  walletValue: { color: colors.text, fontSize: 21, fontWeight: '900' },
  walletName: { color: '#ffd44f', fontSize: 7, fontWeight: '900' },
  tabs: { flexDirection: 'row', backgroundColor: '#151020', borderRadius: 13, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#7d36bd' },
  tabText: { color: '#8f819a', fontSize: 8, fontWeight: '900' },
  activeTabText: { color: colors.text },
  machine: {
    flex: 1,
    minHeight: 180,
    maxHeight: 255,
    borderRadius: 23,
    backgroundColor: '#28123a',
    borderWidth: 2,
    borderColor: '#c84dff',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  neon: { color: '#ff78da', fontSize: 14, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  reels: { flexDirection: 'row', gap: 7 },
  reel: {
    width: 66,
    maxWidth: '29%',
    aspectRatio: 0.9,
    backgroundColor: '#f7eaff',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#6c2b9b',
  },
  symbol: { fontSize: 32 },
  machineInfo: { color: '#ffd44f', fontSize: 8, fontWeight: '900', marginTop: 10 },
  wheel: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#3a1530',
    borderWidth: 10,
    borderColor: '#a36c20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelMarks: { color: '#f6d5e9', fontSize: 7, fontWeight: '900', position: 'absolute', top: 15 },
  ball: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: '#1c923c',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.text,
  },
  ballText: { color: colors.text, fontSize: 21, fontWeight: '900' },
  red: { backgroundColor: '#c52843' },
  black: { backgroundColor: '#17151d' },
  green: { backgroundColor: '#168b42' },
  hint: { color: '#7f6f8b', fontSize: 7, fontWeight: '900', textAlign: 'center', minHeight: 28, textAlignVertical: 'center' },
  betGrid: { flexDirection: 'row', gap: 5 },
  betButton: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  selectedBet: { borderColor: '#ffd44f' },
  betText: { color: colors.text, fontSize: 8, fontWeight: '900' },
  wagers: { flexDirection: 'row', gap: 5 },
  wager: {
    flex: 1,
    backgroundColor: '#2c2039',
    borderColor: '#554168',
    borderWidth: 1,
    borderRadius: 11,
    paddingVertical: 8,
    alignItems: 'center',
  },
  selectedWager: { backgroundColor: '#7040a1', borderColor: '#d18cff' },
  wagerText: { color: colors.text, fontWeight: '900', fontSize: 9 },
  disabled: { opacity: 0.35 },
  play: {
    backgroundColor: '#e1533d',
    borderColor: '#ff9a57',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
  },
  playText: { color: colors.text, fontSize: 11, fontWeight: '900' },
  footerRow: { minHeight: 52, flexDirection: 'row', gap: 6 },
  feedback: { flex: 1.4, backgroundColor: '#171020', borderRadius: 12, padding: 8, justifyContent: 'center' },
  feedbackText: { color: '#d4c7dc', textAlign: 'center', fontSize: 8, fontWeight: '700', lineHeight: 11 },
  stats: { flex: 1, flexDirection: 'row', gap: 4 },
  stat: { flex: 1, backgroundColor: '#1a1223', borderRadius: 10, paddingHorizontal: 3, alignItems: 'center', justifyContent: 'center' },
  statLabel: { color: '#846f91', fontSize: 6, fontWeight: '900' },
  statValue: { color: colors.text, fontSize: 11, fontWeight: '900', marginTop: 2 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
