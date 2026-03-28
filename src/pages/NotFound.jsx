import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ur';

    return (
        <>
            <Helmet>
                <title>404 - {t('pageTitles.notFound', 'Page Not Found')}</title>
            </Helmet>
            <div
                className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4"
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
            >
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100 dark:border-slate-700 transform hover:scale-105 transition-transform duration-300">
                    <div className="bg-red-50 dark:bg-red-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl font-bold text-red-500">404</span>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        {t('notFound.title')}
                    </h1>

                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        {t('notFound.message')}
                    </p>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={20} />
                        {t('common.backToDashboard')}
                    </button>
                </div>

                <p className="mt-8 text-gray-400 dark:text-gray-500 text-sm">
                    &copy; 2026 Nooriemaan Digital Portal
                </p>
            </div>
        </>
    );
};

export default NotFound;
