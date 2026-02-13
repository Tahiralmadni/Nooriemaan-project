import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FileText, Calendar, Users, Search, Download, Copy, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import FontSettings, { getSavedFont } from '../components/FontSettings';

const AttendanceReports = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';
    const navigate = useNavigate();

    // ===== STATES =====
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('daily');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    );
    const [showFontSettings, setShowFontSettings] = useState(false);
    const [attendanceData, setAttendanceData] = useState({});
    const [monthlyStats, setMonthlyStats] = useState({
        present: 0,
        absent: 0,
        leave: 0,
        lateMins: 0,
        earlyMins: 0,
        deduction: 0,
        overtime: 0
    });

    // Loading screen — 5s to match progress bar
    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoading(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Fetch Attendance Data when staff or month changes
    useEffect(() => {
        const fetchData = async () => {
            if (!selectedStaff || !selectedMonth) return;

            try {
                const [year, month] = selectedMonth.split('-').map(Number);
                const startOfMonth = new Date(year, month - 1, 1);
                const endOfMonth = new Date(year, month, 0, 23, 59, 59);

                const q = query(
                    collection(db, 'attendance'),
                    where('staffId', '==', Number(selectedStaff)),
                    where('date', '>=', Timestamp.fromDate(startOfMonth)),
                    where('date', '<=', Timestamp.fromDate(endOfMonth)),
                    orderBy('date', 'asc')
                );

                const snapshot = await getDocs(q);
                const data = {};
                let stats = {
                    present: 0,
                    absent: 0,
                    leave: 0,
                    lateMins: 0,
                    earlyMins: 0,
                    deduction: 0,
                    overtime: 0
                };

                snapshot.forEach((doc) => {
                    const record = doc.data();
                    const date = record.date.toDate();
                    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    data[dateStr] = record;

                    // Calculate stats
                    if (record.status === 'present') {
                        stats.present++;
                        if (record.isLate) stats.lateMins += (record.lateMinutes || 0);
                        if (record.isEarlyLeave) stats.earlyMins += (record.earlyMinutes || 0);
                    } else if (record.status === 'absent') {
                        stats.absent++;
                    } else if (record.status === 'leave') {
                        stats.leave++;
                    }
                    if (record.deduction) stats.deduction += (record.deduction || 0);
                });

                setAttendanceData(data);
                setMonthlyStats(stats);
            } catch (error) {
                console.error("Error fetching attendance reports:", error);
            }
        };

        fetchData();
    }, [selectedStaff, selectedMonth]);

    // Staff list (Limited to only ID 1 for now as per request)
    const staffList = [
        { id: 1, name: t('staff.1') }
    ];

    // Tabs configuration
    const tabs = [
        { id: 'daily', label: t('reports.tabs.daily'), icon: FileText },
        { id: 'monthly', label: t('reports.tabs.monthly'), icon: Calendar },
    ];

    // Table column headers matching dimionline style
    const tableHeaders = [
        'serial', 'date', 'day', 'status',
        'startLessMin', 'duringLessMin', 'endLessMin',
        'totalLessMin', 'totalOvertime', 'advanceLessMin', 'remarks'
    ];

    // Day names in Urdu
    const dayNamesUr = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Generate placeholder rows for the selected month
    const generateMonthDays = () => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const rows = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
            const isPast = date <= today;
            const isFriday = dayOfWeek === 5;

            const record = attendanceData[dateStr];

            // Determine status text/color from real record or default logic
            let statusText = '-';
            let statusClass = 'text-gray-500';

            if (isFriday) {
                statusText = isRTL ? 'تعطیل: جمعہ' : 'Holiday: Friday';
                statusClass = 'text-blue-600 bg-blue-50';
            } else if (record) {
                // Translate status from DB ('present', 'absent', 'leave')
                if (record.status === 'present') {
                    statusText = isRTL ? 'حاضر' : 'Present';
                    statusClass = 'text-emerald-600 bg-emerald-50';
                } else if (record.status === 'absent') {
                    statusText = isRTL ? 'غیر حاضر' : 'Absent';
                    statusClass = 'text-red-600 bg-red-50';
                } else if (record.status === 'leave') {
                    statusText = isRTL ? 'رخصت' : 'Leave';
                    statusClass = 'text-amber-600 bg-amber-50';
                } else if (record.status === 'holiday') {
                    statusText = isRTL ? 'تعطیل' : 'Holiday';
                    statusClass = 'text-blue-600 bg-blue-50';
                }
            } else if (isPast) {
                // If past date and no record found -> Absent (Subject to policy, but safe assumption for visual gap)
                statusText = '-'; // Or 'Not Marked'
            }

            rows.push({
                serial: day,
                date: dateStr,
                day: isRTL ? dayNamesUr[dayOfWeek] : dayNamesEn[dayOfWeek],
                status: statusText,
                statusRaw: record?.status || '',
                statusClass: statusClass,
                startLessMin: record?.isLate ? record.lateMinutes : 0,
                duringLessMin: 0,
                endLessMin: record?.isEarlyLeave ? record.earlyMinutes : 0,
                totalLessMin: (record?.lateMinutes || 0) + (record?.earlyMinutes || 0),
                totalOvertime: 0,
                advanceLessMin: 0,
                remarks: record?.reason || record?.reasonType || '',
                deduction: record?.deduction || 0,
                isFriday,
                isPast
            });
        }
        return rows;
    };

    const monthDays = generateMonthDays();

    // Current date/time for footer
    const now = new Date();
    const footerTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const footerDate = now.toLocaleDateString('en-GB');

    // Month options
    const monthOptions = [];
    for (let m = 0; m < 12; m++) {
        const year = now.getFullYear();
        const date = new Date(year, m, 1);
        monthOptions.push({
            value: `${year}-${String(m + 1).padStart(2, '0')}`,
            label: isRTL
                ? t(`clock.months.${m}`) + ` ${year}`
                : date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        });
    }

    // Status color helper
    const getStatusStyle = (row) => {
        return row.statusClass || 'text-gray-500';
    };

    return (
        <>
            <AnimatePresence mode="wait">
                {isPageLoading ? (
                    <PageLoader key="loader" loadingText={t('reports.title')} />
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full"
                    >
                        <Helmet defer={false}>
                            <title>{t('reports.title')} - {t('appName')}</title>
                        </Helmet>

                        <div
                            className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col ${isRTL ? 'font-urdu' : 'font-english'}`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        >
                            {/* ===== TOP BAR — Premium Glassmorphism ===== */}
                            <div className="w-full bg-white/80 backdrop-blur-md px-4 md:px-6 py-3 border-b border-white/50 flex justify-between items-center gap-3 sticky top-0 z-50 shadow-sm">
                                {/* Back Button */}
                                <button
                                    onClick={() => navigate('/teachers')}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors text-sm"
                                >
                                    <ArrowLeft size={16} />
                                    <span className="hidden sm:inline">{t('common.backToDashboard')}</span>
                                </button>

                                {/* Title */}
                                <h1 className="text-base md:text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    {t('reports.title')}
                                </h1>

                                {/* Font Settings Button */}
                                <button
                                    onClick={() => setShowFontSettings(true)}
                                    className="text-gray-400 hover:text-emerald-500 transition-colors"
                                    title="Font"
                                >
                                    <span className="text-lg">ف</span>
                                </button>
                            </div>

                            {/* ===== INNER TABS — dimionline style ===== */}
                            <div className="w-full bg-white border-b border-gray-100">
                                <div className="max-w-6xl mx-auto flex">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-3 transition-all duration-200 ${activeTab === tab.id
                                                ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <tab.icon size={16} />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* ===== FILTERS BAR — Staff + Month Selector ===== */}
                            <div className="w-full bg-white/60 backdrop-blur-sm border-b border-gray-100 px-4 md:px-6 py-3">
                                <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3">
                                    {/* Staff Selector */}
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Users size={14} className="absolute top-1/2 -translate-y-1/2 text-gray-400" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
                                        <select
                                            value={selectedStaff}
                                            onChange={(e) => setSelectedStaff(e.target.value)}
                                            className={`w-full bg-white border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all appearance-none ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                                        >
                                            <option value="">{t('reports.selectStaff')}</option>
                                            {staffList.map((s) => (
                                                <option key={s.id} value={s.id}>{s.id}. {s.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ [isRTL ? 'left' : 'right']: '12px' }} />
                                    </div>

                                    {/* Month Selector */}
                                    <div className="relative min-w-[180px]">
                                        <Calendar size={14} className="absolute top-1/2 -translate-y-1/2 text-gray-400" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className={`w-full bg-white border border-gray-200 rounded-lg py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none transition-all appearance-none ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                                        >
                                            {monthOptions.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" style={{ [isRTL ? 'left' : 'right']: '12px' }} />
                                    </div>

                                    {/* Search Button */}
                                    <button className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center gap-2">
                                        <Search size={14} />
                                        {t('reports.search')}
                                    </button>
                                </div>
                            </div>

                            {/* ===== MAIN CONTENT AREA ===== */}
                            <div className="flex-1 px-4 md:px-6 py-4">
                                <div className="max-w-6xl mx-auto">

                                    {/* Report Title Bar — Green/Emerald theme */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1, duration: 0.4 }}
                                        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-xl px-4 py-3 text-center shadow-md"
                                    >
                                        <h2 className="text-white font-bold text-sm md:text-base tracking-wide">
                                            {t('reports.dailyDetail')}
                                        </h2>
                                    </motion.div>

                                    {/* Export + Entries Bar */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.4 }}
                                        className="bg-white border-x border-gray-200 px-4 py-2.5 flex justify-between items-center"
                                    >
                                        <div className="flex items-center gap-2">
                                            <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded hover:bg-emerald-600 transition-colors flex items-center gap-1">
                                                <Download size={12} />
                                                {t('reports.export.excel')}
                                            </button>
                                            <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded hover:bg-gray-200 transition-colors flex items-center gap-1">
                                                <Copy size={12} />
                                                {t('reports.export.copy')}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{t('reports.showEntries')}:</span>
                                            <select className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-300 outline-none">
                                                <option>50</option>
                                                <option>25</option>
                                                <option>10</option>
                                            </select>
                                        </div>
                                    </motion.div>

                                    {/* ===== DATA TABLE ===== */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.5 }}
                                        className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden"
                                    >
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[900px] text-xs">
                                                {/* Table Header — Green gradient */}
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                                        {tableHeaders.map((header) => (
                                                            <th
                                                                key={header}
                                                                className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 last:border-r-0 whitespace-nowrap leading-relaxed"
                                                            >
                                                                {t(`reports.tableHeaders.${header}`)}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>

                                                {/* Table Body — Rows */}
                                                <tbody>
                                                    {selectedStaff ? (
                                                        monthDays.map((row, index) => (
                                                            <motion.tr
                                                                key={row.serial}
                                                                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.02, duration: 0.3 }}
                                                                className={`border-b border-gray-100 transition-colors ${row.isFriday
                                                                    ? 'bg-emerald-50/30'
                                                                    : index % 2 === 0
                                                                        ? 'bg-white hover:bg-emerald-50/50'
                                                                        : 'bg-gray-50/50 hover:bg-emerald-50/50'
                                                                    }`}
                                                            >
                                                                <td className="px-2 py-2.5 text-center text-gray-700 font-semibold border-r border-gray-100">{row.serial}</td>
                                                                <td className="px-2 py-2.5 text-center text-gray-600 border-r border-gray-100" dir="ltr">{row.date}</td>
                                                                <td className="px-2 py-2.5 text-center text-gray-600 border-r border-gray-100 font-medium">{row.day}</td>
                                                                <td className={`px-2 py-2.5 text-center border-r border-gray-100 font-semibold ${getStatusStyle(row)}`}>
                                                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${getStatusStyle(row)}`}>
                                                                        {row.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.startLessMin}</td>
                                                                <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.duringLessMin}</td>
                                                                <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.endLessMin}</td>
                                                                <td className="px-2 py-2.5 text-center text-gray-700 font-bold border-r border-gray-100">{row.totalLessMin}</td>
                                                                <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.totalOvertime}</td>
                                                                <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.advanceLessMin}</td>
                                                                <td className="px-2 py-2.5 text-center text-gray-400">{row.remarks || '-'}</td>
                                                            </motion.tr>
                                                        ))
                                                    ) : (
                                                        /* Empty State — No staff selected */
                                                        <tr>
                                                            <td colSpan={tableHeaders.length} className="py-16 text-center">
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ duration: 0.5 }}
                                                                    className="flex flex-col items-center gap-3"
                                                                >
                                                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                                                                        <Users size={28} className="text-blue-400" />
                                                                    </div>
                                                                    <p className="text-gray-500 text-sm font-medium">
                                                                        {t('reports.selectStaff')}
                                                                    </p>
                                                                    <p className="text-gray-400 text-xs">
                                                                        {isRTL ? 'رپورٹ دیکھنے کے لیے اوپر سے عملہ منتخب کریں' : 'Select a staff member above to view their report'}
                                                                    </p>
                                                                </motion.div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Summary Row — Bottom totals (when staff selected) */}
                                        {selectedStaff && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.6, duration: 0.4 }}
                                                className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 px-4 py-3"
                                            >
                                                <div className="flex flex-wrap gap-4 text-xs">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        <span className="text-gray-500">{t('reports.summaryLabels.totalAttendance')}:</span>
                                                        <span className="font-bold text-emerald-600">{monthlyStats.present}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        <span className="text-gray-500">{t('reports.summaryLabels.totalAbsent')}:</span>
                                                        <span className="font-bold text-red-600">{monthlyStats.absent}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                        <span className="text-gray-500">{t('reports.summaryLabels.totalLeave')}:</span>
                                                        <span className="font-bold text-amber-600">{monthlyStats.leave}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                        <span className="text-gray-500">{t('reports.summaryLabels.totalDeduction')}:</span>
                                                        <span className="font-bold text-blue-600">Rs. {monthlyStats.deduction}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    {/* ===== MONTHLY TAB — Placeholder ===== */}
                                    {activeTab === 'monthly' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mt-4 text-center"
                                        >
                                            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Calendar size={32} className="text-amber-500" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-700 mb-2">{t('reports.tabs.monthly')}</h3>
                                            <p className="text-gray-400 text-sm">{t('reports.comingSoon')}</p>
                                            <p className="text-gray-300 text-xs mt-2">
                                                {isRTL ? 'اگلے سیشن میں بنایا جائے گا — پائی چارٹ اور مکمل سمری' : 'Will be built in next session — Pie chart & full summary'}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* ===== FOOTER ===== */}
                            <div className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-center text-white">
                                <p className="text-white/90 text-[10px]">
                                    {footerTime} :{footerDate} &nbsp; | &nbsp; © {t('appName')}
                                </p>
                            </div>
                        </div>

                        {/* Font Settings Modal */}
                        <FontSettings isOpen={showFontSettings} onClose={() => setShowFontSettings(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AttendanceReports;
