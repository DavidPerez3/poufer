import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type Props = {
  icon: string;
  label: string;
  value: number;
  inverse?: boolean;
};

export function StatBar({ icon, label, value, inverse = false }: Props) {
  const normalized = Math.round(Math.max(0, Math.min(100, value)));
  const goodValue = inverse ? 100 - normalized : normalized;
  const fillColor =
    goodValue < 25 ? colors.danger : goodValue < 50 ? colors.warning : colors.success;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>{icon} {label}</Text>
        <Text style={styles.value}>{normalized}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${normalized}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.surfaceSoft,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: colors.track,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
