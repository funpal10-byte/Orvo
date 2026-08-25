import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { GhostButton } from '../components/GhostButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAuditStore } from '../state/auditStore';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  const startNewAudit = useAuditStore((s) => s.startNewAudit);

  return (
    <ScreenContainer>
      <View style={styles.body}>
        <Image
          source={require('../../assets/brand/orvo-logo-tm.png')}
          style={styles.logo}
          accessibilityLabel="ORVO Co."
          resizeMode="contain"
        />
        <Text style={styles.h1}>Find out what your brand is actually saying.</Text>
        <Text style={styles.p}>
          A 12-minute guided audit across six dimensions. Scored, benchmarked against your
          category, and returned as a prioritised action list — not a grade.
        </Text>
        <View style={styles.btns}>
          <PrimaryButton
            label="Start an audit"
            onPress={() => {
              startNewAudit();
              navigation.navigate('setup');
            }}
          />
          <GhostButton label="Sign in" onPress={() => navigation.navigate('home')} />
        </View>
      </View>
      <Pressable
        onPress={() => navigation.navigate('legal')}
        accessibilityRole="link"
        accessibilityLabel="Terms of use and privacy policy"
      >
        <Text style={styles.legal}>
          By continuing you accept the terms of use and privacy policy of Orvo Consulting LLP,
          trading as ORVO Co. Audit outputs are indicative and do not constitute professional
          advice.
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 22,
  },
  logo: {
    height: 92,
    aspectRatio: 422 / 511,
    alignSelf: 'flex-start',
  },
  h1: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.h1,
    lineHeight: 36,
    letterSpacing: -0.6,
    color: color.cream,
  },
  p: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.body,
    lineHeight: 25,
    color: color.bodyText,
  },
  btns: {
    gap: 10,
    paddingTop: 6,
  },
  legal: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.scoreLabel,
    lineHeight: 17,
    color: color.legalText,
    paddingTop: 14,
  },
});
