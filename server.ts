/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Load environment variables configured in /.env
dotenv.config();
import { 
  User, 
  Company, 
  Job, 
  Application, 
  SavedJob,
  UserRole,
  UserStatus,
  JobStatus,
  ApplicationStatus
} from './src/types.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Supabase if credentials are present
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== "https://your-supabase-project.supabase.co");

let supabase: any = null;
// --- LOCAL DATA HOARDS (FALLBACK DATABASE ENGINE) ---
let usersDb: User[] = [];
let companiesDb: Company[] = [];
let jobsDb: Job[] = [];
let applicationsDb: Application[] = [];
let savedJobsDb: SavedJob[] = [];

// --- DYNAMIC SYNC LAYER FROM SUPABASE WITH COOLDOWN ---
let lastSyncTime = 0;
const SYNC_COOLDOWN_MS = 5000; // 5 seconds cooldown cache

async function syncFromSupabase(force = false) {
  if (!supabase) return;
  const now = Date.now();
  if (!force && (now - lastSyncTime < SYNC_COOLDOWN_MS)) {
    return; // Skip sync, use current cached high-fidelity DB
  }
  lastSyncTime = now;
  try {
    const [uRes, cRes, jRes, aRes, sRes] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('companies').select('*'),
      supabase.from('jobs').select('*'),
      supabase.from('applications').select('*'),
      supabase.from('saved_jobs').select('*')
    ]);

    if (uRes.error) console.error("Error loading users:", uRes.error.message);
    else if (uRes.data) usersDb = uRes.data;

    if (cRes.error) console.error("Error loading companies:", cRes.error.message);
    else if (cRes.data) companiesDb = cRes.data;

    if (jRes.error) console.error("Error loading jobs:", jRes.error.message);
    else if (jRes.data) jobsDb = jRes.data;

    if (aRes.error) console.error("Error loading applications:", aRes.error.message);
    else if (aRes.data) applicationsDb = aRes.data;

    if (sRes.error) console.error("Error loading saved jobs:", sRes.error.message);
    else if (sRes.data) savedJobsDb = sRes.data;
  } catch (err) {
    console.error("Failed to synchronize caches from Supabase:", err);
  }
}

if (isSupabaseConfigured) {
  console.log("JobBridge: Connecting to Supabase at", supabaseUrl);
  supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  syncFromSupabase().then(() => {
    console.log("JobBridge: Database synchronized with Supabase successfully.");
  }).catch(err => {
    console.error("JobBridge: Initial database sync failed:", err);
  });
} else {
  console.log("JobBridge: Supabase variables not configured or default. Running with high-fidelity local database.");
}

// Helper to check user status
const isUserSuspended = (userId: string): boolean => {
  const user = usersDb.find(u => u.id === userId);
  return user ? user.status === 'suspended' : false;
};

// Seed custom extra companies if employer added
const getCompanyForEmployer = (employerId: string): Company | undefined => {
  const comp = companiesDb.find(c => c.employer_id === employerId);
  if (!comp) {
    // Return a default generated company to avoid empty employer screens
    const placeholder: Company = {
      id: `company-${employerId}`,
      employer_id: employerId,
      company_name: "My Enterprise Inc.",
      company_description: "Add your descriptions and details in the Settings profile dashboard.",
      website: "https://enterprise.example.com",
      location: "San Francisco, CA",
      logo_url: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=150&h=150&q=80"
    };
    companiesDb.push(placeholder);
    return placeholder;
  }
  return comp;
};

