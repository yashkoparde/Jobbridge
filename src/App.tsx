import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CandidateDashboard from './components/CandidateDashboard';
import EmployerDashboard from './components/EmployerDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getStoredJobs, 
  saveStoredJob, 
  getStoredApplications, 
  saveStoredApplication, 
  updateStoredApplicationStatus 
} from './localStore';
import { Job, Application } from './types';
import { 
  Sparkles, 
  Tv, 
  Users, 
  Layers, 
  Activity, 
  ArrowRight, 
  Film, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clapperboard, 
  Eye, 
  UserSquare 
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<'employee' | 'employer'>('employee');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  
  // HBO Intro played status
  const [introCompleted, setIntroCompleted] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem('hb_intro_played');
    }
    return false;
  });

  // Login flow parameters
  const [loginRole, setLoginRole] = useState<'employee' | 'employer' | null>('employee'); // default to seeker for faster access
  const [fullname, setFullname] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [loginError, setLoginError] = useState('');

  // Local storage lists
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Load persistence database on initial mount
  useEffect(() => {
    // Check if user session was saved
    const savedUser = localStorage.getItem('jobbridge_active_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setRole(parsed.role || 'employee');
      } catch {
        // Clear corrupt state
        localStorage.removeItem('jobbridge_active_user');
      }
    }

    setJobs(getStoredJobs());
    setApplications(getStoredApplications());
  }, []);

  // Timer to conclude high-end landing animation
  useEffect(() => {
    if (!introCompleted) {
      const timer = setTimeout(() => {
        setIntroCompleted(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('hb_intro_played', 'true');
        }
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [introCompleted]);

  const triggerToast = (type: 'success' | 'info', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Login handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !emailAddress.trim()) {
      setLoginError('Complete both credentials to secure access.');
      return;
    }
    if (!emailAddress.includes('@')) {
      setLoginError('Specify a valid email address.');
      return;
    }

    const selectedRole = loginRole || 'employee';
    const newUser = {
      name: fullname.trim(),
      email: emailAddress.trim(),
      role: selectedRole
    };

    localStorage.setItem('jobbridge_active_user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    setRole(selectedRole);
    triggerToast('success', `Welcome back, ${newUser.name}. Entering the JobBridge Workspace…`);
    
    // Reset login form
    setFullname('');
    setEmailAddress('');
    setLoginError('');
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('jobbridge_active_user');
    setCurrentUser(null);
    setLoginRole(null);
    triggerToast('info', 'Securely logged out from JobBridge original session.');
  };

  // Job creation handler (Recruiter view)
  const handlePostJob = async (job: Omit<Job, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const saved = saveStoredJob(job);
      setJobs(prev => [saved, ...prev]);
      triggerToast('success', `Position "${job.title}" has been successfully broadcast!`);
    } catch (err: any) {
      triggerToast('info', `Failed publishing: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Apply submission handler (Candidate view)
  const handleApplyForJob = async (application: Omit<Application, 'id' | 'created_at'>) => {
    setLoading(true);
    try {
      const saved = saveStoredApplication(application);
      setApplications(prev => [saved, ...prev]);
      triggerToast('success', `Application has been transmitted to ${jobs.find(j => j.id === application.job_id)?.company || 'the employer'}!`);
    } catch (err: any) {
      triggerToast('info', `Failure sending proposal: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Application status modifier (Recruiter view)
  const handleUpdateApplicationStatus = async (id: string, status: 'Pending' | 'Interview' | 'Accepted' | 'Rejected') => {
    try {
      const success = updateStoredApplicationStatus(id, status);
      if (success) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
        triggerToast('success', `Updated candidate eligibility to "${status}".`);
      }
    } catch (err: any) {
      triggerToast('info', `Failed status commit: ${err.message || err}`);
    }
  };  // If user session is inactive, run HBO-level cinema intro transition OR beautiful Light-themed Login Portal
  if (!introCompleted) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col items-center justify-center font-sans overflow-hidden select-none relative">
        {/* Cinematic Shimmering background grain & static simulation */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.05),_rgba(0,255,0,0.02),_rgba(0,0,255,0.05))] bg-[size:100%_4px,_6px_100%] opacity-15 pointer-events-none" />

        <div className="text-center space-y-7 max-w-xl px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] md:text-xs font-mono font-bold tracking-[0.35em] text-amber-500/80 uppercase"
          >
            A JOBBRIDGE ORIGINAL
          </motion.div>

          <div className="relative inline-block py-2">
            {/* The main logo text with elegant cinematic zoom and glow */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.94, letterSpacing: '0.1em' }}
              animate={{ 
                opacity: [0, 0.5, 0.9, 1], 
                scale: [0.94, 0.97, 1.01, 1.03],
                letterSpacing: ['0.1em', '0.22em', '0.33em', '0.35em']
              }}
              transition={{ duration: 2.6, ease: [0.25, 1, 0.5, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-[0.35em] font-serif uppercase relative"
              style={{
                textShadow: '0 0 50px rgba(0,0,0,0.9), 0 0 15px rgba(245, 158, 11, 0.2)',
                background: 'linear-gradient(135deg, #ffffff 30%, #fef3c7 70%, #d97706 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              JOBBRIDGE
            </motion.h1>

            {/* Simulated lens flare beam passing across the logo */}
            <motion.div 
              initial={{ left: '-50%', opacity: 0 }}
              animate={{ left: '150%', opacity: [0, 0.6, 0.6, 0] }}
              transition={{ duration: 2.0, delay: 0.4, ease: "easeInOut" }}
              className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-amber-400/20 to-transparent skew-x-30 blur-md pointer-events-none"
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.8, 1] }}
            transition={{ duration: 2.4, delay: 0.7 }}
            className="text-[9px] md:text-[10px] tracking-[0.25em] text-slate-400/70 font-mono uppercase"
          >
            PREMIER CAREER CONNECTIONS • EST. 2026
          </motion.p>
        </div>

        {/* Bottom subtle progress line */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-slate-800 overflow-hidden">
          <motion.div 
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.6, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300"
          />
        </div>
      </div>
    );
  }

  // If user session is inactive, show the spectacular light-themed corporate landing starting with role login options immediately
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-slate-900 flex flex-col justify-between selection:bg-slate-900 selection:text-white font-sans relative overflow-x-hidden">
        
        {/* Minimal Corporate Header */}
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md relative z-10 py-5 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="bg-slate-900 text-white font-black px-2.5 py-1 text-xs rounded-lg uppercase tracking-wider">
                JB
              </span>
              <span className="font-extrabold text-slate-900 tracking-[0.05em] text-sm uppercase">
                JobBridge
              </span>
              <span className="hidden sm:inline-block h-4 w-[1px] bg-slate-300 mx-2" />
              <span className="hidden sm:inline-block text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-0.5">
                Professional Career Workspace
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-mono text-slate-500 font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Secure Sandbox Verified
              </span>
            </div>
          </div>
        </header>

        {/* Main Workspace Frame */}
        <main className="flex-grow flex flex-col items-center justify-center max-w-4xl w-full mx-auto px-6 py-10 md:py-16 relative z-10 space-y-12">
          
          {/* Section 1: Role choices presented RIGHT at the top before details as requested */}
          <section className="w-full space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] text-slate-500 font-extrabold tracking-[0.2em] uppercase font-mono">
                System Access Gate
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Select Your Access Role & Signature Profile
              </h2>
            </div>

            {/* Role switcher segment */}
            <div className="max-w-md mx-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200 flex items-center">
              <button
                id="role-select-seeker-button"
                type="button"
                onClick={() => {
                  setLoginRole('employee');
                  setLoginError('');
                }}
                className={`flex-1 py-3 text-center rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  loginRole === 'employee'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-205'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Job Seeker
              </button>

              <button
                id="role-select-employer-button"
                type="button"
                onClick={() => {
                  setLoginRole('employer');
                  setLoginError('');
                }}
                className={`flex-1 py-3 text-center rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  loginRole === 'employer'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-205'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Employer / Recruiter
              </button>
            </div>

            {/* Credentials credentials form container */}
            <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm relative animate-in fade-in zoom-in-98 duration-150">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest block">
                  {loginRole === 'employee' ? 'JOB SEEKER WORKSPACE' : 'EMPLOYER PUBLICATION MODULE'}
                </span>
                <p className="text-xs text-slate-500">
                  {loginRole === 'employee' 
                    ? 'Submit full name and email to explore verified technical vacancies.' 
                    : 'Log in using your organization credentials to coordinate vacancy contracts.'
                  }
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="bg-rose-50 border border-rose-100 rounded-xl p-3.5 text-xs text-rose-700 flex items-center gap-2 font-mono">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="login-fullname-input" className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      Full Name
                    </label>
                    <input
                      id="login-fullname-input"
                      type="text"
                      required
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="login-email-input" className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                      Business Email Address
                    </label>
                    <input
                      id="login-email-input"
                      type="email"
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="alex.rivera@company.com"
                      className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="submit-cine-login-btn"
                    type="submit"
                    className="w-full cursor-pointer text-center font-mono text-xs font-bold tracking-wider uppercase inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white px-6 py-3.5 rounded-xl shadow-xs transition-all"
                  >
                    Enter Corporate Workspace <ArrowRight className="w-4 h-4 ml-1 stroke-[2.5]" />
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Section 2: Clean, non-cringe Corporate Hero Description and Highlights underneath selection */}
          <section className="text-center space-y-4 max-w-2xl mx-auto border-t border-slate-200/80 pt-10">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              Specialized Infrastructure For Engineering Alignment
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto">
              Connecting professional software engineers with reliable technology companies. Discover verified compensation budgets, streamline candidate reviews, and secure placement tracking under one unified pipeline.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 text-left">
              <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-1.5 shadow-2xs">
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  TRANSPARENCY
                </span>
                <h4 className="text-xs font-bold text-slate-800">
                  Pre-determined Salary Budgets
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Every contract listing displays explicit yearly budgets, remote work formats, and technical dependencies.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-1.5 shadow-2xs">
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  ROUTING
                </span>
                <h4 className="text-xs font-bold text-slate-800">
                  Direct Talent Alignment
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Applications bypass opaque filters. Background transcripts are written cleanly into the secure candidate database.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4.5 space-y-1.5 shadow-2xs">
                <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  EFFICIENCY
                </span>
                <h4 className="text-xs font-bold text-slate-800">
                  Sandbox Simulation
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Review workflows utilizing our dual seeker-employer profile switchers. Fully operational within local state storage.
                </p>
              </div>
            </div>
          </section>

        </main>

        {/* Minimal styled footer */}
        <footer className="border-t border-slate-200 py-8 px-6 text-center text-[10px] text-slate-500 font-mono tracking-wider relative z-10 bg-white">
          <p>© 2026 JOBBRIDGE PORTALS. SECURED UNDER ENHANCED LOCAL WORKSPACE PROTOCOLS.</p>
        </footer>

      </div>
    );
  }

  // Active Session Portal (The Core Dashboard)
  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900 font-sans flex flex-col justify-between">
      
      {/* Sticky header navigation */}
      <Navbar
        currentRole={role}
        onChangeRole={(newRole) => setRole(newRole)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Floating status alert toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white text-slate-900 rounded-2xl p-4 shadow-xl border border-slate-200 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <h5 className="text-[10px] font-bold font-mono tracking-wider text-slate-505">SYSTEM DIALOG</h5>
            <p className="text-[11px] text-slate-705 leading-relaxed font-semibold">{notification.text}</p>
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
        
        {/* Welcome Back & Hero Dashboard Header */}
        <div className="bg-white text-slate-900 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-slate-100 rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="space-y-2 relative z-10">
            <span className="text-[9px] font-bold tracking-[0.25em] uppercase font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-md inline-block">
              WORKSPACE ACTIVE
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase font-mono tracking-tight text-slate-900">
                JOBBRIDGE WORKSPACE
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-md">
              Welcome back, <span className="text-slate-900 font-bold">{currentUser.name}</span>. Currently signed in as a <span className="text-slate-900 font-bold uppercase">{role === 'employee' ? 'Job Seeker' : 'Employer'}</span>. Use the profile switcher to explore features.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              {jobs.length} Positions Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {applications.length} Candidates Curated
            </span>
          </div>
        </div>

        {/* Screen layout loaders */}
        {loading ? (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8 shadow-xs space-y-4">
            <div className="w-8 h-8 border-3 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest font-mono">SYNCHRONIZING PORTFOLIOS</span>
              <p className="text-xs text-slate-500 font-medium">Updating direct workspace metrics and caching connection tables...</p>
            </div>
          </div>
        ) : (
          <div className="transition-all duration-300">
            {role === 'employee' ? (
              <CandidateDashboard
                jobs={jobs}
                applications={applications}
                onApplyForJob={handleApplyForJob}
              />
            ) : (
              <EmployerDashboard
                jobs={jobs}
                applications={applications}
                onPostJob={handlePostJob}
                onUpdateApplicationStatus={handleUpdateApplicationStatus}
              />
            )}
          </div>
        )}
      </main>

      {/* Styled minimalistic footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span className="font-semibold tracking-wider font-mono">
            © 2026 JOBBRIDGE PORTALS. ALL RIGHTS RESERVED.
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SECURE WORKSPACE ACTIVE
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
