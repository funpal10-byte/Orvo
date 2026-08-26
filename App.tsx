import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppFonts } from './src/theme/useAppFonts';
import { color } from './src/theme/tokens';
import { completeAuthFromUrl, ensureSignedIn } from './src/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const fontsLoaded = useAppFonts();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Best-effort, non-blocking: the welcome/setup screens work without a
    // session; scoring needs one, and will retry via ensureSignedIn there
    // too if this hasn't resolved yet (e.g. app opened offline).
    ensureSignedIn().catch((err) => {
      console.warn('[supabase] anonymous sign-in failed:', err.message);
    });
  }, []);

  useEffect(() => {
    // Completes sign-in when the app is opened via the magic-link email
    // (orvo://auth-callback) — both for a cold start (getInitialURL) and
    // for the app already running in the background (the 'url' event).
    Linking.getInitialURL().then((url) => {
      if (url) completeAuthFromUrl(url).catch(() => {});
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      completeAuthFromUrl(url).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.loading} onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: color.canvas,
  },
});
