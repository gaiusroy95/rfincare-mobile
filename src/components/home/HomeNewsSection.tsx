import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import SectionHeader from '@/src/components/home/SectionHeader';
import { colors } from '@/src/theme';
import { resolveMediaUrl } from '@/src/utils/mediaUrls';

export type HomeNewsItem = {
  id: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  imageAlt?: string;
  category?: string;
  blogUrl?: string;
};

type Props = {
  items: HomeNewsItem[];
  loading?: boolean;
};

export default function HomeNewsSection({ items, loading }: Props) {
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!items.length) return null;

  return (
    <View>
      <SectionHeader title="Latest News & Updates" subtitle="Stay informed about rates, policies, and product updates." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.map((news) => {
          const image = resolveMediaUrl(news.imageUrl);
          return (
            <TouchableOpacity
              key={news.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => news.blogUrl && Linking.openURL(news.blogUrl)}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>News</Text>
                </View>
              )}
              <View style={styles.body}>
                {news.category ? <Text style={styles.category}>{news.category}</Text> : null}
                <Text style={styles.title} numberOfLines={2}>{news.title}</Text>
                {news.excerpt ? <Text style={styles.excerpt} numberOfLines={3}>{news.excerpt}</Text> : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: 24, alignItems: 'center' },
  row: { gap: 12, paddingRight: 4 },
  card: {
    width: 260,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 140 },
  imagePlaceholder: {
    height: 140,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: colors.mutedForeground, fontWeight: '600' },
  body: { padding: 12 },
  category: { fontSize: 10, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },
  title: { fontSize: 15, fontWeight: '700', color: colors.foreground, marginTop: 4 },
  excerpt: { fontSize: 12, color: colors.mutedForeground, marginTop: 6, lineHeight: 16 },
});
