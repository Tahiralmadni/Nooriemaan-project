import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { AlertTriangle, CheckCircle, XCircle, Clock, UserCheck, UserX, AlertCircle, Calendar, Type } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import FontSettings, { getSavedFont } from '../components/FontSettings';
import PageLoader from '../components/PageLoader';

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

    // Page Loading State
    const [isPageLoading, setIsPageLoading] = useState(true);

    // Show loading screen for 5 seconds on mount (matches progress bar)
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPageLoading(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    // Top-level Tab State (عملہ / حاضری / جدید جدول)
    const [topActiveTab, setTopActiveTab] = useState('attendance');


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
            <AnimatePresence mode="wait">
                {isPageLoading ? (
                    <PageLoader key="loader" loadingText={t('hazri.loadingAttendance')} />
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="w-full"
                    >
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

                            {/* ===== TOP BAR - Premium Glassmorphism ===== */}
                            <div className="w-full bg-white/80 backdrop-blur-md px-4 md:px-6 py-3 border-b border-white/50 flex justify-between items-center gap-3 sticky top-0 z-50 shadow-sm">
                                {/* Back to Dashboard */}
                                <a
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-all text-sm font-semibold group"
                                >
                                    <span className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                        {isRTL ? '→' : '←'}
                                    </span>
                                    <span className="hidden sm:inline">{isRTL ? 'واپس ڈیش بورڈ' : 'Dashboard'}</span>
                                </a>

                                {/* Right side buttons - Premium Style */}
                                <div className={`flex items-center gap-2 md:gap-3 ${isRTL ? 'mr-auto ml-2' : 'ml-auto mr-2'}`}>
                                    <button
                                        onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ur')}
                                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-semibold text-xs md:text-sm shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] transition-all"
                                    >
                                        {isRTL ? 'English' : 'اردو'}
                                    </button>
                                    <button
                                        onClick={() => setShowFontSettings(true)}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 font-semibold text-xs md:text-sm shadow-sm hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-1.5"
                                    >
                                        <Type size={14} />
                                        <span className="hidden sm:inline">{isRTL ? 'فونٹ' : 'Font'}</span>
                                    </button>
                                </div>

                                {/* Logo with glow effect */}
                                <div className="h-10 w-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                    <img
                                        src="/logo-main.png"
                                        alt="Logo"
                                        className="h-8 w-8 object-contain"
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                </div>
                            </div>

                            {/* Main Content Container - Premium Design */}
                            <div className="w-full max-w-lg mx-auto px-4 py-6">
                                {/* Top Level Tabs - عملہ / حاضری / جدید جدول */}
                                <div className="flex justify-center mb-4">
                                    <div className="inline-flex bg-gradient-to-r from-emerald-500 to-teal-500 p-1 rounded-xl shadow-lg">
                                        <button
                                            onClick={() => setTopActiveTab('staff')}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${topActiveTab === 'staff'
                                                ? 'bg-white text-emerald-600 shadow-md'
                                                : 'text-white hover:bg-white/20'
                                                }`}
                                            style={{ lineHeight: '2' }}
                                        >
                                            {t('hazri.topTabs.staff')}
                                        </button>
                                        <button
                                            onClick={() => setTopActiveTab('attendance')}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${topActiveTab === 'attendance'
                                                ? 'bg-white text-emerald-600 shadow-md'
                                                : 'text-white hover:bg-white/20'
                                                }`}
                                            style={{ lineHeight: '2' }}
                                        >
                                            {t('hazri.topTabs.attendance')}
                                        </button>
                                        <button
                                            onClick={() => setTopActiveTab('newSchedule')}
                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${topActiveTab === 'newSchedule'
                                                ? 'bg-white text-emerald-600 shadow-md'
                                                : 'text-white hover:bg-white/20'
                                                }`}
                                            style={{ lineHeight: '2' }}
                                        >
                                            {t('hazri.topTabs.newSchedule')}
                                        </button>
                                    </div>
                                </div>

                                {/* Page Title with Gradient */}
                                <div className="text-center mb-6">
                                    <h1
                                        className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-2"
                                        style={{ lineHeight: '2' }}
                                    >
                                        {t('hazri.subtitle')}
                                    </h1>
                                    <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
                                        <Clock size={12} />
                                        <span>{currentTime}</span>
                                        <span className="text-gray-300">•</span>
                                        <Calendar size={12} />
                                        <span>{dateStr}</span>
                                    </div>
                                </div>

                                {/* Premium Tabs - Pill Style with Glassmorphism */}
                                <div className="flex justify-center mb-6">
                                    <div className="inline-flex bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg shadow-emerald-500/10 border border-white/80">
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`
                                        relative px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ease-out
                                        ${activeTab === tab.id
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                                                        : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/50'
                                                    }
                                    `}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ===== TAB 1: ATTENDANCE ===== */}
                                {activeTab === 'attendance' && (
                                    <div className="space-y-4">
                                        {/* Staff & Date Card - Premium Glassmorphism */}
                                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-white/80 p-4">
                                            <div className="flex items-center justify-between">
                                                {/* Staff Info */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/30">
                                                        <UserCheck size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-800">{isRTL ? staff.nameUr : staff.nameEn}</h3>
                                                        <p className="text-[10px] text-gray-400 font-medium">{isRTL ? staff.roleUr : staff.roleEn}</p>
                                                    </div>
                                                </div>

                                                {/* Date Picker - Styled */}
                                                <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                                                    <Calendar size={14} className="text-emerald-500" />
                                                    <input
                                                        type="date"
                                                        value={selectedDate}
                                                        onChange={(e) => setSelectedDate(e.target.value)}
                                                        className="text-xs text-gray-700 font-semibold bg-transparent outline-none cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time Table - Premium Design */}
                                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-white/80 overflow-hidden">
                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-3 px-4">
                                                <h3 className="font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                                                    <Clock size={16} />
                                                    {t('hazri.timeTable')}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-3 divide-x divide-gray-100">
                                                <div className="p-4 text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">{t('hazri.number')}</p>
                                                    <p className="text-lg font-bold text-emerald-600">1</p>
                                                </div>
                                                <div className="p-4 text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">{t('hazri.entryTime')}</p>
                                                    <p className="text-sm font-bold text-gray-700">{staff.entryTime}</p>
                                                </div>
                                                <div className="p-4 text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">{t('hazri.exitTime')}</p>
                                                    <p className="text-sm font-bold text-gray-700">{staff.exitTime}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* New Entry Form - Premium Design */}
                                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 border border-white/80 overflow-hidden">
                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-3 px-4">
                                                <h3 className="font-bold text-sm tracking-wide">{t('hazri.newEntry')}</h3>
                                            </div>

                                            <div className="p-4 space-y-4">
                                                {/* Status Dropdown - Fixed for Urdu */}
                                                <div>
                                                    <label className="text-xs text-gray-500 font-semibold block mb-2" style={{ lineHeight: '2' }}>
                                                        {t('hazri.select')}
                                                    </label>
                                                    <select
                                                        value={status}
                                                        onChange={(e) => setStatus(e.target.value)}
                                                        className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none bg-white text-gray-700 font-medium cursor-pointer"
                                                        style={{
                                                            lineHeight: '2.2',
                                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='%2310b981' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                                            backgroundRepeat: 'no-repeat',
                                                            backgroundPosition: 'left 14px center',
                                                            backgroundSize: '20px',
                                                            appearance: 'none',
                                                            WebkitAppearance: 'none',
                                                            MozAppearance: 'none',
                                                            paddingLeft: '44px'
                                                        }}
                                                    >
                                                        {statusOptions.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Time Inputs - Premium Grid */}
                                                {status === 'present' && (
                                                    <>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            {/* Entry Section */}
                                                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <label className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
                                                                        <Clock size={10} />
                                                                        {t('hazri.entryTime')}
                                                                    </label>
                                                                    <div className="flex gap-1 bg-white rounded-lg p-0.5 shadow-sm">
                                                                        <button
                                                                            onClick={() => setEntryPermission(true)}
                                                                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${entryPermission ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-emerald-500'}`}
                                                                        >
                                                                            {t('hazri.yes')}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEntryPermission(false)}
                                                                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${!entryPermission ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-red-500'}`}
                                                                        >
                                                                            {t('hazri.no')}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    type="time"
                                                                    value={manualEntryTime}
                                                                    onChange={(e) => setManualEntryTime(e.target.value)}
                                                                    className="w-full p-2.5 text-sm border-2 border-emerald-200 rounded-lg bg-white text-center font-mono font-bold text-emerald-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
                                                                />
                                                            </div>

                                                            {/* Exit Section */}
                                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <label className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-1">
                                                                        <Clock size={10} />
                                                                        {t('hazri.exitTime')}
                                                                    </label>
                                                                    <div className="flex gap-1 bg-white rounded-lg p-0.5 shadow-sm">
                                                                        <button
                                                                            onClick={() => setExitPermission(true)}
                                                                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${exitPermission ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:text-emerald-500'}`}
                                                                        >
                                                                            {t('hazri.yes')}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setExitPermission(false)}
                                                                            className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${!exitPermission ? 'bg-red-500 text-white shadow-sm' : 'text-gray-400 hover:text-red-500'}`}
                                                                        >
                                                                            {t('hazri.no')}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    type="time"
                                                                    value={manualExitTime}
                                                                    onChange={(e) => setManualExitTime(e.target.value)}
                                                                    className="w-full p-2.5 text-sm border-2 border-amber-200 rounded-lg bg-white text-center font-mono font-bold text-amber-700 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
                                                                />
                                                            </div>
                                                        </div>


                                                        {/* Late Warning - Premium Alert */}
                                                        {isLate && !entryPermission && (
                                                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                                                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                                                    <AlertTriangle size={16} className="text-amber-500" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-amber-800 text-xs font-bold">{t('hazri.late')} - {lateMinutes} {t('hazri.min')}</p>
                                                                    <p className="text-amber-600 text-[10px]">{t('hazri.deduction')}: Rs. {Math.round((lateMinutes / 60) * staff.perHourSalary)}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Early Leave Warning - Premium Alert */}
                                                        {isEarlyLeave && !exitPermission && (
                                                            <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 shadow-sm">
                                                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                                    <AlertTriangle size={16} className="text-red-500" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-red-800 text-xs font-bold">{t('hazri.earlyLeave')} - {earlyMinutes} {t('hazri.min')}</p>
                                                                    <p className="text-red-600 text-[10px]">{t('hazri.deduction')}: Rs. {Math.round((earlyMinutes / 60) * staff.perHourSalary)}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {/* Reason Section - Fixed for Urdu */}
                                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                                    <div>
                                                        <label className="text-xs text-gray-500 font-semibold block mb-2" style={{ lineHeight: '2' }}>
                                                            {t('hazri.lateReason')}
                                                        </label>
                                                        <select
                                                            value={reasonType}
                                                            onChange={(e) => setReasonType(e.target.value)}
                                                            className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none bg-white text-gray-700 font-medium cursor-pointer"
                                                            style={{
                                                                lineHeight: '2.2',
                                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24' stroke='%2310b981' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                                                                backgroundRepeat: 'no-repeat',
                                                                backgroundPosition: 'left 14px center',
                                                                backgroundSize: '20px',
                                                                appearance: 'none',
                                                                WebkitAppearance: 'none',
                                                                MozAppearance: 'none',
                                                                paddingLeft: '44px'
                                                            }}
                                                        >
                                                            {reasonOptions.map(opt => (
                                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Other Reason Textarea */}
                                                    <div>
                                                        <label className="text-xs text-gray-500 font-semibold block mb-2" style={{ lineHeight: '2' }}>
                                                            {t('hazri.otherReason')}
                                                        </label>
                                                        <textarea
                                                            value={reason}
                                                            onChange={(e) => setReason(e.target.value)}
                                                            placeholder={t('hazri.otherReasonPlaceholder')}
                                                            className="w-full p-3 text-base border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none resize-none"
                                                            style={{ lineHeight: '2' }}
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Save Button - Premium Gradient */}
                                                <div className="pt-4 flex justify-center">
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={isSaving}
                                                        className={`
                                                px-8 py-3 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 ease-out
                                                flex items-center gap-2
                                                ${isSaving
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95'
                                                            }
                                            `}
                                                    >
                                                        {isSaving ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Saving...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckCircle size={16} />
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
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AttendanceSchedule;
