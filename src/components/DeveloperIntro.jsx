import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * DeveloperIntro Component
 * Shows developer branding on first app load
 * Runs only once per session
 */
const DeveloperIntro = ({ onComplete }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Fade out after 4 seconds total (2s visible + transitions)
        const timer = setTimeout(() => {
            setShow(false);
            // Call onComplete after fade out animation
            setTimeout(() => {
                onComplete?.();
            }, 800);
        }, 3200);

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999
            }}
        >
            {/* Developer Name with Fade In Animation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                style={{
                    textAlign: 'center'
                }}
            >
                <motion.h1
                    animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        background: 'linear-gradient(90deg, #ffffff, #10b981, #ffffff)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        margin: 0,
                        fontFamily: 'var(--font-english)'
                    }}
                >
                    Developed by
                </motion.h1>

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    style={{
                        fontSize: '48px',
                        fontWeight: '800',
                        color: '#10b981',
                        margin: '12px 0 0 0',
                        fontFamily: 'var(--font-english)',
                        letterSpacing: '2px',
                        textShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                    }}
                >
                    Hanzala Tahir
                </motion.h2>

                {/* Animated Underline */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    style={{
                        height: '3px',
                        background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                        marginTop: '16px'
                    }}
                />
            </motion.div>

            {/* Subtle Tagline */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 2, duration: 0.5 }}
                style={{
                    color: '#94a3b8',
                    fontSize: '14px',
                    marginTop: '24px',
                    fontFamily: 'var(--font-english)',
                    letterSpacing: '1px'
                }}
            >
                Full Stack Developer
            </motion.p>
        </motion.div>
    );
};

export default DeveloperIntro;
