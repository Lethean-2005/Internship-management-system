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
  company_name: string | null;
  position: string | null;
  allowance: number | null;
  tutor_id: number | null;
  supervisor_name: string | null;
  generation: string | null;
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
  tutor_topics: string | null;
  reflections: string | null;
  hours_worked: number;
  entries?: WorklogEntry[];
  status: string;
  submitted_at: string | null;
  reviewed_by: number | null;
  reviewer?: User;
  reviewed_at: string | null;
  feedback: string | null;
  created_at: string;
}

export interface WorklogEntry {
  id?: number;
  entry_date: string;
  time_slot: 'morning' | 'afternoon';
  activities: string | null;
  difficulties: string | null;
  solutions: string | null;
  comment: string | null;
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
  post_mode: string;
  image_path: string | null;
  image_url: string | null;
  title: string;
  company_name: string;
  location: string | null;
  location_link: string | null;
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

export interface InternLeave {
  id: number;
  user_id: number;
  user?: { id: number; name: string; email: string; company_name: string | null };
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  reviewed_by: number | null;
  reviewer?: { id: number; name: string } | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
}

export interface MentoringSession {
  id: number;
  tutor_id: number;
  tutor?: User;
  intern_id: number;
  intern?: User;
  internship_id: number | null;
  internship?: Internship;
  title: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location: string | null;
  meeting_link: string | null;
  type: string;
  status: string;
  cancel_reason: string | null;
  agenda: string | null;
  notes: string | null;
  action_items: string | null;
  intern_feedback: string | null;
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
