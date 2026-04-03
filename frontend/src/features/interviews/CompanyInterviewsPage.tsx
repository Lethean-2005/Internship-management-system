import { useState } from 'react';
import { Plus, Pencil, Trash2, List, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useInterviews, useCreateInterview, useDeleteInterview } from '../../hooks/useInterviews';
import { useUsers } from '../../hooks/useUsers';
import { useCompanies } from '../../hooks/useCompanies';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { InterviewForm } from './InterviewForm';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDateTime } from '../../lib/formatDate';

export function CompanyInterviewsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);

  const { data, isLoading } = useInterviews({ status: status || undefined, page });
  const { data: usersData } = useUsers();
  const { data: companiesData } = useCompanies();
  const createMutation = useCreateInterview();
  const deleteMutation = useDeleteInterview();

  const handleFormSubmit = async (formData: {
    user_id: number;
    company_id: number;
    interview_date: string;
    location?: string | null;
    type: string;
    notes?: string | null;
  }) => {
    await createMutation.mutateAsync(formData);
    setFormOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this interview?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses', icon: List },
    { value: 'scheduled', label: 'Scheduled', icon: Clock },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', icon: XCircle },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">Company Interviews</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Manage interview schedules with companies.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
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
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Company</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Intern</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Result</th>
                    <th className="text-right px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((interview) => (
                    <tr key={interview.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{interview.company?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{interview.user?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{formatDateTime(interview.interview_date)}</td>
                      <td className="px-5 py-3">
                        <Badge color={STATUS_COLORS[interview.type] || 'gray'}>{STATUS_LABELS[interview.type] || interview.type}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <Badge color={STATUS_COLORS[interview.status] || 'gray'}>{STATUS_LABELS[interview.status] || interview.status}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        {interview.result ? (
                          <Badge color={STATUS_COLORS[interview.result] || 'gray'}>{STATUS_LABELS[interview.result] || interview.result}</Badge>
                        ) : (
                          <span className="text-[0.82rem] text-[#9ca3af]">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(interview.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No interviews found.</td>
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

      <InterviewForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        users={usersData?.data || []}
        companies={companiesData?.data || []}
        loading={createMutation.isPending}
      />
    </div>
  );
}
