import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Type, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import i18n from '../config/i18n';

/**
 * Font Settings Component
 * Allows users to select from multiple font options for Urdu and English
 */

// Font Options - Using Google Fonts that actually support Urdu
export const URDU_FONTS = [
    { id: 'noto-nastaliq', name: 'Noto Nastaliq Urdu', family: "'Noto Nastaliq Urdu', serif", sample: 'نورِ ایمان' },
    { id: 'scheherazade', name: 'Scheherazade New', family: "'Scheherazade New', serif", sample: 'نورِ ایمان' },
    { id: 'amiri', name: 'Amiri', family: "'Amiri', serif", sample: 'نورِ ایمان' },
    { id: 'lateef', name: 'Lateef', family: "'Lateef', serif", sample: 'نورِ ایمان' },
    { id: 'aref-ruqaa', name: 'Aref Ruqaa', family: "'Aref Ruqaa', serif", sample: 'نورِ ایمان' },
];

export const ENGLISH_FONTS = [
    { id: 'plus-jakarta', name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", sample: 'Nooriemaan' },
    { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", sample: 'Nooriemaan' },
    { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", sample: 'Nooriemaan' },
    { id: 'outfit', name: 'Outfit', family: "'Outfit', sans-serif", sample: 'Nooriemaan' },
    { id: 'gill-sans', name: 'Gill Sans', family: "'Gill Sans', 'Gill Sans MT', sans-serif", sample: 'Nooriemaan' },
];

// Get saved font preferences
export const getSavedFont = (language) => {
    const key = language === 'ur' ? 'nooriemaan-font-urdu' : 'nooriemaan-font-english';
    const saved = localStorage.getItem(key);
    if (saved) {
        const fonts = language === 'ur' ? URDU_FONTS : ENGLISH_FONTS;
        return fonts.find(f => f.id === saved) || fonts[0];
    }
    return language === 'ur' ? URDU_FONTS[0] : ENGLISH_FONTS[0];
};

// Save font preference
export const saveFont = (language, fontId) => {
    const key = language === 'ur' ? 'nooriemaan-font-urdu' : 'nooriemaan-font-english';
    localStorage.setItem(key, fontId);
};

const FontSettings = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const isRTL = i18n.language === 'ur';

    const [selectedUrduFont, setSelectedUrduFont] = useState(() => getSavedFont('ur'));
    const [selectedEnglishFont, setSelectedEnglishFont] = useState(() => getSavedFont('en'));

    const handleUrduFontChange = (font) => {
        setSelectedUrduFont(font);
        saveFont('ur', font.id);
        document.documentElement.style.setProperty('--font-urdu', font.family);
    };

    const handleEnglishFontChange = (font) => {
        setSelectedEnglishFont(font);
        saveFont('en', font.id);
        document.documentElement.style.setProperty('--font-english', font.family);
    };

    // Apply saved fonts on mount
    useEffect(() => {
        const urduFont = getSavedFont('ur');
        const englishFont = getSavedFont('en');
        document.documentElement.style.setProperty('--font-urdu', urduFont.family);
        document.documentElement.style.setProperty('--font-english', englishFont.family);
    }, []);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '20px'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                        width: '100%',
                        maxWidth: '500px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        direction: isRTL ? 'rtl' : 'ltr'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Type size={20} color="#047857" />
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: 0
                            }}>
                                {isRTL ? 'فونٹ کی ترتیبات' : 'Font Settings'}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '8px',
                                display: 'flex',
                                color: '#6b7280'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '24px' }}>
                        {/* Show only relevant fonts based on current language */}
                        {isRTL ? (
                            /* Urdu Fonts - Only when in Urdu mode */
                            <div>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#047857',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    🇵🇰 اردو فونٹس منتخب کریں
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {URDU_FONTS.map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => handleUrduFontChange(font)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '14px 16px',
                                                backgroundColor: selectedUrduFont.id === font.id ? '#ecfdf5' : '#ffffff',
                                                border: selectedUrduFont.id === font.id ? '2px solid #047857' : '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: selectedUrduFont.id === font.id ? '0 4px 12px rgba(4, 120, 87, 0.15)' : 'none'
                                            }}
                                        >
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    color: '#6b7280',
                                                    marginBottom: '6px'
                                                }}>
                                                    {font.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '22px',
                                                    fontFamily: font.family,
                                                    color: selectedUrduFont.id === font.id ? '#047857' : '#1f2937',
                                                    direction: 'rtl'
                                                }}>
                                                    نورِ ایمان ڈیجیٹل پورٹل
                                                </div>
                                            </div>
                                            {selectedUrduFont.id === font.id && (
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    backgroundColor: '#047857',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Check size={14} color="white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            /* English Fonts - Only when in English mode */
                            <div>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#047857',
                                    marginBottom: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    🇬🇧 Select English Font
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {ENGLISH_FONTS.map((font) => (
                                        <button
                                            key={font.id}
                                            onClick={() => handleEnglishFontChange(font)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '14px 16px',
                                                backgroundColor: selectedEnglishFont.id === font.id ? '#ecfdf5' : '#ffffff',
                                                border: selectedEnglishFont.id === font.id ? '2px solid #047857' : '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: selectedEnglishFont.id === font.id ? '0 4px 12px rgba(4, 120, 87, 0.15)' : 'none'
                                            }}
                                        >
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{
                                                    fontSize: '12px',
                                                    fontWeight: '500',
                                                    color: '#6b7280',
                                                    marginBottom: '6px'
                                                }}>
                                                    {font.name}
                                                </div>
                                                <div style={{
                                                    fontSize: '18px',
                                                    fontFamily: font.family,
                                                    color: selectedEnglishFont.id === font.id ? '#047857' : '#1f2937'
                                                }}>
                                                    Nooriemaan Digital Portal
                                                </div>
                                            </div>
                                            {selectedEnglishFont.id === font.id && (
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    backgroundColor: '#047857',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Check size={14} color="white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                    }}>
                        <button
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#047857',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {isRTL ? 'محفوظ کریں' : 'Save & Close'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FontSettings;
