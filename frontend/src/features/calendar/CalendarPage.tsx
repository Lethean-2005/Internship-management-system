import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, CalendarCheck, Video, CalendarOff, FileText, Presentation, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { UserAvatar } from '../../components/ui/UserAvatar';
import client from '../../api/client';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

interface CalendarEvent {
  id: string;
  title: string;
  label: string;
  date: string;
  time?: string;
  type: 'interview' | 'mentoring' | 'leave' | 'deadline' | 'worklog';
  status?: string;
  color: string;
  icon: LucideIcon;
  meta?: Record<string, any>;
}

const TYPE_COLORS: Record<string, string> = {
  interview: '#0d9488',
  mentoring: '#7c3aed',
  leave: '#ec4899',
  deadline: '#ef4444',
  worklog: '#f59e0b',
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  interview: CalendarCheck,
  mentoring: Video,
  leave: CalendarOff,
  deadline: FileText,
  worklog: ClipboardList,
};

function dk(d: string) { return d?.slice(0, 10) || ''; }

function dateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) dates.push(d.toISOString().slice(0, 10));
  return dates;
}

function fmt12(time: string) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const p = h >= 12 ? 'PM' : 'AM';
  return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${String(m).padStart(2, '0')} ${p}`;
}

export function CalendarPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const today = new Date();
  const [vYear, setVYear] = useState(today.getFullYear());
  const [vMonth, setVMonth] = useState(today.getMonth());
  const [selDate, setSelDate] = useState<string | null>(null);
  const [selEvent, setSelEvent] = useState<CalendarEvent | null>(null);

  const prev = () => { if (vMonth === 0) { setVMonth(11); setVYear(vYear - 1); } else setVMonth(vMonth - 1); };
  const next = () => { if (vMonth === 11) { setVMonth(0); setVYear(vYear + 1); } else setVMonth(vMonth + 1); };

  // Data
  const { data: interviews } = useQuery({ queryKey: ['cal-iv'], queryFn: () => client.get('/company-interviews', { params: { per_page: 100 } }).then((r: any) => r.data.data || []), enabled: roleSlug !== 'tutor' });
  const { data: sessions } = useQuery({ queryKey: ['cal-ms'], queryFn: () => client.get('/mentoring-sessions', { params: { per_page: 100 } }).then((r: any) => r.data.data || []), enabled: roleSlug === 'tutor' || roleSlug === 'intern' });
  const { data: leaves } = useQuery({ queryKey: ['cal-lv'], queryFn: () => client.get('/intern-leaves', { params: { per_page: 100 } }).then((r: any) => r.data.data || []) });
  const { data: worklogs } = useQuery({ queryKey: ['cal-wl'], queryFn: () => client.get('/weekly-worklogs', { params: { per_page: 100 } }).then((r: any) => r.data.data || []) });
  const { data: dlReport } = useQuery({ queryKey: ['cal-dlr'], queryFn: () => client.get('/deadlines/final_report').then((r: any) => r.data.data) });
  const { data: dlSlide } = useQuery({ queryKey: ['cal-dls'], queryFn: () => client.get('/deadlines/final_slide').then((r: any) => r.data.data) });

  const events = useMemo(() => {
    const evts: CalendarEvent[] = [];
    (interviews || []).forEach((iv: any) => {
      const d = dk(iv.interview_date);
      if (d) evts.push({ id: `iv-${iv.id}`, title: iv.company_name || 'Interview', label: t('calendar.interview'), date: d, time: iv.interview_date?.match(/T(\d{2}:\d{2})/)?.[1], type: 'interview', status: iv.result || iv.status, color: TYPE_COLORS.interview, icon: TYPE_ICONS.interview, meta: iv });
    });
    (sessions || []).forEach((s: any) => {
      const d = dk(s.scheduled_date);
      if (d) evts.push({ id: `ms-${s.id}`, title: s.title, label: t('calendar.mentoring'), date: d, time: s.scheduled_time, type: 'mentoring', status: s.status, color: TYPE_COLORS.mentoring, icon: TYPE_ICONS.mentoring, meta: s });
    });
    (leaves || []).forEach((l: any) => {
      const s = dk(l.start_date), e = dk(l.end_date) || s;
      if (s) dateRange(s, e).forEach((d) => evts.push({ id: `lv-${l.id}-${d}`, title: `${l.user?.name || ''} — ${l.type}`, label: l.type, date: d, type: 'leave', status: l.status, color: TYPE_COLORS.leave, icon: TYPE_ICONS.leave, meta: l }));
    });
    (worklogs || []).forEach((w: any) => {
      const d = dk(w.start_date);
      if (d) evts.push({ id: `wl-${w.id}`, title: `${t('calendar.week')} ${w.week_number}`, label: t('calendar.worklog'), date: d, type: 'worklog', status: w.status, color: TYPE_COLORS.worklog, icon: TYPE_ICONS.worklog, meta: w });
    });
    if (dlReport?.deadline) evts.push({ id: 'dl-r', title: t('calendar.reportDeadline'), label: t('calendar.deadline'), date: dk(dlReport.deadline), type: 'deadline', color: TYPE_COLORS.deadline, icon: TYPE_ICONS.deadline, meta: { type: 'final_report' } });
    if (dlSlide?.deadline) evts.push({ id: 'dl-s', title: t('calendar.slideDeadline'), label: t('calendar.deadline'), date: dk(dlSlide.deadline), type: 'deadline', color: TYPE_COLORS.deadline, icon: Presentation, meta: { type: 'final_slide' } });
    return evts;
  }, [interviews, sessions, leaves, worklogs, dlReport, dlSlide, t]);

  const byDate = useMemo(() => {
    const m: Record<string, CalendarEvent[]> = {};
    events.forEach((e) => { if (!m[e.date]) m[e.date] = []; m[e.date].push(e); });
    return m;
  }, [events]);

  // Monday-start grid
  const daysInMonth = new Date(vYear, vMonth + 1, 0).getDate();
  const firstDaySun = new Date(vYear, vMonth, 1).getDay();
  const firstDayMon = firstDaySun === 0 ? 6 : firstDaySun - 1;
  const prevMonthDays = new Date(vYear, vMonth, 0).getDate();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const cells: { day: number; current: boolean; dateStr: string }[] = [];
  // Previous month overflow
  for (let i = firstDayMon - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const pm = vMonth === 0 ? 11 : vMonth - 1;
    const py = vMonth === 0 ? vYear - 1 : vYear;
    cells.push({ day: d, current: false, dateStr: `${py}-${String(pm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, dateStr: `${vYear}-${String(vMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }
  // Next month overflow
  while (cells.length % 7 !== 0) {
    const d = cells.length - firstDayMon - daysInMonth + 1;
    const nm = vMonth === 11 ? 0 : vMonth + 1;
    const ny = vMonth === 11 ? vYear + 1 : vYear;
    cells.push({ day: d, current: false, dateStr: `${ny}-${String(nm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }

  const selEvents = selDate ? (byDate[selDate] || []) : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[1.3rem] font-bold text-[#1a1a2e]">{t('calendar.title')}</h1>
        <p className="text-[0.82rem] text-[#6b7280] mt-0.5">{t('calendar.subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Calendar Card */}
        <div className="flex-1">
          <div className="bg-white rounded-[5px] p-5 sm:p-7" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            {/* Month nav */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button type="button" onClick={prev} className="w-8 h-8 flex items-center justify-center rounded-full text-[#9ca3af] hover:bg-[#f3f4f6] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-[1rem] font-semibold text-[#1e1b4b] min-w-[160px] text-center">{MONTH_NAMES[vMonth]} {vYear}</h2>
              <button type="button" onClick={next} className="w-8 h-8 flex items-center justify-center rounded-full text-[#9ca3af] hover:bg-[#f3f4f6] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAY_HEADERS.map((d, i) => (
                <div key={i} className={`text-center text-[0.78rem] font-semibold py-2 ${i >= 5 ? 'text-[#d1d5db]' : 'text-[#6b7280]'}`}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((cell, i) => {
                const dayEvts = byDate[cell.dateStr] || [];
                const isToday = cell.dateStr === todayStr;
                const isSel = cell.dateStr === selDate;
                const isWeekend = i % 7 >= 5;
                const topEvt = dayEvts[0];

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelDate(cell.dateStr)}
                    className={`flex flex-col items-center py-2 rounded-[5px] border transition-all cursor-pointer group relative ${
                      isSel ? 'border-[#1e1b4b] bg-[#1e1b4b]/5' : 'border-[#f0f0f0] hover:border-[#1e1b4b]/30 hover:bg-[#1e1b4b]/[0.03]'
                    }`}
                    style={{ boxShadow: isSel ? '0 2px 8px rgba(30,27,75,0.15)' : '0 1px 3px rgba(0,0,0,0.04)' }}
                  >
                    <span className={`w-8 h-8 flex items-center justify-center rounded-[5px] text-[0.85rem] font-medium transition-colors ${
                      isToday && !isSel ? 'bg-[#1e1b4b] text-white' :
                      isSel ? 'bg-[#1e1b4b] text-white' :
                      !cell.current ? 'text-[#d1d5db]' :
                      isWeekend ? 'text-[#d1d5db]' :
                      'text-[#374151] group-hover:bg-[#1e1b4b]/10'
                    }`}>
                      {cell.day}
                    </span>
                    {/* Event label */}
                    {topEvt && cell.current && (
                      <span className="mt-1 text-[0.6rem] font-medium truncate max-w-[56px] leading-none" style={{ color: topEvt.color }}>
                        {topEvt.label}
                      </span>
                    )}
                    {!topEvt && cell.current && <span className="mt-1 h-[10px]" />}
                    {/* Dot indicators for multiple events */}
                    {dayEvts.length > 1 && cell.current && (
                      <div className="flex gap-[2px] mt-[1px]">
                        {dayEvts.slice(0, 4).map((e, j) => <div key={j} className="w-[4px] h-[4px] rounded-full" style={{ backgroundColor: e.color }} />)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 px-2">
            {Object.entries(TYPE_COLORS).map(([key, color]) => (
              <div key={key} className="flex items-center gap-1.5 text-[0.75rem] text-[#6b7280]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {t(`calendar.${key}`)}
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:w-[280px] shrink-0 space-y-4">
          {/* Selected day events */}
          <div className="bg-white rounded-[5px] p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h3 className="text-[0.88rem] font-semibold text-[#1e1b4b] mb-3">
              {selDate
                ? new Date(selDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                : t('calendar.selectDate')
              }
            </h3>
            {!selDate ? (
              <p className="text-[0.82rem] text-[#9ca3af] py-6 text-center">{t('calendar.clickDate')}</p>
            ) : selEvents.length === 0 ? (
              <p className="text-[0.82rem] text-[#9ca3af] py-6 text-center">{t('calendar.noEvents')}</p>
            ) : (
              <div className="space-y-2.5">
                {selEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => setSelEvent(evt)}
                    className="w-full text-left flex items-start gap-3 p-3 rounded-[5px] border border-[#f0f0f0] hover:border-[#d1d5db] transition-colors cursor-pointer"
                  >
                    <div className="w-1 h-full min-h-[36px] rounded-full shrink-0" style={{ backgroundColor: evt.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.82rem] font-medium text-[#1a1a2e] truncate">{evt.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {evt.time && <span className="text-[0.72rem] text-[#6b7280]">{fmt12(evt.time)}</span>}
                        <span className="text-[0.68rem] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${evt.color}15`, color: evt.color }}>{evt.label}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div className="bg-white rounded-[5px] p-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h3 className="text-[0.88rem] font-semibold text-[#1e1b4b] mb-3">{t('calendar.upcoming')}</h3>
            {(() => {
              const upcoming = events
                .filter((e) => e.date >= todayStr)
                .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
                .slice(0, 5);
              if (upcoming.length === 0) return <p className="text-[0.82rem] text-[#9ca3af] py-4 text-center">{t('calendar.noUpcoming')}</p>;
              return (
                <div className="space-y-2">
                  {upcoming.map((evt) => (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => setSelEvent(evt)}
                      className="w-full text-left flex items-center gap-2.5 py-2 border-b border-[#f5f5f5] last:border-0 hover:bg-[#f8fafc] rounded-[6px] px-1 transition-colors cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${evt.color}15` }}>
                        <evt.icon className="w-3.5 h-3.5" style={{ color: evt.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.78rem] font-medium text-[#374151] truncate">{evt.title}</p>
                        <p className="text-[0.68rem] text-[#9ca3af]">
                          {new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {evt.time ? ` · ${fmt12(evt.time)}` : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Event detail modal */}
      <Modal open={!!selEvent} onClose={() => setSelEvent(null)} title={selEvent?.title}>
        {selEvent && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: `${selEvent.color}15` }}>
                <selEvent.icon className="w-4 h-4" style={{ color: selEvent.color }} />
              </div>
              <div>
                <p className="text-[0.82rem] font-semibold text-[#1e1b4b] capitalize">{selEvent.label}</p>
                {selEvent.status && <Badge color={selEvent.status === 'approved' || selEvent.status === 'passed' || selEvent.status === 'completed' ? 'green' : selEvent.status === 'rejected' || selEvent.status === 'failed' || selEvent.status === 'cancelled' ? 'red' : 'blue'}>{selEvent.status}</Badge>}
              </div>
            </div>
            <div className="rounded-[5px] border border-[#e2e8f0] divide-y divide-[#e2e8f0] overflow-hidden">
              <div className="px-4 py-2.5 flex items-center justify-between">
                <span className="text-[0.75rem] text-[#9ca3af]">{t('calendar.date')}</span>
                <span className="text-[0.82rem] text-[#374151] font-medium">{new Date(selEvent.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              {selEvent.time && (
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[0.75rem] text-[#9ca3af]">{t('calendar.time')}</span>
                  <span className="text-[0.82rem] text-[#374151] font-medium">{fmt12(selEvent.time)}</span>
                </div>
              )}
              {selEvent.meta?.user?.name && (
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[0.75rem] text-[#9ca3af]">{t('calendar.person')}</span>
                  <div className="flex items-center gap-1.5">
                    <UserAvatar name={selEvent.meta.user.name} avatar={selEvent.meta.user.avatar} size="xs" />
                    <span className="text-[0.82rem] text-[#374151] font-medium">{selEvent.meta.user.name}</span>
                  </div>
                </div>
              )}
              {selEvent.meta?.intern?.name && (
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[0.75rem] text-[#9ca3af]">{t('mentoring.intern')}</span>
                  <div className="flex items-center gap-1.5">
                    <UserAvatar name={selEvent.meta.intern.name} avatar={selEvent.meta.intern.avatar} size="xs" />
                    <span className="text-[0.82rem] text-[#374151] font-medium">{selEvent.meta.intern.name}</span>
                  </div>
                </div>
              )}
              {selEvent.meta?.tutor?.name && (
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[0.75rem] text-[#9ca3af]">{t('mentoring.tutor')}</span>
                  <div className="flex items-center gap-1.5">
                    <UserAvatar name={selEvent.meta.tutor.name} avatar={selEvent.meta.tutor.avatar} size="xs" />
                    <span className="text-[0.82rem] text-[#374151] font-medium">{selEvent.meta.tutor.name}</span>
                  </div>
                </div>
              )}
              {selEvent.meta?.company_name && (
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[0.75rem] text-[#9ca3af]">{t('users.company')}</span>
                  <span className="text-[0.82rem] text-[#374151] font-medium">{selEvent.meta.company_name}</span>
                </div>
              )}
              {selEvent.meta?.location && (
                <div className="px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[0.75rem] text-[#9ca3af]">{t('mentoring.location')}</span>
                  <span className="text-[0.82rem] text-[#374151] font-medium">{selEvent.meta.location}</span>
                </div>
              )}
              {selEvent.meta?.reason && (
                <div className="px-4 py-2.5">
                  <span className="text-[0.75rem] text-[#9ca3af] block mb-1">{t('leaves.reason')}</span>
                  <p className="text-[0.82rem] text-[#374151]">{selEvent.meta.reason}</p>
                </div>
              )}
              {selEvent.meta?.agenda && (
                <div className="px-4 py-2.5">
                  <span className="text-[0.75rem] text-[#9ca3af] block mb-1">{t('mentoring.agenda')}</span>
                  <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{selEvent.meta.agenda}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
