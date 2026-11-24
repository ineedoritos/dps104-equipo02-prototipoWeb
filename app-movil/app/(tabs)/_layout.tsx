import { Tabs } from 'expo-router';
import { StyleSheet, Text, type ColorValue } from 'react-native';

import { colores } from '@/lib/tema';

type Props = {
  simbolo: string;
  color: ColorValue;
};

function IconoPestana({ simbolo, color }: Props) {
  return <Text style={[styles.icono, { color }]}>{simbolo}</Text>;
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
        tabBarStyle: { backgroundColor: colores.superficie, borderTopColor: colores.borde },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis grupos',
          tabBarIcon: ({ color }) => <IconoPestana simbolo="▦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Mi historial',
          tabBarIcon: ({ color }) => <IconoPestana simbolo="◷" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notificaciones"
        options={{
          title: 'Notificaciones',
          tabBarIcon: ({ color }) => <IconoPestana simbolo="◔" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <IconoPestana simbolo="◉" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icono: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
});
