import type { Role } from './ims';

export interface User {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role?: Role;
  phone: string | null;
  department: string | null;
  avatar: string | null;
  cover: string | null;
  is_active: boolean;
  company_name: string | null;
  position: string | null;
  allowance: number | null;
  tutor_id: number | null;
  tutor?: { id: number; name: string; email: string; avatar: string | null } | null;
  supervisor_name: string | null;
  generation: string | null;
  email_verified_at: string | null;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  role?: string;
  department?: string;
  company_name?: string;
  position?: string;
  tutor_id?: number;
  supervisor_name?: string;
  generation?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
