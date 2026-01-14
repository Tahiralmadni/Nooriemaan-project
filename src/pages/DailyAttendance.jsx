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
                <div className="flex items-center gap-3 mb-4">
                    <h1 className="text-2xl font-bold text-slate-800">
                        {t('sidebar.dailyAttendance')}
                    </h1>
                    <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        NEW
                    </span>
                </div>
            </div>
        </>
    );
};

export default DailyAttendance;
