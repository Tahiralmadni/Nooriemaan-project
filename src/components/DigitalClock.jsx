import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * DigitalClock Component
 * Clean i18n implementation - fixed RTL direction
 */
const DigitalClock = () => {
    const { t } = useTranslation();
    const [time, setTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Format time
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // 12-hour format
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? t('clock.pm') : t('clock.am');

    // Add leading zeros
    const formattedHours = displayHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return (
        <div
            className="inline-flex items-center gap-1 bg-slate-900 px-3 py-2 rounded-lg shadow-xl border border-white/5"
            dir="ltr" // Force LTR for clock always
        >
            {/* Hours */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-2 py-1.5 rounded-md border border-cyan-500/20 min-w-[32px] text-center">
                <div className="text-base font-bold text-cyan-400" style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.3)' }}>
                    {formattedHours}
                </div>
            </div>

            <div className="text-sm text-cyan-400 opacity-50">:</div>

            {/* Minutes */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-2 py-1.5 rounded-md border border-cyan-500/20 min-w-[32px] text-center">
                <div className="text-base font-bold text-cyan-400" style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.3)' }}>
                    {formattedMinutes}
                </div>
            </div>

            <div className="text-sm text-cyan-400 opacity-50">:</div>

            {/* Seconds */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-2 py-1.5 rounded-md border border-cyan-500/20 min-w-[32px] text-center">
                <div className="text-base font-bold text-cyan-400" style={{ textShadow: '0 0 10px rgba(6, 182, 212, 0.3)' }}>
                    {formattedSeconds}
                </div>
            </div>

            {/* AM/PM */}
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 px-1.5 py-1 rounded ml-0.5">
                <div className="text-[8px] font-bold text-white">
                    {ampm}
                </div>
            </div>
        </div>
    );
};

export default DigitalClock;
