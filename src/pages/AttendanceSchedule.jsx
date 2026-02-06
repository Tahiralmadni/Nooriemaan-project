import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

const AttendanceSchedule = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    // Active Tab
    const [activeTab, setActiveTab] = useState('attendance');

    // States
    const [status, setStatus] = useState('');
    const [reason, setReason] = useState('');
    const [reasonType, setReasonType] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [savedTime, setSavedTime] = useState('');
    const [isLate, setIsLate] = useState(false);
    const [lateMinutes, setLateMinutes] = useState(0);
    const [isEarlyLeave, setIsEarlyLeave] = useState(false);
    const [earlyMinutes, setEarlyMinutes] = useState(0);

    // Permission toggles (اجازت)
    const [entryPermission, setEntryPermission] = useState(false);
    const [exitPermission, setExitPermission] = useState(false);

    // Date picker for attendance
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    // Manual time inputs
    const [manualEntryTime, setManualEntryTime] = useState('08:00');
    const [manualExitTime, setManualExitTime] = useState('04:00');

    // History State
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Helper: Convert 24-hour time to 12-hour AM/PM format
    const formatTime12Hour = (time24) => {
        if (!time24) return '-';
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight, 13-23 to 1-11
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    // Current date/time
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB');
    const currentTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Staff 1 - Muhammad Akram Attari
    const staff = {
        id: 1,
        nameUr: 'محمد اکرم عطاری',
        nameEn: 'Muhammad Akram Attari',
        roleUr: 'نائب ناظم',
        roleEn: 'Naib Nazim',
        entryTime: '8:00 AM',
        exitTime: '4:00 PM',
        entryHour: 8,
        exitHour: 16,
        totalHours: 8,
        salary: 25000,
        // Correct Formula: 26 working days per month (law standard)
        perDaySalary: Math.round(25000 / 26),       // Rs. 961
        perHourSalary: Math.round(25000 / 26 / 8),  // Rs. 120
        perMinuteSalary: 25000 / 26 / 8 / 60,       // Rs. 2 (approx)
        phone: '03128593301',
        email: 'ishaqakram67@gmail.com',
        city: 'Karachi',
        country: 'Pakistan',
        joinDate: 'October 2020'
    };

    // Check if late based on manual entry time (NO grace period - 1 min late = deduction)
    useEffect(() => {
        const [hours, minutes] = manualEntryTime.split(':').map(Number);
        const entryInMinutes = hours * 60 + minutes;
        const expectedEntry = staff.entryHour * 60; // 8:00 = 480 minutes

        if (entryInMinutes > expectedEntry) {
            setIsLate(true);
            setLateMinutes(entryInMinutes - expectedEntry);
        } else {
            setIsLate(false);
            setLateMinutes(0);
        }
    }, [manualEntryTime]);

    // Check if leaving early based on manual exit time
    useEffect(() => {
        const [hours, minutes] = manualExitTime.split(':').map(Number);
        if (hours < staff.exitHour || (hours === staff.exitHour && minutes === 0 && hours < staff.exitHour)) {
            setIsEarlyLeave(true);
            const earlyTime = (staff.exitHour - hours) * 60 - minutes;
            setEarlyMinutes(earlyTime > 0 ? earlyTime : 0);
        } else {
            setIsEarlyLeave(false);
            setEarlyMinutes(0);
        }
    }, [manualExitTime]);

    useEffect(() => {
        document.title = t('pageTitles.attendanceSchedule');
    }, [t]);

    // Auto-detect Sunday and set Holiday, Reset for others
    useEffect(() => {
        const dateObj = new Date(selectedDate);
        const dayOfWeek = dateObj.getDay(); // 0 = Sunday

        if (dayOfWeek === 0) {
            setStatus('holiday'); // Auto-select Holiday for Sunday
        } else {
            setStatus(''); // Reset to Select for other days
        }
    }, [selectedDate]);

    // AUTO-SAVE Sunday Holiday - Only on that Sunday, not in advance
    useEffect(() => {
        const autoSaveSundayHoliday = async () => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday

            // Only proceed if TODAY is Sunday
            if (dayOfWeek !== 0) return;

            // Check if record already exists for today
            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            try {
                const q = query(
                    collection(db, 'attendance'),
                    where('staffId', '==', staff.id),
                    where('date', '>=', Timestamp.fromDate(startOfDay)),
                    where('date', '<=', Timestamp.fromDate(endOfDay))
                );

                const snapshot = await getDocs(q);

                // If NO record exists for today (Sunday), auto-save holiday
                if (snapshot.empty) {
                    const holidayDate = new Date(today);
                    holidayDate.setHours(12, 0, 0, 0);

                    await addDoc(collection(db, 'attendance'), {
                        staffId: staff.id,
                        staffName: staff.nameEn,
                        status: 'holiday',
                        reason: 'اتوار - Weekly Holiday',
                        reasonType: 'sunday',
                        date: Timestamp.fromDate(holidayDate),
                        entryTime: '-',
                        exitTime: '-',
                        markedAt: 'Auto-saved',
                        salary: staff.salary,
                        isLate: false,
                        lateMinutes: 0,
                        deduction: 0
                    });
                    console.log('✅ Sunday Holiday auto-saved for:', today.toDateString());
                }
            } catch (error) {
                console.error('Auto-save Sunday error:', error);
            }
        };

        autoSaveSundayHoliday();
    }, []); // Run once on component mount

    // Fetch Attendance History
    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            // Get start/end of current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const q = query(
                collection(db, 'attendance'),
                where('staffId', '==', staff.id),
                where('date', '>=', Timestamp.fromDate(startOfMonth)),
                where('date', '<=', Timestamp.fromDate(endOfMonth))
            );

            const snapshot = await getDocs(q);
            const history = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    dateStr: data.date.toDate().toLocaleDateString('en-GB')
                };
            });

            // Sort by date ASC (oldest first: 1, 2, 3...)
            history.sort((a, b) => a.date.seconds - b.date.seconds);

            // Filter duplicates (Client-side cleanup for display)
            const uniqueHistory = [];
            const seenDates = new Set();
            for (const record of history) {
                if (!seenDates.has(record.dateStr)) {
                    seenDates.add(record.dateStr);
                    uniqueHistory.push(record);
                }
            }

            setAttendanceHistory(uniqueHistory);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
        setIsLoadingHistory(false);
    };

    // Auto-fetch history when Summary tab is active
    useEffect(() => {
        if (activeTab === 'summary') {
            fetchHistory();
        }
    }, [activeTab]);

    // Check for missing previous days attendance
    const checkMissingDays = async () => {
        const selectedDateObj = new Date(selectedDate);
        const missingDays = [];

        // Check previous days in current month
        for (let i = 1; i <= 7; i++) {
            const checkDate = new Date(selectedDateObj);
            checkDate.setDate(selectedDateObj.getDate() - i);

            // Skip if before month start
            if (checkDate.getMonth() !== selectedDateObj.getMonth()) break;

            // Query Firebase for this date (Including Sundays now)
            const startOfDay = new Date(checkDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(checkDate);
            endOfDay.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, 'attendance'),
                where('staffId', '==', staff.id),
                where('date', '>=', Timestamp.fromDate(startOfDay)),
                where('date', '<=', Timestamp.fromDate(endOfDay))
            );

            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                const dateStr = checkDate.toLocaleDateString(isRTL ? 'ur-PK' : 'en-GB');
                missingDays.push(dateStr);
            }
        }

        return missingDays;
    };

    // Save attendance (NO LOCK for Admin)
    const handleSave = async () => {
        if (!status) return;

        // Check for missing previous days (ALWAYS check)
        setIsSaving(true);
        try {
            const missingDays = await checkMissingDays();

            if (missingDays.length > 0) {
                setIsSaving(false);
                alert(t('hazri.validation.missingPreviousDays') + '\n\n' + missingDays.join('\n'));
                return;
            }
        } catch (error) {
            console.error("Validation Error:", error);
            setIsSaving(false);
            if (error.code === 'failed-precondition') {
                alert("System Error: Missing Index. Please check the Console (F12) and click the link to create the index in Firebase.");
            } else {
                alert("Validation Failed: " + error.message);
            }
            return;
        }

        // Validate time is within working hours (8 AM - 4 PM) for present status
        // Note: HTML time input uses 24-hour internally (8-16), display is based on browser locale
        if (status === 'present') {
            const [entryHours, entryMins] = manualEntryTime.split(':').map(Number);
            const [exitHours, exitMins] = manualExitTime.split(':').map(Number);

            // Check entry time (8 AM to 4 PM = hours 8-16)
            if (entryHours < 8 || entryHours > 16 || (entryHours === 16 && entryMins > 0)) {
                alert(t('hazri.validation.entryTimeInvalid'));
                setIsSaving(false); // Reset loading state
                return;
            }

            // Check exit time (8 AM to 4 PM = hours 8-16)
            if (exitHours < 8 || exitHours > 16 || (exitHours === 16 && exitMins > 0)) {
                alert(t('hazri.validation.exitTimeInvalid'));
                setIsSaving(false); // Reset loading state
                return;
            }
        }

        setIsSaving(true);
        const markedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Calculate salary deduction using PER MINUTE rate
        let deduction = 0;
        if (status === 'absent') {
            deduction = staff.perDaySalary; // Full day deduction
        } else if (status === 'leave' || status === 'holiday') {
            deduction = 0; // Approved leave/holiday - no cut
        } else if (status === 'present') {
            // Late arrival deduction - PER MINUTE (ONLY if no permission)
            if (isLate && !entryPermission) {
                deduction += Math.round(lateMinutes * staff.perMinuteSalary);
            }
            // Early departure deduction - PER MINUTE (ONLY if no permission)
            if (isEarlyLeave && !exitPermission) {
                deduction += Math.round(earlyMinutes * staff.perMinuteSalary);
            }
        }

        try {
            // Use SELECTED DATE, not current date!
            const attendanceDate = new Date(selectedDate);
            attendanceDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

            await addDoc(collection(db, 'attendance'), {
                staffId: staff.id,
                staffName: staff.nameEn,
                status: status,
                reason: status !== 'present' ? reason : '',
                reasonType: status !== 'present' ? reasonType : '',
                date: Timestamp.fromDate(attendanceDate), // FIXED: Use selectedDate!
                entryTime: manualEntryTime,
                exitTime: manualExitTime,
                markedAt: markedTime,
                salary: staff.salary,
                isLate: isLate,
                lateMinutes: lateMinutes,
                deduction: deduction
            });

            setSavedTime(markedTime);
            alert(t('hazri.validation.attendanceSaved'));
            // Reset form
            setStatus('');
            setReason('');
            setReasonType('');
        } catch (error) {
            console.error('Save Error:', error);
            alert(t('hazri.validation.saveFailed'));
        }
        setIsSaving(false);
    };

    // Status options (using i18n)
    const statusOptions = [
        { value: '', label: t('hazri.select') },
        { value: 'present', label: t('hazri.present') },
        { value: 'absent', label: t('hazri.absent') },
        { value: 'leave', label: t('hazri.leave') },
        { value: 'holiday', label: t('hazri.holiday') }
    ];

    // Reason options (using i18n)
    const reasonOptions = [
        { value: '', label: t('hazri.reasons.select') },
        { value: 'traffic', label: t('hazri.reasons.traffic') },
        { value: 'family', label: t('hazri.reasons.family') },
        { value: 'weather', label: t('hazri.reasons.weather') },
        { value: 'sick', label: t('hazri.reasons.sick') },
        { value: 'lazy', label: t('hazri.reasons.lazy') },
        { value: 'secret', label: t('hazri.reasons.secret') },
        { value: 'doctor', label: t('hazri.reasons.doctor') },
        { value: 'accident', label: t('hazri.reasons.accident') },
        { value: 'funeral', label: t('hazri.reasons.funeral') },
        { value: 'police', label: t('hazri.reasons.police') },
        { value: 'other', label: t('hazri.reasons.other') }
    ];

    // Tabs configuration
    const tabs = [
        { id: 'attendance', label: t('hazri.tabs.attendance') },
        { id: 'timing', label: t('hazri.tabs.timing') },
        { id: 'verify', label: t('hazri.tabs.verify') },
        { id: 'summary', label: t('hazri.tabs.summary') }
    ];

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.attendanceSchedule')}</title>
            </Helmet>

            <div
                className={`min-h-screen bg-gray-100 flex flex-col items-center ${isRTL ? 'font-urdu' : 'font-english'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
            >

                {/* ===== TOP BAR - Matching DashboardLayout ===== */}
                <div className="w-full bg-white px-4 md:px-6 py-3 border-b border-gray-200 flex justify-between items-center gap-3 sticky top-0 z-50">
                    {/* Back to Dashboard */}
                    <a
                        href="/dashboard"
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors text-sm font-medium"
                    >
                        <span className="text-lg">{isRTL ? '→' : '←'}</span>
                        <span className="hidden sm:inline">{isRTL ? 'واپس ڈیش بورڈ' : 'Dashboard'}</span>
                    </a>

                    {/* Right side buttons - Same as Dashboard */}
                    <div className={`flex items-center gap-2 md:gap-3 ${isRTL ? 'mr-auto ml-2' : 'ml-auto mr-2'}`}>
                        <button
                            onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ur')}
                            className="px-3 md:px-4 py-2 border border-emerald-500 rounded-lg bg-emerald-50 cursor-pointer text-xs md:text-[13px] font-semibold text-emerald-500 hover:bg-emerald-100 transition-all"
                        >
                            {isRTL ? 'English' : 'اردو'}
                        </button>
                        <button
                            onClick={() => {
                                const fonts = ['jameel', 'noto', 'mehr'];
                                const currentFont = localStorage.getItem('urduFont') || 'jameel';
                                const nextIndex = (fonts.indexOf(currentFont) + 1) % fonts.length;
                                const newFont = fonts[nextIndex];
                                localStorage.setItem('urduFont', newFont);
                                document.documentElement.setAttribute('data-font', newFont);
                            }}
                            className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer text-xs md:text-[13px] flex items-center gap-1.5 text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            <span>T</span>
                            <span className="hidden sm:inline">{isRTL ? 'فونٹ' : 'Font'}</span>
                        </button>
                    </div>

                    {/* Logo on right corner (RTL) */}
                    <img
                        src="/logo-main.png"
                        alt="Logo"
                        className="h-10 w-10 object-contain"
                        onError={(e) => e.target.style.display = 'none'}
                    />
                </div>

                {/* Main Content Container */}
                <div className="w-full max-w-3xl bg-transparent p-4">
                    {/* Subtitle */}
                    <p className="text-gray-500 text-sm text-center mb-4">{t('hazri.subtitle')}</p>

                    {/* Inner Tabs */}
                    <div className="flex justify-center gap-1 mb-4 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-1.5 rounded-md font-medium text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ===== TAB 1: ATTENDANCE ===== */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-3">
                            {/* Date Bar with Staff Selector - TOP */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="p-2 text-sm border rounded bg-white"
                                    />
                                    <span className="text-gray-400">📅</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700 font-medium">{isRTL ? staff.nameUr : staff.nameEn}</span>
                                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                                        👤
                                    </div>
                                </div>
                            </div>

                            {/* Time Table - نظام الاوقات */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                                <div className="bg-emerald-600 text-white text-center py-1.5 font-bold text-sm">
                                    {t('hazri.timeTable')}
                                </div>
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="py-2 px-3 font-medium text-gray-700">{t('hazri.number')}</th>
                                            <th className="py-2 px-3 font-medium text-gray-700">{t('hazri.entryTime')}</th>
                                            <th className="py-2 px-3 font-medium text-gray-700">{t('hazri.exitTime')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center">
                                            <td className="py-2 px-3 font-bold text-emerald-600">1</td>
                                            <td className="py-2 px-3">{staff.entryTime}</td>
                                            <td className="py-2 px-3">{staff.exitTime}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* New Entry Form */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                                <div className="bg-emerald-600 text-white text-center py-1.5 font-bold text-sm">
                                    {t('hazri.newEntry')}
                                </div>

                                <div className="p-4 space-y-3">
                                    {/* Status Dropdown - منتخب کریں inside */}
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full p-2 text-sm border rounded bg-white"
                                    >
                                        {statusOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>

                                    {/* Time Inputs with Permission Toggles - ONLY for present */}
                                    {status === 'present' && (
                                        <>
                                            {/* Entry Time + Permission */}
                                            <div className="grid grid-cols-3 gap-2 items-end">
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                        {t('hazri.entryTime')}
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={manualEntryTime}
                                                        onChange={(e) => setManualEntryTime(e.target.value)}
                                                        className="w-full p-2 text-sm border rounded bg-white text-center"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                        {t('hazri.permission')}
                                                    </label>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => setEntryPermission(true)}
                                                            className={`flex-1 py-2 text-xs rounded font-bold ${entryPermission ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {t('hazri.yes')}
                                                        </button>
                                                        <button
                                                            onClick={() => setEntryPermission(false)}
                                                            className={`flex-1 py-2 text-xs rounded font-bold ${!entryPermission ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {t('hazri.no')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Exit Time + Permission */}
                                            <div className="grid grid-cols-3 gap-2 items-end">
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                        {t('hazri.exitTime')}
                                                    </label>
                                                    <input
                                                        type="time"
                                                        value={manualExitTime}
                                                        onChange={(e) => setManualExitTime(e.target.value)}
                                                        className="w-full p-2 text-sm border rounded bg-white text-center"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                        {t('hazri.permission')}
                                                    </label>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => setExitPermission(true)}
                                                            className={`flex-1 py-2 text-xs rounded font-bold ${exitPermission ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {t('hazri.yes')}
                                                        </button>
                                                        <button
                                                            onClick={() => setExitPermission(false)}
                                                            className={`flex-1 py-2 text-xs rounded font-bold ${!exitPermission ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {t('hazri.no')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Late Warning - ONLY if no permission */}
                                            {isLate && !entryPermission && (
                                                <div className="bg-amber-50 border border-amber-200 rounded p-2 flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-amber-500" />
                                                    <span className="text-amber-700 text-xs">
                                                        {t('hazri.late')} - {lateMinutes} {t('hazri.min')} | {t('hazri.deduction')}: Rs. {Math.round((lateMinutes / 60) * staff.perHourSalary)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Early Leave Warning - ONLY if no permission */}
                                            {isEarlyLeave && !exitPermission && (
                                                <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-red-500" />
                                                    <span className="text-red-700 text-xs">
                                                        {t('hazri.earlyLeave')} - {earlyMinutes} {t('hazri.min')} | {t('hazri.deduction')}: Rs. {Math.round((earlyMinutes / 60) * staff.perHourSalary)}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Reason Section - ALWAYS visible */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-600 font-medium block">
                                            {t('hazri.lateReason')}
                                        </label>
                                        <select
                                            value={reasonType}
                                            onChange={(e) => setReasonType(e.target.value)}
                                            className="w-full p-2 border rounded text-sm bg-white"
                                        >
                                            {reasonOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Other Reason Textarea - ALWAYS visible */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-600 font-medium block">
                                            {t('hazri.otherReason')}
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder={t('hazri.otherReasonPlaceholder')}
                                            className="w-full p-2 border rounded text-sm bg-white resize-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="p-4 pt-0">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className={`w-full py-2.5 rounded-lg font-bold text-base transition-all ${!isSaving
                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSaving ? '⏳...' : t('hazri.save')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 2: TIMING ===== */}
                    {activeTab === 'timing' && (
                        <div className="bg-white rounded-xl shadow p-6 text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('hazri.tabs.timing')}</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-600">{t('hazri.entryTime')}: <strong>{staff.entryTime}</strong></p>
                                <p className="text-gray-600 mt-2">{t('hazri.exitTime')}: <strong>{staff.exitTime}</strong></p>
                                <p className="text-gray-400 text-sm mt-4">Total: {staff.totalHours} hours</p>
                            </div>
                        </div>
                    )}

                    {/* ===== TAB 3: VERIFY ===== */}
                    {activeTab === 'verify' && (
                        <div className="bg-white rounded-xl shadow p-6 text-center">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('hazri.tabs.verify')}</h3>
                            <p className="text-gray-400">{t('hazri.noData')}</p>
                        </div>
                    )}

                    {/* ===== TAB 4: SUMMARY (Attendance History) ===== */}
                    {activeTab === 'summary' && (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">{t('hazri.tabs.summary')}</h3>
                                <button
                                    onClick={fetchHistory}
                                    className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                                >
                                    Refresh ↻
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="bg-emerald-50 text-emerald-800 font-bold">
                                        <tr>
                                            <th className="p-3 text-center">{t('hazri.date')}</th>
                                            <th className="p-3 text-center">Status</th>
                                            <th className="p-3 text-center">{t('hazri.entryTime')}</th>
                                            <th className="p-3 text-center">{t('hazri.exitTime')}</th>
                                            <th className="p-3 text-center">{t('hazri.salaryDeduction')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {isLoadingHistory ? (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-gray-500">Loading...</td>
                                            </tr>
                                        ) : attendanceHistory.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="p-8 text-center text-gray-400">{t('hazri.noData')}</td>
                                            </tr>
                                        ) : (
                                            attendanceHistory.map((record) => (
                                                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-3 text-center font-medium dir-ltr">{record.dateStr}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${record.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                                                            record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                                record.status === 'leave' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {t(`hazri.${record.status}`) || record.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-center" dir="ltr">
                                                        {record.status === 'present' ? formatTime12Hour(record.entryTime) : '-'}
                                                        {record.isLate && <span className="text-amber-500 block text-[10px]">{t('hazri.late')}</span>}
                                                    </td>
                                                    <td className="p-3 text-center" dir="ltr">
                                                        {record.status === 'present' ? formatTime12Hour(record.exitTime) : '-'}
                                                        {record.earlyMinutes > 0 && <span className="text-red-500 block text-[10px]">{t('hazri.earlyLeave')}</span>}
                                                    </td>
                                                    <td className="p-3 text-center font-bold text-red-600" dir="ltr">
                                                        {record.deduction > 0 ? `Rs. ${record.deduction}` : '-'}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {/* ===== TAB 4: SUMMARY ===== */}
                    {activeTab === 'summary' && (
                        <div className="bg-white rounded-xl shadow p-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">{t('hazri.tabs.summary')}</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="bg-emerald-50 p-4 rounded-xl">
                                    <p className="text-3xl font-bold text-emerald-600">--</p>
                                    <p className="text-sm text-gray-600">{t('hazri.present')}</p>
                                </div>
                                <div className="bg-red-50 p-4 rounded-xl">
                                    <p className="text-3xl font-bold text-red-600">--</p>
                                    <p className="text-sm text-gray-600">{t('hazri.absent')}</p>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl">
                                    <p className="text-3xl font-bold text-amber-600">--</p>
                                    <p className="text-sm text-gray-600">{t('hazri.leave')}</p>
                                </div>
                            </div>
                            <p className="text-center text-gray-400 mt-4 text-sm">(Feb 2026 data)</p>
                        </div>
                    )}

                    <div className="mt-6 text-center text-gray-500 text-sm">
                        📅 {dateStr} | 🕐 {currentTime}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AttendanceSchedule;
