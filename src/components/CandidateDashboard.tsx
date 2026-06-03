import React, { useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Send, CheckCircle2, ChevronRight, X, Clock, HelpCircle, User, ArrowLeft, Tag, Calendar, ExternalLink, Activity } from 'lucide-react';
import { Job, Application } from '../types';

interface CandidateDashboardProps {
  jobs: Job[];
  applications: Application[];
  onApplyForJob: (application: Omit<Application, 'id' | 'created_at'>) => Promise<void>;
}

export default function CandidateDashboard({ jobs, applications, onApplyForJob }: CandidateDashboardProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [appliedTrackerEmail, setAppliedTrackerEmail] = useState('');
  const [submittedEmailFilter, setSubmittedEmailFilter] = useState('');

  // Application form states
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantGithub, setApplicantGithub] = useState('');
  const [applicantCoverLetter, setApplicantCoverLetter] = useState('');
  const [applicantResume, setApplicantResume] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  // Categories list derived dynamically
  const categories = ['All', ...Array.from(new Set(jobs.map(j => j.category)))];

  // Filtering logic
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || job.category === categoryFilter;
    const matchesType = typeFilter === 'All' || job.type === typeFilter;
    const matchesLevel = levelFilter === 'All' || job.experience_level === levelFilter;

    return matchesSearch && matchesCategory && matchesType && matchesLevel;
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!applicantName.trim() || !applicantEmail.trim() || !applicantPhone.trim() || !applicantResume.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    setApplying(true);
    try {
      await onApplyForJob({
        job_id: selectedJob.id,
        applicant_name: applicantName.trim(),
        applicant_email: applicantEmail.trim(),
        applicant_cover_letter: applicantCoverLetter.trim(),
        applicant_resume: applicantResume.trim(),
        status: 'Pending',
        contact_phone: applicantPhone.trim(),
        applicant_github: applicantGithub.trim()
      });

      setApplySuccess(true);
      // Auto register tracker email so they see the result immediately
      setAppliedTrackerEmail(applicantEmail.trim());
      setSubmittedEmailFilter(applicantEmail.trim());

      // Reset
      setTimeout(() => {
        setApplicantName('');
        setApplicantEmail('');
        setApplicantPhone('');
        setApplicantGithub('');
        setApplicantCoverLetter('');
        setApplicantResume('');
        setApplySuccess(false);
        setShowApplyModal(false);
      }, 2500);

    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  const getTrackedApplications = () => {
    if (!submittedEmailFilter.trim()) return [];
    return applications.filter(
      app => app.applicant_email.toLowerCase() === submittedEmailFilter.toLowerCase().trim()
    );
  };

  const getJobDetailsForTracked = (jobId: string) => {
    return jobs.find(j => j.id === jobId);
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-emerald-100">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Offer Received
        </span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-rose-100">
          <X className="w-3 h-3 text-rose-500" /> Closed
        </span>;
      case 'Interview':
        return <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-indigo-100 animate-pulse">
          <Calendar className="w-3 h-3 text-indigo-500" /> Interviewing
        </span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-amber-100">
          <Clock className="w-3 h-3 text-amber-500" /> Pending Review
        </span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header Banner */}
      <div className="relative bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 md:p-8 overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 w-80 h-80 bg-slate-100 rounded-full filter blur-[120px] opacity-40 translate-x-20 -translate-y-20 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-60 h-60 bg-slate-50/80 rounded-full filter blur-[100px] opacity-35 -translate-x-10 translate-y-20 pointer-events-none" />

        <div className="relative max-w-2xl space-y-4">
          <span className="inline-flex bg-slate-100 text-slate-800 border border-slate-200 px-3.5 py-1 rounded-full text-[11px] font-semibold">
            ✨ Find your next technical career role
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Explore Open Vacancies on our Live Talent Web App
          </h1>

          {/* Interactive Search Tool */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-xs flex flex-col md:flex-row items-center gap-2 mt-4">
            <div className="flex items-center gap-2 px-3 flex-grow w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                id="candidate-job-search"
                type="text"
                placeholder="Search job title, roles, requirements or tech stack phrases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-slate-800 text-xs py-2.5 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="w-full md:w-auto shrink-0 pr-1 pl-1">
              <select
                id="category-tab-selector"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 w-full md:w-44 text-center cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Categories, Filters, & Job List */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 text-xs">Total Vacancies:</span>
              <span className="bg-slate-100 text-slate-800 text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold">
                {filteredJobs.length} Positions
              </span>
            </div>

            {/* Quick selectors for type & level */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                id="type-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
                <option value="Internship">Internship</option>
              </select>

              <select
                id="level-filter-select"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-600 px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Levels</option>
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          {/* Job listings container */}
          <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredJobs.map(job => {
              const dateObj = new Date(job.created_at || Date.now());
              const timeString = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              
              return (
                <div
                  id={`job-card-${job.id}`}
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`border rounded-2xl p-5 bg-white transition-all transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer relative flex flex-col gap-4 ${
                    selectedJob?.id === job.id 
                      ? 'border-indigo-600 ring-1 ring-indigo-600' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 uppercase font-extrabold text-xs text-indigo-600">
                        {job.company.slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm leading-snug hover:text-indigo-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{job.company}</p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {timeString}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {job.requirements.slice(0, 3).map((req, i) => (
                      <span key={i} className="bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded-full">
                        {req}
                      </span>
                    ))}
                    {job.requirements.length > 3 && (
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        +{job.requirements.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-medium">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.type}
                      </span>
                    </div>

                    <span className="flex items-center gap-0.5 text-slate-800 font-bold font-mono">
                      <DollarSign className="w-3 h-3 text-slate-500 -mr-0.5" />
                      {(job.salary_min / 1000).toFixed(0)}k - {(job.salary_max / 1000).toFixed(0)}k
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-xs">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">No Matching Vacancies Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  We could not find anything matches "{searchQuery}". Try updating categories or utilizing broad level filters instead.
                </p>
                <button
                  id="reset-all-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                    setTypeFilter('All');
                    setLevelFilter('All');
                  }}
                  className="mt-4 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Dynamic selected job details OR Tracker index */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4">
          
          {/* Applications list tracker */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              Dynamic Progress & Application Tracker
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Input your email below to instantly poll and track your pending recruiter applications in real-time.
            </p>

            <div className="flex gap-2">
              <input
                id="applicant-tracker-email-input"
                type="email"
                placeholder="your.email@domain.com"
                value={appliedTrackerEmail}
                onChange={(e) => setAppliedTrackerEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                id="applicant-tracker-check-btn"
                onClick={() => setSubmittedEmailFilter(appliedTrackerEmail)}
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Track
              </button>
            </div>

            {submittedEmailFilter && (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>SEARCH EMAIL: "{submittedEmailFilter}"</span>
                  <span>{getTrackedApplications().length} FOUND</span>
                </div>

                {getTrackedApplications().map(app => {
                  const correlatedJob = getJobDetailsForTracked(app.job_id);
                  return (
                    <div key={app.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 flex flex-col gap-1 text-[11px] relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-slate-800 block">{correlatedJob?.title || 'Unknown Position'}</strong>
                          <span className="text-slate-500 text-[10px]">{correlatedJob?.company || 'Company'}</span>
                        </div>
                        {getStatusPill(app.status)}
                      </div>
                    </div>
                  );
                })}

                {getTrackedApplications().length === 0 && (
                  <p className="text-[11px] text-slate-400 italic text-center py-4">
                    No matching applications found on this email. Apply for positions to register.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Active Job Detail Display */}
          {selectedJob ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold px-2.5 py-1 rounded-full text-[10px] uppercase">
                    {selectedJob.category}
                  </span>
                  <h2 className="text-base font-extrabold text-slate-900 mt-2">{selectedJob.title}</h2>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">{selectedJob.company}</p>
                </div>
                <button
                  id="deselect-job-detail-btn"
                  onClick={() => setSelectedJob(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Attributes line */}
              <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-3.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">LOCATION</span>
                    <span className="font-semibold text-slate-800">{selectedJob.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">JOB TYPE</span>
                    <span className="font-semibold text-slate-800">{selectedJob.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-sky-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">COMPENSATIONS</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      ${selectedJob.salary_min.toLocaleString()} - ${selectedJob.salary_max.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">LEVEL REQ</span>
                    <span className="font-semibold text-slate-800">{selectedJob.experience_level}</span>
                  </div>
                </div>
              </div>

              {/* Description body */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">About the Role</h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedJob.description}
                </p>
              </div>

              {/* Key requirements bulletins */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Necessary Expertise</h4>
                <div className="space-y-2.5">
                  {selectedJob.requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p className="leading-relaxed">{req}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submission CTA callout */}
              <div className="pt-3">
                <button
                  id="open-apply-form-modal-btn"
                  onClick={() => {
                    setApplicantEmail(appliedTrackerEmail);
                    setShowApplyModal(true);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white py-3 rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-100"
                >
                  <Send className="w-4 h-4" /> Apply For This Role
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-3xl p-8 text-center text-slate-400 space-y-2">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">Select a Vacancy</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Review any active listing card detailed requirements, compensations, and submit resumes instantly from this side panel.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal / Slider Overlay: Submit Application documents */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-indigo-600 font-semibold uppercase tracking-wider">APPLYING FOR</span>
                <h3 className="text-base font-bold text-slate-900">{selectedJob.title}</h3>
                <p className="text-xs text-slate-500">{selectedJob.company}</p>
              </div>
              <button
                id="close-apply-modal-header"
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applySuccess ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Application Transmitted Successfully!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your details have been cleanly written onto the DB. The employer will assess your qualifications. Track live updates using your search email <strong className="text-slate-800">"{applicantEmail}"</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apply-name" className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      id="apply-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="apply-email" className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      id="apply-email"
                      type="email"
                      required
                      placeholder="alex.rivera@gmail.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apply-phone" className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      id="apply-phone"
                      type="tel"
                      required
                      placeholder="+1 (555) 019-2834"
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="apply-github" className="block text-xs font-semibold text-slate-700 mb-1">GitHub / Portfolio URL</label>
                    <input
                      id="apply-github"
                      type="url"
                      placeholder="https://github.com/myusername"
                      value={applicantGithub}
                      onChange={(e) => setApplicantGithub(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="apply-cover" className="block text-xs font-semibold text-slate-700 mb-1">Brief Cover Message</label>
                  <textarea
                    id="apply-cover"
                    rows={2}
                    placeholder="Why are you a superb match for this role?"
                    value={applicantCoverLetter}
                    onChange={(e) => setApplicantCoverLetter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="apply-resume" className="block text-xs font-semibold text-slate-700 mb-1">Paste Your Resume Texts / Pitch *</label>
                  <textarea
                    id="apply-resume"
                    required
                    rows={5}
                    placeholder="Paste your historic work achievements, tech credentials, or complete markdown resume texts here..."
                    value={applicantResume}
                    onChange={(e) => setApplicantResume(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button
                    id="cancel-apply-submit"
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-98 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-apply-submit"
                    type="submit"
                    disabled={applying}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {applying ? 'Uploading...' : 'Transmit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
