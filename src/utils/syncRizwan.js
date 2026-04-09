// One-time script to sync Rizwan (ID 10) to Firebase
// Run: node src/utils/syncRizwan.js (or import in browser console)

import { pushSingleStaff } from './migrateStaffToFirebase.js';

const syncRizwan = async () => {
    console.log('🔄 Syncing Rizwan (ID 10) to Firebase...');
    const result = await pushSingleStaff(10);
    if (result) {
        console.log('✅ Rizwan synced successfully!');
        console.log('   Name: Muhammad Rizwan Hussain');
        console.log('   Timing: 1:30 PM - 4:00 PM');
        console.log('   Salary: Rs 10,000');
        console.log('   setupComplete: true');
    } else {
        console.error('❌ Sync failed!');
    }
};

export default syncRizwan;
