import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  const [activityIndex, setActivityIndex] = useState(0);
  const [feedback, setFeedback] = useState('Elige una actividad. Una sola tarjeta, cero scroll.');

  const activity = LEISURE_ACTIVITY_LIST[activityIndex] ?? LEISURE_ACTIVITY_LIST[0];
  const lastActivity = state.lastLeisureActivity
    ? LEISURE_ACTIVITIES[state.lastLeisureActivity.activityId]
    : null;

  const startActivity = (activityId: LeisureActivityId) => {
    const selected = LEISURE_ACTIVITIES[activityId];
    state.performActivity(activityId);
    setFeedback(`${selected.name} completado · ${selected.durationMinutes} min de paz mental.`);
  };

  const moveActivity = (direction: -1 | 1) => {
    setActivityIndex((current) => {
      const next = current + direction;
      if (next < 0) return LEISURE_ACTIVITY_LIST.length - 1;
      if (next >= LEISURE_ACTIVITY_LIST.length) return 0;
      return next;
    });
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Buscando el mando…</Text></View>;
  }

  return (
    <>
      <Head><title>Ocio — POUFER</title></Head>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable>
            <View style={styles.heading}><Text style={styles.kicker}>FASE 0.6</Text><Text style={styles.title}>OCIO</Text></View>
          </View>

          <View style={styles.room}>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>ESTADO</Text>
              <Text style={styles.badgeValue}>{statusLabel[appearance.status]}</Text>
            </View>
            <Text style={styles.tv}>▶ ANIME</Text>
            <Text style={styles.speaker}>♫</Text>
            <View style={styles.avatarClip}><View style={styles.avatarScale}><MapoferAvatar appearance={appearance} compact /></View></View>
          </View>

          <View style={styles.stats}>
            <StatBar icon="😐" label="Aburr." value={state.boredom} inverse />
            <StatBar icon="⚡" label="Energía" value={state.energy} />
            <StatBar icon="😴" label="Sueño" value={state.sleep} />
            <StatBar icon="🍔" label="Hambre" value={state.hunger} />
          </View>

          <View style={styles.selector}>
            <Pressable onPress={() => moveActivity(-1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
            <View style={styles.selectorTitle}>
              <Text style={styles.selectorSmall}>ACTIVIDAD {activityIndex + 1}/{LEISURE_ACTIVITY_LIST.length}</Text>
              <Text numberOfLines={1} style={styles.selectorName}>{activity.icon} {activity.name}</Text>
            </View>
            <Pressable onPress={() => moveActivity(1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityTop}>
              <Text style={styles.bigIcon}>{activity.icon}</Text>
              <View style={styles.activityCopy}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text numberOfLines={2} style={styles.description}>{activity.description}</Text>
              </View>
              <Text style={styles.duration}>{activity.durationMinutes} MIN</Text>
            </View>
            <Pressable onPress={() => startActivity(activity.id)} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
              <Text style={styles.buttonText}>HACER AHORA</Text>
            </Pressable>
          </View>

          <View style={styles.bottomInfo}>
            <View style={styles.history}>
              <Text style={styles.historyTitle}>SESIONES · {state.leisureSessions}</Text>
              <Text numberOfLines={1} style={styles.historyText}>{lastActivity ? `Última: ${lastActivity.name}` : 'Todavía ninguna.'}</Text>
            </View>
            <View style={styles.future}>
              <Text style={styles.futureText}>🚗 CUPRA 0.10</Text>
              <Text style={styles.futureText}>🎵 RAVE 0.11</Text>
            </View>
          </View>

          <View style={styles.feedback}><Text numberOfLines={2} style={styles.feedbackText}>{feedback}</Text></View>
        </View>
      </SafeAreaView>
    </>
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
  backText: { color: '#c8a1ff', fontWeight: '900', fontSize: 14 },
  heading: { alignItems: 'flex-end' },
  kicker: { color: '#9d62ff', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  room: {
    flex: 1,
    minHeight: 150,
    maxHeight: 225,
    borderRadius: 23,
    backgroundColor: '#171026',
    borderWidth: 1,
    borderColor: '#503476',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 10,
    zIndex: 5,
    flexDirection: 'row',
    gap: 5,
    backgroundColor: 'rgba(60, 35, 105, 0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeLabel: { color: '#b99cdd', fontSize: 7, fontWeight: '900' },
  badgeValue: { color: colors.text, fontSize: 9, fontWeight: '900' },
  tv: {
    position: 'absolute',
    top: 44,
    left: 15,
    zIndex: 5,
    color: '#5be4ff',
    backgroundColor: '#080e2e',
    borderWidth: 1,
    borderColor: '#4a7cff',
    padding: 6,
    fontSize: 8,
    fontWeight: '900',
  },
  speaker: { position: 'absolute', top: 46, right: 20, zIndex: 5, color: '#ff74d4', fontSize: 23, fontWeight: '900' },
  avatarClip: { height: 210, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarScale: { width: '118%', transform: [{ scale: 0.72 }] },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#211638',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#503476',
    padding: 4,
  },
  arrow: { width: 36, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#39255a' },
  arrowText: { color: colors.text, fontSize: 23, fontWeight: '900', lineHeight: 24 },
  selectorTitle: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  selectorSmall: { color: '#9f83bc', fontSize: 7, fontWeight: '900' },
  selectorName: { color: colors.text, fontSize: 11, fontWeight: '900', marginTop: 1 },
  activityCard: {
    minHeight: 116,
    borderRadius: 18,
    backgroundColor: '#211638',
    borderWidth: 1,
    borderColor: '#6f42ad',
    padding: 10,
  },
  activityTop: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  bigIcon: { fontSize: 35 },
  activityCopy: { flex: 1 },
  activityName: { color: colors.text, fontWeight: '900', fontSize: 14 },
  description: { color: '#baaaca', fontSize: 9, lineHeight: 13, marginTop: 2 },
  duration: {
    color: '#c8a1ff',
    fontSize: 8,
    fontWeight: '900',
    backgroundColor: '#3a275a',
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 999,
  },
  button: { backgroundColor: '#8d4dea', paddingVertical: 9, borderRadius: 11, alignItems: 'center', marginTop: 8 },
  buttonText: { color: colors.text, fontWeight: '900', fontSize: 9 },
  bottomInfo: { flexDirection: 'row', gap: 6 },
  history: { flex: 1.3, borderRadius: 13, padding: 8, backgroundColor: '#151022', borderWidth: 1, borderColor: '#3b2d50' },
  historyTitle: { color: '#b994ed', fontSize: 7, fontWeight: '900' },
  historyText: { color: '#c8becf', fontSize: 8, marginTop: 2 },
  future: { flex: 1, borderRadius: 13, padding: 8, backgroundColor: '#151022', justifyContent: 'center', gap: 3 },
  futureText: { color: '#8f819a', fontSize: 8, fontWeight: '900' },
  feedback: { minHeight: 32, borderRadius: 11, backgroundColor: '#302050', paddingHorizontal: 10, paddingVertical: 6, justifyContent: 'center' },
  feedbackText: { color: '#e9d7ff', textAlign: 'center', fontWeight: '700', fontSize: 8, lineHeight: 11 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
});
