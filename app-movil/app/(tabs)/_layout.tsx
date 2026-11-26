import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icono } from '@/components/ui/Icono';
import { colores, pesos, tipografia } from '@/lib/tema';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.acento,
        tabBarInactiveTintColor: colores.tintaSuave,
        tabBarLabelStyle: {
          fontSize: tipografia.micro,
          fontWeight: pesos.fuerte,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
          height: 60 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis grupos',
          tabBarIcon: ({ color }) => (
            <Icono color={typeof color === 'string' ? color : colores.tintaSuave} nombre="gente" tamano={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Mi historial',
          tabBarIcon: ({ color }) => (
            <Icono color={typeof color === 'string' ? color : colores.tintaSuave} nombre="reloj" tamano={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => (
            <Icono color={typeof color === 'string' ? color : colores.tintaSuave} nombre="cuenta" tamano={24} />
          ),
        }}
      />
    </Tabs>
  );
}
