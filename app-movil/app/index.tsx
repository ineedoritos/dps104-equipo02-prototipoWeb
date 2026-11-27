import { Redirect } from 'expo-router';

import { obtenerSesionActual } from '@/lib/gruposStore';

export default function Index() {
  return <Redirect href={obtenerSesionActual() ? '/(tabs)' : '/(auth)/login'} />;
}
