import client from './client';
import type { User } from '../types/ims';
import type { PaginatedResponse } from '../types/api';

export interface UserFilters {
  search?: string;
  role?: string;
  is_active?: boolean;
  page?: number;
  per_page?: number;
}

export interface UserPayload {
  name: string;
  email: string;
  password?: string;
  role_id: number | null;
  phone?: string | null;
  department?: string | null;
}

export const getUsers = (filters?: UserFilters) =>
  client.get<PaginatedResponse<User>>('/users', { params: filters }).then((r) => r.data);

export const getUser = (id: number) =>
  client.get<{ data: User }>(`/users/${id}`).then((r) => r.data.data);

export const createUser = (payload: UserPayload) =>
  client.post<{ data: User }>('/users', payload).then((r) => r.data.data);

export const updateUser = (id: number, payload: Partial<UserPayload>) =>
  client.put<{ data: User }>(`/users/${id}`, payload).then((r) => r.data.data);

export const deleteUser = (id: number) =>
  client.delete(`/users/${id}`).then((r) => r.data);

export const toggleActive = (id: number) =>
  client.patch<{ data: User }>(`/users/${id}/toggle-active`).then((r) => r.data.data);
