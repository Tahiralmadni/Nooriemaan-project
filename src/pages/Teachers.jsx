import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Eye, ArrowRight, ArrowLeft } from 'lucide-react';

const Teachers = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ur';

    useEffect(() => {
        document.title = t('pageTitles.teachers');
    }, [t]);

    const staffIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

    const emails = {
        1: 'ishaqakram67@gmail.com',
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

    // View profile handler (sirf 2 profiles ready)
    const handleViewProfile = (id) => {
        if (id <= 2) {
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
                        className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 w-full justify-center group"
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                        {t('sidebar.teachersList')}
                    </h1>
                    <span className="self-start sm:self-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md">
                        {staffIds.length} {t('table.members')}
                    </span>
                </div>

                {/* Desktop Table - Hidden on Mobile */}
                <div className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
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
                            {staffIds.map((id, index) => (
                                <tr
                                    key={id}
                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-emerald-50 transition-colors`}
                                >
                                    <td className="px-6 py-4 text-center border-b border-gray-100 text-emerald-600 font-bold text-lg">
                                        {id}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-100 text-slate-800 font-medium">
                                        {t(`staff.${id}`)}
                                    </td>
                                    <td className={`px-6 py-4 border-b border-gray-100 ${emails[id] === '-' ? 'text-gray-400' : 'text-blue-600'}`}>
                                        {emails[id]}
                                    </td>
                                    <td className="px-6 py-4 border-b border-gray-100 text-center">
                                        {id <= 4 ? (
                                            <button
                                                onClick={() => handleViewProfile(id)}
                                                disabled={id > 2}
                                                style={{
                                                    backgroundColor: id <= 2 ? '#10b981' : '#e2e8f0',
                                                    color: id <= 2 ? '#ffffff' : '#94a3b8',
                                                    border: 'none',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    cursor: id <= 2 ? 'pointer' : 'not-allowed',
                                                    display: 'inline-flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Eye size={16} />
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards - Professional Design */}
                <div className="md:hidden space-y-3">
                    {staffIds.map((id, index) => (
                        <div
                            key={id}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                        >
                            {/* Top Row - Number, Name, Eye Icon */}
                            <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-500 text-white rounded-lg font-bold text-sm">
                                    {id}
                                </span>
                                <h3 className="flex-1 text-slate-800 font-semibold text-lg leading-tight">
                                    {t(`staff.${id}`)}
                                </h3>
                                {id <= 4 && (
                                    <button
                                        onClick={() => handleViewProfile(id)}
                                        disabled={id > 2}
                                        style={{
                                            backgroundColor: id <= 2 ? '#10b981' : '#e2e8f0',
                                            color: id <= 2 ? '#ffffff' : '#94a3b8',
                                            border: 'none',
                                            padding: '8px',
                                            borderRadius: '8px',
                                            cursor: id <= 2 ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        <Eye size={16} />
                                    </button>
                                )}
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
