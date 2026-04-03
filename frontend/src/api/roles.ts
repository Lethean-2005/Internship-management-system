import client from './client';
import type { Role } from '../types/ims';

export interface RolePayload {
  name: string;
  slug: string;
  description?: string | null;
}

export const getRoles = () =>
  client.get<{ data: Role[] }>('/roles').then((r) => r.data.data);

export const createRole = (payload: RolePayload) =>
  client.post<{ data: Role }>('/roles', payload).then((r) => r.data.data);

export const updateRole = (id: number, payload: Partial<RolePayload>) =>
  client.put<{ data: Role }>(`/roles/${id}`, payload).then((r) => r.data.data);

export const deleteRole = (id: number) =>
  client.delete(`/roles/${id}`).then((r) => r.data);
