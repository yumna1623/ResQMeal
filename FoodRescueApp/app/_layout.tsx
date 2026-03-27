import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* 🔐 Auth screens */}
        <Stack.Screen name="auth" />

        {/* 👇 Role-based apps */}
        <Stack.Screen name="(ngo)" />
        <Stack.Screen name="(hall)" />

        {/* 🧾 Optional modal */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />

      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}