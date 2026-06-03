import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Job, Application, SupabaseConfig } from './types';

// Beautiful layout template values used strictly for seeding the remote Supabase database
export const SEED_JOBS: Omit<Job, 'id' | 'created_at'>[] = [
  {
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

export const SEED_APPLICATIONS: Omit<Application, 'id' | 'created_at'>[] = [
  {
    job_id: '', // Connected dynamically during seed operations
    applicant_name: 'Alex Rivera',
    applicant_email: 'alex.rivera@gmail.com',
    applicant_resume: 'Alex is a Senior Frontend Engineer with 6 years of expertise building interfaces at Airbnb and Brex. He excels in performance optimizing, layout animations, and dashboard layout planning.',
    applicant_cover_letter: 'Hi Stripe Recruiting team, I am an enthusiastic Stripe user and would love to bring my attention to detail to the core UI components of your product dashboard.',
    status: 'Pending',
    contact_phone: '+1 (555) 789-0123',
    applicant_github: 'https://github.com/alexrivera-dev'
  }
];

export function getSupabaseConfig(): SupabaseConfig | null {
  // 1. Try environment variables first
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }
  
  // 2. Try localStorage secondary
  const url = localStorage.getItem('supabase_url');
  const anonKey = localStorage.getItem('supabase_anon_key');
  if (url && anonKey) {
    return { url, anonKey };
  }
  return null;
}

export function saveSupabaseConfig(config: SupabaseConfig | null) {
  if (config) {
    localStorage.setItem('supabase_url', config.url.trim());
    localStorage.setItem('supabase_anon_key', config.anonKey.trim());
  } else {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
  }
}

let supabaseInstance: SupabaseClient | null = null;
let currentConfigString = '';

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const activeConfig = config || getSupabaseConfig();
  if (!activeConfig) {
    supabaseInstance = null;
    return null;
  }
  
  const configString = `${activeConfig.url}_${activeConfig.anonKey}`;
  if (supabaseInstance && currentConfigString === configString) {
    return supabaseInstance;
  }
  
  try {
    supabaseInstance = createClient(activeConfig.url, activeConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentConfigString = configString;
    return supabaseInstance;
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return null;
  }
}

// Check database connection and verify table structures
export async function testSupabaseConnection(config: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    const client = createClient(config.url, config.anonKey);
    // Attempt to select from jobs
    const { data, error } = await client.from('jobs').select('id').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('relation "jobs" does not exist')) {
        return { 
          success: false, 
          message: 'Connected to API, but table "jobs" does not exist. Please run the SQL schema commands first.' 
        };
      }
      return { success: false, message: `Access denied: ${error.message}` };
    }
    
    // Quick test for applications table format
    const { error: appErr } = await client.from('applications').select('id').limit(1);
    if (appErr && (appErr.message.includes('not found') || appErr.message.includes('relation "applications" does not exist'))) {
      return {
        success: false,
        message: 'Connected successfully, but table "applications" is missing from the database. Please execute both schema commands.'
      };
    }
    
    return { success: true, message: 'Successfully established verified database connection!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'An unexpected networking failure occurred.' };
  }
}

// Strictly fetch actual database entries with zero default backups
export async function fetchJobs(client: SupabaseClient | null): Promise<Job[]> {
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Supabase jobs retrieve failed:', error);
    throw new Error(error.message);
  }
  return (data || []) as Job[];
}

export async function createJobInDB(client: SupabaseClient | null, job: Omit<Job, 'id' | 'created_at'>): Promise<Job> {
  if (!client) {
    throw new Error('Supabase integration is not established! Save your database URL and key first.');
  }

  const { data, error } = await client
    .from('jobs')
    .insert({
      title: job.title,
      company: job.company,
      company_logo: job.company_logo || 'briefcase',
      description: job.description,
      requirements: job.requirements,
      salary_min: Number(job.salary_min),
      salary_max: Number(job.salary_max),
      location: job.location,
      type: job.type,
      experience_level: job.experience_level,
      category: job.category,
      posted_by_email: job.posted_by_email
    })
    .select()
    .single();

  if (error) {
    console.error('Job publication failure:', error);
    throw new Error(error.message);
  }
  return data as Job;
}

export async function fetchApplications(client: SupabaseClient | null): Promise<Application[]> {
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Supabase applications fetch failed:', error);
    throw new Error(error.message);
  }
  return (data || []) as Application[];
}

