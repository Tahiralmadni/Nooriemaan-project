import { useState, useEffect } from 'react';  // React ke hooks jo state (data) aur side effects (jaise font load karna) sambhalte hain
import { useTranslation } from 'react-i18next'; // Urdu/English language badalne ke liye library
import { motion } from 'framer-motion'; // Smooth animation ke liye (card ka entry effect, shake effect)
import { Lock, Eye, EyeOff, Loader2, ArrowRight, User, HelpCircle, Phone, Type } from 'lucide-react'; // Icons ki library (Tala, Aankh, User wagera)
import FontSettings, { getSavedFont } from '../components/FontSettings'; // Font change karne wala component
import toast, { Toaster } from 'react-hot-toast'; // Khubsurat notifications (popups) ke liye

// Import main logo
import logoMain from '../assets/logo-main.png'; // Madrassa ka main logo import kiya
import i18n from '../config/i18n'; // Language configuration file

/**
 * Login Component - NooriEmaan Digital Portal
 * Compact Enterprise Design with Logo Background
 */
const Login = () => {
    // Translation hook (t('key') use karke hum urdu/english text dikhayenge)
    const { t } = useTranslation();

    // --- STATE MANAGEMENT (Data Store Karne Ki Jagah) ---
    const [grNumber, setGrNumber] = useState(''); // User jo ID/GR Number type karega wo yahan save hoga
    const [password, setPassword] = useState(''); // User jo Password type karega wo yahan save hoga
    const [showPassword, setShowPassword] = useState(false); // Kya password dikhana hai ya chhupana hai? (Aankh wala button)
    const [isLoading, setIsLoading] = useState(false); // Jab login ho raha ho to spinner ghumane ke liye
    const [shouldShake, setShouldShake] = useState(false); // Agar password ghalat ho to card hilane (shake) ke liye
    const [showFontSettings, setShowFontSettings] = useState(false); // Font settings wala modal kholne/band karne ke liye
    const [capsLockOn, setCapsLockOn] = useState(false); // Ye check karne ke liye ke user ka Caps Lock On to nahi?
    const [rememberMe, setRememberMe] = useState(false); // "Mujhe Yaad Rakhein" checkbox ki state
    const [isOnline, setIsOnline] = useState(navigator.onLine); // Internet connection ki halat (true = online, false = offline)

    // --- USE EFFECT (Page Load Hote Hi Kya Ho?) ---
    // Jab page pehli baar khulega, to saved font settings apply hongi
    useEffect(() => {
        const savedUrdu = getSavedFont('ur'); // Local storage se Urdu font uthaya
        const savedEnglish = getSavedFont('en'); // Local storage se English font uthaya
        // CSS variables update kiye taaki poore page ka font change ho jaye
        document.documentElement.style.setProperty('--font-urdu', savedUrdu.family);
        document.documentElement.style.setProperty('--font-english', savedEnglish.family);
    }, []);

    // --- INTERNET CONNECTIVITY CHECK (Online/Offline Status) ---
    // Ye useEffect internet connection monitor karta hai
    useEffect(() => {
        // Track karna ke pehle offline tha ya nahi
        let wasOffline = !navigator.onLine;

        // Jab internet wapas aaye
        const handleOnline = () => {
            setIsOnline(true);
            // Agar pehle offline tha, to "Back Online" toast dikhao
            if (wasOffline) {
                // Professional green toast - 3 second ke liye
                toast.custom((t) => (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green Gradient
                            color: '#fff',
                            fontWeight: '600',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                            fontFamily: i18n.language === 'ur' ? 'var(--font-urdu)' : 'var(--font-english)',
                            fontSize: i18n.language === 'ur' ? '16px' : '14px',
                            direction: i18n.language === 'ur' ? 'rtl' : 'ltr',
                            transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                            opacity: t.visible ? 1 : 0,
                            transition: 'all 0.3s ease-in-out',
                            minWidth: '280px',
                            zIndex: 99999
                        }}
                    >
                        {/* WiFi Connected Icon */}
                        <span style={{ fontSize: '20px' }}>📶</span>
                        {/* Message - Urdu/English */}
                        <span style={{ flex: 1 }}>
                            {i18n.language === 'ur'
                                ? 'انٹرنیٹ کنکشن بحال ہو گیا!'
                                : 'You are back online!'
                            }
                        </span>
                        {/* Checkmark */}
                        <span style={{ fontSize: '18px' }}>✅</span>
                    </div>
                ), { duration: 3000, position: 'top-center' }); // 3 second tak dikhe
            }
            wasOffline = false; // Reset flag
        };

        // Jab internet chala jaye
        const handleOffline = () => {
            setIsOnline(false);
            wasOffline = true; // Mark karo ke offline ho gaye
        };

        // Browser events par listeners lagaye
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup - jab component unmount ho to listeners hata do
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    // --- TOAST HELPERS (Messages Dikhane Ke Liye) ---

    // Ghalati (Error) ka message dikhane ke liye function (Laal rang mein)
    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red Gradient
                    color: '#fff',
                    fontWeight: '600',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)', // Saaya (Shadow)
                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)', // Language ke hisaab se font
                    fontSize: isRTL ? '16px' : '14px',
                    direction: isRTL ? 'rtl' : 'ltr',
                    transform: t.visible ? 'translateY(0)' : 'translateY(-20px)', // Animation (upar se niche aana)
                    opacity: t.visible ? 1 : 0,
                    transition: 'all 0.3s ease-in-out',
                    minWidth: '280px',
                    zIndex: 99999
                }}
            >
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <span style={{ flex: 1 }}>{message}</span>
                {/* Close Button (Cross) */}
                <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                    }}
                    // Hover effects for close button
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    ✕
                </button>
            </div>
        ), { duration: 4000, position: 'top-center' }); // 4 second tak dikhega
    };

    // Kamyabi (Success) ka message dikhane ke liye function (Hara rang mein)
    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green Gradient
                    color: '#fff',
                    fontWeight: '600',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                    fontSize: isRTL ? '16px' : '14px',
                    direction: isRTL ? 'rtl' : 'ltr',
                    transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                    opacity: t.visible ? 1 : 0,
                    transition: 'all 0.3s ease-in-out',
                    minWidth: '280px',
                    zIndex: 99999
                }}
            >
                <span style={{ fontSize: '20px' }}>✅</span>
                <span style={{ flex: 1 }}>{message}</span>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.35)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    ✕
                </button>
            </div>
        ), { duration: 4000, position: 'top-center' });
    };

    // --- FORM VALIDATION (Check karna ke data sahi hai ya nahi) ---
    const validateForm = () => {
        // Agar GR Number khali hai
        if (!grNumber.trim()) {
            showErrorToast(t('validation.grNumberRequired')); // Error dikhao
            triggerShake(); // Card ko hila do
            return false;
        }
        // Agar password chhota hai
        if (password.length < 6) {
            showErrorToast(t('validation.passwordMinLength'));
            triggerShake();
            return false;
        }
        return true; // Sab theek hai
    };

    // Card ko hilane (Shake) ka logic
    const triggerShake = () => {
        setShouldShake(true); // Shake shuru
        setTimeout(() => setShouldShake(false), 500); // Aadhe second baad band
    };

    // --- LOGIN HANDLER (Jab Button Dabayein) ---
    const handleLogin = async (e) => {
        e.preventDefault(); // Page refresh hone se roko
        if (!validateForm()) return; // Agar form ghalat hai to yahi ruk jao

        setIsLoading(true); // Spinner ghuma do

        // Fake network delay (3 second ka intezar) taaki loading feel ho
        setTimeout(() => {
            // Test Credentials check karna (Hardcoded logic)
            if (grNumber === '12345' && password === '654321') {
                console.log('✅ Login successful!');
                showSuccessToast(t('success.loginSuccess'));
            } else {
                showErrorToast(t('validation.invalidCredentials'));
                triggerShake(); // Ghalat password par shake karo
            }
            setIsLoading(false); // Loading band
        }, 3000);
    };

    // --- ANIMATIONS CONFIGURATION ---

    // Card ki entry animation (niche se upar aana)
    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, ease: 'easeOut' }
        }
    };

    // Card shake animation keyframes
    const shakeVariants = {
        shake: { x: [0, -6, 6, -6, 6, -3, 3, 0], transition: { duration: 0.35 } }
    };

    // Language Toggle Function (Urdu <-> English)
    const toggleLanguage = () => {
        const newLang = i18n.language === 'ur' ? 'en' : 'ur';
        i18n.changeLanguage(newLang);
    };

    // Check karna ke abhi Urdu hai ya English? (RTL ya LTR)
    const isRTL = i18n.language === 'ur';

    // --- MAIN UI RENDER ---
    return (
        <>
            {/* Toaster Component (Notifications ke liye) */}
            <Toaster containerStyle={{ zIndex: 99999 }} />

            {/* --- OFFLINE BANNER --- */}
            {/* Ye banner tab dikhai dega jab internet connection na ho */}
            {!isOnline && (
                <motion.div
                    initial={{ y: -60, opacity: 0 }} // Shuru mein upar aur invisible
                    animate={{ y: 0, opacity: 1 }} // Animate hokar niche aaye
                    exit={{ y: -60, opacity: 0 }} // Jab jaye to wapas upar
                    transition={{ duration: 0.3, ease: 'easeOut' }} // Smooth animation
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100000, // Sab se upar dikhe
                        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', // Laal gradient
                        color: '#ffffff',
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                        fontSize: isRTL ? '15px' : '14px',
                        fontWeight: '600',
                        boxShadow: '0 4px 20px rgba(220, 38, 38, 0.4)', // Red shadow
                        direction: isRTL ? 'rtl' : 'ltr'
                    }}
                >
                    {/* Warning Icon */}
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    {/* Message - Urdu/English dono mein */}
                    <span>
                        {isRTL
                            ? 'انٹرنیٹ کنکشن منقطع ہے'
                            : 'Internet Connection Lost'
                        }
                    </span>
                    {/* Pulsing dot - connection loss ka indicator */}
                    <span style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#fca5a5',
                        borderRadius: '50%',
                        animation: 'pulse 1.5s infinite' // CSS animation lagegi
                    }} />
                </motion.div>
            )}

            {/* Main Wrapper */}
            <div
                dir={isRTL ? 'rtl' : 'ltr'} // Direction set karna based on language
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)', // Dynamic Font
                    background: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Background Watermark Logo (Halka sa peeche) */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '350px',
                    height: '350px',
                    backgroundImage: `url(${logoMain})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    opacity: 0.08, // Bohot halka (8%)
                    pointerEvents: 'none'
                }} />

                {/* Decorative Blobs (Green Circles in corners) */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    right: '-100px',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-80px',
                    left: '-80px',
                    width: '250px',
                    height: '250px',
                    background: 'radial-gradient(circle, rgba(4, 120, 87, 0.1) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                {/* Top Buttons (Language & Font) */}
                <div style={{
                    position: 'fixed',
                    top: '16px',
                    [isRTL ? 'left' : 'right']: '16px', // Side change based on language
                    zIndex: 20,
                    display: 'flex',
                    gap: '8px'
                }}>
                    {/* Language Switcher Button */}
                    <button
                        onClick={toggleLanguage}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#475569',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.2s',
                            fontWeight: '500'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#047857';
                            e.currentTarget.style.color = '#047857';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#475569';
                        }}
                    >
                        <span>{isRTL ? '🇬🇧' : '🇵🇰'}</span>
                        <span>{isRTL ? 'EN' : 'اردو'}</span>
                    </button>

                    {/* Font Settings Button */}
                    <button
                        onClick={() => setShowFontSettings(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#475569',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.2s',
                            fontWeight: '500'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#047857';
                            e.currentTarget.style.color = '#047857';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.color = '#475569';
                        }}
                    >
                        <Type size={14} />
                        <span>{isRTL ? 'فونٹ' : 'Font'}</span>
                    </button>
                </div>

                {/* --- LOGIN CARD CONTAINER --- */}
                <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    style={{
                        position: 'relative',
                        zIndex: 10,
                        width: '100%',
                        maxWidth: '400px',
                        padding: '0 16px'
                    }}
                >
                    <motion.div
                        animate={shouldShake ? 'shake' : ''} // Shake animation trigger
                        variants={shakeVariants}
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '16px',
                            boxShadow: '0 10px 40px -10px rgba(4, 120, 87, 0.2), 0 0 0 1px rgba(4, 120, 87, 0.05)',
                            padding: '36px 32px',
                            position: 'relative'
                        }}
                    >
                        {/* Top Green Decoration Line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60px',
                            height: '4px',
                            background: 'linear-gradient(90deg, #10b981, #047857)',
                            borderRadius: '0 0 4px 4px'
                        }} />

                        {/* Logo Image */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: '16px'
                        }}>
                            <img
                                src={logoMain}
                                alt={t('accessibility.logoAlt')}
                                style={{
                                    height: '56px',
                                    width: 'auto',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>

                        {/* Headings */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h1 style={{
                                fontSize: isRTL ? '22px' : '18px',
                                fontWeight: '700',
                                color: '#0f172a',
                                marginBottom: '4px'
                            }}>
                                {isRTL ? 'نورِ ایمان ڈیجیٹل پورٹل' : 'Nooriemaan Digital Portal'}
                            </h1>
                            <p style={{
                                color: '#64748b',
                                fontSize: '12px'
                            }}>
                                {isRTL ? 'اپنے اکاؤنٹ میں لاگ ان کریں' : 'Sign in to continue'}
                            </p>
                        </div>

                        {/* --- LOGIN FORM --- */}
                        <form onSubmit={handleLogin}>

                            {/* 1. GR Number Input Field */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{
                                    position: 'relative',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#f8fafc'
                                }}>
                                    {/* User Icon */}
                                    <span style={{
                                        position: 'absolute',
                                        [isRTL ? 'right' : 'left']: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8'
                                    }}>
                                        <User size={16} />
                                    </span>
                                    {/* Actual Input */}
                                    <input
                                        id="grNumber"
                                        type="text"
                                        value={grNumber}
                                        onChange={(e) => setGrNumber(e.target.value)} // State update
                                        placeholder={isRTL ? 'جی آر نمبر' : 'GR Number / Username'}
                                        disabled={isLoading}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            [isRTL ? 'paddingRight' : 'paddingLeft']: '38px', // Icon ke liye jagah
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: '#1e293b',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            textAlign: isRTL ? 'right' : 'left',
                                            fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                                        }}
                                        // Focus Styles (Green Border)
                                        onFocus={(e) => {
                                            e.target.parentElement.style.borderColor = '#10b981';
                                            e.target.parentElement.style.backgroundColor = '#ffffff';
                                            e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.parentElement.style.borderColor = '#e2e8f0';
                                            e.target.parentElement.style.backgroundColor = '#f8fafc';
                                            e.target.parentElement.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 2. Password Input Field */}
                            <div style={{ marginBottom: '14px' }}>
                                <div style={{
                                    position: 'relative',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    backgroundColor: '#f8fafc'
                                }}>
                                    {/* Lock Icon */}
                                    <span style={{
                                        position: 'absolute',
                                        [isRTL ? 'right' : 'left']: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8'
                                    }}>
                                        <Lock size={16} />
                                    </span>
                                    {/* Input */}
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'} // Show/Hide Logic
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={isRTL ? 'پاس ورڈ' : 'Password'}
                                        disabled={isLoading}
                                        // Caps Lock Check
                                        onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                                        onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            [isRTL ? 'paddingRight' : 'paddingLeft']: '38px',
                                            [isRTL ? 'paddingLeft' : 'paddingRight']: '40px', // Eye Icon ke liye jagah
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: '#1e293b',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            textAlign: isRTL ? 'right' : 'left',
                                            fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                                        }}
                                        onFocus={(e) => {
                                            e.target.parentElement.style.borderColor = '#10b981';
                                            e.target.parentElement.style.backgroundColor = '#ffffff';
                                            e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.parentElement.style.borderColor = '#e2e8f0';
                                            e.target.parentElement.style.backgroundColor = '#f8fafc';
                                            e.target.parentElement.style.boxShadow = 'none';
                                            setCapsLockOn(false);
                                        }}
                                    />
                                    {/* Eye Toggle Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        style={{
                                            position: 'absolute',
                                            [isRTL ? 'left' : 'right']: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            display: 'flex'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.color = '#047857'}
                                        onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {/* Caps Lock Warning Alert */}
                                {capsLockOn && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginTop: '8px',
                                        padding: '8px 12px',
                                        backgroundColor: '#fffbeb',
                                        border: '1px solid #fcd34d',
                                        borderRadius: '8px',
                                        color: '#d97706',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                                    }}>
                                        <span style={{ fontSize: '14px' }}>⚠️</span>
                                        <span>
                                            {isRTL
                                                ? 'دھیان دیں: Caps Lock آن ہے'
                                                : 'Warning: Caps Lock is ON'
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* 3. Remember Me Checkbox - Mujhe Yaad Rakhein Option */}
                            {/* Ye checkbox user ko option deta hai ke unka login yaad rakha jaye */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '16px',
                                marginTop: '4px'
                            }}>
                                {/* Custom Styled Checkbox - Emerald green theme ke saath */}
                                <div
                                    onClick={() => setRememberMe(!rememberMe)} // Click par state toggle hogi
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '6px',
                                        border: rememberMe ? '2px solid #10b981' : '2px solid #cbd5e1', // Agar checked hai to green border
                                        backgroundColor: rememberMe ? '#10b981' : '#ffffff', // Agar checked hai to green background
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease', // Smooth color change
                                        boxShadow: rememberMe ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none' // Checked hone par halka shadow
                                    }}
                                >
                                    {/* Checkmark Icon - Sirf jab checked ho tab dikhe */}
                                    {rememberMe && (
                                        <span style={{
                                            color: '#ffffff',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            lineHeight: 1
                                        }}>✓</span>
                                    )}
                                </div>

                                {/* Label Text - Urdu/English dono support karta hai */}
                                <label
                                    onClick={() => setRememberMe(!rememberMe)} // Label par click bhi kaam karega
                                    style={{
                                        fontSize: '13px',
                                        color: '#475569',
                                        cursor: 'pointer',
                                        userSelect: 'none', // Text select na ho
                                        fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                                        fontWeight: '500'
                                    }}
                                >
                                    {isRTL ? 'مجھے یاد رکھیں' : 'Remember Me'}
                                </label>
                            </div>

                            {/* 4. Main Login Button */}
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: isLoading
                                        ? '#94a3b8' // Disabled color
                                        : 'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Gradient
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {isLoading ? (
                                    // Loading Spinner
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>{isRTL ? 'انتظار...' : 'Please wait...'}</span>
                                    </>
                                ) : (
                                    // Login Text
                                    <>
                                        <ArrowRight size={16} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                        <span>{isRTL ? 'لاگ ان' : 'LOG IN'}</span>
                                    </>
                                )}
                            </motion.button>

                            {/* 4. Footer Links (Forgot Password / Support) */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '16px',
                                marginTop: '16px'
                            }}>
                                <button
                                    type="button"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        color: '#64748b',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#047857'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                                >
                                    <HelpCircle size={12} />
                                    <span>{isRTL ? 'پاس ورڈ بھولے؟' : 'Forgot Password?'}</span>
                                </button>

                                <span style={{ color: '#e2e8f0' }}>|</span>

                                <button
                                    type="button"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        color: '#64748b',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#047857'}
                                    onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
                                >
                                    <Phone size={12} />
                                    <span>{isRTL ? 'رابطہ' : 'Support'}</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>

                </motion.div>

                {/* Footer Credits - Fixed at Bottom */}
                <div style={{
                    position: 'fixed',
                    bottom: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10
                }}>
                    <p style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#64748b',
                        margin: 0
                    }}>
                        {isRTL ? '© 2026 جامعہ نورِ ایمان - تمام حقوق محفوظ ہیں' : '© 2026 Jamia Nooriemaan - All Rights Reserved'}
                    </p>
                </div>
                {/* Font Settings Modal */}
                <FontSettings
                    isOpen={showFontSettings}
                    onClose={() => setShowFontSettings(false)}
                />
            </div>
        </>
    );
};

export default Login;