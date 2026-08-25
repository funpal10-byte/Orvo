import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { color, fontFamily } from '../theme/tokens';

type Props = {
  score: number;
  size?: number;
  peerMedian?: number;
};

export function ScoreRing({ score, size = 148, peerMedian }: Props) {
  const strokeWidth = size * 0.081; // 12px at 148px reference
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score)) / 100;
  const dashOffset = circumference * (1 - progress);
  const numeralSize = size * 0.31;
  const labelSize = size * 0.064;

  const a11yLabel =
    peerMedian !== undefined
      ? `Score ${score} of 100, peer median ${peerMedian}`
      : `Score ${score} of 100`;

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={a11yLabel}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(240,217,138,0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color.gold}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="butt"
          fill="none"
          rotation={-90}
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[styles.numeral, { fontSize: numeralSize }]}>{Math.round(score)}</Text>
          <Text style={[styles.label, { fontSize: labelSize }]}>OF 100</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  numeral: {
    fontFamily: fontFamily.displaySemibold,
    color: color.cream,
    lineHeight: undefined,
  },
  label: {
    fontFamily: fontFamily.mono,
    letterSpacing: 1.6,
    color: 'rgba(244,240,226,0.45)',
  },
});
