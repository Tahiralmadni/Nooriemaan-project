import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

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
                    const perHourSalary = Math.round(salary / 26 / (totalHours || 1));
                    const perMinuteSalary = salary / 26 / (totalHours || 1) / 60;

                    const staffObj = {
                        ...data,
                        id,
                        perDaySalary,
                        perHourSalary,
                        perMinuteSalary,
                    };

                    dataObj[id] = staffObj;

                    // Only show setupComplete staff in dropdown lists
                    // Override for ID 1 (Hanzalah) to ensure he's always visible as a remote dev
                    if (data.setupComplete || id === 1) {
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

                // Sort list by ID
                listArr.sort((a, b) => a.id - b.id);

                setStaffData(dataObj);
                setStaffList(listArr);
            } catch (error) {
                console.error('Error fetching staff data:', error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    return { staffData, staffList, loading };
};

export default useStaffData;
