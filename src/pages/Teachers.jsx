import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Eye, ArrowRight, ArrowLeft, Search, X } from 'lucide-react';

const Teachers = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ur';

    useEffect(() => {
        document.title = t('pageTitles.teachers');
    }, [t]);

    const staffIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    const emails = {
        1: 'ishaqakram67@gmail.com',
        23: 'ishaqakram67@gmail.com',
        2: '-',
        3: 'muneebattari527@gmail.com',
        4: 'mudassirrazachishti@gmail.com',
        5: 'mudassirrazachishti@gmail.com',
        6: 'mudassirrazachishti@gmail.com',
        7: 'ubaidattari0326@gmail.com',
        8: 'ubaidattari0326@gmail.com',
        9: 'ubaidattari0326@gmail.com',
        10: '-',
        11: '-',
        12: '-',
        13: '-',
        14: 'jawadsoomrowork@gmail.com',
        15: 'hanzalahtahir93@gmail.com',
        16: 'balochjuni010@gmail.com',
        17: '-',
        18: 'attaridilawar510@gmail.com',
        19: 'princeShoaibkhan990@gmail.com',
        20: 'aliyn00177@gmail.com',
        21: 'ar8693524@gmail.com',
        22: '-',
    };

    // Setup complete staff IDs — sirf inke eye icon green honge
    const setupStaffIds = [1, 2, 3, 4, 5, 6];

    // Search
    const [searchQuery, setSearchQuery] = useState('');

    const filteredStaffIds = staffIds.filter(id => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();
        const nameEn = t(`staff.${id}`).toLowerCase();
        const idStr = String(id);
        const email = (emails[id] || '').toLowerCase();
        return nameEn.includes(query) || idStr.includes(query) || email.includes(query);
    });

    // View profile handler
    const handleViewProfile = (id) => {
        if (setupStaffIds.includes(id)) {
            navigate(`/teachers/profile/${id}`);
        }
    };

    return (
        <>
            <Helmet defer={false}>
                <title>{t('pageTitles.teachers')}</title>
            </Helmet>
            <div style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}>
                {/* Mobile Back Button */}
                <div className="md:hidden mb-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 w-full justify-center group"
                    >
                        {isRTL ?
                            <ArrowRight size={20} className="group-hover:-mr-1 transition-all" /> :
                            <ArrowLeft size={20} className="group-hover:-ml-1 transition-all" />
                        }
                        <span className="font-bold">{t('common.backToDashboard')}</span>
                    </button>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
                        {t('sidebar.teachersList')}
                    </h1>
                    <span className="self-start sm:self-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md">
                        {staffIds.length} {t('table.members')}
                    </span>
                </div>

                {/* Search Bar */}
                <div className="mb-4 relative">
                    <div className="relative">
                        <Search size={18} className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />
                        <input
                            type="text"
                            dir="auto"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={isRTL ? 'نام، نمبر یا ای میل سے تلاش کریں...' : 'Search by name, number or email...'}
                            className="w-full bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 rounded-xl py-3 pl-12 pr-12 text-sm text-slate-700 dark:text-slate-200 shadow-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30 outline-none transition-all"
                            style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)', textAlign: 'start' }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <p className="text-xs text-gray-400 mt-1.5 px-1">
                            {filteredStaffIds.length} {isRTL ? 'نتائج ملے' : 'results found'}
                        </p>
                    )}
                </div>

                {/* Desktop Table - Hidden on Mobile */}
                <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-emerald-500 to-emerald-600">
                                <th className="px-6 py-4 text-white font-semibold text-center w-20">
                                    {t('table.serial')}
                                </th>
                                <th className="px-6 py-4 text-white font-semibold">
                                    {t('table.name')}
                                </th>
                                <th className="px-6 py-4 text-white font-semibold">
                                    {t('table.email')}
                                </th>
                                <th className="px-6 py-4 text-white font-semibold text-center w-24">
                                    {t('table.view')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaffIds.map((id, index) => (
                                <tr
                                    key={id}
                                    className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors`}
                                >
                                    <td className="px-6 py-4 text-center border-b border-gray-100 dark:border-slate-700 text-emerald-600 font-bold text-lg">
                                        {id}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                                        {t(`staff.${id}`)}
                                    </td>
                                    <td className={`px-6 py-4 border-b border-gray-100 dark:border-slate-700 ${emails[id] === '-' ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                        {emails[id]}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 text-center">
                                        <button
                                            onClick={() => handleViewProfile(id)}
                                            disabled={!setupStaffIds.includes(id)}
                                            style={{
                                                backgroundColor: setupStaffIds.includes(id) ? '#10b981' : '#e2e8f0',
                                                color: setupStaffIds.includes(id) ? '#ffffff' : '#94a3b8',
                                                border: 'none',
                                                padding: '8px 12px',
                                                borderRadius: '8px',
                                                cursor: setupStaffIds.includes(id) ? 'pointer' : 'not-allowed',
                                                display: 'inline-flex',
                                                alignItems: 'center'
                                            }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards - Professional Design */}
                <div className="md:hidden space-y-3">
                    {filteredStaffIds.map((id, index) => (
                        <div
                            key={id}
                            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                        >
                            {/* Top Row - Number, Name, Eye Icon */}
                            <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-500 text-white rounded-lg font-bold text-sm">
                                    {id}
                                </span>
                                <h3 className="flex-1 text-slate-800 dark:text-white font-semibold text-lg leading-tight">
                                    {t(`staff.${id}`)}
                                </h3>
                                <button
                                    onClick={() => handleViewProfile(id)}
                                    disabled={!setupStaffIds.includes(id)}
                                    style={{
                                        backgroundColor: setupStaffIds.includes(id) ? '#10b981' : '#e2e8f0',
                                        color: setupStaffIds.includes(id) ? '#ffffff' : '#94a3b8',
                                        border: 'none',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        cursor: setupStaffIds.includes(id) ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <Eye size={16} />
                                </button>
                            </div>

                            {/* Email Row */}
                            <div className={`text-sm ${isRTL ? 'pr-11' : 'pl-11'} ${emails[id] === '-' ? 'text-gray-400' : 'text-blue-500'}`}>
                                📧 {emails[id]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Teachers;