// --- AUTH API ENDPOINTS ---

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  await syncFromSupabase();

  // Email constraint check
  const existingUser = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: "User already exists with this email address." });
  }

  const newUser: User = {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    role: role as UserRole,
    status: "active",
    created_at: new Date().toISOString()
  };

  usersDb.push(newUser);

  // If Employer, automatically bootstrap an associated company profile
  let company: Company | undefined;
  if (role === 'employer') {
    company = {
      id: randomUUID(),
      employer_id: newUser.id,
      company_name: `${name}'s Organization`,
      company_description: "This is your default company profile. Click 'Edit Profile' to customize description and website link.",
      website: "https://yourcompany.com",
      location: "Remote / Worldwide",
      logo_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&h=150&q=80"
    };
    companiesDb.push(company);
  }

  if (supabase) {
    try {
      await supabase.from('users').insert([newUser]);
      if (company) {
        await supabase.from('companies').insert([company]);
      }
    } catch (err: any) {
      console.warn("Supabase database insert err on register:", err.message || err);
    }
  }

  res.status(201).json({ user: newUser, company });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ error: "Missing email, password, or role parameters." });
  }

  await syncFromSupabase();

  const user = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. User record not found." });
  }

  // In this demo implementation, any password works for effortless evaluation!
  if (user.role !== role) {
    return res.status(401).json({ error: `Incorrect role. Use the correct tab to login as ${user.role}.` });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: "Your account is suspended by an Administrator. Please reach out to candidate@jobbridge.com." });
  }

  const responsePayload: any = { user };

  if (role === 'employer') {
    responsePayload.company = getCompanyForEmployer(user.id);
  }

  res.json(responsePayload);
});

// Update Profile
app.post('/api/profile/update', async (req, res) => {
  const { userId, name, email, companyName, companyDescription, website, location, logoUrl } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "User ID parameter is mandatory." });
  }

  await syncFromSupabase();

  if (isUserSuspended(userId)) {
    return res.status(403).json({ error: "Access denied. Suspended account." });
  }

  const userIndex = usersDb.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  // Update basic user name & email
  usersDb[userIndex].name = name || usersDb[userIndex].name;
  if (email) usersDb[userIndex].email = email.toLowerCase();

  let updatedCompany: Company | undefined;
  if (usersDb[userIndex].role === 'employer') {
    const compIndex = companiesDb.findIndex(c => c.employer_id === userId);
    if (compIndex !== -1) {
      companiesDb[compIndex].company_name = companyName || companiesDb[compIndex].company_name;
      companiesDb[compIndex].company_description = companyDescription || companiesDb[compIndex].company_description;
      companiesDb[compIndex].website = website || companiesDb[compIndex].website;
      companiesDb[compIndex].location = location || companiesDb[compIndex].location;
      companiesDb[compIndex].logo_url = logoUrl || companiesDb[compIndex].logo_url;
      updatedCompany = companiesDb[compIndex];
    } else {
      updatedCompany = {
        id: randomUUID(),
        employer_id: userId,
        company_name: companyName || "My Enterprise Inc.",
        company_description: companyDescription || "",
        website: website || "",
        location: location || "",
        logo_url: logoUrl || ""
      };
      companiesDb.push(updatedCompany);
    }
  }

  if (supabase) {
    try {
      await supabase.from('users').update({
        name: name || usersDb[userIndex].name,
        email: email ? email.toLowerCase() : usersDb[userIndex].email
      }).eq('id', userId);

      if (updatedCompany) {
        const { data: existingComp } = await supabase.from('companies').select('id').eq('employer_id', userId).single();
        if (existingComp) {
          await supabase.from('companies').update({
            company_name: updatedCompany.company_name,
            company_description: updatedCompany.company_description,
            website: updatedCompany.website,
            location: updatedCompany.location,
            logo_url: updatedCompany.logo_url
          }).eq('employer_id', userId);
        } else {
          await supabase.from('companies').insert([updatedCompany]);
        }
      }
    } catch (err: any) {
      console.warn("Supabase database error on profile update:", err.message || err);
    }
  }

  res.json({
    user: usersDb[userIndex],
    company: updatedCompany
  });
});

