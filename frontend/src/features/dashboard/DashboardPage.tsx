import {
  Users,
  GraduationCap,
  Briefcase,
  ClipboardList,
  FileText,
  Presentation,
  CalendarCheck,
  Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface StatCard {
  label: string;
  key: string;
  icon: LucideIcon;
  gradient: string;
}

const statCards: StatCard[] = [
  { label: 'Total Users', key: 'total_users', icon: Users, gradient: 'linear-gradient(135deg, #48B6E8, #3a9fd4)' },
  { label: 'Active Interns', key: 'total_interns', icon: GraduationCap, gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  { label: 'Active Internships', key: 'active_internships', icon: Briefcase, gradient: 'linear-gradient(135deg, #fbbf24, #d97706)' },
  { label: 'Pending Worklogs', key: 'pending_worklogs', icon: ClipboardList, gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  { label: 'Pending Reports', key: 'pending_reports', icon: FileText, gradient: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { label: 'Pending Slides', key: 'pending_slides', icon: Presentation, gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)' },
  { label: 'Upcoming Interviews', key: 'upcoming_interviews', icon: CalendarCheck, gradient: 'linear-gradient(135deg, #f87171, #dc2626)' },
  { label: 'Total Companies', key: 'total_companies', icon: Building2, gradient: 'linear-gradient(135deg, #48B6E8, #4338ca)' },
];

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">Dashboard</h1>
        <p className="mt-1 text-[0.88rem] text-[#6b7280]">
          Overview of the Internship Management System.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {statCards.map((card) => {
              const value = stats ? (stats as Record<string, number>)[card.key] ?? 0 : 0;
              return (
                <div
                  key={card.key}
                  className="rounded-[5px] p-5 text-white"
                  style={{ background: card.gradient }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <card.icon className="h-6 w-6 opacity-80" />
                  </div>
                  <div className="text-[1.75rem] font-extrabold leading-none mb-1">
                    {value}
                  </div>
                  <p className="text-[0.82rem] text-white/70 mt-1">
                    {card.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8">
            <h2 className="text-[1.1rem] font-semibold text-[#1e1b4b] mb-4">Recent Activity</h2>
            <div className="bg-white border border-[#f0f0f0] rounded-[5px] p-6">
              <p className="text-[0.88rem] text-[#6b7280]">
                Welcome to the Internship Management System. Use the sidebar to navigate through modules.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
