import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// Full staff data: 12 completed + 10 pending (Total 22)
export const staffData = {
    // ===== COMPLETED SETUP (1-12) =====
    1: { id: 1, nameUr: 'حنظلہ طاہر', nameEn: 'Hanzalah Tahir', roleUr: 'ڈیولپر', roleEn: 'Developer', entryTime: 'Remote', exitTime: 'Remote', entryHour: 0, exitHour: 0, totalHours: 3, salary: 15000, isRemote: true, perDaySalary: Math.round(15000 / 26), perHourSalary: Math.round(15000 / 26 / 3), perMinuteSalary: 15000 / 26 / 3 / 60, phone: '03018544514', email: 'hanzalahtahir93@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2026', setupDate: '2026-01-01', setupComplete: true },
    2: { id: 2, nameUr: 'محمد اکرم عطاری (1)', nameEn: 'Muhammad Akram Attari (1)', roleUr: 'نائب ناظم', roleEn: 'Naib Nazim', entryTime: '8:00 AM', exitTime: '4:00 PM', entryHour: 8, exitHour: 16, totalHours: 8, salary: 26620, allowance: 3500, allowanceDetail: '2000 پیٹرول + 1000 ترکیب + 500 موبائل', perDaySalary: Math.round(26620 / 26), perHourSalary: Math.round(26620 / 26 / 8), perMinuteSalary: 26620 / 26 / 8 / 60, phone: '03128593301', email: 'ishaqakram67@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'October 2020', setupDate: '2026-02-01', setupComplete: true },
    3: { id: 3, nameUr: 'قاری سید عمیر عطاری', nameEn: 'Qari Syed Umair Attari', roleUr: 'مدرسہ ناظم حسین آباد', roleEn: 'Madrasa Nazim Hussainabad', entryTime: '8:00 AM', exitTime: '4:00 PM', entryHour: 8, exitHour: 16, totalHours: 8, salary: 23000, allowance: 3000, allowanceDetail: '1000 ترکیب + 1500 پیٹرول + 500 موبائل', perDaySalary: Math.round(23000 / 26), perHourSalary: Math.round(23000 / 26 / 8), perMinuteSalary: 23000 / 26 / 8 / 60, phone: '03138657703', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: '4 June 2025', setupDate: '2026-04-01', setupComplete: true },
    4: { id: 4, nameUr: 'محمد منیب صابر', nameEn: 'Muhammad Muneeb Sabir', roleUr: 'مدرس - بلال مسجد', roleEn: 'Mudarris - Bilal Masjid', entryTime: '8:00 AM', exitTime: '11:00 AM', entryHour: 8, exitHour: 11, totalHours: 3, salary: 8000, perDaySalary: Math.round(8000 / 26), perHourSalary: Math.round(8000 / 26 / 3), perMinuteSalary: 8000 / 26 / 3 / 60, phone: '03152643153', email: 'muneebattari527@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'October 2025', setupDate: '2026-02-26', setupComplete: true },
    5: { id: 5, nameUr: 'مدثر رضا (1)', nameEn: 'Mudassir Raza (1)', roleUr: 'مدرس — نیا آباد صبح', roleEn: 'Mudaris — Nayabad Subha', entryTime: '8:00 AM', exitTime: '11:00 AM', entryHour: 8, exitHour: 11, totalHours: 3, salary: 8000, allowance: 500, perDaySalary: Math.round(8000 / 26), perHourSalary: Math.round(8000 / 26 / 3), perMinuteSalary: 8000 / 26 / 3 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-01', setupComplete: true },
    6: { id: 6, nameUr: 'مدثر رضا (2)', nameEn: 'Mudassir Raza (2)', roleUr: 'مدرس — نیا آباد دوپہر', roleEn: 'Mudaris — Nayabad Dopher', entryTime: '2:00 PM', exitTime: '4:00 PM', entryHour: 14, exitHour: 16, totalHours: 2, salary: 7500, allowance: 500, perDaySalary: Math.round(7500 / 26), perHourSalary: Math.round(7500 / 26 / 2), perMinuteSalary: 7500 / 26 / 2 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-05', setupComplete: true },
    7: { id: 7, nameUr: 'مدثر رضا (3)', nameEn: 'Mudassir Raza (3)', roleUr: 'عطیہ — موسیٰ لائن', roleEn: 'Aattiya — Musa line', entryTime: '11:15 AM', exitTime: '1:15 PM', entryHour: 11.25, exitHour: 13.25, totalHours: 2, salary: 6500, perDaySalary: Math.round(6500 / 26), perHourSalary: Math.round(6500 / 26 / 2), perMinuteSalary: 6500 / 26 / 2 / 60, phone: '03243499859', email: 'mudassirrazachishti@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'August 2025', setupDate: '2026-03-05', setupComplete: true },
    8: { id: 8, nameUr: 'عبید رضا (1)', nameEn: 'Ubaid Raza (1)', roleUr: 'مدرس — نیا آباد', roleEn: 'Mudaris (Nayabad)', entryTime: '2:00 PM', exitTime: '4:00 PM', entryHour: 14, exitHour: 16, totalHours: 2, salary: 7200, allowance: 500, perDaySalary: Math.round(7200 / 26), perHourSalary: Math.round(7200 / 26 / 2), perMinuteSalary: 7200 / 26 / 2 / 60, phone: '03269676389', email: 'ubaidattari0326@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2023', setupDate: '2026-03-05', setupComplete: true },
    9: { id: 9, nameUr: 'عبید رضا (2)', nameEn: 'Ubaid Raza (2)', roleUr: 'مدرس — موسیٰ لائن', roleEn: 'Mudaris (Mosalane)', entryTime: '7:00 AM', exitTime: '9:00 AM', entryHour: 7, exitHour: 9, totalHours: 2, salary: 6600, allowance: 1500, allowanceDetail: '500 الاؤنس + 1000 پیٹرول', perDaySalary: Math.round(6600 / 26), perHourSalary: Math.round(6600 / 26 / 2), perMinuteSalary: 6600 / 26 / 2 / 60, phone: '03269676389', email: 'ubaidattari0326@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2023', setupDate: '2026-03-13', setupComplete: true },
    10: { id: 10, nameUr: 'عبید رضا (3)', nameEn: 'Ubaid Raza (3)', roleUr: 'تحریر', roleEn: 'Tharir', entryTime: '11:00 AM', exitTime: '12:00 PM', entryHour: 11, exitHour: 12, totalHours: 1, salary: 3500, perDaySalary: Math.round(3500 / 26), perHourSalary: Math.round(3500 / 26 / 1), perMinuteSalary: 3500 / 26 / 1 / 60, phone: '03269676389', email: 'ubaidattari0326@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: 'January 2023', setupDate: '2026-03-16', setupComplete: true },
    11: { id: 11, nameUr: 'محمد رضوان حسین', nameEn: 'Muhammad Rizwan Hussain', roleUr: 'پنچسر', roleEn: 'Panchser', entryTime: '1:30 PM', exitTime: '4:00 PM', entryHour: 13.5, exitHour: 16, totalHours: 2.5, salary: 10000, allowance: 0, perDaySalary: Math.round(10000 / 26), perHourSalary: Math.round(10000 / 26 / 2.5), perMinuteSalary: 10000 / 26 / 2.5 / 60, phone: '03190423371', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: 'October 2025', setupDate: '2026-03-26', setupComplete: true },
    12: { id: 12, nameUr: 'محمد دلاور رضا', nameEn: 'Muhammad Dilawar Raza', roleUr: 'نائب ناظم', roleEn: 'Naib Nazim', entryTime: '7:30 AM', exitTime: '4:00 PM', entryHour: 7.5, exitHour: 16, totalHours: 8.5, salary: 37000, allowance: 1500, allowanceDetail: '1000 ترکیب + 500 موبائل', perDaySalary: Math.round(37000 / 26), perHourSalary: Math.round(37000 / 26 / 8.5), perMinuteSalary: 37000 / 26 / 8.5 / 60, phone: '03072784559', email: 'attaridilawar510@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: '2018', setupDate: '2026-03-25', setupComplete: true },

    // ===== PENDING SETUP (13-22) =====
    13: { id: 13, nameUr: 'محمد کاشف عطاری', nameEn: 'Muhammad Kashif Attari', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    14: { id: 14, nameUr: 'احمد شاہ', nameEn: 'Ahmed Shah', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    15: { id: 15, nameUr: 'جواد', nameEn: 'Jawad', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: 'jawadsoomrowork@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    16: { id: 16, nameUr: 'قاری کاشف جنید', nameEn: 'Qari Kashif Junaid', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: 'balochjuni010@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    17: { id: 17, nameUr: 'عبد القدوس', nameEn: 'Abdul Qudus', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    18: { id: 18, nameUr: 'شعیب', nameEn: 'Shoaib', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: 'princeShoaibkhan990@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    19: { id: 19, nameUr: 'محمد علیان', nameEn: 'Muhammad Aliyan', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: 'aliyn00177@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    20: { id: 20, nameUr: 'احمد', nameEn: 'Ahmed', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: 'ar8693524@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    21: { id: 21, nameUr: 'غلام قادر', nameEn: 'Ghulam Qadir', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: '-', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
    22: { id: 22, nameUr: 'محمد اکرم عطاری (2)', nameEn: 'Muhammad Akram Attari (2)', roleUr: '-', roleEn: '-', entryTime: '-', exitTime: '-', entryHour: 0, exitHour: 0, totalHours: 0, salary: 0, perDaySalary: 0, perHourSalary: 0, perMinuteSalary: 0, phone: '-', email: 'ishaqakram67@gmail.com', city: 'Karachi', country: 'Pakistan', joinDate: '-', setupDate: '', setupComplete: false },
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

export const deleteStaff = async (staffId) => {
    try {
        await deleteDoc(doc(db, 'staff', String(staffId)));
        console.log(`Staff ${staffId} deleted from Firebase!`);
        return true;
    } catch (error) {
        console.error(`Delete failed for ${staffId}:`, error);
        return false;
    }
};

// ONE-TIME: Sync all 22 staff to Firebase (delete old + push new)
export const migrateStaff = async () => {
    try {
        // 1. Delete ALL old staff docs
        const snapshot = await getDocs(collection(db, 'staff'));
        for (const docSnap of snapshot.docs) {
            await deleteDoc(docSnap.ref);
        }
        console.log(`Deleted ${snapshot.size} old staff docs.`);

        // 2. Push all 22 new staff
        let count = 0;
        for (const key in staffData) {
            const staff = staffData[key];
            await setDoc(doc(db, 'staff', String(staff.id)), staff);
            count++;
        }
        console.log(`Pushed ${count} new staff docs. Migration complete!`);
        return true;
    } catch (error) {
        console.error("Staff migration failed:", error);
        return false;
    }
};
