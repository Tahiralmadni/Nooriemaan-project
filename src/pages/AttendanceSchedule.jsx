import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Lock, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

const AttendanceSchedule = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    // Active Tab
    const [activeTab, setActiveTab] = useState('attendance');

    // States
    const [status, setStatus] = useState('');
    const [reason, setReason] = useState('');
    const [reasonType, setReasonType] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedTime, setSavedTime] = useState('');
    const [isLate, setIsLate] = useState(false);
    const [lateMinutes, setLateMinutes] = useState(0);

    // Current date/time
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const dateStr = today.toLocaleDateString('en-GB');
    const currentTime = today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Staff 1 - Muhammad Akram Attari
    const staff = {
        id: 1,
        nameUr: 'محمد اکرم عطاری',
        nameEn: 'Muhammad Akram Attari',
        entryTime: '9:00 AM',
        exitTime: '6:00 PM',
        entryHour: 9,
        exitHour: 18,
        salary: 25000,
        perDaySalary: Math.round(25000 / 30),
        perHourSalary: Math.round(25000 / 30 / 9)
    };

    // Check if late
    useEffect(() => {
        if (currentHour > staff.entryHour || (currentHour === staff.entryHour && currentMinute > 15)) {
            setIsLate(true);
            const lateTime = (currentHour - staff.entryHour) * 60 + currentMinute;
            setLateMinutes(lateTime);
        }
    }, []);

    useEffect(() => {
        document.title = t('pageTitles.attendanceSchedule');
        checkTodayAttendance();
    }, [t]);

    // Check existing attendance
    const checkTodayAttendance = async () => {
        try {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const q = query(
                collection(db, 'attendance'),
                where('staffId', '==', staff.id),
                where('date', '>=', Timestamp.fromDate(todayStart)),
                where('date', '<=', Timestamp.fromDate(todayEnd))
            );

            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const record = snapshot.docs[0].data();
                setStatus(record.status);
                setReason(record.reason || '');
                setSavedTime(record.markedAt || '');
                setIsLocked(true);
                setIsLate(record.isLate || false);
                setLateMinutes(record.lateMinutes || 0);
            }
        } catch (error) {
            console.error('Firebase Error:', error);
        }
    };

    // Save attendance
    const handleSave = async () => {
        if (!status) return;

        setIsSaving(true);
        const markedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

        // Calculate salary deduction
        let deduction = 0;
        if (status === 'absent') {
            deduction = staff.perDaySalary;
        } else if (isLate && status === 'present') {
            deduction = Math.round((lateMinutes / 60) * staff.perHourSalary);
        }

        try {
            await addDoc(collection(db, 'attendance'), {
                staffId: staff.id,
                staffName: staff.nameEn,
                status: status,
                reason: reason,
                reasonType: reasonType,
                date: Timestamp.fromDate(new Date()),
                entryTime: staff.entryTime,
                exitTime: staff.exitTime,
                markedAt: markedTime,
                salary: staff.salary,
                isLate: isLate,
                lateMinutes: lateMinutes,
                deduction: deduction
            });

            setSavedTime(markedTime);
            setIsLocked(true);
        } catch (error) {
            console.error('Save Error:', error);
        }
        setIsSaving(false);
    };

    // Reason options
    const reasonOptions = [
        { value: '', label: isRTL ? 'منتخب کریں' : 'Select' },
        { value: 'sick', label: isRTL ? 'بیماری' : 'Sick' },
        { value: 'personal', label: isRTL ? 'ذاتی کام' : 'Personal' },
        { value: 'emergency', label: isRTL ? 'ایمرجنسی' : 'Emergency' },
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

            <div style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}>

                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">{t('hazri.title')}</h1>
                    <p className="text-gray-500 mt-1">{t('hazri.subtitle')}</p>
                </div>

                {/* Inner Tabs */}
                <div className="flex justify-center gap-2 mb-6 flex-wrap">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-600 text-white shadow-lg'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ===== TAB 1: ATTENDANCE ===== */}
                {activeTab === 'attendance' && (
                    <div className="space-y-4">
                        {/* Time Table */}
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="bg-emerald-600 text-white text-center py-3 font-bold">
                                {t('hazri.timeTable')}
                            </div>
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="py-3 px-4">{t('hazri.number')}</th>
                                        <th className="py-3 px-4">{t('hazri.entryTime')}</th>
                                        <th className="py-3 px-4">{t('hazri.exitTime')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="text-center">
                                        <td className="py-3 px-4 font-bold text-emerald-600">1</td>
                                        <td className="py-3 px-4">{staff.entryTime}</td>
                                        <td className="py-3 px-4">{staff.exitTime}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* New Entry Form */}
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="bg-emerald-600 text-white text-center py-3 font-bold">
                                {t('hazri.newEntry')}
                            </div>

                            <div className="p-5 space-y-4">
                                {/* Staff Selector */}
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-600">{t('hazri.selectStaff')}:</span>
                                    <span className="flex-1 bg-gray-100 p-3 rounded-lg font-medium">
                                        {isRTL ? staff.nameUr : staff.nameEn}
                                    </span>
                                    {isLocked && (
                                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                            <Lock size={14} /> {t('hazri.locked')}
                                        </span>
                                    )}
                                </div>

                                {/* Entry/Exit Time Display */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">{t('hazri.entryTime')}</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={staff.entryTime}
                                                disabled
                                                className="flex-1 p-3 border rounded-lg bg-gray-50"
                                            />
                                            <div className="flex gap-1">
                                                <span className="px-3 py-2 bg-emerald-100 text-emerald-700 rounded text-sm font-medium">
                                                    {t('hazri.present')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 block mb-1">{t('hazri.exitTime')}</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={staff.exitTime}
                                                disabled
                                                className="flex-1 p-3 border rounded-lg bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Late Warning */}
                                {isLate && !isLocked && status !== 'absent' && status !== 'leave' && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-amber-500" />
                                        <span className="text-amber-700 text-sm">
                                            {t('hazri.late')} - {lateMinutes} min | {t('hazri.salaryDeduction')}: Rs. {Math.round((lateMinutes / 60) * staff.perHourSalary)}
                                        </span>
                                    </div>
                                )}

                                {/* Reason Section */}
                                <div>
                                    <label className="text-sm text-gray-500 block mb-2">{t('hazri.lateReason')}</label>
                                    <select
                                        value={reasonType}
                                        onChange={(e) => setReasonType(e.target.value)}
                                        disabled={isLocked}
                                        className="w-full p-3 border rounded-lg bg-white"
                                    >
                                        {reasonOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-500 block mb-2">{t('hazri.otherReason')}</label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        disabled={isLocked}
                                        placeholder="..."
                                        className="w-full p-3 border rounded-lg bg-gray-50 resize-none"
                                        rows={3}
                                    />
                                </div>

                                {/* Status Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => !isLocked && setStatus('present')}
                                        disabled={isLocked}
                                        className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${status === 'present' ? 'bg-emerald-500 text-white' : 'bg-gray-100 hover:bg-emerald-50'
                                            } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        <CheckCircle size={18} /> {t('hazri.present')}
                                    </button>
                                    <button
                                        onClick={() => !isLocked && setStatus('absent')}
                                        disabled={isLocked}
                                        className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-red-50'
                                            } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        <XCircle size={18} /> {t('hazri.absent')}
                                    </button>
                                    <button
                                        onClick={() => !isLocked && setStatus('leave')}
                                        disabled={isLocked}
                                        className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${status === 'leave' ? 'bg-amber-500 text-white' : 'bg-gray-100 hover:bg-amber-50'
                                            } ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        <Clock size={18} /> {t('hazri.leave')}
                                    </button>
                                </div>
                            </div>

                            {/* Save Button */}
                            {!isLocked ? (
                                <div className="p-5 pt-0">
                                    <button
                                        onClick={handleSave}
                                        disabled={!status || isSaving}
                                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${status && !isSaving
                                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSaving ? '⏳...' : t('hazri.save')}
                                    </button>
                                </div>
                            ) : (
                                <div className="p-5 bg-emerald-50 border-t text-center">
                                    <p className="text-emerald-700 font-bold">✅ {t('hazri.saved')} - {savedTime}</p>
                                </div>
                            )}
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
                            <p className="text-gray-400 text-sm mt-4">Total: 9 hours</p>
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
                        <p className="text-center text-gray-400 mt-4 text-sm">(1 Feb se data)</p>
                    </div>
                )}

                {/* Footer Info */}
                <div className="mt-6 text-center text-gray-500 text-sm">
                    📅 {dateStr} | 🕐 {currentTime}
                </div>
            </div>
        </>
    );
};

export default AttendanceSchedule;
