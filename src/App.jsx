import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import NetworkStatus from './components/NetworkStatus';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

// ===== LAZY LOADING — Pages load sirf jab zaroorat ho =====
const DeveloperIntro = lazy(() => import('./components/DeveloperIntro'));
const Login = lazy(() => import('./pages/Login'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const Teachers = lazy(() => import('./pages/Teachers'));
const AttendanceSchedule = lazy(() => import('./pages/AttendanceSchedule'));
const AttendanceSummary = lazy(() => import('./pages/AttendanceSummary'));
const MajmoohiHazri = lazy(() => import('./pages/MajmoohiHazri'));
const DailyAttendance = lazy(() => import('./pages/DailyAttendance'));
const StaffProfile = lazy(() => import('./pages/StaffProfile'));
const AttendanceReports = lazy(() => import('./pages/AttendanceReports'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Blank fallback — sirf background dikhao, gol spinner nahi
const PageFallback = () => (
  <div style={{
    height: '100vh',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)'
  }} />
);

/**
 * App Component - Clean URL Structure with Asataza Dropdown Routes
 */
function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('introShown');
  });

  // Auth state — Firebase onAuthStateChanged + localStorage fallback
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [authLoading, setAuthLoading] = useState(true);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        localStorage.setItem('isLoggedIn', 'true');
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userGR');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showIntro) {
      sessionStorage.setItem('introShown', 'true');
    }
  }, [showIntro]);

  if (showIntro) {
    return (
      <Suspense fallback={<PageFallback />}>
        <DeveloperIntro onComplete={() => setShowIntro(false)} />
      </Suspense>
    );
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
        <NetworkStatus />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Login */}
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />

            {/* All pages inside DashboardLayout */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />

              {/* Teachers/Asataza with sub-routes */}
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/teachers/summary" element={<AttendanceSummary />} />
              <Route path="/teachers/majmoohi" element={<MajmoohiHazri />} />
              <Route path="/teachers/daily" element={<DailyAttendance />} />
              <Route path="/teachers/reports" element={<AttendanceReports />} />
              <Route path="/teachers/profile/:id" element={<StaffProfile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Standalone Pages (with mini-navbar) */}
            <Route path="/teachers/schedule" element={<AttendanceSchedule />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
