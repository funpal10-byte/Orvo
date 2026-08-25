import { StyleSheet, Text, TextInput, View } from 'react-native';
import { color, fontFamily } from '../theme/tokens';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function FieldInput({ label, value, onChangeText, placeholder }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(244,240,226,0.35)"
        style={styles.input}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 7 },
  label: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(244,240,226,0.45)',
  },
  input: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: 'rgba(240,217,138,0.2)',
    padding: 14,
    minHeight: 48,
    fontSize: 15,
    color: color.cream,
    fontFamily: fontFamily.body,
  },
});
