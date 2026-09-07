import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const [feedback, setFeedback] = useState('Elige apuesta. Aquí solo se juegan Mapocoins ficticias.');
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
    setFeedback(outcome.game.won ? `Premio: ${outcome.game.payout} Mapocoins.` : `Has perdido ${wager} Mapocoins.`);
  };

  if (!state.hasHydrated) return <View style={styles.loading}><Text style={styles.text}>Encendiendo los neones…</Text></View>;

  return <>
    <Head><title>Casino — POUFER</title></Head>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable><View style={styles.heading}><Text style={styles.kicker}>FASE 0.9</Text><Text style={styles.title}>CASINO</Text></View></View>
        <View style={styles.wallet}><Text style={styles.walletSmall}>SALDO</Text><Text style={styles.walletValue}>🪙 {state.mapocoins}</Text><Text style={styles.walletName}>MAPOCOINS</Text></View>
        <Text style={styles.disclaimer}>MONEDA FICTICIA · SIN DINERO REAL · SIN COMPRAS</Text>

        <View style={styles.tabs}><GameTab active={game === 'slots'} label="🎰 TRAGAPERRAS" onPress={() => setGame('slots')} /><GameTab active={game === 'roulette'} label="🎡 RULETA" onPress={() => setGame('roulette')} /></View>

        <View style={styles.machine}>
          {game === 'slots' ? <SlotsMachine result={shownResult?.gameId === 'slots' ? shownResult : null} /> : <RouletteMachine result={shownResult?.gameId === 'roulette' ? shownResult : null} />}
        </View>

        {game === 'roulette' && <><Text style={styles.label}>APUESTA A</Text><View style={styles.betGrid}>{ROULETTE_BETS.map((option) => <Pressable key={option.id} onPress={() => setBet(option.id)} style={[styles.betButton, { backgroundColor: option.color }, bet === option.id && styles.selectedBet]}><Text style={styles.betText}>{option.label}</Text></Pressable>)}</View></>}

        <Text style={styles.label}>APUESTA</Text>
        <View style={styles.wagers}>{CASINO_WAGERS.map((amount) => <Pressable key={amount} disabled={state.mapocoins < amount} onPress={() => setWager(amount)} style={[styles.wager, wager === amount && styles.selectedWager, state.mapocoins < amount && styles.disabled]}><Text style={styles.wagerText}>🪙 {amount}</Text></Pressable>)}</View>
        <Pressable onPress={play} style={({ pressed }) => [styles.play, pressed && styles.pressed]}><Text style={styles.playText}>{game === 'slots' ? 'GIRAR' : 'LANZAR BOLA'} · 🪙 {wager}</Text></Pressable>
        <View style={styles.feedback}><Text style={styles.feedbackText}>{feedback}</Text></View>

        <View style={styles.stats}><CasinoStat label="PARTIDAS" value={state.casinoPlays} /><CasinoStat label="VICTORIAS" value={state.casinoWins} /><CasinoStat label="BALANCE" value={`${state.casinoNet >= 0 ? '+' : ''}${state.casinoNet}`} /></View>
      </ScrollView>
    </SafeAreaView>
  </>;
}

function GameTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.tab, active && styles.activeTab]}><Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text></Pressable>; }

function SlotsMachine({ result }: { result: Extract<CasinoResult, { gameId: 'slots' }> | null }) {
  const symbols = result?.symbols ?? ['❔', '❔', '❔'];
  return <><Text style={styles.neon}>MAPOVEGAS</Text><View style={styles.reels}>{symbols.map((symbol, index) => <View key={`${symbol}-${index}`} style={styles.reel}><Text style={styles.symbol}>{symbol}</Text></View>)}</View><Text style={styles.machineInfo}>{result ? (result.multiplier > 0 ? `PREMIO x${result.multiplier}` : 'CASI, PERO NO') : 'TRES IGUALES = PREMIO'}</Text></>;
}

function RouletteMachine({ result }: { result: Extract<CasinoResult, { gameId: 'roulette' }> | null }) {
  const colorStyle = result?.color === 'red' ? styles.red : result?.color === 'black' ? styles.black : styles.green;
  const colorLabel = result?.color === 'red' ? 'ROJO' : result?.color === 'black' ? 'NEGRO' : 'VERDE';
  return <><Text style={styles.neon}>RULETA POUFER</Text><View style={styles.wheel}><Text style={styles.wheelMarks}>0 · 7 · 18 · 23 · 36</Text><View style={[styles.ball, result && colorStyle]}><Text style={styles.ballText}>{result?.number ?? '?'}</Text></View></View><Text style={styles.machineInfo}>{result ? `${colorLabel} · ${result.won ? 'PREMIO x2' : 'PIERDES'}` : 'EL CERO SIEMPRE GANA LA CASA'}</Text></>;
}

