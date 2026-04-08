import client from './client';
import type { MentoringSession } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface SessionFilters {
  status?: string;
  intern_id?: number;
  page?: number;
}

export interface SessionPayload {
  intern_ids: number[];
  internship_id?: number | null;
  title: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes?: number;
  location?: string | null;
  meeting_link?: string | null;
  type: string;
  agenda?: string | null;
}

export interface UpdateSessionPayload extends Partial<SessionPayload> {
  notes?: string | null;
  action_items?: string | null;
}

export interface CompletePayload {
  notes: string;
  action_items?: string | null;
}

export interface FeedbackPayload {
  intern_feedback: string;
}

export const getSessions = (filters?: SessionFilters) =>
  client.get<PaginatedResponse<MentoringSession>>('/mentoring-sessions', { params: filters }).then((r) => r.data);

export const getSession = (id: number) =>
  client.get<{ data: MentoringSession }>(`/mentoring-sessions/${id}`).then((r) => r.data.data);

export const createSession = (payload: SessionPayload) =>
  client.post<{ data: MentoringSession }>('/mentoring-sessions', payload).then((r) => r.data.data);

export const updateSession = (id: number, payload: UpdateSessionPayload) =>
  client.put<{ data: MentoringSession }>(`/mentoring-sessions/${id}`, payload).then((r) => r.data.data);

export const deleteSession = (id: number) =>
  client.delete(`/mentoring-sessions/${id}`).then((r) => r.data);

export interface CancelPayload {
  cancel_reason: string;
}

export const cancelSession = (id: number, payload: CancelPayload) =>
  client.patch<{ data: MentoringSession }>(`/mentoring-sessions/${id}/cancel`, payload).then((r) => r.data.data);

export const completeSession = (id: number, payload: CompletePayload) =>
  client.patch<{ data: MentoringSession }>(`/mentoring-sessions/${id}/complete`, payload).then((r) => r.data.data);

export const addFeedback = (id: number, payload: FeedbackPayload) =>
  client.patch<{ data: MentoringSession }>(`/mentoring-sessions/${id}/feedback`, payload).then((r) => r.data.data);
