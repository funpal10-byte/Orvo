import { Pressable, StyleSheet, Text } from 'react-native';
import { color, fontFamily, minTouch } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  testID?: string;
};

export function GhostButton({ label, onPress, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minHeight: minTouch + 4,
    borderWidth: 1,
    borderColor: color.goldLineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 22,
    backgroundColor: 'transparent',
  },
  pressed: {
    backgroundColor: 'rgba(240,217,138,0.08)',
  },
  text: {
    color: color.goldText,
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
  },
});
