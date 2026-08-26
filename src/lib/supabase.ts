import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createClient } from '@supabase/supabase-js';

// Lets the in-app browser sheet close itself and hand control back to the
// app once Google redirects to the callback URL — standard Expo boilerplate
// for any WebBrowser-based OAuth flow.
WebBrowser.maybeCompleteAuthSession();

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl = extra.supabaseUrl as string | undefined;
const supabaseAnonKey = extra.supabaseAnonKey as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config: set expo.extra.supabaseUrl / supabaseAnonKey in app.json.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // PKCE is the recommended flow for native apps (no client secret, and
    // the auth code arrives via the deep-link callback below rather than a
    // token in a URL fragment, which React Native can't read directly).
    flowType: 'pkce',
  },
});

// The app is audit-first (per the design handoff): a prospect can complete
// an audit before creating an account. Supabase's anonymous sign-in gives
// every device a real auth.uid() so RLS can scope audits to it, with no
// signup step. Requires "Allow anonymous sign-ins" enabled in the Supabase
// dashboard — see supabase/README.md.
export async function ensureSignedIn(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return;

  const { error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw new Error(`Supabase anonymous sign-in failed: ${error.message}`);
  }
}

export async function isAnonymousSession(): Promise<boolean> {
  const { data } = await supabase.auth.getUser();
  return data.user?.is_anonymous === true;
}

const AUTH_CALLBACK_PATH = 'auth-callback';

export function authRedirectUrl(): string {
  return Linking.createURL(AUTH_CALLBACK_PATH);
}

// Sends a magic-link email. Two cases:
// - Current session is anonymous (mid/post-audit): links that SAME
//   auth.uid() to the email, so every audit already saved under it stays
//   attached to the new account. Uses updateUser, not signUp.
// - No session, or a non-anonymous "sign in on a new device" case: sends a
//   normal magic-link sign-in, which creates a fresh session on completion.
export async function sendMagicLink(email: string): Promise<void> {
  const emailRedirectTo = authRedirectUrl();
  const anon = await isAnonymousSession();

  if (anon) {
    const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo });
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });
  if (error) throw new Error(error.message);
}

// Google sign-in. Same split as sendMagicLink and for the same reason:
// - Anonymous session (mid/post-audit): upgrade that SAME auth.uid() via
//   linkIdentity, so audits already saved under it stay attached.
// - No session / returning user from Welcome's "Sign in": signInWithOAuth,
//   a fresh sign-in.
// Both open the system browser for Google's consent screen, then return to
// the app via the same orvo://auth-callback deep link the magic-link flow
// uses — completeAuthFromUrl finishes it either way.
//
// NOT verified live — see the note on completeAuthFromUrl below. Both
// linkIdentity and signInWithOAuth are confirmed present on the installed
// @supabase/supabase-js (2.112.4), so this is a live-testing gap, not an
// API-guessing one.
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = authRedirectUrl();
  const anon = await isAnonymousSession();

  const { data, error } = anon
    ? await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo } })
    : await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });

  if (error) throw new Error(error.message);
  if (!data?.url) throw new Error('Supabase did not return a Google sign-in URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'success' && result.url) {
    const ok = await completeAuthFromUrl(result.url);
    if (!ok) throw new Error('Could not complete Google sign-in.');
  } else if (result.type !== 'cancel' && result.type !== 'dismiss') {
    throw new Error(`Google sign-in did not complete (${result.type}).`);
  }
}

// Completes the magic-link flow when the app is opened via the callback
// deep link (orvo://auth-callback?code=...). Call this from the app's
// Linking listener — see App.tsx.
//
// NOT verified live: this environment's network policy blocks reaching
// Supabase directly, so the PKCE code-exchange step below could not be
// tested end-to-end against a real project. Verify on a device before
// relying on it — if `exchangeCodeForSession` errors, check the Supabase
// dashboard's Authentication → URL Configuration has this app's redirect
// URL (`orvo://auth-callback`) listed under "Redirect URLs".
export async function completeAuthFromUrl(url: string): Promise<boolean> {
  if (!url.includes(AUTH_CALLBACK_PATH)) return false;

  const { error } = await supabase.auth.exchangeCodeForSession(url);
  if (error) {
    console.warn('[supabase] auth callback exchange failed:', error.message);
    return false;
  }
  return true;
}
