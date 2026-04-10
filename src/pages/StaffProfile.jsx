import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Phone, Mail, MapPin, Calendar, Clock, Banknote, Briefcase, Shield, Camera, Edit2, X, Save } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { staffData } from '../utils/migrateStaffToFirebase';
import toast, { Toaster } from 'react-hot-toast';

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
                const fallbackStaff = staffData[id];

                if (docSnap.exists()) {
                    const firebaseStaff = docSnap.data();

                    if (Number(id) === 15 && fallbackStaff) {
                        setStaff({
                            ...firebaseStaff,
                            ...fallbackStaff,
                            email: firebaseStaff.email || fallbackStaff.email,
                            phone: firebaseStaff.phone && firebaseStaff.phone !== '-' ? firebaseStaff.phone : fallbackStaff.phone,
                            staffId: firebaseStaff.staffId || fallbackStaff.id
                        });
                    } else {
                        setStaff({ ...fallbackStaff, ...firebaseStaff });
                    }
                } else if (fallbackStaff) {
                    setStaff(fallbackStaff);
                } else {
                    setStaff(null);
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

    // Edit Profile Logic
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    const handleEditClick = () => {
        setEditForm({
            nameEn: staff.nameEn || '',
            nameUr: staff.nameUr || '',
            phone: staff.phone || '',
            salary: staff.salary || 0
        });
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        // Bug 11: Profile Validation (Prevent Empty Name)
        if (!editForm.nameEn.trim() || !editForm.nameUr.trim()) {
            toast.error(t('toast.nameEmpty'));
            return;
        }

        setIsSaving(true);
        try {
            const docRef = doc(db, 'staff', id);
            await updateDoc(docRef, {
                nameEn: editForm.nameEn,
                nameUr: editForm.nameUr,
                phone: editForm.phone,
                salary: Number(editForm.salary)
            });
            
            // Update local state
            setStaff({ ...staff, ...editForm, salary: Number(editForm.salary) });
            setIsEditing(false);
            
            // Bug 5: Missing Success Toasts
            toast.success(t('toast.profileUpdated'), {
                style: {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: 'bold',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                },
                iconTheme: { primary: '#fff', secondary: '#059669' }
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(t('toast.profileUpdateError'));
        }
        setIsSaving(false);
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
                <div className="text-gray-500">{t('common.staffNotFound')}</div>
            </div>
        );
    }

    // Role display parsing
    const currentRole = isRTL ? staff.roleUr : staff.roleEn;
    const currentName = isRTL ? staff.nameUr : staff.nameEn;
    const currentTiming = staff.isRemote
        ? (isRTL ? `ریموٹ — ${staff.totalHours} گھنٹے یومیہ` : `Remote — ${staff.totalHours} Hours/Day`)
        : `${staff.entryTime} - ${staff.exitTime}`;

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

                    {/* Staff ID Indicator & Edit Button */}
                    <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
                        <button 
                            onClick={handleEditClick}
                            className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                            <Edit2 size={14} />
                            <span className="text-xs font-bold">{t('editProfile.editBtn')}</span>
                        </button>
                        <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                            <span className="text-white/80 text-xs font-mono font-bold">#{id}</span>
                        </div>
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
                                <p className="text-lg font-black text-teal-600">
                                    Rs {staff.salary?.toLocaleString()}
                                    {staff.allowance ? (
                                        <span className="text-sm font-normal text-emerald-600 dark:text-emerald-400">
                                            {t('editProfile.allowanceText', { amount: staff.allowance?.toLocaleString() })}
                                        </span>
                                    ) : null}
                                </p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                                    {t('profile.salary')}
                                </p>
                            </div>
                            <div className="w-px bg-gray-200 dark:bg-slate-600" />
                            <div className="text-center">
                                <p className="text-lg font-black text-slate-700 dark:text-slate-200">
                                    {staff.isRemote ? currentTiming : staff.entryTime}
                                </p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                                    {staff.isRemote ? t('profile.timing') : t('profile.entry')}
                                </p>
                            </div>
                            <div className="w-px bg-gray-200 dark:bg-slate-600" />
                            <div className="text-center">
                                <p className="text-lg font-black text-slate-700 dark:text-slate-200">
                                    {staff.isRemote ? (isRTL ? 'ریموٹ اسٹاف' : 'Remote Staff') : staff.exitTime}
                                </p>
                                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                                    {staff.isRemote ? t('profile.role') : t('profile.exit')}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ===== DETAIL ROWS ===== */}
                <div className="mx-4 space-y-2.5 pb-8">
                    {[
                        { icon: Phone, label: t('profile.phoneNumber'), value: staff.phone, accent: '#3b82f6' },
                        { icon: Mail, label: t('profile.email'), value: staff.email, accent: '#8b5cf6', dim: staff.email === '-' },
                        { icon: MapPin, label: t('profile.address'), value: (staff.city || '-') + ', ' + (staff.country || '-'), accent: '#ef4444' },
                        { icon: Calendar, label: t('profile.joinDate'), value: staff.joinDate, accent: '#f59e0b' },
                        { icon: Clock, label: t('profile.timing'), value: currentTiming, accent: '#0d9488' },
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

            <Toaster position="top-center" reverseOrder={false} />

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => !isSaving && setIsEditing(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                            dir={isRTL ? 'rtl' : 'ltr'}
                            style={{ fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)' }}
                        >
                            <div className="p-5 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    {t('editProfile.title')}
                                </h3>
                                <button onClick={() => !isSaving && setIsEditing(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('editProfile.nameEn')}</label>
                                    <input 
                                        type="text" 
                                        value={editForm.nameEn}
                                        onChange={e => setEditForm({...editForm, nameEn: e.target.value})}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('editProfile.nameUr')}</label>
                                    <input 
                                        type="text" 
                                        value={editForm.nameUr}
                                        onChange={e => setEditForm({...editForm, nameUr: e.target.value})}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all dark:text-white text-right"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('editProfile.phoneLabel')}</label>
                                    <input 
                                        type="text" 
                                        value={editForm.phone}
                                        onChange={e => setEditForm({...editForm, phone: e.target.value})}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{t('editProfile.salaryLabel')}</label>
                                    <input 
                                        type="number" 
                                        value={editForm.salary}
                                        onChange={e => setEditForm({...editForm, salary: e.target.value})}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all font-mono font-bold dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="p-5 border-t border-gray-100 dark:border-slate-700 flex justify-end gap-3 bg-gray-50 dark:bg-slate-900/50">
                                <button 
                                    onClick={() => !isSaving && setIsEditing(false)}
                                    className="px-5 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {t('editProfile.cancelBtn')}
                                </button>
                                <button 
                                    onClick={handleSaveEdit}
                                    disabled={isSaving}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold shadow-md shadow-emerald-500/20 text-white flex items-center gap-2 transition-all ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105'}`}
                                >
                                    {isSaving ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Save size={16} />
                                    )}
                                    {t('editProfile.saveBtn')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default StaffProfile;
