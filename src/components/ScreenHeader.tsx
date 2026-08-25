import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, fontFamily, fontSize } from '../theme/tokens';

type Props = {
  title: string;
  onBack?: () => void;
};

export function ScreenHeader({ title, onBack }: Props) {
  return (
    <View style={styles.row}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}
        >
          <Text style={styles.backGlyph}>←</Text>
        </Pressable>
      ) : null}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
    paddingBottom: 14,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: color.goldLineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: {
    backgroundColor: 'rgba(240,217,138,0.08)',
  },
  backGlyph: {
    color: color.goldText,
    fontSize: 16,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.header,
    color: color.cream,
    letterSpacing: -0.2,
  },
});
