import { Outlet, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Type } from 'lucide-react';
import FontSettings, { getSavedFont } from '../components/FontSettings';
import appConfig from '../config/appConfig';
import logoMain from '../assets/logo-main.png';

const DashboardLayout = () => {
    const { t, i18n } = useTranslation();
    const [showFontSettings, setShowFontSettings] = useState(false);
    const [, forceUpdate] = useState(0); // Force re-render state

    const isRTL = i18n.language === 'ur';

    // Load saved fonts on mount
    useEffect(() => {
        const savedUrdu = getSavedFont('ur');
        const savedEnglish = getSavedFont('en');
        document.documentElement.style.setProperty('--font-urdu', savedUrdu.family);
        document.documentElement.style.setProperty('--font-english', savedEnglish.family);
    }, []);

    // Language Toggle Handler
    const handleLanguageChange = () => {
        const newLang = i18n.language === 'ur' ? 'en' : 'ur';
        i18n.changeLanguage(newLang);
        // Force re-render to update Helmet
        forceUpdate(n => n + 1);
    };

    // Logout Handler
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userGR');
        window.location.href = '/';
    };

    // Sidebar menu items - Clean URLs
    const menuItems = [
        { labelKey: 'sidebar.dashboard', path: '/dashboard' },
        { labelKey: 'sidebar.students', path: '/students' },
        { labelKey: 'sidebar.teachers', path: '/teachers' },
        { labelKey: 'sidebar.attendance', path: '/attendance' },
    ];

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Sidebar */}
            <aside style={{
                width: '250px',
                background: '#fff',
                borderLeft: isRTL ? '1px solid #e2e8f0' : 'none',
                borderRight: isRTL ? 'none' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0
            }}>
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
                                fontSize: isRTL ? '15px' : '14px',
                                fontWeight: isActive ? 600 : 400,
                                borderRight: isRTL ? (isActive ? '3px solid #10b981' : '3px solid transparent') : 'none',
                                borderLeft: isRTL ? 'none' : (isActive ? '3px solid #10b981' : '3px solid transparent'),
                                transition: 'all 0.2s ease'
                            })}
                        >
                            {t(item.labelKey)}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: 'transparent',
                            border: 'none',
                            color: '#dc2626',
                            fontSize: isRTL ? '15px' : '14px',
                            cursor: 'pointer',
                            textAlign: 'center'
                        }}
                    >
                        {t('dashboard.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
                        onClick={handleLanguageChange}
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

                <div style={{ flex: 1, overflow: 'auto', background: '#f1f5f9', padding: '20px' }}>
                    <Outlet />
                </div>
            </div>

            <FontSettings
                isOpen={showFontSettings}
                onClose={() => setShowFontSettings(false)}
            />
        </div>
    );
};

export default DashboardLayout;
