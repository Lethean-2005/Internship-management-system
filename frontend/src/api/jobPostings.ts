import client from './client';
import type { JobPosting } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface JobPostingFilters {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  per_page?: number;
}

export interface JobPostingPayload {
  title: string;
  company_name: string;
  location?: string | null;
  type?: string;
  description?: string | null;
  requirements?: string | null;
  benefits?: string | null;
  department?: string | null;
  positions?: number;
  start_date?: string | null;
  end_date?: string | null;
  application_deadline?: string | null;
  contact_email?: string | null;
  status?: string;
}

export const getJobPostings = (filters?: JobPostingFilters) =>
  client.get<PaginatedResponse<JobPosting>>('/job-postings', { params: filters }).then((r) => r.data);

export const getJobPosting = (id: number) =>
  client.get<{ data: JobPosting }>(`/job-postings/${id}`).then((r) => r.data.data);

export const createJobPosting = (payload: JobPostingPayload) =>
  client.post<{ data: JobPosting }>('/job-postings', payload).then((r) => r.data.data);

export const updateJobPosting = (id: number, payload: Partial<JobPostingPayload>) =>
  client.put<{ data: JobPosting }>(`/job-postings/${id}`, payload).then((r) => r.data.data);

export const deleteJobPosting = (id: number) =>
  client.delete(`/job-postings/${id}`).then((r) => r.data);
