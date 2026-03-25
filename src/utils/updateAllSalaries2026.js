// One-time script to update ALL staff salaries to 2026 Ijara rates
// Run: node src/utils/updateAllSalaries2026.js

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

// Staff salary updates based on 2026 Ijara sheet
const updates = [
    {
        id: '1',
        name: 'Muhammad Akram Attari (1)',
        changes: {
            // Salary stays same: 26620 (Moosalane)
            // NEW: Adding allowance from Nayabad: 3500
            allowance: 3500,
            allowanceDetail: '2000 پیٹرول + 1000 ترکیب + 500 موبائل',
        }
    },
    {
        id: '3',
        name: 'Muhammad Muneeb Sabir',
        changes: {
            // Bilal Masjid: 7500 → 8000
            salary: 8000,
            perDaySalary: Math.round(8000 / 26),
            perHourSalary: Math.round(8000 / 26 / 3),
            perMinuteSalary: 8000 / 26 / 3 / 60,
        }
    },
    {
        id: '4',
        name: 'Mudassir Raza (1)',
        changes: {
            // Nayabad Subha: 7500 → 8000 + 500 allowance
            salary: 8000,
            allowance: 500,
            perDaySalary: Math.round(8000 / 26),
            perHourSalary: Math.round(8000 / 26 / 3),
            perMinuteSalary: 8000 / 26 / 3 / 60,
        }
    },
    {
        id: '5',
        name: 'Mudassir Raza (2)',
        changes: {
            // Nayabad Dopher: 6000 → 7500 + 500 allowance
            salary: 7500,
            allowance: 500,
            perDaySalary: Math.round(7500 / 26),
            perHourSalary: Math.round(7500 / 26 / 2),
            perMinuteSalary: 7500 / 26 / 2 / 60,
        }
    },
    {
        id: '6',
        name: 'Mudassir Raza (3)',
        changes: {
            // Attiyat: 7500 → 6500
            salary: 6500,
            perDaySalary: Math.round(6500 / 26),
            perHourSalary: Math.round(6500 / 26 / 2),
            perMinuteSalary: 6500 / 26 / 2 / 60,
        }
    },
    {
        id: '7',
        name: 'Ubaid Raza (1)',
        changes: {
            // Nayabad: 6500 → 7200 + 500 allowance
            salary: 7200,
            allowance: 500,
            perDaySalary: Math.round(7200 / 26),
            perHourSalary: Math.round(7200 / 26 / 2),
            perMinuteSalary: 7200 / 26 / 2 / 60,
        }
    },
    {
        id: '8',
        name: 'Ubaid Raza (2)',
        changes: {
            // Moosalane: 6500 → 6600 + 500 allowance + 1000 petrol
            salary: 6600,
            allowance: 1500,
            allowanceDetail: '500 الاؤنس + 1000 پیٹرول',
            perDaySalary: Math.round(6600 / 26),
            perHourSalary: Math.round(6600 / 26 / 2),
            perMinuteSalary: 6600 / 26 / 2 / 60,
        }
    },
    {
        id: '9',
        name: 'Ubaid Raza (3)',
        changes: {
            // Moosalane Tharir: 2500 → 3500
            salary: 3500,
            perDaySalary: Math.round(3500 / 26),
            perHourSalary: Math.round(3500 / 26 / 1),
            perMinuteSalary: 3500 / 26 / 1 / 60,
        }
    },
];

async function updateAllSalaries() {
    console.log('🔄 Updating staff salaries to 2026 Ijara rates...\n');

    for (const staff of updates) {
        try {
            await setDoc(doc(db, 'staff', staff.id), staff.changes, { merge: true });
            const sal = staff.changes.salary ? `Rs ${staff.changes.salary}` : '(no change)';
            const alw = staff.changes.allowance ? ` + Rs ${staff.changes.allowance} allowance` : '';
            console.log(`✅ Staff ${staff.id} (${staff.name}): Salary ${sal}${alw}`);
        } catch (error) {
            console.error(`❌ Staff ${staff.id} (${staff.name}): FAILED -`, error.message);
        }
    }

    console.log('\n🎉 All salary updates complete!');
    process.exit(0);
}

updateAllSalaries();
