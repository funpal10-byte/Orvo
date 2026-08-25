import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { peerCountForCategory } from '../state/scoring';
import { useAuditStore } from '../state/auditStore';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'scoring'>;

const MAX_WAIT_MS = 6000;

export function ScoringScreen({ navigation }: Props) {
  const audit = useAuditStore((s) => s.audit);
  const scoringStatus = useAuditStore((s) => s.scoringStatus);
  const runScoringForAudit = useAuditStore((s) => s.runScoringForAudit);

  const spin = useRef(new Animated.Value(0)).current;
  const peerCount = peerCountForCategory(audit.category);
  const navigatedRef = useRef(false);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  useEffect(() => {
    runScoringForAudit();
    const cap = setTimeout(() => {
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        navigation.replace('results');
      }
    }, MAX_WAIT_MS);
    return () => clearTimeout(cap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scoringStatus === 'done' && !navigatedRef.current) {
      navigatedRef.current = true;
      navigation.replace('results');
    }
  }, [scoringStatus, navigation]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
        <Text style={styles.headline}>Scoring against {peerCount} audits in your category</Text>
        <View style={styles.steps}>
          <Text style={styles.stepDone}>✓ Touchpoint consistency read</Text>
          <Text style={styles.stepDone}>✓ Search and answer-engine visibility checked</Text>
          <Text style={styles.stepActive}>… Benchmarking against peer set</Text>
        </View>
        <View style={styles.cta}>
          <PrimaryButton
            label="See results"
            onPress={() => {
              navigatedRef.current = true;
              navigation.replace('results');
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },
  spinner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: 'rgba(240,217,138,0.15)',
    borderTopColor: color.gold,
  },
  headline: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.h2,
    lineHeight: 29,
    textAlign: 'center',
    color: color.cream,
  },
  steps: { gap: 9, alignItems: 'center' },
  stepDone: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.note,
    color: 'rgba(244,240,226,0.55)',
  },
  stepActive: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.note,
    color: color.goldText,
  },
  cta: { paddingTop: 10, width: '100%' },
});
