import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'legal'>;

const SUITE_NAMES = [
  'BrandCore™',
  'MarketPulse™',
  'GrowthGate™',
  'LearnLead™',
  'CampaignForge™',
  'ReputationShield™',
  'DemandEngine™',
  'PeopleVoice™',
  'MarTechMind™',
  'InsightEdge™',
  'PlatformOne™',
  'CodeCraft™',
  'EventSphere™',
  'BrandVault™',
  'CraftWorks™',
];

// TODO(ORVO Co.): registered office and grievance officer are still
// pending — LLPIN and GSTIN are filled in. All three are legally required
// before release; don't ship with any bracketed placeholder remaining.
export function LegalScreen({ navigation }: Props) {
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="About & legal" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <View style={styles.block}>
          <SectionLabel>Operator</SectionLabel>
          <Text style={styles.p}>
            This app is operated by ORVO Co., the trading name of Orvo Consulting LLP.
          </Text>
          <Text style={styles.meta}>LLPIN: ACP-8355</Text>
          <Text style={styles.meta}>GSTIN: 06AAJFO7243G1Z6</Text>
          <Text style={styles.meta}>Registered office: [pending]</Text>
        </View>

        <View style={styles.block}>
          <SectionLabel>Privacy</SectionLabel>
          <Text style={styles.p}>
            Personal data is processed under India's Digital Personal Data Protection Act, 2023.
            Data is collected only for the stated purpose of running and benchmarking your brand
            audit. You may withdraw consent, and request access, correction or erasure of your
            data, at any time by contacting the grievance officer below.
          </Text>
          <Text style={styles.meta}>Grievance officer: [pending]</Text>
        </View>

        <View style={styles.block}>
          <SectionLabel>Methodology</SectionLabel>
          <Text style={styles.p}>
            Audit scores are indicative, derived from observable proxies and self-reported
            inputs, and benchmarked against a peer set in your category. Scores are not a
            certification, valuation or professional advice.
          </Text>
        </View>

        <View style={styles.block}>
          <SectionLabel>Service marks</SectionLabel>
          <Text style={styles.p}>
            The following are proprietary service marks of ORVO Co. and are never abbreviated:
          </Text>
          <Text style={styles.suiteList}>{SUITE_NAMES.join(' · ')}</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { gap: 26, paddingBottom: 20 },
  block: { gap: 8 },
  p: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.note,
    lineHeight: 22,
    color: color.bodyText,
  },
  meta: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.dimValue,
    color: color.mutedText,
  },
  suiteList: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.dimValue,
    lineHeight: 20,
    color: color.goldText,
  },
});
