import client from './client';
import type { DashboardStats } from '../types/ims';

export const getDashboardStats = () =>
  client.get<{ data: DashboardStats }>('/dashboard').then((r) => r.data.data);
