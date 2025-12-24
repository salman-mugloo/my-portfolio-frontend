import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Expertise from './pages/Expertise';
import Skills from './pages/Skills';
import Certifications from './pages/Certifications';
import Resume from './pages/Resume';
import ChangePassword from './pages/ChangePassword';
import Profile from './pages/Profile';
import Features from './pages/Features';
import ContactInfo from './pages/ContactInfo';
import Education from './pages/Education';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/verify-otp" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <VerifyOTP onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <ForgotPassword />
          } 
        />
        <Route 
          path="/cms/reset-password" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <ResetPassword />
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            isAuthenticated ? <Navigate to="/" /> : <ResetPassword />
          } 
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route index element={<Navigate to="/profile" />} />
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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

