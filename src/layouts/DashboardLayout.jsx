import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
    Type,
    ChevronDown,
    ChevronUp,
    Home,
    Users,
    GraduationCap,
    LogOut,
    PanelLeftClose,
    PanelLeft,
    Calendar,
    ClipboardList,
    BarChart3
} from 'lucide-react';
import FontSettings, { getSavedFont } from '../components/FontSettings';
import appConfig from '../config/appConfig';
import logoMain from '../assets/logo-main.png';

const DashboardLayout = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [showFontSettings, setShowFontSettings] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [teachersOpen, setTeachersOpen] = useState(false);

    const isRTL = i18n.language === 'ur';

    // Auto-open dropdown if on teachers sub-page
    useEffect(() => {
        if (location.pathname.startsWith('/teachers')) {
            setTeachersOpen(true);
        }
    }, [location.pathname]);

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
    };

    // Logout Handler
    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userGR');
        window.location.href = '/';
    };

    // Teachers sub-menu items
    const teachersSubMenu = [
        { labelKey: 'sidebar.teachersList', path: '/teachers', icon: Users },
        { labelKey: 'sidebar.attendanceSchedule', path: '/teachers/schedule', icon: Calendar },
        { labelKey: 'sidebar.attendanceSummary', path: '/teachers/summary', icon: BarChart3 },
        { labelKey: 'sidebar.dailyAttendance', path: '/teachers/daily', icon: ClipboardList, isNew: true },
    ];

    // Main menu items (simplified)
    const mainMenuItems = [
        { labelKey: 'sidebar.dashboard', path: '/dashboard', icon: Home },
        { labelKey: 'sidebar.students', path: '/students', icon: GraduationCap },
    ];

    const sidebarWidth = isCollapsed ? '70px' : '260px';

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)'
            }}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Professional Sidebar */}
            <aside
                style={{
                    width: sidebarWidth,
                    background: 'linear-gradient(180deg, #ffffff 0%, #f8fdf8 100%)',
                    borderLeft: isRTL ? '1px solid #e2e8f0' : 'none',
                    borderRight: isRTL ? 'none' : '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0,
                    transition: 'width 0.3s ease',
                    overflow: 'hidden'
                }}
            >
                {/* Logo Section */}
                <div style={{
                    padding: isCollapsed ? '16px 10px' : '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: '12px',
                    background: '#10b981',
                    minHeight: '65px'
                }}>
                    <img src={logoMain} alt="logo" style={{ height: '36px', flexShrink: 0 }} />
                    {!isCollapsed && (
                        <span style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#fff',
                            whiteSpace: 'nowrap'
                        }}>
                            {isRTL ? appConfig.appName.ur : appConfig.appName.en}
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
                    {/* Main Menu Items */}
                    {mainMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: isCollapsed ? '14px 0' : '14px 20px',
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    textDecoration: 'none',
                                    color: isActive ? '#10b981' : '#4b5563',
                                    background: isActive ? '#ecfdf5' : 'transparent',
                                    fontSize: '14px',
                                    fontWeight: isActive ? 600 : 500,
                                    borderRight: isRTL ? (isActive ? '4px solid #10b981' : '4px solid transparent') : 'none',
                                    borderLeft: isRTL ? 'none' : (isActive ? '4px solid #10b981' : '4px solid transparent'),
                                    transition: 'all 0.2s ease'
                                })}
                            >
                                <Icon size={20} />
                                {!isCollapsed && t(item.labelKey)}
                            </NavLink>
                        );
                    })}

                    {/* Teachers Dropdown */}
                    <div>
                        <button
                            onClick={() => setTeachersOpen(!teachersOpen)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: isCollapsed ? '14px 0' : '14px 20px',
                                justifyContent: isCollapsed ? 'center' : 'space-between',
                                background: location.pathname.startsWith('/teachers') ? '#ecfdf5' : 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: location.pathname.startsWith('/teachers') ? '#10b981' : '#4b5563',
                                fontSize: '14px',
                                fontWeight: location.pathname.startsWith('/teachers') ? 600 : 500,
                                borderRight: isRTL ? (location.pathname.startsWith('/teachers') ? '4px solid #10b981' : '4px solid transparent') : 'none',
                                borderLeft: isRTL ? 'none' : (location.pathname.startsWith('/teachers') ? '4px solid #10b981' : '4px solid transparent'),
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Users size={20} />
                                {!isCollapsed && t('sidebar.teachers')}
                            </div>
                        </button>

                        {/* Sub-menu */}
                        {teachersOpen && !isCollapsed && (
                            <div style={{
                                background: '#f9fafb',
                                borderTop: '1px solid #e5e7eb',
                                borderBottom: '1px solid #e5e7eb'
                            }}>
                                {teachersSubMenu.map((subItem, idx) => {
                                    const SubIcon = subItem.icon;
                                    return (
                                        <NavLink
                                            key={idx}
                                            to={subItem.path}
                                            end={subItem.path === '/teachers'}
                                            style={({ isActive }) => ({
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '12px 20px',
                                                paddingRight: isRTL ? '36px' : '20px',
                                                paddingLeft: isRTL ? '20px' : '36px',
                                                textDecoration: 'none',
                                                color: isActive ? '#10b981' : '#6b7280',
                                                background: isActive ? '#dcfce7' : 'transparent',
                                                fontSize: '13px',
                                                fontWeight: isActive ? 600 : 400,
                                                transition: 'all 0.2s ease'
                                            })}
                                        >
                                            <SubIcon size={16} />
                                            {t(subItem.labelKey)}
                                            {subItem.isNew && (
                                                <span style={{
                                                    background: '#10b981',
                                                    color: '#fff',
                                                    fontSize: '10px',
                                                    padding: '2px 6px',
                                                    borderRadius: '10px',
                                                    fontWeight: 600,
                                                    marginRight: isRTL ? '0' : 'auto',
                                                    marginLeft: isRTL ? 'auto' : '0'
                                                }}>
                                                    NEW
                                                </span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </nav>

                {/* Bottom Section */}
                <div style={{ borderTop: '1px solid #e2e8f0' }}>
                    {/* Collapse Button */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            width: '100%',
                            padding: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            background: '#f1f5f9',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b',
                            fontSize: '13px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                        {!isCollapsed && t(isCollapsed ? 'sidebar.expand' : 'sidebar.collapse')}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            padding: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#dc2626',
                            fontSize: '14px',
                            fontWeight: 500,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <LogOut size={18} />
                        {!isCollapsed && t('dashboard.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Top Bar */}
                <div style={{
                    background: '#fff',
                    padding: '12px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <button
                        onClick={handleLanguageChange}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #10b981',
                            borderRadius: '8px',
                            background: '#ecfdf5',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#10b981',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isRTL ? 'English' : 'اردو'}
                    </button>
                    <button
                        onClick={() => setShowFontSettings(true)}
                        style={{
                            padding: '8px 16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            background: '#fff',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            color: '#4b5563'
                        }}
                    >
                        <Type size={16} /> {isRTL ? 'فونٹ' : 'Font'}
                    </button>
                </div>

                {/* Page Content */}
                <div style={{ flex: 1, overflow: 'auto', background: '#f8fafc', padding: '24px' }}>
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
