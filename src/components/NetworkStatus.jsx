import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000); // Hide "Back Online" after 3s
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowBanner(true); // Keep "Offline" banner visible
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner) return null;

    return (
        <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-lg transition-all duration-300 animate-slideUp
            ${isOnline ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
        >
            {isOnline ? <Wifi size={20} /> : <WifiOff size={20} />}
            <span className="font-semibold text-sm">
                {isOnline
                    ? (isRTL ? 'انٹرنیٹ کنکشن بحال ہو گیا ہے' : 'Back Online')
                    : (isRTL ? 'انٹرنیٹ کنکشن منقطع ہے - ڈیٹا محفوظ نہیں ہوگا' : 'You are Offline - Changes may not save')
                }
            </span>
        </div>
    );
};

export default NetworkStatus;
