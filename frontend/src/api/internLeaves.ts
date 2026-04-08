import client from './client';
import type { InternLeave } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface LeaveFilters {
  status?: string;
  page?: number;
  per_page?: number;
}

export interface LeavePayload {
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
}

export interface ReviewPayload {
  status: 'approved' | 'rejected';
  review_note?: string | null;
}

export const getLeaves = (filters?: LeaveFilters) =>
  client.get<PaginatedResponse<InternLeave>>('/intern-leaves', { params: filters }).then((r) => r.data);

export const createLeave = (payload: LeavePayload) =>
  client.post<{ data: InternLeave }>('/intern-leaves', payload).then((r) => r.data.data);

export const reviewLeave = (id: number, payload: ReviewPayload) =>
  client.patch<{ data: InternLeave }>(`/intern-leaves/${id}/review`, payload).then((r) => r.data.data);

export const deleteLeave = (id: number) =>
  client.delete(`/intern-leaves/${id}`).then((r) => r.data);
