import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-scaleIn"
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
            >
                {/* Header with Icon */}
                <div className="bg-red-50 p-6 flex flex-col items-center justify-center border-b border-red-100">
                    <div className="bg-red-100 p-3 rounded-full mb-3">
                        <AlertTriangle className="text-red-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 text-center">
                        {t('logoutModal.title')}
                    </h3>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-slate-600 text-center text-base leading-relaxed">
                        {t('logoutModal.message')}
                    </p>
                </div>

                {/* Footer Buttons */}
                <div className="bg-gray-50 p-4 flex gap-3 justify-center border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-slate-700 font-medium hover:bg-gray-100 transition-colors flex-1"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex-1"
                    >
                        {t('dashboard.logout')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal;
