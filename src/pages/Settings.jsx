import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Globe, Type, Moon, Sun, Check, ChevronRight, ChevronLeft, Info, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FontSettings from '../components/FontSettings';
import toast, { Toaster } from 'react-hot-toast';

const Settings = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';
    const navigate = useNavigate();

    // Dark Mode
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    // Font modal
    const [showFontModal, setShowFontModal] = useState(false);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    // Language
    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
    };

    // Clear cache
    const handleClearCache = () => {
        const keysToKeep = ['darkMode', 'i18nextLng'];
        const allKeys = Object.keys(localStorage);
        let cleared = 0;
        allKeys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
                cleared++;
            }
        });
        toast.success(t('toast.cacheCleared', { count: cleared }), { duration: 2000 });
    };

    return (
        <>
            <Helmet defer={false}>
                <title>{t('settings.title')}</title>
            </Helmet>

            <Toaster containerStyle={{ zIndex: 99999 }} />

            <div
                style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* Mobile Back */}
                <div className="md:hidden mb-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 w-full justify-center group"
                    >
                        {isRTL
                            ? <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            : <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        }
                        <span className="font-bold">{t('common.backToDashboard')}</span>
                    </button>
                </div>

                {/* Header */}
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-slate-800 dark:text-white mb-6"
                    style={{ lineHeight: '2' }}
                >
                    {t('settings.title')}
                </motion.h1>

                {/* ===== OPTIONS LIST ===== */}
                <div className="space-y-3">

                    {/* 1. Language */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <Globe size={18} className="text-blue-500" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {t('settings.language')}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleLanguageChange('ur')}
                                className={`relative p-3 rounded-xl border-2 transition-all text-center ${isRTL
                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'border-gray-200 dark:border-slate-600 hover:border-emerald-200'
                                    }`}
                            >
                                {isRTL && <Check size={14} className="absolute top-2 right-2 text-emerald-500" />}
                                <p className="text-base font-bold text-slate-700 dark:text-slate-200" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>اردو</p>
                            </button>
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`relative p-3 rounded-xl border-2 transition-all text-center ${!isRTL
                                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                                    : 'border-gray-200 dark:border-slate-600 hover:border-emerald-200'
                                    }`}
                            >
                                {!isRTL && <Check size={14} className="absolute top-2 right-2 text-emerald-500" />}
                                <p className="text-base font-bold text-slate-700 dark:text-slate-200">English</p>
                            </button>
                        </div>
                    </motion.div>

                    {/* 2. Dark Mode */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${darkMode ? 'bg-indigo-50 dark:bg-indigo-900/30' : 'bg-amber-50'} rounded-lg flex items-center justify-center`}>
                                {darkMode ? <Moon size={18} className="text-indigo-500" /> : <Sun size={18} className="text-amber-500" />}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {t('settings.darkMode')}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    {t('settings.darkModeDesc')}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${darkMode ? 'bg-emerald-500' : 'bg-gray-300'
                                }`}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 flex items-center justify-center ${darkMode ? 'left-6' : 'left-0.5'
                                }`}>
                                {darkMode ? <Moon size={10} className="text-emerald-600" /> : <Sun size={10} className="text-amber-500" />}
                            </div>
                        </button>
                    </motion.div>

                    {/* 3. Font — Opens Modal */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        onClick={() => setShowFontModal(true)}
                        className="w-full bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow text-start"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <Type size={18} className="text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {t('settings.changeFont')}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    {t('settings.changeFontDesc')}
                                </p>
                            </div>
                        </div>
                        {isRTL ? <ChevronLeft size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                    </motion.button>

                    {/* 4. Clear Cache */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={handleClearCache}
                        className="w-full bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow text-start group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <Trash2 size={18} className="text-red-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {t('settings.clearCache')}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                    {t('settings.clearCacheDesc')}
                                </p>
                            </div>
                        </div>
                        {isRTL ? <ChevronLeft size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                    </motion.button>

                    {/* 5. App Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-4"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                <Info size={18} className="text-emerald-500" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                {t('settings.appInfo')}
                            </span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-gray-500 dark:text-gray-400">{t('settings.version')}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200">1.0.0</span>
                            </div>
                            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-slate-700">
                                <span className="text-gray-500 dark:text-gray-400">{t('settings.developer')}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-700 dark:text-slate-200">Hanzalah Tahir</span>
                                    <a
                                        href="https://wa.me/923362142279"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded-md transition-transform hover:scale-110"
                                    >
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-1.5">
                                <span className="text-gray-500 dark:text-gray-400">{t('settings.framework')}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200">React + Vite</span>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            {/* Font Modal */}
            <FontSettings
                isOpen={showFontModal}
                onClose={() => setShowFontModal(false)}
            />
        </>
    );
};

export default Settings;
