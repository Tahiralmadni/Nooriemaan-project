import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const AttendanceSchedule = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    useEffect(() => {
        document.title = t('pageTitles.attendanceSchedule');
    }, [t, i18n.language]);

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.attendanceSchedule')}</title>
            </Helmet>

            <div style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}>
                {/* Page Heading with Card */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    marginBottom: '20px'
                }}>
                    <h1 style={{
                        fontSize: '26px',
                        fontWeight: '700',
                        color: '#1e293b',
                        textAlign: 'center',
                        margin: '0'
                    }}>
                        {isRTL ? 'حاضری جدول' : 'Attendance Schedule'}
                    </h1>
                    <p style={{
                        textAlign: 'center',
                        color: '#64748b',
                        fontSize: '14px',
                        marginTop: '8px',
                        marginBottom: '0'
                    }}>
                        {isRTL ? 'عملہ کی حاضری کا انتظام' : 'Manage Staff Attendance'}
                    </p>
                </div>
            </div>
        </>
    );
};

export default AttendanceSchedule;
