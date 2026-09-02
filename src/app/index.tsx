import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { deriveAppearance, statusLabel } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  useGameClock();
  const router = useRouter();

  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);

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
            <Text style={styles.subtitle}>Cuida a Mapofer · fase 0.7</Text>
          </View>
          <View style={styles.coins}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinText}>{state.mapocoins}</Text>
            <Text style={styles.coinName}>Mapocoins</Text>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusSmall}>ESTADO</Text>
          <Text style={styles.statusText}>{statusLabel[appearance.status]}</Text>
        </View>

        <MapoferAvatar appearance={appearance} />

        <View style={styles.statsGrid}>
          <StatBar icon="🍔" label="Hambre" value={state.hunger} />
          <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
          <StatBar icon="😴" label="Sueño" value={state.sleep} />
          <StatBar icon="😐" label="Aburrimiento" value={state.boredom} inverse />
        </View>

        <Text style={styles.sectionTitle}>Cuidados básicos</Text>
        <View style={styles.actionsGrid}>
          <ActionButton emoji="🌯" label="Comer" detail="elige menú" onPress={() => router.push('/food')} />
          <ActionButton emoji="🚿" label="Baño" detail="ducha y WC" onPress={() => router.push('/bathroom')} />
          <ActionButton emoji="🛋️" label="Dormir" detail="+ sueño" onPress={state.rest} />
          <ActionButton emoji="📺" label="Ocio" detail="anime y más" onPress={() => router.push('/leisure')} />
        </View>

        <Text style={styles.sectionTitle}>Zonas de Poufer</Text>
        <View style={styles.lockedRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/pharmacy')}
            style={({ pressed }) => [styles.moduleCard, pressed && styles.actionPressed]}
          >
            <Text style={styles.lockedEmoji}>💊</Text>
            <Text style={styles.lockedTitle}>Farmacia</Text>
            <Text style={styles.moduleReady}>ABIERTO</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/bar')} style={({ pressed }) => [styles.barCard, pressed && styles.actionPressed]}>
            <Text style={styles.lockedEmoji}>🍺</Text>
            <Text style={styles.lockedTitle}>Bar</Text>
            <Text style={styles.barReady}>ABIERTO</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/smoking')} style={({ pressed }) => [styles.smokeCard, pressed && styles.actionPressed]}>
            <Text style={styles.lockedEmoji}>🚬</Text>
            <Text style={styles.lockedTitle}>Fumar</Text>
            <Text style={styles.smokeReady}>ABIERTO</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/food')} style={({ pressed }) => [styles.foodCard, pressed && styles.actionPressed]}>
            <Text style={styles.lockedEmoji}>🍔</Text><Text style={styles.lockedTitle}>Comida</Text><Text style={styles.foodReady}>ABIERTO</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/bathroom')} style={({ pressed }) => [styles.bathCard, pressed && styles.actionPressed]}>
            <Text style={styles.lockedEmoji}>🚿</Text><Text style={styles.lockedTitle}>Baño</Text><Text style={styles.bathReady}>ABIERTO</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/leisure')} style={({ pressed }) => [styles.leisureCard, pressed && styles.actionPressed]}>
            <Text style={styles.lockedEmoji}>🎮</Text><Text style={styles.lockedTitle}>Ocio</Text><Text style={styles.leisureReady}>ABIERTO</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/shop')} style={({ pressed }) => [styles.shopCard, pressed && styles.actionPressed]}>
            <Text style={styles.lockedEmoji}>🛍️</Text><Text style={styles.lockedTitle}>Tienda</Text><Text style={styles.shopReady}>ABIERTO</Text>
          </Pressable>
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
    flexWrap: 'wrap',
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
  moduleCard: {
    flex: 1,
    backgroundColor: '#173d32',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success,
  },
  barCard: { flex: 1, backgroundColor: '#4a1724', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#ff5c72' },
  barReady: { color: '#ff91a4', fontSize: 11, fontWeight: '900', marginTop: 2 },
  smokeCard: { minWidth: '47%', flex: 1, backgroundColor: '#12372e', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#52cf92' },
  smokeReady: { color: '#79e7b1', fontSize: 11, fontWeight: '900', marginTop: 2 },
  foodCard: { minWidth: '47%', flex: 1, backgroundColor: '#49330b', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#e99c13' },
  foodReady: { color: '#ffd26e', fontSize: 11, fontWeight: '900', marginTop: 2 },
  bathCard: { minWidth: '47%', flex: 1, backgroundColor: '#0e3446', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#45c8ff' },
  bathReady: { color: '#7edcff', fontSize: 11, fontWeight: '900', marginTop: 2 },
  leisureCard: { minWidth: '47%', flex: 1, backgroundColor: '#302050', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#9d62ff' },
  leisureReady: { color: '#c8a1ff', fontSize: 11, fontWeight: '900', marginTop: 2 },
  shopCard: { minWidth: '47%', flex: 1, backgroundColor: '#173c62', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#42bcff' },
  shopReady: { color: '#83d8ff', fontSize: 11, fontWeight: '900', marginTop: 2 },
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
  moduleReady: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '900',
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
