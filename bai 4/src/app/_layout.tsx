import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { initDb } from '@/database/db';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    try {
      initDb();
    } catch (e) {
      console.error(e);
    } finally {
      SplashScreen.hideAsync();
    }
  }, []);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="student" options={{ headerShown: false }} />
    </Stack>
  );
}
