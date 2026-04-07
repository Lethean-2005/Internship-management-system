import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user to load before checking verification
  if (!user) {
    return null;
  }

  if (!user.email_verified_at) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
