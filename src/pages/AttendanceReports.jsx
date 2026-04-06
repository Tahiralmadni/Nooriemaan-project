import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FileText, Calendar, Users, Search, Download, Copy, ChevronDown, ArrowLeft, Type, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import FontSettings, { getSavedFont } from '../components/FontSettings';
import AttendanceSummaryChart from '../components/AttendanceSummaryChart';
import { formatTime12Hour } from './AttendanceSchedule';
import useStaffData from '../hooks/useStaffData';
import { exportToExcel, exportToPDF } from '../utils/exportUtils';

const AttendanceReports = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';
    const navigate = useNavigate();

    // Fetch staff data from Firebase
    const { staffData, staffList, loading: staffLoading } = useStaffData();

    // ===== STATES =====
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('daily');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [selectedMonth, setSelectedMonth] = useState(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    );
    const [showFontSettings, setShowFontSettings] = useState(false);
    const [attendanceData, setAttendanceData] = useState({});


    // Loading screen — 5s to match progress bar
    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoading(false), 1500);
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

                snapshot.forEach((doc) => {
                    const record = doc.data();
                    const date = record.date.toDate();
                    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    data[dateStr] = record;
                });

                setAttendanceData(data);
            } catch (error) {
                console.error("Error fetching attendance reports:", error);
            }
        };

        fetchData();
    }, [selectedStaff, selectedMonth]);



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

    // Generate data for the selected month and calculate stats
    const { monthDays, stats } = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const daysInMonth = new Date(year, month, 0).getDate();
        const today = new Date();
        const staff = staffData ? staffData[selectedStaff] : null;
        const rows = [];

        // Stats counters
        let present = 0;
        let absent = 0;
        let leave = 0;
        let holiday = 0; // Fridays + Gazetted
        let lateMins = 0;
        let earlyMins = 0;
        let deduction = 0;
        let totalHours = 0;
        let totalMinutes = 0;

        // Calculate Effective Joining Date ONCE (not per day)
        let effectiveDate = null;
        if (staff && staff.setupDate) {
            const [sYear, sMonth, sDay] = staff.setupDate.split('-').map(Number);
            if (sDay <= 10) {
                effectiveDate = new Date(sYear, sMonth - 1, 1);
            } else {
                effectiveDate = new Date(sYear, sMonth - 1, sDay);
            }
            effectiveDate.setHours(0, 0, 0, 0);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            const dateStr = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
            const isPast = date <= today;
            const isSunday = dayOfWeek === 0;

            const record = attendanceData[dateStr];

            // Check if before effective joining date
            const isBeforeJoin = effectiveDate ? date < effectiveDate : false;

            // Determine status text/color from real record or default logic
            let statusText = '-';
            let statusClass = 'text-gray-500';
            let statusRaw = 'unknown';

            if (isBeforeJoin && isPast) {
                // Before effective setup date -> Not Joined (-)
                statusText = '-';
                statusClass = 'text-gray-400 bg-gray-50/50';
                statusRaw = 'not_joined';
            } else if (isSunday) {
                statusText = t('common.statusHolidaySunday');
                statusClass = 'text-blue-600 bg-blue-50';
                statusRaw = 'holiday';
                holiday++;
            } else if (record) {
                // Translate status from DB ('present', 'absent', 'leave')
                if (record.status === 'present') {
                    statusText = t('common.statusPresent');
                    statusClass = 'text-emerald-600 bg-emerald-50';
                    statusRaw = 'present';
                    present++;
                } else if (record.status === 'absent') {
                    statusText = t('common.statusAbsent');
                    statusClass = 'text-red-600 bg-red-50';
                    statusRaw = 'absent';
                    absent++;
                } else if (record.status === 'leave') {
                    statusText = t('common.statusLeave');
                    statusClass = 'text-amber-600 bg-amber-50';
                    statusRaw = 'leave';
                    leave++;
                } else if (record.status === 'holiday') {
                    statusText = t('common.statusHolidaySunday');
                    statusClass = 'text-blue-600 bg-blue-50';
                    statusRaw = 'holiday';
                    holiday++;
                }

                // Accumulate numeric stats
                if (record.isLate) lateMins += (record.lateMinutes || 0);
                if (record.isEarlyLeave) earlyMins += (record.earlyMinutes || 0);
                
                if (staff?.isRemote && record.status === 'present') {
                    totalHours += Number(record.hoursWorked || 0);
                    totalMinutes += Number(record.minutesWorked || 0);
                }
            } else if (isPast && !isSunday) {
                // If past date and no record found -> Mark it as Absent
                statusText = t('common.statusAbsent');
                statusClass = 'text-red-600 bg-red-50';
                statusRaw = 'absent';
                absent++; // Count it as absent
            }

            rows.push({
                serial: day,
                date: dateStr,
                day: isRTL ? dayNamesUr[dayOfWeek] : dayNamesEn[dayOfWeek],
                status: statusText,
                statusRaw: record?.status || statusRaw,
                statusClass: statusClass,
                startLessMin: record?.isLate ? record.lateMinutes : 0,
                duringLessMin: 0,
                endLessMin: record?.isEarlyLeave ? record.earlyMinutes : 0,
                totalLessMin: (record?.lateMinutes || 0) + (record?.earlyMinutes || 0),
                totalOvertime: 0,
                advanceLessMin: 0,
                remarks: record?.reason || record?.reasonType || '',
                deduction: record?.deduction || 0,
                hoursWorked: record?.hoursWorked || 0,
                minutesWorked: record?.minutesWorked || 0,
                isSunday,
                isPast
            });
        }

        return {
            monthDays: rows,
            stats: {
                present,
                absent,
                leave,
                holiday,
                lateMins,
                earlyMins,
                deduction,
                totalHours: totalHours + Math.floor(totalMinutes / 60),
                totalMinutes: totalMinutes % 60,
                totalDays: daysInMonth,
                netSalary: staff?.isRemote 
                    ? Math.round((totalHours + totalMinutes / 60) * (staff.perHourSalary || 0))
                    : (staff?.salary || 0) - deduction
            }
        };
    }, [selectedMonth, attendanceData, isRTL, selectedStaff, staffData]);

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

    // Export to Excel
    const handleExportExcel = async () => {
        const dataToExport = monthDays.map(row => ({
            [t('reports.tableHeaders.serial')]: row.serial,
            [t('reports.tableHeaders.date')]: row.date,
            [t('reports.tableHeaders.day')]: row.day,
            [t('reports.tableHeaders.status')]: row.status,
            ...(staffData[selectedStaff]?.isRemote ? {
                [isRTL ? "گھنٹے (Hours)" : "Hours"]: row.status === t('common.statusPresent') ? row.hoursWorked : '-',
                [isRTL ? "منٹ (Mins)" : "Mins"]: row.status === t('common.statusPresent') ? row.minutesWorked : '-'
            } : {
                [t('reports.tableHeaders.lateIn')]: row.startLessMin > 0 ? row.startLessMin : '-',
                [t('reports.tableHeaders.earlyOut')]: row.endLessMin > 0 ? row.endLessMin : '-'
            }),
            [t('reports.tableHeaders.remarks')]: row.remarks
        }));

        const fileName = `${t('reports.title')}_${selectedMonth}_${selectedStaff}`;
        const title = `${t('reports.title')} - ${selectedMonth}`;
        await exportToExcel(dataToExport, fileName, title, isRTL, stats);
    };

    // Export to PDF
    const handleExportPDF = async () => {
        const columns = [
            t('reports.tableHeaders.serial'),
            t('reports.tableHeaders.date'),
            t('reports.tableHeaders.day'),
            t('reports.tableHeaders.status'),
            ...(staffData[selectedStaff]?.isRemote ? [
                (isRTL ? "گھنٹے (Hours)" : "Hours"),
                (isRTL ? "منٹ (Mins)" : "Mins")
            ] : [
                t('reports.tableHeaders.lateIn'),
                t('reports.tableHeaders.earlyOut')
            ]),
            t('reports.tableHeaders.remarks')
        ];

        const rows = monthDays.map(row => [
            row.serial,
            row.date,
            row.day,
            row.status,
            ...(staffData[selectedStaff]?.isRemote ? [
                row.status === t('common.statusPresent') ? row.hoursWorked : '-',
                row.status === t('common.statusPresent') ? row.minutesWorked : '-'
            ] : [
                row.startLessMin > 0 ? `${row.startLessMin}m` : '-',
                row.endLessMin > 0 ? `${row.endLessMin}m` : '-'
            ]),
            row.remarks || '-'
        ]);

        const fileName = `${t('reports.title')}_${selectedMonth}_${selectedStaff}`;
        const title = `${t('reports.title')} - ${selectedMonth}`;
        await exportToPDF(title, columns, rows, fileName);
    };

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

                        <div className="min-h-screen bg-gray-50/50 pb-8 relative" dir={isRTL ? 'rtl' : 'ltr'}>
                            {/* ===== TOP BAR — Clean Flow without overlapping ===== */}
                            <div className="w-full bg-white dark:bg-slate-900 px-4 md:px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center gap-3 shadow-sm">
                                {/* Back Button */}
                                <button
                                    onClick={() => navigate('/teachers')}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-emerald-600 transition-colors text-sm font-medium"
                                >
                                    <ArrowLeft size={18} />
                                    <span className="hidden sm:inline">{t('common.backToDashboard')}</span>
                                </button>

                                {/* Title - Centered without absolute positioning to flow naturally */}
                                <h1 className="text-lg md:text-xl font-bold text-emerald-800 dark:text-emerald-400 whitespace-nowrap">
                                    {t('reports.title')}
                                </h1>

                                {/* Font Settings Button */}
                                <button
                                    onClick={() => setShowFontSettings(true)}
                                    className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all"
                                    title="Font Settings"
                                >
                                    <Type size={20} />
                                </button>
                            </div>

                            {/* ===== INNER TABS — dimionline style ===== */}
                            <div className="w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
                                <div className="max-w-6xl mx-auto flex overflow-x-auto">
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

                            {/* ===== FILTERS BAR — Visibility Optimized ===== */}
                            <div className="w-full bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 px-4 md:px-6 py-3">
                                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
                                    {/* Staff Selector */}
                                    <div className="relative flex-1 min-w-0">
                                        <Users size={16} className="absolute top-1/2 -translate-y-1/2 text-gray-500" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
                                        <select
                                            value={selectedStaff}
                                            onChange={(e) => setSelectedStaff(e.target.value)}
                                            className={`w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2.5 text-sm font-medium text-gray-900 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                        >
                                            <option value="">{t('reports.selectStaff')}</option>
                                            {staffList.map((s) => (
                                                <option key={s.id} value={s.id}>{s.id}. {isRTL ? s.nameUr : s.nameEn}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" style={{ [isRTL ? 'left' : 'right']: '12px' }} />
                                    </div>

                                    {/* Month Selector */}
                                    <div className="relative flex-1 min-w-0">
                                        <Calendar size={16} className="absolute top-1/2 -translate-y-1/2 text-gray-500" style={{ [isRTL ? 'right' : 'left']: '12px' }} />
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(e.target.value)}
                                            className={`w-full bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg py-2.5 text-sm font-medium text-gray-900 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                        >
                                            {monthOptions.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={16} className="absolute top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" style={{ [isRTL ? 'left' : 'right']: '12px' }} />
                                    </div>

                                    {/* Search Button */}
                                    <button className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 transform active:scale-95">
                                        <Search size={16} />
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
                                        className="bg-white dark:bg-slate-800 border-x border-gray-200 dark:border-slate-700 px-4 py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                                    >
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <button
                                                onClick={handleExportExcel}
                                                className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded hover:bg-emerald-600 transition-colors flex items-center gap-1"
                                            >
                                                <Download size={14} />
                                                {t('reports.export.excel')}
                                            </button>
                                            <button
                                                onClick={handleExportPDF}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-semibold rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1 border border-gray-200 dark:border-slate-600"
                                            >
                                                <FileText size={14} />
                                                PDF / Print
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const headers = [t('reports.tableHeaders.serial'), t('reports.tableHeaders.date'), t('reports.tableHeaders.day'), t('reports.tableHeaders.status'), t('reports.tableHeaders.lateIn'), t('reports.tableHeaders.earlyOut'), t('reports.tableHeaders.remarks')];
                                                    const rows = monthDays.map(r => [r.serial, r.date, r.day, r.status, r.startLessMin > 0 ? r.startLessMin : '-', r.endLessMin > 0 ? r.endLessMin : '-', r.remarks || '-'].join('\t'));
                                                    const text = headers.join('\t') + '\n' + rows.join('\n');
                                                    navigator.clipboard.writeText(text);
                                                    import('react-hot-toast').then(m => m.default.success(t('toast.copied'), { duration: 1500 }));
                                                }}
                                                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-800"
                                            >
                                                {t('reports.export.copy')}
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>{t('reports.showEntries')}:</span>
                                            <select className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-300 outline-none">
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
                                        className="bg-white dark:bg-slate-800 rounded-b-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden"
                                    >
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[900px] text-xs">
                                                {/* Table Header — Green gradient */}
                                                <thead>
                                                    <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                                                        <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.serial')}</th>
                                                        <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.date')}</th>
                                                        <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.day')}</th>
                                                        <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.status')}</th>
                                                        
                                                        {staffData[selectedStaff]?.isRemote ? (
                                                            <>
                                                                <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{isRTL ? "گھنٹے (Hours)" : "Hours"}</th>
                                                                <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{isRTL ? "منٹ (Mins)" : "Mins"}</th>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.startLessMin')}</th>
                                                                <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.duringLessMin')}</th>
                                                                <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.endLessMin')}</th>
                                                                <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.totalLessMin')}</th>
                                                                <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.totalOvertime')}</th>
                                                                <th className="px-2 py-3 font-bold text-[11px] text-center border-r border-emerald-400/30 whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.advanceLessMin')}</th>
                                                            </>
                                                        )}
                                                        <th className="px-2 py-3 font-bold text-[11px] text-center whitespace-nowrap leading-relaxed">{t('reports.tableHeaders.remarks')}</th>
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
                                                                className={`border-b border-gray-100 transition-colors ${row.isSunday
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

                                                                {staffData[selectedStaff]?.isRemote ? (
                                                                    <>
                                                                        <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.statusRaw === 'present' ? row.hoursWorked : '-'}</td>
                                                                        <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.statusRaw === 'present' ? row.minutesWorked : '-'}</td>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.startLessMin}</td>
                                                                        <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.duringLessMin}</td>
                                                                        <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.endLessMin}</td>
                                                                        <td className="px-2 py-2.5 text-center text-gray-700 font-bold border-r border-gray-100">{row.totalLessMin}</td>
                                                                        <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.totalOvertime}</td>
                                                                        <td className="px-2 py-2.5 text-center text-gray-500 border-r border-gray-100">{row.advanceLessMin}</td>
                                                                    </>
                                                                )}
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
                                                                        {t('common.selectStaffPrompt')}
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
                                                        <span className="font-bold text-emerald-600">{stats.present}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        <span className="text-gray-500">{t('reports.summaryLabels.totalAbsent')}:</span>
                                                        <span className="font-bold text-red-600">{stats.absent}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                                        <span className="text-gray-500">{t('reports.summaryLabels.totalLeave')}:</span>
                                                        <span className="font-bold text-amber-600">{stats.leave}</span>
                                                    </div>
                                                    {staffData[selectedStaff]?.isRemote && (
                                                        <div className="flex items-center gap-1.5 px-3 border-l border-gray-200 ml-2">
                                                            <Clock size={14} className="text-indigo-500" />
                                                            <span className="text-gray-500">{isRTL ? "کل وقت" : "Total Work"}:</span>
                                                            <span className="font-bold text-indigo-600">{stats.totalHours}h {stats.totalMinutes}m</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    {/* ===== MONTHLY TAB — Chart & Summary ===== */}
                                    {activeTab === 'monthly' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5 }}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
                                        >
                                            {/* Left: Chart */}
                                            <div className="h-[400px]">
                                                <AttendanceSummaryChart
                                                    present={stats.present}
                                                    absent={stats.absent}
                                                    leave={stats.leave}
                                                    holiday={stats.holiday}
                                                />
                                            </div>

                                            {/* Right: Detailed Summary Box */}
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-center">
                                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                                    <FileText size={20} className="text-emerald-500" />
                                                    {t('reports.summary')}
                                                </h3>

                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-gray-600 font-medium">{t('reports.monthlyStats.totalDays')}</span>
                                                        <span className="text-lg font-bold text-gray-800">{stats.totalDays}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                        <span className="text-gray-600 font-medium">{t('reports.monthlyStats.workingDays')}</span>
                                                        <span className="text-lg font-bold text-gray-800">{stats.totalDays - stats.holiday}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                                        <span className="text-emerald-700 font-medium">{t('reports.monthlyStats.totalPresent')}</span>
                                                        <span className="text-lg font-bold text-emerald-700">{stats.present}</span>
                                                    </div>
                                                    {staffData[selectedStaff]?.isRemote ? (
                                                        <>
                                                            <div className="flex justify-between items-center p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                                                <span className="text-indigo-700 font-medium">{isRTL ? "کل کام کے گھنٹے" : "Total Work Hours"}</span>
                                                                <span className="text-lg font-bold text-indigo-700">{stats.totalHours}h {stats.totalMinutes}m</span>
                                                            </div>
                                                            <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                                                                <span className="text-emerald-700 font-medium">{isRTL ? "حساب شدہ تنخواہ" : "Calculated Salary"}</span>
                                                                <span className="text-lg font-bold text-emerald-700">Rs {stats.netSalary.toLocaleString()}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                            <span className="text-gray-600 font-medium">{t('reports.summaryLabels.totalLateMin')}</span>
                                                            <span className="text-lg font-bold text-red-500">{stats.lateMins} m</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                                                    <span className="text-gray-500 font-medium text-sm">{t('reports.monthlyStats.attendancePercentage')}</span>
                                                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                                        {stats.totalDays > 0 ? Math.round(((stats.present + stats.leave) / (stats.totalDays - stats.holiday)) * 100) || 0 : 0}%
                                                    </span>
                                                </div>
                                            </div>
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
