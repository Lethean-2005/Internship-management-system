import client from './client';
import type { WeeklyWorklog } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface WorklogFilters {
  user_id?: number;
  internship_id?: number;
  status?: string;
  page?: number;
}

export interface WorklogEntryPayload {
  entry_date: string;
  time_slot: 'morning' | 'afternoon';
  activities?: string | null;
  difficulties?: string | null;
  solutions?: string | null;
  comment?: string | null;
}

export interface WorklogPayload {
  internship_id: number;
  week_number: number;
  start_date: string;
  end_date: string;
  tasks_completed: string;
  challenges?: string | null;
  plans_next_week?: string | null;
  tutor_topics?: string | null;
  reflections?: string | null;
  hours_worked: number;
  entries?: WorklogEntryPayload[];
}

export interface ReviewPayload {
  status: string;
  feedback?: string | null;
}

export const getWorklogs = (filters?: WorklogFilters) =>
  client.get<PaginatedResponse<WeeklyWorklog>>('/weekly-worklogs', { params: filters }).then((r) => r.data);

export const getWorklog = (id: number) =>
  client.get<{ data: WeeklyWorklog }>(`/weekly-worklogs/${id}`).then((r) => r.data.data);

export const createWorklog = (payload: WorklogPayload) =>
  client.post<{ data: WeeklyWorklog }>('/weekly-worklogs', payload).then((r) => r.data.data);

export const updateWorklog = (id: number, payload: Partial<WorklogPayload>) =>
  client.put<{ data: WeeklyWorklog }>(`/weekly-worklogs/${id}`, payload).then((r) => r.data.data);

export const deleteWorklog = (id: number) =>
  client.delete(`/weekly-worklogs/${id}`).then((r) => r.data);

export const submitWorklog = (id: number) =>
  client.patch<{ data: WeeklyWorklog }>(`/weekly-worklogs/${id}/submit`).then((r) => r.data.data);

export const reviewWorklog = (id: number, payload: ReviewPayload) =>
  client.patch<{ data: WeeklyWorklog }>(`/weekly-worklogs/${id}/review`, payload).then((r) => r.data.data);
