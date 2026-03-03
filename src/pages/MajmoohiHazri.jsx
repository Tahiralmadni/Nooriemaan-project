import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, Users, Loader2, Search } from 'lucide-react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import toast, { Toaster } from 'react-hot-toast';

const MajmoohiHazri = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    // Abhi sirf Akram Attari
    const staffOptions = [
        { id: 1, nameKey: 'staff.1' },
        { id: 2, nameKey: 'staff.2' },
        { id: 3, nameKey: 'staff.3' },
        { id: 4, nameKey: 'staff.4' }
    ];

    const [selectedStaff, setSelectedStaff] = useState(1);

    // Date range - default: 1st of current month to today
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(firstOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loadError, setLoadError] = useState('');

    // Day names for table
    const dayNames = isRTL
        ? ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        document.title = t('majmoohi.title');
    }, [t, i18n.language]);

    // 12-hour format helper
    const formatTime12 = (time24) => {
        if (!time24 || time24 === '-') return '-';
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const h12 = hours % 12 || 12;
        return `${h12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    // Status badge styling
    const getStatusStyle = (status) => {
        switch (status) {
            case 'present': return { bg: 'bg-emerald-50', text: 'text-emerald-600', label: t('majmoohi.table.present') };
            case 'absent': return { bg: 'bg-red-50', text: 'text-red-500', label: t('majmoohi.table.absent') };
            case 'leave': return { bg: 'bg-amber-50', text: 'text-amber-500', label: t('majmoohi.table.leave') };
            case 'holiday': return { bg: 'bg-blue-50', text: 'text-blue-500', label: t('majmoohi.table.holiday') };
            default: return { bg: 'bg-gray-50', text: 'text-gray-400', label: '-' };
        }
    };

    // Load button click — Firebase se data laao
    const handleLoad = async () => {
        setLoading(true);
        setHasSearched(true);
        setLoadError('');
        try {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, 'attendance'),
                where('staffId', '==', selectedStaff),
                where('date', '>=', Timestamp.fromDate(start)),
                where('date', '<=', Timestamp.fromDate(end))
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => {
                const d = doc.data();
                const dateObj = d.date.toDate();
                return {
                    id: doc.id,
                    ...d,
                    dateObj,
                    dateStr: dateObj.toLocaleDateString('en-GB'),
                    dayName: dayNames[dateObj.getDay()]
                };
            });

            // Sort by date (oldest first)
            data.sort((a, b) => a.dateObj - b.dateObj);

            // Filter duplicates
            const unique = [];
            const seen = new Set();
            for (const r of data) {
                if (!seen.has(r.dateStr)) {
                    seen.add(r.dateStr);
                    unique.push(r);
                }
            }

            setRecords(unique);
            if (unique.length === 0) {
                setLoadError(isRTL ? 'اس مدت میں کوئی ریکارڈ نہیں ملا' : 'No records found for this period');
            }
        } catch (error) {
            console.error('Load error:', error);
            const errMsg = error.message || 'Unknown error';
            setLoadError(errMsg);
            toast.error(isRTL ? `ڈیٹا لوڈ نہیں ہوا: ${errMsg}` : `Failed to load: ${errMsg}`);
        } finally {
            setLoading(false);
        }
    };

    // Summary totals
    const totals = records.reduce((acc, r) => {
        if (r.status === 'present') acc.present++;
        if (r.status === 'absent') acc.absent++;
        if (r.status === 'leave') acc.leave++;
        if (r.status === 'holiday') acc.holiday++;
        if (r.lateMinutes > 0) acc.lateDays++;
        acc.lateMin += (r.lateMinutes || 0);
        acc.deduction += (r.deduction || 0);
        acc.total++;
        return acc;
    }, { present: 0, absent: 0, leave: 0, holiday: 0, lateDays: 0, lateMin: 0, deduction: 0, total: 0 });

    return (
        <>
            <Helmet defer={false}>
                <title>{t('majmoohi.title')}</title>
            </Helmet>
            <Toaster position="top-center" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
            >
                {/* ===== HEADER ===== */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Users size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-emerald-600">
                            {t('majmoohi.title')}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {t('majmoohi.subtitle')}
                        </p>
                    </div>
                </div>

                {/* ===== FILTERS CARD ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-6"
                >
                    <div className="flex flex-col md:flex-row md:items-end gap-4">
                        {/* Staff Selector */}
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">
                                {t('majmoohi.table.staffName')}
                            </label>
                            <select
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(Number(e.target.value))}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none"
                            >
                                {staffOptions.map(s => (
                                    <option key={s.id} value={s.id}>{t(s.nameKey)}</option>
                                ))}
                            </select>
                        </div>

                        {/* Start Date */}
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">
                                {isRTL ? 'حاضری ابتداء' : 'Start Date'}
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer"
                            />
                        </div>

                        {/* End Date */}
                        <div className="flex-1">
                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">
                                {isRTL ? 'حاضری انتہا' : 'End Date'}
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none cursor-pointer"
                            />
                        </div>

                        {/* Load Button */}
                        <div>
                            <button
                                onClick={handleLoad}
                                disabled={loading}
                                className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Search size={16} />
                                )}
                                {isRTL ? 'لوڈ کیجئے' : 'Load'}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ===== DATE-WISE TABLE ===== */}
                {hasSearched && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                    >
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 size={32} className="text-emerald-500 animate-spin mb-3" />
                                <p className="text-slate-400 text-sm">{t('loader.loading')}</p>
                            </div>
                        ) : records.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Users size={32} className="text-slate-300 mb-3" />
                                <p className="text-slate-400 text-sm">{t('majmoohi.table.noData')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                            <th className="px-3 py-3 font-semibold text-center w-10">{t('table.serial')}</th>
                                            <th className="px-3 py-3 font-semibold text-center">{t('majmoohi.table.date')}</th>
                                            <th className="px-3 py-3 font-semibold text-center">{t('majmoohi.table.day')}</th>
                                            <th className="px-3 py-3 font-semibold text-center">{t('majmoohi.table.status')}</th>
                                            <th className="px-3 py-3 font-semibold text-center">{t('majmoohi.table.entryTime')}</th>
                                            <th className="px-3 py-3 font-semibold text-center">{t('majmoohi.table.exitTime')}</th>
                                            <th className="px-3 py-3 font-semibold text-center">{t('majmoohi.table.lateMin')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {records.map((r, index) => {
                                            const style = getStatusStyle(r.status);
                                            return (
                                                <tr
                                                    key={r.id}
                                                    className={`border-b border-gray-50 hover:bg-emerald-50/30 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                                >
                                                    <td className="px-3 py-2.5 text-center text-slate-400 font-medium">{index + 1}</td>
                                                    <td className="px-3 py-2.5 text-center text-slate-700 font-medium">{r.dateStr}</td>
                                                    <td className="px-3 py-2.5 text-center text-slate-500">{r.dayName}</td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className={`inline-block px-3 py-0.5 ${style.bg} ${style.text} rounded-full text-xs font-semibold`}>
                                                            {style.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-slate-600 font-mono text-xs">
                                                        {formatTime12(r.entryTime)}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-slate-600 font-mono text-xs">
                                                        {formatTime12(r.exitTime)}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        {r.lateMinutes > 0 ? (
                                                            <span className="text-purple-600 font-semibold">{r.lateMinutes}</span>
                                                        ) : (
                                                            <span className="text-slate-300">0</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {/* ===== SUMMARY ROW ===== */}
                                        <tr className="bg-gradient-to-r from-slate-100 to-slate-50 border-t-2 border-emerald-200 font-bold">
                                            <td className="px-3 py-3 text-center text-emerald-600" colSpan={3}>
                                                {t('majmoohi.table.total')}: {totals.total} {t('majmoohi.table.totalDays')}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <div className="flex flex-wrap justify-center gap-1.5">
                                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px]">{totals.present} {t('majmoohi.table.present')}</span>
                                                    <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-[10px]">{totals.absent} {t('majmoohi.table.absent')}</span>
                                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-500 rounded-full text-[10px]">{totals.leave} {t('majmoohi.table.leave')}</span>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-[10px]">{totals.holiday} {t('majmoohi.table.holiday')}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center text-slate-400" colSpan={2}>—</td>
                                            <td className="px-3 py-3 text-center text-purple-600">{totals.lateMin}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

            </motion.div>
        </>
    );
};

export default MajmoohiHazri;
