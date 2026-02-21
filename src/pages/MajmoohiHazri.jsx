import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const MajmoohiHazri = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Abhi sirf Akram Attari ka data hai
    const staffIds = [1];

    const monthNames = isRTL
        ? ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    useEffect(() => {
        document.title = t('majmoohi.title');
    }, [t, i18n.language]);

    const prevMonth = () => {
        if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(y => y - 1); }
        else setSelectedMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(y => y + 1); }
        else setSelectedMonth(m => m + 1);
    };

    return (
        <>
            <Helmet defer={false}>
                <title>{t('majmoohi.title')}</title>
            </Helmet>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto"
                dir={isRTL ? 'rtl' : 'ltr'}
                style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
            >
                {/* ===== HEADER ===== */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <Users size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-emerald-600">
                                {t('majmoohi.title')}
                            </h1>
                            <p className="text-sm text-slate-400 mt-2">
                                {t('majmoohi.subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Month Selector */}
                    <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-md border border-gray-100">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors">
                            {isRTL ? <ChevronRight size={18} className="text-emerald-600" /> : <ChevronLeft size={18} className="text-emerald-600" />}
                        </button>
                        <div className="text-center min-w-[140px]">
                            <p className="text-sm font-bold text-slate-800 flex items-center justify-center gap-2">
                                <Calendar size={14} className="text-emerald-500" />
                                {monthNames[selectedMonth]}
                            </p>
                            <p className="text-xs text-slate-400">{selectedYear}</p>
                        </div>
                        <button onClick={nextMonth} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors">
                            {isRTL ? <ChevronLeft size={18} className="text-emerald-600" /> : <ChevronRight size={18} className="text-emerald-600" />}
                        </button>
                    </div>
                </div>

                {/* ===== STAFF TABLE ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200">
                                    <th className="px-4 py-3.5 text-slate-600 font-semibold text-center w-12">
                                        {t('table.serial')}
                                    </th>
                                    <th className={`px-4 py-3.5 text-slate-600 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t('majmoohi.table.staffName')}
                                    </th>
                                    <th className="px-4 py-3.5 text-slate-600 font-semibold text-center">
                                        {t('majmoohi.table.totalDays')}
                                    </th>
                                    <th className="px-4 py-3.5 text-emerald-600 font-semibold text-center">
                                        {t('majmoohi.table.present')}
                                    </th>
                                    <th className="px-4 py-3.5 text-red-500 font-semibold text-center">
                                        {t('majmoohi.table.absent')}
                                    </th>
                                    <th className="px-4 py-3.5 text-amber-500 font-semibold text-center">
                                        {t('majmoohi.table.leave')}
                                    </th>
                                    <th className="px-4 py-3.5 text-blue-500 font-semibold text-center">
                                        {t('majmoohi.table.holiday')}
                                    </th>
                                    <th className="px-4 py-3.5 text-purple-500 font-semibold text-center">
                                        {t('majmoohi.table.late')}
                                    </th>
                                    <th className="px-4 py-3.5 text-rose-600 font-semibold text-center">
                                        {t('majmoohi.table.deduction')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffIds.map((id, index) => (
                                    <tr
                                        key={id}
                                        className={`border-b border-gray-50 hover:bg-emerald-50/40 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                    >
                                        <td className="px-4 py-3 text-center text-slate-400 font-medium">
                                            {index + 1}
                                        </td>
                                        <td className={`px-4 py-3 font-medium text-slate-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t(`staff.${id}`)}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-500">
                                            0
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-block min-w-[28px] px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold">
                                                0
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-block min-w-[28px] px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-xs font-semibold">
                                                0
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-block min-w-[28px] px-2 py-0.5 bg-amber-50 text-amber-500 rounded-full text-xs font-semibold">
                                                0
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-block min-w-[28px] px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-xs font-semibold">
                                                0
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-block min-w-[28px] px-2 py-0.5 bg-purple-50 text-purple-500 rounded-full text-xs font-semibold">
                                                0
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-rose-600 font-medium">
                                            Rs 0
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

            </motion.div>
        </>
    );
};

export default MajmoohiHazri;
