import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Phone, Mail, MapPin, Calendar, Clock, Banknote, Briefcase, Shield, Camera } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const StaffProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ur';

    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'staff', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setStaff(docSnap.data());
                } else {
                    console.log("No such staff!");
                }
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    useEffect(() => {
        if (staff) {
            document.title = `${isRTL ? staff.nameUr : staff.nameEn} - Profile`;
        }
    }, [staff, isRTL]);

    // Initials for avatar
    const initials = staff ? (isRTL ? staff.nameUr : staff.nameEn).split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '';

    // Photo upload
    const fileInputRef = useRef(null);
    const [staffPhoto, setStaffPhoto] = useState(() => {
        return localStorage.getItem(`staffPhoto_${id}`) || null;
    });

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setStaffPhoto(reader.result);
            localStorage.setItem(`staffPhoto_${id}`, reader.result);
        };
        reader.readAsDataURL(file);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500">{isRTL ? 'اسٹاف نہیں ملا' : 'Staff not found'}</div>
            </div>
        );
    }

    // Role display parsing
    const currentRole = isRTL ? staff.roleUr : staff.roleEn;
    const currentName = isRTL ? staff.nameUr : staff.nameEn;
    const currentTiming = `${staff.entryTime} - ${staff.exitTime}`;

    return (
        <>
            <Helmet defer={false}>
                <title>{currentName} - Profile</title>
            </Helmet>

            <div
                style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
                dir={isRTL ? 'rtl' : 'ltr'}
            >
                {/* ===== DARK HEADER SECTION ===== */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="relative rounded-2xl overflow-hidden mb-20"
                    style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0d9488 100%)',
                        minHeight: '200px'
                    }}
                >
                    {/* Geometric pattern overlay */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 1px, transparent 1px),
                                              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: '30px 30px'
                        }}
                    />

                    {/* Glowing orbs */}
                    <div className="absolute top-6 right-10 w-24 h-24 bg-teal-400/20 rounded-full blur-xl" />
                    <div className="absolute bottom-0 left-16 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl" />

                    {/* Back Button */}
                    <div className="relative z-10 p-4">
                        <button
                            onClick={() => navigate('/teachers')}
                            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
                        >
                            {isRTL
                                ? <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                : <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            }
                            <span className="text-sm font-medium">{t('profile.back')}</span>
                        </button>
                    </div>

                    {/* Staff ID Indicator */}
                    <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        <span className="text-white/60 text-xs font-mono">#{id}</span>
                    </div>
                </motion.div>

                {/* ===== FLOATING PROFILE CARD ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="relative -mt-32 mx-4 mb-6"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 border border-gray-100 dark:border-slate-700 p-6">
                        {/* Avatar with Photo Upload */}
                        <div className="flex flex-col items-center -mt-16 mb-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                {staffPhoto ? (
                                    <img
                                        src={staffPhoto}
                                        alt={currentName}
                                        className="w-24 h-24 rounded-2xl object-cover shadow-lg border-4 border-white"
                                        style={{ transform: 'rotate(-3deg)' }}
                                    />
                                ) : (
                                    <div
                                        className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg border-4 border-white"
                                        style={{
                                            background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
                                            transform: 'rotate(-3deg)'
                                        }}
                                    >
                                        <span style={{ transform: 'rotate(3deg)' }}>{initials}</span>
                                    </div>
                                )}
                                {/* Camera overlay */}
                                <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ transform: 'rotate(-3deg)' }}>
                                    <Camera size={22} className="text-white" />
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Name */}
                        <h1
                            className="text-center text-xl font-extrabold text-slate-800 dark:text-white mb-1"
                            style={{ lineHeight: '2.2' }}
                        >
                            {currentName}
                        </h1>

                        {/* Role Badge */}
                        <div className="flex justify-center mb-4">
                            <span
                                className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold"
                                style={{
                                    background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)',
                                    color: '#0d9488',
                                    border: '1px solid #99f6e4'
                                }}
                            >
                                <Shield size={12} />
                                {currentRole}
                            </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex justify-center gap-6 pt-3 border-t border-gray-100 dark:border-slate-700">
                            <div className="text-center">
                                <p className="text-lg font-black text-teal-600">Rs {staff.salary}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                                    {isRTL ? 'تنخواہ' : 'Salary'}
                                </p>
                            </div>
                            <div className="w-px bg-gray-200 dark:bg-slate-600" />
                            <div className="text-center">
                                <p className="text-lg font-black text-slate-700 dark:text-slate-200">{staff.entryTime}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                                    {isRTL ? 'آمد' : 'Entry'}
                                </p>
                            </div>
                            <div className="w-px bg-gray-200 dark:bg-slate-600" />
                            <div className="text-center">
                                <p className="text-lg font-black text-slate-700 dark:text-slate-200">{staff.exitTime}</p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                                    {isRTL ? 'روانگی' : 'Exit'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ===== DETAIL ROWS ===== */}
                <div className="mx-4 space-y-2.5 pb-8">
                    {[
                        { icon: Phone, label: isRTL ? 'فون نمبر' : 'Phone', value: staff.phone, accent: '#3b82f6' },
                        { icon: Mail, label: isRTL ? 'ای میل' : 'Email', value: staff.email, accent: '#8b5cf6', dim: staff.email === '-' },
                        { icon: MapPin, label: isRTL ? 'پتہ' : 'Address', value: staff.city + ', ' + staff.country, accent: '#ef4444' },
                        { icon: Calendar, label: isRTL ? 'تعیناتی' : 'Join Date', value: staff.joinDate, accent: '#f59e0b' },
                        { icon: Clock, label: isRTL ? 'اوقات' : 'Timing', value: currentTiming, accent: '#0d9488' },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: 0.4 + index * 0.07 }}
                            className="bg-white dark:bg-slate-800 rounded-xl p-3.5 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                        >
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: item.accent + '12' }}
                            >
                                <item.icon size={18} style={{ color: item.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                                <p className={`text-sm font-semibold truncate ${item.dim ? 'text-gray-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {item.value}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default StaffProfile;
