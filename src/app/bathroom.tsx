import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { poopFace, type BathroomActionId } from '@/domain/bathroom';
import { deriveAppearance, statusLabel } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

type BathroomTab = 'shower' | 'wc';

const actionFeedback: Record<BathroomActionId, string> = {
  shower: 'Mapofer vuelve a oler a persona.',
  pee: 'Vejiga vaciada. Momento histórico.',
  poop: 'Nueva criatura desbloqueada en el suelo.',
  clean: 'El baño vuelve a ser transitable.',
};

export default function BathroomScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);
  const [tab, setTab] = useState<BathroomTab>('shower');
  const [feedback, setFeedback] = useState('Elige ducha o WC. Todo cabe en la misma habitación.');

  const act = (action: BathroomActionId) => {
    const result = state.performBathroomAction(action);
    setFeedback(
      result === 'not-needed'
        ? 'Mapofer dice que todavía no le sale.'
        : result === 'nothing-to-clean'
          ? 'El suelo ya está sospechosamente limpio.'
          : actionFeedback[action],
    );
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Encendiendo la luz del baño…</Text></View>;
  }

  const visiblePoops = state.poops.slice(-8);
  const hiddenPoops = Math.max(0, state.poops.length - visiblePoops.length);

  return (
    <>
      <Head><title>Baño — POUFER</title></Head>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable>
            <View style={styles.heading}><Text style={styles.kicker}>FASE 0.5</Text><Text style={styles.title}>BAÑO</Text></View>
          </View>

          <View style={styles.room}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>ESTADO</Text>
              <Text style={styles.badgeValue}>{statusLabel[appearance.status]}</Text>
            </View>
            <View style={styles.avatarClip}><View style={styles.avatarScale}><MapoferAvatar appearance={appearance} compact /></View></View>
          </View>

          <View style={styles.stats}>
            <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
            <StatBar icon="💧" label="Vejiga" value={state.bladder} inverse />
            <StatBar icon="🚽" label="Intestino" value={state.bowel} inverse />
            <StatBar icon="💦" label="Sudor" value={state.sweat} inverse />
          </View>

          <View style={styles.tabs}>
            <TabButton active={tab === 'shower'} label="🚿 DUCHA" onPress={() => setTab('shower')} />
            <TabButton active={tab === 'wc'} label="🚽 WC" onPress={() => setTab('wc')} />
          </View>

          <View style={styles.panel}>
            {tab === 'shower' ? (
              <View style={styles.showerPanel}>
                <Text style={styles.panelEmoji}>🚿</Text>
                <View style={styles.panelCopy}>
                  <Text style={styles.panelTitle}>Ducha rápida</Text>
                  <Text style={styles.panelText}>Limpia a Mapofer y reduce el sudor sin salir de la habitación.</Text>
                </View>
                <Pressable onPress={() => act('shower')} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
                  <Text style={styles.primaryActionText}>DUCHARSE</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.wcPanel}>
                <View style={styles.wcActions}>
                  <BathroomButton icon="💧" label="Mear" onPress={() => act('pee')} />
                  <BathroomButton icon="💩" label="Cagar" onPress={() => act('poop')} />
                  <BathroomButton icon="🧹" label="Limpiar" onPress={() => act('clean')} />
                </View>
                <View style={styles.floor}>
                  {visiblePoops.length === 0 ? (
                    <Text style={styles.empty}>Suelo limpio. Sospechoso.</Text>
                  ) : (
                    visiblePoops.map((poop) => (
                      <View key={poop.id} style={styles.poop}>
                        <Text style={styles.poopFace}>{poopFace[poop.expression]}</Text>
                      </View>
                    ))
                  )}
                  {hiddenPoops > 0 && <Text style={styles.morePoops}>+{hiddenPoops}</Text>}
                </View>
              </View>
            )}
          </View>

          <View style={styles.feedback}><Text numberOfLines={2} style={styles.feedbackText}>{feedback}</Text></View>
        </View>
      </SafeAreaView>
    </>
  );
}

function TabButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </Pressable>
  );
}

function BathroomButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.wcAction, pressed && styles.pressed]}>
      <Text style={styles.wcIcon}>{icon}</Text>
      <Text style={styles.wcLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06121a' },
  loading: { flex: 1, backgroundColor: '#06121a', alignItems: 'center', justifyContent: 'center' },
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
  backText: { color: '#7edcff', fontWeight: '900', fontSize: 14 },
  heading: { alignItems: 'flex-end' },
  kicker: { color: '#45c8ff', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  room: {
    flex: 1,
    minHeight: 150,
    maxHeight: 225,
    borderRadius: 23,
    backgroundColor: '#0b2633',
    borderWidth: 1,
    borderColor: '#246d89',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 10,
    zIndex: 5,
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(14, 52, 70, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeLabel: { color: '#91c8dd', fontSize: 7, fontWeight: '900' },
  badgeValue: { color: colors.text, fontSize: 9, fontWeight: '900' },
  avatarClip: { height: 210, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarScale: { width: '118%', transform: [{ scale: 0.72 }] },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tabs: { flexDirection: 'row', backgroundColor: '#0b2633', borderRadius: 14, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 11, alignItems: 'center' },
  activeTab: { backgroundColor: '#1383ad' },
  tabText: { color: '#7397a6', fontSize: 9, fontWeight: '900' },
  activeTabText: { color: colors.text },
  panel: {
    minHeight: 128,
    borderRadius: 18,
    backgroundColor: '#0e3446',
    borderWidth: 1,
    borderColor: '#257a9c',
    padding: 10,
    justifyContent: 'center',
  },
  showerPanel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  panelEmoji: { fontSize: 34 },
  panelCopy: { flex: 1 },
  panelTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  panelText: { color: '#a9d4e5', fontSize: 10, lineHeight: 14, marginTop: 2 },
  primaryAction: { backgroundColor: '#1383ad', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 11 },
  primaryActionText: { color: colors.text, fontSize: 9, fontWeight: '900' },
  wcPanel: { gap: 8 },
  wcActions: { flexDirection: 'row', gap: 6 },
  wcAction: { flex: 1, borderRadius: 12, paddingVertical: 8, backgroundColor: '#1383ad', alignItems: 'center' },
  wcIcon: { fontSize: 19 },
  wcLabel: { color: colors.text, fontSize: 8, fontWeight: '900', marginTop: 1 },
  floor: {
    minHeight: 64,
    borderRadius: 13,
    backgroundColor: '#18303a',
    borderWidth: 1,
    borderColor: '#416474',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: 6,
    gap: 5,
  },
  empty: { color: '#7796a3', fontSize: 10, fontWeight: '700', margin: 'auto' },
  poop: {
    width: 31,
    height: 28,
    borderRadius: 12,
    backgroundColor: '#7d4b27',
    borderWidth: 1,
    borderColor: '#3c2416',
    alignItems: 'center',
    justifyContent: 'center',
  },
  poopFace: { color: '#fff0d8', fontSize: 7, fontWeight: '900' },
  morePoops: { color: '#ffd1a5', fontSize: 10, fontWeight: '900' },
  feedback: { minHeight: 34, borderRadius: 12, backgroundColor: '#092430', paddingHorizontal: 10, paddingVertical: 7, justifyContent: 'center' },
  feedbackText: { color: '#c8efff', textAlign: 'center', fontWeight: '700', fontSize: 9, lineHeight: 12 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
