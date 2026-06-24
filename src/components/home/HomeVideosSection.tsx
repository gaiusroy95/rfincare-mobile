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
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '@/src/components/home/SectionHeader';
import { colors } from '@/src/theme';
import { resolveMediaUrl, youtubeThumbnail } from '@/src/utils/mediaUrls';

export type HomeVideo = {
  id: string;
  title: string;
  description?: string;
  youtubeUrl?: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  durationLabel?: string;
};

type Props = {
  videos: HomeVideo[];
  loading?: boolean;
};

export default function HomeVideosSection({ videos, loading }: Props) {
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!videos.length) return null;

  return (
    <View>
      <SectionHeader
        title="Educational Videos"
        subtitle="Watch guides on eligibility, documents, and choosing the right loan."
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {videos.map((video) => {
          const thumb = resolveMediaUrl(video.thumbnailUrl) || youtubeThumbnail(video.youtubeUrl);
          return (
            <TouchableOpacity
              key={video.id}
              style={styles.card}
              activeOpacity={0.9}
              onPress={() => video.youtubeUrl && Linking.openURL(video.youtubeUrl)}
            >
              <View style={styles.thumbWrap}>
                {thumb ? (
                  <Image source={{ uri: thumb }} style={styles.thumb} resizeMode="cover" />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Ionicons name="videocam" size={32} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={styles.playOverlay}>
                  <View style={styles.playBtn}>
                    <Ionicons name="play" size={22} color="#fff" />
                  </View>
                </View>
                {video.durationLabel ? (
                  <View style={styles.duration}>
                    <Text style={styles.durationText}>{video.durationLabel}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
              {video.description ? (
                <Text style={styles.desc} numberOfLines={2}>{video.description}</Text>
              ) : null}
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
    width: 240,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thumbWrap: { height: 135, backgroundColor: colors.muted, position: 'relative' },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(236,72,153,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  duration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  durationText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  title: { fontSize: 14, fontWeight: '700', color: colors.foreground, padding: 12, paddingBottom: 4 },
  desc: { fontSize: 12, color: colors.mutedForeground, paddingHorizontal: 12, paddingBottom: 12, lineHeight: 16 },
});
