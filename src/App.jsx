import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';

/**
 * App Component
 * NooriEmaan Digital Portal - Main Application Entry
 * Routes setup for Login and Dashboard
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Page - "/" */}
        <Route path="/" element={<Login />} />

        {/* Dashboard - "/dashboard" */}
        <Route path="/dashboard" element={<DashboardLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