// Password reset mock endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email target is required." });
  }
  await syncFromSupabase();
  const user = usersDb.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "Account with that email address was not found." });
  }
  res.json({ success: true, message: "A password reset link was dispatched. In this demo preview, you are safe to login immediately with any password." });
});


// --- JOBS REST API ---

// GET jobs (public with filters, search and pagination)
app.get('/api/jobs', async (req, res) => {
  const { 
    search, 
    location, 
    category, 
    salary, 
    experience, 
    type,
    page = "1",
    limit = "10"
  } = req.query;

  await syncFromSupabase();

  // Hydrate each job with its associated company parameters
  let filteredJobs = jobsDb.map(job => {
    let company = companiesDb.find(c => c.employer_id === job.employer_id);
    if (!company) {
      company = {
        id: `company-${job.employer_id}`,
        employer_id: job.employer_id,
        company_name: "Standard Alliance Corp",
        company_description: "An associated talent partner.",
        website: "https://alliance.example.com",
        location: job.location,
        logo_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=150&h=150&q=80"
      };
    }
    return { ...job, company };
  });

  // Apply filters
  if (search) {
    const q = String(search).toLowerCase();
    filteredJobs = filteredJobs.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.description.toLowerCase().includes(q) ||
      j.category.toLowerCase().includes(q) ||
      j.company!.company_name.toLowerCase().includes(q)
    );
  }

  if (location && location !== "All") {
    const loc = String(location).trim().toLowerCase();
    filteredJobs = filteredJobs.filter(j => j.location.toLowerCase().includes(loc));
  }

  if (category && category !== "All") {
    filteredJobs = filteredJobs.filter(j => j.category === category);
  }

  if (experience && experience !== "All") {
    filteredJobs = filteredJobs.filter(j => j.experience_required === experience);
  }

  if (type && type !== "All") {
    filteredJobs = filteredJobs.filter(j => j.employment_type === type);
  }

  // Filter out closed or suspended unless searching internally
  filteredJobs = filteredJobs.filter(j => j.status === 'active');

  // Multi-tier salary filters
  if (salary && salary !== "All") {
    // Keep it simple or match string pattern
    if (salary === "$100k+") {
      filteredJobs = filteredJobs.filter(j => j.salary.includes("100") || j.salary.includes("110") || j.salary.includes("120") || j.salary.includes("130") || j.salary.includes("140") || j.salary.includes("150") || j.salary.includes("160") || j.salary.includes("170"));
    } else if (salary === "$60k-$100k") {
      filteredJobs = filteredJobs.filter(j => j.salary.includes("60") || j.salary.includes("70") || j.salary.includes("80") || j.salary.includes("95"));
    }
  }

  // Sort by date descending
  filteredJobs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination Math
  const p = parseInt(String(page)) || 1;
  const l = parseInt(String(limit)) || 10;
  const total = filteredJobs.length;
  const paginated = filteredJobs.slice((p - 1) * l, p * l);

  res.json({
    jobs: paginated,
    total,
    pages: Math.ceil(total / l),
    currentPage: p
  });
});

// Single job details
app.get('/api/jobs/:id', async (req, res) => {
  await syncFromSupabase();
  const job = jobsDb.find(j => j.id === req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job posting not found" });
  }
  const company = getCompanyForEmployer(job.employer_id);
  res.json({ ...job, company });
});

// POST job (Employer only)
app.post('/api/jobs', async (req, res) => {
  const { 
    employer_id, 
    title, 
    description, 
    location, 
    category, 
    salary, 
    experience_required, 
    employment_type 
  } = req.body;

  if (!employer_id || !title || !description || !location || !category || !salary || !experience_required || !employment_type) {
    return res.status(400).json({ error: "Missing required core job details." });
  }

  await syncFromSupabase();

  if (isUserSuspended(employer_id)) {
    return res.status(403).json({ error: "Forbidden. Employer account suspended." });
  }

  const newJob: Job = {
    id: randomUUID(),
    employer_id,
    title,
    description,
    location,
    category,
    salary,
    experience_required,
    employment_type,
    created_at: new Date().toISOString(),
    status: "active"
  };

  jobsDb.push(newJob);

  if (supabase) {
    try {
      await supabase.from('jobs').insert([newJob]);
    } catch (err: any) {
      console.warn("Supabase database insert err on job posting:", err.message || err);
    }
  }

  res.status(201).json(newJob);
});

