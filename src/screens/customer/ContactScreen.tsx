import React, { useState } from 'react';

import { Text, StyleSheet, Alert } from 'react-native';

import Screen from '@/src/components/Screen';

import CustomerHeaderActions from '@/src/components/customer/CustomerHeaderActions';

import Input from '@/src/components/Input';

import Button from '@/src/components/Button';

import { useSiteContact } from '@/src/contexts/SiteContactContext';

// @ts-expect-error JS module

import { leadService } from '@/src/services/leadService';



export default function ContactScreen() {

  const { contact } = useSiteContact();

  const [name, setName] = useState('');

  const [email, setEmail] = useState('');

  const [phone, setPhone] = useState('');

  const [subject, setSubject] = useState('');

  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);



  const submit = async () => {

    if (!name.trim() || !email.trim() || !message.trim()) {

      Alert.alert('Required fields', 'Please fill name, email, and message.');

      return;

    }

    setLoading(true);

    try {

      await leadService.createLead({

        fullName: name,

        email,

        phone: phone.replace(/\D/g, '').slice(-10),

        source: 'contact_form',

        notes: `Subject: ${subject}\n\n${message}`,

        metadata: { subject, message },

      });

      Alert.alert('Message sent', 'Thank you for contacting us. We will respond shortly.');

      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');

    } catch (e) {

      Alert.alert('Error', (e as Error).message || 'Failed to send message');

    }

    setLoading(false);

  };



  return (

    <Screen title="Contact Us" showBack headerRight={<CustomerHeaderActions />}>

      <Text style={styles.info}>Email: {contact.email}</Text>

      <Text style={styles.info}>Phone: {contact.phone}</Text>

      <Input label="Name" value={name} onChangeText={setName} />

      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

      <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Input label="Subject" value={subject} onChangeText={setSubject} />

      <Input label="Message" value={message} onChangeText={setMessage} multiline numberOfLines={4} />

      <Button title="Send Message" onPress={submit} variant="customer" loading={loading} />

    </Screen>

  );

}



const styles = StyleSheet.create({

  info: { marginBottom: 8, fontSize: 14 },

});


