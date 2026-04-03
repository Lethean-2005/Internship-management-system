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
  is_active: boolean;
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
}

export interface AuthResponse {
  user: User;
  token: string;
}
