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
  TrendingUp,
  Clock,
  Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface StatCard {
  label: string;
  key: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

// Top stat cards (first 4 shown in top row)
const adminTopCards: StatCard[] = [
  { label: 'Total Users', key: 'total_users', icon: Users, color: '#48B6E8', bgColor: '#eef8fd' },
  { label: 'Total Interns', key: 'total_interns', icon: GraduationCap, color: '#22c55e', bgColor: '#f0fdf4' },
  { label: 'Total Tutors', key: 'total_tutors', icon: BookOpen, color: '#a78bfa', bgColor: '#f5f3ff' },
  { label: 'Total Supervisors', key: 'total_supervisors', icon: Briefcase, color: '#f59e0b', bgColor: '#fffbeb' },
];

const adminBottomCards: StatCard[] = [
  { label: 'Pending Worklogs', key: 'pending_worklogs', icon: ClipboardList, color: '#fb923c', bgColor: '#fff7ed' },
  { label: 'Pending Reports', key: 'pending_reports', icon: FileText, color: '#ef4444', bgColor: '#fef2f2' },
  { label: 'Pending Slides', key: 'pending_slides', icon: Presentation, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { label: 'Upcoming Interviews', key: 'upcoming_interviews', icon: CalendarCheck, color: '#0d9488', bgColor: '#f0fdfa' },
];

const tutorTopCards: StatCard[] = [
  { label: 'My Interns', key: 'my_interns', icon: GraduationCap, color: '#48B6E8', bgColor: '#eef8fd' },
  { label: 'Pending Worklogs', key: 'pending_worklogs', icon: ClipboardList, color: '#fb923c', bgColor: '#fff7ed' },
  { label: 'Pending Reports', key: 'pending_reports', icon: FileText, color: '#ef4444', bgColor: '#fef2f2' },
  { label: 'Pending Slides', key: 'pending_slides', icon: Presentation, color: '#8b5cf6', bgColor: '#f5f3ff' },
];

const tutorBottomCards: StatCard[] = [
  { label: 'Total Worklogs', key: 'total_worklogs', icon: TrendingUp, color: '#22c55e', bgColor: '#f0fdf4' },
  { label: 'Approved Reports', key: 'approved_reports', icon: CheckCircle, color: '#0d9488', bgColor: '#f0fdfa' },
  { label: 'Approved Slides', key: 'approved_slides', icon: Award, color: '#f59e0b', bgColor: '#fffbeb' },
];

const supervisorTopCards: StatCard[] = [
  { label: 'Total Interns', key: 'total_interns', icon: GraduationCap, color: '#48B6E8', bgColor: '#eef8fd' },
  { label: 'Pending Worklogs', key: 'pending_worklogs', icon: ClipboardList, color: '#fb923c', bgColor: '#fff7ed' },
  { label: 'Pending Reports', key: 'pending_reports', icon: FileText, color: '#ef4444', bgColor: '#fef2f2' },
  { label: 'Pending Slides', key: 'pending_slides', icon: Presentation, color: '#8b5cf6', bgColor: '#f5f3ff' },
];

const supervisorBottomCards: StatCard[] = [
  { label: 'Upcoming Interviews', key: 'upcoming_interviews', icon: CalendarCheck, color: '#0d9488', bgColor: '#f0fdfa' },
];

const internTopCards: StatCard[] = [
  { label: 'My Worklogs', key: 'my_worklogs', icon: ClipboardList, color: '#48B6E8', bgColor: '#eef8fd' },
  { label: 'Submitted', key: 'submitted_worklogs', icon: Send, color: '#f59e0b', bgColor: '#fffbeb' },
  { label: 'Approved', key: 'approved_worklogs', icon: CheckCircle, color: '#22c55e', bgColor: '#f0fdf4' },
  { label: 'My Interviews', key: 'my_interviews', icon: CalendarCheck, color: '#0d9488', bgColor: '#f0fdfa' },
];

const internBottomCards: StatCard[] = [
  { label: 'My Reports', key: 'my_reports', icon: FileText, color: '#fb923c', bgColor: '#fff7ed' },
  { label: 'My Slides', key: 'my_slides', icon: Presentation, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { label: 'Passed Interviews', key: 'passed_interviews', icon: Award, color: '#ef4444', bgColor: '#fef2f2' },
];

const roleTopMap: Record<string, StatCard[]> = { admin: adminTopCards, tutor: tutorTopCards, supervisor: supervisorTopCards, intern: internTopCards };
const roleBottomMap: Record<string, StatCard[]> = { admin: adminBottomCards, tutor: tutorBottomCards, supervisor: supervisorBottomCards, intern: internBottomCards };

const greetingMap: Record<string, string> = {
  admin: 'System overview and management.',
  tutor: 'Overview of your assigned interns.',
  supervisor: 'Overview of internship activities.',
  intern: 'Your internship progress overview.',
};

function getValue(stats: any, key: string): number {
  return stats ? (stats as Record<string, number>)[key] ?? 0 : 0;
}

export function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const topCards = roleTopMap[roleSlug] || adminTopCards;
  const bottomCards = roleBottomMap[roleSlug] || adminBottomCards;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">
          Welcome, {user?.name || 'User'}
        </h1>
        <p className="mt-1 text-[0.88rem] text-[#6b7280]">
          {greetingMap[roleSlug] || 'Overview of the Internship Management System.'}
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-20" />
      ) : (
        <>
          {/* Top stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {topCards.map((card) => (
              <div key={card.key} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 sm:p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-[5px] flex items-center justify-center" style={{ backgroundColor: card.bgColor }}>
                    <card.icon className="w-[18px] h-[18px]" style={{ color: card.color }} />
                  </div>
                  <p className="text-[0.75rem] sm:text-[0.8rem] text-[#6b7280] font-medium leading-tight">{card.label}</p>
                </div>
                <p className="text-[1.5rem] sm:text-[1.75rem] font-extrabold text-[#111827] leading-none">
                  {getValue(stats, card.key).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom section - 2 column grid */}
          {bottomCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Overview table */}
              <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[0.95rem] font-bold text-[#111827]">
                    {roleSlug === 'intern' ? 'My Progress' : 'Pending Review'}
                  </h2>
                  <Clock className="w-4 h-4 text-[#9ca3af]" />
                </div>
                <div className="space-y-3">
                  {bottomCards.slice(0, Math.ceil(bottomCards.length / 2)).map((card) => {
                    const value = getValue(stats, card.key);
                    return (
                      <div key={card.key} className="flex items-center justify-between py-2.5 border-b border-[#f5f5f5] last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-[5px] flex items-center justify-center" style={{ backgroundColor: card.bgColor }}>
                            <card.icon className="w-4 h-4" style={{ color: card.color }} />
                          </div>
                          <span className="text-[0.82rem] text-[#374151] font-medium">{card.label}</span>
                        </div>
                        <span className="text-[1.1rem] font-bold text-[#111827]">{value.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Additional stats */}
              {bottomCards.length > Math.ceil(bottomCards.length / 2) && (
                <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[0.95rem] font-bold text-[#111827]">
                      {roleSlug === 'intern' ? 'Submissions' : 'Activity Summary'}
                    </h2>
                    <TrendingUp className="w-4 h-4 text-[#9ca3af]" />
                  </div>
                  <div className="space-y-3">
                    {bottomCards.slice(Math.ceil(bottomCards.length / 2)).map((card) => {
                      const value = getValue(stats, card.key);
                      const maxValue = Math.max(...bottomCards.map(c => getValue(stats, c.key)), 1);
                      const pct = Math.round((value / maxValue) * 100);
                      return (
                        <div key={card.key} className="py-2.5 border-b border-[#f5f5f5] last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-[5px] flex items-center justify-center" style={{ backgroundColor: card.bgColor }}>
                                <card.icon className="w-4 h-4" style={{ color: card.color }} />
                              </div>
                              <span className="text-[0.82rem] text-[#374151] font-medium">{card.label}</span>
                            </div>
                            <span className="text-[0.82rem] font-bold text-[#111827]">{value.toLocaleString()}</span>
                          </div>
                          <div className="h-[6px] bg-[#f3f4f6] rounded-full overflow-hidden ml-11">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: card.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
