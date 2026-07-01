import { useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
// @ts-expect-error JS module
import { leadService } from '@/src/services/leadService';
import { colors } from '@/src/theme';

export default function ResumeApplication() {
  const { token } = useLocalSearchParams<{ token: string }>();

  useEffect(() => {
    (async () => {
      if (!token) {
        router.replace('/(customer)/(tabs)/home');
        return;
      }
      try {
        const data = await leadService.resolveResumeToken(token);
        if (data?.sessionKey) {
          await AsyncStorage.setItem('loan_assessment_session', data.sessionKey);
        }
        router.replace({ pathname: '/(customer)/assessment', params: { resume: '1' } });
      } catch {
        router.replace('/(customer)/(tabs)/home');
      }
    })();
  }, [token]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>Restoring your application...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  text: { marginTop: 16, color: colors.mutedForeground },
});
