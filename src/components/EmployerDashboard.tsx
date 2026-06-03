import React, { useState } from 'react';
import { Plus, Users, Calendar, Briefcase, MapPin, DollarSign, ExternalLink, Filter, CheckCircle2, XCircle, Clock, Trash, FileText, ChevronRight, Sparkles, Inbox, Search } from 'lucide-react';
import { Job, Application } from '../types';

interface EmployerDashboardProps {
  jobs: Job[];
  applications: Application[];
  onPostJob: (job: Omit<Job, 'id' | 'created_at'>) => Promise<void>;
  onUpdateApplicationStatus: (id: string, status: 'Pending' | 'Interview' | 'Accepted' | 'Rejected') => Promise<void>;
}

export default function EmployerDashboard({ jobs, applications, onPostJob, onUpdateApplicationStatus }: EmployerDashboardProps) {
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedJobForFilter, setSelectedJobForFilter] = useState<string | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewedApplication, setViewedApplication] = useState<Application | null>(null);

  // Form states for new job
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [type, setType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship'>('Full-time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry-level' | 'Mid-level' | 'Senior' | 'Lead'>('Senior');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState(100000);
  const [salaryMax, setSalaryMax] = useState(150000);
  const [description, setDescription] = useState('');
  const [requirementsInput, setRequirementsInput] = useState('');
  const [postedBy, setPostedBy] = useState('employer-admin@company.com');
  const [submitting, setSubmitting] = useState(false);

  // Handle new job submission
  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !location.trim() || !description.trim()) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    setSubmitting(true);
    const requirements = requirementsInput
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    try {
      await onPostJob({
        title,
        company,
        company_logo: company.toLowerCase().includes('stripe') ? 'stripe' :
                      company.toLowerCase().includes('vercel') ? 'vercel' :
                      company.toLowerCase().includes('supabase') ? 'supabase' :
                      company.toLowerCase().includes('linear') ? 'linear' : 'briefcase',
        description,
        requirements: requirements.length > 0 ? requirements : ['Strong problem-solving skills', 'Team collaboration experience'],
        salary_min: Number(salaryMin),
        salary_max: Number(salaryMax),
        location,
        type,
        experience_level: experienceLevel,
        category,
        posted_by_email: postedBy
      });

      // Reset form
      setTitle('');
      setCompany('');
      setLocation('');
      setDescription('');
      setRequirementsInput('');
      setShowPostModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter application list
  const filteredApplications = applications.filter(app => {
    const matchesJob = selectedJobForFilter === 'all' || app.job_id === selectedJobForFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    // Quick search by applicant name or email
    const matchQuery = !searchTerm ? true : 
      app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      app.applicant_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant_resume.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesJob && matchesStatus && matchQuery;
  });

  const getJobTitle = (jobId: string) => {
    return jobs.find(j => j.id === jobId)?.title || 'Unknown Position';
  };

  const getJobCompany = (jobId: string) => {
    return jobs.find(j => j.id === jobId)?.company || 'Company';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-emerald-100">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Accepted
        </span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-rose-100">
          <XCircle className="w-3.5 h-3.5 text-rose-500" /> Rejected
        </span>;
      case 'Interview':
        return <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-indigo-100">
          <Calendar className="w-3.5 h-3.5 text-indigo-500 animate-pulse" /> Interviewing
        </span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-100">
          <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Review
        </span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Postings</span>
            <h4 className="text-3xl font-bold text-slate-800">{jobs.length}</h4>
            <p className="text-[11px] text-slate-500">Live positions open for applications</p>
          </div>
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Candidates Applied</span>
            <h4 className="text-3xl font-bold text-slate-800">{applications.length}</h4>
            <p className="text-[11px] text-slate-500">Total submitted resumes</p>
          </div>
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1.5 flex-grow">
            <span className="text-xs text-slate-800 font-bold tracking-wider uppercase flex items-center gap-1 font-mono">
              <Plus className="w-3.5 h-3.5 text-slate-700" /> VACANCY MODULE
            </span>
            <h4 className="text-xs text-slate-500 font-medium leading-relaxed">
              Create professional technical openings to attract qualified talent.
            </h4>
            <button
              id="header-create-job-btn"
              onClick={() => setShowPostModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> Publish Position
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Jobs posted */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">Your Posted Positions</h4>
            <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md">
              {jobs.length} Total
            </span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            <button
              id="filter-all-jobs-btn"
              onClick={() => setSelectedJobForFilter('all')}
              className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                selectedJobForFilter === 'all' 
                  ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900' 
                  : 'border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Inbox className="w-4 h-4" /> All Jobs Combined
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {jobs.map(job => (
              <button
                id={`job-filter-item-${job.id}`}
                key={job.id}
                onClick={() => setSelectedJobForFilter(job.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                  selectedJobForFilter === job.id 
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500' 
                    : 'border-slate-100 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-xs leading-tight line-clamp-1">{job.title}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 shrink-0">
                    {job.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{job.company}</span>
                  <span>•</span>
                  <span>{job.location}</span>
                </div>
              </button>
            ))}

            {jobs.length === 0 && (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No jobs posted yet.</p>
                <button
                  id="empty-state-post-btn"
                  onClick={() => setShowPostModal(true)}
                  className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Applicants management table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            {/* Filter Toolbar */}
            <div className="p-5 border-b border-slate-100 space-y-4 bg-slate-50/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Applications Received</h4>
                  <p className="text-xs text-slate-500">
                    {selectedJobForFilter === 'all' 
                      ? 'Showing prospective candidates for all job vacancies' 
                      : `Candidates applying for: "${getJobTitle(selectedJobForFilter)}"`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Filter Status:</span>
                  <select
                    id="employer-status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg text-xs px-2.5 py-1.5 text-slate-700 outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Interview">Interview</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Resume/Candidate Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  id="employer-candidate-search"
                  type="text"
                  placeholder="Search applicants by name, email, or resume experience phrases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Candidate List/Table */}
            <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
              {filteredApplications.map(app => (
                <div key={app.id} className="p-5 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5 flex-grow">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm">{app.applicant_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {app.id.slice(0,8)}</span>
                      {getStatusBadge(app.status)}
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>Email: <span className="text-slate-700 font-semibold">{app.applicant_email}</span></span>
                      <span>•</span>
                      <span>Phone: <span className="text-slate-700 font-semibold">{app.contact_phone}</span></span>
                    </div>

                    <div className="text-xs text-slate-400">
                      Applied for <strong className="text-indigo-600">{getJobTitle(app.job_id)}</strong> at {getJobCompany(app.job_id)}
                    </div>

                    {/* Resume Snapshot Snip */}
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-[11px] text-slate-500 line-clamp-2 max-w-2xl leading-relaxed">
                      {app.applicant_resume}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      id={`view-application-details-btn-${app.id}`}
                      onClick={() => setViewedApplication(app)}
                      className="border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> Raw Resume
                    </button>

                    <div className="bg-slate-100 p-1 rounded-lg flex items-center gap-1 border border-slate-200">
                      <button
                        id={`status-invite-interview-btn-${app.id}`}
                        onClick={() => onUpdateApplicationStatus(app.id, 'Interview')}
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          app.status === 'Interview' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'
                        }`}
                        title="Invite to Interview"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        id={`status-accept-btn-${app.id}`}
                        onClick={() => onUpdateApplicationStatus(app.id, 'Accepted')}
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          app.status === 'Accepted' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-200 text-slate-600'
                        }`}
                        title="Accept Application"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        id={`status-reject-btn-${app.id}`}
                        onClick={() => onUpdateApplicationStatus(app.id, 'Rejected')}
                        className={`p-1 rounded-md transition-all cursor-pointer ${
                          app.status === 'Rejected' ? 'bg-rose-600 text-white' : 'hover:bg-slate-200 text-slate-600'
                        }`}
                        title="Reject Application"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredApplications.length === 0 && (
                <div className="text-center py-16 text-slate-400 bg-slate-50/20">
                  <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-medium">No candidate applications fit this query.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Try expanding/clearing filters or updating posted job categories.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Post Job Position */}
      {showPostModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create a New Job Posting</h3>
                <p className="text-xs text-slate-500">Reach thousands of talented developers instantly</p>
              </div>
              <button
                id="close-post-modal-btn"
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitJob} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="post-job-title" className="block text-xs font-semibold text-slate-700 mb-1">Position Title *</label>
                  <input
                    id="post-job-title"
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="post-job-company" className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                  <input
                    id="post-job-company"
                    type="text"
                    required
                    placeholder="e.g. Stripe"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="post-job-category" className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    id="post-job-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="post-job-type" className="block text-xs font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    id="post-job-type"
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="post-job-experience" className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                  <select
                    id="post-job-experience"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="post-job-location" className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
                  <input
                    id="post-job-location"
                    type="text"
                    required
                    placeholder="e.g. SF, Remote, Seattle"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="post-job-poster" className="block text-xs font-semibold text-slate-700 mb-1">Poster Admin Email</label>
                  <input
                    id="post-job-poster"
                    type="email"
                    required
                    placeholder="employer@mycompany.com"
                    value={postedBy}
                    onChange={(e) => setPostedBy(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Salary ranges slider representation wrapper */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <span className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Salary Range Budget (USD / Year)</span>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="post-job-salary-min" className="block text-[10px] text-slate-400">Minimum Salary</label>
                    <input
                      id="post-job-salary-min"
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="post-job-salary-max" className="block text-[10px] text-slate-400">Maximum Salary</label>
                    <input
                      id="post-job-salary-max"
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="post-job-description" className="block text-xs font-semibold text-slate-700 mb-1">Job Description *</label>
                <textarea
                  id="post-job-description"
                  required
                  rows={4}
                  placeholder="Outline the day-to-day duties, tech stacks utilized, and work-environment description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="post-job-requirements" className="block text-xs font-semibold text-slate-700 mb-1">
                  Key Requirements (separated by comma)
                </label>
                <input
                  id="post-job-requirements"
                  type="text"
                  placeholder="e.g. 3 years React exp, Experience with SQL database, Fluent English"
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  id="cancel-post-job-submit"
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-98 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  id="confirm-post-job-submit"
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Syncing...' : 'Publish Advertisement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Full Resume Pitch */}
      {viewedApplication && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-5/40">
              <div>
                <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">Candidate Profile Dossier</span>
                <h3 className="text-base font-bold text-slate-900">{viewedApplication.applicant_name}</h3>
              </div>
              <button
                id="close-view-resume-modal"
                onClick={() => setViewedApplication(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cover Letter Note</h5>
                <p className="text-xs text-slate-600 bg-indigo-50/20 border border-indigo-50/50 rounded-xl p-3.5 leading-relaxed whitespace-pre-wrap">
                  {viewedApplication.applicant_cover_letter || 'No specific cover letter was provided.'}
                </p>
              </div>

              <div>
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Resume / Background Information</h5>
                <p className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-4 leading-relaxed whitespace-pre-wrap font-sans">
                  {viewedApplication.applicant_resume}
                </p>
              </div>

              {viewedApplication.applicant_github && (
                <div className="flex items-center justify-between bg-slate-900 text-white rounded-xl p-3.5 text-xs">
                  <span className="font-mono text-slate-300">GitHub Profile Link</span>
                  <a
                    id="candidate-github-outlink"
                    href={viewedApplication.applicant_github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-indigo-200 font-semibold"
                  >
                    Visit Repository <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">Contact candidate: <strong className="text-slate-800">{viewedApplication.contact_phone}</strong></span>
              <button
                id="close-resume-footer-btn"
                onClick={() => setViewedApplication(null)}
                className="bg-slate-800 text-white hover:bg-slate-700 px-4 py-2 rounded-xl font-semibold transition-all cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
