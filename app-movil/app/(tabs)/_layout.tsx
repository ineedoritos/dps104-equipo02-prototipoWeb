import { Tabs, useRouter } from 'expo-router';

import { useSyncExternalStore } from 'react';
import { contarNoLeidas, suscribirNotificaciones } from '@/lib/notificacionesStore';
import { suscribirStore } from '@/lib/gruposStore';
import { Pressable, View } from 'react-native';
import { Icono } from '@/components/ui/Icono';
import { BarraTabs } from '@/components/ui/BarraTabs';
import { Encabezado } from '@/components/ui/Encabezado';
import { colores, fuentes, interletrado, tipografia } from '@/lib/tema';

function suscribirContador(actualizar: () => void) {
  const cancelarAvisos = suscribirNotificaciones(actualizar);
  const cancelarSesion = suscribirStore(actualizar);
  return () => {
    cancelarAvisos();
    cancelarSesion();
  };
}

export default function TabsLayout() {
  const sinLeer = useSyncExternalStore(suscribirContador, contarNoLeidas, contarNoLeidas);
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.papel },
        headerTitleStyle: {
          color: colores.tinta,
          fontFamily: fuentes.fuerte,
          fontSize: tipografia.tituloSm,
          letterSpacing: interletrado.tituloSm,
        },
        headerShadowVisible: false,
        // Mismo encabezado en las pestañas; el cambio entre ellas se desplaza suavemente.
        // Encabezado unico de la app (mismo que el del grupo y los formularios).
        header: ({ options }) => (
          <Encabezado
            derecha={<Pressable accessibilityRole="button" accessibilityLabel={sinLeer ? `Notificaciones, ${sinLeer} sin leer` : 'Notificaciones'} style={{ padding: 12 }} onPress={() => router.push('/notificaciones')}>
              <Icono nombre="notificaciones" color={colores.tinta} tamano={22} />
              {sinLeer > 0 ? <View style={{ position: 'absolute', right: 8, top: 8, backgroundColor: colores.ausente, width: 8, height: 8, borderRadius: 4 }} /> : null}
            </Pressable>}
            titulo={options.title ?? ''}
          />
        ),
        animation: 'shift',
        sceneStyle: { backgroundColor: colores.papel },
      }}
      tabBar={(props) => <BarraTabs {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Mis grupos' }} />
      <Tabs.Screen name="historial" options={{ title: 'Mi historial' }} />
      <Tabs.Screen name="cuenta" options={{ title: 'Cuenta' }} />
    </Tabs>
  );
}
