import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/src/theme';
import type { LoadedLearningMedia } from '@/src/utils/learningResourcesMobile';

type Props = {
  title: string;
  media: LoadedLearningMedia;
  visible: boolean;
  onClose: () => void;
};

const webViewProps = {
  allowFileAccess: true,
  allowFileAccessFromFileURLs: true,
  allowUniversalAccessFromFileURLs: true,
  originWhitelist: ['*'] as string[],
  javaScriptEnabled: true,
  allowsFullscreenVideo: true,
  allowsInlineMediaPlayback: true,
  mediaPlaybackRequiresUserAction: false,
  mixedContentMode: 'always' as const,
};

function buildVideoPlayerHtml(uri: string): string {
  const safe = uri.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { background: #000; height: 100%; width: 100%; overflow: hidden; font-family: system-ui, sans-serif; }
  .wrap { display: flex; flex-direction: column; height: 100%; width: 100%; }
  .video-wrap {
    flex: 1; display: flex; align-items: center; justify-content: center;
    min-height: 0; background: #000; position: relative;
  }
  video {
    width: 100%; height: 100%; max-height: 100%; object-fit: contain; background: #000;
  }
  .controls {
    display: flex; align-items: center; gap: 8px; padding: 12px 14px;
    background: rgba(0,0,0,0.92); flex-shrink: 0; flex-wrap: wrap;
  }
  .controls button {
    background: rgba(255,255,255,0.18); border: none; color: #fff;
    border-radius: 8px; padding: 10px 14px; font-size: 13px; font-weight: 600;
    min-height: 40px;
  }
  .controls button:active { background: rgba(236,72,153,0.5); }
  .vol-wrap { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 120px; }
  .vol-wrap input[type=range] { flex: 1; height: 28px; accent-color: #ec4899; }
  .vol-label { color: #ccc; font-size: 12px; min-width: 40px; text-align: right; }
</style>
</head><body>
<div class="wrap">
  <div class="video-wrap" id="vw">
    <video id="v" playsinline webkit-playsinline preload="auto" controls src="${safe}"></video>
  </div>
  <div class="controls">
    <button type="button" id="playBtn">Pause</button>
    <button type="button" id="muteBtn">Mute</button>
    <div class="vol-wrap">
      <input type="range" id="vol" min="0" max="100" value="100" aria-label="Volume" />
      <span class="vol-label" id="volLbl">100%</span>
    </div>
    <button type="button" id="fsBtn">Wide view</button>
  </div>
</div>
<script>
  const v = document.getElementById('v');
  const playBtn = document.getElementById('playBtn');
  const muteBtn = document.getElementById('muteBtn');
  const vol = document.getElementById('vol');
  const volLbl = document.getElementById('volLbl');
  const fsBtn = document.getElementById('fsBtn');
  const vw = document.getElementById('vw');

  function syncPlayBtn() { playBtn.textContent = v.paused ? 'Play' : 'Pause'; }
  function syncMuteBtn() { muteBtn.textContent = v.muted ? 'Unmute' : 'Mute'; }

  playBtn.onclick = () => { if (v.paused) v.play(); else v.pause(); };
  v.onplay = syncPlayBtn;
  v.onpause = syncPlayBtn;

  muteBtn.onclick = () => { v.muted = !v.muted; syncMuteBtn(); };
  vol.oninput = () => {
    v.volume = Number(vol.value) / 100;
    v.muted = Number(vol.value) === 0;
    volLbl.textContent = vol.value + '%';
    syncMuteBtn();
  };

  fsBtn.onclick = () => {
    const target = v.webkitEnterFullscreen ? v : (vw.requestFullscreen ? vw : v);
    if (v.webkitEnterFullscreen) {
      try { v.webkitEnterFullscreen(); } catch (e) {}
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }
    const req = target.requestFullscreen || target.webkitRequestFullscreen;
    if (req) req.call(target);
  };

  v.addEventListener('volumechange', () => {
    if (!v.muted) vol.value = Math.round(v.volume * 100);
    volLbl.textContent = (v.muted ? 0 : Math.round(v.volume * 100)) + '%';
    syncMuteBtn();
  });

  v.play().then(syncPlayBtn).catch(() => syncPlayBtn());
</script>
</body></html>`;
}

export default function LearningVideoPlayer({ title, media, visible, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const [webLoading, setWebLoading] = useState(true);

  const playerHeight = Math.min(Math.round((width * 9) / 16), Math.round(height * 0.55));

  const source = useMemo(() => {
    const uri = media.localUri;
    if (media.isExternal) {
      const isDirectVideo = /\.(mp4|webm|mov|m4v)(\?|$)/i.test(uri);
      if (isDirectVideo) return { html: buildVideoPlayerHtml(uri) };
      return { uri };
    }
    return {
      html: buildVideoPlayerHtml(uri),
      baseUrl: Platform.OS === 'ios' ? uri : undefined,
    };
  }, [media]);

  useEffect(() => {
    if (visible) setWebLoading(true);
  }, [visible, media.localUri]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={2}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close video"
            >
              <Ionicons name="close" size={26} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.playerWrap, { height: playerHeight }]}>
            {webLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator color="#fff" size="large" />
                <Text style={styles.loadingText}>Loading video…</Text>
              </View>
            ) : null}
            <WebView
              key={media.localUri}
              source={source}
              style={styles.webview}
              allowingReadAccessToURL={Platform.OS === 'ios' && !media.isExternal ? media.localUri : undefined}
              onLoadEnd={() => setWebLoading(false)}
              startInLoadingState
              {...webViewProps}
            />
          </View>

          <Text style={styles.hint}>
            Use Play, Mute, and the volume slider below the video. Tap Wide view for fullscreen.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.foreground },
  playerWrap: {
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: { flex: 1, backgroundColor: '#000' },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    zIndex: 2,
  },
  loadingText: { color: '#fff', marginTop: 12, fontSize: 13 },
  hint: {
    fontSize: 12,
    color: colors.mutedForeground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
