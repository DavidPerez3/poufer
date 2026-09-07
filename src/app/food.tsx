import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CompactItemRoom } from '@/components/CompactItemRoom';
import { StatBar } from '@/components/StatBar';
import { FOOD_ITEMS, type ItemId } from '@/domain/items';
import { deriveAppearance } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function FoodScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);
  const [feedback, setFeedback] = useState('Elige un plato del inventario. Uno por pantalla y sin scroll.');

  const eat = (itemId: ItemId) => {
    const item = FOOD_ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const result = state.useItem(itemId);
    setFeedback(result === 'used' ? `${item.name}: desaparece en tiempo récord.` : `No queda ${item.name.toLowerCase()}.`);
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Abriendo la nevera…</Text></View>;
  }

  return (
    <>
      <Head><title>Comida — POUFER</title></Head>
      <CompactItemRoom
        title="COMIDA"
        phase="0.5"
        accent="#ffbd37"
        background="#160f05"
        appearance={appearance}
        items={FOOD_ITEMS}
        stats={(
          <>
            <StatBar icon="🍔" label="Hambre" value={state.hunger} />
            <StatBar icon="🚽" label="Intest." value={state.bowel} inverse />
            <StatBar icon="💧" label="Vejiga" value={state.bladder} inverse />
            <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
          </>
        )}
        feedback={feedback}
        actionLabel="COMER"
        onBack={() => router.back()}
        onUse={eat}
        getQuantity={(itemId) => state.inventory[itemId]}
        footer={<Text style={styles.disclaimer}>Comer llena a Mapofer, pero prepara futuras visitas al baño.</Text>}
      />
    </>
  );
}

const styles = {
  loading: { flex: 1, backgroundColor: '#160f05', alignItems: 'center' as const, justifyContent: 'center' as const },
  text: { color: colors.text },
  disclaimer: { color: '#9a875b', textAlign: 'center' as const, fontSize: 8, fontWeight: '700' as const },
};
