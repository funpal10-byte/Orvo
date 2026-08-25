import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionLabel } from '../components/SectionLabel';
import { TabBar, type TabKey } from '../components/TabBar';
import { useAuditStore } from '../state/auditStore';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'gaps'>;

export function GapsScreen({ navigation }: Props) {
  const audit = useAuditStore((s) => s.audit);
  const scoringResult = useAuditStore((s) => s.scoringResult);
  const expandedGapRank = useAuditStore((s) => s.expandedGapRank);
  const toggleGapExpanded = useAuditStore((s) => s.toggleGapExpanded);

  const onNavigateTab = (key: TabKey) => {
    if (key === 'gaps') return;
    if (key === 'assessment') {
      navigation.navigate(audit.status === 'in-progress' ? 'assessment' : 'setup');
      return;
    }
    navigation.navigate(key);
  };

  const gaps = scoringResult?.gaps ?? [];

  return (
    <ScreenContainer footer={<TabBar active="gaps" onNavigate={onNavigateTab} />}>
      <View style={styles.top}>
        <SectionLabel>Prioritised by impact ÷ effort</SectionLabel>
        <Text style={styles.title}>
          {gaps.length > 0 ? `${gaps.length} things to fix` : 'No gaps yet'}
        </Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {gaps.map((g) => {
          const open = expandedGapRank === g.rank;
          return (
            <Pressable
              key={g.rank}
              onPress={() => toggleGapExpanded(g.rank)}
              accessibilityRole="button"
              accessibilityLabel={g.title}
              accessibilityState={{ expanded: open }}
              style={[styles.row, open ? styles.rowOpen : styles.rowClosed]}
            >
              <View style={styles.rowHead}>
                <Text style={styles.rank}>{g.rank}</Text>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{g.title}</Text>
                  <Text style={styles.rowMeta}>{g.effortImpact}</Text>
                </View>
                <Text style={styles.affordance}>{open ? '−' : '+'}</Text>
              </View>
              {open ? (
                <View style={styles.expanded}>
                  <Text style={styles.expandedBody}>{g.body}</Text>
                  <View style={styles.suiteRow}>
                    <View style={styles.suitePill}>
                      <Text style={styles.suitePillText}>{g.suiteName}</Text>
                    </View>
                    <Text style={styles.canRun}>ORVO Co. can run this</Text>
                  </View>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.cta}>
        <PrimaryButton label="Share with ORVO Co." onPress={() => navigation.navigate('report')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: { gap: 6, paddingBottom: 14 },
  title: { fontFamily: fontFamily.displaySemibold, fontSize: fontSize.h3, color: color.cream },
  list: { flex: 1 },
  listContent: { gap: 10 },
  row: {
    borderWidth: 1,
    borderLeftWidth: 2,
    padding: 15,
    gap: 10,
  },
  rowClosed: {
    backgroundColor: color.surfaceAlt,
    borderColor: 'rgba(240,217,138,0.14)',
    borderLeftColor: color.goldLineStrong,
  },
  rowOpen: {
    backgroundColor: color.surface,
    borderColor: 'rgba(240,217,138,0.32)',
    borderLeftColor: color.gold,
  },
  rowHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  rank: { fontFamily: fontFamily.mono, fontSize: fontSize.rank, color: color.gold, paddingTop: 2 },
  rowText: { gap: 4, flex: 1 },
  rowTitle: {
    fontSize: fontSize.gapTitle,
    fontFamily: fontFamily.bodyMedium,
    lineHeight: 20,
    color: color.cream,
  },
  rowMeta: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.gapMeta,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.mutedText,
  },
  affordance: { color: 'rgba(240,217,138,0.6)', fontSize: fontSize.note },
  expanded: { gap: 12, paddingTop: 4 },
  expandedBody: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.note,
    lineHeight: 22,
    color: 'rgba(244,240,226,0.68)',
  },
  suiteRow: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  suitePill: {
    borderWidth: 1,
    borderColor: color.goldLineStrong,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  suitePillText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.dimValue,
    letterSpacing: 1.2,
    color: color.goldText,
  },
  canRun: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.dimValue,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.mutedText,
  },
  cta: { paddingTop: 12 },
});
