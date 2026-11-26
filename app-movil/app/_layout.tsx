import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { colores } from '@/lib/tema';

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colores.superficie },
        }}
      />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
