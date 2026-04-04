export interface Role {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role?: Role;
  phone: string | null;
  department: string | null;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  industry: string | null;
  description: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  is_active: boolean;
  internships_count?: number;
  created_at: string;
}

export interface Internship {
  id: number;
  company_id: number;
  company?: Company;
  title: string;
  description: string | null;
  department: string | null;
  start_date: string;
  end_date: string;
  positions: number;
  status: string;
  requirements: string | null;
  created_by: number;
  creator?: User;
  applications_count?: number;
  created_at: string;
}

export interface InternshipApplication {
  id: number;
  internship_id: number;
  user_id: number;
  user?: User;
  internship?: Internship;
  status: string;
  applied_at: string;
  reviewed_by: number | null;
  reviewer?: User;
  reviewed_at: string | null;
  notes: string | null;
}

export interface WeeklyWorklog {
  id: number;
  user_id: number;
  user?: User;
  internship_id: number;
  internship?: Internship;
  week_number: number;
  start_date: string;
  end_date: string;
  tasks_completed: string;
  challenges: string | null;
  plans_next_week: string | null;
  hours_worked: number;
  status: string;
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewer?: User;
  reviewed_at: string | null;
  feedback: string | null;
  created_at: string;
}

export interface FinalReport {
  id: number;
  user_id: number;
  user?: User;
  internship_id: number;
  internship?: Internship;
  title: string;
  content: string | null;
  file_path: string | null;
  status: string;
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewer?: User;
  reviewed_at: string | null;
  feedback: string | null;
  grade: string | null;
  created_at: string;
}

export interface FinalSlide {
  id: number;
  user_id: number;
  user?: User;
  internship_id: number;
  internship?: Internship;
  title: string;
  description: string | null;
  file_path: string | null;
  presentation_date: string | null;
  status: string;
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewer?: User;
  reviewed_at: string | null;
  feedback: string | null;
  created_at: string;
}

export interface SupervisorContact {
  id: number;
  user_id: number;
  user?: User;
  supervisor_id: number;
  supervisor?: User;
  internship_id: number | null;
  subject: string;
  message: string;
  reply: string | null;
  replied_at: string | null;
  is_read: boolean;
  created_at: string;
}

export interface CompanyInterview {
  id: number;
  user_id: number;
  user?: User;
  company_id: number;
  company?: Company;
  internship_id: number | null;
  internship?: Internship;
  interview_date: string;
  location: string | null;
  type: string;
  status: string;
  notes: string | null;
  result: string | null;
  feedback: string | null;
  created_at: string;
}

export interface JobPosting {
  id: number;
  title: string;
  company_name: string;
  location: string | null;
  type: string;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  department: string | null;
  positions: number;
  start_date: string | null;
  end_date: string | null;
  application_deadline: string | null;
  contact_email: string | null;
  status: string;
  is_active: boolean;
  created_by: number;
  creator?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_interns: number;
  active_internships: number;
  pending_worklogs: number;
  pending_reports: number;
  pending_slides: number;
  upcoming_interviews: number;
  total_companies: number;
}
