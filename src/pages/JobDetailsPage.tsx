/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, DollarSign, Calendar, Mail, Globe, Send, ClipboardCheck, Lock, Upload, FileText } from 'lucide-react';
import { Job, User } from '../types.js';

interface JobDetailsPageProps {
  jobId: string;
  user: User | null;
  setView: (view: string) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function JobDetailsPage({ jobId, user, setView, showNotification }: JobDetailsPageProps) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Application fields
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [currentAppStatus, setCurrentAppStatus] = useState<string>('');

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setJob(data);

      // Check if current employee has already applied
      if (user && user.role === 'employee') {
        const appsRes = await fetch(`/api/applications?userId=${user.id}&role=employee`);
        if (appsRes.ok) {
          const apps = await appsRes.json();
          const match = apps.find((a: any) => a.job_id === jobId);
          if (match) {
            setHasApplied(true);
            setCurrentAppStatus(match.status);
          }
        }
      }
    } catch (err) {
      showNotification('Error retrieving job specifications.', 'error');
      setView('jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, user]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please Sign In first to initiate an application.', 'error');
      setView('login');
      return;
    }
    if (user.role !== 'employee') {
      showNotification('Only Candidates can apply for job postings.', 'error');
      return;
    }

    if (!resumeName) {
      showNotification('Please provide a resume name or PDF file description.', 'error');
      return;
    }

    if (coverLetter.length < 50) {
      showNotification('Your cover letter is too brief! Write at least 50 characters to highlight why you match this role.', 'error');
      return;
    }

    setIsApplying(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: jobId,
          employee_id: user.id,
          cover_letter: coverLetter,
          resume_url: resumeName // Simulated server file name
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showNotification(data.error || 'Could not submit your application.', 'error');
      } else {
        showNotification('Application dispatched successfully! The employer has been notified.', 'success');
        setHasApplied(true);
        setCurrentAppStatus('pending');
      }
    } catch (err) {
      showNotification('Error contacting application services.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="mt-4 text-xs font-medium text-gray-500">Retrieving position specifications...</p>
      </div>
    );
  }

  if (!job) return null;

  const formattedDate = new Date(job.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back navigation button */}
        <button
          onClick={() => setView('jobs')}
          className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 font-medium mb-6 cursor-pointer"
          id="back-to-listings-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Open Roles</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Job Body details (Left) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header info card */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-150 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight leading-tight">
                    {job.title}
                  </h1>
                  <span className="text-sm font-semibold text-blue-600 mt-1 block">
                    {job.company?.company_name}
                  </span>
                </div>
                
                <span className="px-3 py-1 rounded bg-blue-50 border border-blue-200 font-semibold text-xs text-blue-700 uppercase">
                  {job.status === 'active' ? 'Active Posting' : 'Closed'}
                </span>
              </div>

              {/* Badges block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-gray-500 font-medium">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>Posted {formattedDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClipboardCheck className="h-4 w-4 text-gray-400 shrink-0" />
                  <span>{job.experience_required} req.</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                <span className="px-3 py-1 rounded bg-gray-50 border border-gray-150 text-xs font-bold text-gray-600 uppercase tracking-wide">
                  {job.employment_type}
                </span>
                <span className="px-3 py-1 rounded bg-gray-50 border border-gray-150 text-xs font-bold text-gray-600 uppercase tracking-wide">
                  {job.category}
                </span>
              </div>
            </div>

            {/* Description Text block */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase tracking-wide">
                Role Description
              </h2>
              
              <div className="text-sm text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Company specification block */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2 mb-4 uppercase tracking-wider">
                Corporate Hiring Partner
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {job.company?.company_description}
              </p>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-gray-500 font-medium">
                {job.company?.website && (
                  <a 
                    href={job.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center space-x-1.5 text-blue-600 hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    <span>View Website</span>
                  </a>
                )}
                <span className="flex items-center space-x-1.5">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>HQ: {job.company?.location}</span>
                </span>
              </div>
            </div>

          </div>

          {/* Action / Apply Module (Right side) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-base pb-3 border-b border-gray-100 mb-4 uppercase tracking-wide">
                Submission Terminal
              </h3>

              {user ? (
                user.role === 'employee' ? (
                  hasApplied ? (
                    <div className="text-center py-4 space-y-3">
                      <div className="p-3 inline-block rounded-full bg-green-50 text-green-600">
                        <ClipboardCheck className="h-6 w-6" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-sm">Application Filed</h4>
                      
                      {/* Decision pill */}
                      <span className={`inline-block px-3 py-1 text-xs font-bold uppercase rounded-full ${
                        currentAppStatus === 'accepted' 
                          ? 'bg-green-100 text-green-800' 
                          : currentAppStatus === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Decision: {currentAppStatus}
                      </span>
                      
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Your resume description and cover letter are saved with this hiring pipeline. Track ongoing notifications inside your personal workspace.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleApplySubmit} className="space-y-4">
                      {/* Upload Resume simulation */}
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-2 leading-none">
                          PDF Resume Upload *
                        </label>
                        <div className="border border-dashed border-gray-300 hover:border-blue-400 rounded-md p-4 text-center cursor-pointer transition relative bg-gray-50">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.type !== 'application/pdf') {
                                  showNotification('Only standard PDF resume documents are supported.', 'error');
                                  return;
                                }
                                setResumeName(file.name);
                                showNotification(`Loaded: ${file.name}`, 'success');
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1.5" />
                          <span className="text-xs text-blue-600 block hover:underline font-medium">Select PDF File</span>
                          <span className="text-xxs text-gray-400 block mt-0.5">Maximum size 5MB</span>
                        </div>
                        {resumeName && (
                          <div className="mt-2.5 flex items-center space-x-1.5 p-2 border border-green-150 rounded bg-green-50/50">
                            <FileText className="h-4 w-4 text-green-600 shrink-0" />
                            <span className="text-xs font-semibold text-green-800 truncate" title={resumeName}>
                              {resumeName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Cover letter text area */}
                      <div>
                        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5 leading-none">
                          Cover Letter *
                        </label>
                        <textarea
                          placeholder="Introduce yourself to the team. Align your skillset with the qualifications described opposite (min 50 chars)..."
                          rows={4}
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          className="w-full text-xs border border-gray-300 rounded p-2.5 bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
                          required
                        />
                        <span className="text-xxs text-gray-400 block mt-1 text-right">
                          {coverLetter.length} characters (min 50)
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={isApplying}
                        className="w-full inline-flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-700 text-xs text-white font-semibold rounded shadow transition disabled:opacity-55 cursor-pointer"
                        id="submit-application-btn"
                      >
                        {isApplying ? (
                          <span>Filing documents...</span>
                        ) : (
                          <>
                            <span>Apply for Position</span>
                            <Send className="h-3 w-3 ml-1.5" />
                          </>
                        )}
                      </button>
                    </form>
                  )
                ) : (
                  <div className="text-center py-6 bg-gray-50 border border-gray-150 rounded">
                    <Lock className="h-5 w-5 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 px-3">
                      Your current role is registered as <strong className="uppercase">{user.role}</strong>. Only Candidates / Job Seekers can apply.
                    </p>
                  </div>
                )
              ) : (
                <div className="text-center py-6 bg-blue-50/30 border border-blue-100 rounded space-y-3">
                  <Lock className="h-5 w-5 text-blue-500 mx-auto" />
                  <div className="px-3">
                    <p className="text-xs font-medium text-gray-800">Authentication Required</p>
                    <p className="text-xxs text-gray-500 mt-1">Please login as a Job Seeker Candidate to submit your PDF Resume and track review pipelines.</p>
                  </div>
                  <button
                    onClick={() => setView('login')}
                    className="inline-flex px-3 py-1.5 text-xxs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer"
                    id="details-login-prompt-btn"
                  >
                    Login / Sign In
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
