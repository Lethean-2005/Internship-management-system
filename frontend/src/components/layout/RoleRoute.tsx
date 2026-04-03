import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface RoleRouteProps {
  roles: string[];
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';

  if (!roles.includes(roleSlug)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
