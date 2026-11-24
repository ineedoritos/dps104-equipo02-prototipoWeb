import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { colores } from '@/lib/tema';

type Props = {
  color: ColorValue;
};

function IconoInicio({ color }: Props) {
  return (
    <SymbolView
      name={{ ios: 'house.fill', android: 'home', web: 'home' }}
      size={28}
      tintColor={color}
    />
  );
}

function IconoCuenta({ color }: Props) {
  return (
    <SymbolView
      name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
      size={28}
      tintColor={color}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colores.superficie },
        headerTitleStyle: { color: colores.texto, fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: colores.primario,
        tabBarInactiveTintColor: colores.textoSuave,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          headerShown: false,
          tabBarIcon: ({ color }) => <IconoInicio color={color} />,
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <IconoCuenta color={color} />,
        }}
      />
    </Tabs>
  );
}
