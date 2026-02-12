import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled upto 300px
    const toggleVisibility = () => {
        // Check main content scroll or window scroll
        // Since we have a layout with overflow-auto specific div, we might need to attach this to that div
        // But for now let's try window and see, or we'll attach to the scrollable container ID
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Since our layout uses a scrollable div (.flex-1.overflow-auto), window.scroll might not work.
    // We need to attach listener to the scrollable element.
    // Let's assume this component is placed INSIDE the scrollable area or we find the element.
    // Better yet, let's make this component accept a target Ref ID or handle window if it's main scroll.

    // In DashboardLayout.jsx:
    // <div className="flex-1 overflow-auto p-4 md:p-6" id="main-content">

    useEffect(() => {
        const scrollableDiv = document.querySelector('.flex-1.overflow-auto');

        const handleScroll = () => {
            if (scrollableDiv) {
                if (scrollableDiv.scrollTop > 300) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
            } else {
                window.addEventListener('scroll', toggleVisibility);
            }
        };

        if (scrollableDiv) {
            scrollableDiv.addEventListener('scroll', handleScroll);
        } else {
            window.addEventListener('scroll', toggleVisibility);
        }

        return () => {
            if (scrollableDiv) {
                scrollableDiv.removeEventListener('scroll', handleScroll);
            }
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        const scrollableDiv = document.querySelector('.flex-1.overflow-auto');
        if (scrollableDiv) {
            scrollableDiv.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    if (!isVisible) {
        return null;
    }

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 bg-emerald-600 text-white p-3 rounded-full shadow-lg hover:bg-emerald-700 transition-all animate-bounce-in transform hover:scale-110 focus:outline-none"
            title="Scroll to Top"
        >
            <ArrowUp size={24} />
        </button>
    );
};

export default ScrollToTop;
