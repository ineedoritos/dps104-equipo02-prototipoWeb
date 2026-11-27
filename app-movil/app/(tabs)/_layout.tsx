import { Tabs } from 'expo-router';

import { BarraTabs } from '@/components/ui/BarraTabs';
import { Encabezado } from '@/components/ui/Encabezado';
import { colores, fuentes, interletrado, tipografia } from '@/lib/tema';

export default function TabsLayout() {
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
        // Mismo encabezado en las tres pestañas; el cambio entre ellas se desplaza suavemente.
        // Encabezado unico de la app (mismo que el del grupo y los formularios).
        header: ({ options }) => <Encabezado titulo={options.title ?? ''} />,
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
