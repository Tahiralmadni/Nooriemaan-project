import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft } from 'lucide-react';

const StaffProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    useEffect(() => {
        document.title = `${t('staff.' + id)} - Profile`;
    }, [t, id]);

    // Staff details (4 members)
    const staffDetails = {
        1: { phone: '03128593301', address: 'Karachi, Pakistan', role: 'Naib Nazim', roleUr: 'نائب ناظم', joinDate: 'October 2020', salary: '26,620', timing: '8:00 AM - 4:00 PM', email: 'ishaqakram67@gmail.com' },
        23: { phone: '03128593301', address: 'Karachi, Pakistan', role: 'Naib Nazim', roleUr: 'نائب ناظم', joinDate: 'October 2020', salary: '8,120', timing: '8:00 AM - 4:00 PM', email: 'ishaqakram67@gmail.com' },
        2: { phone: '0322-2345678', address: 'Karachi', role: 'Qari', roleUr: 'قاری', joinDate: '01 Mar 2019', salary: '28,000', timing: '8:00 AM - 1:00 PM', email: '-' },
        3: { phone: '0333-3456789', address: 'Karachi', role: 'Teacher', roleUr: 'استاد', joinDate: '10 Aug 2021', salary: '22,000', timing: '9:00 AM - 3:00 PM', email: 'muneebattari527@gmail.com' },
        4: { phone: '0344-4567890', address: 'Karachi', role: 'Teacher', roleUr: 'استاد', joinDate: '05 Feb 2022', salary: '20,000', timing: '8:30 AM - 2:30 PM', email: 'mudassirrazachishti@gmail.com' }
    };

    const staff = staffDetails[id] || staffDetails[1];

    return (
        <>
            <Helmet defer={false}>
                <title>{t('staff.' + id)} - Profile</title>
            </Helmet>

            <div style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}>
                {/* Back Button */}
                <button onClick={() => navigate('/teachers')} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg mb-5 text-gray-600">
                    <ArrowLeft size={18} />
                    {t('profile.back')}
                </button>

                {/* Profile Card */}
                <div className="bg-white rounded-xl p-6 shadow">
                    {/* Header */}
                    <div className="text-center border-b pb-6 mb-6">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4">
                            {id}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('staff.' + id)}</h1>
                        <span className="bg-emerald-100 text-emerald-600 px-4 py-1 rounded-full text-sm font-medium">
                            {isRTL ? staff.roleUr : staff.role}
                        </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">{t('profile.email')}</p>
                            <p className={`font-medium ${staff.email === '-' ? 'text-gray-400' : 'text-slate-800'}`}>{staff.email}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">{t('profile.phone')}</p>
                            <p className="font-medium text-slate-800">{staff.phone}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">{t('profile.address')}</p>
                            <p className="font-medium text-slate-800">{staff.address}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">{t('profile.joinDate')}</p>
                            <p className="font-medium text-slate-800">{staff.joinDate}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">{t('profile.timing')}</p>
                            <p className="font-medium text-slate-800">{staff.timing}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">{t('profile.salary')}</p>
                            <p className="font-medium text-slate-800">Rs. {staff.salary}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StaffProfile;