// Edit status or details of job
app.put('/api/jobs/:id', async (req, res) => {
  const { title, description, location, category, salary, experience_required, employment_type, status, employer_id } = req.body;
  
  await syncFromSupabase();
  
  const jobIndex = jobsDb.findIndex(j => j.id === req.params.id);

  if (jobIndex === -1) {
    return res.status(404).json({ error: "Job listing not found." });
  }

  const job = jobsDb[jobIndex];
  if (employer_id && job.employer_id !== employer_id) {
    // Check if admin is upgrading rather than owner
    const userRole = usersDb.find(u => u.id === employer_id)?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: "Unauthorized update action." });
    }
  }

  // Update
  if (title) job.title = title;
  if (description) job.description = description;
  if (location) job.location = location;
  if (category) job.category = category;
  if (salary) job.salary = salary;
  if (experience_required) job.experience_required = experience_required;
  if (employment_type) job.employment_type = employment_type;
  if (status) job.status = status as JobStatus;

  jobsDb[jobIndex] = job;

  if (supabase) {
    try {
      await supabase.from('jobs').update({
        title: job.title,
        description: job.description,
        location: job.location,
        category: job.category,
        salary: job.salary,
        experience_required: job.experience_required,
        employment_type: job.employment_type,
        status: job.status
      }).eq('id', req.params.id);
    } catch (err: any) {
      console.warn("Supabase database update err on job listing:", err.message || err);
    }
  }

  res.json(job);
});

// Delete or close job
app.delete('/api/jobs/:id', async (req, res) => {
  const { user_id } = req.query; // Authenticating delete
  
  await syncFromSupabase();
  
  const jobIndex = jobsDb.findIndex(j => j.id === req.params.id);

  if (jobIndex === -1) {
    return res.status(404).json({ error: "Job listing not found." });
  }

  const job = jobsDb[jobIndex];
  const user = usersDb.find(u => u.id === String(user_id));
  if (!user || (user.id !== job.employer_id && user.role !== 'admin')) {
    return res.status(403).json({ error: "Not authorized to delete this posting." });
  }

  // Remove completely
  jobsDb.splice(jobIndex, 1);

  if (supabase) {
    try {
      await supabase.from('jobs').delete().eq('id', req.params.id);
    } catch (err: any) {
      console.warn("Supabase database delete err on job listing:", err.message || err);
    }
  }

  res.json({ success: true, message: "Job listing permanently removed from JobBridge." });
});


// --- APPLICATIONS REST API ---

// GET Applications (Context-based filters)
app.get('/api/applications', async (req, res) => {
  const { userId, role } = req.query;

  if (!userId || !role) {
    return res.status(400).json({ error: "User ID and Role parameters are mandatory." });
  }

  await syncFromSupabase();

  let filteredApps: any[] = [];

  if (role === 'admin') {
    filteredApps = [...applicationsDb];
  } else if (role === 'employee') {
    filteredApps = applicationsDb.filter(app => app.employee_id === String(userId));
  } else if (role === 'employer') {
    // Find all jobs created by this employer
    const employerJobs = jobsDb.filter(j => j.employer_id === String(userId)).map(j => j.id);
    filteredApps = applicationsDb.filter(app => employerJobs.includes(app.job_id));
  }

  // Enrich data with job, company, and developer details
  const enriched = filteredApps.map(app => {
    const job = jobsDb.find(j => j.id === app.job_id);
    const worker = usersDb.find(u => u.id === app.employee_id);
    let company = job ? companiesDb.find(c => c.employer_id === job.employer_id) : undefined;
    
    return {
      ...app,
      job: job ? { ...job, company } : undefined,
      employee: worker ? { id: worker.id, name: worker.name, email: worker.email } : undefined
    };
  });

  res.json(enriched);
});

