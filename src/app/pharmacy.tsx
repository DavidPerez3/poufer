import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { PHARMACY_ITEMS, type ItemId } from '@/domain/items';
import { deriveAppearance, statusLabel } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function PharmacyScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const [feedback, setFeedback] = useState('Stock inicial de pruebas · la tienda llegará en 0.7');
  const appearance = deriveAppearance(state, state.activeEffects);
  const activeUntil = useMemo(
    () => Math.max(0, ...state.activeEffects.map((effect) => effect.expiresAt)),
    [state.activeEffects],
  );
  const remainingMinutes = Math.max(0, Math.ceil((activeUntil - Date.now()) / 60_000));

  const handleUseItem = (itemId: ItemId) => {
    const item = PHARMACY_ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) return;

    const result = state.useItem(itemId);
    setFeedback(
      result === 'used'
        ? `${item.name}: Mapofer se está poniendo fino.`
        : `No queda ${item.name.toLowerCase()}. La reposición llegará con la tienda.`,
    );
  };

  if (!state.hasHydrated) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Abriendo Farmapofer…</Text>
      </View>
    );
  }

  return (
    <>
      <Head>
        <title>Farmapofer — POUFER</title>
      </Head>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>‹ Inicio</Text>
            </Pressable>
            <View style={styles.titleBlock}>
              <Text style={styles.kicker}>FASE 0.2</Text>
              <Text style={styles.title}>FARMAPOFER</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>ESTADO</Text>
            <Text style={styles.statusValue}>{statusLabel[appearance.status]}</Text>
            {remainingMinutes > 0 && <Text style={styles.timer}>~{remainingMinutes} min</Text>}
          </View>

          <MapoferAvatar appearance={appearance} compact />

          <View style={styles.vitals}>
            <StatBar icon="⚡" label="Energía" value={state.energy} />
            <StatBar icon="🫠" label="Alterado" value={state.altered} inverse />
            <StatBar icon="💦" label="Sudor" value={state.sweat} inverse />
            <StatBar icon="🌀" label="Ansia" value={state.craving} inverse />
          </View>

          <View style={styles.feedback}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>

          <Text style={styles.sectionTitle}>Inventario</Text>
          {PHARMACY_ITEMS.map((item) => {
            const quantity = state.inventory[item.id];
            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemIconWrap}>
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                </View>
                <View style={styles.itemInfo}>
                  <View style={styles.itemTitleRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.stock}>x{quantity}</Text>
                  </View>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Pressable
                    accessibilityRole="button"
                    disabled={quantity === 0}
                    onPress={() => handleUseItem(item.id)}
                    style={({ pressed }) => [
                      styles.useButton,
                      quantity === 0 && styles.useButtonDisabled,
                      pressed && quantity > 0 && styles.useButtonPressed,
                    ]}
                  >
                    <Text style={styles.useButtonText}>{quantity > 0 ? 'USAR' : 'SIN STOCK'}</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}

          <Text style={styles.disclaimer}>
            Objetos ficticios de videojuego. No representan productos, dosis ni efectos reales.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  loadingText: { color: colors.text, fontWeight: '800' },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 42 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { paddingVertical: 10, paddingRight: 16 },
  backText: { color: colors.primarySoft, fontWeight: '900', fontSize: 16 },
  titleBlock: { alignItems: 'flex-end' },
  kicker: { color: colors.success, fontWeight: '900', fontSize: 10, letterSpacing: 1.5 },
  title: { color: colors.text, fontWeight: '900', fontSize: 26, letterSpacing: 1 },
  statusRow: {
    alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.surfaceSoft, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 7,
    marginTop: 12,
  },
  statusLabel: { color: colors.textMuted, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  statusValue: { color: colors.text, fontSize: 12, fontWeight: '900' },
  timer: { color: colors.success, fontSize: 10, fontWeight: '800' },
  vitals: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  feedback: {
    marginTop: 16, backgroundColor: '#173d32', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#276b55',
  },
  feedbackText: { color: '#bff7dc', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 22, marginBottom: 11 },
  itemCard: {
    flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: colors.surfaceSoft, marginBottom: 12,
  },
  itemIconWrap: {
    width: 64, height: 64, borderRadius: 18, backgroundColor: colors.surfaceSoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 13,
  },
  itemIcon: { fontSize: 34 },
  itemInfo: { flex: 1 },
  itemTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { color: colors.text, fontWeight: '900', fontSize: 17 },
  stock: { color: colors.primarySoft, fontWeight: '900', fontSize: 13 },
  itemDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  useButton: {
    alignSelf: 'flex-start', marginTop: 10, backgroundColor: colors.primary,
    paddingHorizontal: 22, paddingVertical: 9, borderRadius: 12,
  },
  useButtonDisabled: { backgroundColor: '#4b4058', opacity: 0.65 },
  useButtonPressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  useButtonText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  disclaimer: { color: '#796a8f', textAlign: 'center', fontSize: 10, lineHeight: 15, marginTop: 8 },
});
