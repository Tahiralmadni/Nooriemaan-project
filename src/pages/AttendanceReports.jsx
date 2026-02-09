import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FileText } from 'lucide-react';

const AttendanceReports = () => {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        // Set document title manually for now if translation key doesn't exist yet
        document.title = t('sidebar.hazriReports') || 'Hazri Reports';
    }, [t, i18n.language]);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <Helmet>
                <title>{t('sidebar.hazriReports') || 'Hazri Reports'}</title>
            </Helmet>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <FileText size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {t('sidebar.hazriReports')}
                    </h1>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Placeholder for report cards */}
                    <div className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                        <h3 className="font-semibold text-gray-700 mb-2">{t('reports.daily') || 'Daily Report'}</h3>
                        <p className="text-sm text-gray-500">View daily attendance records</p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                        <h3 className="font-semibold text-gray-700 mb-2">{t('reports.monthly') || 'Monthly Report'}</h3>
                        <p className="text-sm text-gray-500">View monthly summary</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceReports;
