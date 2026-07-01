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
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Ionicons } from '@expo/vector-icons';
import SectionHeader from '@/src/components/home/SectionHeader';
import { colors } from '@/src/theme';
import { resolveMediaUrl, youtubeThumbnail, youtubeId } from '@/src/utils/mediaUrls';

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
  const [selected, setSelected] = useState<HomeVideo | null>(null);
  const { width } = useWindowDimensions();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  if (!videos.length) return null;

  const videoId = selected ? youtubeId(selected.youtubeUrl) : null;
  const directUrl = selected && !videoId ? resolveMediaUrl(selected.youtubeUrl) : null;
  const playerWidth = Math.min(width, 720);
  const playerHeight = Math.round((playerWidth * 9) / 16);

  const directHtml = directUrl
    ? `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<style>html,body{margin:0;padding:0;background:#000;height:100%}
video{width:100%;height:100%;object-fit:contain}</style>
</head><body>
<video src="${directUrl}" controls autoplay playsinline></video>
</body></html>`
    : null;

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
              onPress={() => setSelected(video)}
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

      <Modal
        visible={!!selected}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {selected?.title || 'Video'}
              </Text>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={[styles.playerWrap, { height: playerHeight }]}>
              {videoId ? (
                <YoutubePlayer
                  height={playerHeight}
                  width={playerWidth}
                  play
                  videoId={videoId}
                  webViewProps={{ allowsInlineMediaPlayback: true }}
                  initialPlayerParams={{ rel: false, modestbranding: true }}
                />
              ) : directHtml ? (
                <WebView
                  originWhitelist={['*']}
                  source={{ html: directHtml }}
                  style={styles.player}
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  allowsFullscreenVideo
                  javaScriptEnabled
                  startInLoadingState
                  renderLoading={() => (
                    <View style={styles.playerLoading}>
                      <ActivityIndicator color="#fff" />
                    </View>
                  )}
                />
              ) : (
                <View style={styles.playerLoading}>
                  <Text style={styles.unavailable}>Video is unavailable.</Text>
                </View>
              )}
            </View>

            {selected?.description ? (
              <ScrollView style={styles.descScroll} contentContainerStyle={styles.descScrollContent}>
                <Text style={styles.modalDesc}>{selected.description}</Text>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  modalHeaderTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.foreground },
  playerWrap: { width: '100%', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  player: { flex: 1, backgroundColor: '#000' },
  playerLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  unavailable: { color: '#fff', fontSize: 14 },
  descScroll: { maxHeight: 160 },
  descScrollContent: { padding: 20 },
  modalDesc: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20 },
});
