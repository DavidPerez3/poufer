import Head from 'expo-router/head';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { deriveMood, moodLabel } from '@/domain/mapofer';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  useGameClock();

  const state = useMapoferStore();
  const mood = deriveMood(state);

  if (!state.hasHydrated) {
    return (
      <>
        <PageHead />
        <View style={styles.loading}>
          <Text style={styles.logo}>POUFER</Text>
          <Text style={styles.muted}>Despertando a Mapofer…</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <PageHead />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.logo}>POUFER</Text>
            <Text style={styles.subtitle}>Cuida a Mapofer · fase 0.1</Text>
          </View>
          <View style={styles.coins}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinText}>{state.mapocoins}</Text>
            <Text style={styles.coinName}>Mapocoins</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusSmall}>ESTADO</Text>
          <Text style={styles.statusText}>{moodLabel[mood]}</Text>
        </View>

        <MapoferAvatar mood={mood} />

        <View style={styles.statsGrid}>
          <StatBar icon="🍔" label="Hambre" value={state.hunger} />
          <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
          <StatBar icon="😴" label="Sueño" value={state.sleep} />
          <StatBar icon="😐" label="Aburrimiento" value={state.boredom} inverse />
        </View>

        <Text style={styles.sectionTitle}>Cuidados básicos</Text>
        <View style={styles.actionsGrid}>
          <ActionButton emoji="🌯" label="Comer" detail="+ hambre" onPress={state.eat} />
          <ActionButton emoji="🚿" label="Ducha" detail="+ higiene" onPress={state.shower} />
          <ActionButton emoji="🛋️" label="Dormir" detail="+ sueño" onPress={state.rest} />
          <ActionButton emoji="📺" label="Anime" detail="- aburrimiento" onPress={state.watchAnime} />
        </View>

        <Text style={styles.sectionTitle}>Siguiente en el roadmap</Text>
        <View style={styles.lockedRow}>
          <View style={styles.lockedCard}>
            <Text style={styles.lockedEmoji}>💊</Text>
            <Text style={styles.lockedTitle}>Farmacia</Text>
            <Text style={styles.lockedText}>Fase 0.2</Text>
          </View>
          <View style={styles.lockedCard}>
            <Text style={styles.lockedEmoji}>🍺</Text>
            <Text style={styles.lockedTitle}>Bar</Text>
            <Text style={styles.lockedText}>Fase 0.3</Text>
          </View>
        </View>

        <Pressable onLongPress={state.reset} delayLongPress={900} style={styles.devReset}>
          <Text style={styles.devResetText}>Mantén pulsado aquí para reiniciar el estado de desarrollo</Text>
        </Pressable>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

function PageHead() {
  return (
    <Head>
      <title>POUFER — Cuida a Mapofer</title>
      <meta
        name="description"
        content="Mascota virtual humorística: cuida a Mapofer desde Web, PWA o Android."
      />
    </Head>
  );
}

type ActionButtonProps = {
  emoji: string;
  label: string;
  detail: string;
  onPress: () => void;
};

function ActionButton({ emoji, label, detail, onPress }: ActionButtonProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
      <Text style={styles.actionDetail}>{detail}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 48,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  logo: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: colors.primarySoft,
    fontSize: 12,
    fontWeight: '700',
  },
  muted: {
    color: colors.textMuted,
  },
  coins: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceSoft,
    minWidth: 90,
  },
  coinIcon: {
    fontSize: 17,
  },
  coinText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  coinName: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
  },
  statusBadge: {
    alignSelf: 'center',
    marginTop: 18,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusSmall: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 24,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  action: {
    minWidth: '47%',
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.primary,
    padding: 16,
    minHeight: 105,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#b987ff',
  },
  actionPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  actionEmoji: {
    fontSize: 25,
    marginBottom: 5,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  actionDetail: {
    color: '#efe5ff',
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
  },
  lockedRow: {
    flexDirection: 'row',
    gap: 10,
  },
  lockedCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceSoft,
    opacity: 0.72,
  },
  lockedEmoji: {
    fontSize: 24,
  },
  lockedTitle: {
    color: colors.text,
    fontWeight: '900',
    marginTop: 5,
  },
  lockedText: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  devReset: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  devResetText: {
    color: '#6f5d88',
    fontSize: 10,
  },
});
