import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Send, Pencil, Upload, Trash2, List, FilePen, CheckCircle, XCircle, CalendarClock } from 'lucide-react';
import { useReports, useCreateReport, useDeleteReport, useSubmitReport, useUploadReportFile, useUpdateReport } from '../../hooks/useReports';
import client from '../../api/client';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { DatePicker } from '../../components/ui/DatePicker';
import { ReportForm } from './ReportForm';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';
import type { FinalReport } from '../../types/ims';

export function FinalReportsPage() {
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const isTutor = roleSlug === 'tutor';
  const isIntern = roleSlug === 'intern';

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deadlineDismissed, setDeadlineDismissed] = useState(() => {
    return localStorage.getItem('report_deadline_dismissed') === 'true';
  });
  const [formOpen, setFormOpen] = useState(false);
  const [viewReport, setViewReport] = useState<FinalReport | null>(null);
  const [editReport, setEditReport] = useState<FinalReport | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [deadlineOpen, setDeadlineOpen] = useState(false);
  const [_deadlineReport, setDeadlineReport] = useState<FinalReport | null>(null);
  const [deadlineValue, setDeadlineValue] = useState('');

  const qc = useQueryClient();
  const { data, isLoading } = useReports({ status: status || undefined, page });
  const { data: deadlineData } = useQuery({
    queryKey: ['deadline', 'final_report'],
    queryFn: () => client.get('/deadlines/final_report').then((r: any) => r.data.data),
  });
  const createMutation = useCreateReport();
  const deleteMutation = useDeleteReport();
  const submitMutation = useSubmitReport();
  const uploadMutation = useUploadReportFile();
  const updateMutation = useUpdateReport();

  const deadlineDate = deadlineData?.deadline || null;

  const handleFormSubmit = async (formData: any) => {
    try {
      const file = formData.file instanceof File ? formData.file : null;
      const rest = { title: formData.title, content: formData.content, internship_id: formData.internship_id };
      const report = await createMutation.mutateAsync(rest);
      if (file && report?.id) {
        try {
          await uploadMutation.mutateAsync({ id: report.id, file });
        } catch (e: any) {
          console.error('Upload error:', e.response?.data);
        }
      }
      setFormOpen(false);
    } catch (err: any) {
      console.error('Report create error:', err.response?.data);
    }
  };

  const handleOpenEdit = (report: FinalReport) => {
    setEditReport(report);
    setEditTitle(report.title);
    setEditContent(report.content || '');
  };

  const handleEditSubmit = async () => {
    if (!editReport) return;
    await updateMutation.mutateAsync({ id: editReport.id, payload: { title: editTitle, content: editContent || null } });
    setEditReport(null);
  };

  const handleSetDeadline = async () => {
    if (!deadlineValue) return;
    await client.post('/deadlines', { type: 'final_report', deadline: deadlineValue });
    qc.invalidateQueries({ queryKey: ['deadline', 'final_report'] });
    setDeadlineOpen(false);
    setDeadlineReport(null);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses', icon: List },
    { value: 'draft', label: 'Draft', icon: FilePen },
    { value: 'submitted', label: 'Submitted', icon: Send },
    { value: 'approved', label: 'Approved', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">Final Reports</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Manage internship final reports.</p>
        </div>
        {isTutor ? (
          <div className="flex items-center gap-3">
            {deadlineDate && (
              <div className="flex items-center gap-2 px-3 py-[9px] rounded-[5px] border bg-[#eff6ff] border-[#bfdbfe] text-[#2563eb] text-[0.82rem] font-medium">
                <CalendarClock className="w-4 h-4" />
                Deadline: {formatDate(deadlineDate)}
              </div>
            )}
            <Button onClick={() => { setDeadlineReport(null); setDeadlineValue(deadlineDate || ''); setDeadlineOpen(true); }}>
              <CalendarClock className="h-4 w-4 mr-2" />
              {deadlineDate ? 'Edit Deadline' : 'Set Deadline'}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
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
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Report
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
              {new Date(deadlineDate) < new Date() ? 'Deadline Expired!' : 'Final Report Deadline'}
            </h2>
            <p className="text-[0.92rem] text-[#6b7280] mb-1">Your tutor has set a deadline for final reports</p>
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
            <Button onClick={() => { setDeadlineDismissed(true); localStorage.setItem('report_deadline_dismissed', 'true'); }} className="w-full py-[10px]">
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
            <div className="overflow-x-auto">
              <table className="w-full">
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
                  {data?.data.map((report) => (
                    <tr key={report.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{report.title}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{report.user?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem]">
                        {report.file_path ? (
                          <a href={report.file_path} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-[5px] px-[10px] py-[3px] text-[0.7rem] font-semibold bg-[#f0fdf4] border border-[#bbf7d0] text-[#22c55e] hover:bg-[#dcfce7] transition-colors">Download</a>
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
                        <Badge color={STATUS_COLORS[report.status] || 'gray'}>{STATUS_LABELS[report.status] || report.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewReport(report)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="View">
                            <Eye className="h-4 w-4" />
                          </button>
                          {isTutor && (
                            <button onClick={() => { setDeadlineReport(report); setDeadlineValue(deadlineDate || ''); setDeadlineOpen(true); }} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Set Deadline">
                              <CalendarClock className="h-4 w-4" />
                            </button>
                          )}
                          {report.status === 'draft' && !isTutor && (
                            <>
                              <button onClick={() => handleOpenEdit(report)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Edit">
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button onClick={() => submitMutation.mutate(report.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#059669] hover:bg-[#f0fdf4] transition-colors" title="Submit">
                                <Send className="h-4 w-4" />
                              </button>
                              <button onClick={() => { if (confirm('Delete this report?')) deleteMutation.mutate(report.id); }} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Delete">
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
                      <td colSpan={6} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No reports found.</td>
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

      {/* Edit Report Modal */}
      <Modal open={!!editReport} onClose={() => setEditReport(null)} title="Edit Report" size="lg">
        {editReport && (
          <div className="space-y-4">
            <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
            <div className="w-full">
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={5}
                className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
              />
            </div>

            <div>
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-2">Replace File</label>
              <label className="flex items-center gap-2 px-4 py-[9px] rounded-[5px] border border-[#e0e0e0] text-[0.82rem] font-medium text-[#374151] hover:bg-[#f5f5f7] transition-colors cursor-pointer w-fit">
                <Upload className="w-4 h-4 text-[#9ca3af]" />
                Choose New File
                <input type="file" className="hidden" accept=".pdf,.doc,.docx,.pptx,.zip" onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    await uploadMutation.mutateAsync({ id: editReport.id, file: e.target.files[0] });
                  }
                }} />
              </label>
              {editReport.file_path && (
                <p className="mt-2 text-[0.78rem] text-[#22c55e] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> File uploaded
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditReport(null)}>Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={!editTitle}>Update</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* View Report Modal */}
      <Modal open={!!viewReport} onClose={() => setViewReport(null)} title={viewReport?.title || 'Report Details'}>
        {viewReport && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge color={STATUS_COLORS[viewReport.status] || 'gray'}>{STATUS_LABELS[viewReport.status] || viewReport.status}</Badge>
              {deadlineDate && (
                <Badge color={new Date(deadlineDate) < new Date() ? 'red' : 'blue'}>
                  Deadline: {formatDate(deadlineDate)}
                </Badge>
              )}
            </div>

            {viewReport.user && (
              <div className="flex items-center gap-3 p-3 bg-[#f9fafb] rounded-[5px]">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.8rem] font-bold shrink-0">
                  {viewReport.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[0.85rem] font-medium text-[#374151]">{viewReport.user.name}</p>
                  <p className="text-[0.75rem] text-[#9ca3af]">{viewReport.user.email}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Content</p>
              <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{viewReport.content || 'No content yet.'}</p>
            </div>
            {viewReport.feedback && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">Feedback</p>
                <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{viewReport.feedback}</p>
              </div>
            )}
            {viewReport.file_path && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-1">File</p>
                <a href={viewReport.file_path} target="_blank" rel="noreferrer" className="text-[0.82rem] text-[#3a9fd4] hover:underline">Download File</a>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Set Deadline Modal (Tutor) */}
      <Modal open={deadlineOpen} onClose={() => { setDeadlineOpen(false); setDeadlineReport(null); }} title={deadlineDate ? 'Edit Deadline' : 'Set Deadline'}>
        <div className="space-y-4">
          {deadlineDate && (
            <div className="p-3 rounded-[5px] bg-[#eff6ff] border border-[#bfdbfe] text-[0.85rem] text-[#2563eb] flex items-center gap-2">
              <CalendarClock className="w-4 h-4 shrink-0" />
              Current deadline: <strong>{formatDate(deadlineDate)}</strong>
            </div>
          )}
          <DatePicker label="New Deadline Date" value={deadlineValue} onChange={setDeadlineValue} required />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setDeadlineOpen(false); setDeadlineReport(null); }}>Cancel</Button>
            <Button onClick={handleSetDeadline} disabled={!deadlineValue}>{deadlineDate ? 'Update Deadline' : 'Set Deadline'}</Button>
          </div>
        </div>
      </Modal>

      {!isTutor && (
        <ReportForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          loading={createMutation.isPending}
        />
      )}
    </div>
  );
}
