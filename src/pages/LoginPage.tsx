/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, User, Company } from '../types.js';
import { Lock, Mail, Users, ArrowRight, Library, RefreshCw, Key } from 'lucide-react';

interface LoginPageProps {
  setView: (view: string) => void;
  onLoginSuccess: (user: User, company: Company | null) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function LoginPage({ setView, onLoginSuccess, showNotification }: LoginPageProps) {
  const [role, setRole] = useState<UserRole>('employee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password reset states
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification('Please fill in both email and password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();
      if (!response.ok) {
        showNotification(data.error || 'Authentication failed. Please verify credentials.', 'error');
      } else {
        showNotification('Login successful! Welcome to JobBridge.', 'success');
        onLoginSuccess(data.user, data.company || null);
        
        // Redirect to appropriate page
        if (data.user.role === 'admin') {
          setView('admin-dashboard');
        } else if (data.user.role === 'employer') {
          setView('employer-dashboard');
        } else {
          setView('employee-dashboard');
        }
      }
    } catch (err: any) {
      showNotification('Error connecting to the authentication server.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      showNotification('Please provide your registered email address.', 'error');
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message, 'success');
        setForgotPassword(false);
      } else {
        showNotification(data.error || 'Password reset request failed.', 'error');
      }
    } catch (err) {
      showNotification('Error executing password request.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  // Safe credentials helper shortcuts to speed up review testing
  const handleCredentialShortcut = (eMail: string, rOle: UserRole) => {
    setEmail(eMail);
    setPassword('password');
    setRole(rOle);
    showNotification(`Filled: ${eMail} (role: ${rOle})`, 'success');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        
        {/* Card envelope */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6 sm:p-8">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-gray-950 tracking-tight">
              {forgotPassword ? "Password Restoration" : "Connect to JobBridge"}
            </h2>
            <p className="text-xs text-gray-400 mt-1.5 leading-none">
              {forgotPassword ? "Dispatched reset instructions" : "Manage your recruiting pipelines and goals"}
            </p>
          </div>

          {!forgotPassword ? (
            <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
              
              {/* Role Selection bar */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Select Core Role Context</label>
                <div className="grid grid-cols-3 gap-2 bg-gray-50 border p-1 rounded-md">
                  <button
                    type="button"
                    onClick={() => setRole('employee')}
                    className={`py-1.5 text-xxs font-bold rounded cursor-pointer transition ${
                      role === 'employee' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-905'
                    }`}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`py-1.5 text-xxs font-bold rounded cursor-pointer transition ${
                      role === 'employer' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-905'
                    }`}
                  >
                    Employer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={`py-1.5 text-xxs font-bold rounded cursor-pointer transition ${
                      role === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-955'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. employee@jobbridge.com"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-gray-350 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-gray-500 leading-none">Password</label>
                  <button
                    type="button"
                    onClick={() => setForgotPassword(true)}
                    className="text-xxs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    className="w-full text-xs pl-9 pr-3 py-2 border border-gray-350 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded shadow transition disabled:opacity-55 cursor-pointer"
                id="login-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Login</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </>
                )}
              </button>

              {/* Registration Prompt */}
              <div className="text-center text-xs text-gray-500 pt-3 border-t">
                Don't have an authentication account yet?{' '}
                <button
                  type="button"
                  onClick={() => setView('register')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                  id="switch-to-register-btn"
                >
                  Create one now
                </button>
              </div>

              {/* Testing Credentials panel */}
              <div className="pt-4 mt-2 bg-gray-50 rounded-lg p-4 border border-dashed border-gray-200">
                <span className="text-xxs font-mono uppercase bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full inline-block mb-3">
                  Developer Testing shortcuts
                </span>
                
                <div className="grid grid-cols-1 gap-2 text-xxs font-semibold">
                  <button
                    type="button"
                    onClick={() => handleCredentialShortcut('employee@jobbridge.com', 'employee')}
                    className="w-full text-left text-gray-700 hover:text-blue-600 p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-150 flex justify-between items-center bg-gray-50 text-sans cursor-pointer"
                  >
                    <span>🎯 Login as Employee (Candidate)</span>
                    <span className="text-gray-400">Click to fill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCredentialShortcut('employer@jobbridge.com', 'employer')}
                    className="w-full text-left text-gray-700 hover:text-blue-600 p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-150 flex justify-between items-center bg-gray-50 text-sans cursor-pointer"
                  >
                    <span>💼 Login as Employer</span>
                    <span className="text-gray-400">Click to fill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCredentialShortcut('admin@jobbridge.com', 'admin')}
                    className="w-full text-left text-gray-700 hover:text-blue-600 p-1.5 rounded hover:bg-white border border-transparent hover:border-gray-150 flex justify-between items-center bg-gray-50 text-sans cursor-pointer"
                  >
                    <span>🛡️ Login as System Admin</span>
                    <span className="text-gray-400">Click to fill</span>
                  </button>
                </div>
              </div>

            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Provide your registered email address and we will dispatch password recovery tokens to restore secure access.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Your Email Address</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="e.g. candidate@jobbridge.com"
                  className="w-full text-xs border border-gray-300 rounded px-2.5 py-2 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotPassword(false)}
                  className="flex-1 text-center py-2 text-xs border border-gray-300 text-gray-600 rounded bg-white hover:bg-gray-55 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex-1 text-center py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-755 rounded transition disabled:opacity-50 cursor-pointer"
                >
                  {isResetting ? "Requesting..." : "Send Reset link"}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