function CasinoStat({ label, value }: { label: string; value: string | number }) { return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#090514' }, loading: { flex: 1, backgroundColor: '#090514', alignItems: 'center', justifyContent: 'center' }, text: { color: colors.text }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { paddingVertical: 10, paddingRight: 16 }, backText: { color: '#ff72d2', fontWeight: '900', fontSize: 16 }, heading: { alignItems: 'flex-end' }, kicker: { color: '#ff72d2', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  wallet: { marginTop: 16, backgroundColor: '#27103a', borderColor: '#a94ce8', borderWidth: 2, borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, walletSmall: { color: '#b886d3', fontSize: 9, fontWeight: '900' }, walletValue: { color: colors.text, fontSize: 27, fontWeight: '900' }, walletName: { color: '#ffd44f', fontSize: 9, fontWeight: '900' }, disclaimer: { color: '#756381', fontSize: 8, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  tabs: { flexDirection: 'row', backgroundColor: '#151020', borderRadius: 15, padding: 4, marginTop: 17 }, tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 12 }, activeTab: { backgroundColor: '#7d36bd' }, tabText: { color: '#8f819a', fontSize: 10, fontWeight: '900' }, activeTabText: { color: 'white' },
  machine: { marginTop: 14, minHeight: 260, borderRadius: 27, backgroundColor: '#28123a', borderWidth: 3, borderColor: '#c84dff', padding: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#d34fff', shadowOpacity: 0.35, shadowRadius: 18 }, neon: { color: '#ff78da', fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 20 }, reels: { flexDirection: 'row', gap: 9 }, reel: { width: 82, maxWidth: '29%', aspectRatio: 0.82, backgroundColor: '#f7eaff', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#6c2b9b' }, symbol: { fontSize: 42 }, machineInfo: { color: '#ffd44f', fontSize: 10, fontWeight: '900', marginTop: 18 },
  wheel: { width: 180, height: 180, borderRadius: 90, backgroundColor: '#3a1530', borderWidth: 14, borderColor: '#a36c20', alignItems: 'center', justifyContent: 'center' }, wheelMarks: { color: '#f6d5e9', fontSize: 9, fontWeight: '900', position: 'absolute', top: 22 }, ball: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1c923c', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'white' }, ballText: { color: 'white', fontSize: 27, fontWeight: '900' }, red: { backgroundColor: '#c52843' }, black: { backgroundColor: '#17151d' }, green: { backgroundColor: '#168b42' },
  label: { color: '#ae91bd', fontSize: 9, fontWeight: '900', letterSpacing: 1.2, marginTop: 17, marginBottom: 8 }, betGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, betButton: { width: '48%', flexGrow: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' }, selectedBet: { borderColor: '#ffd44f' }, betText: { color: 'white', fontSize: 11, fontWeight: '900' }, wagers: { flexDirection: 'row', gap: 8 }, wager: { flex: 1, backgroundColor: '#2c2039', borderColor: '#554168', borderWidth: 1, borderRadius: 13, paddingVertical: 12, alignItems: 'center' }, selectedWager: { backgroundColor: '#7040a1', borderColor: '#d18cff' }, wagerText: { color: 'white', fontWeight: '900', fontSize: 12 }, disabled: { opacity: 0.35 },
  play: { backgroundColor: '#e1533d', borderColor: '#ff9a57', borderWidth: 2, borderRadius: 17, paddingVertical: 16, alignItems: 'center', marginTop: 13 }, playText: { color: 'white', fontSize: 15, fontWeight: '900' }, pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] }, feedback: { backgroundColor: '#171020', borderRadius: 13, padding: 11, marginTop: 10 }, feedbackText: { color: '#d4c7dc', textAlign: 'center', fontSize: 11, fontWeight: '700' }, stats: { flexDirection: 'row', gap: 8, marginTop: 14 }, stat: { flex: 1, backgroundColor: '#1a1223', borderRadius: 13, padding: 11, alignItems: 'center' }, statLabel: { color: '#846f91', fontSize: 8, fontWeight: '900' }, statValue: { color: colors.text, fontSize: 16, fontWeight: '900', marginTop: 3 },
});
