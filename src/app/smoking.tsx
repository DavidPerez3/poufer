import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import { StatBar } from '@/components/StatBar';
import { SMOKE_ITEMS, type ItemId } from '@/domain/items';
import { deriveAppearance, statusLabel } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function SmokingScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);
  const [feedback, setFeedback] = useState('El cenicero está preparado. Todo es cartoon y ficticio.');

  const smoke = (itemId: ItemId) => {
    const item = SMOKE_ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const result = state.useItem(itemId);
    setFeedback(result === 'used'
      ? item.id === 'joint' ? 'Ojos rojos. Se avecina una visita al kebab.' : 'Mapofer echa una nube bastante lamentable.'
      : `No queda ${item.name.toLowerCase()}.`);
  };

  if (!state.hasHydrated) return <View style={styles.loading}><Text style={styles.text}>Buscando el mechero…</Text></View>;

  return (
    <>
      <Head><title>Fumar — POUFER</title></Head>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable>
            <View style={styles.heading}><Text style={styles.kicker}>FASE 0.4</Text><Text style={styles.title}>FUMAR</Text></View>
          </View>
          <View style={styles.badge}><Text style={styles.badgeLabel}>ESTADO</Text><Text style={styles.badgeValue}>{statusLabel[appearance.status]}</Text></View>
          <MapoferAvatar appearance={appearance} compact />
          <View style={styles.stats}>
            <StatBar icon="🍔" label="Hambre" value={state.hunger} />
            <StatBar icon="😐" label="Aburrimiento" value={state.boredom} inverse />
            <StatBar icon="🧠" label="Ansia" value={state.craving} inverse />
            <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
          </View>
          <View style={styles.feedback}><Text style={styles.feedbackText}>{feedback}</Text></View>
          <Text style={styles.section}>Paquete y cenicero</Text>
          <View style={styles.grid}>
            {SMOKE_ITEMS.map((item) => {
              const quantity = state.inventory[item.id];
              return (
                <View key={item.id} style={styles.card}>
                  <Text style={styles.icon}>{item.icon}</Text>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.stock}>x{quantity}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                  <Pressable disabled={!quantity} onPress={() => smoke(item.id)} style={[styles.button, !quantity && styles.disabled]}>
                    <Text style={styles.buttonText}>{quantity ? 'ENCENDER' : 'SIN STOCK'}</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
          <View style={styles.chain}><Text style={styles.chainText}>PORRO → OJOS ROJOS → HAMBRE → KEBAB</Text></View>
          <Text style={styles.disclaimer}>Representación ficticia, absurda y no instructiva. No describe consumos reales.</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071312' }, loading: { flex: 1, backgroundColor: '#071312', alignItems: 'center', justifyContent: 'center' }, text: { color: colors.text },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 44 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  back: { paddingVertical: 10, paddingRight: 16 }, backText: { color: '#79e7b1', fontWeight: '900', fontSize: 16 }, heading: { alignItems: 'flex-end' },
  kicker: { color: '#5fe39f', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 27, fontWeight: '900', letterSpacing: 1 },
  badge: { alignSelf: 'center', marginTop: 12, flexDirection: 'row', gap: 8, backgroundColor: '#174735', paddingHorizontal: 17, paddingVertical: 7, borderRadius: 999 },
  badgeLabel: { color: '#8fc7ae', fontSize: 9, fontWeight: '900' }, badgeValue: { color: colors.text, fontSize: 12, fontWeight: '900' }, stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  feedback: { marginTop: 16, backgroundColor: '#12372e', borderColor: '#318a67', borderWidth: 1, borderRadius: 14, padding: 12 }, feedbackText: { color: '#bfffe0', textAlign: 'center', fontWeight: '700', fontSize: 12 },
  section: { color: colors.text, fontSize: 19, fontWeight: '900', marginTop: 22, marginBottom: 11 }, grid: { flexDirection: 'row', gap: 10 },
  card: { flex: 1, backgroundColor: '#102b24', borderColor: '#28654f', borderWidth: 1, borderRadius: 20, padding: 14, minHeight: 220 }, icon: { fontSize: 35 },
  itemName: { color: colors.text, fontWeight: '900', fontSize: 16, marginTop: 5 }, stock: { color: '#76e2ad', fontWeight: '900', fontSize: 12 }, description: { color: '#a4c6b8', fontSize: 11, lineHeight: 15, marginTop: 5, flex: 1 },
  button: { backgroundColor: '#259b68', paddingVertical: 9, borderRadius: 12, alignItems: 'center', marginTop: 10 }, disabled: { opacity: 0.4 }, buttonText: { color: colors.text, fontWeight: '900', fontSize: 11 },
  chain: { marginTop: 16, borderRadius: 14, padding: 12, backgroundColor: '#1d3f1b', borderWidth: 1, borderColor: '#5a9a48' }, chainText: { color: '#d9ffc8', fontWeight: '900', fontSize: 11, textAlign: 'center' },
  disclaimer: { color: '#60796f', textAlign: 'center', fontSize: 10, marginTop: 18 },
});
