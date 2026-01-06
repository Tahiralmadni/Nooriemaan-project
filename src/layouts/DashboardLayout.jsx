import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import i18n from '../config/i18n';
import appConfig from '../config/appConfig';
import logoMain from '../assets/logo-main.png';

const DashboardLayout = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ur';

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Header */}
            <div style={{ background: '#fff', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logoMain} alt="logo" style={{ height: '32px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{isRTL ? appConfig.appName.ur : appConfig.appName.en}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ur')} style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>
                        {isRTL ? 'EN' : 'اردو'}
                    </button>
                    <button onClick={() => navigate('/')} style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <LogOut size={14} /> {t('dashboard.logout')}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ background: '#10b981', color: '#fff', padding: '24px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: isRTL ? '22px' : '18px' }}>🎉 {t('dashboard.loginSuccessful')}</h1>
                    <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '13px' }}>{t('dashboard.welcomeMessage')}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                    {[
                        // { label: t('dashboard.totalStudents'), val: '1,234', col: '#10b981' },
                        { label: t('dashboard.presentToday'), val: '15', col: '#3b82f6' },
                        // { label: t('dashboard.feesPending'), val: '₨ 45K', col: '#f59e0b' },
                        // { label: t('dashboard.newNotices'), val: '3', col: '#ef4444' },
                    ].map((s, i) => (
                        <div key={i} style={{ background: '#fff', padding: '16px', borderRadius: '8px', borderTop: `3px solid ${s.col}` }}>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>{s.label}</div>
                            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>{s.val}</div>
                        </div>
                    ))}
                </div>
            </div>

            <Outlet />
        </div>
    );
};

export default DashboardLayout;
