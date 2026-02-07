import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AlertTriangle, CheckCircle, XCircle, Clock, UserCheck, UserX, AlertCircle, Calendar, Type } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import FontSettings, { getSavedFont } from '../components/FontSettings';

const AttendanceSchedule = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    // Kamyabi (Success) Toast - Professional Green Style
    const showSuccessToast = (message) => {
        toast.custom((t) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Green Gradient
                    color: '#fff',
                    fontWeight: '600',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                    fontSize: isRTL ? '16px' : '14px',
                    direction: isRTL ? 'rtl' : 'ltr',
                    transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                    opacity: t.visible ? 1 : 0,
                    transition: 'all 0.3s ease-in-out',
                    minWidth: '280px',
                    zIndex: 99999
                }}
            >
                <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
                    <CheckCircle size={20} className="text-white" />
                </div>
                <span style={{ flex: 1 }}>{message}</span>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-white/70 hover:text-white transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <XCircle size={20} />
                </button>
            </div>
        ), { duration: 4000, position: 'top-center' });
    };

    // Error Toast - Red Style
    const showErrorToast = (message) => {
        toast.custom((t) => (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // Red Gradient
                    color: '#fff',
                    fontWeight: '600',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)',
                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                    fontSize: isRTL ? '16px' : '14px',
                    direction: isRTL ? 'rtl' : 'ltr',
                    transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                    opacity: t.visible ? 1 : 0,
                    transition: 'all 0.3s ease-in-out',
                    minWidth: '280px',
                    zIndex: 99999
                }}
            >
                <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
                    <AlertCircle size={20} className="text-white" />
                </div>
                <span style={{ flex: 1 }}>{message}</span>
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="text-white/70 hover:text-white transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <XCircle size={20} />
                </button>
            </div>
        ), { duration: 5000, position: 'top-center' });
    };

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

    // Font Settings Modal State
    const [showFontSettings, setShowFontSettings] = useState(false);


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
                showErrorToast(t('hazri.validation.missingPreviousDays') + '\n\n' + missingDays.join('\n'));
                return;
            }
        } catch (error) {
            console.error("Validation Error:", error);
            setIsSaving(false);
            if (error.code === 'failed-precondition') {
                showErrorToast("System Error: Missing Index. Please check the Console.");
            } else {
                showErrorToast("Validation Failed: " + error.message);
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
                showErrorToast(t('hazri.validation.entryTimeInvalid'));
                setIsSaving(false); // Reset loading state
                return;
            }

            // Check exit time (8 AM to 4 PM = hours 8-16)
            if (exitHours < 8 || exitHours > 16 || (exitHours === 16 && exitMins > 0)) {
                showErrorToast(t('hazri.validation.exitTimeInvalid'));
                setIsSaving(false); // Reset loading state
                return;
            }
        }

        setIsSaving(true);
        const markedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Calculate salary deduction using PER MINUTE rate
        let deduction = 0;

        // Finalize Late/Early status based on attendance type
        let finalIsLate = false;
        let finalLateMinutes = 0;
        let finalIsEarlyLeave = false;
        let finalEarlyMinutes = 0;

        if (status === 'absent') {
            deduction = staff.perDaySalary; // Full day deduction
        } else if (status === 'leave' || status === 'holiday') {
            deduction = 0; // Approved leave/holiday - no cut
        } else if (status === 'present') {
            // Only calculate Late/Early if Present
            finalIsLate = isLate;
            finalLateMinutes = lateMinutes;
            finalIsEarlyLeave = isEarlyLeave;
            finalEarlyMinutes = earlyMinutes;

            // Late arrival deduction - PER MINUTE (ONLY if no permission)
            if (finalIsLate && !entryPermission) {
                deduction += Math.round(finalLateMinutes * staff.perMinuteSalary);
            }
            // Early departure deduction - PER MINUTE (ONLY if no permission)
            if (finalIsEarlyLeave && !exitPermission) {
                deduction += Math.round(finalEarlyMinutes * staff.perMinuteSalary);
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
                entryTime: status === 'present' ? manualEntryTime : '-',
                exitTime: status === 'present' ? manualExitTime : '-',
                markedAt: markedTime,
                salary: staff.salary,
                // Use finalized values (false/0 for non-present)
                isLate: finalIsLate,
                lateMinutes: finalLateMinutes,
                isEarlyLeave: finalIsEarlyLeave,
                earlyMinutes: finalEarlyMinutes,
                deduction: deduction
            });

            setSavedTime(markedTime);
            showSuccessToast(t('hazri.validation.attendanceSaved'));
            // Reset form
            setStatus('');
            setReason('');
            setReasonType('');
        } catch (error) {
            console.error('Save Error:', error);
            showErrorToast(t('hazri.validation.saveFailed'));
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

            <div className="absolute top-0 left-0 w-full h-full z-[99999] pointer-events-none">
                <Toaster containerStyle={{ top: 20 }} />
            </div>

            <div
                className={`min-h-screen flex flex-col items-center ${isRTL ? 'font-urdu' : 'font-english'}`}
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
                            onClick={() => setShowFontSettings(true)}
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

                {/* Main Content Container - Made more compact */}
                <div className="w-full max-w-xl bg-transparent p-3">
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
                            {/* Date Bar with Staff Selector - COMPACT */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="p-1.5 text-xs text-gray-700 font-medium border rounded bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                                    />
                                    <span className="text-gray-400 text-sm">📅</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700 font-bold">{isRTL ? staff.nameUr : staff.nameEn}</span>
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs">
                                        👤
                                    </div>
                                </div>
                            </div>

                            {/* Time Table - نظام الاوقات */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                                <div className="bg-emerald-600 text-white text-center py-1.5 font-bold text-sm">
                                    {t('hazri.timeTable')}
                                </div>
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="py-1.5 px-2 font-medium text-gray-700">{t('hazri.number')}</th>
                                            <th className="py-1.5 px-2 font-medium text-gray-700">{t('hazri.entryTime')}</th>
                                            <th className="py-1.5 px-2 font-medium text-gray-700">{t('hazri.exitTime')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="text-center">
                                            <td className="py-1.5 px-2 font-bold text-emerald-600">1</td>
                                            <td className="py-1.5 px-2">{staff.entryTime}</td>
                                            <td className="py-1.5 px-2">{staff.exitTime}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* New Entry Form - COMPACT */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                                <div className="bg-emerald-600 text-white text-center py-1 font-bold text-xs">
                                    {t('hazri.newEntry')}
                                </div>

                                <div className="p-3 space-y-3">
                                    {/* Status Dropdown */}
                                    <div className="w-full">
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none bg-white text-gray-700"
                                        >
                                            {statusOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Time Inputs - COMPACT Grid */}
                                    {status === 'present' && (
                                        <>
                                            <div className="grid grid-cols-2 gap-3">
                                                {/* Entry Section */}
                                                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-[10px] text-gray-500 font-bold uppercase">{t('hazri.entryTime')}</label>
                                                        <div className="flex gap-0.5">
                                                            <button
                                                                onClick={() => setEntryPermission(true)}
                                                                className={`px-1.5 py-0.5 text-[9px] rounded transition-colors ${entryPermission ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                                                            >
                                                                {t('hazri.yes')}
                                                            </button>
                                                            <button
                                                                onClick={() => setEntryPermission(false)}
                                                                className={`px-1.5 py-0.5 text-[9px] rounded transition-colors ${!entryPermission ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                                                            >
                                                                {t('hazri.no')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        value={manualEntryTime}
                                                        onChange={(e) => setManualEntryTime(e.target.value)}
                                                        className="w-full p-1 text-xs border rounded bg-white text-center font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    />
                                                </div>

                                                {/* Exit Section */}
                                                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <label className="text-[10px] text-gray-500 font-bold uppercase">{t('hazri.exitTime')}</label>
                                                        <div className="flex gap-0.5">
                                                            <button
                                                                onClick={() => setExitPermission(true)}
                                                                className={`px-1.5 py-0.5 text-[9px] rounded transition-colors ${exitPermission ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                                                            >
                                                                {t('hazri.yes')}
                                                            </button>
                                                            <button
                                                                onClick={() => setExitPermission(false)}
                                                                className={`px-1.5 py-0.5 text-[9px] rounded transition-colors ${!exitPermission ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                                                            >
                                                                {t('hazri.no')}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="time"
                                                        value={manualExitTime}
                                                        onChange={(e) => setManualExitTime(e.target.value)}
                                                        className="w-full p-1 text-xs border rounded bg-white text-center font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                                                    />
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

                                    {/* Reason Section - Compact */}
                                    <div className="space-y-2 pt-2">
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                                                {t('hazri.lateReason')}
                                            </label>
                                            <select
                                                value={reasonType}
                                                onChange={(e) => setReasonType(e.target.value)}
                                                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none bg-white text-gray-700"
                                            >
                                                {reasonOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Other Reason Textarea */}
                                        <div>
                                            <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">
                                                {t('hazri.otherReason')}
                                            </label>
                                            <textarea
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                placeholder={t('hazri.otherReasonPlaceholder')}
                                                className="w-full p-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    {/* Save Button - Right Aligned, Small & Professional */}
                                    <div className="pt-3 flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className={`
                                                px-6 py-1.5 rounded-full text-xs font-bold shadow-md transition-transform active:scale-95
                                                flex items-center gap-2
                                                ${isSaving
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'
                                                }
                                            `}
                                        >
                                            {isSaving ? (
                                                <>
                                                    <span className="animate-spin">⏳</span>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>💾</span>
                                                    <span>{t('hazri.save')}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div >
                        </div >
                    )}

                    {/* ===== TAB 2: TIMING ===== */}
                    {
                        activeTab === 'timing' && (
                            <div className="bg-white rounded-xl shadow p-6 text-center">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">{t('hazri.tabs.timing')}</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-600">{t('hazri.entryTime')}: <strong>{staff.entryTime}</strong></p>
                                    <p className="text-gray-600 mt-2">{t('hazri.exitTime')}: <strong>{staff.exitTime}</strong></p>
                                    <p className="text-gray-400 text-sm mt-4">Total: {staff.totalHours} hours</p>
                                </div>
                            </div>
                        )
                    }

                    {/* ===== TAB 3: VERIFY ===== */}
                    {
                        activeTab === 'verify' && (
                            <div className="bg-white rounded-xl shadow p-6 text-center">
                                <h3 className="text-xl font-bold text-slate-800 mb-4">{t('hazri.tabs.verify')}</h3>
                                <p className="text-gray-400">{t('hazri.noData')}</p>
                            </div>
                        )
                    }

                    {/* ===== TAB 4: SUMMARY (Stats + Table) ===== */}
                    {
                        activeTab === 'summary' && (
                            <div className="space-y-3">
                                {/* Summary Cards - COMPACT & PROFESSIONAL */}
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-lg text-center shadow-sm flex flex-col items-center justify-center">
                                        <div className="text-emerald-600 mb-1"><UserCheck size={16} /></div>
                                        <p className="text-lg font-bold text-emerald-700 leading-none">--</p>
                                        <p className="text-[10px] text-emerald-600 font-medium uppercase mt-1">{t('hazri.present')}</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 p-2 rounded-lg text-center shadow-sm flex flex-col items-center justify-center">
                                        <div className="text-red-600 mb-1"><UserX size={16} /></div>
                                        <p className="text-lg font-bold text-red-700 leading-none">--</p>
                                        <p className="text-[10px] text-red-600 font-medium uppercase mt-1">{t('hazri.absent')}</p>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 p-2 rounded-lg text-center shadow-sm flex flex-col items-center justify-center">
                                        <div className="text-amber-600 mb-1"><AlertCircle size={16} /></div>
                                        <p className="text-lg font-bold text-amber-700 leading-none">--</p>
                                        <p className="text-[10px] text-amber-600 font-medium uppercase mt-1">{t('hazri.leave')}</p>
                                    </div>
                                </div>

                                {/* Attendance History Table - COMPACT */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1">
                                            <Calendar size={12} className="text-gray-500" />
                                            {t('hazri.tabs.summary')}
                                        </h3>
                                        <button
                                            onClick={fetchHistory}
                                            className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold bg-white border border-emerald-200 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
                                        >
                                            Next ↻
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs text-right">
                                            <thead className="bg-emerald-50 text-emerald-800 font-bold border-b border-emerald-100">
                                                <tr>
                                                    <th className="p-1.5 text-center">{t('hazri.date')}</th>
                                                    <th className="p-1.5 text-center">Status</th>
                                                    <th className="p-1.5 text-center">{t('hazri.entryTime')}</th>
                                                    <th className="p-1.5 text-center">{t('hazri.exitTime')}</th>
                                                    <th className="p-1.5 text-center">{t('hazri.salaryDeduction')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {isLoadingHistory ? (
                                                    <tr>
                                                        <td colSpan="5" className="p-4 text-center text-gray-400 text-[10px]">Loading...</td>
                                                    </tr>
                                                ) : attendanceHistory.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="5" className="p-4 text-center text-gray-400 text-[10px]">{t('hazri.noData')}</td>
                                                    </tr>
                                                ) : (
                                                    attendanceHistory.map((record) => (
                                                        <tr key={record.id} className="hover:bg-emerald-50/30 transition-colors">
                                                            <td className="p-1.5 text-center font-medium text-gray-600 dir-ltr text-[10px]">{record.dateStr}</td>
                                                            <td className="p-1.5 text-center">
                                                                <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold border ${record.status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                    record.status === 'absent' ? 'bg-red-50 text-red-600 border-red-200' :
                                                                        record.status === 'leave' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                            'bg-amber-50 text-amber-600 border-amber-200'
                                                                    }`}>
                                                                    {t(`hazri.${record.status}`) || record.status}
                                                                </span>
                                                            </td>
                                                            <td className="p-1.5 text-center text-gray-600 text-[10px]" dir="ltr">
                                                                {record.status === 'present' ? formatTime12Hour(record.entryTime) : '-'}
                                                                {record.status === 'present' && record.isLate && <span className="text-amber-500 block text-[8px]">{t('hazri.late')}</span>}
                                                            </td>
                                                            <td className="p-1.5 text-center text-gray-600 text-[10px]" dir="ltr">
                                                                {record.status === 'present' ? formatTime12Hour(record.exitTime) : '-'}
                                                                {record.status === 'present' && record.earlyMinutes > 0 && <span className="text-red-500 block text-[8px]">{t('hazri.earlyLeave')}</span>}
                                                            </td>
                                                            <td className="p-1.5 text-center font-bold text-red-500 text-[10px]" dir="ltr">
                                                                {record.deduction > 0 ? `Rs. ${record.deduction}` : '-'}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-gray-50 border-t border-gray-100 p-1 text-center">
                                        <p className="text-[9px] text-gray-400">(Feb 2026 data)</p>
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    <div className="mt-6 text-center text-gray-500 text-sm">
                        📅 {dateStr} | 🕐 {currentTime}
                    </div>
                </div >
            </div >

            {/* Font Settings Modal */}
            <FontSettings isOpen={showFontSettings} onClose={() => setShowFontSettings(false)} />
        </>
    );
};

export default AttendanceSchedule;
