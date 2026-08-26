import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { SectionLabel } from '../components/SectionLabel';
import { isAnonymousSession, sendMagicLink } from '../lib/supabase';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'report'>;

const ROWS: Array<[string, string]> = [
  ['Download PDF report', '2.1 MB'],
  ['Email to my team', '3 recipients'],
  ['Add to board pack', 'One slide'],
  ['Book a 90-minute review', 'With ORVO Co.'],
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per the handoff: "account creation is requested at export, after value
// has already been demonstrated." Anonymous sessions get this inline
// prompt; already-linked accounts don't see it.
function SaveAuditPrompt() {
  const [isAnon, setIsAnon] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isAnonymousSession()
      .then(setIsAnon)
      .catch(() => setIsAnon(null));
  }, []);

  if (!isAnon) return null;

  const valid = EMAIL_RE.test(email.trim());

  const onSave = async () => {
    if (!valid || sending) return;
    setSending(true);
    setError(null);
    try {
      await sendMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the link. Try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.saveCard}>
      <SectionLabel>Save this audit</SectionLabel>
      {sent ? (
        <Text style={styles.saveBody}>
          Check {email.trim()} for a link — confirming it attaches this audit to your account.
        </Text>
      ) : (
        <>
          <Text style={styles.saveBody}>
            Create an account so this audit (and future ones) aren't tied to just this device.
          </Text>
          <View style={styles.saveRow}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              placeholderTextColor="rgba(244,240,226,0.35)"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.saveInput}
              accessibilityLabel="Email address"
            />
          </View>
          {error ? <Text style={styles.saveError}>{error}</Text> : null}
          <PrimaryButton
            label={sending ? 'Sending…' : 'Save & send link'}
            disabled={!valid || sending}
            onPress={onSave}
          />
        </>
      )}
    </View>
  );
}

export function ReportScreen({ navigation }: Props) {
  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Share the audit" onBack={() => navigation.navigate('gaps')} />
      <View style={styles.body}>
        <Text style={styles.note}>
          The export carries scores, peer comparison, the action list and the methodology note.
        </Text>
        <SaveAuditPrompt />
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
  body: { flex: 1, gap: 0, paddingBottom: 8 },
  note: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.home,
    lineHeight: 22,
    color: color.bodyText,
    paddingBottom: 8,
  },
  saveCard: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.goldLine,
    padding: 16,
    gap: 10,
    marginBottom: 8,
  },
  saveBody: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.note,
    lineHeight: 20,
    color: color.bodyText,
  },
  saveRow: { flexDirection: 'row' },
  saveInput: {
    flex: 1,
    backgroundColor: color.surfaceAlt,
    borderWidth: 1,
    borderColor: 'rgba(240,217,138,0.2)',
    padding: 12,
    minHeight: 44,
    fontSize: fontSize.note,
    color: color.cream,
    fontFamily: fontFamily.body,
  },
  saveError: {
    fontFamily: fontFamily.mono,
    fontSize: 11,
    color: color.attention,
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
  cta: { marginTop: 'auto', gap: 10, paddingTop: 12 },
  dataNote: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.scoreLabel,
    lineHeight: 17,
    color: color.legalText,
  },
});
