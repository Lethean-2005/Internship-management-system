import { useState } from 'react';
import { Plus, Eye, Send, Upload, Trash2, List, FilePen, CheckCircle, XCircle } from 'lucide-react';
import { useReports, useCreateReport, useDeleteReport, useSubmitReport, useUploadReportFile } from '../../hooks/useReports';
import { useInternships } from '../../hooks/useInternships';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ReportForm } from './ReportForm';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';
import type { FinalReport } from '../../types/ims';

export function FinalReportsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [viewReport, setViewReport] = useState<FinalReport | null>(null);

  const { data, isLoading } = useReports({ status: status || undefined, page });
  const { data: internshipsData } = useInternships();
  const createMutation = useCreateReport();
  const deleteMutation = useDeleteReport();
  const submitMutation = useSubmitReport();
  const uploadMutation = useUploadReportFile();

  const handleFormSubmit = async (formData: { internship_id: number; title: string; content?: string | null }) => {
    await createMutation.mutateAsync(formData);
    setFormOpen(false);
  };

  const handleFileUpload = async (reportId: number, file: File) => {
    await uploadMutation.mutateAsync({ id: reportId, file });
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
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

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
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Internship</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Grade</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Submitted</th>
                    <th className="text-right px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((report) => (
                    <tr key={report.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{report.title}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{report.user?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{report.internship?.title || '-'}</td>
                      <td className="px-5 py-3">
                        <Badge color={STATUS_COLORS[report.status] || 'gray'}>{STATUS_LABELS[report.status] || report.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{report.grade || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{report.submitted_at ? formatDate(report.submitted_at) : '-'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewReport(report)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          {report.status === 'draft' && (
                            <>
                              <button
                                onClick={() => submitMutation.mutate(report.id)}
                                className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#059669] hover:bg-[#f0fdf4] transition-colors"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                              <label className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors cursor-pointer">
                                <Upload className="h-4 w-4" />
                                <input type="file" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(report.id, e.target.files[0]); }} />
                              </label>
                              <button onClick={() => deleteMutation.mutate(report.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors">
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
                      <td colSpan={7} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No reports found.</td>
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

      {/* View Report Modal */}
      <Modal open={!!viewReport} onClose={() => setViewReport(null)} title={viewReport?.title || 'Report Details'}>
        {viewReport && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge color={STATUS_COLORS[viewReport.status] || 'gray'}>{STATUS_LABELS[viewReport.status] || viewReport.status}</Badge>
              {viewReport.grade && <Badge color="purple">Grade: {viewReport.grade}</Badge>}
            </div>
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

      <ReportForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        internships={internshipsData?.data || []}
        loading={createMutation.isPending}
      />
    </div>
  );
}
