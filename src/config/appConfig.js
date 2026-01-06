/**
 * ============================================
 * APP CONFIGURATION FILE
 * ============================================
 * 
 * Ye file software ki tamaam general settings rakhti hai.
 * Jab kisi naye client ko software dena ho, sirf is file mein
 * naam, logo, aur info badalni hogi.
 * 
 * ============================================
 */

const appConfig = {
    // --- BRANDING (Naam aur Identity) ---
    appName: {
        en: 'Nooriemaan',           // English naam
        ur: 'نورِ ایمان'              // Urdu naam
    },

    fullName: {
        en: 'Jamia Nooriemaan Digital Portal',
        ur: 'جامعہ نورِ ایمان ڈیجیٹل پورٹل'
    },

    tagline: {
        en: 'Empowering Education Through Technology',
        ur: 'ٹیکنالوجی کے ذریعے تعلیم کو بااختیار بنانا'
    },

    // --- LOGO ---
    logo: '/src/assets/logo-main.png',  // Logo ka path

    // --- CONTACT INFO ---
    contact: {
        phone: '+92-XXX-XXXXXXX',
        email: 'info@nooriemaan.edu.pk',
        website: 'www.nooriemaan.edu.pk',
        address: {
            en: 'Your Address Here',
            ur: 'یہاں پتہ لکھیں'
        }
    },

    // --- SOCIAL LINKS ---
    social: {
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: ''
    },

    // --- THEME COLORS (Rangon ki Settings) ---
    theme: {
        primary: '#10b981',         // Main green color
        primaryDark: '#047857',     // Dark green
        primaryLight: '#34d399',    // Light green
        error: '#dc2626',           // Red for errors
        success: '#059669',         // Success green
        warning: '#f59e0b',         // Warning amber
    },

    // --- COPYRIGHT ---
    copyright: {
        year: 2026,
        en: '© 2026 Nooriemaan - All Rights Reserved',
        ur: '© 2026 نورِ ایمان - تمام حقوق محفوظ ہیں'
    },

    // --- APP SETTINGS ---
    settings: {
        defaultLanguage: 'ur',      // Default language (ur/en)
        enableRTL: true,            // Right-to-Left support
        enableDarkMode: false,      // Dark mode (future feature)
        sessionTimeout: 30,         // Session timeout in minutes
    }
};

export default appConfig;
