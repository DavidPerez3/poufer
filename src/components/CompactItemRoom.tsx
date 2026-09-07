import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MapoferAvatar } from '@/components/MapoferAvatar';
import type { ItemDefinition, ItemId } from '@/domain/items';
import type { MapoferAppearance } from '@/domain/mapoferAppearance';
import { statusLabel } from '@/domain/mapoferAppearance';
import { colors } from '@/theme/colors';

type Props = {
  title: string;
  phase: string;
  accent: string;
  background: string;
  appearance: MapoferAppearance;
  items: readonly ItemDefinition[];
  stats: ReactNode;
  feedback: string;
  actionLabel: string;
  onBack: () => void;
  onUse: (itemId: ItemId) => void;
  getQuantity: (itemId: ItemId) => number;
  footer?: ReactNode;
  statusExtra?: string;
};

export function CompactItemRoom({
  title,
  phase,
  accent,
  background,
  appearance,
  items,
  stats,
  feedback,
  actionLabel,
  onBack,
  onUse,
  getQuantity,
  footer,
  statusExtra,
}: Props) {
  const [itemIndex, setItemIndex] = useState(0);
  const item = items[itemIndex] ?? items[0];

  const moveItem = (direction: -1 | 1) => {
    setItemIndex((current) => {
      const next = current + direction;
      if (next < 0) return items.length - 1;
      if (next >= items.length) return 0;
      return next;
    });
  };

  if (!item) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top', 'bottom']}>
        <View style={styles.emptyRoom}><Text style={styles.emptyText}>No hay objetos disponibles.</Text></View>
      </SafeAreaView>
    );
  }

  const quantity = getQuantity(item.id);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.back}><Text style={[styles.backText, { color: accent }]}>‹ Inicio</Text></Pressable>
          <View style={styles.heading}>
            <Text style={[styles.kicker, { color: accent }]}>FASE {phase}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        <View style={[styles.room, { borderColor: accent }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>ESTADO</Text>
            <Text style={styles.badgeValue}>{statusLabel[appearance.status]}</Text>
            {statusExtra ? <Text style={[styles.statusExtra, { color: accent }]}>{statusExtra}</Text> : null}
          </View>
          <View style={styles.avatarClip}>
            <View style={styles.avatarScale}>
              <MapoferAvatar appearance={appearance} compact />
            </View>
          </View>
        </View>

        <View style={styles.stats}>{stats}</View>

        <View style={styles.selector}>
          <Pressable onPress={() => moveItem(-1)} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
          <View style={styles.selectorCopy}>
            <Text style={[styles.selectorTitle, { color: accent }]}>{title}</Text>
            <Text style={styles.counter}>{itemIndex + 1}/{items.length}</Text>
          </View>
          <Pressable onPress={() => moveItem(1)} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
        </View>

        <View style={[styles.itemCard, { borderColor: accent }]}>
          <View style={styles.itemTop}>
            <View style={[styles.iconWrap, { borderColor: accent }]}><Text style={styles.itemIcon}>{item.icon}</Text></View>
            <View style={styles.itemCopy}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={[styles.stock, { color: accent }]}>x{quantity}</Text>
              <Text numberOfLines={3} style={styles.description}>{item.description}</Text>
            </View>
          </View>
          <Pressable
            disabled={quantity === 0}
            onPress={() => onUse(item.id)}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: accent },
              quantity === 0 && styles.disabled,
              pressed && quantity > 0 && styles.pressed,
            ]}
          >
            <Text style={styles.actionText}>{quantity > 0 ? actionLabel : 'SIN STOCK'}</Text>
          </Pressable>
        </View>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
        <View style={styles.feedback}><Text numberOfLines={2} style={styles.feedbackText}>{feedback}</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
  backText: { fontWeight: '900', fontSize: 14 },
  heading: { alignItems: 'flex-end' },
  kicker: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: colors.text, fontSize: 21, fontWeight: '900', letterSpacing: 0.6 },
  room: {
    flex: 1,
    minHeight: 150,
    maxHeight: 225,
    borderRadius: 23,
    backgroundColor: '#171026',
    borderWidth: 1,
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 10,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 8, 31, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeLabel: { color: '#9a8ba8', fontSize: 7, fontWeight: '900' },
  badgeValue: { color: colors.text, fontSize: 9, fontWeight: '900' },
  statusExtra: { fontSize: 8, fontWeight: '900' },
  avatarClip: { height: 210, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  avatarScale: { width: '118%', transform: [{ scale: 0.72 }] },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
  selectorTitle: { fontSize: 9, fontWeight: '900' },
  counter: { color: '#806f8e', fontSize: 7, fontWeight: '900', marginTop: 1 },
  itemCard: {
    minHeight: 146,
    borderRadius: 18,
    padding: 11,
    backgroundColor: '#211638',
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  itemTop: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  iconWrap: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#2d2040',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIcon: { fontSize: 38 },
  itemCopy: { flex: 1 },
  itemName: { color: colors.text, fontSize: 16, fontWeight: '900' },
  stock: { fontSize: 9, fontWeight: '900', marginTop: 1 },
  description: { color: '#b9a9c6', fontSize: 9, lineHeight: 13, marginTop: 4 },
  action: { borderRadius: 11, paddingVertical: 9, alignItems: 'center', marginTop: 8 },
  actionText: { color: '#120b18', fontWeight: '900', fontSize: 9 },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  footer: { minHeight: 28, justifyContent: 'center' },
  feedback: { minHeight: 32, borderRadius: 11, backgroundColor: '#151022', paddingHorizontal: 10, paddingVertical: 6, justifyContent: 'center' },
  feedbackText: { color: '#d8cae3', textAlign: 'center', fontSize: 8, fontWeight: '700', lineHeight: 11 },
  emptyRoom: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.text },
});
