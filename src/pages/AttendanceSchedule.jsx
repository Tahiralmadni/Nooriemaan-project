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
    const [manualExitTime, setManualExitTime] = useState('16:00');

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

    // ===== STAFF DATA — Yahan naye staff add karo =====
    const staffData = {
        1: {
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
            salary: 26620,
            perDaySalary: Math.round(26620 / 26),
            perHourSalary: Math.round(26620 / 26 / 8),
            perMinuteSalary: 26620 / 26 / 8 / 60,
            phone: '03128593301',
            email: 'ishaqakram67@gmail.com',
            city: 'Karachi',
            country: 'Pakistan',
            joinDate: 'October 2020',
            setupDate: '2025-01-01' // For Akram Attari, from January
        },
        2: {
            id: 2,
            nameUr: 'قاری سید عمیر عطاری',
            nameEn: 'Qari Syed Umair Attari',
            roleUr: 'مدرسہ ناظم حسین آباد',
            roleEn: 'Madrasa Nazim Hussainabad',
            entryTime: '8:00 AM',
            exitTime: '4:00 PM',
            entryHour: 8,
            exitHour: 16,
            totalHours: 8,
            salary: 13000,
            perDaySalary: Math.round(13000 / 26),
            perHourSalary: Math.round(13000 / 26 / 8),
            perMinuteSalary: 13000 / 26 / 8 / 60,
            phone: '03138657703',
            email: '-',
            city: 'Karachi',
            country: 'Pakistan',
            joinDate: 'June 2025',
            setupDate: '2026-02-25'
        },
        3: {
            id: 3,
            nameUr: 'محمد منیب صابر',
            nameEn: 'Muhammad Muneeb Sabir',
            roleUr: 'مدرس - بلال مسجد',
            roleEn: 'Mudarris - Bilal Masjid',
            entryTime: '8:00 AM',
            exitTime: '11:00 AM',
            entryHour: 8,
            exitHour: 11,
            totalHours: 3,
            salary: 7500,
            perDaySalary: Math.round(7500 / 26),
            perHourSalary: Math.round(7500 / 26 / 3),
            perMinuteSalary: 7500 / 26 / 3 / 60,
            phone: '03152643153',
            email: 'muneebattari527@gmail.com',
            city: 'Karachi',
            country: 'Pakistan',
            joinDate: 'October 2025',
            setupDate: '2026-02-26'
        },
        4: {
            id: 4,
            nameUr: 'مدثر رضا',
            nameEn: 'Mudassir Raza',
            roleUr: 'مدرس — نیا آباد صبح',
            roleEn: 'Mudaris — Nayabad Subha',
            entryTime: '8:00 AM',
            exitTime: '11:00 AM',
            entryHour: 8,
            exitHour: 11,
            totalHours: 3,
            salary: 7500,
            perDaySalary: Math.round(7500 / 26),
            perHourSalary: Math.round(7500 / 26 / 3),
            perMinuteSalary: 7500 / 26 / 3 / 60,
            phone: '03243499859',
            email: 'mudassirrazachishti@gmail.com',
            city: 'Karachi',
            country: 'Pakistan',
            joinDate: 'August 2025',
            setupDate: '2025-08-01'
        },
        5: {
            id: 5,
            nameUr: 'مدثر رضا',
            nameEn: 'Mudassir Raza',
            roleUr: 'مدرس — نیا آباد دوپہر',
            roleEn: 'Mudaris — Nayabad Dopher',
            entryTime: '2:00 PM',
            exitTime: '4:00 PM',
            entryHour: 14,
            exitHour: 16,
            totalHours: 2,
            salary: 6000,
            perDaySalary: Math.round(6000 / 26),
            perHourSalary: Math.round(6000 / 26 / 2),
            perMinuteSalary: 6000 / 26 / 2 / 60,
            phone: '03243499859',
            email: 'mudassirrazachishti@gmail.com',
            city: 'Karachi',
            country: 'Pakistan',
            joinDate: 'August 2025',
            setupDate: '2026-03-05'
        },
        6: {
            id: 6,
            nameUr: 'مدثر رضا',
            nameEn: 'Mudassir Raza',
            roleUr: 'عطیہ — موسیٰ لائن',
            roleEn: 'Aattiya — Musa line',
            entryTime: '11:15 AM',
            exitTime: '1:15 PM',
            entryHour: 11.25,
            exitHour: 13.25,
            totalHours: 2,
            salary: 7500,
            perDaySalary: Math.round(7500 / 26),
            perHourSalary: Math.round(7500 / 26 / 2),
            perMinuteSalary: 7500 / 26 / 2 / 60,
            phone: '03243499859',
            email: 'mudassirrazachishti@gmail.com',
            city: 'Karachi',
            country: 'Pakistan',
            joinDate: 'August 2025',
            setupDate: '2025-08-01'
        },
        7: {
            id: 7,
            nameUr: 'عبید رضا',
            nameEn: 'Ubaid Raza',
            roleUr: 'مدرس — نیا آباد',
            roleEn: 'Mudaris (Nayabad)',
            entryTime: '2:00 PM',
            exitTime: '4:00 PM',
            entryHour: 14,
            exitHour: 16,
            totalHours: 2,
            salary: 6500,
            perDaySalary: Math.round(6500 / 26),
            perHourSalary: Math.round(6500 / 26 / 2),
            perMinuteSalary: 6500 / 26 / 2 / 60,
            phone: '03269676389',
            email: 'ubaidattari0326@gmail.com',
            city: 'Karachi',
            country: 'Pakistan',
            joinDate: 'January 2023',
            setupDate: '2023-01-01'
        }
    };

    // Selected staff — dropdown se change hoga
    const [selectedStaffId, setSelectedStaffId] = useState(1);
    const staff = staffData[selectedStaffId];

    // Auto-update entry/exit times when staff changes
    useEffect(() => {
        const s = staffData[selectedStaffId];
        if (s) {
            setManualEntryTime(String(s.entryHour).padStart(2, '0') + ':00');
            setManualExitTime(String(s.exitHour).padStart(2, '0') + ':00');
        }
    }, [selectedStaffId]);

    // Check if late based on manual entry time (NO grace period - 1 min late = deduction)
    useEffect(() => {
        const [hours, minutes] = manualEntryTime.split(':').map(Number);
        const entryInMinutes = hours * 60 + minutes;
        const expectedEntry = staff.entryHour * 60;

        if (entryInMinutes > expectedEntry) {
            setIsLate(true);
            setLateMinutes(entryInMinutes - expectedEntry);
        } else {
            setIsLate(false);
            setLateMinutes(0);
        }
    }, [manualEntryTime, selectedStaffId]);

    // Check if leaving early based on manual exit time
    useEffect(() => {
        const [hours, minutes] = manualExitTime.split(':').map(Number);
        const exitInMinutes = hours * 60 + minutes;
        const expectedExit = staff.exitHour * 60;

        if (exitInMinutes < expectedExit) {
            setIsEarlyLeave(true);
            setEarlyMinutes(expectedExit - exitInMinutes);
        } else {
            setIsEarlyLeave(false);
            setEarlyMinutes(0);
        }
    }, [manualExitTime, selectedStaffId]);

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

    // AUTO-SAVE Sunday Holiday for ALL staff - Only on that Sunday, not in advance
    useEffect(() => {
        const autoSaveSundayHoliday = async () => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 = Sunday

            // Only proceed if TODAY is Sunday
            if (dayOfWeek !== 0) return;

            const startOfDay = new Date(today);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(today);
            endOfDay.setHours(23, 59, 59, 999);

            // Loop through ALL staff members
            for (const s of Object.values(staffData)) {
                try {
                    const q = query(
                        collection(db, 'attendance'),
                        where('staffId', '==', s.id),
                        where('date', '>=', Timestamp.fromDate(startOfDay)),
                        where('date', '<=', Timestamp.fromDate(endOfDay))
                    );

                    const snapshot = await getDocs(q);

                    // If NO record exists for this staff today (Sunday), auto-save holiday
                    if (snapshot.empty) {
                        const holidayDate = new Date(today);
                        holidayDate.setHours(12, 0, 0, 0);

                        await addDoc(collection(db, 'attendance'), {
                            staffId: s.id,
                            staffName: s.nameEn,
                            status: 'holiday',
                            reason: 'اتوار - Weekly Holiday',
                            reasonType: 'sunday',
                            date: Timestamp.fromDate(holidayDate),
                            entryTime: '-',
                            exitTime: '-',
                            markedAt: 'Auto-saved',
                            salary: s.salary,
                            isLate: false,
                            lateMinutes: 0,
                            deduction: 0
                        });
                        console.log('✅ Sunday Holiday auto-saved for:', s.nameEn);
                    }
                } catch (error) {
                    console.error('Auto-save Sunday error for', s.nameEn, ':', error);
                }
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

        // Skip if before staff setup date
        const setupDateStr = staff.setupDate || '2020-01-01'; // Default purane staff ke liye
        const setupDateObj = new Date(setupDateStr);
        setupDateObj.setHours(0, 0, 0, 0);

        // Check previous days in current month
        for (let i = 1; i <= 7; i++) {
            const checkDate = new Date(selectedDateObj);
            checkDate.setDate(selectedDateObj.getDate() - i);
            checkDate.setHours(0, 0, 0, 0);

            // 1. Skip if before month start
            if (checkDate.getMonth() !== selectedDateObj.getMonth()) break;

            // 2. Skip if before staff setup date (naye staff ki hazri pichhle dino ki nahi mangega)
            if (checkDate < setupDateObj) break;

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
                const datesList = missingDays.join(' ، ');
                showErrorToast(
                    isRTL
                        ? `تاریخ حد سے تجاوز ہے۔ برائے کرم سابقہ دنوں کی حاضری لگائیں: ${datesList}`
                        : `Please mark attendance for ${missingDays.length} previous day(s): ${datesList}`
                );
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

        // Validate time is within working hours for present status
        // Uses staff-specific entry/exit hours instead of hardcoded 8-16
        if (status === 'present') {
            const [entryHours, entryMins] = manualEntryTime.split(':').map(Number);
            const [exitHours, exitMins] = manualExitTime.split(':').map(Number);

            // Check entry time (Math.floor(staff.entryHour) to Math.ceil(staff.exitHour))
            const minEntryHour = Math.floor(staff.entryHour);
            const maxExitHour = Math.ceil(staff.exitHour);

            if (entryHours < minEntryHour || entryHours > maxExitHour || (entryHours === maxExitHour && entryMins > 0)) {
                showErrorToast(t('hazri.validation.entryTimeInvalid') + ` (Allowed: ${minEntryHour}:00 to ${maxExitHour}:00)`);
                setIsSaving(false);
                return;
            }

            // Check exit time
            if (exitHours < minEntryHour || exitHours > maxExitHour || (exitHours === maxExitHour && exitMins > 0)) {
                showErrorToast(t('hazri.validation.exitTimeInvalid') + ` (Allowed: ${minEntryHour}:00 to ${maxExitHour}:00)`);
                setIsSaving(false);
                return;
            }
        }

        setIsSaving(true);
        const markedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Katooti abhi nahi hogi — sirf late/early minutes count
        let deduction = 0;

        // Finalize Late/Early status based on attendance type
        let finalIsLate = false;
        let finalLateMinutes = 0;
        let finalIsEarlyLeave = false;
        let finalEarlyMinutes = 0;

        if (status === 'present') {
            // Only calculate Late/Early if Present
            finalIsLate = isLate;
            finalLateMinutes = lateMinutes;
            finalIsEarlyLeave = isEarlyLeave;
            finalEarlyMinutes = earlyMinutes;
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

            // ===== AUTO-SAVE NEXT DAY SUNDAY HOLIDAY =====
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);

            if (nextDay.getDay() === 0) { // 0 = Sunday
                // Check if Sunday record already exists
                const sundayStart = new Date(nextDay);
                sundayStart.setHours(0, 0, 0, 0);
                const sundayEnd = new Date(nextDay);
                sundayEnd.setHours(23, 59, 59, 999);

                const sundayQ = query(
                    collection(db, 'attendance'),
                    where('staffId', '==', staff.id),
                    where('date', '>=', Timestamp.fromDate(sundayStart)),
                    where('date', '<=', Timestamp.fromDate(sundayEnd))
                );

                const sundaySnap = await getDocs(sundayQ);

                if (sundaySnap.empty) {
                    const sundayDate = new Date(nextDay);
                    sundayDate.setHours(12, 0, 0, 0);

                    await addDoc(collection(db, 'attendance'), {
                        staffId: staff.id,
                        staffName: staff.nameEn,
                        status: 'holiday',
                        reason: 'اتوار - Weekly Holiday',
                        reasonType: 'sunday',
                        date: Timestamp.fromDate(sundayDate),
                        entryTime: '-',
                        exitTime: '-',
                        markedAt: 'Auto-saved',
                        salary: staff.salary,
                        isLate: false,
                        lateMinutes: 0,
                        isEarlyLeave: false,
                        earlyMinutes: 0,
                        deduction: 0
                    });
                    console.log('✅ Sunday Holiday auto-saved for:', nextDay.toDateString());
                    showSuccessToast(isRTL ? 'اتوار کی چھٹی خود بخود محفوظ ہو گئی ✅' : 'Sunday Holiday auto-saved ✅');
                }
            }

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
                            className={`min-h-screen flex flex-col items-center dark:bg-slate-950 ${isRTL ? 'font-urdu' : 'font-english'}`}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        >

                            {/* ===== TOP BAR - Premium Glassmorphism ===== */}
                            <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 md:px-6 py-3 border-b border-white/50 dark:border-slate-700/50 flex justify-between items-center gap-3 sticky top-0 z-50 shadow-sm">
                                {/* Back to Dashboard */}
                                <a
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-all text-sm font-semibold group"
                                >
                                    <span className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
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
                                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-600 dark:text-slate-300 font-semibold text-xs md:text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 hover:shadow-md transition-all flex items-center gap-1.5"
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
                                    <div className="inline-flex bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-1.5 rounded-2xl shadow-lg shadow-emerald-500/10 border border-white/80 dark:border-slate-700/80">
                                        {tabs.map(tab => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`
                                        relative px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 ease-out
                                        ${activeTab === tab.id
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]'
                                                        : 'text-gray-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/30'
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
                                        {/* ===== STAFF SELECTOR ===== */}
                                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-md border border-white/80 dark:border-slate-700 p-3">
                                            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1.5">
                                                {t('hazri.selectStaff') || (isRTL ? 'عملہ منتخب کریں' : 'Select Staff')}
                                            </label>
                                            <select
                                                value={selectedStaffId}
                                                onChange={(e) => {
                                                    setSelectedStaffId(Number(e.target.value));
                                                    setStatus('');
                                                    setReason('');
                                                    setReasonType('');
                                                    setSavedTime('');
                                                }}
                                                className="w-full px-3 py-2.5 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none cursor-pointer"
                                                style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
                                            >
                                                {Object.values(staffData).map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {isRTL ? s.nameUr : s.nameEn} — {isRTL ? s.roleUr : s.roleEn}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {/* Staff & Date Card - Premium Glassmorphism */}
                                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50 border border-white/80 dark:border-slate-700 p-4">
                                            <div className="flex items-center justify-between">
                                                {/* Staff Info */}
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-emerald-500/30">
                                                        <UserCheck size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-gray-800 dark:text-white">{isRTL ? staff.nameUr : staff.nameEn}</h3>
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
                                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50 border border-white/80 dark:border-slate-700 overflow-hidden">
                                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-3 px-4">
                                                <h3 className="font-bold text-sm tracking-wide flex items-center justify-center gap-2">
                                                    <Clock size={16} />
                                                    {t('hazri.timeTable')}
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-700">
                                                <div className="p-4 text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">{t('hazri.number')}</p>
                                                    <p className="text-lg font-bold text-emerald-600">1</p>
                                                </div>
                                                <div className="p-4 text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">{t('hazri.entryTime')}</p>
                                                    <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{staff.entryTime}</p>
                                                </div>
                                                <div className="p-4 text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-semibold mb-1">{t('hazri.exitTime')}</p>
                                                    <p className="text-sm font-bold text-gray-700 dark:text-slate-200">{staff.exitTime}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* New Entry Form - Premium Design */}
                                        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-slate-900/50 border border-white/80 dark:border-slate-700 overflow-hidden">
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
                                                        className="w-full px-4 py-3 text-base border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-medium cursor-pointer"
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
                                                                    <div className="flex gap-1 bg-white dark:bg-slate-700 rounded-lg p-0.5 shadow-sm">
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
                                                                    className="w-full p-2.5 text-sm border-2 border-emerald-200 dark:border-emerald-800 rounded-lg bg-white dark:bg-slate-800 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none transition-all"
                                                                />
                                                            </div>

                                                            {/* Exit Section */}
                                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <label className="text-[10px] text-amber-700 font-bold uppercase flex items-center gap-1">
                                                                        <Clock size={10} />
                                                                        {t('hazri.exitTime')}
                                                                    </label>
                                                                    <div className="flex gap-1 bg-white dark:bg-slate-700 rounded-lg p-0.5 shadow-sm">
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
                                                                    className="w-full p-2.5 text-sm border-2 border-amber-200 dark:border-amber-800 rounded-lg bg-white dark:bg-slate-800 text-center font-mono font-bold text-amber-700 dark:text-amber-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/30 outline-none transition-all"
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
                                                            className="w-full px-4 py-3 text-base border-2 border-gray-200 dark:border-slate-600 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-medium cursor-pointer"
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
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
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
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 text-center">
                                            <h3 className="text-xl font-bold text-slate-800 mb-4">{t('hazri.tabs.verify')}</h3>
                                            <p className="text-gray-400">{t('hazri.noData')}</p>
                                        </div>
                                    )
                                }

                                {/* ===== TAB 4: SUMMARY (Link to Full Page) ===== */}
                                {
                                    activeTab === 'summary' && (
                                        <div className="flex flex-col items-center justify-center py-6">
                                            {/* Professional Link Card */}
                                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/80 p-6 w-full text-center">
                                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                                                    <Calendar size={28} className="text-white" />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-800 mb-2" style={{ lineHeight: '2' }}>
                                                    {t('hazri.tabs.summary')}
                                                </h3>
                                                <p className="text-sm text-slate-500 mb-5" style={{ lineHeight: '2' }}>
                                                    {isRTL
                                                        ? 'تفصیلی حاضری ریکارڈ، اعداد و شمار اور کٹوتی کی مکمل رپورٹ دیکھیں'
                                                        : 'View detailed attendance records, statistics and deduction reports'
                                                    }
                                                </p>
                                                <a
                                                    href="/teachers/majmoohi"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                                                >
                                                    <UserCheck size={16} />
                                                    <span>{isRTL ? 'مجموعی حاضری کے لیے یہاں جائیں' : 'Go to Attendance Summary'}</span>
                                                    <span>{isRTL ? '←' : '→'}</span>
                                                </a>
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
