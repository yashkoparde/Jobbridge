/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserRole, User, Company } from '../types.js';
import { Mail, User as UserIcon, ShieldCheck, ArrowRight, RefreshCw, Key } from 'lucide-react';

interface RegisterPageProps {
  setView: (view: string) => void;
  onRegisterSuccess: (user: User, company: Company | null) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function RegisterPage({ setView, onRegisterSuccess, showNotification }: RegisterPageProps) {
  const [role, setRole] = useState<UserRole>('employee');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      showNotification('Please fill in all mandatory parameters.', 'error');
      return;
    }

    if (password.length < 6) {
      showNotification('Password must contain at least 6 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showNotification('Passwords do not match. Please verify passwords.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();
      if (!response.ok) {
        showNotification(data.error || 'Registration failed. Please try a different email.', 'error');
      } else {
        showNotification('Registration successful! Setup complete.', 'success');
        onRegisterSuccess(data.user, data.company || null);
        
        // Auto-direct to the user's workspace dashboard
        if (data.user.role === 'employer') {
          setView('employer-dashboard');
        } else {
          setView('employee-dashboard');
        }
      }
    } catch (err) {
      showNotification('Error communicating with registration services.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-md w-full px-4">
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-gray-950 tracking-tight">Create JobBridge Account</h2>
            <p className="text-xs text-gray-400 mt-1.5 leading-none">Complete the onboarding registration form below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            
            {/* Roles selector tabs */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-2 leading-none">Register as an:</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-50 border p-1 rounded-md">
                <button
                  type="button"
                  onClick={() => setRole('employee')}
                  className={`py-1.5 text-xxs font-bold rounded cursor-pointer transition ${
                    role === 'employee' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-950'
                  }`}
                >
                  Candidate (Job Seeker)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`py-1.5 text-xxs font-bold rounded cursor-pointer transition ${
                    role === 'employer' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-955'
                  }`}
                >
                  Employer (Post Jobs)
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Liam Sterling"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. liam@example.com"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Security Password *</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* Confirmation */}
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Verify Security Password *</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm security key"
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center py-2 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded shadow transition disabled:opacity-55 cursor-pointer pt-2.5 pb-2.5"
              id="register-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  <span>Onboarding...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </>
              )}
            </button>

            {/* Login Navigation prompt */}
            <div className="text-center text-xs text-gray-500 pt-3 border-t">
              Already have an authenticated account?{' '}
              <button
                type="button"
                onClick={() => setView('login')}
                className="text-blue-600 font-bold hover:underline cursor-pointer"
                id="switch-to-login-btn"
              >
                Sign In
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
