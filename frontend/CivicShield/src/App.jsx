import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import ReportPage from "./pages/reportpage";
import DashboardPage from "./pages/dashboard";
import AboutPage from "./pages/aboutpage";
import CitizenLoginPage from "./pages/citizenloginpage";
import AdminLoginPage from "./pages/adminloginpage";
import AdminDashboardPage from "./pages/admindashboard";
import MunicipalLoginPage from "./pages/municipalloginpage";
import MunicipalDashboardPage from "./pages/municipaldashboard";
import WomenSafetyLoginPage from "./pages/womensafetyloginpage";
import WomenSafetyDashboardPage from "./pages/womensafetydashboard";
import { logoutUser, getStoredUser, isAuthenticated } from "./api";
import "./index.css";

const ROLE_CONFIG = [
  { id: 'citizen', label: 'Citizen', icon: '👤', path: '/citizen', dashboard: '/dashboard' },
  { id: 'admin', label: 'Admin', icon: '⚙', path: '/admin', dashboard: '/admin-dashboard' },
  { id: 'municipal', label: 'Municipal', icon: '🏛', path: '/municipal', dashboard: '/municipal-dashboard' },
  { id: 'safety', label: 'Safety', icon: '🛡', path: '/women-safety', dashboard: '/women-safety-dashboard' }
];

// Protected Route Component
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      setIsAuth(true);
    } else {
      navigate("/citizen-login");
    }
    setLoading(false);
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  return isAuth ? children : null;
}

export default function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const { pathname } = useLocation();
  const [toast, setToast] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Toast function
  useEffect(() => {
    window.showToast = (message, type = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    };
  }, []);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setIsAuth(true);
    }
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setIsAuth(false);
    navigate("/citizen-login");
  };

  const handleLoginClick = () => {
    navigate("/citizen-login");
  };


  const isActive = (path) => pathname === path;
  const isRoleActive = (path) => pathname.includes(path);

  return (
    <div className="app-container">
      <header className="top-navbar">
        <Link to="/" className="logo-container">
          <div className="logo-text">CivicShield</div>
        </Link>
        
        <nav className="nav-links">
          {isAuth && (
            <>
              <Link to="/" className={isActive("/") ? "active" : ""}>Report Issue</Link>
              <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>Dashboard</Link>
              <Link to="/about" className={isActive("/about") ? "active" : ""}>About</Link>
            </>
          )}
        </nav>

        <div className={`nav-roles ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="mobile-only-header" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <span>Select Role</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          
          <div className="role-tabs-container">
            {ROLE_CONFIG.map(role => {
              const isActive = pathname.includes(role.id) || (role.id === 'citizen' && pathname === '/dashboard');
              const targetPath = (isAuth && user?.role === role.id) ? role.dashboard : `${role.path}-login`;
              
              return (
                <Link 
                  key={role.id}
                  to={targetPath} 
                  className={`role-tab ${isActive ? "active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="role-icon">{role.icon}</span>
                  <span className="role-label">{role.label}</span>
                </Link>
              );
            })}
            
            {isAuth && (
              <button onClick={handleLogout} className="role-tab logout-tab">
                <span className="role-icon">🚪</span>
                <span className="role-label">Logout</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/citizen-login" element={<CitizenLoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/municipal-login" element={<MunicipalLoginPage />} />
          <Route path="/municipal-dashboard" element={<MunicipalDashboardPage />} />
          <Route path="/women-safety-login" element={<WomenSafetyLoginPage />} />
          <Route path="/women-safety-dashboard" element={<WomenSafetyDashboardPage />} />
        </Routes>
      </main>

      {/* Global Toast Component */}
      {toast && (
        <div className={`toast-notification alert-${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">{toast.type === "success" ? "✅" : "❌"}</span>
            <span className="toast-message">{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="toast-close">✕</button>
        </div>
      )}

      <style>{`
        .toast-notification {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 1rem;
          z-index: 10000;
          animation: slideInUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          min-width: 300px;
        }
        .toast-notification.alert-error { border-left: 4px solid #ef4444; }
        .toast-notification.alert-success { border-left: 4px solid #22c55e; }
        .toast-content { display: flex; align-items: center; gap: 0.75rem; flex: 1; }
        .toast-icon { font-size: 1.25rem; }
        .toast-message { font-weight: 600; font-size: 0.9rem; color: #1e293b; }
        .toast-close { background: none; border: none; font-size: 1.1rem; color: #94a3b8; cursor: pointer; padding: 0.25rem; }
        
        @keyframes slideInUp {
          from { transform: translateY(100%) scale(0.9); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        main { animation: pageFadeIn 0.5s ease-out; }
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
