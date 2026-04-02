import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Original emails from Teachers.jsx
const emails = {
    1: 'ishaqakram67@gmail.com',
    23: 'ishaqakram67@gmail.com',
    2: '-',
    3: 'muneebattari527@gmail.com',
    4: 'mudassirrazachishti@gmail.com',
    5: 'mudassirrazachishti@gmail.com',
    6: 'mudassirrazachishti@gmail.com',
    7: 'ubaidattari0326@gmail.com',
    8: 'ubaidattari0326@gmail.com',
    9: 'ubaidattari0326@gmail.com',
    10: '-',
    11: '-',
    12: '-',
    13: '-',
    14: 'jawadsoomrowork@gmail.com',
    15: 'hanzalahtahir93@gmail.com',
    16: 'balochjuni010@gmail.com',
    17: '-',
    18: 'attaridilawar510@gmail.com',
    19: 'princeShoaibkhan990@gmail.com',
    20: 'aliyn00177@gmail.com',
    21: 'ar8693524@gmail.com',
    22: '-',
};

// Full staff data: 7 fully configured + 16 basic (pending setup)
export const staffData = {
    // ===== FULLY CONFIGURED (1-7) =====
    1: { id: 1, nameUr: 'محمد اکرم عطاری (1)', nameEn: 'Muhammad Akram Attari (1)', roleUr: 'نائب ناظم', roleEn: 'Naib Nazim', entryTime: '8:00 AM', exitTime: '4:00 PM', entryHour: 8, exitHour: 16, totalHours: 8, salary: 26620, allowance: 3500, allowanceDetail: '2000 پیٹرول + 1000 ترکیب + 500 موبائل', perDaySalary: Math.round(26620 / 26), perHourSalary: Math.round(26620 / 26 / 8), perMinuteSalary: 26620 / 26 / 8 / 60, phone: '03128593301', email: 'ishaqakram67@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'October 2020', setupDate: '2026-02-01', setupComplete: true },
    2: { id: 2, nameUr: 'قاری سید عمیر عطاری', nameEn: 'Qari Syed Umair Attari', roleUr: 'مدرسہ ناظم حسین آباد', roleEn: 'Madrasa Nazim Hussainabad', entryTime: '8:00 AM', exitTime: '4:00 PM', entryHour: 8, exitHour: 16, totalHours: 8, salary: 23000, allowance: 3000, allowanceDetail: '1000 ترکیب + 1500 پیٹرول + 500 موبائل', perDaySalary: Math.round(23000 / 26), perHourSalary: Math.round(23000 / 26 / 8), perMinuteSalary: 23000 / 26 / 8 / 60, phone: '03138657703', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: '4 June 2025', setupDate: '2026-04-01', setupComplete: true },
    3: { id: 3, nameUr: 'محمد منیب صابر', nameEn: 'Muhammad Muneeb Sabir', roleUr: 'مدرس - بلال مسجد', roleEn: 'Mudarris - Bilal Masjid', entryTime: '8:00 AM', exitTime: '11:00 AM', entryHour: 8, exitHour: 11, totalHours: 3, salary: 8000, perDaySalary: Math.round(8000 / 26), perHourSalary: Math.round(8000 / 26 / 3), perMinuteSalary: 8000 / 26 / 3 / 60, phone: '03152643153', email: 'muneebattari527@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'October 2025', setupDate: '2026-02-26', setupComplete: true },
    4: { id: 4, nameUr: 'مدثر رضا (1)', nameEn: 'Mudassir Raza (1)', roleUr: 'مدرس — نیا آباد صبح', roleEn: 'Mudaris — Nayabad Subha', entryTime: '8:00 AM', exitTime: '11:00 AM', entryHour: 8, exitHour: 11, totalHours: 3, salary: 8000, allowance: 500, perDaySalary: Math.round(8000 / 26), perHourSalary: Math.round(8000 / 26 / 3), perMinuteSalary: 8000 / 26 / 3 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-01', setupComplete: true },
    5: { id: 5, nameUr: 'مدثر رضا (2)', nameEn: 'Mudassir Raza (2)', roleUr: 'مدرس — نیا آباد دوپہر', roleEn: 'Mudaris — Nayabad Dopher', entryTime: '2:00 PM', exitTime: '4:00 PM', entryHour: 14, exitHour: 16, totalHours: 2, salary: 7500, allowance: 500, perDaySalary: Math.round(7500 / 26), perHourSalary: Math.round(7500 / 26 / 2), perMinuteSalary: 7500 / 26 / 2 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-05', setupComplete: true },
    6: { id: 6, nameUr: 'مدثر رضا (3)', nameEn: 'Mudassir Raza (3)', roleUr: 'عطیہ — موسیٰ لائن', roleEn: 'Aattiya — Musa line', entryTime: '11:15 AM', exitTime: '1:15 PM', entryHour: 11.25, exitHour: 13.25, totalHours: 2, salary: 6500, perDaySalary: Math.round(6500 / 26), perHourSalary: Math.round(6500 / 26 / 2), perMinuteSalary: 6500 / 26 / 2 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-05', setupComplete: true },
    7: { id: 7, nameUr: 'عبید رضا (1)', nameEn: 'Ubaid Raza (1)', roleUr: 'مدرس — نیا آباد', roleEn: 'Mudaris (Nayabad)', entryTime: '2:00 PM', exitTime: '4:00 PM', entryHour: 14, exitHour: 16, totalHours: 2, salary: 7200, allowance: 500, perDaySalary: Math.round(7200 / 26), perHourSalary: Math.round(7200 / 26 / 2), perMinuteSalary: 7200 / 26 / 2 / 60, phone: '03269676389', email: 'ubaidattari0326@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2023', setupDate: '2026-03-05', setupComplete: true },
    
    // ===== PENDING SETUP (8-23) — Basic info only =====
    8:  { id: 8,  nameUr: 'عبید رضا (2)', nameEn: 'Ubaid Raza (2)', roleUr: 'مدرس — موسیٰ لائن', roleEn: 'Mudaris (Mosalane)', entryTime: '7:00 AM', exitTime: '9:00 AM', entryHour: 7, exitHour: 9, totalHours: 2, salary: 6600, allowance: 1500, allowanceDetail: '500 الاؤنس + 1000 پیٹرول', perDaySalary: Math.round(6600 / 26), perHourSalary: Math.round(6600 / 26 / 2), perMinuteSalary: 6600 / 26 / 2 / 60, phone: '03269676389', email: 'ubaidattari0326@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2023', setupDate: '2026-03-13', setupComplete: true },
    9:  { id: 9,  nameUr: 'عبید رضا (3)', nameEn: 'Ubaid Raza (3)', roleUr: 'تحریر', roleEn: 'Tharir', entryTime: '11:00 AM', exitTime: '12:00 PM', entryHour: 11, exitHour: 12, totalHours: 1, salary: 3500, perDaySalary: Math.round(3500 / 26), perHourSalary: Math.round(3500 / 26 / 1), perMinuteSalary: 3500 / 26 / 1 / 60, phone: '03269676389', email: 'ubaidattari0326@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2023', setupDate: '2026-03-16', setupComplete: true },
    10: { id: 10, nameUr: 'محمد رضوان حسین', nameEn: 'Muhammad Rizwan Hussain', roleUr: 'پنچسر', roleEn: 'Panchser', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 10000, allowance: 0, perDaySalary: Math.round(10000 / 26), perHourSalary: 0, perMinuteSalary: 0, phone: '03190423371', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: 'October 2025', setupDate: '2026-03-26', setupComplete: true },
    11: { id: 11, nameUr: 'محمد کاشف عطاری', nameEn: 'Muhammad Kashif Attari', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[11], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    12: { id: 12, nameUr: 'محمد ہاشم', nameEn: 'Muhammad Hashim', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[12], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    13: { id: 13, nameUr: 'احمد شاہ', nameEn: 'Ahmed Shah', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[13], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    14: { id: 14, nameUr: 'جواد', nameEn: 'Jawad', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[14], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    15: { id: 15, nameUr: 'حنظلہ طاہر', nameEn: 'Hanzalah Tahir', roleUr: 'ڈیولپر', roleEn: 'Developer', entryTime: 'Remote', exitTime: 'Remote', entryHour: 0, exitHour: 0, totalHours: 3, salary: 15000, isRemote: true, perDaySalary: Math.round(15000 / 26), perHourSalary: Math.round(15000 / 26 / 3), perMinuteSalary: 15000 / 26 / 3 / 60, phone: '03018544514', email: 'hanzalahtahir93@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2026', setupDate: '2026-04-01', setupComplete: true },
    16: { id: 16, nameUr: 'قاری کاشف جنید', nameEn: 'Qari Kashif Junaid', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[16], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    17: { id: 17, nameUr: 'عبد القدوس', nameEn: 'Abdul Qudus', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[17], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    18: { id: 18, nameUr: 'محمد دلاور رضا', nameEn: 'Muhammad Dilawar Raza', roleUr: 'نائب ناظم', roleEn: 'Naib Nazim', entryTime: '7:30 AM', exitTime: '4:00 PM', entryHour: 7.5, exitHour: 16, totalHours: 8.5, salary: 37000, allowance: 1500, allowanceDetail: '1000 ترکیب + 500 موبائل', perDaySalary: Math.round(37000 / 26), perHourSalary: Math.round(37000 / 26 / 8.5), perMinuteSalary: 37000 / 26 / 8.5 / 60, phone: '03072784559', email: 'attaridilawar510@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: '2018', setupDate: '2026-03-25', setupComplete: true },
    19: { id: 19, nameUr: 'شعیب', nameEn: 'Shoaib', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[19], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    20: { id: 20, nameUr: 'محمد علیان', nameEn: 'Muhammad Aliyan', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[20], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    21: { id: 21, nameUr: 'احمد', nameEn: 'Ahmed', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[21], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    22: { id: 22, nameUr: 'غلام قادر', nameEn: 'Ghulam Qadir', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[22], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    23: { id: 23, nameUr: 'محمد اکرم عطاری (2)', nameEn: 'Muhammad Akram Attari (2)', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: emails[23], city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
};

export const pushSingleStaff = async (staffId) => {
    try {
        const staff = staffData[staffId];

        if (!staff) {
            throw new Error(`Staff ${staffId} not found in staffData`);
        }

        await setDoc(doc(db, 'staff', String(staff.id)), staff);
        return true;
    } catch (error) {
        console.error(`Single staff push failed for ${staffId}:`, error);
        return false;
    }
};

export const migrateStaff = async () => {
    try {
        for (const key in staffData) {
            const staff = staffData[key];
            const strId = String(staff.id);
            await setDoc(doc(db, 'staff', strId), staff);
        }

        return true;
    } catch (error) {
        console.error("Migration failed:", error);
        return false;
    }
};
