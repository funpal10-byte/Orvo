import { Pressable, StyleSheet, Text } from 'react-native';
import { color, fontFamily, radius } from '../theme/tokens';

type Props = {
  label: string;
  onRemove?: () => void;
  onPress?: () => void;
  accent?: boolean;
};

export function Chip({ label, onRemove, onPress, accent }: Props) {
  const content = (
    <>
      <Text style={[styles.text, accent && styles.accentText]}>{label}</Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
        >
          <Text style={styles.remove}>×</Text>
        </Pressable>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={styles.chip}
      >
        {content}
      </Pressable>
    );
  }

  return <Pressable style={styles.chip}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: color.goldLineStrong,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 40,
  },
  text: {
    fontFamily: fontFamily.mono,
    fontSize: 11,
    letterSpacing: 1.1,
    color: 'rgba(244,240,226,0.7)',
  },
  accentText: {
    color: color.goldText,
  },
  remove: {
    color: 'rgba(244,240,226,0.7)',
    fontSize: 13,
  },
});
