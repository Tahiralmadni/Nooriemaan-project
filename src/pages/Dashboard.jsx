import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import DigitalClock from '../components/DigitalClock';

const Dashboard = () => {
    const { t, i18n } = useTranslation();

    // Update title when language changes
    useEffect(() => {
        document.title = t('pageTitles.dashboard');
    }, [t, i18n.language]);

    const stats = [
        { label: t('dashboard.presentToday'), val: '15', col: '#3b82f6' },
    ];

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.dashboard')}</title>
            </Helmet>

            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                            {t('dashboard.welcomeToDashboard')}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {t('dashboard.admin')}
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <DigitalClock />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                        <div
                            key={i}
                            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            style={{ borderTop: `3px solid ${s.col}` }}
                        >
                            <div className="text-xs md:text-sm text-slate-500 mb-1">{s.label}</div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-800">{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
