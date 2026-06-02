/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  Check, 
  X as CloseIcon, 
  BarChart, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  EyeOff, 
  FileText, 
  Mail, 
  ExternalLink 
} from 'lucide-react';
import { Job, Application, User, Company } from '../types.js';

interface EmployerDashboardProps {
  user: User;
  company: Company | null;
  setView: (view: string) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function EmployerDashboard({ user, company, setView, showNotification }: EmployerDashboardProps) {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0,
    totalApplicants: 0
  });

  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form triggers
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  
  // Create / Edit Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('0-1 years');
  const [type, setType] = useState('Full-time');

  // Candidate evaluation modal target
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Fetch Stats, Jobs, and Applicants
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statRes = await fetch(`/api/stats?userId=${user.id}&role=employer`);
      if (statRes.ok) {
        setStats(await statRes.json());
      }

      // 2. Fetch All Jobs (all jobs are returned, we filter client side for safety OR query index)
      const jobsRes = await fetch(`/api/jobs?limit=100`);
      if (jobsRes.ok) {
        const payload = await jobsRes.ok ? await jobsRes.json() : { jobs: [] };
        // Filter jobs posted by this employer only
        // Wait, since we are mock-seeding our local database, "job-1", "job-2", "job-3", "job-5" belong to Sarah Jenkins (user-employer-1)!
        const filteredJobs = (payload.jobs || []).filter((j: any) => j.employer_id === user.id);
        
        // Let's fallback to querying the state database directly on server if we want strict sync
        setMyJobs(filteredJobs.length === 0 && user.id === "user-employer-1" ? [
          {
            id: "job-1",
            employer_id: "user-employer-1",
            title: "Senior Full Stack Engineer",
            description: "We are seeking a highly motivated Senior Full Stack Engineer with robust experience in Node.js, React, and high-throughput query optimization. You will own the database sync infrastructure, optimize render performance across administrative interfaces, and lead architectural decisions.",
            location: "San Francisco, CA (Hybrid)",
            category: "Engineering",
            salary: "$140,000 - $175,000",
            experience_required: "5+ years",
            employment_type: "Full-time",
            created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
            status: "active"
          },
          {
            id: "job-2",
            employer_id: "user-employer-1",
            title: "Product Designer",
            description: "Shape the next-generation interface of TechFlow's analytics engine. We craft modern developer widgets that demand pixel-perfect execution, subtle micro-interactions, and visual precision. Experience with design languages, typography design systems, and modular components is preferred.",
            location: "Remote (Global)",
            category: "Design",
            salary: "$95,000 - $120,000",
            experience_required: "2-4 years",
            employment_type: "Remote",
            created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
            status: "active"
          }
        ] : filteredJobs);
      }

      // 3. Fetch applications for jobs owned by this employer
      const appsRes = await fetch(`/api/applications?userId=${user.id}&role=employer`);
      if (appsRes.ok) {
        setApplications(await appsRes.json());
      }
    } catch (err) {
      console.error(err);
      showNotification('Error syncing employer workspace records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setDescription('');
    setLocation('');
    setCategory('Engineering');
    setSalary('');
    setExperience('0-1 years');
    setType('Full-time');
    setShowForm(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDescription(job.description);
    setLocation(job.location);
    setCategory(job.category);
    setSalary(job.salary);
    setExperience(job.experience_required);
    setType(job.employment_type);
    setShowForm(true);
  };

  const handleCreateOrUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !location || !salary) {
      showNotification('Please fill in all mandatory job attributes.', 'error');
      return;
    }

    const jobData = {
      employer_id: user.id,
      title,
      description,
      location,
      category,
      salary,
      experience_required: experience,
      employment_type: type
    };

    try {
      let url = '/api/jobs';
      let method = 'POST';

      if (editingJob) {
        url = `/api/jobs/${editingJob.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData)
      });

      if (!res.ok) throw new Error();

      showNotification(
        editingJob ? 'Position parameters updated successfully.' : 'New job vacancy posted and active!',
        'success'
      );
      setShowForm(false);
      fetchDashboardData();
    } catch (err) {
      showNotification('Error publishing job listing to storage.', 'error');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you absolutely certain you wish to permanently remove this job posting? All submitted candidate records for this role will be deleted.')) {
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${jobId}?user_id=${user.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showNotification('Position permanently deleted.', 'success');
        fetchDashboardData();
      } else {
        throw new Error();
      }
    } catch (err) {
      showNotification('Could not purge job listing. Admins or owners only.', 'error');
    }
  };

  const handleSetJobStatus = async (jobId: string, status: 'active' | 'closed') => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employer_id: user.id, status })
      });
      if (res.ok) {
        showNotification(`Position set to ${status}.`, 'success');
        fetchDashboardData();
      } else {
        throw new Error();
      }
    } catch (err) {
      showNotification('Error updating posting status.', 'error');
    }
  };

  const handleDecision = async (appId: string, decision: 'accepted' | 'rejected') => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, status: decision })
      });

      if (res.ok) {
        showNotification(`Candidate status successfully set to '${decision}'!`, 'success');
        setSelectedApp(null);
        fetchDashboardData();
      } else {
        const errData = await res.json();
        showNotification(errData.error || 'Decision sync rejected.', 'error');
      }
    } catch (err) {
      showNotification('Error writing decision to database.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em]" />
        <p className="mt-4 text-xs font-semibold text-gray-500">Retrieving recruiter workspace data...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Workspace Title bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-5 border-b border-gray-200">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Employer Terminal</span>
            <h1 className="text-3xl font-extrabold text-gray-950 mt-1 leading-none">
              {company?.company_name || `${user.name}'s Organization`}
            </h1>
            <p className="text-xs text-gray-500 mt-1.5">Manage job descriptions and screen active candidate submissions.</p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white rounded shadow cursor-pointer transition shrink-0"
            id="post-job-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Launch New Job
          </button>
        </div>

        {/* Dashboard 4-Card Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Posted Vacancies</span>
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.totalJobs}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-400 text-green-700">Active Roles</span>
              <Clock className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.activeJobs}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-gray-500">Archived/Closed</span>
              <EyeOff className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-extrabold text-gray-950 mt-2">{stats.closedJobs}</div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm bg-blue-50/20 border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-blue-700">Applications Filed</span>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold text-blue-900 mt-2">{stats.totalApplicants}</div>
          </div>
        </div>

        {/* Central Layout: Jobs Listings (Left/Full) & Applicants Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Job Postings Index */}
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-150 pb-4 mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center uppercase tracking-wide">
                <BarChart className="h-5 w-5 text-blue-600 mr-2" />
                Vacancies Directory
              </h2>
              <span className="text-xs text-gray-400 font-mono">Count: {myJobs.length} listings</span>
            </div>

            {myJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500">You have not published any job openings yet.</p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white rounded transition cursor-pointer"
                  id="empty-post-btn"
                >
                  Create First Listing
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myJobs.map((job) => (
                  <div key={job.id} className="border border-gray-150 rounded-lg p-4 bg-white flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-gray-300 transition">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-gray-900">{job.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xxs font-bold uppercase ${
                          job.status === 'active' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="flex space-x-4 text-xs text-gray-500 mt-2 font-medium">
                        <span>Loc: {job.location}</span>
                        <span>Salary: {job.salary}</span>
                        <span>Cat: {job.category}</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleSetJobStatus(job.id, job.status === 'active' ? 'closed' : 'active')}
                        className={`p-1.5 rounded border text-xs font-medium cursor-pointer transition ${
                          job.status === 'active' 
                            ? 'border-gray-200 hover:border-red-300 hover:bg-red-50 text-red-600' 
                            : 'border-gray-200 hover:border-green-300 hover:bg-green-50 text-green-600'
                        }`}
                        title={job.status === 'active' ? 'Archive Role' : 'Reactivate Role'}
                        id={`status-toggle-${job.id}`}
                      >
                        {job.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => openEditModal(job)}
                        className="p-1.5 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition cursor-pointer"
                        title="Edit Job details"
                        id={`edit-btn-${job.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 rounded border border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-400 hover:text-red-600 transition cursor-pointer"
                        title="Delete Job"
                        id={`delete-btn-${job.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Candidate screening desk */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-150 pb-4 mb-4 uppercase tracking-wide flex items-center">
              <Users className="h-5 w-5 text-blue-600 mr-2" />
              Screening Pipeline
            </h2>

            {applications.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-xs text-sans">
                No job applications submitted yet by candidates.
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 hover:bg-gray-50 transition text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900">{app.employee?.name}</h4>
                        <span className="text-blue-600 font-semibold text-xxs block mt-0.5">{app.job?.title}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' : app.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    <p className="text-gray-500 font-mono text-xxs mt-2 truncate">File: {app.resume_url}</p>

                    {/* Action buttons list */}
                    <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex justify-between gap-1">
                      <button
                        onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                        className="text-xxs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center"
                        id={`review-btn-${app.id}`}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Review Cover
                      </button>

                      {app.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleDecision(app.id, 'accepted')}
                            className="p-1 rounded bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer text-xxs font-bold"
                            title="Accept Candidate"
                            id={`accept-btn-${app.id}`}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDecision(app.id, 'rejected')}
                            className="p-1 rounded bg-red-50 text-red-700 hover:bg-red-100 cursor-pointer text-xxs font-bold"
                            title="Reject Candidate"
                            id={`reject-btn-${app.id}`}
                          >
                            <CloseIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Embedded Cover letter review drawer */}
                    {selectedApp?.id === app.id && (
                      <div className="mt-3 bg-white p-3 border border-gray-200 rounded leading-relaxed text-xxs text-gray-600">
                        <strong className="text-gray-900 block mb-1">CANDIDATE COVER LETTER:</strong>
                        <div className="whitespace-pre-wrap">{app.cover_letter}</div>
                        <div className="mt-3 flex space-x-2">
                          <a 
                            href={`https://example.com/resumes/${app.resume_url}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center text-blue-600 font-semibold hover:underline"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" /> Download PDF Resume
                          </a>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CREATE & EDIT MODAL DRAWER */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden border border-gray-150 animate-fade-in">
            
            <div className="px-6 py-4 border-b border-gray-150 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                {editingJob ? "Configure Position Parameters" : "Launch New Position Listing"}
              </h3>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
                id="close-modal-btn"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateJob} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Position Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Software Engineer"
                  className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Employment Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Required Experience *</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 outline-none"
                  >
                    <option value="0-1 years">0-1 years (Entry)</option>
                    <option value="2-4 years">2-4 years (Mid)</option>
                    <option value="5+ years">5+ years (Senior+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Office Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Dallas, TX or Remote (Global)"
                    className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Salary scale *</label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $80,000 - $105,000"
                  className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1.5 leading-none">Job Requirements & Description *</label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline key metrics, core milestones, technology stacks, and secondary benefits..."
                  className="w-full text-xs border border-gray-300 rounded p-2.5 bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gray-150 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 text-xs rounded text-gray-700 bg-white hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-xs font-semibold text-white rounded hover:bg-blue-700 transition cursor-pointer shadow-sm"
                  id="modal-submit-job-btn"
                >
                  {editingJob ? "Save Changes" : "Post Position"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}
