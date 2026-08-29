import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { color, fontFamily } from '../theme/tokens';
import type { DimensionResult } from '../state/types';

export function DimensionBar({
  dimension,
  researched,
}: {
  dimension: DimensionResult;
  /** True when live research (not just self-report) contributed to this dimension's score. */
  researched?: boolean;
}) {
  const { key, score, peerMedian, note } = dimension;
  const below = score < peerMedian;
  const fillPct = Math.max(0, Math.min(100, score));
  const peerPct = Math.max(0, Math.min(100, peerMedian));
  const basisLabel = researched ? 'Your answers + live research' : 'Your answers only';

  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`${key}: ${score} of 100, peer median ${peerMedian}. Basis: ${basisLabel}.`}
    >
      <View style={styles.topRow}>
        <Text style={styles.name}>{key}</Text>
        <Text style={[styles.value, { color: below ? color.attention : color.positive }]}>
          {score} / peer {peerMedian}
        </Text>
      </View>
      <View style={styles.track}>
        <LinearGradient
          colors={color.gradientBar}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[styles.fill, { width: `${fillPct}%` }]}
        />
        <View style={[styles.peerMarker, { left: `${peerPct}%` }]} />
      </View>
      <Text style={styles.note}>{note}</Text>
      <Text style={[styles.basis, researched && styles.basisResearched]}>{basisLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 10,
  },
  name: { fontSize: 13.5, color: 'rgba(244,240,226,0.82)', fontFamily: fontFamily.body },
  value: { fontFamily: fontFamily.mono, fontSize: 12 },
  track: {
    height: 8,
    backgroundColor: 'rgba(240,217,138,0.1)',
    position: 'relative',
  },
  fill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  peerMarker: {
    position: 'absolute',
    top: -3,
    bottom: -3,
    width: 2,
    backgroundColor: 'rgba(244,240,226,0.55)',
  },
  note: { fontSize: 12, color: color.mutedText, fontFamily: fontFamily.body },
  basis: {
    fontFamily: fontFamily.mono,
    fontSize: 9.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(244,240,226,0.3)',
    flexShrink: 0,
  },
  basisResearched: { color: 'rgba(240,217,138,0.6)' },
});
