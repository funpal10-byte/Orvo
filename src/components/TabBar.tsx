import { Pressable, StyleSheet, Text, View } from 'react-native';
import { color, fontFamily } from '../theme/tokens';

export type TabKey = 'home' | 'assessment' | 'results' | 'gaps';

const TABS: Array<{ label: string; key: TabKey }> = [
  { label: 'Home', key: 'home' },
  { label: 'Audit', key: 'assessment' },
  { label: 'Results', key: 'results' },
  { label: 'Actions', key: 'gaps' },
];

type Props = {
  active: TabKey;
  onNavigate: (key: TabKey) => void;
};

export function TabBar({ active, onNavigate }: Props) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onNavigate(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: color.goldLine,
    marginTop: 'auto',
    backgroundColor: color.canvas,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: 'transparent',
  },
  tabActive: {
    borderTopColor: color.gold,
  },
  label: {
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: color.mutedText,
  },
  labelActive: {
    color: color.goldBright,
  },
});
