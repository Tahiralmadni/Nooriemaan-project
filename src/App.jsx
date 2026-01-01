import Login from './pages/Login';

/**
 * App Component
 * NooriEmaan Digital Portal - Main Application Entry
 * 
 * TODO: Add React Router for navigation between pages
 * - /login -> Login page
 * - /dashboard -> Dashboard (after authentication)
 * - /students -> Student management
 * - etc.
 */
function App() {
    return (
        <>
            {/* 
        Currently rendering Login page directly.
        Replace with React Router setup when implementing full navigation:
        
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      */}
            <Login />
        </>
    );
}

export default App;
