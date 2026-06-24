import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Screen from '@/src/components/Screen';
import Button from '@/src/components/Button';
import { useLoanProducts } from '@/src/contexts/LoanProductsContext';
import { colors } from '@/src/theme';

export default function ProductLandingScreen() {
  const { loanType } = useLocalSearchParams<{ loanType: string }>();
  const { products } = useLoanProducts();
  const product = (products as { slug?: string; name?: string; description?: string; features?: string[] }[])
    .find((p) => p.slug === loanType);

  return (
    <Screen title={product?.name || String(loanType)}>
      <Text style={styles.desc}>{product?.description || 'Explore this loan product and apply today.'}</Text>
      {(product?.features || []).map((f, i) => <Text key={i} style={styles.feature}>• {f}</Text>)}
      <Button title="Check Eligibility" variant="customer" onPress={() => router.push('/(customer)/eligibility')} />
      <Button title="Apply Now" onPress={() => router.push({ pathname: '/(customer)/assessment', params: { loanType } })} style={{ marginTop: 8 }} />
      <Button title="Compare Banks" variant="outline" onPress={() => router.push('/(customer)/(tabs)/marketplace')} style={{ marginTop: 8 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 15, lineHeight: 22, marginBottom: 16, color: colors.mutedForeground },
  feature: { fontSize: 14, marginBottom: 6 },
});
