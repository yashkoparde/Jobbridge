/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Filter, RefreshCw, Bookmark, BookmarkCheck, Calendar, ArrowRight } from 'lucide-react';
import { Job, User } from '../types.js';

interface JobListingsPageProps {
  user: User | null;
  setView: (view: string) => void;
  setSelectedJobId: (id: string) => void;
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function JobListingsPage({ user, setView, setSelectedJobId, showNotification }: JobListingsPageProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // States for search and filtering
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [category, setCategory] = useState('All');
  const [salary, setSalary] = useState('All');
  const [experience, setExperience] = useState('All');
  const [type, setType] = useState('All');

  // Saved Jobs tracking
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Category list
  const categoriesList = ["All", "Engineering", "Design", "Marketing", "Finance", "Human Resources"];
  const locationsList = ["All", "San Francisco, CA", "Remote", "New York, NY", "Dallas, TX", "Chicago, IL"];
  const experienceList = ["All", "0-1 years", "2-4 years", "5+ years"];
  const typesList = ["All", "Full-time", "Part-time", "Contract", "Remote"];
  const salaryTiers = [
    { value: "All", label: "All Salaries" },
    { value: "$60k-$100k", label: "$60k - $100k" },
    { value: "$100k+", label: "$100k+ / Year" }
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        location,
        category,
        salary,
        experience,
        type,
        page: String(currentPage),
        limit: "6"
      });
      const response = await fetch(`/api/jobs?${queryParams}`);
      if (!response.ok) {
        throw new Error('Could not fetch jobs');
      }
      const data = await response.json();
      setJobs(data.jobs);
      setTotalJobs(data.total);
      setTotalPages(data.pages);
    } catch (err: any) {
      console.error(err);
      showNotification('Error loading job postings from server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedJobs = async () => {
    if (!user || user.role !== 'employee') return;
    try {
      const response = await fetch(`/api/saved-jobs?employee_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setSavedJobIds(data.map((s: any) => s.job!.id));
      }
    } catch (err) {
      console.error('Error fetching saved roles:', err);
    }
  };

  // Trigger search on filter changes or page changes
  useEffect(() => {
    fetchJobs();
  }, [currentPage, location, category, salary, experience, type]);

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const resetFilters = () => {
    setSearch('');
    setLocation('All');
    setCategory('All');
    setSalary('All');
    setExperience('All');
    setType('All');
    setCurrentPage(1);
  };

  const handleToggleSave = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering details navigation
    if (!user) {
      showNotification('Please Sign In to save jobs.', 'error');
      setView('login');
      return;
    }
    if (user.role !== 'employee') {
      showNotification('Only Candidates can save job postings.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/saved-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: user.id, job_id: jobId })
      });
      if (!res.ok) throw new Error();
      const payload = await res.json();
      
      if (payload.status === 'saved') {
        setSavedJobIds([...savedJobIds, jobId]);
        showNotification('Job posting bookmarked successfully.', 'success');
      } else {
        setSavedJobIds(savedJobIds.filter(id => id !== jobId));
        showNotification('Job posting removed from bookmarks.', 'success');
      }
    } catch (err) {
      showNotification('Could not save job listing.', 'error');
    }
  };

  const handleViewJob = (jobId: string) => {
    setSelectedJobId(jobId);
    setView('job-details');
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title space */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-950 tracking-tight leading-none">Find Your Next Role</h1>
          <p className="text-sm text-gray-500 mt-1.5">Search and filter active job openings at premium corporate organizations.</p>
        </div>

        {/* Central Grid: Filters (Left) & Results (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Side filter panel (Desktop) */}
          <div className="lg:col-span-1 bg-white border border-gray-200 p-5 rounded-lg shadow-sm h-fit">
            <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-150">
              <span className="font-bold text-gray-900 text-sm uppercase tracking-wide flex items-center">
                <Filter className="h-4 w-4 mr-2 text-blue-600" />
                Filter Workspace
              </span>
              <button 
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                id="reset-filters-btn"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 outline-none"
                id="filter-category"
              >
                {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Location Filter */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => { setLocation(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 outline-none"
                id="filter-location"
              >
                {locationsList.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
            </div>

            {/* Salary Tier Filter */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Annual Salary</label>
              <select
                value={salary}
                onChange={(e) => { setSalary(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 outline-none"
                id="filter-salary"
              >
                {salaryTiers.map(tier => <option key={tier.value} value={tier.value}>{tier.label}</option>)}
              </select>
            </div>

            {/* Experience Filter */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Experience</label>
              <select
                value={experience}
                onChange={(e) => { setExperience(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 outline-none"
                id="filter-experience"
              >
                {experienceList.map(exp => <option key={exp} value={exp}>{exp}</option>)}
              </select>
            </div>

            {/* Employment Type Filter */}
            <div className="mb-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Employment Type</label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); setCurrentPage(1); }}
                className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 bg-gray-50 outline-none"
                id="filter-type"
              >
                {typesList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Results Area (Right side) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex space-x-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Query titles, company name, skills (e.g. React, fullstack)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm pl-9 pr-4 py-2 border-0 outline-none focus:ring-0"
                  id="search-input"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer shrink-0 shadow-sm"
                id="search-submit-btn"
              >
                Search
              </button>
            </form>

            {/* Status counts */}
            <div className="flex justify-between items-center text-xs text-gray-500 px-1">
              <span>Showing <strong>{jobs.length}</strong> of <strong>{totalJobs}</strong> jobs available</span>
              {loading && <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />}
            </div>

            {/* Listings Stream */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white border border-gray-150 h-32 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-500 text-sm mb-4">No active job listings match your dynamic criteria.</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition cursor-pointer"
                  id="notfound-reset-btn"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {jobs.map((job) => {
                  const isSaved = savedJobIds.includes(job.id);
                  const formattedDate = new Date(job.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <div 
                      key={job.id}
                      onClick={() => handleViewJob(job.id)}
                      className="bg-white border border-gray-200 hover:border-blue-400 p-5 rounded-lg shadow-sm transition hover:shadow-md cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center relative"
                      id={`job-card-${job.id}`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Company Logo representation */}
                        <div className="h-12 w-12 rounded border border-gray-100 flex-shrink-0 bg-gray-50 overflow-hidden flex items-center justify-center">
                          {job.company?.logo_url ? (
                            <img 
                              src={job.company.logo_url} 
                              alt={job.company.company_name} 
                              className="h-full w-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="font-extrabold text-blue-600 text-sm uppercase">
                              {job.company?.company_name.slice(0, 2) || "CO"}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 leading-none">
                              {job.title}
                            </h3>
                          </div>
                          
                          <p className="text-xs font-medium text-blue-600 mt-1">
                            {job.company?.company_name}
                          </p>

                          <div className="flex flex-wrap gap-y-1 gap-x-3 items-center mt-3 text-xs text-gray-500">
                            <span className="flex items-center"><MapPin className="h-3 w-3 mr-1 text-gray-400 shrink-0" /> {job.location}</span>
                            <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1 text-gray-400 shrink-0" /> {job.salary}</span>
                            <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1 text-gray-400 shrink-0" /> {formattedDate}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3.5">
                            <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-xxs text-gray-600 uppercase font-bold tracking-wider">
                              {job.employment_type}
                            </span>
                            <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-xxs text-gray-600 uppercase font-bold tracking-wider">
                              {job.experience_required}
                            </span>
                            <span className="px-2 py-0.5 rounded border-blue-100 bg-blue-50/55 text-xxs text-blue-700 uppercase font-semibold">
                              {job.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right-aligned Buttons */}
                      <div className="mt-4 md:mt-0 w-full md:w-auto flex md:flex-col items-center md:items-end justify-between md:justify-center space-y-0 md:space-y-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                        {user?.role === 'employee' && (
                          <button
                            onClick={(e) => handleToggleSave(job.id, e)}
                            className="p-2 rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition cursor-pointer bg-white"
                            title={isSaved ? "Saved" : "Save Job"}
                            id={`save-btn-${job.id}`}
                          >
                            {isSaved ? (
                              <BookmarkCheck className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Bookmark className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <span className="flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
                          View details
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </span>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-transparent px-4 py-4 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-40"
                    id="mobile-pagination-prev"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer disabled:opacity-40"
                    id="mobile-pagination-next"
                  >
                    Next
                  </button>
                </div>
                
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-gray-500">
                      Page <span className="font-semibold">{currentPage}</span> of{' '}
                      <span className="font-semibold">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-40"
                        id="desktop-pagination-prev"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPage(idx + 1)}
                          className={`relative inline-flex items-center border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer ${
                            currentPage === idx + 1 ? 'z-10 bg-blue-50 text-blue-600 border-blue-500' : 'bg-white'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 cursor-pointer disabled:opacity-40"
                        id="desktop-pagination-next"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
