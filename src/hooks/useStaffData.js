import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';
import { staffData as localStaffData } from '../utils/migrateStaffToFirebase';

/**
 * Custom hook to fetch staff data from Firebase Firestore.
 * Returns staffData (object keyed by ID), staffList (array for dropdowns), and loading state.
 * Only setupComplete staff appear in staffList for dropdowns.
 */
const useStaffData = () => {
    const [staffData, setStaffData] = useState({});
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'staff'));
                const dataObj = {};
                const listArr = [];

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const id = Number(doc.id);

                    // Compute salary breakdowns
                    const totalHours = data.totalHours || 1;
                    const salary = data.salary || 0;
                    const perDaySalary = Math.round(salary / 26);
                    const perHourSalary = Math.round(salary / 26 / totalHours);
                    const perMinuteSalary = salary / 26 / totalHours / 60;

                    const staffObj = {
                        ...data,
                        id,
                        perDaySalary,
                        perHourSalary,
                        perMinuteSalary,
                    };

                    dataObj[id] = staffObj;

                    // Only show setupComplete staff in dropdown lists
                    // Override for ID 15 (Hanzalah) to ensure he's always visible as a remote dev
                    if (data.setupComplete || id === 15) {
                        listArr.push({
                            id,
                            nameKey: `staff.${id}`,
                            name: data.nameEn || '',
                            nameUr: data.nameUr || '',
                            nameEn: data.nameEn || '',
                            roleUr: data.roleUr || '',
                            roleEn: data.roleEn || '',
                        });
                    }
                });

                // Hanzalah (ID 15) — merge local data to ensure isRemote, setupDate etc are correct
                // No Firebase write here — data already synced
                const hanzalahLocal = localStaffData[15];
                if (hanzalahLocal) {
                    if (!dataObj[15]) {
                        listArr.push({
                            id: 15,
                            nameKey: `staff.15`,
                            name: hanzalahLocal.nameEn,
                            nameUr: hanzalahLocal.nameUr,
                            nameEn: hanzalahLocal.nameEn,
                            roleUr: hanzalahLocal.roleUr,
                            roleEn: hanzalahLocal.roleEn,
                        });
                    }
                    dataObj[15] = { ...dataObj[15], ...hanzalahLocal, id: 15 };
                }

                // Sort list by ID
                listArr.sort((a, b) => a.id - b.id);

                setStaffData(dataObj);
                setStaffList(listArr);
            } catch (error) {
                console.error('Error fetching staff data:', error);
                toast.error('Failed to load staff data: ' + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    return { staffData, staffList, loading };
};

export default useStaffData;
