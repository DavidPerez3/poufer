import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const GITHUB_PAGES_BASE = '/poufer';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web' || process.env.NODE_ENV !== 'production') return;

    const navigatorLike = (globalThis as typeof globalThis & {
      navigator?: { serviceWorker?: { register: (url: string, options: { scope: string }) => Promise<unknown> } } };
    }).navigator;

    navigatorLike?.serviceWorker
      ?.register(`${GITHUB_PAGES_BASE}/sw.js`, { scope: `${GITHUB_PAGES_BASE}/` })
      .catch(() => undefined);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}
