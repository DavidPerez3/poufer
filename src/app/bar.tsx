import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CompactItemRoom } from '@/components/CompactItemRoom';
import { StatBar } from '@/components/StatBar';
import { BAR_ITEMS, type ItemId } from '@/domain/items';
import { deriveAppearance } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function BarScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const appearance = deriveAppearance(state, state.activeEffects);
  const [feedback, setFeedback] = useState('Selecciona una consumición del inventario.');

  const drink = (itemId: ItemId) => {
    const item = BAR_ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) return;
    const result = state.useItem(itemId);
    setFeedback(result === 'used' ? `${item.name}: una y nos vamos.` : `No queda ${item.name.toLowerCase()}.`);
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Abriendo Barpofer…</Text></View>;
  }

  return (
    <>
      <Head><title>Barpofer — POUFER</title></Head>
      <CompactItemRoom
        title="BARPOFER"
        phase="0.3"
        accent="#ff6f87"
        background="#120718"
        appearance={appearance}
        items={BAR_ITEMS}
        stats={(
          <>
            <StatBar icon="🍻" label="Borrach." value={state.drunkenness} inverse />
            <StatBar icon="🤕" label="Resaca" value={state.hangover} inverse />
            <StatBar icon="😴" label="Sueño" value={state.sleep} />
            <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
          </>
        )}
        feedback={feedback}
        actionLabel="PEDIR"
        onBack={() => router.back()}
        onUse={drink}
        getQuantity={(itemId) => state.inventory[itemId]}
        footer={<Text style={styles.disclaimer}>Mecánica ficticia y paródica · sin efectos ni consumos reales.</Text>}
      />
    </>
  );
}

const styles = {
  loading: { flex: 1, backgroundColor: '#120718', alignItems: 'center' as const, justifyContent: 'center' as const },
  text: { color: colors.text },
  disclaimer: { color: '#796273', textAlign: 'center' as const, fontSize: 8, fontWeight: '700' as const },
};
