export interface Job {
  id: string;
  created_at?: string;
  title: string;
  company: string;
  company_logo?: string; // Icon index or URL
  description: string;
  requirements: string[]; // split by comma
  salary_min: number;
  salary_max: number;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  experience_level: 'Entry-level' | 'Mid-level' | 'Senior' | 'Lead';
  category: string;
  posted_by_email: string;
}

export interface Application {
  id: string;
  created_at?: string;
  job_id: string;
  applicant_name: string;
  applicant_email: string;
  applicant_resume: string; // text or markdown
  applicant_cover_letter: string;
  status: 'Pending' | 'Interview' | 'Accepted' | 'Rejected';
  contact_phone: string;
  applicant_github?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
