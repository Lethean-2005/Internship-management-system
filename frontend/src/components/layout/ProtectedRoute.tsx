import { Navigate, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const { data: publicSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => fetch('/api/public/settings').then((r) => r.json()).then((r) => r.data),
    staleTime: 60000,
  });

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || settingsLoading) {
    return null;
  }

  const requireVerification = publicSettings?.require_email_verification === '1';

  if (requireVerification && !user.email_verified_at) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
