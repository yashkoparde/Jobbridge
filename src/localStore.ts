import { Job, Application } from './types';

// Cinematic seeds representing high production value roles
export const INITIAL_SEED_JOBS: Job[] = [
  {
    id: 'job-stripe-1',
    title: 'Senior Frontend Architect (React & Tailwind CSS)',
    company: 'Stripe',
    company_logo: 'stripe',
    description: 'We are seeking a Senior Frontend Architect to lead the design and development of our next-generation developer console. You will refine component lifecycles, establish strict design guidelines, and maintain beautiful, high-performance web applications.',
    requirements: [
      '5+ years of extensive commercial expertise with React, TypeScript, and state machines',
      'Flawless command over Tailwind CSS typography, negative spacing, and responsive grids',
      'Solid foundations in system architecture, performance profiling, and accessible web standards',
      'Experience building dashboards with highly interactive charts and micro-animations'
    ],
    salary_min: 155000,
    salary_max: 210000,
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    experience_level: 'Senior',
    category: 'Engineering',
    posted_by_email: 'stripe-careers@stripe.com'
  },
  {
    id: 'job-vercel-2',
    title: 'Interaction Designer & Fluent Prototyper',
    company: 'Vercel',
    company_logo: 'vercel',
    description: 'Join Vercel to shape the premium interactive interface of modern deployment pipelines. You will collaborate seamlessly with product designers and core framework teams to develop and release fluid, high-fidelity React experiences.',
    requirements: [
      'Stellar public portfolio of micro-interactions and custom animation curves',
      'Superb knowledge of React 19 functional patterns, Framer Motion, and layout transitions',
      'Strong empathy for developer tools and UX feedback states',
      'Ability to code clean, fully type-safe components from scratch'
    ],
    salary_min: 130000,
    salary_max: 175000,
    location: 'Remote (US/Europe)',
    type: 'Full-time',
    experience_level: 'Mid-level',
    category: 'Design',
    posted_by_email: 'interaction-recruiting@vercel.com'
  },
  {
    id: 'job-supabase-3',
    title: 'PostgreSQL & Real-time Integration Engineer',
    company: 'Supabase',
    company_logo: 'supabase',
    description: 'Help us deliver open-source database solutions to millions of developers worldwide. You will maintain backend APIs, construct real-time data synchronization schemes, and polish replication listeners.',
    requirements: [
      'Deep expertise in PostgreSQL triggers, row level security policies, and performance tuning',
      'Fluent with Node.js, Go/Rust integrations, and robust API routing setups',
      'Familiarity with open-source engineering philosophies and developer relations',
      'Able to troubleshoot complex connection pools'
    ],
    salary_min: 160000,
    salary_max: 205000,
    location: 'Singapore (Hybrid) or Remote',
    type: 'Full-time',
    experience_level: 'Senior',
    category: 'Engineering',
    posted_by_email: 'careers@supabase.io'
  },
  {
    id: 'job-linear-4',
    title: 'AI Product Specialist Lead',
    company: 'Linear',
    company_logo: 'linear',
    description: 'Looking for a thoughtful product builder to spearhead Linear smart integration services. Your work will empower teams with machine-augmented issue tracking while keeping the main user interface lightweight and responsive.',
    requirements: [
      'First-hand expertise deploying large language model pipelines in production environments',
      'Impeccable eye for clean typography and high-density, bento-style design',
      'Proven team leadership skills with focus on clarity and code quality',
      'Fluent with React, Tailwind, and local-first application models'
    ],
    salary_min: 180000,
    salary_max: 235000,
    location: 'Remote Worldwide',
    type: 'Full-time',
    experience_level: 'Lead',
    category: 'Engineering',
    posted_by_email: 'people@linear.app'
  }
];

export const INITIAL_SEED_APPLICATIONS: Application[] = [
  {
    id: 'app-seed-1',
    job_id: 'job-stripe-1',
    applicant_name: 'Alex Rivera',
    applicant_email: 'alex.rivera@gmail.com',
    applicant_resume: 'Alex is a Senior Frontend Engineer with 6 years of expertise building interfaces at Airbnb and Brex. He excels in performance optimizing, layout animations, and dashboard layout planning.',
    applicant_cover_letter: 'Hi Stripe Recruiting team, I am an enthusiastic Stripe user and would love to bring my attention to detail to the core UI components of your product dashboard.',
    status: 'Pending',
    contact_phone: '+1 (555) 789-0123',
    applicant_github: 'https://github.com/alexrivera-dev'
  }
];

// Local DB operations
export function getStoredJobs(): Job[] {
  const data = localStorage.getItem('jobbridge_jobs');
  if (!data) {
    localStorage.setItem('jobbridge_jobs', JSON.stringify(INITIAL_SEED_JOBS));
    return INITIAL_SEED_JOBS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SEED_JOBS;
  }
}

export function saveStoredJob(job: Omit<Job, 'id' | 'created_at'>): Job {
  const jobs = getStoredJobs();
  const newJob: Job = {
    ...job,
    id: `job-custom-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  localStorage.setItem('jobbridge_jobs', JSON.stringify([newJob, ...jobs]));
  return newJob;
}

export function getStoredApplications(): Application[] {
  const data = localStorage.getItem('jobbridge_applications');
  if (!data) {
    localStorage.setItem('jobbridge_applications', JSON.stringify(INITIAL_SEED_APPLICATIONS));
    return INITIAL_SEED_APPLICATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SEED_APPLICATIONS;
  }
}

export function saveStoredApplication(app: Omit<Application, 'id' | 'created_at'>): Application {
  const apps = getStoredApplications();
  const newApp: Application = {
    ...app,
    id: `app-custom-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  localStorage.setItem('jobbridge_applications', JSON.stringify([newApp, ...apps]));
  return newApp;
}

export function updateStoredApplicationStatus(id: string, status: 'Pending' | 'Interview' | 'Accepted' | 'Rejected'): boolean {
  const apps = getStoredApplications();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) return false;
  apps[index].status = status;
  localStorage.setItem('jobbridge_applications', JSON.stringify(apps));
  return true;
}
