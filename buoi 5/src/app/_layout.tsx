import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen once mounted
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Khóa học trực tuyến',
          }}
        />
        <Stack.Screen
          name="course/[id]"
          options={{
            title: 'Chi tiết khóa học',
          }}
        />
        <Stack.Screen
          name="course/form"
          options={{
            title: 'Khóa học',
          }}
        />
        <Stack.Screen
          name="categories/index"
          options={{
            title: 'Quản lý danh mục',
          }}
        />
      </Stack>
    </>
  );
}
