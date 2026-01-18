import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const DailyAttendance = () => {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        document.title = t('pageTitles.dailyAttendance');
    }, [t, i18n.language]);

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.dailyAttendance')}</title>
            </Helmet>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-slate-800">
                    {t('sidebar.dailyAttendance')}
                </h1>
            </div>
        </>
    );
};

export default DailyAttendance;
