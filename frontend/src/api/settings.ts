import client from './client';

export interface Settings {
  // General
  app_name: string;
  app_description: string;
  app_timezone: string;
  contact_email: string;
  default_language: string;
  academic_year: string;
  semester: string;
  // Internship
  max_interns_per_tutor: string;
  internship_min_duration_weeks: string;
  internship_max_duration_weeks: string;
  max_leave_days_per_intern: string;
  worklog_submission_day: string;
  // Approvals
  require_worklog_approval: string;
  require_report_approval: string;
  require_slide_approval: string;
  // File uploads
  max_file_upload_mb: string;
  allowed_report_formats: string;
  allowed_slide_formats: string;
  // Notifications
  notify_tutor_on_submission: string;
  notify_intern_on_review: string;
  notify_admin_on_registration: string;
  // Security & Access
  maintenance_mode: string;
  allow_registration: string;
  session_lifetime_minutes: string;
  password_min_length: string;
  require_email_verification: string;
}

export const getSettings = () =>
  client.get<{ data: Settings }>('/settings').then((r) => r.data.data);

export const updateSettings = (settings: Partial<Settings>) =>
  client.put<{ data: Settings }>('/settings', { settings }).then((r) => r.data.data);
