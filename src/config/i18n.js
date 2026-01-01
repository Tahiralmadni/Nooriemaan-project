import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * i18n Configuration for NooriEmaan Digital Portal
 * Supports Urdu (primary) and English languages
 */

// Urdu translations
const urduTranslations = {
    translation: {
        // App branding
        appName: 'جامعہ نورِ ایمان',
        portalSubtitle: 'ڈیجیٹل پورٹل میں لاگ ان کریں',

        // Login page
        login: {
            title: 'لاگ ان',
            usernameLabel: 'یوزر نیم / جی آر نمبر',
            usernamePlaceholder: 'اپنا یوزر نیم درج کریں',
            passwordLabel: 'پاس ورڈ',
            passwordPlaceholder: 'اپنا پاس ورڈ درج کریں',
            submitButton: 'لاگ ان',
            loadingButton: 'لاگ ان ہو رہا ہے...',
            forgotPassword: 'پاس ورڈ بھول گئے؟',
            helpText: 'یا مدد کے لیے رابطہ کریں',
            secureConnection: 'محفوظ کنکشن',
        },

        // Validation messages
        validation: {
            usernameRequired: 'براہ کرم یوزر نیم درج کریں',
            passwordMinLength: 'پاسورڈ کم از کم 6 حروف کا ہونا چاہیے',
            invalidCredentials: 'یوزر نیم یا پاسورڈ غلط ہے',
        },

        // Accessibility
        accessibility: {
            showPassword: 'پاسورڈ دکھائیں',
            hidePassword: 'پاسورڈ چھپائیں',
            logoAlt: 'جامعہ نورِ ایمان لوگو',
        },

        // Footer
        footer: {
            copyright: '© 2026 جامعہ نورِ ایمان | جملہ حقوق محفوظ ہیں',
        },

        // Success messages
        success: {
            loginSuccess: 'لاگ ان کامیاب!',
        },
    },
};

// English translations
const englishTranslations = {
    translation: {
        // App branding
        appName: 'Jamia Nooriemaan',
        portalSubtitle: 'Login to Digital Portal',

        // Login page
        login: {
            title: 'Login',
            usernameLabel: 'Username / GR Number',
            usernamePlaceholder: 'Enter username',
            passwordLabel: 'Password',
            passwordPlaceholder: 'Enter password',
            submitButton: 'Login',
            loadingButton: 'Logging in...',
            forgotPassword: 'Forgot Password?',
            helpText: 'Or contact us for help',
            secureConnection: 'Secure Connection',
        },

        // Validation messages
        validation: {
            usernameRequired: 'Please enter username',
            passwordMinLength: 'Password must be at least 6 characters',
            invalidCredentials: 'Invalid username or password',
        },

        // Accessibility
        accessibility: {
            showPassword: 'Show password',
            hidePassword: 'Hide password',
            logoAlt: 'Jamia Nooriemaan Logo',
        },

        // Footer
        footer: {
            copyright: '© 2026 Jamia Nooriemaan - All Rights Reserved',
        },

        // Success messages
        success: {
            loginSuccess: 'Login Successful!',
        },
    },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            ur: urduTranslations,
            en: englishTranslations,
        },
        lng: 'ur', // Default language is Urdu
        fallbackLng: 'ur',
        interpolation: {
            escapeValue: false, // React already handles XSS
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
