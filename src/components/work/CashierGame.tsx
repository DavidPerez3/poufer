import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { WorkPerformance } from '@/domain/work';

const PRODUCTS = [
  { icon: '🥛', name: 'Leche', price: 2, options: [2, 4, 7] },
  { icon: '🍕', name: 'Pizza', price: 6, options: [3, 6, 9] },
  { icon: '🧻', name: 'Papel', price: 4, options: [4, 5, 8] },
  { icon: '🥤', name: 'Refresco', price: 3, options: [1, 3, 6] },
  { icon: '🍫', name: 'Chocolate', price: 5, options: [2, 5, 7] },
  { icon: '🧀', name: 'Queso', price: 8, options: [4, 8, 10] },
] as const;

export function CashierGame({ onComplete }: { onComplete: (performance: WorkPerformance) => void }) {
  const startedAt = useRef(Date.now());
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const product = PRODUCTS[index];

  const scan = (price: number) => {
    const hit = price === product.price;
    const nextCorrect = correct + (hit ? 1 : 0);
    const nextMistakes = mistakes + (hit ? 0 : 1);
    if (!hit) {
      setMistakes(nextMistakes);
      return;
    }
    if (index === PRODUCTS.length - 1) {
      onComplete({ correct: nextCorrect, mistakes: nextMistakes, elapsedSeconds: (Date.now() - startedAt.current) / 1_000 });
      return;
    }
    setCorrect(nextCorrect);
    setIndex((current) => current + 1);
  };

  return <View style={styles.game}>
    <View style={styles.progress}><Text style={styles.progressText}>PRODUCTO {index + 1}/{PRODUCTS.length}</Text><Text style={styles.errors}>ERRORES {mistakes}</Text></View>
    <View style={styles.belt}><Text style={styles.beltLine}>▰ ▰ ▰ ▰ ▰</Text><Text style={styles.product}>{product.icon}</Text><Text style={styles.productName}>{product.name}</Text><Text style={styles.scanner}>⌁ ESCÁNER</Text></View>
    <Text style={styles.instruction}>Pulsa el precio correcto</Text>
    <View style={styles.options}>{product.options.map((price) => <Pressable key={price} onPress={() => scan(price)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}><Text style={styles.optionText}>{price} €</Text></Pressable>)}</View>
  </View>;
}

const styles = StyleSheet.create({
  game: { gap: 14 }, progress: { flexDirection: 'row', justifyContent: 'space-between' }, progressText: { color: '#77ddff', fontSize: 11, fontWeight: '900' }, errors: { color: '#ff7c8f', fontSize: 11, fontWeight: '900' },
  belt: { height: 205, borderRadius: 22, backgroundColor: '#193049', borderWidth: 2, borderColor: '#3ba9de', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }, beltLine: { position: 'absolute', bottom: 15, color: '#6f8294', fontSize: 28, letterSpacing: 7 }, product: { fontSize: 70 }, productName: { color: 'white', fontSize: 19, fontWeight: '900', marginTop: 3 }, scanner: { position: 'absolute', top: 12, right: 12, color: '#ff5b70', fontSize: 9, fontWeight: '900', backgroundColor: '#4b1721', padding: 7, borderRadius: 8 },
  instruction: { color: '#c6b8d2', textAlign: 'center', fontWeight: '700' }, options: { flexDirection: 'row', gap: 9 }, option: { flex: 1, paddingVertical: 17, borderRadius: 15, backgroundColor: '#8d4dea', alignItems: 'center', borderWidth: 1, borderColor: '#bd8bff' }, optionText: { color: 'white', fontWeight: '900', fontSize: 17 }, pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
