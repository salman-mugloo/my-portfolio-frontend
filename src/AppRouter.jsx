import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PortfolioApp } from './App';
import AdminLayout from './components/AdminLayout';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Import admin components
import Login from '../admin-panel/src/pages/Login';
import VerifyOTP from '../admin-panel/src/pages/VerifyOTP';
import ForgotPassword from '../admin-panel/src/pages/ForgotPassword';
import ResetPassword from '../admin-panel/src/pages/ResetPassword';
import Dashboard from '../admin-panel/src/pages/Dashboard';
import Projects from '../admin-panel/src/pages/Projects';
import Expertise from '../admin-panel/src/pages/Expertise';
import Skills from '../admin-panel/src/pages/Skills';
import Certifications from '../admin-panel/src/pages/Certifications';
import Resume from '../admin-panel/src/pages/Resume';
import ChangePassword from '../admin-panel/src/pages/ChangePassword';
import Profile from '../admin-panel/src/pages/Profile';
import Features from '../admin-panel/src/pages/Features';
import ContactInfo from '../admin-panel/src/pages/ContactInfo';
import Education from '../admin-panel/src/pages/Education';
import ActivityLogs from '../admin-panel/src/pages/ActivityLogs';
import { clearCSRFToken, fetchCSRFToken, authAPI } from '../admin-panel/src/services/api';

function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = async (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
    // Fetch CSRF token after login
    try {
      const { fetchCSRFToken } = await import('../admin-panel/src/services/api.js');
      // Force refresh to get new token
      await fetchCSRFToken(true);
    } catch (error) {
      console.error('Failed to fetch CSRF token after login:', error);
      // Non-critical, continue anyway
    }
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint for audit logging (non-blocking)
      // If this fails, we still proceed with local logout
      await authAPI.logout();
    } catch (error) {
      // Log error but don't block logout
      console.error('Logout API call failed:', error);
    } finally {
      // Always proceed with local cleanup
      localStorage.removeItem('adminToken');
      clearCSRFToken();
      setIsAuthenticated(false);
      window.location.href = '/cms/login';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Portfolio */}
        <Route path="/" element={<PortfolioApp />} />

        {/* Admin Routes - All wrapped in AdminLayout */}
        <Route path="/cms" element={<AdminLayout />}>
          {/* Redirect /cms to /cms/login */}
          <Route index element={<Navigate to="/cms/login" replace />} />
          
          {/* Public Admin Routes */}
          <Route 
            path="login" 
            element={
              isAuthenticated ? <Navigate to="/cms/dashboard" replace /> : <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="otp" 
            element={
              isAuthenticated ? <Navigate to="/cms/dashboard" replace /> : <VerifyOTP onLogin={handleLogin} />
            } 
          />
          <Route 
            path="forgot-password" 
            element={
              isAuthenticated ? <Navigate to="/cms/dashboard" replace /> : <ForgotPassword />
            } 
          />
          <Route 
            path="reset-password" 
            element={
              isAuthenticated ? <Navigate to="/cms/dashboard" replace /> : <ResetPassword />
            } 
          />

          {/* Protected Admin Routes - Nested under Dashboard */}
          <Route element={<AdminProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard onLogout={handleLogout} />}>
              <Route index element={<Navigate to="/cms/dashboard/profile" replace />} />
              <Route path="profile" element={<Profile />} />
              <Route path="projects" element={<Projects />} />
              <Route path="expertise" element={<Expertise />} />
              <Route path="skills" element={<Skills />} />
              <Route path="certifications" element={<Certifications />} />
              <Route path="resume" element={<Resume />} />
              <Route path="features" element={<Features />} />
                    <Route path="contact-info" element={<ContactInfo />} />
                    <Route path="education" element={<Education />} />
                    <Route path="change-password" element={<ChangePassword />} />
                    <Route path="activity-logs" element={<ActivityLogs />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;