export async function createApplicationInDB(client: SupabaseClient | null, application: Omit<Application, 'id' | 'created_at'>): Promise<Application> {
  if (!client) {
    throw new Error('Supabase integration is not established!');
  }

  const { data, error } = await client
    .from('applications')
    .insert({
      job_id: application.job_id,
      applicant_name: application.applicant_name,
      applicant_email: application.applicant_email,
      applicant_resume: application.applicant_resume,
      applicant_cover_letter: application.applicant_cover_letter,
      status: application.status,
      contact_phone: application.contact_phone,
      applicant_github: application.applicant_github || ''
    })
    .select()
    .single();

  if (error) {
    console.error('Application transmission failure:', error);
    throw new Error(error.message);
  }
  return data as Application;
}

export async function updateApplicationStatusInDB(client: SupabaseClient | null, id: string, status: 'Pending' | 'Interview' | 'Accepted' | 'Rejected'): Promise<boolean> {
  if (!client) {
    throw new Error('Supabase client unconfigured.');
  }

  const { error } = await client
    .from('applications')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Application status update failure:', error);
    throw new Error(error.message);
  }
  return true;
}

// Beautiful manual database seeding service to let them populate their actual Supabase project in 1-click
export async function seedSupabaseIfNeeded(client: SupabaseClient, force: boolean = false): Promise<{ jobsSeeded: number; appsSeeded: number; message: string }> {
  try {
    // If not forced, check if jobs table is already populated
    if (!force) {
      const { count, error: countErr } = await client.from('jobs').select('id', { count: 'exact', head: true });
      if (countErr) throw countErr;
      if (count && count > 0) {
        return { jobsSeeded: 0, appsSeeded: 0, message: 'Your database already contains open job vacancies.' };
      }
    }
    
    // Seed standard demo profiles
    const { data: insertedJobs, error: insertErr } = await client
      .from('jobs')
      .insert(SEED_JOBS)
      .select();
      
    if (insertErr) throw insertErr;
    
    let appsSeeded = 0;
    if (insertedJobs && insertedJobs.length > 0) {
      // Bind at least one application to a verified inserted job's primary UUID key
      const premiumJobId = insertedJobs[0].id;
      const appsToInsert = SEEDED_COPIED_APPLICATIONS(premiumJobId);
      
      const { error: appErr } = await client.from('applications').insert(appsToInsert);
      if (appErr) {
        console.warn('Applicants seed failed partially, possibly due to constraint:', appErr);
      } else {
        appsSeeded = appsToInsert.length;
      }
    }
    
    return {
      jobsSeeded: insertedJobs ? insertedJobs.length : 0,
      appsSeeded,
      message: `Database populate successful! Added ${insertedJobs?.length || 0} job career listings and ${appsSeeded} applicant candidate profiles!`
    };
  } catch (err: any) {
    console.error('Seed execution helper error:', err);
    throw new Error(err.message || 'Seeding protocol failed.');
  }
}

function SEEDED_COPIED_APPLICATIONS(jobId: string) {
  return [
    {
      job_id: jobId,
      applicant_name: 'Alex Rivera',
      applicant_email: 'alex.rivera@gmail.com',
      applicant_resume: 'Alex is a Senior Frontend Engineer with 6 years of expertise building interfaces at Airbnb and Brex. He excels in performance optimizing, layout animations, and dashboard layout planning.',
      applicant_cover_letter: 'Hi recruiting team, I would love to join your dashboard branch. I am deeply interested in establishing beautiful accessible web spaces.',
      status: 'Pending',
      contact_phone: '+1 (555) 789-0123',
      applicant_github: 'https://github.com/alexrivera-dev'
    },
    {
      job_id: jobId,
      applicant_name: 'Sophia Chen',
      applicant_email: 'sophia.chen@uwaterloo.ca',
      applicant_resume: 'Sophia Chen is an interaction prototyper recently graduated from Computer Engineering. Specializes in fluid React components with tailwind CSS, motion designs, and modular software abstractions.',
      applicant_cover_letter: 'Dear team, your open position aligns perfectly with my recent work on dashboard rendering cycles. Please let me show you my projects!',
      status: 'Interview',
      contact_phone: '+1 (415) 305-1845',
      applicant_github: 'https://github.com/sophiachen-interactions'
    }
  ];
}
