import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/auth';

export default function Index() {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
