import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

import { colores } from '@/lib/tema';

const temaNavegacion = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colores.papel,
    border: colores.borde,
    card: colores.superficie,
    primary: colores.acento,
    text: colores.tinta,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider value={temaNavegacion}>
        <Stack
          screenOptions={{
            animation: 'none',
            headerShown: false,
            contentStyle: { backgroundColor: colores.papel },
          }}
        />
      </ThemeProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
