import client from './client';
import type { Company } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface CompanyFilters {
  search?: string;
  is_active?: boolean;
  page?: number;
}

export interface CompanyPayload {
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  industry?: string | null;
  description?: string | null;
  contact_person?: string | null;
  contact_phone?: string | null;
}

export const getCompanies = (filters?: CompanyFilters) =>
  client.get<PaginatedResponse<Company>>('/companies', { params: filters }).then((r) => r.data);

export const getCompany = (id: number) =>
  client.get<{ data: Company }>(`/companies/${id}`).then((r) => r.data.data);

export const createCompany = (payload: CompanyPayload) =>
  client.post<{ data: Company }>('/companies', payload).then((r) => r.data.data);

export const updateCompany = (id: number, payload: Partial<CompanyPayload>) =>
  client.put<{ data: Company }>(`/companies/${id}`, payload).then((r) => r.data.data);

export const deleteCompany = (id: number) =>
  client.delete(`/companies/${id}`).then((r) => r.data);
