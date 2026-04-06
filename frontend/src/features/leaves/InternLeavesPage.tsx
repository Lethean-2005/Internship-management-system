import { useState } from 'react';
import { CalendarOff, Plus, Trash2, CheckCircle, XCircle, List, Clock, AlertTriangle, Heart, HelpCircle } from 'lucide-react';
import { useInternLeaves, useCreateLeave, useReviewLeave, useDeleteLeave } from '../../hooks/useInternLeaves';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Select } from '../../components/ui/Select';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { DatePicker } from '../../components/ui/DatePicker';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { InternLeave } from '../../types/ims';

const statusFilterOptions = [
  { value: '', label: 'All Status', icon: List },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'approved', label: 'Approved', icon: CheckCircle },
  { value: 'rejected', label: 'Rejected', icon: XCircle },
];

const STATUS_COLOR: Record<string, string> = {
  pending: 'warning',
  approved: 'green',
  rejected: 'red',
};

const TYPE_LABELS: Record<string, string> = {
  personal: 'Personal',
  sick: 'Sick Leave',
  emergency: 'Emergency',
  other: 'Other',
};

const TYPE_ICONS: Record<string, typeof CalendarOff> = {
  personal: CalendarOff,
  sick: Heart,
  emergency: AlertTriangle,
  other: HelpCircle,
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function dayCount(start: string, end: string) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

export default function InternLeavesPage() {
  const { user } = useAuthStore();
  const isIntern = user?.role?.slug === 'intern';
  const canReview = ['admin', 'tutor', 'supervisor'].includes(user?.role?.slug || '');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [reviewLeave, setReviewLeave] = useState<InternLeave | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewNote, setReviewNote] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useInternLeaves({ status: statusFilter || undefined, page });
  const createMutation = useCreateLeave();
  const reviewMutation = useReviewLeave();
  const deleteMutation = useDeleteLeave();

  const handleDelete = (id: number) => setDeleteId(id);

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleReview = () => {
    if (!reviewLeave) return;
    reviewMutation.mutate(
      { id: reviewLeave.id, payload: { status: reviewStatus, review_note: reviewNote || null } },
      { onSuccess: () => { setReviewLeave(null); setReviewNote(''); } }
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">Take Leave</h1>
        <p className="mt-1 text-[0.88rem] text-[#6b7280]">
          {isIntern ? 'Request leave during your internship.' : 'Review intern leave requests.'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <FilterDropdown options={statusFilterOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
        {isIntern && (
          <Button onClick={() => setShowForm(true)} className="ml-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Request Leave
          </Button>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data?.length ? (
        <EmptyState icon={<CalendarOff className="w-10 h-10" />} title="No leave requests" description={isIntern ? 'You haven\'t requested any leave yet.' : 'No leave requests to review.'} />
      ) : (
        <>
          {/* Mobile card view */}
          <div className="md:hidden space-y-3 p-4">
            {data.data.map((leave) => {
              const TypeIcon = TYPE_ICONS[leave.type] || CalendarOff;
              return (
                <div key={leave.id} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 space-y-2 relative">
                  <div className="flex items-start justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[0.82rem] font-medium text-[#374151]">
                      <TypeIcon className="w-3.5 h-3.5 text-[#6b7280]" />
                      {TYPE_LABELS[leave.type] || leave.type}
                    </span>
                    <div className="flex items-center gap-1">
                      {canReview && leave.status === 'pending' && (
                        <>
                          <button onClick={() => { setReviewLeave(leave); setReviewStatus('approved'); setReviewNote(''); }} className="p-1.5 rounded-[5px] hover:bg-green-50 text-[#9ca3af] hover:text-green-600 transition-colors" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                          <button onClick={() => { setReviewLeave(leave); setReviewStatus('rejected'); setReviewNote(''); }} className="p-1.5 rounded-[5px] hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                      {isIntern && leave.status === 'pending' && (
                        <button onClick={() => handleDelete(leave.id)} className="p-1.5 rounded-[5px] hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                  {!isIntern && (
                    <div className="flex items-start"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Intern</span><div><p className="text-[0.82rem] text-[#374151] font-medium">{leave.user?.name}</p>{leave.user?.company_name && <p className="text-[0.75rem] text-[#9ca3af]">{leave.user.company_name}</p>}</div></div>
                  )}
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Period</span><span className="text-[0.82rem] text-[#374151] font-medium">{formatDate(leave.start_date)} — {formatDate(leave.end_date)}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Days</span><span className="text-[0.82rem] text-[#374151] font-medium">{dayCount(leave.start_date, leave.end_date)}</span></div>
                  <div className="flex items-start"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Reason</span><div><p className="text-[0.82rem] text-[#374151] font-medium">{leave.reason}</p>{leave.review_note && <p className="text-[0.75rem] text-[#9ca3af] mt-0.5">Note: {leave.review_note}</p>}</div></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Status</span><Badge color={STATUS_COLOR[leave.status] || 'gray'}>{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</Badge></div>
                  {leave.reviewer && (
                    <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Reviewed by</span><span className="text-[0.82rem] text-[#374151] font-medium">{leave.reviewer.name}</span></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#fafafa]">
                  {!isIntern && <th className="text-left px-4 py-3 text-[0.78rem] font-semibold text-[#6b7280]">Intern</th>}
                  <th className="text-left px-4 py-3 text-[0.78rem] font-semibold text-[#6b7280]">Type</th>
                  <th className="text-left px-4 py-3 text-[0.78rem] font-semibold text-[#6b7280]">Period</th>
                  <th className="text-left px-4 py-3 text-[0.78rem] font-semibold text-[#6b7280]">Days</th>
                  <th className="text-left px-4 py-3 text-[0.78rem] font-semibold text-[#6b7280]">Reason</th>
                  <th className="text-left px-4 py-3 text-[0.78rem] font-semibold text-[#6b7280]">Status</th>
                  <th className="text-left px-4 py-3 text-[0.78rem] font-semibold text-[#6b7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((leave) => {
                  const TypeIcon = TYPE_ICONS[leave.type] || CalendarOff;
                  return (
                    <tr key={leave.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                      {!isIntern && (
                        <td className="px-4 py-3">
                          <p className="text-[0.85rem] font-medium text-[#111827]">{leave.user?.name}</p>
                          <p className="text-[0.75rem] text-[#9ca3af]">{leave.user?.company_name || ''}</p>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[0.82rem] text-[#374151]">
                          <TypeIcon className="w-3.5 h-3.5 text-[#6b7280]" />
                          {TYPE_LABELS[leave.type] || leave.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[0.82rem] text-[#374151]">
                        {formatDate(leave.start_date)} — {formatDate(leave.end_date)}
                      </td>
                      <td className="px-4 py-3 text-[0.82rem] text-[#374151] font-medium">
                        {dayCount(leave.start_date, leave.end_date)}
                      </td>
                      <td className="px-4 py-3 text-[0.82rem] text-[#374151] max-w-[200px]">
                        <p className="truncate" title={leave.reason}>{leave.reason}</p>
                        {leave.review_note && (
                          <p className="text-[0.75rem] text-[#9ca3af] mt-0.5 truncate" title={leave.review_note}>Note: {leave.review_note}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge color={STATUS_COLOR[leave.status] || 'gray'}>
                          {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {canReview && leave.status === 'pending' && (
                            <>
                              <button onClick={() => { setReviewLeave(leave); setReviewStatus('approved'); setReviewNote(''); }} className="p-1.5 rounded-[5px] hover:bg-green-50 text-[#9ca3af] hover:text-green-600 transition-colors" title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setReviewLeave(leave); setReviewStatus('rejected'); setReviewNote(''); }} className="p-1.5 rounded-[5px] hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isIntern && leave.status === 'pending' && (
                            <button onClick={() => handleDelete(leave.id)} className="p-1.5 rounded-[5px] hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {leave.reviewer && (
                            <span className="text-[0.72rem] text-[#9ca3af]">by {leave.reviewer.name}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {data.meta && data.meta.last_page > 1 && (
            <div className="mt-6">
              <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Create Leave Modal */}
      {showForm && (
        <LeaveFormModal
          onClose={() => setShowForm(false)}
          onSubmit={(payload) => {
            createMutation.mutate(payload, { onSuccess: () => setShowForm(false) });
          }}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Review Modal */}
      {reviewLeave && (
        <Modal open={true} onClose={() => setReviewLeave(null)} title={`${reviewStatus === 'approved' ? 'Approve' : 'Reject'} Leave Request`}>
          <div className="space-y-4">
            <div className={`p-3 rounded-[5px] text-[0.85rem] ${reviewStatus === 'approved' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {reviewStatus === 'approved' ? 'Approve' : 'Reject'} leave for <strong>{reviewLeave.user?.name}</strong>
              <br />
              {formatDate(reviewLeave.start_date)} — {formatDate(reviewLeave.end_date)} ({dayCount(reviewLeave.start_date, reviewLeave.end_date)} days)
              <br />
              Reason: {reviewLeave.reason}
            </div>

            <div>
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Note (optional)</label>
              <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder="Add a note..." />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setReviewLeave(null)}>Cancel</Button>
              <Button onClick={handleReview} disabled={reviewMutation.isPending}>
                {reviewMutation.isPending ? 'Saving...' : reviewStatus === 'approved' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        message="Are you sure you want to delete this leave request? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

// Leave Form Modal
function LeaveFormModal({ onClose, onSubmit, isLoading }: {
  onClose: () => void;
  onSubmit: (payload: { type: string; start_date: string; end_date: string; reason: string }) => void;
  isLoading: boolean;
}) {
  const [type, setType] = useState('personal');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ type, start_date: startDate, end_date: endDate, reason });
  };

  return (
    <Modal open={true} onClose={onClose} title="Request Leave">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Leave Type" value={type} onChange={(e) => setType(e.target.value)} options={[
          { value: 'personal', label: 'Personal' },
          { value: 'sick', label: 'Sick Leave' },
          { value: 'emergency', label: 'Emergency' },
          { value: 'other', label: 'Other' },
        ]} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker label="Start Date" value={startDate} onChange={setStartDate} required placeholder="Choose start date" />
          <DatePicker label="End Date" value={endDate} onChange={setEndDate} required placeholder="Choose end date" />
        </div>

        {startDate && endDate && (
          <p className="text-[0.82rem] text-[#6b7280]">
            Duration: <strong>{dayCount(startDate, endDate)} day{dayCount(startDate, endDate) !== 1 ? 's' : ''}</strong>
          </p>
        )}

        <div>
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Reason *</label>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder="Please provide a reason for your leave..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading || !startDate || !endDate || !reason}>
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
