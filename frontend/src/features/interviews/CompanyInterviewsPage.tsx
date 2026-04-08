import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Eye, List, Clock, CheckCircle, XCircle, ClipboardCheck, FileCheck, CalendarCheck, HelpCircle, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview, useUpdateResult } from '../../hooks/useInterviews';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { InterviewForm } from './InterviewForm';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Pagination } from '../../components/ui/Pagination';
import { getDefaultPerPage } from '../../lib/perPage';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDateTime } from '../../lib/formatDate';
import client from '../../api/client';
import type { CompanyInterview } from '../../types/ims';

export function CompanyInterviewsPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const isIntern = roleSlug === 'intern';

  const [status, setStatus] = useState('');
  const [generation, setGeneration] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(getDefaultPerPage());
  const [formOpen, setFormOpen] = useState(false);
  const [editInterview, setEditInterview] = useState<CompanyInterview | null>(null);
  const [viewInterview, setViewInterview] = useState<CompanyInterview | null>(null);

  const { data: rawData, isLoading } = useInterviews({ page, per_page: perPage });

  const isPastDate = (interview: any) => {
    const m = String(interview.interview_date).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    return m ? new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]) <= new Date() : false;
  };

  const data = rawData ? {
    ...rawData,
    data: rawData.data.filter((iv: any) => {
      // Status filter
      if (status) {
        const past = isPastDate(iv);
        if (status === 'scheduled' && past) return false;
        if (status === 'interviewed' && !past) return false;
        if (status === 'wait_result' && iv.result !== 'pending') return false;
        if (status === 'passed' && iv.result !== 'passed') return false;
        if (status === 'failed' && iv.result !== 'failed') return false;
      }
      // Generation filter
      if (generation) {
        const m = String(iv.interview_date).match(/^(\d{4})/);
        if (!m || m[1] !== generation) return false;
      }
      return true;
    }),
  } : rawData;
  const [resultOpen, setResultOpen] = useState(false);
  const [resultInterview, setResultInterview] = useState<CompanyInterview | null>(null);
  const [resultValue, setResultValue] = useState('');
  const [resultFeedback, setResultFeedback] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsInterview, setDetailsInterview] = useState<CompanyInterview | null>(null);
  const [detailsCompany, setDetailsCompany] = useState('');
  const [detailsPosition, setDetailsPosition] = useState('');
  const [detailsSupervisor, setDetailsSupervisor] = useState('');
  const [detailsTutor, setDetailsTutor] = useState('');
  const [detailsEmployment, setDetailsEmployment] = useState('internship');
  const [detailsAllowance, setDetailsAllowance] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => client.get('/users').then((r: any) => r.data),
    enabled: !!roleSlug && !isIntern,
  });
  const [tutors, setTutors] = useState<{ id: number; name: string; department: string | null }[]>([]);

  useEffect(() => {
    client.get<{ data: { id: number; name: string; department: string | null }[] }>('/public/tutors')
      .then((r) => setTutors(r.data.data)).catch(() => {});
  }, []);

  const createMutation = useCreateInterview();
  const updateMutation = useUpdateInterview();
  const deleteMutation = useDeleteInterview();
  const resultMutation = useUpdateResult();

  const handleCreate = () => {
    setEditInterview(null);
    setFormOpen(true);
  };

  const handleEdit = (interview: CompanyInterview) => {
    setEditInterview(interview);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData: {
    user_id?: number;
    company_name: string;
    interview_date: string;
    location?: string | null;
    type: string;
    employment?: string | null;
    notes?: string | null;
  }) => {
    const payload: Record<string, any> = {
      ...formData,
      user_id: formData.user_id || user!.id,
    };
    // Remove empty strings so backend validation doesn't reject them
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' || payload[k] === null) delete payload[k];
    });
    try {
      console.log('Submitting payload:', JSON.stringify(payload));
      if (editInterview) {
        await updateMutation.mutateAsync({ id: editInterview.id, payload });
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      setFormOpen(false);
      setEditInterview(null);
    } catch (err: any) {
      console.error('Interview submit error:', JSON.stringify(err.response?.data));
    }
  };

  const handleDelete = (id: number) => setDeleteId(id);

  const confirmDelete = async () => {
    if (deleteId !== null) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleOpenResult = (interview: CompanyInterview) => {
    setResultInterview(interview);
    setResultValue(interview.result || '');
    setResultFeedback('');
    setResultOpen(true);
  };

  const handleResultSubmit = async () => {
    if (resultInterview && resultValue) {
      await resultMutation.mutateAsync({ id: resultInterview.id, payload: { result: resultValue, feedback: resultFeedback || undefined } });
      setResultOpen(false);
      setResultInterview(null);
    }
  };

  const handleOpenDetails = (interview: CompanyInterview) => {
    setDetailsInterview(interview);
    setDetailsCompany((interview as any).company_name || '');
    setDetailsPosition('');
    setDetailsSupervisor('');
    setDetailsTutor((user as any)?.tutor_id?.toString() || '');
    setDetailsEmployment((interview as any).employment || 'internship');
    setDetailsOpen(true);
  };

  const handleDetailsSubmit = async () => {
    if (!detailsInterview || !user) return;
    // Update user profile
    await client.put('/me', {
      company_name: detailsCompany,
      position: detailsPosition,
      allowance: detailsAllowance ? Number(detailsAllowance) : null,
      supervisor_name: detailsSupervisor,
      ...(detailsTutor ? { tutor_id: Number(detailsTutor) } : {}),
    });
    // Update interview employment agreement
    await updateMutation.mutateAsync({
      id: detailsInterview.id,
      payload: { employment: detailsEmployment },
    });
    // Refresh auth user so button disappears
    try {
      const res = await client.get('/me');
      useAuthStore.getState().setUser(res.data.data || res.data);
    } catch {}
    setDetailsOpen(false);
    setDetailsInterview(null);
  };

  const currentYear = new Date().getFullYear();
  const generationOptions: { value: string; label: string; icon: typeof List }[] = [
    { value: '', label: t('interviews.allGenerations'), icon: List },
    ...Array.from({ length: currentYear - 2007 + 1 }, (_, i) => {
      const year = currentYear - i;
      return { value: String(year), label: `${t('interviews.generation')} ${year}`, icon: GraduationCap };
    }),
  ];

  const statusOptions = [
    { value: '', label: t('interviews.allStatuses'), icon: List },
    { value: 'scheduled', label: t('interviews.scheduled'), icon: Clock },
    { value: 'interviewed', label: t('interviews.interviewed'), icon: CalendarCheck },
    { value: 'wait_result', label: t('interviews.waitResult'), icon: HelpCircle },
    { value: 'passed', label: t('interviews.passed'), icon: CheckCircle },
    { value: 'failed', label: t('interviews.failed'), icon: XCircle },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">{t('interviews.companyInterviews')}</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">{t('interviews.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {isIntern ? t('interviews.scheduleInterview') : t('interviews.assignInterview')}
        </Button>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5] flex flex-wrap items-center gap-3">
          <FilterDropdown options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          {!isIntern && (
            <FilterDropdown options={generationOptions} value={generation} onChange={(v) => { setGeneration(v); setPage(1); }} maxVisible={5} />
          )}
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden space-y-3 p-4">
              {data?.data.map((interview) => {
                const m = String(interview.interview_date).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
                const isPast = m ? new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]) <= new Date() : false;
                const locked = isIntern && (interview.result === 'passed' || interview.result === 'failed');
                return (
                  <div key={interview.id} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 space-y-2 relative">
                    <div className="flex items-start justify-between">
                      <span className="text-[0.82rem] font-medium text-[#374151]">{(interview as any).company_name || interview.company?.name || '-'}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewInterview(interview)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                        {!isPastDate(interview) && <button onClick={() => handleEdit(interview)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>}
                        {isPast && (
                          <button onClick={() => !locked && handleOpenResult(interview)} className={`p-1.5 rounded-[5px] transition-colors ${locked ? 'text-[#d1d5db] cursor-not-allowed' : 'text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd]'}`} title={locked ? 'Result is final' : 'Update Result'} disabled={locked}><ClipboardCheck className="h-4 w-4" /></button>
                        )}
                        {interview.result === 'passed' && isIntern && !user?.company_name && (
                          <button onClick={() => handleOpenDetails(interview)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#10b981] hover:bg-[#ecfdf5] transition-colors" title="Complete Internship Details"><FileCheck className="h-4 w-4" /></button>
                        )}
                        {!isIntern && (
                          <button onClick={() => handleDelete(interview.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Intern</span><span className="text-[0.82rem] text-[#374151] font-medium">{interview.user?.name || '-'}</span></div>
                    <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Date</span><span className="text-[0.82rem] text-[#374151] font-medium">{formatDateTime(interview.interview_date)}</span></div>
                    <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Location</span>{interview.location && (interview.location.startsWith('http://') || interview.location.startsWith('https://')) ? <a href={interview.location.startsWith('http') ? interview.location : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(interview.location)}`} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-[5px] px-[10px] py-[3px] text-[0.7rem] font-semibold bg-[#eef8fd] border border-[#48B6E8] text-[#48B6E8] hover:bg-[#d9eff9] transition-colors">View Map</a> : <span className="text-[0.82rem] text-[#374151] font-medium">{interview.location || '-'}</span>}</div>
                    <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Type</span><Badge color={STATUS_COLORS[interview.type] || 'gray'}>{STATUS_LABELS[interview.type] || interview.type}</Badge></div>
                    <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Employment</span>{(interview as any).employment ? <Badge color={STATUS_COLORS[(interview as any).employment] || 'gray'}>{STATUS_LABELS[(interview as any).employment] || (interview as any).employment}</Badge> : <span className="text-[0.82rem] text-[#9ca3af]">-</span>}</div>
                    <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Status</span>{isPast ? <Badge color="green">Interviewed</Badge> : <Badge color="blue">Scheduled</Badge>}</div>
                    <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Result</span>{interview.result ? <Badge color={STATUS_COLORS[interview.result] || 'gray'}>{STATUS_LABELS[interview.result] || interview.result}</Badge> : <span className="text-[0.82rem] text-[#9ca3af]">-</span>}</div>
                  </div>
                );
              })}
              {data?.data.length === 0 && (
                <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">{t('interviews.noInterviewsFound')}</div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-[#fafafa]">
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.company')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('interviews.intern')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('interviews.date')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('jobPostings.location')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('interviews.type')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('interviews.employment')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('common.status')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('interviews.result')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((interview) => (
                    <tr key={interview.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{(interview as any).company_name || interview.company?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{interview.user?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{formatDateTime(interview.interview_date)}</td>
                      <td className="px-5 py-3 text-[0.82rem]">
                        {interview.location && (interview.location.startsWith('http://') || interview.location.startsWith('https://')) ? (
                          <a href={
                            interview.location.startsWith('http')
                              ? interview.location
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(interview.location)}`
                          } target="_blank" rel="noreferrer" className="inline-flex items-center rounded-[5px] px-[10px] py-[3px] text-[0.7rem] font-semibold bg-[#eef8fd] border border-[#48B6E8] text-[#48B6E8] hover:bg-[#d9eff9] transition-colors">View Map</a>
                        ) : (
                          <span className="text-[#374151]">{interview.location || '-'}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <Badge color={STATUS_COLORS[interview.type] || 'gray'}>{STATUS_LABELS[interview.type] || interview.type}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        {(interview as any).employment ? (
                          <Badge color={STATUS_COLORS[(interview as any).employment] || 'gray'}>{STATUS_LABELS[(interview as any).employment] || (interview as any).employment}</Badge>
                        ) : (
                          <span className="text-[0.82rem] text-[#9ca3af]">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {(() => {
                          const m = String(interview.interview_date).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
                          const isPast = m ? new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]) <= new Date() : false;
                          return isPast
                            ? <Badge color="green">Interviewed</Badge>
                            : <Badge color="blue">Scheduled</Badge>;
                        })()}
                      </td>
                      <td className="px-5 py-3">
                        {interview.result ? (
                          <Badge color={STATUS_COLORS[interview.result] || 'gray'}>{STATUS_LABELS[interview.result] || interview.result}</Badge>
                        ) : (
                          <span className="text-[0.82rem] text-[#9ca3af]">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewInterview(interview)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {(() => {
                            const m = String(interview.interview_date).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
                            const isPast = m ? new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]) <= new Date() : false;
                            if (!isPast) return (
                              <button onClick={() => handleEdit(interview)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                            );
                            if (!isPast) return null;
                            const locked = isIntern && (interview.result === 'passed' || interview.result === 'failed');
                            return (
                              <button
                                onClick={() => !locked && handleOpenResult(interview)}
                                className={`p-1.5 rounded-[5px] transition-colors ${
                                  locked
                                    ? 'text-[#d1d5db] cursor-not-allowed'
                                    : 'text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd]'
                                }`}
                                title={locked ? 'Result is final' : 'Update Result'}
                                disabled={locked}
                              >
                                <ClipboardCheck className="h-4 w-4" />
                              </button>
                            );
                          })()}
                          {interview.result === 'passed' && isIntern && !user?.company_name && (
                            <button
                              onClick={() => handleOpenDetails(interview)}
                              className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#10b981] hover:bg-[#ecfdf5] transition-colors"
                              title="Complete Internship Details"
                            >
                              <FileCheck className="h-4 w-4" />
                            </button>
                          )}
                          {!isIntern && (
                            <button onClick={() => handleDelete(interview.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">{t('interviews.noInterviewsFound')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </>
        )}
      </div>

      {data?.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} total={data.meta.total} perPage={perPage} onPerPageChange={(v: number) => { setPerPage(v); setPage(1); }} />}

      {/* View Interview Modal */}
      <Modal open={!!viewInterview} onClose={() => setViewInterview(null)} title={t('interviews.interviewDetails')}>
        {viewInterview && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              {(() => {
                const m = String(viewInterview.interview_date).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
                const isPast = m ? new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]) <= new Date() : false;
                return isPast
                  ? <Badge color="green">Interviewed</Badge>
                  : <Badge color="blue">Scheduled</Badge>;
              })()}
              {viewInterview.result && (
                <Badge color={STATUS_COLORS[viewInterview.result] || 'gray'}>{STATUS_LABELS[viewInterview.result] || viewInterview.result}</Badge>
              )}
              {(viewInterview as any).employment && (
                <Badge color={STATUS_COLORS[(viewInterview as any).employment] || 'gray'}>{STATUS_LABELS[(viewInterview as any).employment] || (viewInterview as any).employment}</Badge>
              )}
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">{t('interviews.interviewInformation')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Company</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewInterview as any).company_name || viewInterview.company?.name || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Intern</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewInterview.user?.name || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Date</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{formatDateTime(viewInterview.interview_date)}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Type</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{STATUS_LABELS[viewInterview.type] || viewInterview.type || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3 overflow-hidden">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Location</p>
                  <a
                    href={
                      viewInterview.location?.startsWith('http')
                        ? viewInterview.location
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(viewInterview.location ?? '')}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-[0.82rem] font-medium text-[#48B6E8] hover:underline block truncate"
                  >
                    {viewInterview.location}
                  </a>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Employment</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{STATUS_LABELS[(viewInterview as any).employment] || (viewInterview as any).employment || '-'}</p>
                </div>
              </div>
            </div>


            {viewInterview.notes && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-2">Notes</p>
                <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap bg-[#f9fafb] rounded-[5px] p-3">{viewInterview.notes}</p>
              </div>
            )}

            {viewInterview.feedback && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-2">Feedback</p>
                <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap bg-[#f9fafb] rounded-[5px] p-3">{viewInterview.feedback}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Result Modal */}
      <Modal open={resultOpen} onClose={() => { setResultOpen(false); setResultInterview(null); }} title={t('interviews.updateResult')}>
        <div className="space-y-4">
          <Select
            label={t('interviews.result')}
            options={[
              { value: '', label: t('interviews.selectResult') },
              { value: 'passed', label: t('interviews.passed') },
              { value: 'failed', label: t('interviews.failed') },
              { value: 'pending', label: t('interviews.waitResult') },
            ]}
            value={resultValue}
            onChange={(e) => setResultValue(e.target.value)}
            required
          />
          <Input
            label={t('interviews.feedback')}
            value={resultFeedback}
            onChange={(e) => setResultFeedback(e.target.value)}
            placeholder="Optional feedback..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setResultOpen(false); setResultInterview(null); }}>{t('common.cancel')}</Button>
            <Button onClick={handleResultSubmit} loading={resultMutation.isPending} disabled={!resultValue}>{t('interviews.updateResult')}</Button>
          </div>
        </div>
      </Modal>

      {/* Complete Internship Details Modal */}
      <Modal open={detailsOpen} onClose={() => { setDetailsOpen(false); setDetailsInterview(null); }} title={t('interviews.completeDetails')}>
        {detailsInterview && (
          <div className="space-y-4">
            <div className="p-3 rounded-[5px] bg-[#ecfdf5] border border-[#a7f3d0] text-[0.85rem] text-[#059669]">
              Congratulations! You passed the interview at <strong>{(detailsInterview as any).company_name || 'the company'}</strong>. Please fill in your internship details.
            </div>

            <Input
              label="Company Name"
              type="text"
              value={detailsCompany}
              onChange={(e) => setDetailsCompany(e.target.value)}
              placeholder="e.g. Tech Solutions Inc."
              required
            />

            <Input
              label="Position"
              type="text"
              value={detailsPosition}
              onChange={(e) => setDetailsPosition(e.target.value)}
              placeholder="e.g. Software Engineer Intern"
              required
            />

            <Input
              label="Allowance ($/month)"
              type="number"
              value={detailsAllowance}
              onChange={(e) => setDetailsAllowance(e.target.value)}
              placeholder="e.g. 200"
            />

            <Input
              label="Supervisor Name"
              type="text"
              value={detailsSupervisor}
              onChange={(e) => setDetailsSupervisor(e.target.value)}
              placeholder="e.g. Mr. John Doe"
            />

            {(user as any)?.tutor_id ? (
              <div>
                <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Tutor</label>
                <div className="rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] text-[#374151] bg-[#f9fafb]">
                  {tutors.find((t) => t.id === (user as any).tutor_id)?.name || 'Assigned'}
                </div>
              </div>
            ) : (
              <Select
                label="Tutor"
                options={[
                  { value: '', label: 'Select a Tutor' },
                  ...tutors.map((t) => ({ value: t.id, label: `${t.name}${t.department ? ` — ${t.department}` : ''}` })),
                ]}
                value={detailsTutor}
                onChange={(e) => setDetailsTutor(e.target.value)}
              />
            )}

            <Select
              label={t('interviews.employmentAgreement')}
              options={[
                { value: 'internship', label: t('status.internship') },
                { value: 'probation', label: t('status.probation') },
                { value: 'staff', label: t('status.staff') },
                { value: 'contract', label: t('status.contract') },
              ]}
              value={detailsEmployment}
              onChange={(e) => setDetailsEmployment(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => { setDetailsOpen(false); setDetailsInterview(null); }}>{t('common.cancel')}</Button>
              <Button onClick={handleDetailsSubmit} disabled={!detailsCompany || !detailsPosition || !detailsEmployment}>{t('interviews.complete')}</Button>
            </div>
          </div>
        )}
      </Modal>

      <InterviewForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditInterview(null); }}
        onSubmit={handleFormSubmit}
        users={!isIntern ? (usersData?.data?.filter((u: any) => u.role?.slug === 'intern') || []) : undefined}
        interview={editInterview}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        message={t('interviews.deleteConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
