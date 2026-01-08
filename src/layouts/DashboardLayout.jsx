import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Type } from 'lucide-react';
import FontSettings, { getSavedFont } from '../components/FontSettings';
import i18n from '../config/i18n';
import appConfig from '../config/appConfig';
import logoMain from '../assets/logo-main.png';

const DashboardLayout = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ur';
    const [showFontSettings, setShowFontSettings] = useState(false);

    // Load saved fonts on mount
    useEffect(() => {
        const savedUrdu = getSavedFont('ur');
        const savedEnglish = getSavedFont('en');
        document.documentElement.style.setProperty('--font-urdu', savedUrdu.family);
        document.documentElement.style.setProperty('--font-english', savedEnglish.family);
    }, []);

    // Logout Handler - Remember Me data clear karo
    const handleLogout = () => {
        // localStorage se login data clear karo
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userGR');
        // Login page par wapas jao
        navigate('/');
    };

    // Sidebar menu items
    const menuItems = [
        { label: 'ڈیش بورڈ', path: '/dashboard' },
        { label: 'طلباء', path: '/students' },
        { label: 'اساتذہ', path: '/staff' },
        { label: 'حاضری', path: '/attendance' },
    ];

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
            }}
            dir="rtl"
        >
            {/* Sidebar - Right Side (because of RTL) */}
            <aside style={{
                width: '250px',
                background: '#fff',
                borderLeft: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
                {/* Sidebar Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <img src={logoMain} alt="logo" style={{ height: '32px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                        {isRTL ? appConfig.appName.ur : appConfig.appName.en}
                    </span>
                </div>

                {/* Navigation Links */}
                <nav style={{ flex: 1, padding: '16px 0' }}>
                    {menuItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.path}
                            style={({ isActive }) => ({
                                display: 'block',
                                padding: '12px 20px',
                                textDecoration: 'none',
                                color: isActive ? '#10b981' : '#374151',
                                background: isActive ? '#f0fdf4' : 'transparent',
                                fontSize: '14px',
                                fontWeight: isActive ? 600 : 400,
                                borderRight: isActive ? '3px solid #10b981' : '3px solid transparent',
                                transition: 'all 0.2s ease'
                            })}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Logout Button at Bottom */}
                <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'transparent',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        لاگ آؤٹ
                    </button>
                </div>
            </aside>

            {/* Main Content Area - Left Side */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{
                    background: '#fff',
                    padding: '12px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <button
                        onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ur')}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        {isRTL ? 'EN' : 'اردو'}
                    </button>
                    <button
                        onClick={() => setShowFontSettings(true)}
                        style={{
                            padding: '6px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Type size={14} /> {isRTL ? 'فونٹ' : 'Font'}
                    </button>
                </div>

                {/* Scrollable Content */}
                <div style={{ flex: 1, overflow: 'auto', background: '#f1f5f9' }}>
                    {/* Content */}
                    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ background: '#10b981', color: '#fff', padding: '24px', borderRadius: '10px', textAlign: 'center', marginBottom: '20px' }}>
                            <h1 style={{ margin: 0, fontSize: isRTL ? '22px' : '18px' }}>{t('dashboard.welcomeToDashboard')}</h1>
                            <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '13px' }}>{t('dashboard.admin')}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
                            {[
                                { label: t('dashboard.presentToday'), val: '15', col: '#3b82f6' },
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
            </div>

            {/* Font Settings Modal */}
            <FontSettings
                isOpen={showFontSettings}
                onClose={() => setShowFontSettings(false)}
            />
        </div>
    );
};

export default DashboardLayout;