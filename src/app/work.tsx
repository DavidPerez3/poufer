import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CashierGame } from '@/components/work/CashierGame';
import { ForkliftGame } from '@/components/work/ForkliftGame';
import { StatBar } from '@/components/StatBar';
import { WORK_JOBS, type WorkJobId, type WorkPerformance, type WorkResult } from '@/domain/work';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

type ScreenState = { view: 'menu' } | { view: 'game'; jobId: WorkJobId } | { view: 'result'; result: WorkResult };

export default function WorkScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const [screen, setScreen] = useState<ScreenState>({ view: 'menu' });

  const finish = (jobId: WorkJobId, performance: WorkPerformance) => {
    const result = state.completeWorkShift(jobId, performance);
    setScreen({ view: 'result', result });
  };

  if (!state.hasHydrated) return <View style={styles.loading}><Text style={styles.text}>Fichando a Mapofer…</Text></View>;

  return <>
    <Head><title>Currar — POUFER</title></Head>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => screen.view === 'menu' ? router.back() : setScreen({ view: 'menu' })} style={styles.back}><Text style={styles.backText}>‹ {screen.view === 'menu' ? 'Inicio' : 'Trabajos'}</Text></Pressable>
          <View style={styles.heading}><Text style={styles.kicker}>FASE 0.8</Text><Text style={styles.title}>CURRAR</Text></View>
        </View>

        <View style={styles.wallet}><Text style={styles.walletLabel}>SUELDO DISPONIBLE</Text><Text style={styles.walletValue}>🪙 {state.mapocoins}</Text><Text style={styles.walletName}>MAPOCOINS</Text></View>

        {screen.view === 'menu' && <>
          <View style={styles.stats}><StatBar icon="⚡" label="Energía" value={state.energy} /><StatBar icon="🍔" label="Hambre" value={state.hunger} /><StatBar icon="😐" label="Aburrimiento" value={state.boredom} inverse /><StatBar icon="🚿" label="Higiene" value={state.hygiene} /></View>
          <Text style={styles.intro}>Elige turno. Los aciertos, la velocidad y no liarla determinan el sueldo.</Text>
          <JobCard jobId="cashier" bestScore={state.workBestScores.cashier} onStart={() => setScreen({ view: 'game', jobId: 'cashier' })} />
          <JobCard jobId="forklift" bestScore={state.workBestScores.forklift} onStart={() => setScreen({ view: 'game', jobId: 'forklift' })} />
          <View style={styles.summary}><Text style={styles.summaryTitle}>TURNOS COMPLETADOS · {state.workShifts}</Text><Text style={styles.summaryText}>{state.lastWorkResult ? `Último sueldo: ${state.lastWorkResult.reward} Mapocoins · ${WORK_JOBS[state.lastWorkResult.jobId].name}` : 'Mapofer todavía no ha dado un palo al agua.'}</Text></View>
        </>}

        {screen.view === 'game' && <View style={styles.gamePanel}>
          <Text style={styles.gameTitle}>{WORK_JOBS[screen.jobId].icon} {WORK_JOBS[screen.jobId].name}</Text>
          {screen.jobId === 'cashier'
            ? <CashierGame onComplete={(performance) => finish('cashier', performance)} />
            : <ForkliftGame onComplete={(performance) => finish('forklift', performance)} />}
        </View>}

        {screen.view === 'result' && <ResultCard result={screen.result} bestScore={state.workBestScores[screen.result.jobId]} onAgain={() => setScreen({ view: 'game', jobId: screen.result.jobId })} onMenu={() => setScreen({ view: 'menu' })} />}
      </ScrollView>
    </SafeAreaView>
  </>;
}

function JobCard({ jobId, bestScore, onStart }: { jobId: WorkJobId; bestScore: number; onStart: () => void }) {
  const job = WORK_JOBS[jobId];
  return <View style={[styles.jobCard, jobId === 'forklift' && styles.forkliftCard]}>
    <View style={styles.jobTop}><Text style={styles.jobIcon}>{job.icon}</Text><View style={styles.jobCopy}><Text style={styles.jobName}>{job.name}</Text><Text style={styles.jobDescription}>{job.description}</Text></View></View>
    <View style={styles.jobMeta}><Text style={styles.best}>RÉCORD {bestScore}</Text><Text style={styles.base}>BASE 🪙 {job.baseReward}</Text></View>
    <Pressable onPress={onStart} style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}><Text style={styles.startText}>FICHAR Y EMPEZAR</Text></Pressable>
  </View>;
}

