import React from 'react';
import { Briefcase, User, Eye, LogOut } from 'lucide-react';

interface NavbarProps {
  currentRole: 'employee' | 'employer';
  onChangeRole: (role: 'employee' | 'employer') => void;
  currentUser: { name: string; email: string } | null;
  onLogout: () => void;
}

export default function Navbar({ currentRole, onChangeRole, currentUser, onLogout }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-250 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Rebranded Logo - JobBridge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xs font-mono font-bold text-xs tracking-tight">
            JB
          </div>
          <div>
            <span className="font-extrabold text-slate-900 tracking-[0.08em] text-sm uppercase font-mono">JobBridge</span>
            <span className="block text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Professional Career Portal</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {currentUser && (
            <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
              Active Session: <span className="font-sans font-bold text-slate-800 ml-1 bg-slate-100 px-2 py-1 rounded-md text-[10px]">{currentUser.name} ({currentUser.email})</span>
            </div>
          )}

          {/* Dual Profile switcher tabs resembling a segmented slider */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              id="switch-role-seeker-btn"
              onClick={() => onChangeRole('employee')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                currentRole === 'employee'
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3 h-3" /> Seeker
            </button>

            <button
              id="switch-role-employer-btn"
              onClick={() => onChangeRole('employer')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                currentRole === 'employer'
                  ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200/60'
                  : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <User className="w-3 h-3" /> Employer
            </button>
          </div>

          {/* Exit Portal / Logout Button */}
          <button
            id="exit-portal-btn"
            onClick={onLogout}
            title="Exit Session"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline font-mono tracking-wider text-[10px]">LOGOUT</span>
          </button>
        </div>

      </div>
    </header>
  );
}

