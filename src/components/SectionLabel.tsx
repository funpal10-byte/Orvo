import { StyleSheet, Text } from 'react-native';
import { color, fontFamily } from '../theme/tokens';

export function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.mono,
    fontSize: 10.5,
    letterSpacing: 2.3,
    textTransform: 'uppercase',
    color: color.gold,
  },
});
