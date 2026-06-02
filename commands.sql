-- JobBridge SQL Database Schema Setup for Supabase
-- This script sets up the tables, relationships, indexes, storage buckets,
-- and Row Level Security (RLS) policies.

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create tables
-- Create USERS table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- Should map to Supabase auth.users id
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('employer', 'employee', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create COMPANIES table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_description TEXT,
  website TEXT,
  location TEXT,
  logo_url TEXT,
  CONSTRAINT unique_employer UNIQUE (employer_id)
);

-- Create JOBS table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  salary TEXT NOT NULL,
  experience_required TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed'))
);

-- Create APPLICATIONS table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resume_url TEXT NOT NULL,
  cover_letter TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_application UNIQUE (job_id, employee_id)
);

-- Create SAVED_JOBS table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT unique_saved_job UNIQUE (employee_id, job_id)
);

-- 3. Create Performance & Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_employee ON applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_employee ON saved_jobs(employee_id);

-- 4. Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Helper functions to check roles securely and bypass RLS nested recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_employer(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = user_id AND role = 'employer'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_employee(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE id = user_id AND role = 'employee'
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Define RLS Policies for safe data authorization

-- USERS Policies
-- Anyone can see user profiles (needed for applications/companies)
CREATE POLICY "Public profiles are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Users can insert/update their own profile
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do anything on users
CREATE POLICY "Admins have full access to users" ON users
  FOR ALL USING (is_admin(auth.uid()));

-- COMPANIES Policies
-- Public viewable
CREATE POLICY "Companies are viewable by everyone" ON companies
  FOR SELECT USING (true);

-- Employers can manage their own company
CREATE POLICY "Employers can manage their company" ON companies
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid() AND is_employer(auth.uid()));

-- JOBS Policies
-- Public viewable
CREATE POLICY "Jobs are viewable by everyone" ON jobs
  FOR SELECT USING (true);

-- Employers can manage jobs they own
CREATE POLICY "Employers can manage their own jobs" ON jobs
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid() AND is_employer(auth.uid()));

-- Admins can delete or moderate jobs
CREATE POLICY "Admins can moderate jobs" ON jobs
  USING (is_admin(auth.uid()));

-- APPLICATIONS Policies
-- Job Seekers can view their own applications
CREATE POLICY "Employees can view own applications" ON applications
  FOR SELECT USING (employee_id = auth.uid());

-- Employers can view applications for their jobs
CREATE POLICY "Employers can view applications for their jobs" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
    )
  );

-- Job Seekers can apply
CREATE POLICY "Employees can apply to jobs" ON applications
  FOR INSERT WITH CHECK (
    employee_id = auth.uid() AND is_employee(auth.uid())
  );

-- Employers can update application details (status)
CREATE POLICY "Employers can update application status" ON applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id AND jobs.employer_id = auth.uid()
    )
  );

-- Admins can view and moderate applications
CREATE POLICY "Admins can view and moderate applications" ON applications
  USING (is_admin(auth.uid()));

-- SAVED_JOBS Policies
CREATE POLICY "Employees can view their own saved jobs" ON saved_jobs
  FOR SELECT USING (employee_id = auth.uid());

CREATE POLICY "Employees can save/unsave jobs" ON saved_jobs
  FOR ALL USING (employee_id = auth.uid())
  WITH CHECK (employee_id = auth.uid() AND is_employee(auth.uid()));


-- 6. Storage Bucket Setup
-- Create storage buckets for resumes and logos
-- Note: Submitting these instructions operates globally for storage rules

INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allows public access to download resumes and logos
CREATE POLICY "Public Access To Resumes" ON storage.objects
  FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Public Access To Logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

-- Allow authenticated uploads
CREATE POLICY "Allow Auth Resumes Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'resumes' AND auth.role() = 'authenticated');

CREATE POLICY "Allow Auth Logos Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');
