import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations from JSON files
import urduTranslations from '../locales/ur.json';
import englishTranslations from '../locales/en.json';

/**
 * i18n Configuration for NooriEmaan Digital Portal
 * Supports Urdu (primary) and English languages
 * 
 * Translation files are located in:
 * - src/locales/ur.json (Urdu)
 * - src/locales/en.json (English)
 */

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ur: { translation: urduTranslations },
            en: { translation: englishTranslations },
        },
        // Don't set lng here - let the detector handle it
        // It will check localStorage first, then fallback to 'en'
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already handles XSS
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
