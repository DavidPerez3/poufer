import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { BAR_ITEMS, type ItemId } from '@/domain/items';
import { deriveAppearance, statusLabel } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function BarScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);
  const [feedback, setFeedback] = useState('Consumiciones de prueba · sin coste hasta la economía 0.7');

  const drink = (itemId: ItemId) => {
    const item = BAR_ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const result = state.useItem(itemId);
    setFeedback(result === 'used' ? `${item.name}: una y nos vamos.` : `No queda ${item.name.toLowerCase()}.`);
  };

  if (!state.hasHydrated) return <View style={styles.loading}><Text style={styles.text}>Abriendo Barpofer…</Text></View>;

  return (
    <>
      <Head><title>Barpofer — POUFER</title></Head>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable>
            <View style={styles.heading}><Text style={styles.kicker}>FASE 0.3</Text><Text style={styles.title}>BARPOFER</Text></View>
          </View>
          <View style={styles.badge}><Text style={styles.badgeLabel}>ESTADO</Text><Text style={styles.badgeValue}>{statusLabel[appearance.status]}</Text></View>
          <MapoferAvatar appearance={appearance} compact />
          <View style={styles.stats}>
            <StatBar icon="🍻" label="Borrachera" value={state.drunkenness} inverse />
            <StatBar icon="🤕" label="Resaca" value={state.hangover} inverse />
            <StatBar icon="😴" label="Sueño" value={state.sleep} />
            <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
          </View>
          <View style={styles.feedback}><Text style={styles.feedbackText}>{feedback}</Text></View>
          <Text style={styles.section}>La barra</Text>
          <View style={styles.grid}>
            {BAR_ITEMS.map((item) => {
              const quantity = state.inventory[item.id];
              return (
                <View key={item.id} style={styles.card}>
                  <Text style={styles.icon}>{item.icon}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.stock}>x{quantity}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  <Pressable disabled={!quantity} onPress={() => drink(item.id)} style={[styles.button, !quantity && styles.disabled]}>
                    <Text style={styles.buttonText}>{quantity ? 'PEDIR' : 'SIN STOCK'}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <Text style={styles.disclaimer}>Mecánica ficticia y paródica. No representa efectos ni consumos reales.</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#120718' }, loading: { flex: 1, backgroundColor: '#120718', alignItems: 'center', justifyContent: 'center' },
  text: { color: colors.text }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 44 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { paddingVertical: 10, paddingRight: 16 },
  backText: { color: '#ff9bad', fontWeight: '900', fontSize: 16 }, heading: { alignItems: 'flex-end' }, kicker: { color: '#ff5c72', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 27, fontWeight: '900', letterSpacing: 1 }, badge: { alignSelf: 'center', marginTop: 12, flexDirection: 'row', gap: 8, backgroundColor: '#46162d', paddingHorizontal: 17, paddingVertical: 7, borderRadius: 999 },
  badgeLabel: { color: '#c991a6', fontSize: 9, fontWeight: '900' }, badgeValue: { color: colors.text, fontSize: 12, fontWeight: '900' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, feedback: { marginTop: 16, backgroundColor: '#4a1724', borderColor: '#a63b50', borderWidth: 1, borderRadius: 14, padding: 12 },
  feedbackText: { color: '#ffd0d8', textAlign: 'center', fontWeight: '700', fontSize: 12 }, section: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 22, marginBottom: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, card: { width: '48%', flexGrow: 1, backgroundColor: '#271020', borderColor: '#5c243d', borderWidth: 1, borderRadius: 20, padding: 14, minHeight: 220 },
  icon: { fontSize: 35 }, itemName: { color: colors.text, fontWeight: '900', fontSize: 16, marginTop: 5 }, stock: { color: '#ff9bad', fontWeight: '900', fontSize: 12 },
  description: { color: '#c5a8b6', fontSize: 11, lineHeight: 15, marginTop: 5, flex: 1 }, button: { backgroundColor: '#d33957', paddingVertical: 9, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  disabled: { opacity: 0.4 }, buttonText: { color: colors.text, fontWeight: '900', fontSize: 11 }, disclaimer: { color: '#796273', textAlign: 'center', fontSize: 10, marginTop: 18 },
});
