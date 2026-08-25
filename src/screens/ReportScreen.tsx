import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'report'>;

const ROWS: Array<[string, string]> = [
  ['Download PDF report', '2.1 MB'],
  ['Email to my team', '3 recipients'],
  ['Add to board pack', 'One slide'],
  ['Book a 90-minute review', 'With ORVO Co.'],
];

export function ReportScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <ScreenHeader title="Share the audit" onBack={() => navigation.navigate('gaps')} />
      <View style={styles.body}>
        <Text style={styles.note}>
          The export carries scores, peer comparison, the action list and the methodology note.
        </Text>
        {ROWS.map(([label, meta]) => (
          <View style={styles.row} key={label}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowMeta}>{meta}</Text>
          </View>
        ))}
        <View style={styles.cta}>
          <PrimaryButton
            label="Send to connect@orvoconsulting.com"
            onPress={() => navigation.navigate('home')}
          />
          <Pressable
            onPress={() => navigation.navigate('legal')}
            accessibilityRole="link"
            accessibilityLabel="Privacy policy"
          >
            <Text style={styles.dataNote}>
              Data is processed by Orvo Consulting LLP under its privacy policy. Nothing is
              shared with third parties or used for advertising.
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: 0 },
  note: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.home,
    lineHeight: 22,
    color: color.bodyText,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: color.goldLine,
  },
  rowLabel: { fontSize: fontSize.field, color: color.cream, fontFamily: fontFamily.body },
  rowMeta: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.delta,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(240,217,138,0.6)',
  },
  cta: { marginTop: 'auto', gap: 10 },
  dataNote: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.scoreLabel,
    lineHeight: 17,
    color: color.legalText,
  },
});
