import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CashierGame } from '@/components/work/CashierGame';
import { ForkliftGame } from '@/components/work/ForkliftGame';
import { StatBar } from '@/components/StatBar';
import { WORK_JOBS, type WorkJobId, type WorkPerformance, type WorkResult } from '@/domain/work';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

type ScreenState =
  | { view: 'menu' }
  | { view: 'game'; jobId: WorkJobId }
  | { view: 'result'; result: WorkResult };

export default function WorkScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const [screen, setScreen] = useState<ScreenState>({ view: 'menu' });
  const [selectedJob, setSelectedJob] = useState<WorkJobId>('cashier');

  const finish = (jobId: WorkJobId, performance: WorkPerformance) => {
    const result = state.completeWorkShift(jobId, performance);
    setScreen({ view: 'result', result });
  };

  const goBack = () => {
    if (screen.view === 'menu') router.back();
    else setScreen({ view: 'menu' });
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Fichando a Mapofer…</Text></View>;
  }

  return (
    <>
      <Head><title>Currar — POUFER</title></Head>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={goBack} style={styles.back}>
              <Text style={styles.backText}>‹ {screen.view === 'menu' ? 'Inicio' : 'Trabajos'}</Text>
            </Pressable>
            <View style={styles.heading}><Text style={styles.kicker}>FASE 0.8</Text><Text style={styles.title}>CURRAR</Text></View>
          </View>

          <View style={styles.wallet}>
            <Text style={styles.walletLabel}>MAPOCOINS</Text>
            <Text style={styles.walletValue}>🪙 {state.mapocoins}</Text>
            <Text style={styles.walletMeta}>TURNOS {state.workShifts}</Text>
          </View>

          {screen.view === 'menu' && (
            <Menu
              energy={state.energy}
              hunger={state.hunger}
              boredom={state.boredom}
              hygiene={state.hygiene}
              bestScores={state.workBestScores}
              lastWorkResult={state.lastWorkResult}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
              onStart={() => setScreen({ view: 'game', jobId: selectedJob })}
            />
          )}

          {screen.view === 'game' && (
            <View style={styles.gamePanel}>
              <View style={styles.gameHeading}>
                <Text style={styles.gameTitle}>{WORK_JOBS[screen.jobId].icon} {WORK_JOBS[screen.jobId].name}</Text>
                <Text style={styles.gameHint}>Hazlo rápido y sin liarla.</Text>
              </View>
              {screen.jobId === 'cashier'
                ? <CashierGame onComplete={(performance) => finish('cashier', performance)} />
                : <ForkliftGame onComplete={(performance) => finish('forklift', performance)} />}
            </View>
          )}

          {screen.view === 'result' && (
            <ResultCard
              result={screen.result}
              bestScore={state.workBestScores[screen.result.jobId]}
              onAgain={() => setScreen({ view: 'game', jobId: screen.result.jobId })}
              onMenu={() => setScreen({ view: 'menu' })}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}

function Menu({
  energy,
  hunger,
  boredom,
  hygiene,
  bestScores,
  lastWorkResult,
  selectedJob,
  onSelectJob,
  onStart,
}: {
  energy: number;
  hunger: number;
  boredom: number;
  hygiene: number;
  bestScores: Record<WorkJobId, number>;
  lastWorkResult: WorkResult | null;
  selectedJob: WorkJobId;
  onSelectJob: (jobId: WorkJobId) => void;
  onStart: () => void;
}) {
  const job = WORK_JOBS[selectedJob];

  return (
    <>
      <View style={styles.stats}>
        <StatBar icon="⚡" label="Energía" value={energy} />
        <StatBar icon="🍔" label="Hambre" value={hunger} />
        <StatBar icon="😐" label="Aburr." value={boredom} inverse />
        <StatBar icon="🚿" label="Higiene" value={hygiene} />
      </View>

      <View style={styles.jobTabs}>
        <JobTab
          active={selectedJob === 'cashier'}
          icon={WORK_JOBS.cashier.icon}
          label="CAJERO"
          onPress={() => onSelectJob('cashier')}
        />
        <JobTab
          active={selectedJob === 'forklift'}
          icon={WORK_JOBS.forklift.icon}
          label="CARRETILLA"
          onPress={() => onSelectJob('forklift')}
        />
      </View>

      <View style={[styles.jobCard, selectedJob === 'forklift' && styles.forkliftCard]}>
        <View style={styles.jobTop}>
          <Text style={styles.jobIcon}>{job.icon}</Text>
          <View style={styles.jobCopy}>
            <Text style={styles.jobName}>{job.name}</Text>
            <Text numberOfLines={3} style={styles.jobDescription}>{job.description}</Text>
          </View>
        </View>
        <View style={styles.jobMeta}>
          <View><Text style={styles.metaLabel}>RÉCORD</Text><Text style={styles.metaValue}>{bestScores[selectedJob]}</Text></View>
          <View><Text style={styles.metaLabel}>BASE</Text><Text style={styles.metaValue}>🪙 {job.baseReward}</Text></View>
        </View>
        <Pressable onPress={onStart} style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
          <Text style={styles.startText}>FICHAR Y EMPEZAR</Text>
        </Pressable>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>ÚLTIMO TURNO</Text>
        <Text numberOfLines={2} style={styles.summaryText}>
          {lastWorkResult
            ? `${WORK_JOBS[lastWorkResult.jobId].name} · +${lastWorkResult.reward} Mapocoins · ${lastWorkResult.score} puntos`
            : 'Mapofer todavía no ha dado un palo al agua.'}
        </Text>
      </View>
    </>
  );
}

function JobTab({ active, icon, label, onPress }: { active: boolean; icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.jobTab, active && styles.activeJobTab]}>
      <Text style={styles.jobTabIcon}>{icon}</Text>
      <Text style={[styles.jobTabText, active && styles.activeJobTabText]}>{label}</Text>
    </Pressable>
  );
}

