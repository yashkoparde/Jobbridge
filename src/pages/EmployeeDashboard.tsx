/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Bookmark, 
  CheckCircle, 
  X, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText, 
  ArrowRight,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { Application, Job, User } from '../types.js';

interface EmployeeDashboardProps {
  user: User;
  setView: (view: string) => void;
  setSelectedJobId: (id: string) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function EmployeeDashboard({ user, setView, setSelectedJobId, showNotification }: EmployeeDashboardProps) {
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });

  const [appliedJobsList, setAppliedJobsList] = useState<Application[]>([]);
  const [savedJobsList, setSavedJobsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch(`/api/stats?userId=${user.id}&role=employee`);
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // 2. Applied Jobs
      const appliedRes = await fetch(`/api/applications?userId=${user.id}&role=employee`);
      if (appliedRes.ok) {
        setAppliedJobsList(await appliedRes.json());
      }

      // 3. Saved Jobs
      const savedRes = await fetch(`/api/saved-jobs?employee_id=${user.id}`);
      if (savedRes.ok) {
        setSavedJobsList(await savedRes.json());
      }
    } catch (err) {
      console.error(err);
      showNotification('Error synchronization candidate workspace records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleUnsaveJob = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: user.id, job_id: jobId })
      });
      if (res.ok) {
        showNotification('Opportunity removed from bookmarks.', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showNotification('Could not remove opportunity.', 'error');
    }
  };

  const handleViewJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setView('job-details');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-xs font-semibold text-gray-500">Retrieving candidate workspace databases...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Workspace Title bar */}
        <div className="border-b border-gray-200 pb-5 mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest text-sans">Candidate Workspace</span>
          <h1 className="text-3xl font-extrabold text-gray-950 mt-1 leading-none">Welcome back, {user.name}!</h1>
          <p className="text-xs text-gray-500 mt-1.5 font-sans">Track ongoing progress for submitted files and bookmarked openings.</p>
        </div>

        {/* Dashboard Candidate Stats Matrix */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Applied Jobs</span>
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.appliedJobs}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Saved Openings</span>
              <Bookmark className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.savedJobs}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm bg-green-50/20 border-green-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-green-700">Accepted Proposals</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-extrabold text-green-900 mt-2">{stats.acceptedApplications}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Rejected Decisions</span>
              <ShieldAlert className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.rejectedApplications}</div>
          </div>
        </div>

        {/* Dual Layout Panel: Applications (Left) & Saved bookmarks (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Applications monitor stream */}
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="border-b border-gray-150 pb-4 mb-4 flex justify-between items-center bg-transparent">
              <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                My Job Applications
              </h2>
              <span className="text-xs font-mono text-gray-400">Total: {appliedJobsList.length} filed</span>
            </div>

            {appliedJobsList.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-500">
                You have not submitted any job applications yet.{' '}
                <button
                  onClick={() => setView('jobs')}
                  className="text-blue-600 hover:underline font-bold cursor-pointer"
                  id="dashboard-browse-prompt"
                >
                  Browse opportunities
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobsList.map((app) => {
                  const formattedAppDate = new Date(app.applied_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div 
                      key={app.id} 
                      onClick={() => handleViewJob(app.job?.id || '')}
                      className="border border-gray-150 rounded-lg p-4 bg-white hover:border-blue-300 hover:shadow-sm transition cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                      id={`app-item-${app.id}`}
                    >
                      <div>
                        <h3 className="font-bold text-sm text-gray-900">{app.job?.title}</h3>
                        <p className="text-xs font-semibold text-blue-600 mt-0.5">{app.job?.company?.company_name}</p>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mt-3 font-medium">
                          <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {app.job?.location}</span>
                          <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> {app.job?.salary}</span>
                          <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> Applied {formattedAppDate}</span>
                        </div>
                      </div>

                      {/* Status pill & control */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                        <span className={`px-2.5 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                          app.status === 'accepted' 
                            ? 'bg-green-150 text-green-800' 
                            : app.status === 'rejected'
                            ? 'bg-red-150 text-red-800'
                            : 'bg-amber-150 text-amber-800'
                        }`}>
                          {app.status}
                        </span>
                        
                        <span className="flex items-center text-blue-600 text-xxs font-semibold">
                          Analyze opening
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bookmarks opportunities Panel */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-150 pb-4 mb-4 uppercase tracking-wide flex items-center">
              <Bookmark className="h-5 w-5 text-blue-600 mr-2" />
              Bookmarked Opportunities
            </h2>

            {savedJobsList.length === 0 ? (
              <div className="text-center py-10 text-xs text-gray-400">
                You have not saved any openings yet. Click the bookmark icon inside listings to save folders.
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobsList.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleViewJob(item.job.id)}
                    className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer text-xs relative group"
                    id={`saved-item-${item.job.id}`}
                  >
                    {/* Delete Toggle */}
                    <button
                      onClick={(e) => handleUnsaveJob(item.job.id, e)}
                      className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 bg-transparent transition cursor-pointer"
                      title="Remove Bookmark"
                      id={`delete-saved-btn-${item.job.id}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>

                    <h4 className="font-bold text-gray-950 pr-5 truncate">{item.job.title}</h4>
                    <p className="text-blue-600 font-semibold text-xxs mt-0.5 truncate">{item.job.company?.company_name}</p>

                    <div className="flex flex-wrap gap-x-2 text-xxs text-gray-500 mt-2.5 font-medium leading-none">
                      <span className="flex items-center"><MapPin className="h-2.5 w-2.5 mr-0.5" /> {item.job.location}</span>
                      <span>•</span>
                      <span>{item.job.salary}</span>
                    </div>

                    <div className="mt-3.5 pt-2 border-t border-gray-100/50 flex justify-between items-center">
                      <span className="px-1.5 py-0.5 rounded bg-white border border-gray-150 text-xxs text-gray-600 font-bold uppercase tracking-wide">
                        {item.job.employment_type}
                      </span>
                      
                      <span className="text-xxs font-semibold text-blue-600 hover:underline flex items-center">
                        Details <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
