import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';

const savedLanguage = localStorage.getItem('activesetu_language') || localStorage.getItem('coopgig_language');

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: savedLanguage === 'hi' ? 'hi' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

i18n.on('languageChanged', (language) => {
  localStorage.setItem('activesetu_language', language);
  localStorage.removeItem('coopgig_language');
  document.documentElement.lang = language;
});

export default i18n;
