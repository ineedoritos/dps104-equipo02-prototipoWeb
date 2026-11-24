import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colores } from '@/lib/tema';

type Props = {
  color: ColorValue;
};

function IconoInicio({ color }: Props) {
  return (
    <SymbolView
      name={{ ios: 'house.fill', android: 'home', web: 'home' }}
      size={26}
      tintColor={color}
    />
  );
}

function IconoReportes({ color }: Props) {
  return (
    <SymbolView
      name={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }}
      size={26}
      tintColor={color}
    />
  );
}

function IconoCuenta({ color }: Props) {
  return (
    <SymbolView
      name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
      size={26}
      tintColor={color}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);

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
          height: 58 + bottomInset,
          paddingBottom: bottomInset,
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
        name="reportes"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color }) => <IconoReportes color={color} />,
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
