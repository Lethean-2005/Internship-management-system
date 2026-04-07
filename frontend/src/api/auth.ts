import client from './client';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

export const login = (payload: LoginPayload) =>
  client.post<AuthResponse>('/login', payload).then((r) => r.data);

export const register = (payload: RegisterPayload) =>
  client.post<AuthResponse>('/register', payload).then((r) => r.data);

export const logout = () =>
  client.post('/logout').then((r) => r.data);

export const getMe = () =>
  client.get<{ data: User }>('/me').then((r) => r.data.data);

export const verifyEmail = (code: string) =>
  client.post('/verify-email', { code }).then((r) => r.data);

export const resendCode = () =>
  client.post('/resend-code').then((r) => r.data);
