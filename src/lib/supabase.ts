import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

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
