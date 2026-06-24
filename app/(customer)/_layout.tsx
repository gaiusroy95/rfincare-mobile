import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="assessment" />
      <Stack.Screen name="eligibility" />
      <Stack.Screen name="emi-calculator" />
      <Stack.Screen name="about" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="legal" />
      <Stack.Screen name="share-story" />
      <Stack.Screen name="product-comparison" />
      <Stack.Screen name="bank-compare" />
      <Stack.Screen name="product/[loanType]" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="documents" />
      <Stack.Screen name="bank-selection" />
      <Stack.Screen name="questionnaire" />
      <Stack.Screen name="password" />
      <Stack.Screen name="auth-center" />
    </Stack>
  );
}
