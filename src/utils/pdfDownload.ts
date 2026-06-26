import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Linking, Platform } from 'react-native';
import { apiClient } from '@/src/api/apiClient';

export async function downloadAndSharePdf(
  url: string,
  filename = 'document.pdf',
): Promise<void> {
  try {
    const fullUrl = url.startsWith('http') ? url : `${apiClient.defaults.baseURL}${url}`;
    const { getAccessToken } = await import('@/src/api/apiClient');
    const token = getAccessToken();
    const dest = `${FileSystem.cacheDirectory}${filename}`;
    const headers: Record<string, string> = { 'X-Rfincare-Client': 'mobile' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const result = await FileSystem.downloadAsync(fullUrl, dest, { headers });
    if (result.status !== 200) {
      Alert.alert('Download failed', 'Could not download the file.');
      return;
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    } else if (Platform.OS === 'android') {
      await Linking.openURL(result.uri);
    } else {
      Alert.alert('Saved', `File saved to ${result.uri}`);
    }
  } catch (e) {
    Alert.alert('Error', (e as Error).message || 'Download failed');
  }
}

export async function downloadApplicationPdf(applicationId: string): Promise<void> {
  await downloadAndSharePdf(
    `/loan-applications/${applicationId}/summary-pdf`,
    `application-${applicationId}.pdf`,
  );
}
