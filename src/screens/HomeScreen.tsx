import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GhostButton } from '../components/GhostButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScoreRing } from '../components/ScoreRing';
import { SectionLabel } from '../components/SectionLabel';
import { TabBar, type TabKey } from '../components/TabBar';
import { useAuditStore } from '../state/auditStore';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'home'>;

export function HomeScreen({ navigation }: Props) {
  const audit = useAuditStore((s) => s.audit);
  const scoringResult = useAuditStore((s) => s.scoringResult);
  const startNewAudit = useAuditStore((s) => s.startNewAudit);
  const previousScoreForBrand = useAuditStore((s) => s.previousScoreForBrand);

  const brandName = audit.brand || 'Your brand';
  const overallScore = scoringResult?.overallScore ?? 0;
  const previous = previousScoreForBrand(audit.brand);
  const delta = previous ? overallScore - previous.overallScore : null;
  const priorityGaps = (scoringResult?.gaps ?? []).slice(0, 2);

  const onNavigateTab = (key: TabKey) => {
    if (key === 'home') return;
    if (key === 'assessment') {
      navigation.navigate(audit.status === 'in-progress' ? 'assessment' : 'setup');
      return;
    }
    navigation.navigate(key);
  };

  return (
    <ScreenContainer footer={<TabBar active="home" onNavigate={onNavigateTab} />}>
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <SectionLabel>Original Voice Audit</SectionLabel>
          <Text style={styles.brand}>{brandName}</Text>
        </View>
        <Image
          source={require('../../assets/brand/orvo-enso-gold.png')}
          style={styles.enso}
          resizeMode="contain"
          accessibilityLabel=""
        />
      </View>

      <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.body}>
        {scoringResult ? (
          <View style={styles.card}>
            <ScoreRing score={overallScore} peerMedian={scoringResult.peerMedian} />
            <View style={styles.cardText}>
              <SectionLabel>Current score</SectionLabel>
              <Text style={styles.cardBody}>
                {scoringResult.quartile === 'bottom' ? 'Bottom quartile' : scoringResult.quartile}{' '}
                in {audit.category || 'your category'}.
              </Text>
              {delta !== null ? (
                <Text style={[styles.delta, delta < 0 && styles.deltaNeg]}>
                  {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)} PTS
                </Text>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyText}>
              Run your first audit to see a score, peer benchmark and action list here.
            </Text>
          </View>
        )}

        {priorityGaps.length > 0 ? (
          <View style={styles.gapsWrap}>
            <SectionLabel>Priority actions</SectionLabel>
            {priorityGaps.map((g) => (
              <View style={styles.gapRow} key={g.rank}>
                <Text style={styles.gapRank}>{g.rank}</Text>
                <View style={styles.gapText}>
                  <Text style={styles.gapTitle}>{g.title}</Text>
                  <Text style={styles.gapMeta}>{g.effortImpact}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.btns}>
          <PrimaryButton
            label="Run a new audit"
            onPress={() => {
              startNewAudit();
              navigation.navigate('setup');
            }}
          />
          <GhostButton
            label="View full results"
            onPress={() => navigation.navigate(scoringResult ? 'results' : 'setup')}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 16,
  },
  topLeft: { gap: 5 },
  brand: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.h2,
    letterSpacing: -0.3,
    color: color.cream,
  },
  enso: { height: 38, width: 38, opacity: 0.85 },
  bodyScroll: { flex: 1 },
  body: { gap: 14, paddingBottom: 8 },
  card: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: 'rgba(240,217,138,0.18)',
    borderTopWidth: 3,
    borderTopColor: color.gold,
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  cardText: { gap: 8, flexShrink: 1 },
  cardBody: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.note,
    lineHeight: 21,
    color: color.bodyText,
  },
  emptyText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.note,
    lineHeight: 21,
    color: color.bodyText,
    flexShrink: 1,
  },
  delta: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.delta,
    letterSpacing: 1.5,
    color: color.positive,
  },
  deltaNeg: { color: color.attention },
  gapsWrap: { gap: 10 },
  gapRow: {
    backgroundColor: color.surfaceAlt,
    borderWidth: 1,
    borderColor: 'rgba(240,217,138,0.14)',
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  gapRank: { fontFamily: fontFamily.mono, fontSize: fontSize.rank, color: color.gold },
  gapText: { gap: 4, flex: 1 },
  gapTitle: { fontSize: fontSize.field, fontFamily: fontFamily.bodyMedium, color: color.cream },
  gapMeta: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.gapMeta,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.mutedText,
  },
  btns: { gap: 10, paddingTop: 4 },
});
