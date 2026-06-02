/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, Users, BookOpen, Key } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* About Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">About JobBridge</h1>
          <p className="mt-4 text-lg text-gray-500">
            We are dedicated to building robust channels that link qualified human talent with scaling organizations. No agency fees, no spam, just direct, high-value visual connection.
          </p>
        </div>

        {/* Mission grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Our Mission</h2>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              Founded in 2024, JobBridge was born out of a simple frustration: candidate screening processes are slow, opaque, and over-engineered. Recruiters spend hours crawling cold emails, while outstanding engineers and designers get buried in heavy algorithmic ATS filters.
            </p>
            <p className="mt-4 text-base text-gray-600 leading-relaxed">
              JobBridge shifts authorization back to human hands. By offering active candidate status alerts, real-time feedback on submissions, and an administrative hub that allows employers and candidates to connect, we make recruitment personal, accurate, and rapid.
            </p>
          </div>
          <div className="bg-gray-50 p-8 rounded-lg border border-gray-150">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              Strategic Milestones
            </h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">✓</span>
                <span>Bridged over 10,000 interviews in our ecosystem.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">✓</span>
                <span>Supported 500+ startups with rapid staffing.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">✓</span>
                <span>Established safe RLS database rules ensuring candidate file security.</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">✓</span>
                <span>Maintained a 98% positive employer evaluation rating.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Our Core Principles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="border border-gray-150 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-md inline-block mb-4">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Absolute Transparency</h3>
              <p className="text-sm text-gray-500">
                We believe in immediate status disclosures. Candidates deserve to know if their application was rejected or accepted, instantly.
              </p>
            </div>

            <div className="border border-gray-150 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-md inline-block mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Human-First Design</h3>
              <p className="text-sm text-gray-500">
                No complex algorithmic automation or automated filtering slop. We optimize for high readability and easy, minimal data retrieval.
              </p>
            </div>

            <div className="border border-gray-150 p-6 rounded-lg bg-white shadow-sm hover:shadow-md transition">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-md inline-block mb-4">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Quality Standards</h3>
              <p className="text-sm text-gray-500">
                Our administrators review live listings constantly, purging inappropriate content to guarantee an environment of trust.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
