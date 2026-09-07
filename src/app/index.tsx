import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.topBar}>
            <Pressable onLongPress={state.reset} delayLongPress={900}>
              <Text style={styles.logo}>POUFER</Text>
              <Text style={styles.subtitle}>MAPOFER · FASE 0.9.5</Text>
            </Pressable>
            <View style={styles.statusBadge}>
              <Text style={styles.statusSmall}>ESTADO</Text>
              <Text numberOfLines={1} style={styles.statusText}>{statusLabel[appearance.status]}</Text>
            </View>
            <View style={styles.coins}>
              <Text style={styles.coinIcon}>🪙</Text>
              <Text style={styles.coinText}>{state.mapocoins}</Text>
            </View>
          </View>

          <View style={styles.roomFrame}>
            <View style={styles.avatarClip}>
              <View style={styles.avatarScale}>
                <MapoferAvatar appearance={appearance} compact />
              </View>
            </View>

            <View style={[styles.sideRail, styles.leftRail]}>
              <RoomShortcut emoji="💊" label="Farma" accent="#56e391" onPress={() => router.push('/pharmacy')} />
              <RoomShortcut emoji="🍺" label="Bar" accent="#ff6f87" onPress={() => router.push('/bar')} />
              <RoomShortcut emoji="🚬" label="Fumar" accent="#72deb0" onPress={() => router.push('/smoking')} />
            </View>
            <View style={[styles.sideRail, styles.rightRail]}>
              <RoomShortcut emoji="🍔" label="Comida" accent="#ffbd37" onPress={() => router.push('/food')} />
              <RoomShortcut emoji="🚿" label="Baño" accent="#55cfff" onPress={() => router.push('/bathroom')} />
              <RoomShortcut emoji="🎮" label="Ocio" accent="#b47aff" onPress={() => router.push('/leisure')} />
            </View>
          </View>

          <View style={styles.statsGrid}>
            <StatBar icon="🍔" label="Hambre" value={state.hunger} />
            <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
            <StatBar icon="😴" label="Sueño" value={state.sleep} />
            <StatBar icon="😐" label="Aburr." value={state.boredom} inverse />
          </View>

          <View style={styles.actions}>
            <ActionButton emoji="🌯" label="Comer" onPress={() => router.push('/food')} />
            <ActionButton emoji="🚿" label="Baño" onPress={() => router.push('/bathroom')} />
            <ActionButton emoji="🛋️" label="Dormir" onPress={state.rest} />
            <ActionButton emoji="📺" label="Ocio" onPress={() => router.push('/leisure')} />
          </View>

          <View style={styles.dock}>
            <DockButton emoji="🛍️" label="Tienda" onPress={() => router.push('/shop')} />
            <DockButton emoji="🦺" label="Currar" onPress={() => router.push('/work')} />
            <View style={styles.homeDock}><Text style={styles.homeDockEmoji}>🏠</Text></View>
            <DockButton emoji="🎰" label="Casino" onPress={() => router.push('/casino')} />
            <DockButton emoji="💊" label="Farma" onPress={() => router.push('/pharmacy')} />
          </View>
        </View>
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

function RoomShortcut({ emoji, label, accent, onPress }: {
  emoji: string;
  label: string;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.shortcut, { borderColor: accent }, pressed && styles.pressed]}
    >
      <Text style={styles.shortcutEmoji}>{emoji}</Text>
      <Text numberOfLines={1} style={styles.shortcutLabel}>{label}</Text>
    </Pressable>
  );
}

function ActionButton({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      <Text style={styles.actionEmoji}>{emoji}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

function DockButton({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.dockButton, pressed && styles.pressed]}>
      <Text style={styles.dockEmoji}>{emoji}</Text>
      <Text style={styles.dockLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 7,
  },
  topBar: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  logo: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: colors.primarySoft,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: -2,
  },
  muted: { color: colors.textMuted },
  statusBadge: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  statusSmall: {
    color: colors.textMuted,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  statusText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
  },
  coins: {
    minWidth: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#35234c',
    borderRadius: 13,
    paddingHorizontal: 8,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#6d4d91',
  },
  coinIcon: { fontSize: 14 },
  coinText: { color: colors.text, fontSize: 14, fontWeight: '900' },
  roomFrame: {
    flex: 1,
    minHeight: 225,
    maxHeight: 300,
    borderRadius: 25,
    backgroundColor: '#170c28',
    borderWidth: 1,
    borderColor: '#4d2878',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  avatarClip: {
    height: 238,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarScale: {
    width: '118%',
    transform: [{ scale: 0.79 }],
  },
  sideRail: {
    position: 'absolute',
    top: 16,
    bottom: 16,
    justifyContent: 'space-around',
    gap: 7,
  },
  leftRail: { left: 8 },
  rightRail: { right: 8 },
  shortcut: {
    width: 58,
    minHeight: 51,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(16, 8, 31, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  shortcutEmoji: { fontSize: 19 },
  shortcutLabel: { color: colors.text, fontSize: 8, fontWeight: '900', marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 6,
  },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: 61,
    borderRadius: 17,
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: '#b987ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  actionEmoji: { fontSize: 21 },
  actionLabel: { color: colors.text, fontSize: 10, fontWeight: '900', marginTop: 2 },
  dock: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 19,
    backgroundColor: '#151020',
    borderWidth: 1,
    borderColor: '#302441',
    padding: 5,
  },
  dockButton: {
    flex: 1,
    minWidth: 0,
    height: 43,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockEmoji: { fontSize: 17 },
  dockLabel: { color: '#b8a9c4', fontSize: 7, fontWeight: '900', marginTop: 1 },
  homeDock: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginTop: -14,
    backgroundColor: '#8d4dea',
    borderWidth: 3,
    borderColor: '#c99cff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeDockEmoji: { fontSize: 21 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
