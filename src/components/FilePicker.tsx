import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/src/components/Button';
import { colors } from '@/src/theme';

export type PickedFile = {
  uri: string;
  name: string;
  mimeType?: string;
};

type Props = {
  label: string;
  onPick: (file: PickedFile) => void | Promise<void>;
  acceptImages?: boolean;
  loading?: boolean;
  uploadedName?: string;
};

export async function pickDocument(): Promise<PickedFile | null> {
  const pick = await DocumentPicker.getDocumentAsync({
    type: ['image/*', 'application/pdf'],
    copyToCacheDirectory: true,
  });
  if (pick.canceled || !pick.assets?.[0]) return null;
  const file = pick.assets[0];
  return { uri: file.uri, name: file.name, mimeType: file.mimeType || undefined };
}

export async function pickImage(): Promise<PickedFile | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Permission needed', 'Allow photo library access to upload images.');
    return null;
  }
  const pick = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.85,
  });
  if (pick.canceled || !pick.assets?.[0]) return null;
  const asset = pick.assets[0];
  const name = asset.fileName || `photo_${Date.now()}.jpg`;
  return { uri: asset.uri, name, mimeType: asset.mimeType || 'image/jpeg' };
}

export default function FilePicker({
  label,
  onPick,
  acceptImages = true,
  loading,
  uploadedName,
}: Props) {
  const handlePick = async (mode: 'doc' | 'image') => {
    const file = mode === 'image' ? await pickImage() : await pickDocument();
    if (file) await onPick(file);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {uploadedName ? <Text style={styles.uploaded}>✓ {uploadedName}</Text> : null}
      <View style={styles.row}>
        <Button
          title="Choose file"
          variant="outline"
          onPress={() => handlePick('doc')}
          loading={loading}
          style={styles.btn}
        />
        {acceptImages && (
          <Button
            title="Photo"
            variant="outline"
            onPress={() => handlePick('image')}
            loading={loading}
            style={styles.btn}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 },
  uploaded: { fontSize: 12, color: colors.success, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 8 },
  btn: { flex: 1 },
});
