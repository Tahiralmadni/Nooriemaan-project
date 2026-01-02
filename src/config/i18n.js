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
        appName: 'نورِ ایمان',
        portalSubtitle: 'ڈیجیٹل پورٹل',

        // Welcome section
        welcome: {
            title: 'خوش آمدید',
            subtitle: 'نورِ ایمان ڈیجیٹل پورٹل',
            description: 'یہ پورٹل طلباء، اساتذہ اور منتظمین کے لیے ڈیزائن کیا گیا ہے۔',
            feature1: '📊 حاضری اور نتائج دیکھیں',
            feature2: '💰 فیس کی تفصیلات',
            feature3: '📝 اساتذہ کی رپورٹس',
        },

        // Login page
        login: {
            title: 'لاگ ان کریں',
            grNumberLabel: 'جی آر نمبر',
            grNumberPlaceholder: 'اپنا جی آر نمبر درج کریں',
            passwordLabel: 'پاس ورڈ',
            passwordPlaceholder: 'پاس ورڈ درج کریں',
            submitButton: 'لاگ ان',
            loadingButton: 'لاگ ان ہو رہا ہے...',
            forgotPassword: 'پاس ورڈ بھول گئے؟',
        },

        // Validation messages
        validation: {
            grNumberRequired: 'براہ کرم جی آر نمبر درج کریں',
            passwordMinLength: 'پاسورڈ کم از کم 6 حروف کا ہونا چاہیے',
            invalidCredentials: 'جی آر نمبر یا پاسورڈ غلط ہے',
            tooManyAttempts: 'بہت زیادہ کوششیں۔ بعد میں دوبارہ کوشش کریں',
            networkError: 'نیٹ ورک کی خرابی۔ اپنا انٹرنیٹ چیک کریں',
            accountDisabled: 'یہ اکاؤنٹ غیر فعال ہے',
            loginFailed: 'لاگ ان ناکام۔ دوبارہ کوشش کریں',
        },

        // Accessibility
        accessibility: {
            showPassword: 'پاسورڈ دکھائیں',
            hidePassword: 'پاسورڈ چھپائیں',
            logoAlt: 'نورِ ایمان لوگو',
        },

        // Footer
        footer: {
            copyright: '© 2026 نورِ ایمان - تمام حقوق محفوظ ہیں',
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
        appName: 'Nooriemaan',
        portalSubtitle: 'Digital Portal',

        // Welcome section
        welcome: {
            title: 'Welcome',
            subtitle: 'Nooriemaan Digital Portal',
            description: 'This portal is designed for students, teachers and administrators.',
            feature1: '📊 View Attendance & Results',
            feature2: '💰 Fee Details',
            feature3: '📝 Teacher Reports',
        },

        // Login page
        login: {
            title: 'Login',
            grNumberLabel: 'GR Number',
            grNumberPlaceholder: 'Enter GR Number',
            passwordLabel: 'Password',
            passwordPlaceholder: 'Enter Password',
            submitButton: 'Login',
            loadingButton: 'Logging in...',
            forgotPassword: 'Forgot Password?',
        },

        // Validation messages
        validation: {
            grNumberRequired: 'Please enter GR Number',
            passwordMinLength: 'Password must be at least 6 characters',
            invalidCredentials: 'Invalid GR Number or Password',
            tooManyAttempts: 'Too many attempts. Please try again later',
            networkError: 'Network error. Check your internet connection',
            accountDisabled: 'This account has been disabled',
            loginFailed: 'Login failed. Please try again',
        },

        // Accessibility
        accessibility: {
            showPassword: 'Show password',
            hidePassword: 'Hide password',
            logoAlt: 'Nooriemaan Logo',
        },

        // Footer
        footer: {
            copyright: '© 2026 Nooriemaan - All Rights Reserved',
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
