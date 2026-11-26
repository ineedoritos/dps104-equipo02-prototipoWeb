import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icono, type NombreIcono } from '@/components/ui/Icono';
import { colores, espaciados, pesos, radios, tipografia } from '@/lib/tema';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 16 : 0);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colores.tinta,
        tabBarInactiveTintColor: colores.tintaSuave,
        tabBarLabelStyle: {
          fontSize: tipografia.micro,
          fontWeight: pesos.fuerte,
          letterSpacing: 0.2,
        },
        tabBarStyle: {
          backgroundColor: colores.superficie,
          borderTopColor: colores.borde,
          height: 64 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: espaciados.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mis grupos',
          tabBarIcon: ({ focused }) => (
            <IconoPestana activo={focused} nombre="gente" />
          ),
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Mi historial',
          tabBarIcon: ({ focused }) => (
            <IconoPestana activo={focused} nombre="reloj" />
          ),
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ focused }) => (
            <IconoPestana activo={focused} nombre="cuenta" />
          ),
        }}
      />
    </Tabs>
  );
}

function IconoPestana({ activo, nombre }: { activo: boolean; nombre: NombreIcono }) {
  return (
    <View style={[styles.iconoPestana, activo && styles.iconoActivo]}>
      <Icono color={activo ? colores.superficie : colores.tintaSuave} nombre={nombre} tamano={22} />
    </View>
  );
}

const styles = StyleSheet.create({
  iconoPestana: {
    alignItems: 'center',
    borderRadius: radios.pill,
    height: espaciados.xxl,
    justifyContent: 'center',
    width: espaciados.xxxl,
  },
  iconoActivo: { backgroundColor: colores.tinta },
});
