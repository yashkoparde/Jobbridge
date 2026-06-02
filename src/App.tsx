/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import Notification from './components/Notification.tsx';

// Page Views
import LandingPage from './pages/LandingPage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import JobListingsPage from './pages/JobListingsPage.tsx';
import JobDetailsPage from './pages/JobDetailsPage.tsx';
import EmployerDashboard from './pages/EmployerDashboard.tsx';
import EmployeeDashboard from './pages/EmployeeDashboard.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';

import { User, Company } from './types.js';

export default function App() {
  const [currentView, setView] = useState<string>('landing');
  
  // User Session State
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(true);

  // Notifications State
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Selected Job (for details routing)
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  // Load session from storage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('jb_user');
      const storedCompany = localStorage.getItem('jb_company');
      
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedCompany) {
        setCompany(JSON.parse(storedCompany));
      }
    } catch (err) {
      console.error("Session load error:", err);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const handleLoginSuccess = (usr: User, comp: Company | null) => {
    setUser(usr);
    setCompany(comp);
    localStorage.setItem('jb_user', JSON.stringify(usr));
    if (comp) {
      localStorage.setItem('jb_company', JSON.stringify(comp));
    } else {
      localStorage.removeItem('jb_company');
    }
  };

  const handleProfileUpdate = (usr: User, comp?: Company) => {
    setUser(usr);
    localStorage.setItem('jb_user', JSON.stringify(usr));
    if (comp) {
      setCompany(comp);
      localStorage.setItem('jb_company', JSON.stringify(comp));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem('jb_user');
    localStorage.removeItem('jb_company');
    setView('landing');
    showNotification('Logged out successfully from your JobBridge session.', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setAlert({ message, type });
  };

  // Route guarding / protection checks
  const checkRouteProtection = (targetView: string) => {
    if (['employer-dashboard', 'employee-dashboard', 'admin-dashboard', 'profile'].includes(targetView)) {
      if (!user) {
        showNotification('Authorization Warning: Access Denied. Sign in to view dashboards.', 'error');
        setView('login');
        return false;
      }

      if (targetView === 'employer-dashboard' && user.role !== 'employer') {
        showNotification('Access Denied: Employers only.', 'error');
        setView('landing');
        return false;
      }

      if (targetView === 'employee-dashboard' && user.role !== 'employee') {
        showNotification('Access Denied: Candidates only.', 'error');
        setView('landing');
        return false;
      }

      if (targetView === 'admin-dashboard' && user.role !== 'admin') {
        showNotification('Access Denied: Admins only.', 'error');
        setView('landing');
        return false;
      }
    }
    return true;
  };

  // Custom view navigator with route guards
  const navigateTo = (view: string) => {
    if (checkRouteProtection(view)) {
      setView(view);
      window.scrollTo(0, 0);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center items-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
        <span className="mt-4 text-xs font-semibold text-gray-500 font-sans tracking-wide">Syncing JobBridge Session...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-gray-900 leading-normal antialiased selection:bg-blue-150 selection:text-blue-900">
      
      {/* Alert Notifications Banner */}
      {alert && (
        <Notification
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Header element */}
      <Navbar
        user={user}
        company={company}
        currentView={currentView}
        setView={navigateTo}
        onLogout={handleLogout}
      />

      {/* Primary body viewports */}
      <main className="flex-grow">
        {currentView === 'landing' && (
          <LandingPage setView={navigateTo} user={user} />
        )}
        
        {currentView === 'about' && (
          <AboutPage />
        )}

        {currentView === 'contact' && (
          <ContactPage showNotification={showNotification} />
        )}

        {currentView === 'jobs' && (
          <JobListingsPage
            user={user}
            setView={navigateTo}
            setSelectedJobId={setSelectedJobId}
            showNotification={showNotification}
          />
        )}

        {currentView === 'job-details' && (
          <JobDetailsPage
            jobId={selectedJobId}
            user={user}
            setView={navigateTo}
            showNotification={showNotification}
          />
        )}

        {currentView === 'login' && (
          <LoginPage
            setView={navigateTo}
            onLoginSuccess={handleLoginSuccess}
            showNotification={showNotification}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            setView={navigateTo}
            onRegisterSuccess={handleLoginSuccess}
            showNotification={showNotification}
          />
        )}

        {currentView === 'profile' && user && (
          <ProfilePage
            user={user}
            company={company}
            onProfileUpdate={handleProfileUpdate}
            showNotification={showNotification}
          />
        )}

        {currentView === 'employer-dashboard' && user && (
          <EmployerDashboard
            user={user}
            company={company}
            setView={navigateTo}
            showNotification={showNotification}
          />
        )}

        {currentView === 'employee-dashboard' && user && (
          <EmployeeDashboard
            user={user}
            setView={navigateTo}
            setSelectedJobId={setSelectedJobId}
            showNotification={showNotification}
          />
        )}

        {currentView === 'admin-dashboard' && user && (
          <AdminDashboard
            user={user}
            showNotification={showNotification}
          />
        )}
      </main>

      {/* Footer element */}
      <Footer setView={navigateTo} />

    </div>
  );
}
