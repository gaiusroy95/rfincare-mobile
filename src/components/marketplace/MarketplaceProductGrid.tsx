import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme';
import type { MarketplaceProductItem } from '@/src/constants/marketplaceLeadFlow';

type Props = {
  items: MarketplaceProductItem[];
  onSelect: (item: MarketplaceProductItem) => void;
  title?: string;
  subtitle?: string;
};

export default function MarketplaceProductGrid({ items, onSelect, title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <FlatList
        data={items}
        keyExtractor={(item, index) => `${item.slug}-${item.label}-${index}`}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => onSelect(item)} activeOpacity={0.85}>
            {item.badge ? (
              <View style={[styles.badge, item.badgeTone === 'warning' && styles.badgeWarning]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={28} color={colors.customer} />
            </View>
            <Text style={styles.label}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: colors.foreground, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginBottom: 12 },
  row: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'center',
    minHeight: 140,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#10B981',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 1,
  },
  badgeWarning: { backgroundColor: '#EF4444' },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: `${colors.customer}12`,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  label: { fontSize: 12, fontWeight: '700', color: colors.foreground, textAlign: 'center' },
});
