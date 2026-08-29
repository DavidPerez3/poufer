import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { FOOD_ITEMS, type ItemId } from '@/domain/items';
import { deriveAppearance, statusLabel } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function FoodScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);
  const [feedback, setFeedback] = useState('Elige menú. La tienda y los precios llegarán con la economía.');

  const eat = (itemId: ItemId) => {
    const item = FOOD_ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const result = state.useItem(itemId);
    setFeedback(result === 'used' ? `${item.name}: desaparece en tiempo récord.` : `No queda ${item.name.toLowerCase()}.`);
  };

  if (!state.hasHydrated) return <View style={styles.loading}><Text style={styles.text}>Abriendo la nevera…</Text></View>;

  return <><Head><title>Comida — POUFER</title></Head><SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable><View style={styles.heading}><Text style={styles.kicker}>FASE 0.5</Text><Text style={styles.title}>COMIDA</Text></View></View>
      <View style={styles.badge}><Text style={styles.badgeLabel}>ESTADO</Text><Text style={styles.badgeValue}>{statusLabel[appearance.status]}</Text></View>
      <MapoferAvatar appearance={appearance} compact />
      <View style={styles.stats}><StatBar icon="🍔" label="Hambre" value={state.hunger} /><StatBar icon="🚽" label="Intestino" value={state.bowel} inverse /><StatBar icon="💧" label="Vejiga" value={state.bladder} inverse /><StatBar icon="🚿" label="Higiene" value={state.hygiene} /></View>
      <View style={styles.feedback}><Text style={styles.feedbackText}>{feedback}</Text></View>
      <Text style={styles.section}>Menú de supervivencia</Text>
      <View style={styles.grid}>{FOOD_ITEMS.map((item) => { const quantity = state.inventory[item.id]; return <View key={item.id} style={styles.card}>
        <Text style={styles.icon}>{item.icon}</Text><Text style={styles.itemName}>{item.name}</Text><Text style={styles.stock}>x{quantity}</Text><Text style={styles.description}>{item.description}</Text>
        <Pressable disabled={!quantity} onPress={() => eat(item.id)} style={[styles.button, !quantity && styles.disabled]}><Text style={styles.buttonText}>{quantity ? 'COMER' : 'SIN STOCK'}</Text></Pressable>
      </View>; })}</View>
      <Text style={styles.disclaimer}>Comer llena a Mapofer, pero también alimenta futuras visitas al baño.</Text>
    </ScrollView>
  </SafeAreaView></>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#160f05' }, loading: { flex: 1, backgroundColor: '#160f05', alignItems: 'center', justifyContent: 'center' }, text: { color: colors.text }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 44 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { paddingVertical: 10, paddingRight: 16 }, backText: { color: '#ffd26e', fontWeight: '900', fontSize: 16 }, heading: { alignItems: 'flex-end' }, kicker: { color: '#ffb72e', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  badge: { alignSelf: 'center', marginTop: 12, flexDirection: 'row', gap: 8, backgroundColor: '#59400d', paddingHorizontal: 17, paddingVertical: 7, borderRadius: 999 }, badgeLabel: { color: '#d9b763', fontSize: 9, fontWeight: '900' }, badgeValue: { color: colors.text, fontSize: 12, fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, feedback: { marginTop: 16, backgroundColor: '#49330b', borderColor: '#a87516', borderWidth: 1, borderRadius: 14, padding: 12 }, feedbackText: { color: '#ffe4a2', textAlign: 'center', fontWeight: '700', fontSize: 12 }, section: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 22, marginBottom: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, card: { width: '47%', flexGrow: 1, backgroundColor: '#342508', borderColor: '#755411', borderWidth: 1, borderRadius: 20, padding: 14, minHeight: 205 }, icon: { fontSize: 35 }, itemName: { color: colors.text, fontWeight: '900', fontSize: 16, marginTop: 5 }, stock: { color: '#ffd26e', fontWeight: '900', fontSize: 12 }, description: { color: '#d0bd8f', fontSize: 11, lineHeight: 15, marginTop: 5, flex: 1 }, button: { backgroundColor: '#e99c13', paddingVertical: 9, borderRadius: 12, alignItems: 'center', marginTop: 10 }, disabled: { opacity: 0.4 }, buttonText: { color: '#241400', fontWeight: '900', fontSize: 11 }, disclaimer: { color: '#87764e', textAlign: 'center', fontSize: 10, marginTop: 18 },
});
