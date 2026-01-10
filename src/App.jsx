import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DeveloperIntro from './components/DeveloperIntro';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
// import Students from './pages/Students'; // Month 7+ - Abhi nahi

/**
 * App Component
 * NooriEmaan Digital Portal - Main Application Entry
 * Handles: Developer Intro, Remember Me functionality, Routes
 */
function App() {
  const [showIntro, setShowIntro] = useState(() => {
    // Check if intro was already shown in this session
    return !sessionStorage.getItem('introShown');
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is logged in via Remember Me
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  useEffect(() => {
    // Mark intro as shown for this session
    if (showIntro) {
      sessionStorage.setItem('introShown', 'true');
    }
  }, [showIntro]);

  // Show developer intro first
  if (showIntro) {
    return <DeveloperIntro onComplete={() => setShowIntro(false)} />;
  }

  // After intro, show main app routes
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page - "/" */}
        {/* Agar user already logged in hai (Remember Me), seedha dashboard par bhejo */}
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        {/* Dashboard Layout with nested routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          {/* <Route path="students" element={<Students />} /> */}
          {/* Fallback for other routes */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
