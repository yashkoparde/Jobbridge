-- JobBridge SQL Database Seeds / Ingestion Setup for Supabase
-- This script populates the database with the professional pre-filled dataset.
-- Make sure to run commands.sql first to establish the table schemas.

-- 1. Insert seed users
-- Note: If testing in Supabase, make sure these map to public.users.
-- When using Supabase Auth, they typically synchronize with auth.users id.
INSERT INTO users (id, name, email, role, status, created_at)
VALUES 
  ('8f93e3d6-4fc2-40db-9fc4-2195f1a5ba82', 'Sarah Jenkins', 'employer@jobbridge.com', 'employer', 'active', NOW() - INTERVAL '30 days'),
  ('24fdf8a1-c4fc-4869-9fc6-928ecf75968d', 'Alex Rivera', 'employee@jobbridge.com', 'employee', 'active', NOW() - INTERVAL '25 days'),
  ('3dfdf181-a67b-4fc3-bf80-1a3bcf527fc6', 'Admin Overseer', 'admin@jobbridge.com', 'admin', 'active', NOW() - INTERVAL '365 days')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert company details
INSERT INTO companies (id, employer_id, company_name, company_description, website, location, logo_url)
VALUES 
  ('ca78216c-e3eb-4dfb-9efc-a6be2ed1e956', '8f93e3d6-4fc2-40db-9fc4-2195f1a5ba82', 'TechFlow Systems', 'TechFlow Systems is an enterprise cloud computing company building high-performance serverless database adapters for global development teams.', 'https://techflow.example.com', 'San Francisco, CA (Hybrid)', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert job vacancies
INSERT INTO jobs (id, employer_id, title, description, location, category, salary, experience_required, employment_type, created_at, status)
VALUES 
  (
    'daae8b64-5390-449e-b7d1-e634ccbf3198', 
    '8f93e3d6-4fc2-40db-9fc4-2195f1a5ba82', 
    'Senior Full Stack Engineer', 
    'We are seeking a highly motivated Senior Full Stack Engineer with robust experience in Node.js, React, and high-throughput query optimization. You will own the database sync infrastructure, optimize render performance across administrative interfaces, and lead architectural decisions.\n\nQualifications:\n- 5+ years building scale web apps\n- Masterful with TypeScript, React, tailwindcss\n- Strong database indexing expertise', 
    'San Francisco, CA (Hybrid)', 
    'Engineering', 
    '$140,000 - $175,000', 
    '5+ years', 
    'Full-time', 
    NOW() - INTERVAL '5 days', 
    'active'
  ),
  (
    '01b5a5b2-29fc-48eb-bf3a-92a8cf29ccee', 
    '8f93e3d6-4fc2-40db-9fc4-2195f1a5ba82', 
    'Product Designer', 
    'Shape the next-generation interface of TechFlow''s analytics engine. We craft modern developer widgets that demand pixel-perfect execution, subtle micro-interactions, and visual precision. Experience with design languages, typography design systems, and modular components is preferred.', 
    'Remote (Global)', 
    'Design', 
    '$95,000 - $120,000', 
    '2-4 years', 
    'Remote', 
    NOW() - INTERVAL '3 days', 
    'active'
  ),
  (
    '1a2b3c4d-5e6f-4a8b-bf0d-1e2f3a4b5c6d', 
    '8f93e3d6-4fc2-40db-9fc4-2195f1a5ba82', 
    'Senior Finance Analyst', 
    'Drive internal financial audits, budget plans, and fiscal reports. This role involves analyzing revenue targets, compiling high-contrast operational growth spreadsheets, and reporting findings to key stakeholders in the board of directors.', 
    'Dallas, TX', 
    'Finance', 
    '$110,000 - $135,000', 
    '5+ years', 
    'Full-time', 
    NOW() - INTERVAL '10 days', 
    'active'
  ),
  (
    'e2f3a4b5-c6d7-4e9f-8a1b-2c3d4e5f6078', 
    '8f93e3d6-4fc2-40db-9fc4-2195f1a5ba82', 
    'Growth Marketing Manager', 
    'Own the content syndication funnels, newsletter distributions, and social amplification campaigns. Ideal for creative, numbers-driven strategists with an obsession for performance metrics and conversion analytics.', 
    'New York, NY', 
    'Marketing', 
    '$80,000 - $100,000', 
    '2-4 years', 
    'Part-time', 
    NOW() - INTERVAL '12 days', 
    'active'
  ),
  (
    'f3a4b5c6-d7e8-4a9b-8c0d-1e2f3a4b5c6d', 
    '8f93e3d6-4fc2-40db-9fc4-2195f1a5ba82', 
    'Junior HR Associate', 
    'Manage onboarding operations, payroll schedules, and direct coordination with candidates across our talent pipelines. Requires outstanding verbal precision, organization skill, and a warm, supportive presence.', 
    'San Francisco, CA (Hybrid)', 
    'Human Resources', 
    '$60,000 - $75,000', 
    '0-1 years', 
    'Full-time', 
    NOW() - INTERVAL '14 days', 
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- 4. Insert job applications
INSERT INTO applications (id, job_id, employee_id, resume_url, cover_letter, status, applied_at)
VALUES 
  (
    '45b5c6d7-e8f9-4a0b-9c0d-1e2f3a4b5c6d', 
    'daae8b64-5390-449e-b7d1-e634ccbf3198', 
    '24fdf8a1-c4fc-4869-9fc6-928ecf75968d', 
    'alex_rivera_resume.pdf', 
    'Dear Hiring Team,\n\nI am thrilled about the Senior Full Stack Engineer role. I have over 5 years of experience in enterprise React applications and building efficient backends in custom Node.js ecosystems.', 
    'pending', 
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Insert bookmarks / saved jobs
INSERT INTO saved_jobs (id, employee_id, job_id)
VALUES 
  ('56c6d7e8-f9a0-4b1c-bd2e-3f4a5b6c7d8e', '24fdf8a1-c4fc-4869-9fc6-928ecf75968d', '01b5a5b2-29fc-48eb-bf3a-92a8cf29ccee')
ON CONFLICT (id) DO NOTHING;
