import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import DigitalClock from '../components/DigitalClock';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { deleteStaff } from '../utils/migrateStaffToFirebase';

const Dashboard = () => {
    const { t, i18n } = useTranslation();

    // Dynamic stats from Firestore
    const [presentToday, setPresentToday] = useState('-');

    // Update title when language changes
    useEffect(() => {
        document.title = t('pageTitles.dashboard');
        
        // TEMPORARY: Auto-delete Hashim (Staff 12) from Firebase since he's removed
        const cleanupHashim = async () => {
            try {
                await deleteStaff(12);
                console.log("Muhammad Hashim has been removed from Firebase.");
            } catch (e) {
                console.error("Cleanup error:", e);
            }
        };
        cleanupHashim();
    }, [t, i18n.language]);

    // Fetch today's attendance count (no composite index needed)
    useEffect(() => {
        const fetchTodayStats = async () => {
            try {
                const today = new Date();
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

                // Query only by date range (avoids composite index requirement)
                const q = query(
                    collection(db, 'attendance'),
                    where('date', '>=', Timestamp.fromDate(startOfDay)),
                    where('date', '<=', Timestamp.fromDate(endOfDay))
                );

                const snapshot = await getDocs(q);
                // Filter present status in code
                const presentCount = snapshot.docs.filter(doc => doc.data().status === 'present').length;
                setPresentToday(String(presentCount));
            } catch (error) {
                console.error('Dashboard stats error:', error);
                setPresentToday('0');
            }
        };

        fetchTodayStats();
    }, []);

    const stats = [
        { label: t('dashboard.presentToday'), val: presentToday, col: '#3b82f6' },
    ];

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.dashboard')}</title>
            </Helmet>

            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                            {t('dashboard.welcomeToDashboard')}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
                            className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            style={{ borderTop: `3px solid ${s.col}` }}
                        >
                            <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1">{s.label}</div>
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
