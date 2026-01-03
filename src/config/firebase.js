/**
 * Firebase Configuration - Nooriemaan Digital Portal
 * 
 * This file contains Firebase configuration and authentication setup.
 * Replace the firebaseConfig values with your actual Firebase project credentials.
 */

import { initializeApp } from 'firebase/app';
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

// Firebase Configuration
// TODO: Replace with your actual Firebase project credentials
const firebaseConfig = {
    apiKey: "AIzaSyAx9BkHtbV5Gk67MJKA9-mePZLN3CCf4ew",
    authDomain: "nooeriemaan.firebaseapp.com",
    projectId: "nooeriemaan",
    storageBucket: "nooeriemaan.firebasestorage.app",
    messagingSenderId: "870308337912",
    appId: "1:870308337912:web:c65ac458717bebaf1f830d",
    measurementId: "G-TK02LBCKH6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Sign in user with GR Number and Password
 * GR Number is converted to email format: grNumber@nooriemaan.edu
 * 
 * @param {string} grNumber - Student/Staff GR Number
 * @param {string} password - User password
 * @returns {Promise<Object>} - User credentials and profile data
 */
export const loginWithGrNumber = async (grNumber, password) => {
    try {
        // Convert GR Number to email format for Firebase Auth
        const email = `${grNumber.toLowerCase().trim()}@nooriemaan.edu`;

        // Sign in with Firebase Auth
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    grNumber: grNumber,
                    ...userData
                }
            };
        } else {
            // User authenticated but no profile exists
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    grNumber: grNumber
                }
            };
        }
    } catch (error) {
        console.error('Login error:', error);

        // Map Firebase errors to user-friendly messages
        let errorMessage = 'login_failed';

        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = 'invalid_credentials';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'too_many_attempts';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'network_error';
                break;
            case 'auth/user-disabled':
                errorMessage = 'account_disabled';
                break;
            default:
                errorMessage = 'login_failed';
        }

        return {
            success: false,
            error: errorMessage,
            errorCode: error.code
        };
    }
};

/**
 * Sign out current user
 * @returns {Promise<Object>}
 */
export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset email
 * @param {string} grNumber - User's GR Number
 * @returns {Promise<Object>}
 */
export const resetPassword = async (grNumber) => {
    try {
        const email = `${grNumber.toLowerCase().trim()}@nooriemaan.edu`;
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (error) {
        console.error('Password reset error:', error);
        return { success: false, error: error.code };
    }
};

/**
 * Get current authenticated user
 * @returns {Object|null} - Current user or null
 */
export const getCurrentUser = () => {
    return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Callback function to handle auth state changes
 * @returns {Function} - Unsubscribe function
 */
export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * Create a new user account (Admin only)
 * This would typically be done through Firebase Admin SDK on backend
 * 
 * @param {Object} userData - User data including grNumber, name, role, etc.
 */
export const createUserProfile = async (uid, userData) => {
    try {
        await setDoc(doc(db, 'users', uid), {
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Create profile error:', error);
        return { success: false, error: error.message };
    }
};

export default app;
