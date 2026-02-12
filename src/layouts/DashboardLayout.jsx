import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
    Type,
    Home,
    Users,
    GraduationCap,
    LogOut,
    PanelLeftClose,
    PanelLeft,
    Calendar,
    ClipboardList,
    BarChart3,
    Menu,
    X,
    FileText
} from 'lucide-react';
import FontSettings, { getSavedFont } from '../components/FontSettings';
import appConfig from '../config/appConfig';
import logoMain from '../assets/logo-main.png';
import LogoutModal from '../components/LogoutModal';
import ScrollToTop from '../components/ScrollToTop';

const DashboardLayout = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const [showFontSettings, setShowFontSettings] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [teachersOpen, setTeachersOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isRTL = i18n.language === 'ur';

    // Auto-open dropdown if on teachers sub-page
    useEffect(() => {
        if (location.pathname.startsWith('/teachers')) {
            setTeachersOpen(true);
        }
    }, [location.pathname]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
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
    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userGR');
        window.location.href = '/';
    };

    const teachersSubMenu = [
        { labelKey: 'sidebar.teachersList', path: '/teachers', icon: Users },
        { labelKey: 'sidebar.attendanceSchedule', path: '/teachers/schedule', icon: Calendar },
        { labelKey: 'sidebar.attendanceSummary', path: '/teachers/summary', icon: BarChart3 },
        { labelKey: 'sidebar.dailyAttendance', path: '/teachers/daily', icon: ClipboardList },
        { labelKey: 'sidebar.hazriReports', path: '/teachers/reports', icon: FileText, isNew: true },
    ];

    // Main menu items
    const mainMenuItems = [
        { labelKey: 'sidebar.dashboard', path: '/dashboard', icon: Home },
        { labelKey: 'sidebar.students', path: '/students', icon: GraduationCap },
    ];

    return (
        <div
            className={`h-screen flex ${isRTL ? 'font-urdu' : 'font-english'}`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Hidden on mobile, shown on lg+ */}
            <aside
                className={`
                    fixed lg:relative inset-y-0 z-50
                    ${isRTL ? 'right-0' : 'left-0'}
                    ${mobileMenuOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
                    lg:translate-x-0
                    ${isCollapsed ? 'w-[70px]' : 'w-[260px]'}
                    bg-gradient-to-b from-white to-green-50
                    ${isRTL ? 'border-l' : 'border-r'} border-gray-200
                    flex flex-col flex-shrink-0
                    transition-all duration-300 ease-in-out
                `}
            >
                {/* Logo Section */}
                <div className={`
                    ${isCollapsed ? 'px-2.5' : 'px-5'} py-4
                    border-b border-gray-200
                    flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}
                    gap-3 bg-emerald-500 min-h-[65px]
                `}>
                    <img src={logoMain} alt="logo" className="h-9 flex-shrink-0" />
                    {!isCollapsed && (
                        <span className="text-[15px] font-bold text-white whitespace-nowrap">
                            {isRTL ? appConfig.appName.ur : appConfig.appName.en}
                        </span>
                    )}
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden ml-auto text-white p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-3 overflow-y-auto">
                    {/* Main Menu Items */}
                    {mainMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) => `
                                    flex items-center gap-3
                                    ${isCollapsed ? 'justify-center py-3.5' : 'px-5 py-3.5'}
                                    no-underline text-sm
                                    ${isActive ? 'text-emerald-500 bg-emerald-50 font-semibold' : 'text-gray-600 font-medium'}
                                    ${isRTL
                                        ? (isActive ? 'border-r-4 border-emerald-500' : 'border-r-4 border-transparent')
                                        : (isActive ? 'border-l-4 border-emerald-500' : 'border-l-4 border-transparent')
                                    }
                                    transition-all duration-200 hover:bg-emerald-50
                                `}
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
                            className={`
                                w-full flex items-center gap-3
                                ${isCollapsed ? 'justify-center py-3.5' : 'px-5 py-3.5 justify-between'}
                                ${location.pathname.startsWith('/teachers') ? 'bg-emerald-50 text-emerald-500 font-semibold' : 'text-gray-600 font-medium'}
                                border-none cursor-pointer text-sm
                                ${isRTL
                                    ? (location.pathname.startsWith('/teachers') ? 'border-r-4 border-emerald-500' : 'border-r-4 border-transparent')
                                    : (location.pathname.startsWith('/teachers') ? 'border-l-4 border-emerald-500' : 'border-l-4 border-transparent')
                                }
                                transition-all duration-200 hover:bg-emerald-50 bg-transparent
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Users size={20} />
                                {!isCollapsed && t('sidebar.teachers')}
                            </div>
                        </button>

                        {/* Sub-menu */}
                        {teachersOpen && !isCollapsed && (
                            <div className="bg-gray-50 border-y border-gray-200">
                                {teachersSubMenu.map((subItem, idx) => {
                                    const SubIcon = subItem.icon;
                                    return (
                                        <NavLink
                                            key={idx}
                                            to={subItem.path}
                                            end={subItem.path === '/teachers'}
                                            className={({ isActive }) => `
                                                flex items-center gap-2.5 py-3 px-5
                                                ${isRTL ? 'pr-9' : 'pl-9'}
                                                no-underline text-[13px]
                                                ${isActive ? 'text-emerald-500 bg-green-100 font-semibold' : 'text-gray-500 font-normal'}
                                                transition-all duration-200 hover:bg-green-100
                                            `}
                                        >
                                            <SubIcon size={16} />
                                            {t(subItem.labelKey)}
                                            {subItem.isNew && (
                                                <span className={`
                                                    bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 
                                                    rounded-full font-semibold
                                                    ${isRTL ? 'ml-auto' : 'mr-auto'}
                                                `}>
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
                <div className="border-t border-gray-200">
                    {/* Collapse Button - Hidden on mobile */}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex w-full py-3.5 items-center justify-center gap-2.5 bg-gray-100 border-none cursor-pointer text-gray-500 text-[13px] hover:bg-gray-200 transition-all"
                    >
                        {isCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                        {!isCollapsed && t(isCollapsed ? 'sidebar.expand' : 'sidebar.collapse')}
                    </button>

                    {/* Logout */}
                    <button
                        onClick={handleLogoutClick}
                        className="w-full py-3.5 flex items-center justify-center gap-2.5 bg-transparent border-none cursor-pointer text-red-600 text-sm font-medium hover:bg-red-50 transition-all"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && t('dashboard.logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-white px-4 md:px-6 py-3 border-b border-gray-200 flex justify-between items-center gap-3">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Right side buttons */}
                    <div className={`flex items-center gap-2 md:gap-3 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                        <button
                            onClick={handleLanguageChange}
                            className="px-3 md:px-4 py-2 border border-emerald-500 rounded-lg bg-emerald-50 cursor-pointer text-xs md:text-[13px] font-semibold text-emerald-500 hover:bg-emerald-100 transition-all"
                        >
                            {isRTL ? 'English' : 'اردو'}
                        </button>
                        <button
                            onClick={() => setShowFontSettings(true)}
                            className="px-3 md:px-4 py-2 border border-gray-200 rounded-lg bg-white cursor-pointer text-xs md:text-[13px] flex items-center gap-1.5 text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            <Type size={16} />
                            <span className="hidden sm:inline">{isRTL ? 'فونٹ' : 'Font'}</span>
                        </button>
                    </div>
                </div>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 md:p-6">
                    <Outlet />
                </div>
            </div>

            <FontSettings
                isOpen={showFontSettings}
                onClose={() => setShowFontSettings(false)}
            />

            <LogoutModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />

            <ScrollToTop />
        </div>
    );
};

export default DashboardLayout;
