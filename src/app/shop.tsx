import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DAILY_REWARD_MAPOCOINS, getDailyRewardRemainingMs } from '@/domain/economy';
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

type ShopTab = 'catalog' | 'movements';

const SHOP_SECTIONS = [
  { title: 'Farmacia', short: '💊', color: '#56e391', items: PHARMACY_ITEMS },
  { title: 'Barpofer', short: '🍺', color: '#ff6f87', items: BAR_ITEMS },
  { title: 'Comida', short: '🍔', color: '#ffbd37', items: FOOD_ITEMS },
  { title: 'Fumar', short: '🚬', color: '#72deb0', items: SMOKE_ITEMS },
] as const;

export default function ShopScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const [tab, setTab] = useState<ShopTab>('catalog');
  const [sectionIndex, setSectionIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [feedback, setFeedback] = useState('Catálogo compacto: una categoría y un objeto cada vez.');

  const now = Date.now();
  const rewardRemaining = getDailyRewardRemainingMs(state.lastDailyRewardAt, now);
  const section = SHOP_SECTIONS[sectionIndex] ?? SHOP_SECTIONS[0];
  const item = section.items[itemIndex] ?? section.items[0];

  const purchase = (selected: ItemDefinition) => {
    const result = state.buyItem(selected.id);
    if (result === 'purchased') setFeedback(`${selected.name} añadido al inventario.`);
    else if (result === 'insufficient-funds') setFeedback(`No tienes suficientes Mapocoins para ${selected.name}.`);
    else setFeedback(`${selected.name} todavía no está a la venta.`);
  };

  const collectReward = () => {
    const result = state.claimDailyReward();
    setFeedback(
      result === 'claimed'
        ? `Recompensa recogida: +${DAILY_REWARD_MAPOCOINS} Mapocoins.`
        : 'La recompensa diaria todavía se está recargando.',
    );
  };

  const selectSection = (index: number) => {
    setSectionIndex(index);
    setItemIndex(0);
  };

  const moveItem = (direction: -1 | 1) => {
    setItemIndex((current) => {
      const next = current + direction;
      if (next < 0) return section.items.length - 1;
      if (next >= section.items.length) return 0;
      return next;
    });
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Contando Mapocoins…</Text></View>;
  }

  return (
    <>
      <Head><title>Tienda — POUFER</title></Head>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹ Inicio</Text></Pressable>
            <View style={styles.heading}><Text style={styles.kicker}>FASE 0.7</Text><Text style={styles.title}>TIENDA</Text></View>
          </View>

          <View style={styles.wallet}>
            <View><Text style={styles.walletLabel}>CARTERA</Text><Text style={styles.walletValue}>🪙 {state.mapocoins}</Text></View>
            <Text style={styles.walletName}>MAPOCOINS</Text>
          </View>

          <View style={styles.tabs}>
            <TopTab active={tab === 'catalog'} label="🛍️ CATÁLOGO" onPress={() => setTab('catalog')} />
            <TopTab active={tab === 'movements'} label="📒 MOVIMIENTOS" onPress={() => setTab('movements')} />
          </View>

          {tab === 'catalog' ? (
            <View style={styles.catalog}>
              <View style={styles.categories}>
                {SHOP_SECTIONS.map((candidate, index) => (
                  <Pressable
                    key={candidate.title}
                    onPress={() => selectSection(index)}
                    style={[
                      styles.category,
                      sectionIndex === index && { borderColor: candidate.color, backgroundColor: '#2b2137' },
                    ]}
                  >
                    <Text style={styles.categoryIcon}>{candidate.short}</Text>
                    <Text numberOfLines={1} style={styles.categoryLabel}>{candidate.title}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.selector}>
                <Pressable onPress={() => moveItem(-1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
                <View style={styles.selectorCopy}>
                  <Text style={[styles.sectionName, { color: section.color }]}>{section.title.toUpperCase()}</Text>
                  <Text style={styles.counter}>{itemIndex + 1}/{section.items.length}</Text>
                </View>
                <Pressable onPress={() => moveItem(1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
              </View>

              <View style={styles.itemCard}>
                <View style={styles.itemTop}>
                  <View style={[styles.iconWrap, { borderColor: section.color }]}><Text style={styles.itemIcon}>{item.icon}</Text></View>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.stock}>TIENES {state.inventory[item.id]}</Text>
                    <Text numberOfLines={3} style={styles.itemDescription}>{item.description}</Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => purchase(item)}
                  style={[
                    styles.buyButton,
                    item.priceMapocoins !== null && state.mapocoins < item.priceMapocoins && styles.cannotAfford,
                  ]}
                >
                  <Text style={styles.buyText}>COMPRAR · 🪙 {item.priceMapocoins ?? '—'}</Text>
                </Pressable>
              </View>

              <View style={styles.rewardMini}>
                <View style={styles.rewardCopy}>
                  <Text style={styles.rewardTitle}>🎁 Recompensa diaria</Text>
                  <Text style={styles.rewardText}>
                    {rewardRemaining === 0 ? `+${DAILY_REWARD_MAPOCOINS} disponibles` : `Vuelve en ${formatRemaining(rewardRemaining)}`}
                  </Text>
                </View>
                <Pressable
                  disabled={rewardRemaining > 0}
                  onPress={collectReward}
                  style={[styles.rewardButton, rewardRemaining > 0 && styles.disabled]}
                >
                  <Text style={styles.rewardButtonText}>{rewardRemaining === 0 ? 'RECOGER' : 'COBRADO'}</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.movements}>
              <View style={styles.rewardCard}>
                <Text style={styles.rewardBig}>🎁</Text>
                <View style={styles.rewardCopy}>
                  <Text style={styles.rewardTitle}>Recompensa diaria</Text>
                  <Text style={styles.rewardText}>
                    {rewardRemaining === 0
                      ? `Hay ${DAILY_REWARD_MAPOCOINS} Mapocoins esperándote.`
                      : `Vuelve en ${formatRemaining(rewardRemaining)}.`}
                  </Text>
                </View>
                <Pressable
                  disabled={rewardRemaining > 0}
                  onPress={collectReward}
                  style={[styles.rewardButton, rewardRemaining > 0 && styles.disabled]}
                >
                  <Text style={styles.rewardButtonText}>{rewardRemaining === 0 ? 'RECOGER' : 'COBRADO'}</Text>
                </Pressable>
              </View>

              <View style={styles.history}>
                <Text style={styles.historyTitle}>ÚLTIMOS MOVIMIENTOS</Text>
                {state.transactions.length === 0 ? (
                  <Text style={styles.empty}>Todavía no has gastado ni ganado Mapocoins.</Text>
                ) : (
                  state.transactions.slice(0, 5).map((transaction) => (
                    <View key={transaction.id} style={styles.transaction}>
                      <Text numberOfLines={1} style={styles.transactionLabel}>{transaction.label}</Text>
                      <Text style={[styles.transactionAmount, transaction.amount > 0 && styles.positive]}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          <View style={styles.feedback}><Text numberOfLines={2} style={styles.feedbackText}>{feedback}</Text></View>
        </View>
      </SafeAreaView>
    </>
  );
}

function TopTab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
      <Text style={[styles.tabText, active && styles.activeTabText]}>{label}</Text>
    </Pressable>
  );
}

function formatRemaining(milliseconds: number): string {
  const totalMinutes = Math.ceil(milliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
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
  backText: { color: '#55cfff', fontWeight: '900', fontSize: 14 },
  heading: { alignItems: 'flex-end' },
  kicker: { color: '#55cfff', fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900' },
  wallet: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#173c62',
    borderWidth: 1,
    borderColor: '#42bcff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletLabel: { color: '#8fdcff', fontSize: 7, fontWeight: '900', letterSpacing: 1 },
  walletValue: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 1 },
  walletName: { color: '#ffc44e', fontSize: 8, fontWeight: '900' },
  tabs: { flexDirection: 'row', backgroundColor: '#151022', borderRadius: 14, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 11 },
  activeTab: { backgroundColor: '#176b9b' },
  tabText: { color: '#806f8e', fontSize: 8, fontWeight: '900' },
  activeTabText: { color: colors.text },
  catalog: { flex: 1, gap: 7, minHeight: 0 },
  categories: { flexDirection: 'row', gap: 5 },
  category: {
    flex: 1,
    minWidth: 0,
    minHeight: 50,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#342841',
    backgroundColor: '#151022',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  categoryIcon: { fontSize: 18 },
  categoryLabel: { color: '#d6cadf', fontSize: 7, fontWeight: '900', marginTop: 2 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151022',
    borderRadius: 13,
    padding: 4,
  },
  arrow: { width: 36, height: 33, borderRadius: 10, backgroundColor: '#2b2137', alignItems: 'center', justifyContent: 'center' },
  arrowText: { color: colors.text, fontSize: 22, fontWeight: '900', lineHeight: 23 },
  selectorCopy: { flex: 1, alignItems: 'center' },
  sectionName: { fontSize: 9, fontWeight: '900' },
  counter: { color: '#806f8e', fontSize: 7, fontWeight: '900', marginTop: 1 },
  itemCard: {
    flex: 1,
    minHeight: 180,
    maxHeight: 250,
    borderRadius: 20,
    padding: 13,
    backgroundColor: '#211638',
    borderWidth: 1,
    borderColor: '#503476',
    justifyContent: 'space-between',
  },
  itemTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  iconWrap: {
    width: 82,
    height: 82,
    borderRadius: 23,
    backgroundColor: '#2d2040',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: { fontSize: 44 },
  itemCopy: { flex: 1 },
  itemName: { color: colors.text, fontSize: 18, fontWeight: '900' },
  stock: { color: '#a68ebd', fontSize: 8, fontWeight: '900', marginTop: 2 },
  itemDescription: { color: '#b9a9c6', fontSize: 10, lineHeight: 14, marginTop: 6 },
  buyButton: { borderRadius: 12, paddingVertical: 11, alignItems: 'center', backgroundColor: '#176b9b', borderWidth: 1, borderColor: '#42bcff' },
  cannotAfford: { backgroundColor: '#332d3d', borderColor: '#5e5268' },
  buyText: { color: colors.text, fontWeight: '900', fontSize: 10 },
  rewardMini: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 9,
    backgroundColor: '#302050',
    borderWidth: 1,
    borderColor: '#8d4dea',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 17,
    padding: 12,
    backgroundColor: '#302050',
    borderWidth: 1,
    borderColor: '#8d4dea',
  },
  rewardBig: { fontSize: 27 },
  rewardCopy: { flex: 1 },
  rewardTitle: { color: colors.text, fontSize: 11, fontWeight: '900' },
  rewardText: { color: '#c7b5d9', fontSize: 8, marginTop: 2 },
  rewardButton: { backgroundColor: '#8d4dea', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  rewardButtonText: { color: colors.text, fontSize: 8, fontWeight: '900' },
  disabled: { opacity: 0.45 },
  movements: { flex: 1, gap: 8, minHeight: 0 },
  history: {
    flex: 1,
    minHeight: 180,
    borderRadius: 18,
    backgroundColor: '#151022',
    borderWidth: 1,
    borderColor: '#342841',
    padding: 12,
  },
  historyTitle: { color: '#aa8ec2', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  empty: { color: '#756b7e', fontSize: 9, marginTop: 12 },
  transaction: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2b2233',
    gap: 8,
  },
  transactionLabel: { flex: 1, color: '#d6cadf', fontSize: 9, fontWeight: '700' },
  transactionAmount: { color: '#ff7f91', fontSize: 10, fontWeight: '900' },
  positive: { color: '#62e49a' },
  feedback: { minHeight: 32, backgroundColor: '#151022', borderRadius: 11, paddingHorizontal: 10, paddingVertical: 6, justifyContent: 'center' },
  feedbackText: { color: '#d8cae3', textAlign: 'center', fontSize: 8, fontWeight: '700', lineHeight: 11 },
});
