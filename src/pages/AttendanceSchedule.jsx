import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const AttendanceSchedule = () => {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.title = t('pageTitles.attendanceSchedule');
    }, [t, i18n.language]);

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.attendanceSchedule')}</title>
            </Helmet>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    {t('sidebar.attendanceSchedule')}
                </h1>
            </div>
        </>
    );
};

export default AttendanceSchedule;
