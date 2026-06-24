import { Stack } from 'expo-router';

export default function AgentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="application" />
      <Stack.Screen name="notifications" />
    </Stack>
  );
}
