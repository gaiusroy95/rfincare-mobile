import React, { useEffect, useState } from 'react';
import { Text, FlatList, Alert } from 'react-native';
import Screen from '@/src/components/Screen';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import Card from '@/src/components/Card';
import { apiClient } from '@/src/api/apiClient';
import { colors } from '@/src/theme';

export default function PasswordManagementScreen() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    apiClient.get('/auth/sessions').then((r) => setSessions(r.data?.sessions || [])).catch(() => {});
  }, []);

  const changePassword = async () => {
    if (newPass !== confirm) { Alert.alert('Passwords do not match'); return; }
    try {
      await apiClient.post('/auth/change-password', { currentPassword: current, newPassword: newPass });
      Alert.alert('Password changed');
    } catch (e: unknown) {
      Alert.alert('Error', (e as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed');
    }
  };

  const revokeSession = async (id: string) => {
    await apiClient.delete(`/auth/sessions/${id}`);
    setSessions((s) => s.filter((x) => x.id !== id));
  };

  return (
    <Screen title="Change Password" showBack>
      <Text style={{ color: colors.mutedForeground, marginBottom: 16, fontSize: 14 }}>
        Update your password while signed in. You must know your current password.
      </Text>
      <Input label="Current Password" value={current} onChangeText={setCurrent} secureTextEntry />
      <Input label="New Password" value={newPass} onChangeText={setNewPass} secureTextEntry />
      <Input label="Confirm Password" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <Button title="Change Password" onPress={changePassword} variant="customer" />
      <Text style={{ marginTop: 20, fontWeight: '700' }}>Active Sessions</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card>
            <Text>{String(item.userAgent || 'Session')}</Text>
            <Button title="Revoke" variant="destructive" onPress={() => revokeSession(String(item.id))} style={{ marginTop: 8 }} />
          </Card>
        )}
      />
    </Screen>
  );
}
