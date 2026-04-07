import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Eye, Pencil, Send, List, FilePen, CheckCircle, XCircle } from 'lucide-react';
import { useWorklogs, useCreateWorklog, useUpdateWorklog, useDeleteWorklog, useSubmitWorklog, useReviewWorklog } from '../../hooks/useWorklogs';
import { useInternships } from '../../hooks/useInternships';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { WorklogForm } from './WorklogForm';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { STATUS_COLORS, STATUS_LABELS, STATUS_KEYS } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';
import type { WeeklyWorklog } from '../../types/ims';

import { RefreshCw } from 'lucide-react';

export function WeeklyWorklogsPage() {
  const user = useAuthStore((s) => s.user);
  const { t } = useTranslation();

  const statusOptions = [
    { value: '', label: t('common.allStatuses'), icon: List },
    { value: 'draft', label: t('common.draft'), icon: FilePen },
    { value: 'submitted', label: t('common.submitted'), icon: Send },
    { value: 'resubmitted', label: t('common.resubmitted'), icon: RefreshCw },
    { value: 'reviewed', label: t('common.reviewed'), icon: CheckCircle },
    { value: 'rejected', label: t('common.rejected'), icon: XCircle },
  ];
  const isIntern = user?.role?.slug === 'intern';
  const isTutor = user?.role?.slug === 'tutor';
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view' | 'review'>('create');
  const [selected, setSelected] = useState<WeeklyWorklog | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useWorklogs({ status: status || undefined, page });
  const { data: internshipsData } = useInternships();
  const createMutation = useCreateWorklog();
  const updateMutation = useUpdateWorklog();
  const deleteMutation = useDeleteWorklog();
  const submitMutation = useSubmitWorklog();
  const reviewMutation = useReviewWorklog();

  const openCreate = () => { setSelected(null); setFormMode('create'); setFormOpen(true); };
  const openView = (wl: WeeklyWorklog) => { setSelected(wl); setFormMode('view'); setFormOpen(true); };
  const openEdit = (wl: WeeklyWorklog) => { setSelected(wl); setFormMode('edit'); setFormOpen(true); };
  const openReview = (wl: WeeklyWorklog) => { setSelected(wl); setFormMode('review'); setFormOpen(true); };

  const handleReview = async (status: string, feedback: string | null) => {
    if (!selected) return;
    await reviewMutation.mutateAsync({ id: selected.id, payload: { status, feedback } });
    setFormOpen(false);
  };

  const handleSubmitForm = async (data: any) => {
    const shouldSubmit = data._submit;
    delete data._submit;
    if (formMode === 'edit' && selected) {
      await updateMutation.mutateAsync({ id: selected.id, payload: data });
      if (shouldSubmit) await submitMutation.mutateAsync(selected.id);
    } else {
      await createMutation.mutateAsync(data);
    }
    setFormOpen(false);
  };

  const confirmDelete = () => { if (deleteId !== null) { deleteMutation.mutate(deleteId); setDeleteId(null); } };

  // Check if intern's latest worklog end_date hasn't passed yet
  const today = new Date().toISOString().split('T')[0];
  const hasActiveWeek = isIntern && data?.data.some(wl => wl.end_date >= today);

  // Calculate next week number from highest existing week
  const maxWeek = isIntern && data?.data.length ? Math.max(...data.data.map(wl => wl.week_number)) : 0;
  const nextWeekNumber = maxWeek + 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">{t('worklogs.title')}</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">{t('worklogs.subtitle')}</p>
        </div>
        {!isTutor && (
          <div className="w-full sm:w-auto" title={hasActiveWeek ? t('worklogs.createTooltip') : ''}>
            <Button onClick={openCreate} className="w-full sm:w-auto" disabled={hasActiveWeek}>
              <Plus className="h-4 w-4 mr-2" /> {t('worklogs.newWorklog')}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5]">
          <FilterDropdown options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
            {/* Mobile */}
            <div className="md:hidden space-y-3 p-4">
              {data?.data.map((wl) => (
                <div key={wl.id} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-[0.82rem] font-medium text-[#374151]">{t('worklogs.week')} {wl.week_number}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(wl)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"><Eye className="h-4 w-4" /></button>
                      {isIntern && (wl.status === 'draft' || wl.status === 'rejected') && <>
                        <button onClick={() => openEdit(wl)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => submitMutation.mutate(wl.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#059669] hover:bg-[#f0fdf4] transition-colors"><Send className="h-4 w-4" /></button>
                      </>}
                      {isTutor && (wl.status === 'submitted' || wl.status === 'resubmitted') && (
                        <button onClick={() => openReview(wl)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#059669] hover:bg-[#f0fdf4] transition-colors"><CheckCircle className="h-4 w-4" /></button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('worklogs.dateRange')}</span><span className="text-[0.82rem] text-[#374151] font-medium">{formatDate(wl.start_date)} - {formatDate(wl.end_date)}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('worklogs.intern')}</span><span className="text-[0.82rem] text-[#374151] font-medium">{wl.user?.name || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('worklogs.hours')}</span><span className="text-[0.82rem] text-[#374151] font-medium">{wl.hours_worked}h</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('common.status')}</span><Badge color={STATUS_COLORS[wl.status] || 'gray'}>{t(STATUS_KEYS[wl.status] || wl.status)}</Badge></div>
                </div>
              ))}
              {data?.data.length === 0 && <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">{t('worklogs.noWorklogsFound')}</div>}
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#fafafa]">
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('worklogs.week')} #</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('worklogs.dateRange')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('worklogs.intern')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('worklogs.hours')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('common.status')}</th>
                    <th className="text-right px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((wl) => (
                    <tr key={wl.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{t('worklogs.week')} {wl.week_number}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{formatDate(wl.start_date)} - {formatDate(wl.end_date)}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{wl.user?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{wl.hours_worked}h</td>
                      <td className="px-5 py-3"><Badge color={STATUS_COLORS[wl.status] || 'gray'}>{t(STATUS_KEYS[wl.status] || wl.status)}</Badge></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openView(wl)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                          {isIntern && (wl.status === 'draft' || wl.status === 'rejected') && <>
                            <button onClick={() => openEdit(wl)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => submitMutation.mutate(wl.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#059669] hover:bg-[#f0fdf4] transition-colors" title="Submit"><Send className="h-4 w-4" /></button>
                          </>}
                          {isTutor && (wl.status === 'submitted' || wl.status === 'resubmitted') && (
                            <button onClick={() => openReview(wl)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#059669] hover:bg-[#f0fdf4] transition-colors" title="Review"><CheckCircle className="h-4 w-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">{t('worklogs.noWorklogsFound')}</td></tr>}
                </tbody>
              </table>
            </div>

            {data?.meta && data.meta.last_page > 1 && (
              <div className="p-4 border-t border-[#f5f5f5]">
                <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      <WorklogForm open={formOpen} onClose={() => setFormOpen(false)} onSubmit={handleSubmitForm} internships={internshipsData?.data || []} loading={createMutation.isPending || updateMutation.isPending} mode={formMode} worklog={selected} onReview={handleReview} reviewLoading={reviewMutation.isPending} nextWeekNumber={nextWeekNumber} />
      <ConfirmDialog open={deleteId !== null} message={t('worklogs.deleteConfirm')} onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
