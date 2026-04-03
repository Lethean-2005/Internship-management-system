import client from './client';
import type { CompanyInterview } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface InterviewFilters {
  user_id?: number;
  company_id?: number;
  status?: string;
  page?: number;
}

export interface InterviewPayload {
  user_id: number;
  company_name: string;
  company_id?: number;
  internship_id?: number | null;
  interview_date: string;
  location?: string | null;
  type: string;
  employment?: string | null;
  notes?: string | null;
}

export interface ResultPayload {
  result: string;
  feedback?: string | null;
}

export const getInterviews = (filters?: InterviewFilters) =>
  client.get<PaginatedResponse<CompanyInterview>>('/company-interviews', { params: filters }).then((r) => r.data);

export const getInterview = (id: number) =>
  client.get<{ data: CompanyInterview }>(`/company-interviews/${id}`).then((r) => r.data.data);

export const createInterview = (payload: InterviewPayload) =>
  client.post<{ data: CompanyInterview }>('/company-interviews', payload).then((r) => r.data.data);

export const updateInterview = (id: number, payload: Partial<InterviewPayload>) =>
  client.put<{ data: CompanyInterview }>(`/company-interviews/${id}`, payload).then((r) => r.data.data);

export const deleteInterview = (id: number) =>
  client.delete(`/company-interviews/${id}`).then((r) => r.data);

export const updateResult = (id: number, payload: ResultPayload) =>
  client.patch<{ data: CompanyInterview }>(`/company-interviews/${id}/result`, payload).then((r) => r.data.data);
