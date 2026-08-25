import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { color } from '../theme/tokens';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Rendered outside the scrollable area, pinned to the bottom (e.g. TabBar). */
  footer?: ReactNode;
};

// Content padding follows the handoff (22px horizontal, 30px bottom) with the
// top pad derived from the device safe area instead of a hardcoded 64px,
// since real devices vary (the prototype assumed a fixed iPhone 14/15 frame).
// `footer` sits outside the ScrollView so a pinned TabBar never fights the
// scrollable body for layout space (marginTop: 'auto' inside a ScrollView's
// content container does not reliably pin to the viewport bottom).
export function ScreenContainer({ children, scroll, footer }: Props) {
  const insets = useSafeAreaInsets();
  const paddingBottom = Math.max(insets.bottom, 14) + 16;

  const content = scroll ? (
    <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
      {children}
    </ScrollView>
  ) : (
    <View style={styles.nonScrollBody}>{children}</View>
  );

  return (
    <View style={[styles.base, { paddingTop: insets.top + 20, paddingBottom: footer ? 0 : paddingBottom }]}>
      {content}
      {footer ? <View style={{ paddingBottom }}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  base: {
    flex: 1,
    backgroundColor: color.canvas,
    paddingHorizontal: 22,
  },
  scrollContent: { flexGrow: 1 },
  nonScrollBody: { flex: 1 },
});
