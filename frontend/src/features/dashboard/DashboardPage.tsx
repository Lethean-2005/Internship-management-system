import {
  Users,
  GraduationCap,
  BookOpen,
  Briefcase,
  ClipboardList,
  FileText,
  Presentation,
  CalendarCheck,
  CheckCircle,
  Send,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface StatCard {
  label: string;
  key: string;
  icon: LucideIcon;
  gradient: string;
}

const adminCards: StatCard[] = [
  { label: 'Total Users', key: 'total_users', icon: Users, gradient: 'linear-gradient(135deg, #48B6E8, #3a9fd4)' },
  { label: 'Total Interns', key: 'total_interns', icon: GraduationCap, gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  { label: 'Total Tutors', key: 'total_tutors', icon: BookOpen, gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  { label: 'Total Supervisors', key: 'total_supervisors', icon: Briefcase, gradient: 'linear-gradient(135deg, #fbbf24, #d97706)' },
  { label: 'Pending Worklogs', key: 'pending_worklogs', icon: ClipboardList, gradient: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { label: 'Pending Reports', key: 'pending_reports', icon: FileText, gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)' },
  { label: 'Pending Slides', key: 'pending_slides', icon: Presentation, gradient: 'linear-gradient(135deg, #f87171, #dc2626)' },
  { label: 'Upcoming Interviews', key: 'upcoming_interviews', icon: CalendarCheck, gradient: 'linear-gradient(135deg, #48B6E8, #4338ca)' },
];

const tutorCards: StatCard[] = [
  { label: 'My Interns', key: 'my_interns', icon: GraduationCap, gradient: 'linear-gradient(135deg, #48B6E8, #3a9fd4)' },
  { label: 'Pending Worklogs', key: 'pending_worklogs', icon: ClipboardList, gradient: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { label: 'Pending Reports', key: 'pending_reports', icon: FileText, gradient: 'linear-gradient(135deg, #f87171, #dc2626)' },
  { label: 'Pending Slides', key: 'pending_slides', icon: Presentation, gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  { label: 'Total Worklogs', key: 'total_worklogs', icon: ClipboardList, gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  { label: 'Approved Reports', key: 'approved_reports', icon: CheckCircle, gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)' },
  { label: 'Approved Slides', key: 'approved_slides', icon: CheckCircle, gradient: 'linear-gradient(135deg, #fbbf24, #d97706)' },
];

const supervisorCards: StatCard[] = [
  { label: 'Total Interns', key: 'total_interns', icon: GraduationCap, gradient: 'linear-gradient(135deg, #48B6E8, #3a9fd4)' },
  { label: 'Pending Worklogs', key: 'pending_worklogs', icon: ClipboardList, gradient: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { label: 'Pending Reports', key: 'pending_reports', icon: FileText, gradient: 'linear-gradient(135deg, #f87171, #dc2626)' },
  { label: 'Pending Slides', key: 'pending_slides', icon: Presentation, gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  { label: 'Upcoming Interviews', key: 'upcoming_interviews', icon: CalendarCheck, gradient: 'linear-gradient(135deg, #34d399, #059669)' },
];

const internCards: StatCard[] = [
  { label: 'My Worklogs', key: 'my_worklogs', icon: ClipboardList, gradient: 'linear-gradient(135deg, #48B6E8, #3a9fd4)' },
  { label: 'Submitted', key: 'submitted_worklogs', icon: Send, gradient: 'linear-gradient(135deg, #fbbf24, #d97706)' },
  { label: 'Approved', key: 'approved_worklogs', icon: CheckCircle, gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  { label: 'My Reports', key: 'my_reports', icon: FileText, gradient: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { label: 'My Slides', key: 'my_slides', icon: Presentation, gradient: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
  { label: 'My Interviews', key: 'my_interviews', icon: CalendarCheck, gradient: 'linear-gradient(135deg, #2dd4bf, #0d9488)' },
  { label: 'Passed Interviews', key: 'passed_interviews', icon: CheckCircle, gradient: 'linear-gradient(135deg, #f87171, #dc2626)' },
];

const roleCardMap: Record<string, StatCard[]> = {
  admin: adminCards,
  tutor: tutorCards,
  supervisor: supervisorCards,
  intern: internCards,
};

const greetingMap: Record<string, string> = {
  admin: 'System overview and management.',
  tutor: 'Overview of your assigned interns.',
  supervisor: 'Overview of internship activities.',
  intern: 'Your internship progress overview.',
};

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const cards = roleCardMap[roleSlug] || adminCards;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">
          Welcome, {user?.name || 'User'}
        </h1>
        <p className="mt-1 text-[0.88rem] text-[#6b7280]">
          {greetingMap[roleSlug] || 'Overview of the Internship Management System - Auto Deploy Test.'}
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cards.map((card) => {
            const value = stats ? (stats as unknown as Record<string, number>)[card.key] ?? 0 : 0;
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
      )}
    </div>
  );
}
