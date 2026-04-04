import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, List, FilePen, Send, CheckCircle, XCircle } from 'lucide-react';
import { useWorklogs, useCreateWorklog } from '../../hooks/useWorklogs';
import { useInternships } from '../../hooks/useInternships';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { WorklogForm } from './WorklogForm';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';

const statusOptions = [
  { value: '', label: 'All Statuses', icon: List },
  { value: 'draft', label: 'Draft', icon: FilePen },
  { value: 'submitted', label: 'Submitted', icon: Send },
  { value: 'approved', label: 'Approved', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', icon: XCircle },
];

export function WeeklyWorklogsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isTutor = user?.role?.slug === 'tutor';
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useWorklogs({ status: status || undefined, page });
  const { data: internshipsData } = useInternships();
  const createMutation = useCreateWorklog();

  const handleFormSubmit = async (formData: {
    internship_id: number;
    week_number: number;
    start_date: string;
    end_date: string;
    tasks_completed: string;
    challenges?: string | null;
    plans_next_week?: string | null;
    hours_worked: number;
  }) => {
    await createMutation.mutateAsync(formData);
    setFormOpen(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">Weekly Worklogs</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Track weekly internship progress and tasks.</p>
        </div>
        {!isTutor && (
          <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Worklog
          </Button>
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
            {/* Mobile card view */}
            <div className="md:hidden space-y-3 p-4">
              {data?.data.map((wl) => (
                <div key={wl.id} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 space-y-2 relative">
                  <div className="flex items-start justify-between">
                    <span className="text-[0.82rem] font-medium text-[#374151]">Week {wl.week_number}</span>
                    <button onClick={() => navigate(`/weekly-worklogs/${wl.id}`)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"><Eye className="h-4 w-4" /></button>
                  </div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Date Range</span><span className="text-[0.82rem] text-[#374151] font-medium">{formatDate(wl.start_date)} - {formatDate(wl.end_date)}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Intern</span><span className="text-[0.82rem] text-[#374151] font-medium">{wl.user?.name || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Hours</span><span className="text-[0.82rem] text-[#374151] font-medium">{wl.hours_worked}h</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Status</span><Badge color={STATUS_COLORS[wl.status] || 'gray'}>{STATUS_LABELS[wl.status] || wl.status}</Badge></div>
                </div>
              ))}
              {data?.data.length === 0 && (
                <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No worklogs found.</div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-[#fafafa]">
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Week #</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Date Range</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Intern</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Hours</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                    <th className="text-right px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((wl) => (
                    <tr key={wl.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">Week {wl.week_number}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{formatDate(wl.start_date)} - {formatDate(wl.end_date)}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{wl.user?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{wl.hours_worked}h</td>
                      <td className="px-5 py-3">
                        <Badge color={STATUS_COLORS[wl.status] || 'gray'}>{STATUS_LABELS[wl.status] || wl.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            onClick={() => navigate(`/weekly-worklogs/${wl.id}`)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No worklogs found.</td>
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

      <WorklogForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        internships={internshipsData?.data || []}
        loading={createMutation.isPending}
      />
    </div>
  );
}
