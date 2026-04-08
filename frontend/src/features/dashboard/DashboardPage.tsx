import {
  Users,
  GraduationCap,
  BookOpen,
  Briefcase,
  ClipboardList,
  FileText,
  Presentation,
  CalendarCheck,
  Video,
  CheckCircle,
  Send,
  TrendingUp,
  Clock,
  Award,
  Mail,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { formatDate } from '../../lib/formatDate';
import client from '../../api/client';

interface StatCard {
  labelKey: string;
  key: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const adminTopCards: StatCard[] = [
  { labelKey: 'dashboard.totalUsers', key: 'total_users', icon: Users, color: '#48B6E8', bgColor: '#eef8fd' },
  { labelKey: 'dashboard.totalInterns', key: 'total_interns', icon: GraduationCap, color: '#22c55e', bgColor: '#f0fdf4' },
  { labelKey: 'dashboard.totalTutors', key: 'total_tutors', icon: BookOpen, color: '#a78bfa', bgColor: '#f5f3ff' },
  { labelKey: 'dashboard.totalSupervisors', key: 'total_supervisors', icon: Briefcase, color: '#f59e0b', bgColor: '#fffbeb' },
];
const adminBottomCards: StatCard[] = [
  { labelKey: 'dashboard.pendingWorklogs', key: 'pending_worklogs', icon: ClipboardList, color: '#fb923c', bgColor: '#fff7ed' },
  { labelKey: 'dashboard.pendingReports', key: 'pending_reports', icon: FileText, color: '#ef4444', bgColor: '#fef2f2' },
  { labelKey: 'dashboard.pendingSlides', key: 'pending_slides', icon: Presentation, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { labelKey: 'dashboard.upcomingInterviews', key: 'upcoming_interviews', icon: CalendarCheck, color: '#0d9488', bgColor: '#f0fdfa' },
];

const tutorTopCards: StatCard[] = [
  { labelKey: 'dashboard.myInterns', key: 'my_interns', icon: GraduationCap, color: '#48B6E8', bgColor: '#eef8fd' },
  { labelKey: 'dashboard.pendingWorklogs', key: 'pending_worklogs', icon: ClipboardList, color: '#fb923c', bgColor: '#fff7ed' },
  { labelKey: 'dashboard.pendingReports', key: 'pending_reports', icon: FileText, color: '#ef4444', bgColor: '#fef2f2' },
  { labelKey: 'dashboard.pendingSlides', key: 'pending_slides', icon: Presentation, color: '#8b5cf6', bgColor: '#f5f3ff' },
];
const tutorBottomCards: StatCard[] = [
  { labelKey: 'dashboard.totalWorklogs', key: 'total_worklogs', icon: TrendingUp, color: '#22c55e', bgColor: '#f0fdf4' },
  { labelKey: 'dashboard.approvedReports', key: 'approved_reports', icon: CheckCircle, color: '#0d9488', bgColor: '#f0fdfa' },
  { labelKey: 'dashboard.approvedSlides', key: 'approved_slides', icon: Award, color: '#f59e0b', bgColor: '#fffbeb' },
  { labelKey: 'dashboard.upcomingSessions', key: 'upcoming_sessions', icon: Video, color: '#7c3aed', bgColor: '#f5f3ff' },
];

const internTopCards: StatCard[] = [
  { labelKey: 'dashboard.myWorklogs', key: 'my_worklogs', icon: ClipboardList, color: '#48B6E8', bgColor: '#eef8fd' },
  { labelKey: 'dashboard.submitted', key: 'submitted_worklogs', icon: Send, color: '#f59e0b', bgColor: '#fffbeb' },
  { labelKey: 'dashboard.approved', key: 'approved_worklogs', icon: CheckCircle, color: '#22c55e', bgColor: '#f0fdf4' },
  { labelKey: 'dashboard.myInterviews', key: 'my_interviews', icon: CalendarCheck, color: '#0d9488', bgColor: '#f0fdfa' },
];
const internBottomCards: StatCard[] = [
  { labelKey: 'dashboard.myReports', key: 'my_reports', icon: FileText, color: '#fb923c', bgColor: '#fff7ed' },
  { labelKey: 'dashboard.mySlides', key: 'my_slides', icon: Presentation, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { labelKey: 'dashboard.passedInterviews', key: 'passed_interviews', icon: Award, color: '#ef4444', bgColor: '#fef2f2' },
  { labelKey: 'dashboard.upcomingSessions', key: 'upcoming_sessions', icon: Video, color: '#7c3aed', bgColor: '#f5f3ff' },
];

const roleTopMap: Record<string, StatCard[]> = { admin: adminTopCards, tutor: tutorTopCards, intern: internTopCards };
const roleBottomMap: Record<string, StatCard[]> = { admin: adminBottomCards, tutor: tutorBottomCards, intern: internBottomCards };
const greetingMap: Record<string, string> = { admin: 'dashboard.adminGreeting', tutor: 'dashboard.tutorGreeting', intern: 'dashboard.internGreeting' };

function getValue(stats: any, key: string): number {
  return stats ? (stats as Record<string, number>)[key] ?? 0 : 0;
}

function fmt12(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(m).padStart(2, '0')} ${p}`;
}

// Tutor: Interns overview table
function TutorInternsOverview() {
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ['dash-my-interns'], queryFn: () => client.get('/my-interns', { params: { per_page: 50 } }).then((r: any) => r.data.data || []) });
  const { data: sessions } = useQuery({ queryKey: ['dash-tutor-sessions'], queryFn: () => client.get('/mentoring-sessions', { params: { per_page: 5, status: 'scheduled' } }).then((r: any) => r.data.data || []) });

  const interns = data || [];
  const upcomingSessions = (sessions || []).slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
      {/* Interns Status Table */}
      <div className="lg:col-span-2 bg-white rounded-[5px] border border-[#e5e7eb]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
          <h2 className="text-[0.88rem] font-bold text-[#111827]">{t('dashboard.internsOverview')}</h2>
          <GraduationCap className="w-4 h-4 text-[#9ca3af]" />
        </div>
        {interns.length === 0 ? (
          <p className="text-[0.82rem] text-[#9ca3af] text-center py-8">{t('dashboard.noInterns')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  <th className="text-left px-5 py-2.5 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('mentoring.intern')}</th>
                  <th className="text-left px-5 py-2.5 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.company')}</th>
                  <th className="text-left px-5 py-2.5 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('interviews.generation')}</th>
                </tr>
              </thead>
              <tbody>
                {interns.slice(0, 6).map((intern: any) => (
                  <tr key={intern.id} className="border-b border-[#f8f8f8] last:border-0 hover:bg-[#fafbfc] transition-colors">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={intern.name} avatar={intern.avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="text-[0.82rem] font-medium text-[#1a1a2e] truncate">{intern.name}</p>
                          <p className="text-[0.68rem] text-[#9ca3af] truncate">{intern.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-[0.78rem] text-[#374151]">{intern.company_name || '-'}</td>
                    <td className="px-5 py-2.5 text-[0.78rem] text-[#374151]">{intern.generation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {interns.length > 6 && (
              <div className="px-5 py-2.5 border-t border-[#f0f0f0] text-center">
                <a href="/my-interns" className="text-[0.75rem] text-[#6366f1] font-medium hover:underline">{t('dashboard.viewAll')} ({interns.length})</a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-[5px] border border-[#e5e7eb]" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0f0f0]">
          <h2 className="text-[0.88rem] font-bold text-[#111827]">{t('dashboard.upcomingSessions')}</h2>
          <Video className="w-4 h-4 text-[#9ca3af]" />
        </div>
        {upcomingSessions.length === 0 ? (
          <p className="text-[0.82rem] text-[#9ca3af] text-center py-8">{t('dashboard.noSessions')}</p>
        ) : (
          <div className="p-3 space-y-2">
            {upcomingSessions.map((s: any) => (
              <div key={s.id} className="p-3 rounded-[5px] border border-[#f0f0f0] hover:border-[#d1d5db] transition-colors">
                <p className="text-[0.82rem] font-medium text-[#1a1a2e] truncate">{s.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <UserAvatar name={s.intern?.name || ''} avatar={s.intern?.avatar} size="xs" />
                  <span className="text-[0.72rem] text-[#6b7280] truncate">{s.intern?.name}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[0.68rem] text-[#9ca3af]">
                  <span>{formatDate(s.scheduled_date)}</span>
                  {s.scheduled_time && <span>{fmt12(s.scheduled_time)}</span>}
                </div>
              </div>
            ))}
            <a href="/mentoring-sessions" className="block text-center text-[0.75rem] text-[#6366f1] font-medium hover:underline pt-1">{t('dashboard.viewAll')}</a>
          </div>
        )}
      </div>
    </div>
  );
}

// Intern: Tutor card + upcoming deadlines + upcoming sessions
function InternExtras() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: dlReport } = useQuery({ queryKey: ['dash-dl-report'], queryFn: () => client.get('/deadlines/final_report').then((r: any) => r.data.data) });
  const { data: dlSlide } = useQuery({ queryKey: ['dash-dl-slide'], queryFn: () => client.get('/deadlines/final_slide').then((r: any) => r.data.data) });
  const { data: sessions } = useQuery({ queryKey: ['dash-intern-sessions'], queryFn: () => client.get('/mentoring-sessions', { params: { per_page: 3, status: 'scheduled' } }).then((r: any) => r.data.data || []) });

  const deadlines: { label: string; date: string; icon: LucideIcon; color: string }[] = [];
  if (dlReport?.deadline) deadlines.push({ label: t('calendar.reportDeadline'), date: dlReport.deadline, icon: FileText, color: '#ef4444' });
  if (dlSlide?.deadline) deadlines.push({ label: t('calendar.slideDeadline'), date: dlSlide.deadline, icon: Presentation, color: '#8b5cf6' });

  const upcomingSessions = (sessions || []).slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {/* My Tutor Card */}
      {user?.tutor && (
        <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h2 className="text-[0.88rem] font-bold text-[#111827] mb-4">{t('dashboard.myTutor')}</h2>
          <div className="flex items-center gap-3 mb-4">
            <UserAvatar name={user.tutor.name} avatar={user.tutor.avatar} size="lg" />
            <div>
              <p className="text-[0.92rem] font-semibold text-[#1a1a2e]">{user.tutor.name}</p>
              <p className="text-[0.75rem] text-[#6366f1] font-medium">{t('profile.tutor')}</p>
            </div>
          </div>
          <div className="space-y-2.5 pt-3 border-t border-[#f0f0f0]">
            <div className="flex items-center gap-2 text-[0.78rem] text-[#6b7280]">
              <Mail className="w-3.5 h-3.5 text-[#9ca3af]" />
              <span className="truncate">{user.tutor.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h2 className="text-[0.88rem] font-bold text-[#111827] mb-4">{t('dashboard.deadlines')}</h2>
        {deadlines.length === 0 ? (
          <p className="text-[0.82rem] text-[#9ca3af] text-center py-4">{t('dashboard.noDeadlines')}</p>
        ) : (
          <div className="space-y-3">
            {deadlines.map((dl, i) => {
              const daysLeft = Math.ceil((new Date(dl.date).getTime() - new Date().getTime()) / 86400000);
              const isOverdue = daysLeft < 0;
              return (
                <div key={i} className="flex items-start gap-3 p-3 rounded-[5px] border border-[#f0f0f0]">
                  <div className="w-8 h-8 rounded-[5px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${dl.color}12` }}>
                    <dl.icon className="w-4 h-4" style={{ color: dl.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[0.78rem] font-medium text-[#1a1a2e] truncate">{dl.label}</p>
                    <p className="text-[0.72rem] text-[#6b7280] mt-0.5">{formatDate(dl.date)}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[0.65rem] font-medium ${isOverdue ? 'bg-[#fef2f2] text-[#ef4444]' : daysLeft <= 3 ? 'bg-[#fffbeb] text-[#f59e0b]' : 'bg-[#f0fdf4] text-[#22c55e]'}`}>
                      {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-5" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <h2 className="text-[0.88rem] font-bold text-[#111827] mb-4">{t('dashboard.upcomingSessions')}</h2>
        {upcomingSessions.length === 0 ? (
          <p className="text-[0.82rem] text-[#9ca3af] text-center py-4">{t('dashboard.noSessions')}</p>
        ) : (
          <div className="space-y-2.5">
            {upcomingSessions.map((s: any) => (
              <div key={s.id} className="p-3 rounded-[5px] border border-[#f0f0f0]">
                <p className="text-[0.78rem] font-medium text-[#1a1a2e] truncate">{s.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <UserAvatar name={s.tutor?.name || ''} avatar={s.tutor?.avatar} size="xs" />
                  <span className="text-[0.72rem] text-[#6b7280]">{s.tutor?.name}</span>
                </div>
                <p className="text-[0.68rem] text-[#9ca3af] mt-1">{formatDate(s.scheduled_date)} {s.scheduled_time ? `· ${fmt12(s.scheduled_time)}` : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useDashboardStats();
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const topCards = roleTopMap[roleSlug] || adminTopCards;
  const bottomCards = roleBottomMap[roleSlug] || adminBottomCards;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">
          {t('dashboard.welcome', { name: user?.name || 'User' })}
        </h1>
        <p className="mt-1 text-[0.88rem] text-[#6b7280]">
          {t(greetingMap[roleSlug] || 'dashboard.defaultGreeting')}
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
                  <p className="text-[0.75rem] sm:text-[0.8rem] text-[#6b7280] font-medium leading-tight">{t(card.labelKey)}</p>
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
              <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[0.95rem] font-bold text-[#111827]">
                    {roleSlug === 'intern' ? t('dashboard.myProgress') : t('dashboard.pendingReview')}
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
                          <span className="text-[0.82rem] text-[#374151] font-medium">{t(card.labelKey)}</span>
                        </div>
                        <span className="text-[1.1rem] font-bold text-[#111827]">{value.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {bottomCards.length > Math.ceil(bottomCards.length / 2) && (
                <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[0.95rem] font-bold text-[#111827]">
                      {roleSlug === 'intern' ? t('dashboard.submissions') : t('dashboard.activitySummary')}
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
                              <span className="text-[0.82rem] text-[#374151] font-medium">{t(card.labelKey)}</span>
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

          {/* Tutor extras */}
          {roleSlug === 'tutor' && <TutorInternsOverview />}

          {/* Intern extras */}
          {roleSlug === 'intern' && <InternExtras />}
        </>
      )}
    </div>
  );
}
