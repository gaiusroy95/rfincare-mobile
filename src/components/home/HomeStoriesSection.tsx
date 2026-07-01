import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '@/src/components/home/SectionHeader';
import { colors } from '@/src/theme';
import { getStoryPhotoUrl } from '@/src/utils/storyMedia';

export type HomeStory = {
  id: string;
  name?: string;
  storyText?: string;
  story?: string;
  storyType?: string;
  location?: string;
  loanAmount?: string;
  photoUrl?: string;
};

type Props = {
  stories: HomeStory[];
};

export default function HomeStoriesSection({ stories }: Props) {
  const [tab, setTab] = useState<'customer' | 'agent'>('customer');
  const customerStories = stories.filter((s) => s.storyType === 'customer');
  const agentStories = stories.filter((s) => s.storyType === 'agent');
  const items = tab === 'customer' ? customerStories : agentStories;
  const display = items.length ? items : stories;

  if (!stories.length) return null;

  return (
    <View>
      <SectionHeader title="Success Stories" subtitle="Real customers and agents who achieved their goals with Rfincare." />
      <View style={styles.tabs}>
        {(['customer', 'agent'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'customer' ? 'Customers' : 'Agents'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {display.slice(0, 6).map((story) => {
          const photo = getStoryPhotoUrl(story.photoUrl);
          const text = story.storyText || story.story || '';
          return (
            <View key={story.id} style={styles.card}>
              <View style={styles.quoteRow}>
                <Ionicons name="chatbubble-ellipses" size={20} color={colors.customer} />
                {photo ? (
                  <Image source={{ uri: photo }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={20} color={colors.mutedForeground} />
                  </View>
                )}
              </View>
              <Text style={styles.quote} numberOfLines={5}>"{text}"</Text>
              <Text style={styles.name}>{story.name}</Text>
              {story.location ? <Text style={styles.meta}>{story.location}</Text> : null}
              {story.loanAmount ? <Text style={styles.amount}>{story.loanAmount}</Text> : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: colors.mutedForeground, textTransform: 'capitalize' },
  tabTextActive: { color: '#fff' },
  row: { gap: 12, paddingRight: 4 },
  card: {
    width: 260,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  quoteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.border },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quote: { fontSize: 13, color: colors.mutedForeground, fontStyle: 'italic', lineHeight: 18, flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: colors.foreground, marginTop: 12 },
  meta: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },
  amount: { fontSize: 11, fontWeight: '600', color: colors.success, marginTop: 4 },
});