// Apply to job
app.post('/api/applications', async (req, res) => {
  const { job_id, employee_id, cover_letter, resume_url } = req.body;

  if (!job_id || !employee_id || !resume_url) {
    return res.status(400).json({ error: "Job ID, Employee ID, and Resume are required files." });
  }

  await syncFromSupabase();

  if (isUserSuspended(employee_id)) {
    return res.status(403).json({ error: "Cannot process application. Account suspended." });
  }

  // Check unique constraints
  const duplicate = applicationsDb.find(a => a.job_id === job_id && a.employee_id === employee_id);
  if (duplicate) {
    return res.status(400).json({ error: "You have already applied for this position." });
  }

  const newApp: Application = {
    id: randomUUID(),
    job_id,
    employee_id,
    resume_url,
    cover_letter: cover_letter || "",
    status: "pending",
    applied_at: new Date().toISOString()
  };

  applicationsDb.push(newApp);

  if (supabase) {
    try {
      await supabase.from('applications').insert([newApp]);
    } catch (err: any) {
      console.warn("Supabase database insert err on application:", err.message || err);
    }
  }

  res.status(201).json(newApp);
});

// Update application status (employer/admin view status action)
app.put('/api/applications/:id/status', async (req, res) => {
  const { status, user_id } = req.body;
  
  await syncFromSupabase();

  const appIndex = applicationsDb.findIndex(a => a.id === req.params.id);
  if (appIndex === -1) {
    return res.status(404).json({ error: "Application record not found." });
  }

  if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status parameters." });
  }

  const application = applicationsDb[appIndex];
  const job = jobsDb.find(j => j.id === application.job_id);
  const user = usersDb.find(u => u.id === user_id);

  if (!user || (!job || (job.employer_id !== user.id && user.role !== 'admin'))) {
    return res.status(403).json({ error: "Unauthorized to update this candidate decision." });
  }

  application.status = status as ApplicationStatus;
  applicationsDb[appIndex] = application;

  if (supabase) {
    try {
      await supabase.from('applications').update({ status }).eq('id', req.params.id);
    } catch (err: any) {
      console.warn("Supabase database update err on application status:", err.message || err);
    }
  }

  res.json(application);
});


// --- SAVED JOBS REST API ---

// GET Saved Jobs
app.get('/api/saved-jobs', async (req, res) => {
  const { employee_id } = req.query;
  if (!employee_id) {
    return res.status(400).json({ error: "Employee ID is required." });
  }

  await syncFromSupabase();

  const saved = savedJobsDb.filter(s => s.employee_id === String(employee_id));
  const enriched = saved.map(s => {
    const job = jobsDb.find(j => j.id === s.job_id);
    let company = job ? companiesDb.find(c => c.employer_id === job.employer_id) : undefined;
    return {
      id: s.id,
      job: job ? { ...job, company } : undefined
    };
  }).filter(s => !!s.job); // filter out deleted jobs

  res.json(enriched);
});