function ResultCard({
  result,
  bestScore,
  onAgain,
  onMenu,
}: {
  result: WorkResult;
  bestScore: number;
  onAgain: () => void;
  onMenu: () => void;
}) {
  return (
    <View style={styles.resultCard}>
      <Text style={styles.resultIcon}>💸</Text>
      <Text style={styles.resultTitle}>TURNO TERMINADO</Text>
      <Text style={styles.pay}>+{result.reward} MAPOCOINS</Text>
      <View style={styles.resultGrid}>
        <ResultMetric label="PUNTOS" value={result.score} />
        <ResultMetric label="RÉCORD" value={bestScore} />
        <ResultMetric label="ACIERTOS" value={result.correct} />
        <ResultMetric label="ERRORES" value={result.mistakes} />
        <ResultMetric label="TIEMPO" value={`${Math.round(result.elapsedSeconds)}s`} />
      </View>
      <Text style={styles.consequence}>Mapofer sale cansado, con hambre y bastante menos dispuesto a seguir cotizando.</Text>
      <Pressable onPress={onAgain} style={styles.startButton}><Text style={styles.startText}>OTRO TURNO</Text></Pressable>
      <Pressable onPress={onMenu} style={styles.secondary}><Text style={styles.secondaryText}>CAMBIAR DE TRABAJO</Text></Pressable>
    </View>
  );
}

function ResultMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0718' },
  loading: { flex: 1, backgroundColor: '#0b0718', alignItems: 'center', justifyContent: 'center' },
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
  backText: { color: '#ffd45d', fontWeight: '900', fontSize: 14 },
  heading: { alignItems: 'flex-end' },
  kicker: { color: '#ffd45d', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  wallet: {
    minHeight: 48,
    backgroundColor: '#3a2c10',
    borderColor: '#d09828',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletLabel: { color: '#ad914f', fontSize: 7, fontWeight: '900' },
  walletValue: { color: colors.text, fontSize: 21, fontWeight: '900' },
  walletMeta: { color: '#ffd45d', fontSize: 7, fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  jobTabs: { flexDirection: 'row', gap: 6, backgroundColor: '#151022', padding: 4, borderRadius: 14 },
  jobTab: { flex: 1, minHeight: 48, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  activeJobTab: { backgroundColor: '#493714' },
  jobTabIcon: { fontSize: 19 },
  jobTabText: { color: '#776b7e', fontSize: 7, fontWeight: '900', marginTop: 1 },
  activeJobTabText: { color: '#ffd45d' },
  jobCard: {
    flex: 1,
    minHeight: 190,
    maxHeight: 270,
    backgroundColor: '#17354d',
    borderColor: '#3ba9de',
    borderWidth: 1,
    borderRadius: 20,
    padding: 13,
    justifyContent: 'space-between',
  },
  forkliftCard: { backgroundColor: '#3c3019', borderColor: '#d09828' },
  jobTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  jobIcon: { fontSize: 46 },
  jobCopy: { flex: 1 },
  jobName: { color: colors.text, fontSize: 17, fontWeight: '900' },
  jobDescription: { color: '#b8adbe', fontSize: 9, lineHeight: 13, marginTop: 3 },
  jobMeta: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  metaLabel: { color: '#a898b5', fontSize: 7, fontWeight: '900', textAlign: 'center' },
  metaValue: { color: colors.text, fontSize: 15, fontWeight: '900', textAlign: 'center', marginTop: 2 },
  startButton: { backgroundColor: '#8d4dea', borderRadius: 12, alignItems: 'center', paddingVertical: 10, marginTop: 8 },
  startText: { color: colors.text, fontSize: 9, fontWeight: '900' },
  summary: { minHeight: 45, backgroundColor: '#151022', borderColor: '#332740', borderWidth: 1, borderRadius: 13, padding: 8 },
  summaryTitle: { color: '#a990bc', fontSize: 7, fontWeight: '900' },
  summaryText: { color: '#c8bacf', fontSize: 8, lineHeight: 11, marginTop: 2 },
  gamePanel: { flex: 1, minHeight: 0, justifyContent: 'center' },
  gameHeading: { alignItems: 'center', marginBottom: 8 },
  gameTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  gameHint: { color: '#91839b', fontSize: 8, marginTop: 1 },
  resultCard: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#211638',
    borderColor: '#8d4dea',
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    justifyContent: 'center',
  },
  resultIcon: { fontSize: 38, textAlign: 'center' },
  resultTitle: { color: colors.text, textAlign: 'center', fontWeight: '900', fontSize: 16, marginTop: 3 },
  pay: { color: '#ffd45d', fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 3 },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 10 },
  metric: { flexGrow: 1, minWidth: '29%', backgroundColor: '#34244c', borderRadius: 10, padding: 7, alignItems: 'center' },
  metricLabel: { color: '#9e8ab3', fontSize: 6, fontWeight: '900' },
  metricValue: { color: colors.text, fontWeight: '900', fontSize: 12, marginTop: 1 },
  consequence: { color: '#b9a9c6', textAlign: 'center', fontSize: 8, lineHeight: 11, marginTop: 9 },
  secondary: { alignItems: 'center', paddingVertical: 8 },
  secondaryText: { color: '#b994ed', fontSize: 8, fontWeight: '900' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
