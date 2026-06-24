import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import Screen from '@/src/components/Screen';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
import { useAuth } from '@/src/contexts/AuthContext';

export default function CustomerProfileScreen() {
  const { userProfile, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(String(userProfile?.fullName || ''));
  const [phone, setPhone] = useState(String(userProfile?.phone || ''));
  const [avatarUrl, setAvatarUrl] = useState(String(userProfile?.avatarUrl || ''));
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const { error } = await updateProfile({ fullName, phone, avatarUrl });
    if (error) Alert.alert('Error', error.message);
    else { Alert.alert('Saved'); router.back(); }
    setLoading(false);
  };

  return (
    <Screen title="My Profile" showBack>
      <Input label="Full Name" value={fullName} onChangeText={setFullName} />
      <Input label="Phone (10 digits)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
      <Input label="Avatar URL" value={avatarUrl} onChangeText={setAvatarUrl} />
      <Input label="Email" value={String(userProfile?.email || '')} editable={false} />
      <Button title="Save Profile" onPress={save} loading={loading} variant="customer" />
    </Screen>
  );
}
