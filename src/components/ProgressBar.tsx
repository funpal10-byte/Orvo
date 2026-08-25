import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import { color } from '../theme/tokens';

export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={styles.track}>
      <LinearGradient
        colors={color.gradientBar}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.fill, { width: `${clamped}%` }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: 'rgba(240,217,138,0.12)',
  },
  fill: {
    height: '100%',
  },
});
