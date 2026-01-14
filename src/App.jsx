import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import DeveloperIntro from './components/DeveloperIntro';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import AttendanceSchedule from './pages/AttendanceSchedule';
import AttendanceSummary from './pages/AttendanceSummary';
import DailyAttendance from './pages/DailyAttendance';

/**
 * App Component - Clean URL Structure with Asataza Dropdown Routes
 */
function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('introShown');
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    if (showIntro) {
      sessionStorage.setItem('introShown', 'true');
    }
  }, [showIntro]);

  if (showIntro) {
    return <DeveloperIntro onComplete={() => setShowIntro(false)} />;
  }

  return (
    <HelmetProvider>
      <BrowserRouter>
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
            <Route path="/teachers/schedule" element={<AttendanceSchedule />} />
            <Route path="/teachers/summary" element={<AttendanceSummary />} />
            <Route path="/teachers/daily" element={<DailyAttendance />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