function ResultCard({ result, bestScore, onAgain, onMenu }: { result: WorkResult; bestScore: number; onAgain: () => void; onMenu: () => void }) {
  return <View style={styles.resultCard}>
    <Text style={styles.resultIcon}>💸</Text><Text style={styles.resultTitle}>TURNO TERMINADO</Text>
    <Text style={styles.pay}>+{result.reward} MAPOCOINS</Text>
    <View style={styles.resultGrid}><ResultMetric label="PUNTOS" value={result.score} /><ResultMetric label="RÉCORD" value={bestScore} /><ResultMetric label="ACIERTOS" value={result.correct} /><ResultMetric label="ERRORES" value={result.mistakes} /><ResultMetric label="TIEMPO" value={`${result.elapsedSeconds}s`} /></View>
    <Text style={styles.consequence}>Mapofer sale cansado, con hambre y bastante menos dispuesto a seguir cotizando.</Text>
    <Pressable onPress={onAgain} style={styles.startButton}><Text style={styles.startText}>OTRO TURNO</Text></Pressable>
    <Pressable onPress={onMenu} style={styles.secondary}><Text style={styles.secondaryText}>CAMBIAR DE TRABAJO</Text></Pressable>
  </View>;
}

function ResultMetric({ label, value }: { label: string; value: string | number }) { return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0718' }, loading: { flex: 1, backgroundColor: '#0b0718', alignItems: 'center', justifyContent: 'center' }, text: { color: colors.text }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { paddingVertical: 10, paddingRight: 16 }, backText: { color: '#ffd45d', fontWeight: '900', fontSize: 16 }, heading: { alignItems: 'flex-end' }, kicker: { color: '#ffd45d', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  wallet: { marginTop: 16, backgroundColor: '#3a2c10', borderColor: '#d09828', borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, walletLabel: { color: '#ad914f', fontSize: 8, fontWeight: '900' }, walletValue: { color: colors.text, fontSize: 23, fontWeight: '900' }, walletName: { color: '#ffd45d', fontSize: 9, fontWeight: '900' }, stats: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, intro: { color: '#c8bacf', fontSize: 12, lineHeight: 18, textAlign: 'center', marginVertical: 17, paddingHorizontal: 15 },
  jobCard: { backgroundColor: '#17354d', borderColor: '#3ba9de', borderWidth: 2, borderRadius: 22, padding: 16, marginBottom: 13 }, forkliftCard: { backgroundColor: '#3c3019', borderColor: '#d09828' }, jobTop: { flexDirection: 'row', gap: 13, alignItems: 'center' }, jobIcon: { fontSize: 42 }, jobCopy: { flex: 1 }, jobName: { color: colors.text, fontSize: 17, fontWeight: '900' }, jobDescription: { color: '#b8adbe', fontSize: 10, lineHeight: 15, marginTop: 3 }, jobMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }, best: { color: '#bcadd0', fontSize: 9, fontWeight: '900' }, base: { color: '#ffd45d', fontSize: 9, fontWeight: '900' }, startButton: { backgroundColor: '#8d4dea', borderRadius: 13, alignItems: 'center', paddingVertical: 12, marginTop: 12 }, startText: { color: colors.text, fontSize: 11, fontWeight: '900' }, pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  summary: { backgroundColor: '#151022', borderColor: '#332740', borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 5 }, summaryTitle: { color: '#a990bc', fontSize: 9, fontWeight: '900' }, summaryText: { color: '#c8bacf', fontSize: 11, marginTop: 4 }, gamePanel: { marginTop: 18 }, gameTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginBottom: 15, textAlign: 'center' },
  resultCard: { marginTop: 22, backgroundColor: '#211638', borderColor: '#8d4dea', borderWidth: 2, borderRadius: 25, padding: 20, alignItems: 'stretch' }, resultIcon: { fontSize: 52, textAlign: 'center' }, resultTitle: { color: colors.text, textAlign: 'center', fontWeight: '900', fontSize: 20, marginTop: 6 }, pay: { color: '#ffd45d', fontSize: 25, fontWeight: '900', textAlign: 'center', marginTop: 5 }, resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 18 }, metric: { flexGrow: 1, minWidth: '29%', backgroundColor: '#34244c', borderRadius: 12, padding: 10, alignItems: 'center' }, metricLabel: { color: '#9e8ab3', fontSize: 8, fontWeight: '900' }, metricValue: { color: colors.text, fontWeight: '900', fontSize: 16, marginTop: 2 }, consequence: { color: '#b9a9c6', textAlign: 'center', fontSize: 11, lineHeight: 16, marginTop: 16 }, secondary: { alignItems: 'center', paddingVertical: 12 }, secondaryText: { color: '#b994ed', fontSize: 10, fontWeight: '900' },
});
