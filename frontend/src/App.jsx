import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import OAuthCallback from './pages/OAuthCallback';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import DeviceManager from './pages/DeviceManager';
import DeviceDetail from './pages/DeviceDetail';
import TechnicianTracker from './pages/TechnicianTracker';
import Analytics from './pages/Analytics';
import Automation from './pages/Automation';
import Unauthorized from './pages/Unauthorized';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// AnimatedRoutes component to handle page transitions
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/verify-otp" element={<PageTransition><VerifyOtp /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/oauth/callback" element={<PageTransition><OAuthCallback /></PageTransition>} />
        <Route path="/unauthorized" element={<PageTransition><Unauthorized /></PageTransition>} />
        <Route
          path="/dashboard"
          element={
            <PageTransition>
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_HOMEOWNER']}>
                <Dashboard />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/admin"
          element={
            <PageTransition>
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/devices"
          element={
            <PageTransition>
              <ProtectedRoute allowedRoles={['ROLE_HOMEOWNER', 'ROLE_ADMIN']}>
                <DeviceManager />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/devices/:deviceId"
          element={
            <PageTransition>
              <ProtectedRoute allowedRoles={['ROLE_HOMEOWNER', 'ROLE_ADMIN']}>
                <DeviceDetail />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/technician"
          element={
            <PageTransition>
              <ProtectedRoute allowedRoles={['ROLE_TECHNICIAN', 'ROLE_ADMIN']}>
                <TechnicianTracker />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/analytics"
          element={
            <PageTransition>
              <ProtectedRoute allowedRoles={['ROLE_HOMEOWNER', 'ROLE_ADMIN']}>
                <Analytics />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route
          path="/automation"
          element={
            <PageTransition>
              <ProtectedRoute allowedRoles={['ROLE_HOMEOWNER', 'ROLE_ADMIN']}>
                <Automation />
              </ProtectedRoute>
            </PageTransition>
          }
        />
        <Route path="/profile" element={<PageTransition><Navigate to="/dashboard" replace /></PageTransition>} />
        <Route path="*" element={<PageTransition><Navigate to="/" replace /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* theme-bg uses CSS var(--bg-color) which switches on .dark/.light on <html> */}
          <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <Navbar />
            <main className="flex-1">
              <AnimatedRoutes />
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
