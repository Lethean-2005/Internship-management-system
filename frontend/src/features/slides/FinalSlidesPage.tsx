import { useState } from 'react';
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
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';
import type { FinalSlide } from '../../types/ims';

export function FinalSlidesPage() {
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
    { value: '', label: 'All Statuses', icon: List },
    { value: 'draft', label: 'Draft', icon: FilePen },
    { value: 'submitted', label: 'Submitted', icon: Send },
    { value: 'approved', label: 'Approved', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">Final Slides</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Manage internship presentation slides.</p>
        </div>
        {isTutor ? (
          <div className="flex flex-wrap items-center gap-3">
            {deadlineDate && (
              <div className="flex items-center gap-2 px-3 py-[9px] rounded-[5px] border bg-[#eff6ff] border-[#bfdbfe] text-[#2563eb] text-[0.82rem] font-medium">
                <CalendarClock className="w-4 h-4" />
                Deadline: {formatDate(deadlineDate)}
              </div>
            )}
            <Button onClick={() => { setDeadlineSlide(null); setDeadlineValue(deadlineDate || ''); setDeadlineOpen(true); }}>
              <CalendarClock className="h-4 w-4 mr-2" />
              {deadlineDate ? 'Edit Deadline' : 'Set Deadline'}
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
                {new Date(deadlineDate) < new Date() ? 'Expired' : 'Deadline'}: {formatDate(deadlineDate)}
              </div>
            )}
            <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Slide
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
              {new Date(deadlineDate) < new Date() ? 'Deadline Expired!' : 'Final Slide Deadline'}
            </h2>
            <p className="text-[0.92rem] text-[#6b7280] mb-1">Your tutor has set a deadline for final slides</p>
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
              Got it
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
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Intern</span><span className="text-[0.82rem] text-[#374151] font-medium">{slide.user?.name || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">File</span>{slide.file_path ? <a href={slide.file_path} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-[5px] px-[10px] py-[3px] text-[0.7rem] font-semibold bg-[#f0fdf4] border border-[#bbf7d0] text-[#22c55e] hover:bg-[#dcfce7] transition-colors">Download</a> : <span className="text-[0.82rem] text-[#9ca3af]">-</span>}</div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Deadline</span>{deadlineDate ? <Badge color={new Date(deadlineDate) < new Date() ? 'red' : 'blue'}>{formatDate(deadlineDate)}</Badge> : <span className="text-[0.82rem] text-[#9ca3af]">-</span>}</div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Status</span><Badge color={STATUS_COLORS[slide.status] || 'gray'}>{STATUS_LABELS[slide.status] || slide.status}</Badge></div>
                </div>
              ))}
              {data?.data.length === 0 && (
                <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No slides found.</div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#fafafa]">
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Title</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Intern</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">File</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Deadline</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((slide) => (
                    <tr key={slide.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{slide.title}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{slide.user?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem]">
                        {slide.file_path ? (
                          <a href={slide.file_path} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-[5px] px-[10px] py-[3px] text-[0.7rem] font-semibold bg-[#f0fdf4] border border-[#bbf7d0] text-[#22c55e] hover:bg-[#dcfce7] transition-colors">Download</a>
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
                        <Badge color={STATUS_COLORS[slide.status] || 'gray'}>{STATUS_LABELS[slide.status] || slide.status}</Badge>
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
                      <td colSpan={6} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No slides found.</td>
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
      <Modal open={!!editSlide} onClose={() => setEditSlide(null)} title="Edit Slide" size="lg">
        {editSlide && (
          <div className="space-y-4">
            <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            <div className="w-full">
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Description</label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
              />
            </div>
            <DatePicker label="Presentation Date" value={editDate} onChange={setEditDate} />

            {/* Re-upload file */}
            <div>
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-2">Replace File</label>
              <label className="flex items-center gap-2 px-4 py-[9px] rounded-[5px] border border-[#e0e0e0] text-[0.82rem] font-medium text-[#374151] hover:bg-[#f5f5f7] transition-colors cursor-pointer w-fit">
                <Upload className="w-4 h-4 text-[#9ca3af]" />
                Choose New File
                <input type="file" className="hidden" accept=".pdf,.pptx,.ppt,.key,.odp,.jpg,.jpeg,.png,.mp4,.zip" onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    await uploadMutation.mutateAsync({ id: editSlide.id, file: e.target.files[0] });
                  }
                }} />
              </label>
              {editSlide.file_path && (
                <p className="mt-2 text-[0.78rem] text-[#22c55e] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> File uploaded
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditSlide(null)}>Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={!editTitle}>Update</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Slide Modal */}
      <Modal open={!!viewSlide} onClose={() => setViewSlide(null)} title={viewSlide?.title || 'Slide Details'}>
        {viewSlide && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge color={STATUS_COLORS[viewSlide.status] || 'gray'}>{STATUS_LABELS[viewSlide.status] || viewSlide.status}</Badge>
              {deadlineDate && (
                <Badge color={new Date(deadlineDate) < new Date() ? 'red' : 'blue'}>
                  Deadline: {formatDate(deadlineDate)}
                </Badge>
              )}
            </div>

            {viewSlide.user && (
              <div className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-[5px]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.8rem] font-bold shrink-0">
                  {viewSlide.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[0.85rem] font-medium text-[#374151]">{viewSlide.user.name}</p>
                  <p className="text-[0.75rem] text-[#9ca3af]">{viewSlide.user.email}</p>
                </div>
              </div>
            )}

            {viewSlide.description && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Description</p>
                <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{viewSlide.description}</p>
              </div>
            )}
            {viewSlide.presentation_date && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Presentation Date</p>
                <p className="text-[0.82rem] text-[#374151]">{formatDate(viewSlide.presentation_date)}</p>
              </div>
            )}
            {viewSlide.feedback && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Feedback</p>
                <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{viewSlide.feedback}</p>
              </div>
            )}
            {viewSlide.file_path && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">File</p>
                <a href={viewSlide.file_path} target="_blank" rel="noreferrer" className="text-[0.82rem] text-[#3a9fd4] hover:underline">Download File</a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Set Deadline Modal (Tutor) */}
      <Modal open={deadlineOpen} onClose={() => { setDeadlineOpen(false); setDeadlineSlide(null); }} title={deadlineDate ? 'Edit Deadline' : 'Set Deadline'}>
        <div className="space-y-4">
          {deadlineDate && (
            <div className="p-3 rounded-[5px] bg-[#eff6ff] border border-[#bfdbfe] text-[0.85rem] text-[#2563eb] flex items-center gap-2">
              <CalendarClock className="w-4 h-4 shrink-0" />
              Current deadline: <strong>{formatDate(deadlineDate)}</strong>
            </div>
          )}
          <DatePicker label="New Deadline Date" value={deadlineValue} onChange={setDeadlineValue} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setDeadlineOpen(false); setDeadlineSlide(null); }}>Cancel</Button>
            <Button onClick={handleSetDeadline} disabled={!deadlineValue}>{deadlineDate ? 'Update Deadline' : 'Set Deadline'}</Button>
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
        message="Are you sure you want to delete this slide? This action cannot be undone."
        onConfirm={() => { if (deleteId !== null) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
