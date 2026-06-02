/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Briefcase, Menu, X, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { User, Company } from '../types.js';

interface NavbarProps {
  user: User | null;
  company: Company | null;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
}

export default function Navbar({ user, company, currentView, setView, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    setView(view);
    setMobileMenuOpen(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'employer': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => handleNav('landing')} 
              className="flex items-center space-x-2 text-blue-600 hover:opacity-90 font-bold text-xl cursor-pointer"
              id="nav-logo-btn"
            >
              <Briefcase className="h-6 w-6 text-blue-600" />
              <span className="font-sans text-gray-900 tracking-tight">Job<span className="text-blue-600">Bridge</span></span>
            </button>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-4">
              <button
                onClick={() => handleNav('jobs')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                  currentView === 'jobs' || currentView === 'job-details'
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                id="nav-jobs-btn"
              >
                Search Jobs
              </button>
              <button
                onClick={() => handleNav('about')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                  currentView === 'about' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                id="nav-about-btn"
              >
                About Us
              </button>
              <button
                onClick={() => handleNav('contact')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                  currentView === 'contact' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                id="nav-contact-btn"
              >
                Contact
              </button>
            </div>
          </div>

          {/* User Section (Right Side) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 mr-2">
                  <span className={`px-2 py-0.5 border rounded-full text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.role === 'employer' && company ? company.company_name : user.name}
                  </span>
                </div>

                {/* Dashboard button based on role */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('admin-dashboard')}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      currentView === 'admin-dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    id="nav-admin-btn"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </button>
                )}

                {user.role === 'employer' && (
                  <button
                    onClick={() => handleNav('employer-dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      currentView === 'employer-dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    id="nav-employer-btn"
                  >
                    Employer Dashboard
                  </button>
                )}

                {user.role === 'employee' && (
                  <button
                    onClick={() => handleNav('employee-dashboard')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition cursor-pointer ${
                      currentView === 'employee-dashboard' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    id="nav-employee-btn"
                  >
                    My Dashboard
                  </button>
                )}

                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleNav('profile')}
                    className={`p-1.5 rounded-full border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer ${
                      currentView === 'profile' ? 'bg-blue-50 border-blue-200 text-blue-600' : ''
                    }`}
                    title="Profile Settings"
                    id="nav-profile-btn"
                  >
                    <UserIcon className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 px-3 py-2 rounded-md font-medium transition cursor-pointer"
                  id="nav-logout-btn"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 bg-white rounded-md shadow-sm transition cursor-pointer"
                  id="nav-login-btn"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition cursor-pointer"
                  id="nav-register-btn"
                >
                  Post a Job / Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none transition"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-2 pt-2 pb-4 space-y-1 shadow-inner">
          <button
            onClick={() => handleNav('jobs')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Search Jobs
          </button>
          <button
            onClick={() => handleNav('about')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            About Us
          </button>
          <button
            onClick={() => handleNav('contact')}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Contact
          </button>

          {user ? (
            <div className="pt-4 border-t border-gray-100 mt-2 space-y-1">
              <div className="px-3 py-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {user.role === 'employer' && company ? company.company_name : user.name}
                </span>
                <span className={`px-2 py-0.5 border rounded-full text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>

              {user.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin-dashboard')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  Admin Panel
                </button>
              )}

              {user.role === 'employer' && (
                <button
                  onClick={() => handleNav('employer-dashboard')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  Employer Dashboard
                </button>
              )}

              {user.role === 'employee' && (
                <button
                  onClick={() => handleNav('employee-dashboard')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  Employee Dashboard
                </button>
              )}

              {user.role !== 'admin' && (
                <button
                  onClick={() => handleNav('profile')}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Profile & Settings
                </button>
              )}

              <button
                onClick={onLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100 mt-2 flex flex-col space-y-2 px-3">
              <button
                onClick={() => handleNav('login')}
                className="w-full text-center px-4 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('register')}
                className="w-full text-center px-4 py-2 bg-blue-600 rounded-md text-base font-medium text-white hover:bg-blue-700 transition"
              >
                Sign Up / Post a Job
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
