import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CompactItemRoom } from '@/components/CompactItemRoom';
import { StatBar } from '@/components/StatBar';
import { SMOKE_ITEMS, type ItemId } from '@/domain/items';
import { deriveAppearance } from '@/domain/mapoferAppearance';
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
    setFeedback(
      result === 'used'
        ? item.id === 'joint'
          ? 'Ojos rojos. Se avecina una visita al kebab.'
          : 'Mapofer echa una nube bastante lamentable.'
        : `No queda ${item.name.toLowerCase()}.`,
    );
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Buscando el mechero…</Text></View>;
  }

  return (
    <>
      <Head><title>Fumar — POUFER</title></Head>
      <CompactItemRoom
        title="FUMAR"
        phase="0.4"
        accent="#72deb0"
        background="#071312"
        appearance={appearance}
        items={SMOKE_ITEMS}
        stats={(
          <>
            <StatBar icon="🍔" label="Hambre" value={state.hunger} />
            <StatBar icon="😐" label="Aburr." value={state.boredom} inverse />
            <StatBar icon="🧠" label="Ansia" value={state.craving} inverse />
            <StatBar icon="🚿" label="Higiene" value={state.hygiene} />
          </>
        )}
        feedback={feedback}
        actionLabel="ENCENDER"
        onBack={() => router.back()}
        onUse={smoke}
        getQuantity={(itemId) => state.inventory[itemId]}
        footer={<Text style={styles.chain}>PORRO → OJOS ROJOS → HAMBRE → KEBAB · representación ficticia</Text>}
      />
    </>
  );
}

const styles = {
  loading: { flex: 1, backgroundColor: '#071312', alignItems: 'center' as const, justifyContent: 'center' as const },
  text: { color: colors.text },
  chain: { color: '#bde8d2', textAlign: 'center' as const, fontSize: 8, fontWeight: '900' as const },
};
