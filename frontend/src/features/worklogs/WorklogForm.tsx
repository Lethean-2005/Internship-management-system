import { useState, useEffect } from 'react';
import {} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/authStore';
import { STATUS_COLORS } from '../../lib/constants';
import type { Internship, WeeklyWorklog } from '../../types/ims';

interface Row {
  date: string;
  time: string;
  slot: 'morning' | 'afternoon';
  activities: string;
  difficulties: string;
  solutions: string;
  comment: string;
}

function fmtDay(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function dateRange(start: string, end?: string): string[] {
  if (!start) return [];
  const out: string[] = [];
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(s.getTime() + 4 * 86400000);
  const cur = new Date(s);
  while (cur <= e) { out.push(cur.toISOString().split('T')[0]); cur.setDate(cur.getDate() + 1); }
  return out;
}

function buildRows(start: string, end?: string): Row[] {
  return dateRange(start, end).flatMap(d => [
    { date: d, time: '7:30 AM - 12:00 PM', slot: 'morning' as const, activities: '', difficulties: '', solutions: '', comment: '' },
    { date: d, time: '1:00 PM - 5:30 PM', slot: 'afternoon' as const, activities: '', difficulties: '', solutions: '', comment: '' },
  ]);
}

// Group rows by date for rendering
function groupByDate(rows: Row[]): { date: string; rows: { idx: number; row: Row }[] }[] {
  const map = new Map<string, { idx: number; row: Row }[]>();
  rows.forEach((row, idx) => {
    if (!map.has(row.date)) map.set(row.date, []);
    map.get(row.date)!.push({ idx, row });
  });
  return [...map.entries()].map(([date, rows]) => ({ date, rows }));
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  internships: Internship[];
  loading?: boolean;
  mode?: 'create' | 'edit' | 'view' | 'review';
  worklog?: WeeklyWorklog | null;
  onReview?: (status: string, feedback: string | null) => void;
  reviewLoading?: boolean;
  nextWeekNumber?: number;
}

export function WorklogForm({ open, onClose, onSubmit, internships, loading, mode = 'create', worklog, onReview, reviewLoading, nextWeekNumber }: Props) {
  const user = useAuthStore((s) => s.user);
  const isIntern = user?.role?.slug === 'intern';
  const ro = mode === 'view' || mode === 'review';
  const ed = !ro;
  const isRejectedEdit = mode === 'edit' && worklog?.status === 'rejected';
  const weekLocked = ro || isRejectedEdit || (mode === 'create' && isIntern && !!nextWeekNumber) || (mode === 'edit' && isIntern);
  const headerLocked = ro || isRejectedEdit;

  const [internshipId, setInternshipId] = useState('');
  const [weekNum, setWeekNum] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hours, setHours] = useState('40');
  const [topics, setTopics] = useState('');
  const [reflections, setReflections] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!open) return;
    if ((mode === 'edit' || mode === 'view' || mode === 'review') && worklog) {
      setInternshipId(worklog.internship_id?.toString() || '');
      setWeekNum(worklog.week_number?.toString() || '');
      setStartDate(worklog.start_date || '');
      setEndDate(worklog.end_date || '');
      setHours(worklog.hours_worked?.toString() || '40');
      setTopics(worklog.tutor_topics || '');
      setReflections(worklog.reflections || '');
      // Build rows from start to end date
      const r = buildRows(worklog.start_date, worklog.end_date);
      if (worklog.entries) {
        for (const e of worklog.entries) {
          const i = r.findIndex(x => x.date === e.entry_date && x.slot === e.time_slot);
          if (i >= 0) {
            r[i].activities = e.activities || '';
            r[i].difficulties = e.difficulties || '';
            r[i].solutions = e.solutions || '';
            r[i].comment = e.comment || '';
          }
        }
      }
      setRows(r);
    } else {
      setInternshipId(''); setWeekNum(nextWeekNumber ? nextWeekNumber.toString() : ''); setStartDate(''); setEndDate(''); setHours('40');
      setTopics(''); setReflections(''); setRows([]); setFeedback('');
    }
  }, [mode, worklog, open]);

  useEffect(() => {
    if (mode === 'create' && isIntern && internships.length > 0 && !internshipId) setInternshipId(internships[0].id.toString());
  }, [mode, isIntern, internships, internshipId]);

  useEffect(() => {
    if ((mode === 'create' || mode === 'edit') && startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (e >= s) {
        const dates: string[] = [];
        const cur = new Date(s);
        while (cur <= e) { dates.push(cur.toISOString().split('T')[0]); cur.setDate(cur.getDate() + 1); }
        // Keep existing data for dates that already have entries
        setRows(prev => {
          const existing = new Map(prev.map(r => [`${r.date}_${r.slot}`, r]));
          return dates.flatMap(d => [
            existing.get(`${d}_morning`) || { date: d, time: '7:30 AM - 12:00 PM', slot: 'morning' as const, activities: '', difficulties: '', solutions: '', comment: '' },
            existing.get(`${d}_afternoon`) || { date: d, time: '1:00 PM - 5:30 PM', slot: 'afternoon' as const, activities: '', difficulties: '', solutions: '', comment: '' },
          ]);
        });
      }
    }
  }, [startDate, endDate]);

  const updateRow = (idx: number, field: keyof Row, value: string) => {
    if (ro) return;
    setRows(p => p.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };


  const save = () => {
    const acts = rows.map(r => r.activities).filter(Boolean);
    const lastDate = endDate || (rows.length > 0 ? rows[rows.length - 1].date : startDate);
    const entries = rows.map(r => ({
      entry_date: r.date, time_slot: r.slot,
      activities: r.activities || null, difficulties: r.difficulties || null,
      solutions: r.solutions || null, comment: r.comment || null,
    }));
    onSubmit({
      internship_id: Number(internshipId), week_number: Number(weekNum),
      start_date: startDate, end_date: lastDate,
      tasks_completed: acts.join('\n') || '-', hours_worked: Number(hours) || 0,
      tutor_topics: topics || null, reflections: reflections || null, entries,
    });
  };

  const prevent = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && e.target instanceof HTMLInputElement) e.preventDefault(); };
  const internUser: any = isIntern ? user : worklog?.user;
  const intTitle = internUser?.position || internships.find(i => i.id.toString() === internshipId)?.title || worklog?.internship?.title || '';
  const intOpts = [{ value: '', label: 'Select Internship' }, ...internships.map(i => ({ value: i.id.toString(), label: i.title }))];
  const grow = (el: HTMLTextAreaElement) => { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; };
  const taCls = `w-full px-2 py-[6px] text-[0.78rem] text-[#374151] bg-transparent border-0 focus:outline-none focus:bg-[#f0f9ff] transition-colors resize-none overflow-hidden leading-[1.4] ${ro ? 'cursor-default' : ''}`;
  const roBox = "rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] text-[#374151] bg-[#f9fafb]";
  const title = mode === 'review' ? `Review Week ${worklog?.week_number || ''} Worklog` : mode === 'view' ? `Week ${worklog?.week_number || ''} Worklog` : mode === 'edit' ? `Edit Week ${worklog?.week_number || ''} Worklog` : 'Weekly Work Log';
  const grouped = groupByDate(rows);

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-5" onKeyDown={ro ? undefined : prevent}>

        {worklog && mode !== 'create' && (
          <div className="flex items-center gap-3">
            <Badge color={STATUS_COLORS[worklog.status] || 'gray'}>{worklog.status.charAt(0).toUpperCase() + worklog.status.slice(1)}</Badge>
            {worklog.user && <span className="text-[0.82rem] text-[#6b7280]">{worklog.user.name}</span>}
          </div>
        )}

        {(() => {
          const info = isIntern ? user : worklog?.user;
          return info && (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 bg-[#f8f9fb] rounded-[5px] px-4 py-3 text-[0.8rem] text-[#6b7280]">
              <span><strong className="text-[#374151]">Intern:</strong> {info.name}</span>
              {(info as any).company_name && <span><strong className="text-[#374151]">Company:</strong> {(info as any).company_name}</span>}
              {(info as any).position && <span><strong className="text-[#374151]">Position:</strong> {(info as any).position}</span>}
              {(info as any).generation && <span><strong className="text-[#374151]">Generation:</strong> Gen {(info as any).generation}</span>}
            </div>
          );
        })()}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ro || isIntern ? (
            <div><label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Position</label><div className={`${roBox} truncate`} title={intTitle}>{intTitle || '-'}</div></div>
          ) : (
            <Select label="Internship" options={intOpts} value={internshipId} onChange={e => setInternshipId(e.target.value)} required />
          )}
          {weekLocked ? <div><label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Week #</label><div className={roBox}>{weekNum}</div></div> : <Input label="Week #" type="number" value={weekNum} onChange={e => setWeekNum(e.target.value)} required placeholder="1" />}
          {headerLocked ? <div><label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Start Date</label><div className={roBox}>{startDate ? fmtDay(startDate) : '-'}</div></div> : <DatePicker label="Start Date" value={startDate} onChange={setStartDate} required />}
          {headerLocked ? <div><label className="block text-[0.85rem] font-medium text-[#374151] mb-1">End Date</label><div className={roBox}>{endDate ? fmtDay(endDate) : '-'}</div></div> : <DatePicker label="End Date" value={endDate} onChange={setEndDate} required />}
          {headerLocked ? <div><label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Hours</label><div className={roBox}>{hours}h</div></div> : <Input label="Hours" type="number" value={hours} onChange={e => setHours(e.target.value)} placeholder="40" />}
        </div>

        {rows.length > 0 && (
          <div className="border border-[#e5e7eb] rounded-[5px] overflow-hidden">
            <div className="bg-[#1e1b4b] text-white text-[0.78rem] font-semibold text-center py-2">INTERNSHIP WEEKLY WORK LOG</div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: '700px' }}>
                <colgroup>
                  <col style={{ width: '90px' }} />
                  <col style={{ width: '120px' }} />
                  <col /><col /><col /><col />
                </colgroup>
                <thead>
                  <tr className="bg-[#fdf6ec]">
                    {['Date', 'Time', 'Work Activities', 'Difficulties/Issues', 'Solutions', 'Comment'].map((h, i) => (
                      <th key={h} className={`text-left px-2 py-2.5 text-[0.72rem] font-bold text-[#374151] border-b border-[#e5e7eb] ${i < 5 ? 'border-r' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grouped.map((group, gi) => (
                    group.rows.map(({ idx, row }, si) => (
                      <tr key={idx} className={si === group.rows.length - 1 && gi < grouped.length - 1 ? 'border-b-2 border-[#e5e7eb]' : si < group.rows.length - 1 ? 'border-b border-[#f0f0f0]' : ''}>
                        {si === 0 && (
                          <td rowSpan={group.rows.length} className="px-2 py-2 text-[0.75rem] font-medium text-[#374151] border-r border-[#e5e7eb] bg-[#fafafa] align-middle text-center">
                            {fmtDay(group.date)}
                          </td>
                        )}
                        <td className="px-2 py-1.5 border-r border-[#e5e7eb] bg-[#fafafa] align-middle">
                          {ed ? (
                            <input value={row.time} onChange={e => updateRow(idx, 'time', e.target.value)} className="w-full text-[0.72rem] text-[#6b7280] bg-transparent border-0 focus:outline-none focus:bg-[#f0f9ff] py-0.5" />
                          ) : (
                            <span className="text-[0.72rem] text-[#6b7280]">{row.time}</span>
                          )}
                        </td>
                        {(['activities', 'difficulties', 'solutions', 'comment'] as const).map((f, fi) => (
                          <td key={f} className={`p-0 align-top ${fi < 3 ? 'border-r border-[#e5e7eb]' : ''}`}>
                            <textarea value={row[f]} onChange={e => { updateRow(idx, f, e.target.value); grow(e.target); }} onFocus={e => grow(e.target)} rows={2} readOnly={ro} className={taCls} />
                          </td>
                        ))}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-[#e5e7eb]">
              {grouped.map((group) => (
                <div key={group.date} className="p-4 space-y-3">
                  <p className="text-[0.82rem] font-semibold text-[#374151] bg-[#fafafa] rounded-[5px] px-3 py-2">{fmtDay(group.date)}</p>
                  {group.rows.map(({ idx, row }) => (
                    <div key={idx} className="space-y-2 border border-[#f0f0f0] rounded-[5px] p-3">
                      <div className="flex items-center justify-between">
                        {ed ? (
                          <input value={row.time} onChange={e => updateRow(idx, 'time', e.target.value)} className="text-[0.75rem] font-semibold text-[#6b7280] bg-transparent border-0 focus:outline-none uppercase" placeholder="Time slot..." />
                        ) : (
                          <p className="text-[0.75rem] font-semibold text-[#6b7280] uppercase">{row.time}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Work Activities</label>
                        <textarea value={row.activities} onChange={e => updateRow(idx, 'activities', e.target.value)} readOnly={ro} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-3 py-2 text-[0.82rem] focus:outline-none focus:border-[#48B6E8] resize-none" />
                      </div>
                      <div>
                        <label className="block text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Difficulties/Issues</label>
                        <textarea value={row.difficulties} onChange={e => updateRow(idx, 'difficulties', e.target.value)} readOnly={ro} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-3 py-2 text-[0.82rem] focus:outline-none focus:border-[#48B6E8] resize-none" />
                      </div>
                      <div>
                        <label className="block text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Solutions</label>
                        <textarea value={row.solutions} onChange={e => updateRow(idx, 'solutions', e.target.value)} readOnly={ro} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-3 py-2 text-[0.82rem] focus:outline-none focus:border-[#48B6E8] resize-none" />
                      </div>
                      <div>
                        <label className="block text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Comment</label>
                        <textarea value={row.comment} onChange={e => updateRow(idx, 'comment', e.target.value)} readOnly={ro} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-3 py-2 text-[0.82rem] focus:outline-none focus:border-[#48B6E8] resize-none" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-[0.85rem] font-medium text-[#48B6E8] mb-1">Topic to be discussed with Tutor:</label>
          {ro ? <div className={`${roBox} min-h-[60px] whitespace-pre-wrap`}>{topics || '\u00A0'}</div> : (
            <textarea value={topics} onChange={e => setTopics(e.target.value)} rows={3} className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.85rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder={"1. Topic one\n2. Topic two"} />
          )}
        </div>

        <div>
          <label className="block text-[0.85rem] font-medium text-[#dc2626] mb-1">Reflections for this week:</label>
          {ro ? <div className={`${roBox} min-h-[60px] whitespace-pre-wrap`}>{reflections || '\u00A0'}</div> : (
            <textarea value={reflections} onChange={e => setReflections(e.target.value)} rows={3} className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.85rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder="Your reflections and plans for next week..." />
          )}
        </div>

        {worklog?.feedback && mode !== 'review' && (
          <div className={worklog.status === 'rejected' ? 'bg-[#fef2f2] border border-[#fecaca] rounded-[5px] p-4' : ''}>
            <label className={`block text-[0.85rem] font-medium mb-1 ${worklog.status === 'rejected' ? 'text-[#dc2626]' : 'text-[#374151]'}`}>
              {worklog.status === 'rejected' ? 'Rejection Reason:' : 'Reviewer Feedback:'}
            </label>
            <p className="text-[0.85rem] text-[#374151] whitespace-pre-wrap">{worklog.feedback}</p>
          </div>
        )}

        {mode === 'review' && (
          <div className="bg-[#f8f9fb] rounded-[5px] p-5 space-y-3 border border-[#e5e7eb]">
            <label className="block text-[0.85rem] font-semibold text-[#1e1b4b]">Tutor Review</label>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              rows={3}
              className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.85rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)] bg-white"
              placeholder="Write your feedback or comment here (optional)..."
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="button" variant="danger" loading={reviewLoading} disabled={!feedback.trim()} onClick={() => onReview?.('rejected', feedback)}>Reject</Button>
              <Button type="button" loading={reviewLoading} onClick={() => onReview?.('reviewed', feedback || null)}>Reviewed</Button>
            </div>
            {!feedback.trim() && <p className="text-[0.75rem] text-[#dc2626] text-right">* Reason is required to reject</p>}
          </div>
        )}

        {mode !== 'review' && (
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>{ro ? 'Close' : 'Cancel'}</Button>
            {mode === 'create' && <>
              <Button type="button" variant="secondary" disabled={!internshipId || !weekNum || !startDate || !endDate} loading={loading} onClick={save}>Save as Draft</Button>
              <Button type="button" disabled={!internshipId || !weekNum || !startDate || !endDate} loading={loading} onClick={save}>Create Worklog</Button>
            </>}
            {mode === 'edit' && (
              <Button type="button" loading={loading} onClick={save}>Save Changes</Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
