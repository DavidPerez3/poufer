import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DAILY_REWARD_MAPOCOINS,
  getDailyRewardRemainingMs,
} from '@/domain/economy';
import {
  BAR_ITEMS,
  FOOD_ITEMS,
  PHARMACY_ITEMS,
  SMOKE_ITEMS,
  type ItemDefinition,
} from '@/domain/items';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

const SHOP_SECTIONS = [
  { title: 'Farmacia', color: '#56e391', items: PHARMACY_ITEMS },
  { title: 'Barpofer', color: '#ff6f87', items: BAR_ITEMS },
  { title: 'Comida', color: '#ffbd37', items: FOOD_ITEMS },
  { title: 'Fumar', color: '#72deb0', items: SMOKE_ITEMS },
] as const;

export default function ShopScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const [feedback, setFeedback] = useState('Compra consumibles para el inventario de Mapofer.');
  const now = Date.now();
  const rewardRemaining = getDailyRewardRemainingMs(state.lastDailyRewardAt, now);

  const purchase = (item: ItemDefinition) => {
    const result = state.buyItem(item.id);
    if (result === 'purchased') setFeedback(`${item.name} añadido al inventario.`);
    else if (result === 'insufficient-funds') setFeedback(`No tienes suficientes Mapocoins para ${item.name}.`);
    else setFeedback(`${item.name} todavía no está a la venta.`);
  };

  const collectReward = () => {
    const result = state.claimDailyReward();
    setFeedback(result === 'claimed'
      ? `Recompensa recogida: +${DAILY_REWARD_MAPOCOINS} Mapocoins.`
      : 'La recompensa diaria todavía se está recargando.');
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Contando Mapocoins…</Text></View>;
  }

  return <>
    <Head><title>Tienda — POUFER</title></Head>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable>
          <View style={styles.heading}><Text style={styles.kicker}>FASE 0.7</Text><Text style={styles.title}>TIENDA</Text></View>
        </View>

        <View style={styles.wallet}>
          <View><Text style={styles.walletLabel}>TU CARTERA</Text><Text style={styles.walletValue}>🪙 {state.mapocoins}</Text></View>
          <Text style={styles.walletName}>MAPOCOINS</Text>
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.rewardCopy}>
            <Text style={styles.rewardTitle}>🎁 Recompensa diaria</Text>
            <Text style={styles.rewardText}>{rewardRemaining === 0
              ? `Hay ${DAILY_REWARD_MAPOCOINS} Mapocoins esperándote.`
              : `Vuelve en ${formatRemaining(rewardRemaining)}.`}</Text>
          </View>
          <Pressable
            disabled={rewardRemaining > 0}
            onPress={collectReward}
            style={[styles.rewardButton, rewardRemaining > 0 && styles.disabled]}
          ><Text style={styles.rewardButtonText}>{rewardRemaining === 0 ? 'RECOGER' : 'COBRADO'}</Text></Pressable>
        </View>

        <View style={styles.feedback}><Text style={styles.feedbackText}>{feedback}</Text></View>

        {SHOP_SECTIONS.map((section) => <View key={section.title}>
          <Text style={[styles.section, { color: section.color }]}>{section.title}</Text>
          <View style={styles.grid}>{section.items.map((item) => <ShopItem
            key={item.id}
            item={item}
            stock={state.inventory[item.id]}
            canAfford={item.priceMapocoins !== null && state.mapocoins >= item.priceMapocoins}
            onBuy={() => purchase(item)}
          />)}</View>
        </View>)}

        <View style={styles.history}>
          <Text style={styles.historyTitle}>ÚLTIMOS MOVIMIENTOS</Text>
          {state.transactions.length === 0
            ? <Text style={styles.empty}>Todavía no has gastado ni ganado Mapocoins.</Text>
            : state.transactions.slice(0, 5).map((transaction) => <View key={transaction.id} style={styles.transaction}>
              <Text style={styles.transactionLabel}>{transaction.label}</Text>
              <Text style={[styles.transactionAmount, transaction.amount > 0 && styles.positive]}>{transaction.amount > 0 ? '+' : ''}{transaction.amount}</Text>
            </View>)}
        </View>
      </ScrollView>
    </SafeAreaView>
  </>;
}

