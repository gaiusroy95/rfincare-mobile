import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page not found</Text>
        <Link href="/(customer)/(tabs)/home" style={styles.link}>Go to home</Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: colors.background },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.foreground },
  link: { marginTop: 16, color: colors.primary, fontSize: 16 },
});
