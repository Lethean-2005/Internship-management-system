import client from './client';
import type { SupervisorContact } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface ContactFilters {
  user_id?: number;
  supervisor_id?: number;
  is_read?: boolean;
  page?: number;
}

export interface ContactPayload {
  supervisor_id: number;
  internship_id?: number | null;
  subject: string;
  message: string;
}

export interface ReplyPayload {
  reply: string;
}

export const getContacts = (filters?: ContactFilters) =>
  client.get<PaginatedResponse<SupervisorContact>>('/supervisor-contacts', { params: filters }).then((r) => r.data);

export const getContact = (id: number) =>
  client.get<{ data: SupervisorContact }>(`/supervisor-contacts/${id}`).then((r) => r.data.data);

export const createContact = (payload: ContactPayload) =>
  client.post<{ data: SupervisorContact }>('/supervisor-contacts', payload).then((r) => r.data.data);

export const replyContact = (id: number, payload: ReplyPayload) =>
  client.patch<{ data: SupervisorContact }>(`/supervisor-contacts/${id}/reply`, payload).then((r) => r.data.data);
