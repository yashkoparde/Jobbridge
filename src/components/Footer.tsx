/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Briefcase } from 'lucide-react';

interface FooterProps {
  setView: (view: string) => void;
}

export default function Footer({ setView }: FooterProps) {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-xs text-gray-500 font-medium">
          
          {/* Logo stamp */}
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <span className="font-sans text-gray-900 font-bold text-sm tracking-tight">
              Job<span className="text-blue-600">Bridge</span>
            </span>
          </div>

          {/* Links list */}
          <div className="flex space-x-6">
            <button onClick={() => setView('jobs')} className="hover:text-blue-600 cursor-pointer transition">Browse Openings</button>
            <button onClick={() => setView('about')} className="hover:text-blue-600 cursor-pointer transition">About System</button>
            <button onClick={() => setView('contact')} className="hover:text-blue-600 cursor-pointer transition">Contact Desk</button>
          </div>

          {/* Copyright description */}
          <div>
            <span>© {new Date().getFullYear()} JobBridge. Built for robust, simple business transactions.</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
