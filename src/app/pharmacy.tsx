import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { CompactItemRoom } from '@/components/CompactItemRoom';
import { StatBar } from '@/components/StatBar';
import { PHARMACY_ITEMS, type ItemId } from '@/domain/items';
import { deriveAppearance } from '@/domain/mapoferAppearance';
import { useGameClock } from '@/hooks/useGameClock';
import { useMapoferStore } from '@/store/useMapoferStore';
import { colors } from '@/theme/colors';

export default function PharmacyScreen() {
  useGameClock();
  const router = useRouter();
  const state = useMapoferStore();
  const [feedback, setFeedback] = useState('Selecciona un objeto del inventario de Farmapofer.');
  const appearance = deriveAppearance(state, state.activeEffects);
  const activeUntil = useMemo(
    () => Math.max(0, ...state.activeEffects.map((effect) => effect.expiresAt)),
    [state.activeEffects],
  );
  const remainingMinutes = Math.max(0, Math.ceil((activeUntil - Date.now()) / 60_000));

  const handleUseItem = (itemId: ItemId) => {
    const item = PHARMACY_ITEMS.find((candidate) => candidate.id === itemId);
    if (!item) return;

    const result = state.useItem(itemId);
    setFeedback(
      result === 'used'
        ? `${item.name}: Mapofer se está poniendo fino.`
        : `No queda ${item.name.toLowerCase()}.`,
    );
  };

  if (!state.hasHydrated) {
    return <View style={styles.loading}><Text style={styles.text}>Abriendo Farmapofer…</Text></View>;
  }

  return (
    <>
      <Head><title>Farmapofer — POUFER</title></Head>
      <CompactItemRoom
        title="FARMAPOFER"
        phase="0.2"
        accent="#56e391"
        background={colors.background}
        appearance={appearance}
        items={PHARMACY_ITEMS}
        stats={(
          <>
            <StatBar icon="⚡" label="Energía" value={state.energy} />
            <StatBar icon="🫠" label="Alterado" value={state.altered} inverse />
            <StatBar icon="💦" label="Sudor" value={state.sweat} inverse />
            <StatBar icon="🌀" label="Ansia" value={state.craving} inverse />
          </>
        )}
        feedback={feedback}
        actionLabel="USAR"
        onBack={() => router.back()}
        onUse={handleUseItem}
        getQuantity={(itemId) => state.inventory[itemId]}
        statusExtra={remainingMinutes > 0 ? `~${remainingMinutes} min` : undefined}
        footer={<Text style={styles.disclaimer}>Objetos ficticios de videojuego · sin productos, dosis ni efectos reales.</Text>}
      />
    </>
  );
}

const styles = {
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center' as const, justifyContent: 'center' as const },
  text: { color: colors.text },
  disclaimer: { color: '#796a8f', textAlign: 'center' as const, fontSize: 8, fontWeight: '700' as const },
};
