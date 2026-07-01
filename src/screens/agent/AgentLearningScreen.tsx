import React, { useCallback, useEffect, useState } from 'react';
import { Text, FlatList, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '@/src/components/Screen';
import LearningResourceViewer from '@/src/components/LearningResourceViewer';
import TrainingResourceCard from '@/src/components/TrainingResourceCard';
import { colors } from '@/src/theme';
import { agentLearningService } from '@/src/services/agentLearningService';
import {
  mapLearningResource,
  loadLearningResourceMedia,
  type LearningResource,
  type LoadedLearningMedia,
} from '@/src/utils/learningResourcesMobile';

export default function AgentLearningScreen() {
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [media, setMedia] = useState<LoadedLearningMedia | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await agentLearningService.listForAgent();
      const list = Array.isArray(data) ? data : (data?.resources || []);
      setResources((list as Record<string, unknown>[]).map(mapLearningResource));
    } catch {
      setResources([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProgress = async (resource: LearningResource, nextProgress: number) => {
    if (resource.legacy || String(resource.id).startsWith('circular-')) return;
    try {
      await agentLearningService.updateProgress(resource.id, nextProgress);
      setResources((prev) =>
        prev.map((r) => (r.id === resource.id ? { ...r, progress: nextProgress } : r)),
      );
    } catch {
      /* best-effort */
    }
  };

  const loadMedia = async (resource: LearningResource) => {
    setActiveId(resource.id);
    setOpeningId(resource.id);
    setViewerError(null);
    setMedia(null);

    try {
      const loaded = await loadLearningResourceMedia(resource);
      setMedia(loaded);
    } catch (e) {
      setViewerError((e as Error).message || 'Could not open this resource');
      setMedia(null);
    }
    setOpeningId(null);
  };

  const handleOpen = async (resource: LearningResource) => {
    await loadMedia(resource);
    if (resource.legacy || String(resource.id).startsWith('circular-')) return;
    const nextProgress = resource.progress > 0 ? Math.min(100, resource.progress + 25) : 50;
    await updateProgress(resource, nextProgress);
  };

  const handleStart = async (resource: LearningResource) => {
    await loadMedia(resource);
    if (!resource.legacy && !String(resource.id).startsWith('circular-') && (resource.progress || 0) < 100) {
      await updateProgress(resource, 100);
    }
  };

  const activeResource = resources.find((r) => r.id === activeId) || null;

  const header = (
    <View>
      <View style={styles.sectionHeader}>
        <Ionicons name="book" size={20} color={colors.primary} />
        <Text style={styles.sectionTitle}>Training & Certification</Text>
      </View>
      <Text style={styles.sectionSub}>
        Videos, PDFs, presentations, and circulars from your admin team.
      </Text>
      <LearningResourceViewer
        resource={activeResource || { id: '', type: 'video', title: 'Training', duration: '—', progress: 0, isNew: false, openUrl: null }}
        media={activeResource ? media : null}
        loading={Boolean(activeResource && openingId === activeResource.id)}
        error={activeResource ? viewerError : null}
      />
    </View>
  );

  return (
    <Screen title="Agent Learning" loading={loading} scroll={false}>
      <FlatList
        data={resources}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <TrainingResourceCard
            resource={item}
            active={item.id === activeId}
            loading={openingId === item.id}
            onOpen={() => (item.progress > 0 ? handleOpen(item) : handleStart(item))}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              No training content published yet. Check back later.
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  sectionSub: { fontSize: 13, color: colors.mutedForeground, marginBottom: 12, lineHeight: 18 },
  empty: { textAlign: 'center', color: colors.mutedForeground, paddingVertical: 24 },
});
