import { Redirect } from 'expo-router';
import { useAuth, getRoleRoute } from '@/src/contexts/AuthContext';
import LaunchSplash from '@/src/components/LaunchSplash';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LaunchSplash />;
  }

  if (user) {
    return <Redirect href={getRoleRoute(user.role) as never} />;
  }

  return <Redirect href="/(customer)/(tabs)/home" />;
}
