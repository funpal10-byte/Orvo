import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { DimensionBar } from '../components/DimensionBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScoreRing } from '../components/ScoreRing';
import { SectionLabel } from '../components/SectionLabel';
import { TabBar, type TabKey } from '../components/TabBar';
import { useAuditStore } from '../state/auditStore';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'results'>;

const QUARTILE_LABEL: Record<string, string> = {
  top: 'Top quartile',
  'upper-mid': 'Upper quartile',
  'lower-mid': 'Lower quartile',
  bottom: 'Bottom quartile',
};

export function ResultsScreen({ navigation }: Props) {
  const audit = useAuditStore((s) => s.audit);
  const scoringResult = useAuditStore((s) => s.scoringResult);

  const onNavigateTab = (key: TabKey) => {
    if (key === 'results') return;
    if (key === 'assessment') {
      navigation.navigate(audit.status === 'in-progress' ? 'assessment' : 'setup');
      return;
    }
    navigation.navigate(key);
  };

  if (!scoringResult) {
    return (
      <ScreenContainer>
        <Text style={styles.emptyText}>No audit results yet. Run an audit from Home first.</Text>
        <PrimaryButton label="Go home" onPress={() => navigation.navigate('home')} />
      </ScreenContainer>
    );
  }

  const dateLabel = new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  const researchedCount = scoringResult.researchApplied.length;
  const basisSummary =
    researchedCount > 0
      ? `Basis: your answers, blended with live research on ${researchedCount} of 6 dimensions.`
      : 'Basis: your answers only — no live research was used for this audit.';

  return (
    <ScreenContainer footer={<TabBar active="results" onNavigate={onNavigateTab} />}>
      <View style={styles.top}>
        <View style={styles.topLeft}>
          <SectionLabel>{`Audit result · ${dateLabel}`}</SectionLabel>
          <Text style={styles.verdict}>{QUARTILE_LABEL[scoringResult.quartile]}</Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('report')}
          accessibilityRole="button"
          accessibilityLabel="Export"
          style={styles.exportBtn}
        >
          <Text style={styles.exportText}>Export</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <ScoreRing score={scoringResult.overallScore} peerMedian={scoringResult.peerMedian} />
          <View style={styles.cardText}>
            <Text style={styles.peerLabel}>Peer median {scoringResult.peerMedian}</Text>
            <Text style={styles.verdictBody}>
              {scoringResult.overallScore < scoringResult.peerMedian
                ? 'You are trusted but undifferentiated: strong internally, weak where buyers actually look.'
                : 'You are ahead of peer benchmark, with room to widen the gap further.'}
            </Text>
          </View>
        </View>

        <View style={styles.dims}>
          <View style={styles.dimsHead}>
            <SectionLabel>Six dimensions</SectionLabel>
            <Text style={styles.basisSummary}>{basisSummary}</Text>
          </View>
          {scoringResult.dimensions.map((d) => (
            <DimensionBar
              key={d.key}
              dimension={d}
              researched={scoringResult.researchApplied.includes(d.key)}
            />
          ))}
        </View>

        <View style={styles.cta}>
          <PrimaryButton label="See the action list" onPress={() => navigation.navigate('gaps')} />
          <Pressable
            onPress={() => navigation.navigate('legal')}
            accessibilityRole="link"
            accessibilityLabel="Methodology"
          >
            <Text style={styles.disclaimer}>
              Scores are indicative, based on observable proxies and self-reported inputs.
              Methodology published in-app.
            </Text>
          </Pressable>
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
    paddingBottom: 14,
  },
  topLeft: { gap: 5 },
  verdict: { fontFamily: fontFamily.displaySemibold, fontSize: fontSize.h3, color: color.cream },
  exportBtn: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: color.goldLineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportText: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.eyebrow,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: color.goldText,
  },
  bodyScroll: { flex: 1 },
  body: { gap: 18, paddingBottom: 8 },
  card: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.goldLine,
    padding: 16,
  },
  cardText: { gap: 7, flex: 1 },
  peerLabel: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.eyebrow,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(240,217,138,0.6)',
  },
  verdictBody: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.dimLabel,
    lineHeight: 20,
    color: color.bodyText,
  },
  dims: { gap: 16 },
  dimsHead: { gap: 5 },
  basisSummary: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 17,
    color: color.mutedText,
  },
  cta: { gap: 10, paddingTop: 4 },
  disclaimer: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.scoreLabel,
    lineHeight: 17,
    color: color.legalText,
  },
  emptyText: {
    fontFamily: fontFamily.body,
    color: color.bodyText,
    fontSize: fontSize.note,
    marginBottom: 16,
  },
});