// Save or toggle unsave
app.post('/api/saved-jobs', async (req, res) => {
  const { employee_id, job_id } = req.body;

  if (!employee_id || !job_id) {
    return res.status(400).json({ error: "Mandatory employee ID or Job ID details missed." });
  }

  await syncFromSupabase();

  const matchIndex = savedJobsDb.findIndex(s => s.employee_id === employee_id && s.job_id === job_id);
  if (matchIndex !== -1) {
    // Delete toggle (unsave)
    savedJobsDb.splice(matchIndex, 1);

    if (supabase) {
      try {
        await supabase.from('saved_jobs').delete().eq('employee_id', employee_id).eq('job_id', job_id);
      } catch (err: any) {
        console.warn("Supabase database delete err on saved job:", err.message || err);
      }
    }

    return res.json({ status: "unsaved", message: "Job removed from saved listings." });
  }

  const newSave: SavedJob = {
    id: randomUUID(),
    employee_id,
    job_id
  };
  savedJobsDb.push(newSave);

  if (supabase) {
    try {
      await supabase.from('saved_jobs').insert([newSave]);
    } catch (err: any) {
      console.warn("Supabase database insert err on saved job:", err.message || err);
    }
  }

  res.status(201).json({ status: "saved", data: newSave });
});


// --- ADMIN REST CHANNELS ---

// GET All Users
app.get('/api/admin/users', async (req, res) => {
  const { admin_id } = req.query;
  
  await syncFromSupabase();
  
  const admin = usersDb.find(u => u.id === String(admin_id));
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: "Unauthorized access path. Admins only." });
  }
  res.json(usersDb);
});

// Suspend/Reactivate user
app.put('/api/admin/users/:id/suspend', async (req, res) => {
  const { status, admin_id } = req.body;
  
  await syncFromSupabase();
  
  const admin = usersDb.find(u => u.id === admin_id);
  if (!admin || admin.role !== 'admin') {
    return res.status(403).json({ error: "Unauthorized access path. Admins only." });
  }

  const userIndex = usersDb.findIndex(u => u.id === req.params.id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "User records not found." });
  }

  if (req.params.id === admin_id) {
    return res.status(400).json({ error: "An admin cannot change their own administrative status." });
  }

  usersDb[userIndex].status = status as UserStatus;

  if (supabase) {
    try {
      await supabase.from('users').update({ status }).eq('id', req.params.id);
    } catch (err: any) {
      console.warn("Supabase database update err on user suspension:", err.message || err);
    }
  }

  res.json(usersDb[userIndex]);
});

// GET Dashboards Stats Channels
app.get('/api/stats', async (req, res) => {
  const { userId, role } = req.query;

  if (!userId || !role) {
    return res.status(400).json({ error: "Mandatory parameters missing." });
  }

  await syncFromSupabase();

  if (role === 'employer') {
    const employerJobs = jobsDb.filter(j => j.employer_id === String(userId));
    const totalJobs = employerJobs.length;
    const activeJobs = employerJobs.filter(j => j.status === 'active').length;
    const closedJobs = totalJobs - activeJobs;
    const employerJobIds = employerJobs.map(j => j.id);
    const totalApplicants = applicationsDb.filter(a => employerJobIds.includes(a.job_id)).length;

    res.json({
      totalJobs,
      activeJobs,
      closedJobs,
      totalApplicants
    });
  } else if (role === 'employee') {
    const appliedCount = applicationsDb.filter(a => a.employee_id === String(userId)).length;
    const savedCount = savedJobsDb.filter(s => s.employee_id === String(userId)).length;
    
    const employeeApps = applicationsDb.filter(a => a.employee_id === String(userId));
    const acceptedCount = employeeApps.filter(a => a.status === 'accepted').length;
    const rejectedCount = employeeApps.filter(a => a.status === 'rejected').length;

    res.json({
      appliedJobs: appliedCount,
      savedJobs: savedCount,
      acceptedApplications: acceptedCount,
      rejectedApplications: rejectedCount
    });
  } else if (role === 'admin') {
    res.json({
      totalUsers: usersDb.length,
      totalJobs: jobsDb.length,
      totalApplications: applicationsDb.length,
      activeJobs: jobsDb.filter(j => j.status === 'active').length
    });
  } else {
    res.status(400).json({ error: "Unsupported role diagnostics." });
  }
});


// --- CLIENT STATIC AND VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JobBridge container executing. Accessible publicly on Port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Critical JobBridge boot error:", err);
});
