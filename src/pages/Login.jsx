import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';

// Import main logo
import logoMain from '../assets/logo-main.png';
import i18n from '../config/i18n';

/**
 * Login Component - NooriEmaan Digital Portal
 * Enterprise-grade authentication interface with RTL Urdu support
 */
const Login = () => {
    const { t } = useTranslation();

    // State Management
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [shouldShake, setShouldShake] = useState(false);

    // Validation
    const validateForm = () => {
        setError('');
        if (!username.trim()) {
            setError(t('validation.usernameRequired'));
            triggerShake();
            return false;
        }
        if (password.length < 6) {
            setError(t('validation.passwordMinLength'));
            triggerShake();
            return false;
        }
        return true;
    };

    const triggerShake = () => {
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 500);
    };

    // Authentication Handler
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        setTimeout(() => {
            if (username === 'admin' && password === 'admin123') {
                console.log('✅ Login successful!');
                alert(t('success.loginSuccess'));
            } else {
                setError(t('validation.invalidCredentials'));
                triggerShake();
            }
            setIsLoading(false);
        }, 2000);
    };

    // Animation Variants
    const cardVariants = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
    };

    const shakeVariants = {
        shake: { x: [0, -8, 8, -8, 8, -4, 4, 0], transition: { duration: 0.4 } }
    };

    const buttonVariants = {
        idle: { scale: 1 },
        hover: { scale: 1.01, y: -1, transition: { duration: 0.15 } },
        tap: { scale: 0.99 }
    };

    // Language Toggle
    const toggleLanguage = () => {
        const newLang = i18n.language === 'ur' ? 'en' : 'ur';
        i18n.changeLanguage(newLang);
    };

    const isRTL = i18n.language === 'ur';

    return (
        <div
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#f8fafc',
                backgroundImage: `radial-gradient(circle at 50% 0%, rgba(4, 120, 87, 0.03) 0%, transparent 50%)`,
                fontFamily: isRTL ? 'var(--font-urdu)' : 'Inter, sans-serif'
            }}
        >
            {/* Language Switcher */}
            <div style={{ position: 'absolute', top: '20px', [isRTL ? 'left' : 'right']: '20px', zIndex: 10 }}>
                <button
                    onClick={toggleLanguage}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#4b5563',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = '#047857';
                        e.currentTarget.style.color = '#047857';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.color = '#4b5563';
                    }}
                >
                    <span style={{ fontSize: '16px' }}>{isRTL ? '🇬🇧' : '🇵🇰'}</span>
                    <span style={{ fontWeight: '500' }}>{isRTL ? 'English' : 'اردو'}</span>
                </button>
            </div>

            {/* Main Content - Centered Login Card */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px'
            }}>
                <motion.div
                    style={{ width: '100%', maxWidth: '380px' }}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                            overflow: 'hidden'
                        }}
                        animate={shouldShake ? 'shake' : ''}
                        variants={shakeVariants}
                    >
                        {/* Green Accent Bar */}
                        <div style={{ height: '4px', backgroundColor: '#047857' }} />

                        {/* Card Content */}
                        <div style={{ padding: '24px 28px 28px 28px' }}>

                            {/* Logo - Direct display */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                                <img
                                    src={logoMain}
                                    alt={t('accessibility.logoAlt')}
                                    style={{
                                        height: '60px',
                                        width: 'auto',
                                        objectFit: 'contain'
                                    }}
                                />
                            </div>

                            {/* Heading */}
                            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                <h1 style={{
                                    fontSize: isRTL ? '22px' : '20px',
                                    fontWeight: '700',
                                    color: '#111827',
                                    marginBottom: '4px',
                                    fontFamily: isRTL ? 'var(--font-urdu)' : 'inherit'
                                }}>
                                    {t('appName')}
                                </h1>
                                <p style={{ color: '#6b7280', fontSize: '13px' }}>
                                    {t('portalSubtitle')}
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        marginBottom: '16px',
                                        padding: '10px 12px',
                                        backgroundColor: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        borderRadius: '6px'
                                    }}
                                >
                                    <p style={{ color: '#dc2626', fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>
                                        {error}
                                    </p>
                                </motion.div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleLogin}>

                                {/* Username Field */}
                                <div style={{ marginBottom: '14px' }}>
                                    <label
                                        htmlFor="username"
                                        style={{
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            textAlign: isRTL ? 'right' : 'left'
                                        }}
                                    >
                                        {t('login.usernameLabel')}
                                    </label>
                                    <div style={{ position: 'relative', direction: isRTL ? 'rtl' : 'ltr' }}>
                                        <span style={{
                                            position: 'absolute',
                                            [isRTL ? 'right' : 'left']: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            pointerEvents: 'none'
                                        }}>
                                            <User size={18} />
                                        </span>
                                        <input
                                            id="username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder={t('login.usernamePlaceholder')}
                                            disabled={isLoading}
                                            style={{
                                                width: '100%',
                                                [isRTL ? 'paddingRight' : 'paddingLeft']: '38px',
                                                [isRTL ? 'paddingLeft' : 'paddingRight']: '12px',
                                                paddingTop: '10px',
                                                paddingBottom: '10px',
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                color: '#1f2937',
                                                textAlign: isRTL ? 'right' : 'left',
                                                direction: isRTL ? 'rtl' : 'ltr',
                                                outline: 'none',
                                                transition: 'all 0.15s',
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#10b981';
                                                e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.1)';
                                                e.target.style.backgroundColor = '#fff';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                                e.target.style.backgroundColor = '#f9fafb';
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div style={{ marginBottom: '12px' }}>
                                    <label
                                        htmlFor="password"
                                        style={{
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '6px',
                                            textAlign: isRTL ? 'right' : 'left'
                                        }}
                                    >
                                        {t('login.passwordLabel')}
                                    </label>
                                    <div style={{ position: 'relative', direction: isRTL ? 'rtl' : 'ltr' }}>
                                        <span style={{
                                            position: 'absolute',
                                            [isRTL ? 'right' : 'left']: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            pointerEvents: 'none'
                                        }}>
                                            <Lock size={18} />
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
                                            style={{
                                                position: 'absolute',
                                                [isRTL ? 'right' : 'left']: 'auto',
                                                [isRTL ? 'left' : 'right']: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '2px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            aria-label={showPassword ? t('accessibility.hidePassword') : t('accessibility.showPassword')}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder={t('login.passwordPlaceholder')}
                                            disabled={isLoading}
                                            style={{
                                                width: '100%',
                                                [isRTL ? 'paddingRight' : 'paddingLeft']: '38px',
                                                [isRTL ? 'paddingLeft' : 'paddingRight']: '40px',
                                                paddingTop: '10px',
                                                paddingBottom: '10px',
                                                backgroundColor: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '6px',
                                                fontSize: '13px',
                                                color: '#1f2937',
                                                textAlign: isRTL ? 'right' : 'left',
                                                direction: isRTL ? 'rtl' : 'ltr',
                                                outline: 'none',
                                                transition: 'all 0.15s',
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#10b981';
                                                e.target.style.boxShadow = '0 0 0 2px rgba(16, 185, 129, 0.1)';
                                                e.target.style.backgroundColor = '#fff';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                                e.target.style.backgroundColor = '#f9fafb';
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Forgot Password Link */}
                                <div style={{ textAlign: isRTL ? 'right' : 'left', marginBottom: '16px' }}>
                                    <button
                                        type="button"
                                        style={{
                                            fontSize: '12px',
                                            color: '#047857',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: '500'
                                        }}
                                        onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                        onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                        {t('login.forgotPassword')}
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    variants={buttonVariants}
                                    initial="idle"
                                    whileHover={!isLoading ? 'hover' : 'idle'}
                                    whileTap={!isLoading ? 'tap' : 'idle'}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: isLoading ? '#6ee7b7' : '#047857',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        flexDirection: isRTL ? 'row' : 'row-reverse',
                                        transition: 'background-color 0.15s'
                                    }}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>{t('login.loadingButton')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>{t('login.submitButton')}</span>
                                            <ArrowLeft size={18} style={{ transform: isRTL ? 'rotate(0deg)' : 'rotate(180deg)' }} />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Page Footer - Always at Bottom */}
            <footer style={{
                padding: '16px 24px',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
            }}>
                <p style={{
                    fontSize: '12px',
                    color: '#64748b',
                    fontFamily: isRTL ? 'var(--font-urdu)' : 'inherit',
                    direction: isRTL ? 'rtl' : 'ltr',
                    margin: 0
                }}>
                    {t('footer.copyright')}
                </p>
            </footer>
        </div>
    );
};


export default Login;
