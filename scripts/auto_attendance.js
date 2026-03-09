import admin from "firebase-admin";
import { readFileSync } from "fs";

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
    readFileSync("C:/Users/tahir/OneDrive/Desktop/Nooriemaan project/serviceAccountKey.json", "utf8")
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const staffId = 7;
const staffName = "Ubaid Raza";
const salaryPerMin = 6500 / 26 / 2 / 60; // Role: 2 hrs, 26 days

async function addRecord(dateString, status, isLate = false, lateMinutes = 0, isEarlyLeave = false, earlyMinutes = 0, reason = "") {
    const [day, month, year] = dateString.split('/');
    const dateObj = new Date(`${year}-${month}-${day}T12:00:00Z`); // Noon UTC

    // Ubaid entry time is 2:00 PM
    let markedTime = "2:00 PM";
    if (isLate && lateMinutes === 15) markedTime = "2:15 PM";
    if (isLate && lateMinutes === 25) markedTime = "2:25 PM";
    if (status !== 'present') markedTime = "";

    let deduction = 0;
    if (status === 'present' && isLate && lateMinutes > 0) {
        deduction = Math.round(lateMinutes * salaryPerMin);
    }

    const docId = `att_${staffId}_${year}${month}${day}`;

    await db.collection("attendance").doc(docId).set({
        staffId,
        staffName,
        status,
        reason,
        markedTime,
        date: dateObj,
        isLate,
        lateMinutes,
        isEarlyLeave,
        earlyMinutes,
        deduction,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`[Success] ${dateString} -> ${status} | Late: ${lateMinutes}m | Ded: Rs ${deduction}`);
}

async function run() {
    try {
        console.log("Starting bulk insertion for Ubaid Raza (1)...");
        // Requirements: 9 days total. 5 days present, 2 days late (15m, 25m), 1 absent.
        // March 1 to March 9 = 9 calendar days.

        // Mar 1 (Sun)
        await addRecord("01/03/2026", "holiday", false, 0, false, 0, "Sunday");

        // Mar 2 to Mar 6 (5 days Present)
        await addRecord("02/03/2026", "present");
        await addRecord("03/03/2026", "present");
        await addRecord("04/03/2026", "present");
        await addRecord("05/03/2026", "present");
        await addRecord("06/03/2026", "present");

        // Mar 7 (1 day Absent)
        await addRecord("07/03/2026", "absent", false, 0, false, 0, "No reason provided");

        // Mar 8 (Sun)
        await addRecord("08/03/2026", "holiday", false, 0, false, 0, "Sunday");

        // Mar 9 (Present, Late 15 mins) (Oops, user asked for 2 late days. This takes 10 days total? The user said "9 din ka kr do. 5 din hazri, 2 din late, 1 din gher hazir". 5+2+1 = 8 working days. March 1 to 9 has 2 Sundays. Let's make one of the Present days Late to fit within 9 days.)
    } catch (e) {
        console.error("Error:", e);
    }
}

async function correctRun() {
    try {
        // March 1 is Sunday
        await addRecord("01/03/2026", "holiday", false, 0, false, 0, "Sunday");

        // Present (4 days normal)
        await addRecord("02/03/2026", "present");
        await addRecord("03/03/2026", "present");
        await addRecord("04/03/2026", "present");
        await addRecord("05/03/2026", "present");

        // Present (Late 15 min)
        await addRecord("06/03/2026", "present", true, 15);

        // Present (Late 25 min)
        await addRecord("07/03/2026", "present", true, 25);

        // March 8 is Sunday
        await addRecord("08/03/2026", "holiday", false, 0, false, 0, "Sunday");

        // Absent
        await addRecord("09/03/2026", "absent", false, 0, false, 0, "Absent");

        console.log("Done inserting past data!");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

correctRun();
