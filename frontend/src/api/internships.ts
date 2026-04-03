import client from './client';
import type { Internship, InternshipApplication } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface InternshipFilters {
  company_id?: number;
  status?: string;
  search?: string;
  page?: number;
}

export interface InternshipPayload {
  company_id: number;
  title: string;
  description?: string | null;
  department?: string | null;
  start_date: string;
  end_date: string;
  positions: number;
  requirements?: string | null;
}

export interface ApplicationReviewPayload {
  status: string;
  notes?: string | null;
}

export const getInternships = (filters?: InternshipFilters) =>
  client.get<PaginatedResponse<Internship>>('/internships', { params: filters }).then((r) => r.data);

export const getInternship = (id: number) =>
  client.get<{ data: Internship }>(`/internships/${id}`).then((r) => r.data.data);

export const createInternship = (payload: InternshipPayload) =>
  client.post<{ data: Internship }>('/internships', payload).then((r) => r.data.data);

export const updateInternship = (id: number, payload: Partial<InternshipPayload>) =>
  client.put<{ data: Internship }>(`/internships/${id}`, payload).then((r) => r.data.data);

export const deleteInternship = (id: number) =>
  client.delete(`/internships/${id}`).then((r) => r.data);

export const applyInternship = (internshipId: number) =>
  client.post<{ data: InternshipApplication }>(`/internships/${internshipId}/apply`).then((r) => r.data.data);

export const reviewApplication = (internshipId: number, applicationId: number, payload: ApplicationReviewPayload) =>
  client
    .patch<{ data: InternshipApplication }>(`/internships/${internshipId}/applications/${applicationId}/review`, payload)
    .then((r) => r.data.data);
