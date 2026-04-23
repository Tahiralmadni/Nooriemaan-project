import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import React from 'react';

/**
 * Premium Toast Notifications
 */

export const showSuccessToast = (message, isRTL = false) => {
    toast.custom((t) => (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: '600',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)',
                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                fontSize: isRTL ? '16px' : '14px',
                direction: isRTL ? 'rtl' : 'ltr',
                transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                opacity: t.visible ? 1 : 0,
                transition: 'all 0.3s ease-in-out',
                minWidth: '280px',
                zIndex: 99999
            }}
        >
            <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
                <CheckCircle size={20} className="text-white" />
            </div>
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={() => toast.dismiss(t.id)}
                className="text-white/70 hover:text-white transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <XCircle size={20} />
            </button>
        </div>
    ), { duration: 4000, position: 'top-center' });
};

export const showErrorToast = (message, isRTL = false) => {
    toast.custom((t) => (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                fontWeight: '600',
                padding: '16px 20px',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)',
                fontFamily: isRTL ? 'var(--font-urdu)' : 'var(--font-english)',
                fontSize: isRTL ? '16px' : '14px',
                direction: isRTL ? 'rtl' : 'ltr',
                transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                opacity: t.visible ? 1 : 0,
                transition: 'all 0.3s ease-in-out',
                minWidth: '280px',
                zIndex: 99999
            }}
        >
            <div className="bg-white/20 p-1.5 rounded-full flex items-center justify-center">
                <AlertCircle size={20} className="text-white" />
            </div>
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={() => toast.dismiss(t.id)}
                className="text-white/70 hover:text-white transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
                <XCircle size={20} />
            </button>
        </div>
    ), { duration: 5000, position: 'top-center' });
};
