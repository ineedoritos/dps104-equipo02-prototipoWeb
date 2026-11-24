import { Stack } from 'expo-router';

import { colores } from '@/lib/tema';

export default function GrupoLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Volver',
        headerStyle: { backgroundColor: colores.superficie },
        headerTintColor: colores.primario,
        headerTitleStyle: { color: colores.texto, fontWeight: '700' },
      }}
    />
  );
}
