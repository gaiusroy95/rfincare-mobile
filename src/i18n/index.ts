import i18n from 'i18next';

import { initReactI18next } from 'react-i18next';

import * as Localization from 'expo-localization';

// @ts-expect-error JSON imports

import en from './locales/en.json';

// @ts-expect-error JSON imports

import hi from './locales/hi.json';

// @ts-expect-error JSON imports

import bn from './locales/bn.json';

// @ts-expect-error JSON imports

import ta from './locales/ta.json';

// @ts-expect-error JSON imports

import te from './locales/te.json';

// @ts-expect-error JSON imports

import mr from './locales/mr.json';

// @ts-expect-error JSON imports

import gu from './locales/gu.json';

// @ts-expect-error JSON imports

import kn from './locales/kn.json';

// @ts-expect-error JS module

import { LANGUAGE_CODES } from './languages';



i18n.use(initReactI18next).init({

  resources: {

    en: { translation: en },

    hi: { translation: hi },

    bn: { translation: bn },

    ta: { translation: ta },

    te: { translation: te },

    mr: { translation: mr },

    gu: { translation: gu },

    kn: { translation: kn },

  },

  lng: Localization.getLocales()[0]?.languageCode || 'en',

  supportedLngs: LANGUAGE_CODES,

  fallbackLng: 'en',

  interpolation: { escapeValue: false },

});



export default i18n;


