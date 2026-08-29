import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { poopFace, type BathroomActionId } from '@/domain/bathroom';
import { deriveAppearance, statusLabel } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

const actionFeedback: Record<BathroomActionId, string> = { shower: 'Mapofer vuelve a oler a persona.', pee: 'Vejiga vaciada. Momento histórico.', poop: 'Nueva criatura desbloqueada en el suelo.', clean: 'El baño vuelve a ser transitable.' };

export default function BathroomScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);
  const [feedback, setFeedback] = useState('Cuantas más cacas haya, más rápido cae la higiene.');

  const act = (action: BathroomActionId) => {
    const result = state.performBathroomAction(action);
    setFeedback(result === 'not-needed' ? 'Mapofer dice que todavía no le sale.' : result === 'nothing-to-clean' ? 'El suelo ya está sospechosamente limpio.' : actionFeedback[action]);
  };

  if (!state.hasHydrated) return <View style={styles.loading}><Text style={styles.text}>Encendiendo la luz del baño…</Text></View>;

  return <><Head><title>Baño — POUFER</title></Head><SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable><View style={styles.heading}><Text style={styles.kicker}>FASE 0.5</Text><Text style={styles.title}>BAÑO</Text></View></View>
      <View style={styles.badge}><Text style={styles.badgeLabel}>ESTADO</Text><Text style={styles.badgeValue}>{statusLabel[appearance.status]}</Text></View>
      <MapoferAvatar appearance={appearance} compact />
      <View style={styles.stats}><StatBar icon="🚿" label="Higiene" value={state.hygiene} /><StatBar icon="💧" label="Vejiga" value={state.bladder} inverse /><StatBar icon="🚽" label="Intestino" value={state.bowel} inverse /><StatBar icon="💦" label="Sudor" value={state.sweat} inverse /></View>
      <View style={styles.feedback}><Text style={styles.feedbackText}>{feedback}</Text></View>
      <View style={styles.actions}><BathroomButton icon="🚿" label="Ducharse" onPress={() => act('shower')} /><BathroomButton icon="🚽" label="Mear" onPress={() => act('pee')} /><BathroomButton icon="💩" label="Cagar" onPress={() => act('poop')} /><BathroomButton icon="🧹" label="Limpiar" onPress={() => act('clean')} /></View>
      <Text style={styles.section}>Habitantes del suelo · {state.poops.length}/20</Text>
      <View style={styles.floor}>{state.poops.length === 0 ? <Text style={styles.empty}>El suelo está limpio. Inquietante.</Text> : state.poops.map((poop) => <View key={poop.id} style={styles.poop}><Text style={styles.poopTop}>●</Text><Text style={styles.poopFace}>{poopFace[poop.expression]}</Text></View>)}</View>
      <Text style={styles.disclaimer}>La ducha táctil con jabón y aclarado se añadirá en el pulido interactivo.</Text>
    </ScrollView>
  </SafeAreaView></>;
}

function BathroomButton({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionIcon}>{icon}</Text><Text style={styles.actionLabel}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#06121a' }, loading: { flex: 1, backgroundColor: '#06121a', alignItems: 'center', justifyContent: 'center' }, text: { color: colors.text }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 44 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { paddingVertical: 10, paddingRight: 16 }, backText: { color: '#7edcff', fontWeight: '900', fontSize: 16 }, heading: { alignItems: 'flex-end' }, kicker: { color: '#45c8ff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 27, fontWeight: '900' }, badge: { alignSelf: 'center', marginTop: 12, flexDirection: 'row', gap: 8, backgroundColor: '#123b50', paddingHorizontal: 17, paddingVertical: 7, borderRadius: 999 }, badgeLabel: { color: '#91c8dd', fontSize: 9, fontWeight: '900' }, badgeValue: { color: colors.text, fontSize: 12, fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, feedback: { marginTop: 16, backgroundColor: '#0e3446', borderColor: '#257a9c', borderWidth: 1, borderRadius: 14, padding: 12 }, feedbackText: { color: '#c8efff', textAlign: 'center', fontWeight: '700', fontSize: 12 }, actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 }, action: { width: '47%', flexGrow: 1, minHeight: 82, backgroundColor: '#1383ad', borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#76d8ff' }, pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] }, actionIcon: { fontSize: 27 }, actionLabel: { color: colors.text, fontWeight: '900', marginTop: 3 },
  section: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 22, marginBottom: 10 }, floor: { minHeight: 150, borderRadius: 22, borderWidth: 2, borderColor: '#416474', backgroundColor: '#18303a', padding: 15, flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }, empty: { color: '#7796a3', margin: 'auto', fontWeight: '700' }, poop: { width: 63, height: 61, borderRadius: 24, borderTopLeftRadius: 34, borderTopRightRadius: 34, backgroundColor: '#7d4b27', borderWidth: 3, borderColor: '#3c2416', alignItems: 'center', justifyContent: 'center' }, poopTop: { color: '#8e572e', fontSize: 19, position: 'absolute', top: -17 }, poopFace: { color: '#fff0d8', fontSize: 12, fontWeight: '900' }, disclaimer: { color: '#607986', textAlign: 'center', fontSize: 10, marginTop: 18 },
});
