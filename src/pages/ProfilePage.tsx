/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Company } from '../types.js';
import { User as UserIcon, Building, Mail, Globe, MapPin, CheckCircle, RefreshCw } from 'lucide-react';

interface ProfilePageProps {
  user: User;
  company: Company | null;
  onProfileUpdate: (updatedUser: User, updatedCompany?: Company) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function ProfilePage({ user, company, onProfileUpdate, showNotification }: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Employer Specific Fields
  const [companyName, setCompanyName] = useState(company?.company_name || '');
  const [companyDescription, setCompanyDescription] = useState(company?.company_description || '');
  const [website, setWebsite] = useState(company?.website || '');
  const [location, setLocation] = useState(company?.location || '');
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || '');

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    if (user.role === 'employer' && company) {
      setCompanyName(company.company_name);
      setCompanyDescription(company.company_description);
      setWebsite(company.website);
      setLocation(company.location);
      setLogoUrl(company.logo_url);
    }
  }, [user, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      showNotification('Mandatory profile details missing.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name,
          email,
          companyName,
          companyDescription,
          website,
          location,
          logoUrl
        })
      });

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();
      onProfileUpdate(data.user, data.company);
      showNotification('Your profile options were successfully synchronized.', 'success');
    } catch (err) {
      showNotification('Error syncing profile changes to database.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile title */}
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight leading-none">Settings & Profile</h1>
          <p className="text-xs text-gray-500 mt-1.5 font-sans">Manage your authenticated credentials, company description catalogs, and metadata settings.</p>
        </div>

        {/* Central Card */}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 sm:p-8" id="profile-form">
          <div className="space-y-6">
            
            {/* Header Badge */}
            <div className="flex items-center space-x-3 bg-blue-50/50 p-4 rounded border border-blue-100">
              {user.role === 'employer' ? (
                <Building className="h-6 w-6 text-blue-600 shrink-0" />
              ) : (
                <UserIcon className="h-6 w-6 text-blue-600 shrink-0" />
              )}
              <div>
                <span className="text-xxs uppercase font-bold tracking-widest text-blue-700">Account Type</span>
                <h3 className="text-sm font-bold text-gray-900 leading-none mt-1 uppercase">{user.role} Account</h3>
              </div>
            </div>

            {/* Basic Section */}
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                Personal Credentials
              </h2>
              
              <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Employer Block */}
            {user.role === 'employer' && (
              <div className="space-y-5">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 pt-2">
                  Company Directory Profile
                </h2>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Registered Company Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                    required={user.role === 'employer'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Website URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://acme.org"
                      className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Office Headquarter Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Austin, TX or Remote (Global)"
                      className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Company Logo Graphic URL</label>
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or similar"
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                  {logoUrl && (
                    <div className="mt-2.5 flex items-center space-x-2">
                      <img src={logoUrl} alt="Logo mockup" className="h-10 w-10 border rounded object-cover text-xs" referrerPolicy="no-referrer" />
                      <span className="text-xxs text-gray-400">Company Logo Preview (Active)</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5 leading-none">Company Mission & Catalog Description</label>
                  <textarea
                    rows={4}
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    placeholder="Describe your product services, enterprise engineering targets and growth metrics to potential candidates..."
                    className="w-full text-xs border border-gray-300 rounded p-2.5 bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Save bar */}
            <div className="pt-5 border-t border-gray-200 mt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white rounded transition shadow disabled:opacity-50 cursor-pointer"
                id="profile-save-btn"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
