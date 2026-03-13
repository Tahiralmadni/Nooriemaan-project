import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check authentication state from localStorage
    // In a real app, this should ideally be synced with Firebase auth state,
    // but Since App.jsx already syncs Firebase auth to localStorage, we can use it here for immediate redirection.
    const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
