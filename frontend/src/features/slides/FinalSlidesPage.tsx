import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Send, Pencil, Trash2, Eye, Upload, List, FilePen, CheckCircle, XCircle, CalendarClock } from 'lucide-react';
import { useSlides, useCreateSlide, useDeleteSlide, useSubmitSlide, useUploadSlideFile, useUpdateSlide } from '../../hooks/useSlides';
import client from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DatePicker } from '../../components/ui/DatePicker';
import { SlideForm } from './SlideForm';
import { UserAvatar } from '../../components/ui/UserAvatar';
import { STATUS_COLORS, STATUS_LABELS, STATUS_KEYS } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';
import type { FinalSlide } from '../../types/ims';

export function FinalSlidesPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const isTutor = roleSlug === 'tutor';
  const isIntern = roleSlug === 'intern';

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deadlineDismissed, setDeadlineDismissed] = useState(() => {
    return localStorage.getItem('slide_deadline_dismissed') === 'true';
  });
  const [formOpen, setFormOpen] = useState(false);
  const [viewSlide, setViewSlide] = useState<FinalSlide | null>(null);
  const [editSlide, setEditSlide] = useState<FinalSlide | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [_deadlineSlide, setDeadlineSlide] = useState<FinalSlide | null>(null);
  const [deadlineValue, setDeadlineValue] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const qc = useQueryClient();
  const { data, isLoading } = useSlides({ status: status || undefined, page });
  const { data: deadlineData } = useQuery({
    queryKey: ['deadline', 'final_slide'],
    queryFn: () => client.get('/deadlines/final_slide').then((r: any) => r.data.data),
  });
  const createMutation = useCreateSlide();
  const deleteMutation = useDeleteSlide();
  const submitMutation = useSubmitSlide();
  const uploadMutation = useUploadSlideFile();
  const updateMutation = useUpdateSlide();

  const handleFormSubmit = async (formData: any) => {
    try {
      const file = formData.file instanceof File ? formData.file : null;
      const rest = { title: formData.title, description: formData.description, presentation_date: formData.presentation_date };
      const slide = await createMutation.mutateAsync(rest);
      if (file && slide?.id) {
        try {
          await uploadMutation.mutateAsync({ id: slide.id, file });
        } catch (uploadErr: any) {
          console.error('Upload error:', uploadErr.response?.data);
        }
      }
      setFormOpen(false);
    } catch (err: any) {
      console.error('Slide create error:', err.response?.data);
    }
  };

  const handleOpenEdit = (slide: FinalSlide) => {
    setEditSlide(slide);
    setEditTitle(slide.title);
    setEditDesc(slide.description || '');
    setEditDate(slide.presentation_date || '');
  };

  const handleEditSubmit = async () => {
    if (!editSlide) return;
    await updateMutation.mutateAsync({ id: editSlide.id, payload: { title: editTitle, description: editDesc || null, presentation_date: editDate || null } });
    setEditSlide(null);
  };

  const handleSetDeadline = async () => {
    if (!deadlineValue) return;
    await client.post('/deadlines', { type: 'final_slide', deadline: deadlineValue });
    qc.invalidateQueries({ queryKey: ['deadline', 'final_slide'] });
    setDeadlineOpen(false);
    setDeadlineSlide(null);
  };

  const deadlineDate = deadlineData?.deadline || null;

  const statusOptions = [
    { value: '', label: t('common.allStatuses'), icon: List },
    { value: 'draft', label: t('common.draft'), icon: FilePen },
    { value: 'submitted', label: t('common.submitted'), icon: Send },
    { value: 'approved', label: t('common.approved'), icon: CheckCircle },
    { value: 'rejected', label: t('common.rejected'), icon: XCircle },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">{t('slides.title')}</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">{t('slides.subtitle')}</p>
        </div>
        {isTutor ? (
          <div className="flex flex-wrap items-center gap-3">
            {deadlineDate && (
              <div className="flex items-center gap-2 px-3 py-[9px] rounded-[5px] border bg-[#eff6ff] border-[#bfdbfe] text-[#2563eb] text-[0.82rem] font-medium">
                <CalendarClock className="w-4 h-4" />
                {t('reports.deadline')}: {formatDate(deadlineDate)}
              </div>
            )}
            <Button onClick={() => { setDeadlineSlide(null); setDeadlineValue(deadlineDate || ''); setDeadlineOpen(true); }}>
              <CalendarClock className="h-4 w-4 mr-2" />
              {deadlineDate ? t('reports.editDeadline') : t('reports.setDeadline')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            {isIntern && deadlineDate && (
              <div className={`flex items-center gap-2 px-3 py-[9px] rounded-[5px] border text-[0.82rem] font-medium ${
                new Date(deadlineDate) < new Date()
                  ? 'bg-[#fef2f2] border-[#fecaca] text-[#dc2626]'
                  : 'bg-[#eff6ff] border-[#bfdbfe] text-[#2563eb]'
              }`}>
                <CalendarClock className="w-4 h-4" />
                {new Date(deadlineDate) < new Date() ? t('reports.expired') : t('reports.deadline')}: {formatDate(deadlineDate)}
              </div>
            )}
            <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {t('slides.newSlide')}
            </Button>
          </div>
        )}
      </div>

      {/* Deadline Overlay for Intern */}
      {isIntern && deadlineDate && !deadlineDismissed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[5px] p-8 w-full max-w-[400px] text-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'slideUp 0.2s ease-out' }}>
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              new Date(deadlineDate) < new Date() ? 'bg-[#fef2f2]' : 'bg-[#eff6ff]'
            }`}>
              <CalendarClock className={`w-8 h-8 ${
                new Date(deadlineDate) < new Date() ? 'text-[#dc2626]' : 'text-[#2563eb]'
              }`} />
            </div>
            <h2 className={`text-[1.2rem] font-bold mb-2 ${
              new Date(deadlineDate) < new Date() ? 'text-[#dc2626]' : 'text-[#1e1b4b]'
            }`}>
              {new Date(deadlineDate) < new Date() ? t('reports.deadlineExpired') : t('slides.finalSlideDeadline')}
            </h2>
            <p className="text-[0.92rem] text-[#6b7280] mb-1">{t('slides.tutorSetDeadline')}</p>
            <p className={`text-[1.1rem] font-bold mb-6 ${
              new Date(deadlineDate) < new Date() ? 'text-[#dc2626]' : 'text-[#48B6E8]'
            }`}>
              {formatDate(deadlineDate)}
            </p>
            {(() => {
              const diff = Math.ceil((new Date(deadlineDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return diff > 0 ? (
                <p className="text-[0.82rem] text-[#6b7280] mb-5">{diff} day{diff !== 1 ? 's' : ''} remaining</p>
              ) : (
                <p className="text-[0.82rem] text-[#dc2626] font-medium mb-5">Overdue by {Math.abs(diff)} day{Math.abs(diff) !== 1 ? 's' : ''}</p>
              );
            })()}
            <Button onClick={() => { setDeadlineDismissed(true); localStorage.setItem('slide_deadline_dismissed', 'true'); }} className="w-full py-[10px]">
              {t('reports.gotIt')}
            </Button>
          </div>
        </div>
      )}


      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5]">
          <FilterDropdown options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden space-y-3 p-4">
              {data?.data.map((slide) => (
                <div key={slide.id} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 space-y-2 relative">
                  <div className="flex items-start justify-between">
                    <span className="text-[0.82rem] font-medium text-[#374151]">{slide.title}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewSlide(slide)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"><Eye className="h-4 w-4" /></button>
                      {isTutor && (
                        <button onClick={() => { setDeadlineSlide(slide); setDeadlineValue((slide as any).deadline || ''); setDeadlineOpen(true); }} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Set Deadline"><CalendarClock className="h-4 w-4" /></button>
                      )}
                      {slide.status === 'draft' && !isTutor && (
                        <>
                          <button onClick={() => handleOpenEdit(slide)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => submitMutation.mutate(slide.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#059669] hover:bg-[#f0fdf4] transition-colors" title="Submit"><Send className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteId(slide.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('worklogs.intern')}</span><span className="text-[0.82rem] text-[#374151] font-medium">{slide.user?.name || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('reports.file')}</span>{slide.file_path ? <a href={slide.file_path} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-[5px] px-[10px] py-[3px] text-[0.7rem] font-semibold bg-[#f0fdf4] border border-[#bbf7d0] text-[#22c55e] hover:bg-[#dcfce7] transition-colors">{t('reports.download')}</a> : <span className="text-[0.82rem] text-[#9ca3af]">-</span>}</div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('reports.deadline')}</span>{deadlineDate ? <Badge color={new Date(deadlineDate) < new Date() ? 'red' : 'blue'}>{formatDate(deadlineDate)}</Badge> : <span className="text-[0.82rem] text-[#9ca3af]">-</span>}</div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('common.status')}</span><Badge color={STATUS_COLORS[slide.status] || 'gray'}>{t(STATUS_KEYS[slide.status] || slide.status)}</Badge></div>
                </div>
              ))}
              {data?.data.length === 0 && (
                <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">{t('slides.noSlidesFound')}</div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#fafafa]">
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('roles.title')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('worklogs.intern')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('reports.file')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('reports.deadline')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('common.status')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((slide) => (
                    <tr key={slide.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{slide.title}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{slide.user?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem]">
                        {slide.file_path ? (
                          <a href={slide.file_path} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-[5px] px-[10px] py-[3px] text-[0.7rem] font-semibold bg-[#f0fdf4] border border-[#bbf7d0] text-[#22c55e] hover:bg-[#dcfce7] transition-colors">{t('reports.download')}</a>
                        ) : (
                          <span className="text-[#9ca3af]">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-[0.82rem]">
                        {deadlineDate ? (
                          <Badge color={new Date(deadlineDate) < new Date() ? 'red' : 'blue'}>
                            {formatDate(deadlineDate)}
                          </Badge>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-3">
                        <Badge color={STATUS_COLORS[slide.status] || 'gray'}>{t(STATUS_KEYS[slide.status] || slide.status)}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewSlide(slide)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          {isTutor && (
                            <button onClick={() => { setDeadlineSlide(slide); setDeadlineValue((slide as any).deadline || ''); setDeadlineOpen(true); }} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Set Deadline">
                              <CalendarClock className="h-4 w-4" />
                            </button>
                          )}
                          {slide.status === 'draft' && !isTutor && (
                            <>
                              <button onClick={() => handleOpenEdit(slide)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => submitMutation.mutate(slide.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#059669] hover:bg-[#f0fdf4] transition-colors" title="Submit">
                                <Send className="h-4 w-4" />
                              </button>
                              <button onClick={() => setDeleteId(slide.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Delete">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">{t('slides.noSlidesFound')}</td>
                    </tr>
                  )}
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

      {/* Edit Slide Modal */}
      <Modal open={!!editSlide} onClose={() => setEditSlide(null)} title={t('slides.editSlide')} size="lg">
        {editSlide && (
          <div className="space-y-4">
            <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            <div className="w-full">
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('roles.description')}</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
              />
            </div>
            <DatePicker label={t('slides.presentationDate')} value={editDate} onChange={setEditDate} />

            {/* Re-upload file */}
            <div>
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-2">{t('reports.replaceFile')}</label>
              <label className="flex items-center gap-2 px-4 py-[9px] rounded-[5px] border border-[#e0e0e0] text-[0.82rem] font-medium text-[#374151] hover:bg-[#f5f5f7] transition-colors cursor-pointer w-fit">
                <Upload className="w-4 h-4 text-[#9ca3af]" />
                {t('reports.chooseNewFile')}
                <input type="file" className="hidden" accept=".pdf,.pptx,.ppt,.key,.odp,.jpg,.jpeg,.png,.mp4,.zip" onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    await uploadMutation.mutateAsync({ id: editSlide.id, file: e.target.files[0] });
                  }
                }} />
              </label>
              {editSlide.file_path && (
                <p className="mt-2 text-[0.78rem] text-[#22c55e] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t('reports.fileUploaded')}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditSlide(null)}>{t('common.cancel')}</Button>
              <Button onClick={handleEditSubmit} disabled={!editTitle}>{t('common.update')}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Slide Modal */}
      <Modal open={!!viewSlide} onClose={() => setViewSlide(null)} title={viewSlide?.title || 'Slide Details'}>
        {viewSlide && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge color={STATUS_COLORS[viewSlide.status] || 'gray'}>{t(STATUS_KEYS[viewSlide.status] || viewSlide.status)}</Badge>
              {deadlineDate && (
                <Badge color={new Date(deadlineDate) < new Date() ? 'red' : 'blue'}>
                  {t('reports.deadline')}: {formatDate(deadlineDate)}
                </Badge>
              )}
            </div>

            {viewSlide.user && (
              <div className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-[5px]">
                <UserAvatar name={viewSlide.user.name} avatar={(viewSlide.user as any).avatar} size="md" />
                <div>
                  <p className="text-[0.85rem] font-medium text-[#374151]">{viewSlide.user.name}</p>
                  <p className="text-[0.75rem] text-[#9ca3af]">{viewSlide.user.email}</p>
                </div>
              </div>
            )}

            {viewSlide.description && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">{t('roles.description')}</p>
                <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{viewSlide.description}</p>
              </div>
            )}
            {viewSlide.presentation_date && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">{t('slides.presentationDate')}</p>
                <p className="text-[0.82rem] text-[#374151]">{formatDate(viewSlide.presentation_date)}</p>
              </div>
            )}
            {viewSlide.feedback && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">{t('reports.feedback')}</p>
                <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{viewSlide.feedback}</p>
              </div>
            )}
            {viewSlide.file_path && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">{t('reports.file')}</p>
                <a href={viewSlide.file_path} target="_blank" rel="noreferrer" className="text-[0.82rem] text-[#3a9fd4] hover:underline">{t('reports.downloadFile')}</a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Set Deadline Modal (Tutor) */}
      <Modal open={deadlineOpen} onClose={() => { setDeadlineOpen(false); setDeadlineSlide(null); }} title={deadlineDate ? t('reports.editDeadline') : t('reports.setDeadline')}>
        <div className="space-y-4">
          {deadlineDate && (
            <div className="p-3 rounded-[5px] bg-[#eff6ff] border border-[#bfdbfe] text-[0.85rem] text-[#2563eb] flex items-center gap-2">
              <CalendarClock className="w-4 h-4 shrink-0" />
              {t('reports.currentDeadline')}: <strong>{formatDate(deadlineDate)}</strong>
            </div>
          )}
          <DatePicker label={t('reports.newDeadlineDate')} value={deadlineValue} onChange={setDeadlineValue} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setDeadlineOpen(false); setDeadlineSlide(null); }}>{t('common.cancel')}</Button>
            <Button onClick={handleSetDeadline} disabled={!deadlineValue}>{deadlineDate ? t('reports.updateDeadline') : t('reports.setDeadline')}</Button>
          </div>
        </div>
      </Modal>

      {!isTutor && (
        <SlideForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          loading={createMutation.isPending}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        message={t('slides.deleteConfirm')}
        onConfirm={() => { if (deleteId !== null) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
