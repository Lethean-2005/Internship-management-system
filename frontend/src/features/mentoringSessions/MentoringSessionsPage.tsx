import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Eye, CheckCircle, XCircle, MessageSquare, Video, Clock, MapPin, Link as LinkIcon, List } from 'lucide-react';
import { useSessions, useCreateSession, useUpdateSession, useDeleteSession, useCancelSession, useCompleteSession, useAddFeedback } from '../../hooks/useMentoringSessions';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { getDefaultPerPage } from '../../lib/perPage';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { SessionForm } from './SessionForm';
import { formatDate } from '../../lib/formatDate';
import client from '../../api/client';
import type { MentoringSession } from '../../types/ims';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'blue',
  completed: 'green',
  cancelled: 'red',
  rescheduled: 'yellow',
};

export function MentoringSessionsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const isTutor = roleSlug === 'tutor';
  const isIntern = roleSlug === 'intern';

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(getDefaultPerPage());
  const [formOpen, setFormOpen] = useState(false);
  const [editSession, setEditSession] = useState<MentoringSession | null>(null);
  const [viewSession, setViewSession] = useState<MentoringSession | null>(null);
  const [viewGroupSessions, setViewGroupSessions] = useState<MentoringSession[]>([]);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeIds, setCompleteIds] = useState<number[]>([]);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completeActions, setCompleteActions] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelIds, setCancelIds] = useState<number[]>([]);
  const [cancelReason, setCancelReason] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackSession, setFeedbackSession] = useState<MentoringSession | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [interns, setInterns] = useState<{ id: number; name: string; email: string; avatar?: string | null; company_name?: string | null; position?: string | null; generation?: string | null; department?: string | null; phone?: string | null }[]>([]);

  const filters = { status: status || undefined, page, per_page: perPage };
  const { data, isLoading } = useSessions(filters);
  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession();
  const deleteMutation = useDeleteSession();
  const cancelMutation = useCancelSession();
  const completeMutation = useCompleteSession();
  const feedbackMutation = useAddFeedback();

  useEffect(() => {
    if (isTutor) {
      client.get('/my-interns').then((r: any) => setInterns(r.data.data || [])).catch(() => {});
    }
  }, [isTutor]);

  const statusOptions = [
    { value: '', label: t('common.allStatuses'), icon: List },
    { value: 'scheduled', label: t('status.scheduled'), icon: Clock },
    { value: 'completed', label: t('status.completed'), icon: CheckCircle },
    { value: 'cancelled', label: t('status.cancelled'), icon: XCircle },
  ];

  const handleCreate = () => { setEditSession(null); setFormOpen(true); };

  const handleEdit = (session: MentoringSession) => { setEditSession(session); setFormOpen(true); };

  const handleFormSubmit = async (formData: any) => {
    if (editSession) {
      const { intern_ids, ...rest } = formData;
      await updateMutation.mutateAsync({ id: editSession.id, payload: { ...rest, intern_id: intern_ids[0] } });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setFormOpen(false);
    setEditSession(null);
  };

  const handleDelete = async () => {
    if (deleteIds.length) {
      await Promise.all(deleteIds.map((id) => deleteMutation.mutateAsync(id)));
      setDeleteIds([]);
    }
  };

  const handleCancel = async () => {
    if (cancelIds.length) {
      await Promise.all(cancelIds.map((id) => cancelMutation.mutateAsync({ id, payload: { cancel_reason: cancelReason } })));
      setCancelOpen(false);
      setCancelIds([]);
      setCancelReason('');
    }
  };

  const handleComplete = async () => {
    if (completeIds.length) {
      await Promise.all(completeIds.map((id) => completeMutation.mutateAsync({ id, payload: { notes: completeNotes, action_items: completeActions || null } })));
      setCompleteOpen(false);
      setCompleteIds([]);
      setCompleteNotes('');
      setCompleteActions('');
    }
  };

  const handleFeedback = async () => {
    if (feedbackSession) {
      await feedbackMutation.mutateAsync({ id: feedbackSession.id, payload: { intern_feedback: feedbackText } });
      setFeedbackOpen(false);
      setFeedbackSession(null);
      setFeedbackText('');
    }
  };

  const formatTime12 = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const p = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h12}:${String(m).padStart(2, '0')} ${p}`;
  };

  const typeBadge = (type: string) => {
    const colors: Record<string, string> = { in_person: 'blue', online: 'green', hybrid: 'yellow' };
    const labels: Record<string, string> = { in_person: t('mentoring.inPerson'), online: t('mentoring.online'), hybrid: t('mentoring.hybrid') };
    return <Badge color={colors[type] || 'gray'}>{labels[type] || type}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-bold text-[#1a1a2e]">{t('mentoring.title')}</h1>
          <p className="text-[0.88rem] text-[#6b7280] mt-1">{isTutor ? t('mentoring.subtitleTutor') : t('mentoring.subtitleIntern')}</p>
        </div>
        <div className="flex items-center gap-3">
          <FilterDropdown options={statusOptions} value={status} onChange={setStatus} />
          {isTutor && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t('mentoring.scheduleSession')}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data?.length ? (
        <div className="text-center py-12 text-[0.88rem] text-[#9ca3af]">{t('mentoring.noSessionsFound')}</div>
      ) : (
        <>
          <div className="bg-white rounded-[8px] border border-[#f0f0f0] overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    <th className="text-left px-5 py-3.5 text-[0.78rem] font-semibold text-[#6b7280] uppercase tracking-wider">{t('mentoring.sessionTitle')}</th>
                    <th className="text-left px-5 py-3.5 text-[0.78rem] font-semibold text-[#6b7280] uppercase tracking-wider">{isTutor ? t('mentoring.intern') : t('mentoring.tutor')}</th>
                    <th className="text-left px-5 py-3.5 text-[0.78rem] font-semibold text-[#6b7280] uppercase tracking-wider">{t('mentoring.dateTime')}</th>
                    <th className="text-left px-5 py-3.5 text-[0.78rem] font-semibold text-[#6b7280] uppercase tracking-wider">{t('mentoring.type')}</th>
                    <th className="text-left px-5 py-3.5 text-[0.78rem] font-semibold text-[#6b7280] uppercase tracking-wider">{t('common.status')}</th>
                    <th className="text-right px-5 py-3.5 text-[0.78rem] font-semibold text-[#6b7280] uppercase tracking-wider">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Group sessions by title + date + time (batch-created sessions)
                    const groups: { key: string; sessions: MentoringSession[] }[] = [];
                    const keyMap = new Map<string, number>();
                    (data.data as MentoringSession[]).forEach((session) => {
                      const key = isTutor
                        ? `${session.title}|${session.scheduled_date?.slice(0,10)}|${session.scheduled_time}|${session.type}`
                        : session.id.toString(); // interns see their own sessions individually
                      const idx = keyMap.get(key);
                      if (idx !== undefined) {
                        groups[idx].sessions.push(session);
                      } else {
                        keyMap.set(key, groups.length);
                        groups.push({ key, sessions: [session] });
                      }
                    });
                    return groups.map((group) => {
                      const first = group.sessions[0];
                      const allScheduled = group.sessions.every((s) => s.status === 'scheduled');
                      return (
                        <tr key={group.key} className="border-b border-[#f8f8f8] hover:bg-[#fafbfc] transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="text-[0.88rem] font-medium text-[#1a1a2e]">{first.title}</div>
                            {first.agenda && <div className="text-[0.75rem] text-[#9ca3af] mt-0.5 truncate max-w-[200px]">{first.agenda}</div>}
                          </td>
                          <td className="px-5 py-3.5">
                            {isTutor && group.sessions.length > 1 ? (
                              <div className="flex items-center">
                                <div className="flex -space-x-2.5">
                                  {group.sessions.slice(0, 5).map((s) => (
                                    <div key={s.id} className="relative" title={s.intern?.name}>
                                      <UserAvatar name={s.intern?.name || ''} avatar={(s.intern as any)?.avatar} size="sm" className="ring-2 ring-white" />
                                    </div>
                                  ))}
                                </div>
                                {group.sessions.length > 5 && (
                                  <span className="ml-1 text-[0.75rem] text-[#6b7280] font-medium">+{group.sessions.length - 5}</span>
                                )}
                                <span className="ml-2 text-[0.78rem] text-[#6b7280]">{group.sessions.length} {t('mentoring.interns')}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <UserAvatar name={(isTutor ? first.intern?.name : first.tutor?.name) || ''} avatar={isTutor ? (first.intern as any)?.avatar : (first.tutor as any)?.avatar} size="sm" />
                                <span className="text-[0.85rem] text-[#374151]">{isTutor ? first.intern?.name : first.tutor?.name}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-[0.85rem] text-[#374151]">{formatDate(first.scheduled_date)}</div>
                            <div className="text-[0.75rem] text-[#9ca3af]">{formatTime12(first.scheduled_time)} ({first.duration_minutes} min)</div>
                          </td>
                          <td className="px-5 py-3.5">{typeBadge(first.type)}</td>
                          <td className="px-5 py-3.5">
                            <Badge color={STATUS_COLORS[first.status] || 'gray'}>{t(`status.${first.status}`)}</Badge>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setViewSession(first); setViewGroupSessions(group.sessions); }} className="p-1.5 rounded-[5px] text-[#6b7280] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title={t('common.view')}>
                                <Eye className="h-4 w-4" />
                              </button>
                              {isTutor && allScheduled && (
                                <>
                                  <button onClick={() => handleEdit(first)} className="p-1.5 rounded-[5px] text-[#6b7280] hover:text-[#f59e0b] hover:bg-[#fffbeb] transition-colors" title={t('common.edit')}>
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => { setCompleteIds(group.sessions.map((s) => s.id)); setCompleteOpen(true); }} className="p-1.5 rounded-[5px] text-[#6b7280] hover:text-[#22c55e] hover:bg-[#f0fdf4] transition-colors" title={t('mentoring.markComplete')}>
                                    <CheckCircle className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => { setCancelIds(group.sessions.map((s) => s.id)); setCancelReason(''); setCancelOpen(true); }} className="p-1.5 rounded-[5px] text-[#6b7280] hover:text-[#f59e0b] hover:bg-[#fffbeb] transition-colors" title={t('mentoring.cancel')}>
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => setDeleteIds(group.sessions.map((s) => s.id))} className="p-1.5 rounded-[5px] text-[#6b7280] hover:text-[#ef4444] hover:bg-[#fef2f2] transition-colors" title={t('common.delete')}>
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                              {isIntern && first.status === 'completed' && !first.intern_feedback && (
                                <button onClick={() => { setFeedbackSession(first); setFeedbackText(''); setFeedbackOpen(true); }} className="p-1.5 rounded-[5px] text-[#6b7280] hover:text-[#8b5cf6] hover:bg-[#f5f3ff] transition-colors" title={t('mentoring.addFeedback')}>
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {data?.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} total={data.meta.total} perPage={perPage} onPerPageChange={(v: number) => { setPerPage(v); setPage(1); }} />}

      {/* Create/Edit Form */}
      <SessionForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditSession(null); }}
        onSubmit={handleFormSubmit}
        session={editSession}
        interns={interns}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* View Modal */}
      <Modal open={!!viewSession} onClose={() => { setViewSession(null); setViewGroupSessions([]); }} title={t('mentoring.sessionDetails')}>
        {viewSession && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[0.75rem] text-[#9ca3af] font-medium uppercase">{t('mentoring.sessionTitle')}</p>
                <p className="text-[0.88rem] text-[#1a1a2e] font-medium mt-0.5">{viewSession.title}</p>
              </div>
              <div>
                <p className="text-[0.75rem] text-[#9ca3af] font-medium uppercase">{t('common.status')}</p>
                <div className="mt-1"><Badge color={STATUS_COLORS[viewSession.status] || 'gray'}>{t(`status.${viewSession.status}`)}</Badge></div>
              </div>
            </div>
            <div>
              <p className="text-[0.75rem] text-[#9ca3af] font-medium uppercase">{t('mentoring.tutor')}</p>
              <div className="flex items-center gap-2 mt-1">
                <UserAvatar name={viewSession.tutor?.name || ''} avatar={(viewSession.tutor as any)?.avatar} size="sm" />
                <span className="text-[0.85rem]">{viewSession.tutor?.name}</span>
              </div>
            </div>

            {/* Intern(s) section */}
            <div>
              <p className="text-[0.75rem] text-[#9ca3af] font-medium uppercase mb-2">{viewGroupSessions.length > 1 ? `${t('mentoring.interns')} (${viewGroupSessions.length})` : t('mentoring.intern')}</p>
              {viewGroupSessions.length > 1 ? (
                <div className="rounded-[8px] border border-[#e2e8f0] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-[#e2e8f0]">
                        <th className="text-left px-3 py-2 text-[0.72rem] font-semibold text-[#6b7280] uppercase">{t('mentoring.intern')}</th>
                        <th className="text-left px-3 py-2 text-[0.72rem] font-semibold text-[#6b7280] uppercase">{t('interviews.generation')}</th>
                        <th className="text-left px-3 py-2 text-[0.72rem] font-semibold text-[#6b7280] uppercase">{t('users.company')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewGroupSessions.map((s) => (
                        <tr key={s.id} className="border-b border-[#f0f0f0] last:border-b-0">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <UserAvatar name={s.intern?.name || ''} avatar={(s.intern as any)?.avatar} size="sm" />
                              <div className="min-w-0">
                                <p className="text-[0.82rem] font-medium text-[#1a1a2e] truncate">{s.intern?.name}</p>
                                <p className="text-[0.72rem] text-[#9ca3af] truncate">{s.intern?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-[0.82rem] text-[#374151]">{(s.intern as any)?.generation || '-'}</td>
                          <td className="px-3 py-2 text-[0.82rem] text-[#374151]">{(s.intern as any)?.company_name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-[8px] border border-[#e2e8f0] overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b border-[#f0f0f0]">
                        <td className="px-4 py-3" colSpan={2}>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={viewSession.intern?.name || ''} avatar={(viewSession.intern as any)?.avatar} size="md" />
                            <div>
                              <p className="text-[0.9rem] font-semibold text-[#1a1a2e]">{viewSession.intern?.name}</p>
                              {(viewSession.intern as any)?.generation && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#48B6E8]/10 text-[#48B6E8] text-[0.7rem] font-medium">{(viewSession.intern as any)?.generation}</span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                      {viewSession.intern?.email && (
                        <tr className="border-b border-[#f0f0f0]">
                          <td className="px-4 py-2 text-[0.78rem] text-[#9ca3af] font-medium w-[120px]">{t('auth.email')}</td>
                          <td className="px-4 py-2 text-[0.82rem] text-[#374151]">{viewSession.intern.email}</td>
                        </tr>
                      )}
                      {(viewSession.intern as any)?.phone && (
                        <tr className="border-b border-[#f0f0f0]">
                          <td className="px-4 py-2 text-[0.78rem] text-[#9ca3af] font-medium">{t('auth.phone')}</td>
                          <td className="px-4 py-2 text-[0.82rem] text-[#374151]">{(viewSession.intern as any).phone}</td>
                        </tr>
                      )}
                      {(viewSession.intern as any)?.company_name && (
                        <tr className="border-b border-[#f0f0f0]">
                          <td className="px-4 py-2 text-[0.78rem] text-[#9ca3af] font-medium">{t('users.company')}</td>
                          <td className="px-4 py-2 text-[0.82rem] text-[#374151]">{(viewSession.intern as any).company_name}</td>
                        </tr>
                      )}
                      {(viewSession.intern as any)?.position && (
                        <tr className="border-b border-[#f0f0f0]">
                          <td className="px-4 py-2 text-[0.78rem] text-[#9ca3af] font-medium">{t('users.position')}</td>
                          <td className="px-4 py-2 text-[0.82rem] text-[#374151]">{(viewSession.intern as any).position}</td>
                        </tr>
                      )}
                      {(viewSession.intern as any)?.department && (
                        <tr>
                          <td className="px-4 py-2 text-[0.78rem] text-[#9ca3af] font-medium">{t('auth.department')}</td>
                          <td className="px-4 py-2 text-[0.82rem] text-[#374151]">{(viewSession.intern as any).department}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#9ca3af]" />
                <div>
                  <p className="text-[0.75rem] text-[#9ca3af]">{t('mentoring.dateTime')}</p>
                  <p className="text-[0.85rem]">{formatDate(viewSession.scheduled_date)} {formatTime12(viewSession.scheduled_time)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-[#9ca3af]" />
                <div>
                  <p className="text-[0.75rem] text-[#9ca3af]">{t('mentoring.type')}</p>
                  <p className="text-[0.85rem]">{typeBadge(viewSession.type)}</p>
                </div>
              </div>
              <div>
                <p className="text-[0.75rem] text-[#9ca3af]">{t('mentoring.duration')}</p>
                <p className="text-[0.85rem]">{viewSession.duration_minutes} min</p>
              </div>
            </div>
            {viewSession.location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-[#9ca3af] mt-0.5" />
                <div>
                  <p className="text-[0.75rem] text-[#9ca3af]">{t('mentoring.location')}</p>
                  <p className="text-[0.85rem]">{viewSession.location}</p>
                </div>
              </div>
            )}
            {viewSession.meeting_link && (
              <div className="flex items-start gap-2">
                <LinkIcon className="h-4 w-4 text-[#9ca3af] mt-0.5" />
                <div>
                  <p className="text-[0.75rem] text-[#9ca3af]">{t('mentoring.meetingLink')}</p>
                  <a href={viewSession.meeting_link} target="_blank" rel="noreferrer" className="text-[0.85rem] text-[#48B6E8] hover:underline">{viewSession.meeting_link}</a>
                </div>
              </div>
            )}
            {(viewSession.agenda || viewSession.notes || viewSession.action_items || viewSession.cancel_reason || viewSession.intern_feedback) && (
              <div className="rounded-[8px] border border-[#e2e8f0] overflow-hidden divide-y divide-[#e2e8f0]">
                {viewSession.agenda && (
                  <div className="p-3">
                    <p className="text-[0.75rem] text-[#9ca3af] font-medium uppercase mb-1">{t('mentoring.agenda')}</p>
                    <p className="text-[0.85rem] text-[#374151] whitespace-pre-wrap">{viewSession.agenda}</p>
                  </div>
                )}
                {viewSession.notes && (
                  <div className="p-3">
                    <p className="text-[0.75rem] text-[#16a34a] font-medium uppercase mb-1">{t('mentoring.meetingNotes')}</p>
                    <p className="text-[0.85rem] text-[#374151] whitespace-pre-wrap">{viewSession.notes}</p>
                  </div>
                )}
                {viewSession.action_items && (
                  <div className="p-3">
                    <p className="text-[0.75rem] text-[#d97706] font-medium uppercase mb-1">{t('mentoring.actionItems')}</p>
                    <p className="text-[0.85rem] text-[#374151] whitespace-pre-wrap">{viewSession.action_items}</p>
                  </div>
                )}
                {viewSession.cancel_reason && (
                  <div className="p-3 bg-[#fef2f2]">
                    <p className="text-[0.75rem] text-[#dc2626] font-medium uppercase mb-1">{t('mentoring.cancelReason')}</p>
                    <p className="text-[0.85rem] text-[#374151] whitespace-pre-wrap">{viewSession.cancel_reason}</p>
                  </div>
                )}
                {viewSession.intern_feedback && (
                  <div className="p-3">
                    <p className="text-[0.75rem] text-[#7c3aed] font-medium uppercase mb-1">{t('mentoring.internFeedback')}</p>
                    <p className="text-[0.85rem] text-[#374151] whitespace-pre-wrap">{viewSession.intern_feedback}</p>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => { setViewSession(null); setViewGroupSessions([]); }}>{t('worklogs.close')}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Complete Modal */}
      <Modal open={completeOpen} onClose={() => { setCompleteOpen(false); setCompleteIds([]); }} title={t('mentoring.completeSession')}>
        <div className="space-y-4">
          <div>
            <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('mentoring.meetingNotes')}<span className="text-[#dc2626] ml-0.5">*</span></label>
            <textarea
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
              rows={4}
              required
              placeholder={t('mentoring.notesPlaceholder')}
              className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
          <div>
            <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('mentoring.actionItems')}</label>
            <textarea
              value={completeActions}
              onChange={(e) => setCompleteActions(e.target.value)}
              rows={3}
              placeholder={t('mentoring.actionItemsPlaceholder')}
              className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setCompleteOpen(false); setCompleteIds([]); }}>{t('common.cancel')}</Button>
            <Button onClick={handleComplete} loading={completeMutation.isPending} disabled={!completeNotes.trim()}>{t('mentoring.markComplete')}</Button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal (intern) */}
      <Modal open={feedbackOpen} onClose={() => { setFeedbackOpen(false); setFeedbackSession(null); }} title={t('mentoring.addFeedback')}>
        <div className="space-y-4">
          <div>
            <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('mentoring.yourFeedback')}<span className="text-[#dc2626] ml-0.5">*</span></label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={4}
              required
              placeholder={t('mentoring.feedbackPlaceholder')}
              className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setFeedbackOpen(false); setFeedbackSession(null); }}>{t('common.cancel')}</Button>
            <Button onClick={handleFeedback} loading={feedbackMutation.isPending} disabled={!feedbackText.trim()}>{t('common.submit')}</Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal open={cancelOpen} onClose={() => { setCancelOpen(false); setCancelIds([]); }} title={t('mentoring.cancel')}>
        <div className="space-y-4">
          <p className="text-[0.85rem] text-[#6b7280]">{t('mentoring.cancelDescription')}</p>
          <div>
            <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('mentoring.cancelReason')}<span className="text-[#dc2626] ml-0.5">*</span></label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              required
              placeholder={t('mentoring.cancelReasonPlaceholder')}
              className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setCancelOpen(false); setCancelIds([]); }}>{t('common.cancel')}</Button>
            <Button onClick={handleCancel} loading={cancelMutation.isPending} disabled={!cancelReason.trim()} className="!bg-[#ef4444] hover:!bg-[#dc2626]">{t('mentoring.confirmCancel')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteIds.length > 0}
        onCancel={() => setDeleteIds([])}
        onConfirm={handleDelete}
        title={t('common.deleteConfirmTitle')}
        message={t('mentoring.deleteConfirm')}
      />
    </div>
  );
}
