import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { RoleRoute } from './components/layout/RoleRoute';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { UsersPage } from './features/users/UsersPage';
import { RolesPage } from './features/roles/RolesPage';
import { WeeklyWorklogsPage } from './features/worklogs/WeeklyWorklogsPage';
import { WorklogDetail } from './features/worklogs/WorklogDetail';
import { FinalReportsPage } from './features/reports/FinalReportsPage';
import { FinalSlidesPage } from './features/slides/FinalSlidesPage';
import { ContactSupervisorPage } from './features/contacts/ContactSupervisorPage';
import { CompanyInterviewsPage } from './features/interviews/CompanyInterviewsPage';

import { MyInternsPage } from './features/interns/MyInternsPage';
import { useAuthStore } from './stores/authStore';
import { getMe } from './api/auth';

function App() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => clearAuth());
    }
  }, [token, setUser, clearAuth]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Dashboard — all roles */}
          <Route index element={<DashboardPage />} />

          {/* Admin only */}
          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="users" element={<UsersPage />} />
            <Route path="roles" element={<RolesPage />} />
          </Route>


          {/* Tutor only */}
          <Route element={<RoleRoute roles={['tutor']} />}>
            <Route path="my-interns" element={<MyInternsPage />} />
          </Route>

          {/* All roles */}
          <Route path="weekly-worklogs" element={<WeeklyWorklogsPage />} />
          <Route path="weekly-worklogs/:id" element={<WorklogDetail />} />
          <Route path="final-reports" element={<FinalReportsPage />} />
          <Route path="final-slides" element={<FinalSlidesPage />} />
          <Route path="contact-supervisor" element={<ContactSupervisorPage />} />
          <Route path="company-interviews" element={<CompanyInterviewsPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
