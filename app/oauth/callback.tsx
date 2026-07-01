import { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/src/contexts/AuthContext';
import { colors } from '@/src/theme';

export default function OAuthCallback() {
  const params = useLocalSearchParams<{ accessToken?: string; refreshToken?: string; error?: string }>();
  const { setUserFromOAuth } = useAuth();

  useEffect(() => {
    (async () => {
      if (params.error) {
        router.replace('/(customer)/login');
        return;
      }
      if (params.accessToken) {
        await setUserFromOAuth(params.accessToken, params.refreshToken);
        router.replace('/(customer)/(tabs)/dashboard');
        return;
      }
      router.replace('/(customer)/login');
    })();
  }, [params, setUserFromOAuth]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>Signing you in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  text: { marginTop: 16, color: colors.mutedForeground },
});
