/**
 * Utility functions for time and date handling
 */

/**
 * Convert 24-hour time (e.g., "14:30") to 12-hour AM/PM format (e.g., "2:30 PM")
 * @param {string} time24 
 * @returns {string}
 */
export const formatTime12Hour = (time24) => {
    if (!time24 || time24 === '-') return '-';
    
    // Handle cases where time might be "Remote" or other strings
    if (time24.toLowerCase().includes('remote')) return 'Remote';
    
    try {
        const [hours, minutes] = time24.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return time24;
        
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
        return time24;
    }
};

/**
 * Formats a date object to DD/MM/YYYY string
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateString = (date) => {
    if (!(date instanceof Date)) return '-';
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};
