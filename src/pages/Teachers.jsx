import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Eye, ArrowRight, ArrowLeft, Search, X } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

const Teachers = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ur';

    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        document.title = t('pageTitles.teachers');
        fetchStaff();
    }, [t]);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'staff'));
            const staffData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort by integer ID
            staffData.sort((a, b) => parseInt(a.id) - parseInt(b.id));
            setStaffList(staffData);
        } catch (error) {
            console.error('Error fetching staff:', error);
            toast.error(isRTL ? 'اسٹاف کا ڈیٹا لوڈ کرنے میں مسئلہ آیا' : 'Error fetching staff data');
        } finally {
            setLoading(false);
        }
    };

    const filteredStaffList = staffList.filter(staff => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();
        const nameEn = (staff.nameEn || '').toLowerCase();
        const nameUr = (staff.nameUr || '');
        const idStr = String(staff.id);
        const email = (staff.email || '').toLowerCase();
        return nameEn.includes(query) || nameUr.includes(query) || idStr.includes(query) || email.includes(query);
    });

    // View profile handler
    const handleViewProfile = (id) => {
        navigate(`/teachers/profile/${id}`);
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
                        {staffList.length} {t('table.members')}
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
                            placeholder={t('common.searchPlaceholder')}
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
                            {filteredStaffList.length} {t('common.resultsFound')}
                        </p>
                    )}
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 text-center">
                        <div className="animate-spin w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-500">{t('common.loading')}</p>
                    </div>
                ) : (
                    <>
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
                                    {filteredStaffList.map((staff, index) => (
                                        <tr
                                            key={staff.id}
                                            className={`${index % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors`}
                                        >
                                            <td className="px-6 py-4 text-center border-b border-gray-100 dark:border-slate-700 text-emerald-600 font-bold text-lg">
                                                {staff.id}
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium">
                                                {isRTL ? staff.nameUr : staff.nameEn}
                                            </td>
                                            <td className={`px-6 py-4 border-b border-gray-100 dark:border-slate-700 ${staff.email === '-' ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                {staff.email}
                                            </td>
                                            <td className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 text-center">
                                                <button
                                                    onClick={() => handleViewProfile(staff.id)}
                                                    disabled={!staff.setupComplete}
                                                    style={{
                                                        backgroundColor: staff.setupComplete ? '#10b981' : '#e2e8f0',
                                                        color: staff.setupComplete ? '#ffffff' : '#94a3b8',
                                                        border: 'none',
                                                        padding: '8px 12px',
                                                        borderRadius: '8px',
                                                        cursor: staff.setupComplete ? 'pointer' : 'not-allowed',
                                                        display: 'inline-flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStaffList.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-500 border-b border-gray-100">
                                                {t('common.noRecordsFound')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards - Professional Design */}
                        <div className="md:hidden space-y-3">
                            {filteredStaffList.map((staff) => (
                                <div
                                    key={staff.id}
                                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                                >
                                    {/* Top Row - Number, Name, Eye Icon */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-500 text-white rounded-lg font-bold text-sm">
                                            {staff.id}
                                        </span>
                                        <h3 className="flex-1 text-slate-800 dark:text-white font-semibold text-lg leading-tight">
                                            {isRTL ? staff.nameUr : staff.nameEn}
                                        </h3>
                                        <button
                                            onClick={() => handleViewProfile(staff.id)}
                                            disabled={!staff.setupComplete}
                                            style={{
                                                backgroundColor: staff.setupComplete ? '#10b981' : '#e2e8f0',
                                                color: staff.setupComplete ? '#ffffff' : '#94a3b8',
                                                border: 'none',
                                                padding: '8px',
                                                borderRadius: '8px',
                                                cursor: staff.setupComplete ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>

                                    {/* Email Row */}
                                    <div className={`text-sm ${isRTL ? 'pr-11' : 'pl-11'} ${staff.email === '-' ? 'text-gray-400' : 'text-blue-500'}`}>
                                        📧 {staff.email}
                                    </div>
                                </div>
                            ))}
                            {filteredStaffList.length === 0 && (
                                <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                                    {t('common.noRecordsFound')}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Teachers;
