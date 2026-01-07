import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import logoMain from '../assets/logo-main.png';
import i18n from '../config/i18n';

/**
 * PageLoader Component - UPDATED VERSION
 * Professional banking-style loading screen with enhanced animations
 * Now accepts custom text via props
 */
const PageLoader = ({ loadingText }) => {
    const { t } = useTranslation();
    const isRTL = i18n.language === 'ur';

    // Default text agar prop nahi diya
    const displayText = loadingText || t('loader.loading');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#ffffff',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
        }}>
            {/* Top Progress Bar - SLOWER animation (2.5s instead of 1.5s) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                backgroundColor: '#e0e7ef',
                overflow: 'hidden'
            }}>
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '50%',
                        background: 'linear-gradient(90deg, #10b981, #059669)',
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                    }}
                />
            </div>

            {/* Center Content */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
            }}>
                {/* Logo with Color-Changing Glow Effect */}
                <motion.div
                    animate={{
                        opacity: [0.7, 1, 0.7],
                        scale: [0.98, 1.02, 0.98],
                        filter: [
                            'drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))',
                            'drop-shadow(0 0 30px rgba(234, 179, 8, 0.9))',
                            'drop-shadow(0 0 20px rgba(16, 185, 129, 0.8))'
                        ]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <img
                        src={logoMain}
                        alt="Logo"
                        style={{
                            height: '80px',
                            width: 'auto',
                            objectFit: 'contain'
                        }}
                    />
                </motion.div>

                {/* Loading Text - Dynamic based on context */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    style={{
                        textAlign: 'center'
                    }}
                >
                    <p style={{
                        fontSize: isRTL ? '16px' : '14px',
                        color: '#64748b',
                        margin: 0,
                        fontWeight: '500'
                    }}>
                        {displayText}
                    </p>

                    {/* Animated dots */}
                    <motion.span
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                        style={{
                            fontSize: '14px',
                            color: '#10b981',
                            fontWeight: 'bold'
                        }}
                    >
                        ...
                    </motion.span>
                </motion.div>

                {/* Bottom loading bar */}
                <div style={{
                    width: '250px',
                    height: '3px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{
                            duration: 5,
                            ease: 'easeOut'
                        }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #10b981, #eab308, #10b981)',
                            backgroundSize: '200% 100%'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
