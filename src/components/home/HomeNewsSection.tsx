import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [selected, setSelected] = useState<HomeNewsItem | null>(null);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!items.length) return null;

  const selectedImage = selected ? resolveMediaUrl(selected.imageUrl) : null;

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
              onPress={() => setSelected(news)}
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

      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setSelected(null)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalHeaderTitle}>News & Updates</Text>
            <TouchableOpacity
              onPress={() => setSelected(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={26} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="cover" />
            ) : (
              <View style={styles.modalImagePlaceholder}>
                <Text style={styles.placeholderText}>News</Text>
              </View>
            )}
            {selected?.category ? <Text style={styles.modalCategory}>{selected.category}</Text> : null}
            {selected?.title ? <Text style={styles.modalTitle}>{selected.title}</Text> : null}
            {selected?.excerpt ? <Text style={styles.modalText}>{selected.excerpt}</Text> : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  modalBody: { padding: 20, paddingBottom: 40 },
  modalImage: { width: '100%', height: 240, borderRadius: 14, marginBottom: 16 },
  modalImagePlaceholder: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.foreground, lineHeight: 28 },
  modalText: { fontSize: 15, color: colors.mutedForeground, marginTop: 12, lineHeight: 22 },
});
