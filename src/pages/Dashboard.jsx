import { useTranslation } from 'react-i18next';
import i18n from '../config/i18n';

const Dashboard = () => {
    const { t } = useTranslation();
    const isRTL = i18n.language === 'ur';

    // Stats data
    const stats = [
        { label: isRTL ? 'کل طلباء' : 'Total Students', value: '1,234', color: '#10b981' },
        { label: isRTL ? 'آج حاضر' : 'Present Today', value: '1,180', color: '#3b82f6' },
        { label: isRTL ? 'واجب الادا فیس' : 'Fees Pending', value: '₨ 45K', color: '#f59e0b' },
        { label: isRTL ? 'نئے نوٹس' : 'New Notices', value: '3', color: '#ef4444' },
    ];

    return (
        <div>
            {/* Welcome Banner */}
            <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 text-white p-6 rounded-xl mb-6 shadow-lg">
                <h1 className="text-2xl font-bold mb-2">
                    {isRTL ? 'ڈیش بورڈ میں خوش آمدید' : 'Welcome to Dashboard'}
                </h1>
                <p className="opacity-90">
                    {isRTL ? 'ایڈمن پینل' : 'Admin Panel'}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-5 rounded-xl shadow-sm border-t-4"
                        style={{ borderTopColor: stat.color }}
                    >
                        <p className="text-gray-500 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    {isRTL ? 'فوری کارروائیاں' : 'Quick Actions'}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: isRTL ? 'نیا داخلہ' : 'New Admission', icon: '📝' },
                        { label: isRTL ? 'حاضری لگائیں' : 'Mark Attendance', icon: '✅' },
                        { label: isRTL ? 'فیس وصول کریں' : 'Collect Fee', icon: '💰' },
                        { label: isRTL ? 'رپورٹ دیکھیں' : 'View Reports', icon: '📊' },
                    ].map((action, index) => (
                        <button
                            key={index}
                            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                            <span className="text-2xl">{action.icon}</span>
                            <span className="text-sm font-medium">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
