import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { WorkPerformance } from '@/domain/work';

type ForkliftCommand = 'left' | 'pick' | 'right' | 'drop';

const COMMANDS: ReadonlyArray<{ id: ForkliftCommand; icon: string; label: string }> = [
  { id: 'left', icon: '⬅️', label: 'IZQUIERDA' },
  { id: 'pick', icon: '⬆️', label: 'RECOGER' },
  { id: 'right', icon: '➡️', label: 'DERECHA' },
  { id: 'drop', icon: '⬇️', label: 'SOLTAR' },
];

const ROUTE: ForkliftCommand[] = ['left', 'pick', 'right', 'drop', 'right', 'pick', 'left', 'drop', 'left', 'pick', 'right', 'drop'];

export function ForkliftGame({ onComplete }: { onComplete: (performance: WorkPerformance) => void }) {
  const startedAt = useRef(Date.now());
  const [step, setStep] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const target = COMMANDS.find((command) => command.id === ROUTE[step])!;

  const drive = (command: ForkliftCommand) => {
    if (command !== target.id) {
      setMistakes((value) => value + 1);
      return;
    }
    if (step === ROUTE.length - 1) {
      onComplete({ correct: ROUTE.length, mistakes, elapsedSeconds: (Date.now() - startedAt.current) / 1_000 });
      return;
    }
    setStep((value) => value + 1);
  };

  const pallet = Math.floor(step / 4) + 1;
  return <View style={styles.game}>
    <View style={styles.progress}><Text style={styles.progressText}>PALÉ {pallet}/3 · PASO {step + 1}/{ROUTE.length}</Text><Text style={styles.errors}>GOLPES {mistakes}</Text></View>
    <View style={styles.warehouse}>
      <View style={styles.shelf}><Text style={styles.boxes}>📦 📦{`\n`}📦 📦</Text></View>
      <Text style={styles.forklift}>🏗️</Text><Text style={styles.pallet}>🟫</Text>
      <Text style={styles.route}>← PASILLO →</Text>
    </View>
    <View style={styles.order}><Text style={styles.orderSmall}>SIGUIENTE MANIOBRA</Text><Text style={styles.orderMain}>{target.icon} {target.label}</Text></View>
    <View style={styles.controls}>{COMMANDS.map((command) => <Pressable key={command.id} onPress={() => drive(command.id)} style={({ pressed }) => [styles.control, pressed && styles.pressed]}><Text style={styles.controlIcon}>{command.icon}</Text><Text style={styles.controlLabel}>{command.label}</Text></Pressable>)}</View>
  </View>;
}

const styles = StyleSheet.create({
  game: { gap: 12 }, progress: { flexDirection: 'row', justifyContent: 'space-between' }, progressText: { color: '#ffd45d', fontSize: 10, fontWeight: '900' }, errors: { color: '#ff7c8f', fontSize: 10, fontWeight: '900' },
  warehouse: { height: 190, borderRadius: 22, backgroundColor: '#272539', borderWidth: 2, borderColor: '#d09828', overflow: 'hidden', justifyContent: 'flex-end' }, shelf: { position: 'absolute', left: 15, top: 18, padding: 10, backgroundColor: '#554532', borderWidth: 2, borderColor: '#92703f' }, boxes: { fontSize: 27, lineHeight: 38 }, forklift: { position: 'absolute', right: 50, bottom: 34, fontSize: 70, transform: [{ scaleX: -1 }] }, pallet: { position: 'absolute', right: 18, bottom: 33, fontSize: 37 }, route: { color: '#c1b7cb', backgroundColor: '#171520', paddingVertical: 8, textAlign: 'center', fontWeight: '900', fontSize: 11 },
  order: { backgroundColor: '#493714', borderRadius: 14, padding: 11, alignItems: 'center', borderWidth: 1, borderColor: '#d09828' }, orderSmall: { color: '#b9954a', fontSize: 8, fontWeight: '900' }, orderMain: { color: 'white', fontSize: 17, fontWeight: '900', marginTop: 2 }, controls: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, control: { width: '48%', flexGrow: 1, borderRadius: 14, backgroundColor: '#5d3d8e', paddingVertical: 12, alignItems: 'center' }, controlIcon: { fontSize: 22 }, controlLabel: { color: 'white', fontSize: 9, fontWeight: '900', marginTop: 2 }, pressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
});
