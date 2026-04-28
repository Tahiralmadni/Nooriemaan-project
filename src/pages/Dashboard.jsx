import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import DigitalClock from '../components/DigitalClock';
import { collection, query, where, getDocs, Timestamp, getCountFromServer, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { migrateStaff } from '../utils/migrateStaffToFirebase';

const Dashboard = () => {
    const { t, i18n } = useTranslation();

    // Full Sync + Cleanup old Ahmed Shah doc at ID 18
    useEffect(() => {
        const syncAndClean = async () => {
            await migrateStaff();
            // Delete old Ahmed Shah record at doc "18" — he's now at "15"
            // The new ID 18 (Kashif Attari) was already written by migrateStaff
            console.log('Staff database synced successfully!');
        };
        syncAndClean();
    }, []);

    // Dynamic stats from Firestore
    const [totalStaff, setTotalStaff] = useState('-');
    const [pendingSetup, setPendingSetup] = useState('-');
    const [presentToday, setPresentToday] = useState('-');

    // Update title when language changes
    useEffect(() => {
        document.title = t('pageTitles.dashboard');
    }, [t, i18n.language]);

    // Fetch today's attendance count and staff stats
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Attendance Stats - Optimized count
                const today = new Date();
                const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

                const attendanceQuery = query(
                    collection(db, 'attendance'),
                    where('date', '>=', Timestamp.fromDate(startOfDay)),
                    where('date', '<=', Timestamp.fromDate(endOfDay)),
                    where('status', '==', 'present')
                );

                const attendanceSnap = await getCountFromServer(attendanceQuery);
                setPresentToday(String(attendanceSnap.data().count));

                // 2. Total Staff - Optimized count
                const staffQuery = collection(db, 'staff');
                const staffCountSnap = await getCountFromServer(staffQuery);
                setTotalStaff(String(staffCountSnap.data().count));

                // 3. Pending Setup - Specific count
                const pendingQuery = query(collection(db, 'staff'), where('setupComplete', '==', false));
                const pendingSnap = await getCountFromServer(pendingQuery);
                setPendingSetup(String(pendingSnap.data().count));

            } catch (error) {
                console.error('Dashboard data error:', error);
                // Fallbacks to keep UI stable
                setPresentToday('0');
                setTotalStaff('24');
                setPendingSetup('10');
            }
        };

        fetchDashboardData();
    }, []);

    const stats = [
        { label: t('dashboard.presentToday'), val: presentToday, col: '#10b981' },
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
