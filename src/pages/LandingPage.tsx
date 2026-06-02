/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Briefcase, ArrowRight, ShieldCheck, CheckSquare, Search, Zap, Building } from 'lucide-react';

interface LandingPageProps {
  setView: (view: string) => void;
  user: any;
}

export default function LandingPage({ setView, user }: LandingPageProps) {
  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'employer') {
        setView('employer-dashboard');
      } else if (user.role === 'employee') {
        setView('employee-dashboard');
      } else {
        setView('admin-dashboard');
      }
    } else {
      setView('register');
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 mb-5">
                Connecting talent with opportunity
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                The modern hiring bridge <br />
                <span className="text-blue-600">for business professionals.</span>
              </h1>
              <p className="mt-4 text-base text-gray-500 sm:mt-5 sm:text-lg">
                JobBridge streamlines job posting and simple career transitions. Built on lightning-fast architectures, we eliminate bureaucratic friction and replace it with direct connectivity.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto lg:mx-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setView('jobs')}
                  className="inline-flex justify-center items-center px-5 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 shadow transition cursor-pointer"
                  id="landing-hero-jobs-btn"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Jobs Now
                </button>
                <button
                  onClick={handleGetStarted}
                  className="inline-flex justify-center items-center px-5 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition cursor-pointer"
                  id="landing-hero-getstarted-btn"
                >
                  <span>{user ? "View My Dashboard" : "Create Free Account"}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </button>
              </div>
            </div>

            {/* Right Side Visual Graphic Component (Using Tailwind CSS grid & layout to mimic a mock platform UI) */}
            <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-150 p-6 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="h-3 w-3 rounded-full bg-red-400"></span>
                    <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                    <span className="h-3 w-3 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-xs font-mono text-gray-400">JobBridge Engine</span>
                </div>
                
                <div className="mt-5 space-y-4">
                  <div className="border border-gray-100 rounded-lg p-3.5 bg-blue-50/50 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">TF</div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Senior React Engineer</h4>
                        <p className="text-xs text-gray-500">TechFlow Systems • SF, CA</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium text-white bg-blue-600 rounded">Apply</span>
                  </div>

                  <div className="border border-gray-100 rounded-lg p-3.5 bg-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-md bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">CL</div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Lead Brand Designer</h4>
                        <p className="text-xs text-gray-500">CreativeLabs • Remote</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded">Remote</span>
                  </div>

                  <div className="border border-gray-100 rounded-lg p-3.5 bg-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-md bg-amber-100 flex items-center justify-center font-bold text-amber-700 text-sm">RC</div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">Growth Marketer</h4>
                        <p className="text-xs text-gray-500">RetailCorp • NY, NY</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-medium text-amber-750 bg-amber-50 rounded">Full-time</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between text-xs text-gray-400 font-mono">
                  <span>● SSL SECURE</span>
                  <span>PRE-AUDITED CANDIDATES</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100">
              <div className="text-4xl font-extrabold text-blue-600">350+</div>
              <div className="mt-1 text-sm font-medium text-gray-500">Active Job Postings</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100">
              <div className="text-4xl font-extrabold text-blue-600">80+</div>
              <div className="mt-1 text-sm font-medium text-gray-500">Verified Companies</div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg text-center border border-gray-100">
              <div className="text-4xl font-extrabold text-blue-600">1,200+</div>
              <div className="mt-1 text-sm font-medium text-gray-500">Applications Submitted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Value Propositions */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Core Pillars</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
              Why leading enterprises hire on JobBridge
            </p>
            <p className="mt-4 max-w-2xl text-base text-gray-500 mx-auto">
              We leverage clean technology to bypass agency intermediaries and place qualified talent directly into scaling companies.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 border border-gray-100 h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-md text-white">
                        <ShieldCheck className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-gray-900 tracking-tight">Verified Environments</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Every company is meticulously checked. No phantom job postings, scam operations, or redundant external links. Direct applications only.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 border border-gray-100 h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-md text-white">
                        <CheckSquare className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-gray-900 tracking-tight">One-Click PDF Submissions</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Upload your standard resume once. Submit tailored cover letters and track status live directly from your candidate terminal dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8 border border-gray-100 h-full">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-md shadow-md text-white">
                        <Building className="h-6 w-6" />
                      </span>
                    </div>
                    <h3 className="mt-6 text-lg font-bold text-gray-900 tracking-tight">Employer Decision Pipeline</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Employers can evaluate resumes and toggle candidate status ('Accepted', 'Rejected', 'Pending') in Real-Time. Instant status transparency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
            <span className="block">Ready to bridge the gap?</span>
            <span className="block text-blue-100 text-xl font-normal mt-2">Unlock access to premium job vacancies and talent pools today.</span>
          </h2>
          <div className="mt-8 flex justify-center space-x-3">
            <button
              onClick={() => setView('jobs')}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 shadow cursor-pointer"
              id="landing-cta-jobs-btn"
            >
              Browse Open Roles
            </button>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 shadow-sm cursor-pointer"
              id="landing-cta-signup-btn"
            >
              Get Started Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
