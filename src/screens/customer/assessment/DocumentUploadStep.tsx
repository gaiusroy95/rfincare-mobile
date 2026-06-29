import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, Alert } from 'react-native';
import FilePicker, { PickedFile } from '@/src/components/FilePicker';
import { apiClient } from '@/src/api/apiClient';
// @ts-expect-error JS module
import { customerJourneyService } from '@/src/services/customerJourneyService';
// @ts-expect-error JS module
import { mergeAssessmentDocumentDefinitions } from '@/src/constants/assessmentDocuments';
import { colors } from '@/src/theme';
import type { AssessmentFormData } from './types';
import type { EligibilityResult } from '@/src/utils/assessmentEligibility';
import EligibilityResultSummary from '@/src/components/assessment/EligibilityResultSummary';

type DocType = { type: string; label: string; description?: string };

type Props = {
  form: AssessmentFormData;
  applicationId: string;
  eligibilityResult?: EligibilityResult | null;
};

export default function DocumentUploadStep({ form, applicationId, eligibilityResult }: Props) {
  const [docTypes, setDocTypes] = useState<DocType[]>([]);
  const [uploaded, setUploaded] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const defs = mergeAssessmentDocumentDefinitions({
      existingLoans: form.existingLoans,
      hasRunningLoanOrCard: form.hasRunningLoanOrCard,
    });
    setDocTypes(
      (Array.isArray(defs) ? defs : []).map((d: DocType) => ({
        type: d.type,
        label: d.label,
        description: d.description,
      })),
    );
    if (applicationId) {
      Promise.resolve(customerJourneyService.getMyDocuments(applicationId))
        .then((res: { data?: { documentType?: string; originalFilename?: string; fileName?: string }[] }) => {
          const docs = res?.data || [];
          const map: Record<string, string> = {};
          (Array.isArray(docs) ? docs : []).forEach((d) => {
            if (d.documentType) map[d.documentType] = d.originalFilename || d.fileName || 'Uploaded';
          });
          setUploaded(map);
        })
        .catch(() => {});
    }
  }, [form, applicationId]);

  const upload = async (docType: string, file: PickedFile) => {
    if (!applicationId) {
      Alert.alert('Error', 'Save application first before uploading documents.');
      return;
    }
    setLoading(docType);
    try {
      const fd = new FormData();
      fd.append('file', { uri: file.uri, name: file.name, type: file.mimeType || 'application/octet-stream' } as unknown as Blob);
      fd.append('applicationId', applicationId);
      fd.append('documentType', docType);
      await apiClient.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploaded((u) => ({ ...u, [docType]: file.name }));
      Alert.alert('Uploaded', `${docType} uploaded successfully.`);
    } catch (e) {
      Alert.alert('Upload failed', (e as Error).message);
    }
    setLoading(null);
  };

  return (
    <>
      <EligibilityResultSummary result={eligibilityResult ?? null} compact />
      <Text style={styles.title}>Upload required documents</Text>
      {docTypes.map((doc) => (
        <FilePicker
          key={doc.type}
          label={doc.label}
          uploadedName={uploaded[doc.type]}
          loading={loading === doc.type}
          onPick={(file) => upload(doc.type, file)}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '600', marginBottom: 12, color: colors.foreground },
});
