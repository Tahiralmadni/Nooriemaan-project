import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, User, HelpCircle, Phone, Wifi, WifiOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
import PageLoader from '../components/PageLoader';

import logoMain from '../assets/logo-main.png';
import appConfig from '../config/appConfig';

/**
 * Login Component - NooriEmaan Digital Portal
 * Compact Enterprise Design with Logo Background
 */
const Login = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    // Update title when language changes
    useEffect(() => {
        document.title = t('pageTitles.login');
    }, [t, i18n.language]);

    // --- STATE ---
    const [grNumber, setGrNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [shouldShake, setShouldShake] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showPageLoader, setShowPageLoader] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // --- USE EFFECT (Page Load Hote Hi Kya Ho?) ---
    useEffect(() => {
        // Initial loading animation - 5 seconds for better visibility
        const savedUrdu = localStorage.getItem('font-ur')
            ? JSON.parse(localStorage.getItem('font-ur'))
            : { family: "'Noto Nastaliq Urdu', serif" };
        const savedEnglish = localStorage.getItem('font-en')
            ? JSON.parse(localStorage.getItem('font-en'))
            : { family: "'Amiri', serif" };

        document.documentElement.style.setProperty('--font-urdu', savedUrdu.family);
        document.documentElement.style.setProperty('--font-english', savedEnglish.family);

        // Initial loading animation - 5 seconds for better visibility
        setTimeout(() => {
            setInitialLoading(false);
        }, 1500);
    }, []);

    // --- INTERNET CONNECTIVITY CHECK ---
    useEffect(() => {
        // Track previous offline state
        let wasOffline = !navigator.onLine;

        // When internet comes back
        const handleOnline = () => {
            setIsOnline(true);
            // Show "Back Online" toast if was previously offline
            if (wasOffline) {
                // Green toast - 3 seconds
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
                            {t('toast.backOnline')}
                        </span>
                        {/* Checkmark */}
                        <span style={{ fontSize: '18px' }}>✅</span>
                    </div>
                ), { duration: 3000, position: 'top-center' });
            }
            wasOffline = false;
        };

        // When internet goes offline
        const handleOffline = () => {
            setIsOnline(false);
            wasOffline = true;
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);


    // --- TOAST HELPERS ---

    // Error toast (red)
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
                    boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)', // Shadow
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
        ), { duration: 4000, position: 'top-center' });
    };

    // Success toast (green)
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

    // --- FORM VALIDATION ---
    const validateForm = () => {
        // Check if GR number is empty
        if (!grNumber.trim()) {
            showErrorToast(t('validation.grNumberRequired')); // Error dikhao
            triggerShake(); // Card ko hila do
            return false;
        }
        // Check if password is too short
        if (password.length < 6) {
            showErrorToast(t('validation.passwordMinLength'));
            triggerShake();
            return false;
        }
        return true; // Form is valid
    };

    // Card shake animation logic
    const triggerShake = () => {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
    };

    // --- LOGIN HANDLER ---
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            // Convert GR number to email format for Firebase Auth
            const email = `${grNumber}@nooriemaan.edu.pk`;

            // Execute Firebase Login
            await signInWithEmailAndPassword(auth, email, password);

            // Login successful
            showSuccessToast(t('success.loginSuccess'));
            setIsLoading(false);

            // Remember Me functionality
            if (rememberMe) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userGR', grNumber);
            } else {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userGR');
            }

            // Show professional transition loader
            setShowPageLoader(true);

            // Redirect to dashboard after delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);

        } catch (error) {
            console.error('Firebase Login Error:', error.code);
            setIsLoading(false);

            // Error messages based on Firebase error codes
            if (error.code === 'auth/user-not-found') {
                showErrorToast(t('validation.grNotRegistered'));
            } else if (error.code === 'auth/wrong-password') {
                showErrorToast(t('validation.invalidCredentials'));
            } else if (error.code === 'auth/invalid-credential') {
                showErrorToast(t('validation.invalidCredentials'));
            } else if (error.code === 'auth/too-many-requests') {
                showErrorToast(t('validation.tooManyAttempts'));
            } else if (error.code === 'auth/network-request-failed') {
                showErrorToast(t('validation.networkError'));
            } else {
                showErrorToast(t('validation.invalidCredentials'));
            }
            triggerShake();
        }
    };

    // --- ANIMATIONS CONFIGURATION ---

    // Card entry animation (slide up)
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

    // Language Toggle Function
    const toggleLanguage = () => {
        const newLang = i18n.language === 'ur' ? 'en' : 'ur';
        i18n.changeLanguage(newLang);
    };

    // Detect text direction
    const isRTL = i18n.language === 'ur';
    const isDark = localStorage.getItem('darkMode') === 'true';

    // --- MAIN UI RENDER ---

    // 1. Initial Load State
    if (initialLoading) {
        return <PageLoader loadingText={t('loader.loading')} />;
    }

    // 2. Post-Login Transition State
    if (showPageLoader) {
        return <PageLoader loadingText={t('loader.preparingDashboard')} />;
    }

    // 3. Main Login Form State
    return (
        <>
            {/* Dynamic Page Title */}
            <Helmet defer={false}>
                <title>{t('pageTitles.login')}</title>
            </Helmet>

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
                        {t('login.noInternet')}
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
                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundColor: isDark ? '#0f172a' : undefined
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
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            borderRadius: '16px',
                            boxShadow: isDark ? '0 10px 40px -10px rgba(0,0,0,0.5)' : '0 10px 40px -10px rgba(4, 120, 87, 0.2), 0 0 0 1px rgba(4, 120, 87, 0.05)',
                            padding: '36px 32px',
                            position: 'relative'
                        }}
                    >
                        {/* Top Green Decoration Line - Animated glow effect */}
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: '60px', opacity: 1 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                height: '4px',
                                background: 'linear-gradient(90deg, #10b981, #047857)',
                                borderRadius: '0 0 4px 4px',
                                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)'
                            }}
                        />

                        {/* Logo Image - Subtle hover animation */}
                        <motion.div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginBottom: '16px'
                            }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <motion.img
                                src={logoMain}
                                alt={t('accessibility.logoAlt')}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                style={{
                                    height: '56px',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    cursor: 'pointer'
                                }}
                            />
                        </motion.div>

                        {/* Headings - Config se text aayega */}
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <motion.h1
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{
                                    fontSize: isRTL ? '22px' : '18px',
                                    fontWeight: '700',
                                    color: isDark ? '#e2e8f0' : '#0f172a',
                                    marginBottom: '4px'
                                }}
                            >
                                {/* Config se naam - White-labeling ke liye */}
                                {isRTL ? appConfig.fullName.ur : appConfig.fullName.en}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                style={{
                                    color: isDark ? '#94a3b8' : '#64748b',
                                    fontSize: '12px'
                                }}
                            >
                                {t('login.signInToContinue')}
                            </motion.p>
                        </div>

                        {/* --- LOGIN FORM --- */}
                        <form onSubmit={handleLogin}>

                            {/* 1. GR Number Input Field */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{
                                    position: 'relative',
                                    border: '1.5px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                                }}>
                                    {/* User Icon */}
                                    <span style={{
                                        position: 'absolute',
                                        left: '12px',
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
                                        placeholder={t('login.grNumberPlaceholder')}
                                        disabled={isLoading}
                                        dir="ltr"
                                        style={{
                                            width: '100%',
                                            padding: '12px 12px 12px 38px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: isDark ? '#e2e8f0' : '#1e293b',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            textAlign: 'left',
                                            fontFamily: 'var(--font-english)',
                                            direction: 'ltr'
                                        }}
                                        // Focus Styles (Green Border)
                                        onFocus={(e) => {
                                            e.target.parentElement.style.borderColor = '#10b981';
                                            e.target.parentElement.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
                                            e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.parentElement.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                                            e.target.parentElement.style.backgroundColor = isDark ? '#0f172a' : '#f8fafc';
                                            e.target.parentElement.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* 2. Password Input Field */}
                            <div style={{ marginBottom: '14px' }}>
                                <div style={{
                                    position: 'relative',
                                    border: '1.5px solid ' + (isDark ? '#334155' : '#e2e8f0'),
                                    borderRadius: '10px',
                                    transition: 'all 0.2s',
                                    backgroundColor: isDark ? '#0f172a' : '#f8fafc'
                                }}>
                                    {/* Lock Icon */}
                                    <span style={{
                                        position: 'absolute',
                                        left: '12px',
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
                                        placeholder={t('login.passwordPlaceholder')}
                                        disabled={isLoading}
                                        dir="ltr"
                                        // Caps Lock Check
                                        onKeyDown={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                                        onKeyUp={(e) => setCapsLockOn(e.getModifierState('CapsLock'))}
                                        style={{
                                            width: '100%',
                                            padding: '12px 40px 12px 38px',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            color: isDark ? '#e2e8f0' : '#1e293b',
                                            outline: 'none',
                                            boxSizing: 'border-box',
                                            textAlign: 'left',
                                            fontFamily: 'var(--font-english)',
                                            direction: 'ltr'
                                        }}
                                        onFocus={(e) => {
                                            e.target.parentElement.style.borderColor = '#10b981';
                                            e.target.parentElement.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
                                            e.target.parentElement.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.parentElement.style.borderColor = isDark ? '#334155' : '#e2e8f0';
                                            e.target.parentElement.style.backgroundColor = isDark ? '#0f172a' : '#f8fafc';
                                            e.target.parentElement.style.boxShadow = 'none';
                                            setCapsLockOn(false);
                                        }}
                                    />
                                    {/* Eye Toggle Button - Animated microinteraction */}
                                    <motion.button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.2, color: '#047857' }}
                                        whileTap={{ scale: 0.9 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                        style={{
                                            position: 'absolute',
                                            right: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#94a3b8',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            borderRadius: '50%'
                                        }}
                                    >
                                        <AnimatePresence mode="wait">
                                            {showPassword ? (
                                                <motion.div
                                                    key="eyeOff"
                                                    initial={{ opacity: 0, rotate: -90 }}
                                                    animate={{ opacity: 1, rotate: 0 }}
                                                    exit={{ opacity: 0, rotate: 90 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <EyeOff size={16} />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="eye"
                                                    initial={{ opacity: 0, rotate: 90 }}
                                                    animate={{ opacity: 1, rotate: 0 }}
                                                    exit={{ opacity: 0, rotate: -90 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <Eye size={16} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                </div>

                                {/* Caps Lock Warning Alert - Animated entry */}
                                <AnimatePresence>
                                    {capsLockOn && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                marginTop: '8px',
                                                padding: '8px 12px',
                                                backgroundColor: isDark ? '#1e293b' : '#fffbeb',
                                                border: isDark ? '1px solid #854d0e' : '1px solid #fcd34d',
                                                borderRadius: '8px',
                                                color: '#d97706',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
                                            }}
                                        >
                                            <motion.span
                                                animate={{ rotate: [0, -10, 10, -10, 0] }}
                                                transition={{ duration: 0.5, repeat: 2 }}
                                                style={{ fontSize: '14px' }}
                                            >
                                                ⚠️
                                            </motion.span>
                                            <span>
                                                {t('toast.capsLock')}
                                            </span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
                                        backgroundColor: rememberMe ? '#10b981' : (isDark ? '#334155' : '#ffffff'),
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
                                        color: isDark ? '#94a3b8' : '#475569',
                                        cursor: 'pointer',
                                        userSelect: 'none', // Text select na ho
                                        fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                                        fontWeight: '500'
                                    }}
                                >
                                    {t('login.rememberMe')}
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
                                        <span>{t('login.loadingButton')}</span>
                                    </>
                                ) : (
                                    // Login Text
                                    <>
                                        <ArrowRight size={16} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                        <span>{t('login.submitButton')}</span>
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
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#047857'}
                                    onMouseOut={(e) => e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b'}
                                >
                                    <HelpCircle size={12} />
                                    <span>{t('login.forgotPassword')}</span>
                                </button>

                                <span style={{ color: isDark ? '#475569' : '#e2e8f0' }}>|</span>

                                <button
                                    type="button"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '11px',
                                        color: isDark ? '#94a3b8' : '#64748b',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.color = '#047857'}
                                    onMouseOut={(e) => e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b'}
                                >
                                    <Phone size={12} />
                                    <span>{t('login.support')}</span>
                                </button>
                            </div>
                        </form>
                    </motion.div>

                </motion.div>

                {/* Footer Credits - Config se copyright aayega */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        position: 'fixed',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 10
                    }}
                >
                    <p style={{
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#64748b',
                        margin: 0
                    }}>
                        {/* Config se copyright text */}
                        {isRTL ? appConfig.copyright.ur : appConfig.copyright.en}
                    </p>
                </motion.div>

            </div >
        </>
    );
};

export default Login;