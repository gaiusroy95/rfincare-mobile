import React, { useState } from 'react';

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useTranslation } from 'react-i18next';

import i18n from '@/src/i18n';

// @ts-expect-error JS module

import { LANGUAGE_CODES } from '@/src/i18n/languages';

import { colors } from '@/src/theme';



const LABELS: Record<string, string> = {

  en: 'English',

  hi: 'हिन्दी',

  bn: 'বাংলা',

  ta: 'தமிழ்',

  te: 'తెలుగు',

  mr: 'मराठी',

  gu: 'ગુજરાતી',

  kn: 'ಕನ್ನಡ',

};



export default function LanguageSwitcher() {

  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const current = i18n.language?.split('-')[0] || 'en';



  return (

    <View style={styles.wrap}>

      <TouchableOpacity onPress={() => setOpen(!open)} style={styles.btn}>

        <Text style={styles.btnText}>{t('common.language', 'Language')}: {LABELS[current] || current}</Text>

      </TouchableOpacity>

      {open && (LANGUAGE_CODES as string[]).map((code) => (

        <TouchableOpacity

          key={code}

          style={[styles.option, code === current && styles.optionActive]}

          onPress={() => { i18n.changeLanguage(code); setOpen(false); }}

        >

          <Text style={styles.optionText}>{LABELS[code] || code}</Text>

        </TouchableOpacity>

      ))}

    </View>

  );

}



const styles = StyleSheet.create({

  wrap: { marginVertical: 12 },

  btn: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },

  btnText: { fontWeight: '600', color: colors.foreground },

  option: { padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border },

  optionActive: { backgroundColor: colors.muted },

  optionText: { color: colors.foreground },

});


