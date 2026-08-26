import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { GhostButton } from '../components/GhostButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { sendMagicLink, signInWithGoogle } from '../lib/supabase';
import { color, fontFamily, fontSize } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'auth'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const valid = EMAIL_RE.test(email.trim());

  const onSend = async () => {
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

  const onGoogle = async () => {
    if (googleBusy) return;
    setGoogleBusy(true);
    setGoogleError(null);
    try {
      await signInWithGoogle();
      navigation.navigate('home');
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google sign-in failed. Try again.');
    } finally {
      setGoogleBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Sign in" onBack={() => navigation.navigate('welcome')} />
      <View style={styles.body}>
        {sent ? (
          <View style={styles.confirm}>
            <Text style={styles.h1}>Check your email</Text>
            <Text style={styles.p}>
              We sent a sign-in link to {email.trim()}. Open it on this device to finish signing
              in.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.h1}>Sign in</Text>
            <Text style={styles.p}>
              If you already have an in-progress audit on this device, it's kept and attached to
              your account either way.
            </Text>

            <GhostButton
              label={googleBusy ? 'Opening Google…' : 'Continue with Google'}
              onPress={onGoogle}
            />
            {googleError ? <Text style={styles.error}>{googleError}</Text> : null}

            <Text style={styles.divider}>or</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              placeholderTextColor="rgba(244,240,226,0.35)"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
              accessibilityLabel="Email address"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton
              label={sending ? 'Sending…' : 'Send sign-in link'}
              disabled={!valid || sending}
              onPress={onSend}
            />
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, gap: 14, paddingTop: 8 },
  confirm: { gap: 12, paddingTop: 20 },
  h1: {
    fontFamily: fontFamily.displaySemibold,
    fontSize: fontSize.h3,
    color: color.cream,
  },
  p: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.note,
    lineHeight: 22,
    color: color.bodyText,
  },
  divider: {
    alignSelf: 'center',
    fontFamily: fontFamily.mono,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: color.mutedText,
  },
  input: {
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: 'rgba(240,217,138,0.2)',
    padding: 14,
    minHeight: 48,
    fontSize: fontSize.field,
    color: color.cream,
    fontFamily: fontFamily.body,
  },
  error: {
    fontFamily: fontFamily.mono,
    fontSize: 11,
    color: color.attention,
  },
});
