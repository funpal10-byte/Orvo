import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text } from 'react-native';
import { color, fontFamily, fontSize, minTouch } from '../theme/tokens';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

export function PrimaryButton({ label, onPress, disabled, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.wrap, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <LinearGradient
        colors={color.gradientPrimary}
        locations={color.gradientPrimaryLocations}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    minHeight: minTouch + 6,
  },
  gradient: {
    minHeight: 50,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  text: {
    color: '#0A0B09',
    fontFamily: fontFamily.monoMedium,
    fontSize: 12,
    letterSpacing: 1.9,
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.4,
  },
});
