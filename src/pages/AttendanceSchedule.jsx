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
    const [manualExitTime, setManualExitTime] = useState('16:00');

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
        perDaySalary: Math.round(25000 / 30),
        perHourSalary: Math.round(25000 / 30 / 8),
        phone: '03128593301',
        email: 'ishaqakram67@gmail.com',
        city: 'Karachi',
        country: 'Pakistan',
        joinDate: 'October 2020'
    };

    // Check if late based on manual entry time
    useEffect(() => {
        const [hours, minutes] = manualEntryTime.split(':').map(Number);
        if (hours > staff.entryHour || (hours === staff.entryHour && minutes > 15)) {
            setIsLate(true);
            const lateTime = (hours - staff.entryHour) * 60 + minutes;
            setLateMinutes(lateTime > 0 ? lateTime : 0);
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

    // Save attendance (NO LOCK for Admin)
    const handleSave = async () => {
        if (!status) return;

        setIsSaving(true);
        const markedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Calculate salary deduction
        let deduction = 0;
        if (status === 'absent') {
            deduction = staff.perDaySalary;
        } else if (status === 'leave' || status === 'holiday') {
            deduction = 0; // Approved leave/holiday - no cut
        } else if (status === 'present') {
            // Late arrival deduction - ONLY if no permission
            if (isLate && !entryPermission) {
                deduction += Math.round((lateMinutes / 60) * staff.perHourSalary);
            }
            // Early departure deduction - ONLY if no permission
            if (isEarlyLeave && !exitPermission) {
                deduction += Math.round((earlyMinutes / 60) * staff.perHourSalary);
            }
        }

        try {
            await addDoc(collection(db, 'attendance'), {
                staffId: staff.id,
                staffName: staff.nameEn,
                status: status,
                reason: status !== 'present' ? reason : '',
                reasonType: status !== 'present' ? reasonType : '',
                date: Timestamp.fromDate(new Date()),
                entryTime: manualEntryTime,
                exitTime: manualExitTime,
                markedAt: markedTime,
                salary: staff.salary,
                isLate: isLate,
                lateMinutes: lateMinutes,
                deduction: deduction
            });

            setSavedTime(markedTime);
            alert(isRTL ? '✅ حاضری محفوظ ہو گئی' : '✅ Attendance Saved');
            // Reset form
            setStatus('');
            setReason('');
            setReasonType('');
        } catch (error) {
            console.error('Save Error:', error);
            alert(isRTL ? '❌ محفوظ نہیں ہوا' : '❌ Save Failed');
        }
        setIsSaving(false);
    };

    // Status options (منتخب کریں)
    const statusOptions = [
        { value: '', label: isRTL ? 'منتخب کریں' : 'Select' },
        { value: 'present', label: isRTL ? 'حاضر' : 'Present' },
        { value: 'absent', label: isRTL ? 'غیر حاضر' : 'Absent' },
        { value: 'leave', label: isRTL ? 'رخصت' : 'Leave' },
        { value: 'holiday', label: isRTL ? 'تعطیل' : 'Holiday' }
    ];

    // Reason options (تاخیر/غیر حاضری کی وجہ)
    const reasonOptions = [
        { value: '', label: isRTL ? 'وجہ منتخب کریں' : 'Select Reason' },
        { value: 'traffic', label: isRTL ? 'ٹریفک کے سبب' : 'Due to Traffic' },
        { value: 'family', label: isRTL ? 'گھریلو ذمہ داری کے سبب' : 'Family Responsibility' },
        { value: 'weather', label: isRTL ? 'موسم کی خرابی کے سبب' : 'Bad Weather' },
        { value: 'sick', label: isRTL ? 'سردی/زکام ہونے کے سبب' : 'Cold/Flu' },
        { value: 'lazy', label: isRTL ? 'سستی ہونے کے سبب' : 'Laziness' },
        { value: 'secret', label: isRTL ? 'خفیہ وجہ کے سبب' : 'Secret Reason' },
        { value: 'doctor', label: isRTL ? 'ڈاکٹر کے پاس جانے کے سبب' : 'Doctor Visit' },
        { value: 'accident', label: isRTL ? 'ایکسیڈنٹ ہو جانے کے سبب' : 'Accident' },
        { value: 'funeral', label: isRTL ? 'جنازے کے سبب' : 'Funeral' },
        { value: 'police', label: isRTL ? 'پولیس/امتحان کے سبب' : 'Police/Exam' },
        { value: 'other', label: isRTL ? 'دیگر' : 'Other' }
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
                className={`min-h-screen bg-gray-100 p-4 flex flex-col items-center ${isRTL ? 'font-urdu' : 'font-english'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
            >

                {/* Main Content Container - More Compact */}
                <div className="w-full max-w-3xl bg-transparent">
                    {/* Header with Language Selector */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-center flex-1">
                            <h1 className="text-2xl font-bold text-slate-800">{t('hazri.title')}</h1>
                            <p className="text-gray-500 text-sm mt-1">{t('hazri.subtitle')}</p>
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => i18n.changeLanguage('ur')}
                                className={`px-3 py-1.5 text-sm rounded font-medium ${i18n.language === 'ur' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                اردو
                            </button>
                            <button
                                onClick={() => i18n.changeLanguage('en')}
                                className={`px-3 py-1.5 text-sm rounded font-medium ${i18n.language === 'en' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                            >
                                EN
                            </button>
                        </div>
                    </div>

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
                                                        {isRTL ? 'وقت آمد' : 'Entry Time'}
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
                                                        {isRTL ? 'اجازت' : 'Permission'}
                                                    </label>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => setEntryPermission(true)}
                                                            className={`flex-1 py-2 text-xs rounded font-bold ${entryPermission ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {isRTL ? 'ہاں' : 'Yes'}
                                                        </button>
                                                        <button
                                                            onClick={() => setEntryPermission(false)}
                                                            className={`flex-1 py-2 text-xs rounded font-bold ${!entryPermission ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {isRTL ? 'نہیں' : 'No'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Exit Time + Permission */}
                                            <div className="grid grid-cols-3 gap-2 items-end">
                                                <div className="col-span-2">
                                                    <label className="text-xs text-gray-600 font-medium block mb-1">
                                                        {isRTL ? 'وقت رخصت' : 'Exit Time'}
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
                                                        {isRTL ? 'اجازت' : 'Permission'}
                                                    </label>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => setExitPermission(true)}
                                                            className={`flex-1 py-2 text-xs rounded font-bold ${exitPermission ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {isRTL ? 'ہاں' : 'Yes'}
                                                        </button>
                                                        <button
                                                            onClick={() => setExitPermission(false)}
                                                            className={`flex-1 py-2 text-xs rounded font-bold ${!exitPermission ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                                                        >
                                                            {isRTL ? 'نہیں' : 'No'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Late Warning - ONLY if no permission */}
                                            {isLate && !entryPermission && (
                                                <div className="bg-amber-50 border border-amber-200 rounded p-2 flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-amber-500" />
                                                    <span className="text-amber-700 text-xs">
                                                        {isRTL ? 'دیر سے آئے' : 'Late'} - {lateMinutes} min | {isRTL ? 'کٹوتی' : 'Deduction'}: Rs. {Math.round((lateMinutes / 60) * staff.perHourSalary)}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Early Leave Warning - ONLY if no permission */}
                                            {isEarlyLeave && !exitPermission && (
                                                <div className="bg-red-50 border border-red-200 rounded p-2 flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-red-500" />
                                                    <span className="text-red-700 text-xs">
                                                        {isRTL ? 'جلدی گئے' : 'Early Leave'} - {earlyMinutes} min | {isRTL ? 'کٹوتی' : 'Deduction'}: Rs. {Math.round((earlyMinutes / 60) * staff.perHourSalary)}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* Reason Section - ALWAYS visible */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-gray-600 font-medium block">
                                            {isRTL ? 'غیر حاضری / تاخیر کی وجہ' : 'Absence/Lateness Reason'}
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
                                            {isRTL ? 'دیگر وجہ' : 'Other Reason'}
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder={isRTL ? 'وجہ یہاں لکھیں...' : 'Write reason here...'}
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
                                        {isSaving ? '⏳...' : (isRTL ? 'محفوظ' : 'Save')}
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
