import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { LEISURE_ACTIVITIES, LEISURE_ACTIVITY_LIST, type LeisureActivityId } from '@/domain/leisure';
import { deriveAppearance, statusLabel } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function LeisureScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);
  const [feedback, setFeedback] = useState('El ocio reduce el aburrimiento, pero también consume tiempo y energía.');

  const startActivity = (activityId: LeisureActivityId) => {
    const activity = LEISURE_ACTIVITIES[activityId];
    state.performActivity(activityId);
    setFeedback(`${activity.name} completado · ${activity.durationMinutes} min de paz mental.`);
  };

  if (!state.hasHydrated) return <View style={styles.loading}><Text style={styles.text}>Buscando el mando…</Text></View>;

  const lastActivity = state.lastLeisureActivity
    ? LEISURE_ACTIVITIES[state.lastLeisureActivity.activityId]
    : null;

  return <><Head><title>Ocio — POUFER</title></Head><SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable><View style={styles.heading}><Text style={styles.kicker}>FASE 0.6</Text><Text style={styles.title}>OCIO</Text></View></View>
      <View style={styles.badge}><Text style={styles.badgeLabel}>ESTADO</Text><Text style={styles.badgeValue}>{statusLabel[appearance.status]}</Text></View>
      <View style={styles.roomProps}><Text style={styles.tv}>▶ ANIME</Text><Text style={styles.speaker}>♫</Text></View>
      <MapoferAvatar appearance={appearance} compact />
      <View style={styles.stats}><StatBar icon="😐" label="Aburrimiento" value={state.boredom} inverse /><StatBar icon="⚡" label="Energía" value={state.energy} /><StatBar icon="😴" label="Sueño" value={state.sleep} /><StatBar icon="🍔" label="Hambre" value={state.hunger} /></View>
      <View style={styles.feedback}><Text style={styles.feedbackText}>{feedback}</Text></View>
      <Text style={styles.section}>¿Qué hace Mapofer?</Text>
      <View style={styles.activities}>{LEISURE_ACTIVITY_LIST.map((activity) => <View key={activity.id} style={styles.card}>
        <View style={styles.cardTop}><Text style={styles.icon}>{activity.icon}</Text><Text style={styles.duration}>{activity.durationMinutes} MIN</Text></View>
        <Text style={styles.activityName}>{activity.name}</Text><Text style={styles.description}>{activity.description}</Text>
        <Pressable onPress={() => startActivity(activity.id)} style={styles.button}><Text style={styles.buttonText}>HACER</Text></Pressable>
      </View>)}</View>
      <View style={styles.history}><Text style={styles.historyTitle}>SESIONES DE OCIO · {state.leisureSessions}</Text><Text style={styles.historyText}>{lastActivity ? `Última: ${lastActivity.name}` : 'Mapofer todavía no ha hecho nada productivamente improductivo.'}</Text></View>
      <Text style={styles.section}>Próximamente</Text>
      <View style={styles.lockedRow}><LockedActivity icon="🎰" label="Tragaperras" phase="0.9" /><LockedActivity icon="🚗" label="CUPRA negro" phase="0.10" /><LockedActivity icon="🎵" label="Ritmo techno" phase="0.11" /></View>
    </ScrollView>
  </SafeAreaView></>;
}

function LockedActivity({ icon, label, phase }: { icon: string; label: string; phase: string }) {
  return <View style={styles.locked}><Text style={styles.lockedIcon}>{icon}</Text><Text style={styles.lockedLabel}>{label}</Text><Text style={styles.lockedPhase}>FASE {phase}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0718' }, loading: { flex: 1, backgroundColor: '#0b0718', alignItems: 'center', justifyContent: 'center' }, text: { color: colors.text }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 44 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { paddingVertical: 10, paddingRight: 16 }, backText: { color: '#c8a1ff', fontWeight: '900', fontSize: 16 }, heading: { alignItems: 'flex-end' }, kicker: { color: '#9d62ff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  badge: { alignSelf: 'center', marginTop: 12, flexDirection: 'row', gap: 8, backgroundColor: '#3c2369', paddingHorizontal: 17, paddingVertical: 7, borderRadius: 999 }, badgeLabel: { color: '#b99cdd', fontSize: 9, fontWeight: '900' }, badgeValue: { color: colors.text, fontSize: 12, fontWeight: '900' },
  roomProps: { position: 'relative', height: 0, zIndex: 5 }, tv: { position: 'absolute', top: 52, left: 42, color: '#5be4ff', backgroundColor: '#080e2e', borderWidth: 2, borderColor: '#4a7cff', padding: 8, fontSize: 10, fontWeight: '900' }, speaker: { position: 'absolute', top: 58, right: 48, color: '#ff74d4', fontSize: 28, fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, feedback: { marginTop: 16, backgroundColor: '#302050', borderColor: '#6f42ad', borderWidth: 1, borderRadius: 14, padding: 12 }, feedbackText: { color: '#e9d7ff', textAlign: 'center', fontWeight: '700', fontSize: 12 }, section: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 22, marginBottom: 11 },
  activities: { gap: 10 }, card: { backgroundColor: '#211638', borderColor: '#503476', borderWidth: 1, borderRadius: 20, padding: 15 }, cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, icon: { fontSize: 32 }, duration: { color: '#c8a1ff', fontSize: 10, fontWeight: '900', backgroundColor: '#3a275a', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 }, activityName: { color: colors.text, fontWeight: '900', fontSize: 17, marginTop: 5 }, description: { color: '#baaaca', fontSize: 11, lineHeight: 16, marginTop: 4 }, button: { backgroundColor: '#8d4dea', paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginTop: 12 }, buttonText: { color: colors.text, fontWeight: '900', fontSize: 11 },
  history: { marginTop: 15, borderRadius: 16, padding: 14, backgroundColor: '#151022', borderWidth: 1, borderColor: '#3b2d50' }, historyTitle: { color: '#b994ed', fontSize: 10, fontWeight: '900' }, historyText: { color: '#c8becf', fontSize: 11, marginTop: 4 },
  lockedRow: { flexDirection: 'row', gap: 8 }, locked: { flex: 1, minHeight: 100, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#171220', borderWidth: 1, borderColor: '#30283b', opacity: 0.72, padding: 7 }, lockedIcon: { fontSize: 25 }, lockedLabel: { color: colors.text, fontSize: 10, fontWeight: '900', textAlign: 'center', marginTop: 4 }, lockedPhase: { color: '#756883', fontSize: 8, fontWeight: '900', marginTop: 3 },
});
