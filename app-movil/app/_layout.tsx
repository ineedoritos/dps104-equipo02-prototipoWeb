import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
  useFonts,
} from '@expo-google-fonts/instrument-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colores } from '@/lib/tema';

// La splash se mantiene hasta cargar Instrument Sans, para no mostrar la fuente del sistema.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fuentesListas, errorFuentes] = useFonts({
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });
  const listo = fuentesListas || errorFuentes != null;

  useEffect(() => {
    if (listo) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [listo]);

  if (!listo) {
    return null;
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colores.papel }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'android' ? 'height' : undefined}>
        <Stack screenOptions={{ headerShown: false }} />
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
