import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './src/config/firebase.js';
import { staffData } from './src/utils/migrateStaffToFirebase.js';

const forceSync = async () => {
    try {
        console.log("🔥 Force Sync Started...");
        
        // 1. Fetch current docs
        const snapshot = await getDocs(collection(db, 'staff'));
        console.log(`🗑️ Found ${snapshot.size} existing staff records. Trashing them...`);
        
        let deleteCount = 0;
        for (const docSnap of snapshot.docs) {
            await deleteDoc(docSnap.ref);
            deleteCount++;
        }
        console.log(`✅ Deleted ${deleteCount} old records.`);

        // 2. Add 22 new records
        console.log(`⏳ Pushing ${Object.keys(staffData).length} new records from staffData object...`);
        let pushCount = 0;
        
        // Ensure sequential push instead of parallel to avoid race conditions.
        for (const [key, staff] of Object.entries(staffData)) {
            await setDoc(doc(db, 'staff', String(staff.id)), staff);
            pushCount++;
        }

        console.log(`🎉 SUCCESS! Pushed exactly ${pushCount} staff docs to Firebase.`);
        process.exit(0);
    } catch (e) {
        console.error("❌ ERROR: ", e);
        process.exit(1);
    }
};

forceSync();
