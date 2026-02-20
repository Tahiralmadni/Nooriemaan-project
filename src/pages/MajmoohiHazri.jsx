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
                            <p className="text-sm text-slate-400 mt-6">
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

                {/* Content will be added in next phases */}

            </motion.div>
        </>
    );
};

export default MajmoohiHazri;
