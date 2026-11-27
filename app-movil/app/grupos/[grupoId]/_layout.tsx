import { Stack } from 'expo-router';

/**
 * Pantallas de un grupo. Las pestañas (Jornadas, Integrantes, Reportes) viven
 * dentro de `(pestanas)`, que tiene el encabezado y las pestañas compartidas.
 * Las pantallas de jornada y de configuración se abren encima.
 */
export default function GrupoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(pestanas)" options={{ animation: 'none' }} />
      <Stack.Screen name="configuracion" />
    </Stack>
  );
}
