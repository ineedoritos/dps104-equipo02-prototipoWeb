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
        headerStyle: { backgroundColor: colores.papel },
        headerTitleStyle: {
          color: colores.tinta,
          fontSize: tipografia.tituloSm,
          fontWeight: pesos.fuerte,
        },
        headerShadowVisible: false,
        tabBarActiveTintColor: colores.acento,
        tabBarInactiveTintColor: colores.tintaTenue,
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
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Icono color={typeof color === 'string' ? color : colores.tintaTenue} nombre="gente" tamano={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => (
            <Icono color={typeof color === 'string' ? color : colores.tintaTenue} nombre="cuenta" tamano={24} />
          ),
        }}
      />
    </Tabs>
  );
}
