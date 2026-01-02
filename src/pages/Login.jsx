import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, ArrowRight, User, HelpCircle, Phone, Type } from 'lucide-react';
import FontSettings, { getSavedFont } from '../components/FontSettings';

// Import main logo
import logoMain from '../assets/logo-main.png';
import i18n from '../config/i18n';

/**
 * Login Component - NooriEmaan Digital Portal
 * Compact Enterprise Design with Logo Background
 */
const Login = () => {
    const { t } = useTranslation();

    // State Management
    const [grNumber, setGrNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [shouldShake, setShouldShake] = useState(false);
    const [showFontSettings, setShowFontSettings] = useState(false);

    // Load saved font on mount
    useEffect(() => {
        const savedUrdu = getSavedFont('ur');
        const savedEnglish = getSavedFont('en');
        document.documentElement.style.setProperty('--font-urdu', savedUrdu.family);
        document.documentElement.style.setProperty('--font-english', savedEnglish.family);
    }, []);

    // Validation
    const validateForm = () => {
        setError('');
        if (!grNumber.trim()) {
            setError(t('validation.grNumberRequired'));
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
            if (grNumber === 'admin' && password === 'admin123') {
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
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, ease: 'easeOut' }
        }
    };

    const shakeVariants = {
        shake: { x: [0, -6, 6, -6, 6, -3, 3, 0], transition: { duration: 0.35 } }
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
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                background: '#ffffff',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Logo Watermark */}
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
                opacity: 0.08,
                pointerEvents: 'none'
            }} />

            {/* Decorative Elements */}
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

            {/* Language Toggle */}
            <div style={{
                position: 'fixed',
                top: '16px',
                [isRTL ? 'left' : 'right']: '16px',
                zIndex: 20,
                display: 'flex',
                gap: '8px'
            }}>
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

            {/* Compact Login Card */}
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
                    animate={shouldShake ? 'shake' : ''}
                    variants={shakeVariants}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px -10px rgba(4, 120, 87, 0.2), 0 0 0 1px rgba(4, 120, 87, 0.05)',
                        padding: '36px 32px',
                        position: 'relative'
                    }}
                >
                    {/* Top Green Line */}
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

                    {/* Logo */}
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

                    {/* Heading */}
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
                                borderRadius: '8px'
                            }}
                        >
                            <p style={{
                                color: '#dc2626',
                                fontSize: '12px',
                                textAlign: 'center',
                                fontWeight: '500',
                                margin: 0
                            }}>
                                {error}
                            </p>
                        </motion.div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleLogin}>
                        {/* GR Number Field */}
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{
                                position: 'relative',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '10px',
                                transition: 'all 0.2s',
                                backgroundColor: '#f8fafc'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    [isRTL ? 'right' : 'left']: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }}>
                                    <User size={16} />
                                </span>
                                <input
                                    id="grNumber"
                                    type="text"
                                    value={grNumber}
                                    onChange={(e) => setGrNumber(e.target.value)}
                                    placeholder={isRTL ? 'جی آر نمبر' : 'GR Number / Username'}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        [isRTL ? 'paddingRight' : 'paddingLeft']: '38px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        color: '#1e293b',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        textAlign: isRTL ? 'right' : 'left'
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
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '14px' }}>
                            <div style={{
                                position: 'relative',
                                border: '1.5px solid #e2e8f0',
                                borderRadius: '10px',
                                transition: 'all 0.2s',
                                backgroundColor: '#f8fafc'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    [isRTL ? 'right' : 'left']: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8'
                                }}>
                                    <Lock size={16} />
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isRTL ? 'پاس ورڈ' : 'Password'}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        [isRTL ? 'paddingRight' : 'paddingLeft']: '38px',
                                        [isRTL ? 'paddingLeft' : 'paddingRight']: '40px',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '13px',
                                        color: '#1e293b',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        textAlign: isRTL ? 'right' : 'left'
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
                                    }}
                                />
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
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.01 }}
                            whileTap={{ scale: isLoading ? 1 : 0.99 }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: isLoading
                                    ? '#94a3b8'
                                    : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
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
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>{isRTL ? 'انتظار...' : 'Please wait...'}</span>
                                </>
                            ) : (
                                <>
                                    <ArrowRight size={16} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                                    <span>{isRTL ? 'لاگ ان' : 'LOG IN'}</span>
                                </>
                            )}
                        </motion.button>

                        {/* Footer Links */}
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

            {/* Footer - Fixed at Bottom */}
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
    );
};

export default Login;
