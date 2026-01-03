// Enterprise Toast Notification Component
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export default function Toast({
    message,
    type = 'success', // 'success' | 'error'
    isVisible,
    onClose,
    duration = 4000,
}) {
    const [isShowing, setIsShowing] = useState(false);

    const handleClose = useCallback(() => {
        setIsShowing(false);
        setTimeout(onClose, 300);
    }, [onClose]);

    useEffect(() => {
        if (isVisible) {
            // Use requestAnimationFrame to batch state updates
            requestAnimationFrame(() => {
                setIsShowing(true);
            });
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, handleClose]);

    if (!isVisible && !isShowing) return null;

    const styles = {
        success: {
            bg: 'bg-emerald-50 border-emerald-200',
            icon: 'text-emerald-600',
            text: 'text-emerald-800',
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            icon: 'text-red-600',
            text: 'text-red-800',
        },
    };

    const currentStyle = styles[type];

    return (
        <div
            className={`
        fixed top-6 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3
        px-5 py-4 rounded-xl border
        shadow-lg
        transition-all duration-300
        ${currentStyle.bg}
        ${isShowing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
            role="alert"
            style={{
                fontFamily: 'var(--font-urdu)',
                minWidth: '300px',
                maxWidth: '90vw'
            }}
        >
            {type === 'success' ? (
                <CheckCircle className={`w-6 h-6 flex-shrink-0 ${currentStyle.icon}`} />
            ) : (
                <XCircle className={`w-6 h-6 flex-shrink-0 ${currentStyle.icon}`} />
            )}

            <p className={`flex-1 text-sm font-medium ${currentStyle.text}`}>
                {message}
            </p>

            <button
                onClick={handleClose}
                className={`p-1 rounded-full hover:bg-black/5 transition-colors ${currentStyle.icon}`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