function ShopItem({ item, stock, canAfford, onBuy }: {
  item: ItemDefinition;
  stock: number;
  canAfford: boolean;
  onBuy: () => void;
}) {
  return <View style={styles.itemCard}>
    <View style={styles.itemTop}><Text style={styles.itemIcon}>{item.icon}</Text><Text style={styles.stock}>TIENES {stock}</Text></View>
    <Text style={styles.itemName}>{item.name}</Text>
    <Text numberOfLines={2} style={styles.itemDescription}>{item.description}</Text>
    <Pressable onPress={onBuy} style={[styles.buyButton, !canAfford && styles.cannotAfford]}>
      <Text style={styles.buyText}>🪙 {item.priceMapocoins ?? '—'}</Text>
    </Pressable>
  </View>;
}

function formatRemaining(milliseconds: number): string {
  const totalMinutes = Math.ceil(milliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b0718' }, loading: { flex: 1, backgroundColor: '#0b0718', alignItems: 'center', justifyContent: 'center' }, text: { color: colors.text }, content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 18, paddingBottom: 48 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { paddingVertical: 10, paddingRight: 16 }, backText: { color: '#55cfff', fontWeight: '900', fontSize: 16 }, heading: { alignItems: 'flex-end' }, kicker: { color: '#55cfff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 }, title: { color: colors.text, fontSize: 27, fontWeight: '900' },
  wallet: { marginTop: 18, borderRadius: 24, padding: 20, backgroundColor: '#173c62', borderWidth: 2, borderColor: '#42bcff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, walletLabel: { color: '#8fdcff', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 }, walletValue: { color: colors.text, fontSize: 31, fontWeight: '900', marginTop: 2 }, walletName: { color: '#ffc44e', fontSize: 11, fontWeight: '900' },
  rewardCard: { marginTop: 12, borderRadius: 18, padding: 14, backgroundColor: '#302050', borderWidth: 1, borderColor: '#8d4dea', flexDirection: 'row', alignItems: 'center', gap: 10 }, rewardCopy: { flex: 1 }, rewardTitle: { color: colors.text, fontSize: 15, fontWeight: '900' }, rewardText: { color: '#c7b5d9', fontSize: 11, marginTop: 3 }, rewardButton: { backgroundColor: '#8d4dea', borderRadius: 12, paddingHorizontal: 13, paddingVertical: 10 }, rewardButtonText: { color: colors.text, fontSize: 10, fontWeight: '900' }, disabled: { opacity: 0.45 },
  feedback: { marginTop: 12, backgroundColor: '#151022', borderRadius: 13, padding: 11, borderWidth: 1, borderColor: '#332641' }, feedbackText: { color: '#d8cae3', textAlign: 'center', fontSize: 11, fontWeight: '700' }, section: { fontSize: 18, fontWeight: '900', marginTop: 23, marginBottom: 10 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  itemCard: { width: '48%', flexGrow: 1, maxWidth: '49%', minHeight: 190, borderRadius: 19, padding: 14, backgroundColor: '#211638', borderWidth: 1, borderColor: '#503476' }, itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, itemIcon: { fontSize: 31 }, stock: { color: '#a68ebd', fontSize: 8, fontWeight: '900', backgroundColor: '#35264b', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 4 }, itemName: { color: colors.text, fontSize: 15, fontWeight: '900', marginTop: 7 }, itemDescription: { color: '#b9a9c6', fontSize: 10, lineHeight: 14, marginTop: 3, flex: 1 }, buyButton: { marginTop: 10, borderRadius: 11, paddingVertical: 9, alignItems: 'center', backgroundColor: '#176b9b', borderWidth: 1, borderColor: '#42bcff' }, cannotAfford: { backgroundColor: '#332d3d', borderColor: '#5e5268' }, buyText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  history: { marginTop: 24, borderRadius: 18, backgroundColor: '#151022', borderWidth: 1, borderColor: '#342841', padding: 15 }, historyTitle: { color: '#aa8ec2', fontSize: 10, fontWeight: '900', letterSpacing: 1 }, empty: { color: '#756b7e', fontSize: 11, marginTop: 8 }, transaction: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#2b2233' }, transactionLabel: { color: '#d6cadf', fontSize: 12, fontWeight: '700' }, transactionAmount: { color: '#ff7f91', fontSize: 12, fontWeight: '900' }, positive: { color: '#62e49a' },
});
