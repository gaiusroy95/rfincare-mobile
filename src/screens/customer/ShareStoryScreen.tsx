import React, { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Screen from '@/src/components/Screen';
import Input from '@/src/components/Input';
import Button from '@/src/components/Button';
// @ts-expect-error JS module
import { homepageService } from '@/src/services/homepageService';

export default function ShareStoryScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [story, setStory] = useState('');
  const [storyType, setStoryType] = useState('customer');
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled) setPhoto(res.assets[0]);
  };

  const submit = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (story.trim().length < 20) {
      Alert.alert('Story too short', 'Please share at least 20 characters about your experience.');
      return;
    }
    setLoading(true);
    try {
      const formPhoto = photo ? { uri: photo.uri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as File : null;
      await homepageService.submitStory(
        {
          submitterName: name.trim(),
          submitterEmail: email.trim(),
          submitterPhone: phone.trim(),
          storyType,
          storyText: story.trim(),
        },
        formPhoto,
      );
      Alert.alert('Thank you!', 'Your story has been submitted for review.');
      setName('');
      setEmail('');
      setPhone('');
      setStory('');
      setPhoto(null);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string; message?: string } }; message?: string };
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to submit your story. Please try again.';
      Alert.alert('Error', message);
    }
    setLoading(false);
  };

  return (
    <Screen title="Share Your Story">
      <Input label="Name" value={name} onChangeText={setName} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Your Story" value={story} onChangeText={setStory} multiline numberOfLines={6} />
      <Button title={photo ? 'Photo selected' : 'Add Photo (optional)'} variant="outline" onPress={pickPhoto} />
      <Button title="Submit Story" onPress={submit} loading={loading} variant="customer" style={{ marginTop: 12 }} />
    </Screen>
  );
}
