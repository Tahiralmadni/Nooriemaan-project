// One-time script to update Staff 18 (Muhammad Dilawar Raza) in Firebase
// Run: node src/utils/updateStaff18.js

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAx9BkHtbV5Gk67MJKA9-mePZLN3CCf4ew",
    authDomain: "nooeriemaan.firebaseapp.com",
    projectId: "nooeriemaan",
    storageBucket: "nooeriemaan.firebasestorage.app",
    messagingSenderId: "870308337912",
    appId: "1:870308337912:web:c65ac458717bebaf1f830d",
    measurementId: "G-TK02LBCKH6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const staff18 = {
    id: 18,
    nameUr: 'محمد دلاور رضا',
    nameEn: 'Muhammad Dilawar Raza',
    roleUr: 'نائب ناظم',
    roleEn: 'Naib Nazim',
    entryTime: '7:30 AM',
    exitTime: '4:00 PM',
    entryHour: 7.5,
    exitHour: 16,
    totalHours: 8.5,
    salary: 37000,
    allowance: 1500,
    allowanceDetail: '1000 ترکیب + 500 موبائل',
    perDaySalary: Math.round(37000 / 26),
    perHourSalary: Math.round(37000 / 26 / 8.5),
    perMinuteSalary: 37000 / 26 / 8.5 / 60,
    phone: '03072784559',
    email: 'attaridilawar510@gmail.com',
    city: 'Karachi',
    country: 'Pakistan',
    joinDate: '2018',
    setupDate: '2026-03-25',
    setupComplete: true
};

async function updateStaff() {
    try {
        await setDoc(doc(db, 'staff', '18'), staff18);
        console.log('✅ Staff 18 (Muhammad Dilawar Raza) updated successfully!');
        console.log('   Salary: Rs', staff18.salary);
        console.log('   Allowance: Rs', staff18.allowance);
        console.log('   Role:', staff18.roleEn, '/', staff18.roleUr);
        console.log('   Timing:', staff18.entryTime, '-', staff18.exitTime);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating staff 18:', error);
        process.exit(1);
    }
}

updateStaff();
