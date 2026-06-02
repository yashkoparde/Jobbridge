/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "employer" | "employee" | "admin";
export type UserStatus = "active" | "suspended";
export type JobStatus = "active" | "closed";
export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface Company {
  id: string;
  employer_id: string;
  company_name: string;
  company_description: string;
  website: string;
  location: string;
  logo_url: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  salary: string;
  experience_required: string; // e.g., "0-1 years", "2-4 years", "5+ years"
  employment_type: string; // e.g., "Full-time", "Part-time", "Contract", "Remote"
  created_at: string;
  status: JobStatus;
  company?: Company; // Hydrated for frontend
}

export interface Application {
  id: string;
  job_id: string;
  employee_id: string;
  resume_url: string; // Wait! For our local PDF resume feature, we will allow selecting a PDF mock file or uploading a description.
  cover_letter: string;
  status: ApplicationStatus;
  applied_at: string;
  job?: Job; // Hydrated
  employee?: User; // Hydrated
}

export interface SavedJob {
  id: string;
  employee_id: string;
  job_id: string;
}

// Client login response
export interface AuthResponse {
  user: User;
  token?: string;
  company?: Company;
}
