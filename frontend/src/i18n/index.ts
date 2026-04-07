import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import km from './km.json';
import fr from './fr.json';
import mg from './mg.json';
import vi from './vi.json';

const savedLang = localStorage.getItem('language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    km: { translation: km },
    fr: { translation: fr },
    mg: { translation: mg },
    vi: { translation: vi },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Set html lang attribute on init and on change
document.documentElement.lang = savedLang;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
