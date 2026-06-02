/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  FileText, 
  Trash2, 
  ShieldAlert, 
  UserX, 
  UserCheck, 
  Eye, 
  BarChart, 
  ExternalLink 
} from 'lucide-react';
import { User, Job, Application } from '../types.js';

interface AdminDashboardProps {
  user: User;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function AdminDashboard({ user, showNotification }: AdminDashboardProps) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0
  });

  const [usersList, setUsersList] = useState<User[]>([]);
  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [applicationsList, setApplicationsList] = useState<Application[]>([]);
  
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'applications'>('users');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const statsRes = await fetch(`/api/stats?userId=${user.id}&role=admin`);
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // 2. Users
      const usersRes = await fetch(`/api/admin/users?admin_id=${user.id}`);
      if (usersRes.ok) {
        setUsersList(await usersRes.json());
      }

      // 3. Jobs (Fetch all including closed/open via the full directory)
      const jobsRes = await fetch('/api/jobs?limit=100'); // Note: client side filters won't truncate if limit is huge
      if (jobsRes.ok) {
        const payload = await jobsRes.json();
        setJobsList(payload.jobs || []);
      }

      // 4. Applications (All applications in storage)
      const appsRes = await fetch(`/api/applications?userId=${user.id}&role=admin`);
      if (appsRes.ok) {
        setApplicationsList(await appsRes.json());
      }
    } catch (err) {
      console.error(err);
      showNotification('Error retrieving administrative databases indices.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleToggleSuspend = async (targetUser: User) => {
    if (targetUser.id === user.id) {
      showNotification('Security Block: You cannot suspend your own administrative session.', 'error');
      return;
    }

    const nextStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const confirmPrompt = `Are you absolutely sure you want to change account status for ${targetUser.name} (${targetUser.email}) to '${nextStatus}'?`;
    
    if (!confirm(confirmPrompt)) return;

    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/suspend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_id: user.id, status: nextStatus })
      });

      if (res.ok) {
        showNotification(`User successfully ${nextStatus === 'suspended' ? 'suspended' : 'reactivated'}.`, 'success');
        fetchAdminData();
      } else {
        throw new Error();
      }
    } catch (err) {
      showNotification('Error synchronizing suspension action with database server.', 'error');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('MODERATION NOTICE: Are you certain you wish to delete this job posting? This action is immediate and alerts will be logged.')) {
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${jobId}?user_id=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showNotification('Posting purged from JobBridge servers.', 'success');
        fetchAdminData();
      } else {
        throw new Error();
      }
    } catch (err) {
      showNotification('Could not liquidate listing. Inappropriate permissions.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-xs font-semibold text-gray-500">Initiating High-Security Admin Workspace...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="border-b border-gray-200 pb-5 mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1" />
              Security Command Centre
            </span>
            <h1 className="text-3xl font-extrabold text-gray-950 mt-1 leading-none">Administrative Panel</h1>
            <p className="text-xs text-gray-500 mt-1.5 font-sans">Audit platform user accounts, moderate inappropriate listings, and inspect candidate records.</p>
          </div>
          
          <span className="text-xxs font-mono bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-full mt-3 sm:mt-0 shadow-sm uppercase font-semibold">
            STATUS: ACTIVE COMMANDER
          </span>
        </div>

        {/* Audit Stats deck */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500 text-sans">Total Accounts</span>
              <Users className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.totalUsers}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Active Listings</span>
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.activeJobs}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Global Applications</span>
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.totalApplications}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">All Positions</span>
              <BarChart className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.totalJobs}</div>
          </div>
        </div>

        {/* Dashboard Panels selector tabs */}
        <div className="border-b border-gray-200 mb-6 flex space-x-1 bg-white p-1 rounded-md max-w-md border shadow-sm">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded transition cursor-pointer ${
              activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-650 hover:bg-gray-55 hover:text-gray-900'
            }`}
            id="tab-users-btn"
          >
            Users Dashboard ({usersList.length})
          </button>
          
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded transition cursor-pointer ${
              activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'text-gray-650 hover:bg-gray-55 hover:text-gray-900'
            }`}
            id="tab-jobs-btn"
          >
            Moderate Jobs ({jobsList.length})
          </button>
          
          <button
            onClick={() => setActiveTab('applications')}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded transition cursor-pointer ${
              activeTab === 'applications' ? 'bg-blue-600 text-white' : 'text-gray-650 hover:bg-gray-55 hover:text-gray-900'
            }`}
            id="tab-applications-btn"
          >
            Surveillance ({applicationsList.length})
          </button>
        </div>

        {/* Tab content viewports */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden p-6">
          
          {/* TAB 1: User index lists */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center bg-transparent">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Users Registry Directory</h3>
                <span className="text-xxs font-mono text-gray-400">Security Encrypted</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xxs">
                    <tr>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Role Badge</th>
                      <th className="px-4 py-3">Security Status</th>
                      <th className="px-4 py-3 text-right">Moderations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3.5 font-bold text-gray-950">{usr.name}</td>
                        <td className="px-4 py-3.5 text-gray-500">{usr.email}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 border rounded-full font-bold uppercase text-xxs tracking-wide ${
                            usr.role === 'admin' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : usr.role === 'employer'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-blue-50 text-blue-750 border-blue-150'
                          }`}>
                            {usr.role}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded font-bold text-xxs uppercase tracking-wider ${
                            usr.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {usr.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {usr.id !== user.id && (
                            <button
                              onClick={() => handleToggleSuspend(usr)}
                              className={`inline-flex px-2.5 py-1 text-xxs font-semibold rounded border transition cursor-pointer ${
                                usr.status === 'active'
                                  ? 'border-red-250 text-red-650 hover:bg-red-50 bg-white'
                                  : 'border-green-250 text-green-650 hover:bg-green-50 bg-white'
                              }`}
                              id={`suspend-usr-${usr.id}`}
                            >
                              {usr.status === 'active' ? (
                                <>
                                  <UserX className="h-3 w-3 mr-1" />
                                  Suspend Account
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Reactivate
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Jobs list & moderation */}
          {activeTab === 'jobs' && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center bg-transparent">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide font-sans">System Vacancies Moderation Desk</h3>
                <p className="text-xxs text-red-550 flex items-center font-semibold">
                  <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                  Liquidating listings is irreversible
                </p>
              </div>

              {jobsList.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs text-sans">No job vacancies created on the platform yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xxs">
                      <tr>
                        <th className="px-4 py-3">Position Title</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">HQ Location</th>
                        <th className="px-4 py-3">Salary scale</th>
                        <th className="px-4 py-3 text-right">Liquidate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {jobsList.map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3.5 font-bold text-gray-950">
                            {job.title}
                            <span className="text-xxs block text-blue-600 font-semibold mt-0.5">{job.company?.company_name}</span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500">{job.category}</td>
                          <td className="px-4 py-3.5">{job.location}</td>
                          <td className="px-4 py-3.5 text-gray-500">{job.salary}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-1.5 rounded border border-gray-200 text-gray-400 hover:text-red-650 hover:border-red-300 hover:bg-red-50 bg-white transition cursor-pointer"
                              title="Moderate and Purge Posting"
                              id={`purge-job-${job.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Global applications review Surveillance */}
          {activeTab === 'applications' && (
            <div className="space-y-4">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center bg-transparent">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide text-sans">Application Transmission Stream</h3>
                <span className="text-xxs text-gray-400 font-mono">Real-time surveillance enabled</span>
              </div>

              {applicationsList.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs">No candidate applications currently exist in the database.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xxs">
                      <tr>
                        <th className="px-4 py-3">Candidate</th>
                        <th className="px-4 py-3">Applied Position</th>
                        <th className="px-4 py-3">Attached File</th>
                        <th className="px-4 py-3">Recruiter Decision</th>
                        <th className="px-4 py-3 text-right font-semibold">Track ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {applicationsList.map((app) => (
                        <tr key={app.id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3.5 font-bold text-gray-950">
                            {app.employee?.name}
                            <span className="text-xxs block text-gray-400 font-normal mt-0.5">{app.employee?.email}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            {app.job?.title}
                            <span className="text-blue-600 font-bold block text-xxs mt-0.5">{app.job?.company?.company_name}</span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-xxs text-gray-400">{app.resume_url}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                              app.status === 'accepted' 
                                ? 'bg-green-100 text-green-800' 
                                : app.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-gray-400 text-xxs">{app.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
