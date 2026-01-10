import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../config/i18n';

/**
 * DigitalClock Component
 * Real-time digital clock with Urdu/English number support
 */
const DigitalClock = () => {
    const { t } = useTranslation();
    const [time, setTime] = useState(new Date());
    const isRTL = i18n.language === 'ur';

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Convert English numbers to Urdu
    const toUrduNumbers = (num) => {
        const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().split('').map(digit => urduDigits[digit] || digit).join('');
    };

    // Format time
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();

    // 12-hour format
    const displayHours = hours % 12 || 12;
    const ampm = hours >= 12 ? (isRTL ? 'شام' : 'PM') : (isRTL ? 'صبح' : 'AM');

    // Add leading zeros
    const formattedHours = displayHours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Display numbers (Urdu or English)
    const displayTime = isRTL
        ? `${toUrduNumbers(formattedHours)}:${toUrduNumbers(formattedMinutes)}:${toUrduNumbers(formattedSeconds)}`
        : `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

    // Get date
    const days = isRTL
        ? ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
        : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const months = isRTL
        ? ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const dayName = days[time.getDay()];
    const monthName = months[time.getMonth()];
    const date = time.getDate();
    const year = time.getFullYear();

    const displayDate = isRTL
        ? `${dayName}، ${toUrduNumbers(date)} ${monthName} ${toUrduNumbers(year)}`
        : `${dayName}, ${date} ${monthName} ${year}`;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            textAlign: 'center',
            color: '#fff',
            fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
            marginBottom: '20px'
        }}>
            {/* Time Display */}
            <div style={{
                fontSize: isRTL ? '48px' : '52px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                marginBottom: '8px',
                textShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}>
                {displayTime}
            </div>

            {/* AM/PM */}
            <div style={{
                fontSize: isRTL ? '18px' : '16px',
                fontWeight: '600',
                marginBottom: '12px',
                opacity: 0.9
            }}>
                {ampm}
            </div>

            {/* Date Display */}
            <div style={{
                fontSize: isRTL ? '16px' : '14px',
                opacity: 0.95,
                borderTop: '1px solid rgba(255,255,255,0.3)',
                paddingTop: '12px'
            }}>
                {displayDate}
            </div>
        </div>
    );
};

export default DigitalClock;
