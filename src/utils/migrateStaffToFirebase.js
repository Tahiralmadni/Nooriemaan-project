// This script pushes all hardcoded staff data into Firebase
// To run: Since it uses client SDK, you can import this in App.jsx temporarily and call it once, or run via Node if admin SDK was setup.
// We will call this temporarily inside App.jsx just to push data.

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const staffData = {
    1: { id: 1, nameUr: 'محمد اکرم عطاری', nameEn: 'Muhammad Akram Attari', roleUr: 'نائب ناظم', roleEn: 'Naib Nazim', entryTime: '8:00 AM', exitTime: '4:00 PM', entryHour: 8, exitHour: 16, totalHours: 8, salary: 26620, perDaySalary: Math.round(26620 / 26), perHourSalary: Math.round(26620 / 26 / 8), perMinuteSalary: 26620 / 26 / 8 / 60, phone: '03128593301', email: 'ishaqakram67@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'October 2020', setupDate: '2026-02-01' },
    2: { id: 2, nameUr: 'قاری سید عمیر عطاری', nameEn: 'Qari Syed Umair Attari', roleUr: 'مدرسہ ناظم حسین آباد', roleEn: 'Madrasa Nazim Hussainabad', entryTime: '8:00 AM', exitTime: '4:00 PM', entryHour: 8, exitHour: 16, totalHours: 8, salary: 13000, perDaySalary: Math.round(13000 / 26), perHourSalary: Math.round(13000 / 26 / 8), perMinuteSalary: 13000 / 26 / 8 / 60, phone: '03138657703', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: 'June 2025', setupDate: '2026-02-25' },
    3: { id: 3, nameUr: 'محمد منیب صابر', nameEn: 'Muhammad Muneeb Sabir', roleUr: 'مدرس - بلال مسجد', roleEn: 'Mudarris - Bilal Masjid', entryTime: '8:00 AM', exitTime: '11:00 AM', entryHour: 8, exitHour: 11, totalHours: 3, salary: 7500, perDaySalary: Math.round(7500 / 26), perHourSalary: Math.round(7500 / 26 / 3), perMinuteSalary: 7500 / 26 / 3 / 60, phone: '03152643153', email: 'muneebattari527@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'October 2025', setupDate: '2026-02-26' },
    4: { id: 4, nameUr: 'مدثر رضا', nameEn: 'Mudassir Raza', roleUr: 'مدرس — نیا آباد صبح', roleEn: 'Mudaris — Nayabad Subha', entryTime: '8:00 AM', exitTime: '11:00 AM', entryHour: 8, exitHour: 11, totalHours: 3, salary: 7500, perDaySalary: Math.round(7500 / 26), perHourSalary: Math.round(7500 / 26 / 3), perMinuteSalary: 7500 / 26 / 3 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-01' },
    5: { id: 5, nameUr: 'مدثر رضا', nameEn: 'Mudassir Raza', roleUr: 'مدرس — نیا آباد دوپہر', roleEn: 'Mudaris — Nayabad Dopher', entryTime: '2:00 PM', exitTime: '4:00 PM', entryHour: 14, exitHour: 16, totalHours: 2, salary: 6000, perDaySalary: Math.round(6000 / 26), perHourSalary: Math.round(6000 / 26 / 2), perMinuteSalary: 6000 / 26 / 2 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-05' },
    6: { id: 6, nameUr: 'مدثر رضا', nameEn: 'Mudassir Raza', roleUr: 'عطیہ — موسیٰ لائن', roleEn: 'Aattiya — Musa line', entryTime: '11:15 AM', exitTime: '1:15 PM', entryHour: 11.25, exitHour: 13.25, totalHours: 2, salary: 7500, perDaySalary: Math.round(7500 / 26), perHourSalary: Math.round(7500 / 26 / 2), perMinuteSalary: 7500 / 26 / 2 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-05' },
    7: { id: 7, nameUr: 'عبید رضا عطاری', nameEn: 'Obaid Raza Attari', roleUr: 'مدرس — نیا آباد', roleEn: 'Mudaris (Nayabad)', entryTime: '2:00 PM', exitTime: '4:00 PM', entryHour: 14, exitHour: 16, totalHours: 2, salary: 6500, perDaySalary: Math.round(6500 / 26), perHourSalary: Math.round(6500 / 26 / 2), perMinuteSalary: 6500 / 26 / 2 / 60, phone: '03269676389', email: 'ubaidattari0326@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2023', setupDate: '2026-03-05' }
};

export const migrateStaff = async () => {
    try {
        console.log("Starting staff migration to Firebase...");

        for (const key in staffData) {
            const staff = staffData[key];
            const strId = String(staff.id);
            await setDoc(doc(db, 'staff', strId), staff);
            console.log(`Migrated staff ${strId}: ${staff.nameEn}`);
        }

        console.log("Migration completed successfully!");
        return true;
    } catch (error) {
        console.error("Migration failed:", error);
        return false;
    }
};
