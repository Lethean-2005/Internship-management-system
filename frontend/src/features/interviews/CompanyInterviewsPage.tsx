import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, List, Clock, CheckCircle, XCircle, ClipboardCheck, FileCheck, CalendarCheck, HelpCircle, GraduationCap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useInterviews, useCreateInterview, useUpdateInterview, useDeleteInterview, useUpdateResult } from '../../hooks/useInterviews';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { InterviewForm } from './InterviewForm';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDateTime } from '../../lib/formatDate';
import client from '../../api/client';
import type { CompanyInterview } from '../../types/ims';

export function CompanyInterviewsPage() {
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const isIntern = roleSlug === 'intern';

  const [status, setStatus] = useState('');
  const [generation, setGeneration] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editInterview, setEditInterview] = useState<CompanyInterview | null>(null);
  const [viewInterview, setViewInterview] = useState<CompanyInterview | null>(null);

  const { data: rawData, isLoading } = useInterviews({ page });

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

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this interview?')) {
      await deleteMutation.mutateAsync(id);
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
    setDetailsTutor('');
    setDetailsEmployment((interview as any).employment || 'internship');
    setDetailsOpen(true);
  };

  const handleDetailsSubmit = async () => {
    if (!detailsInterview || !user) return;
    // Update user profile
    await client.put('/me', {
      company_name: detailsCompany,
      position: detailsPosition,
      supervisor_name: detailsSupervisor,
      ...(detailsTutor ? { tutor_id: Number(detailsTutor) } : {}),
    });
    // Update interview employment agreement
    await updateMutation.mutateAsync({
      id: detailsInterview.id,
      payload: { employment: detailsEmployment },
    });
    setDetailsOpen(false);
    setDetailsInterview(null);
  };

  const currentYear = new Date().getFullYear();
  const generationOptions: { value: string; label: string; icon: typeof List }[] = [
    { value: '', label: 'All Generations', icon: List },
    ...Array.from({ length: currentYear - 2007 + 1 }, (_, i) => {
      const year = currentYear - i;
      return { value: String(year), label: `Generation ${year}`, icon: GraduationCap };
    }),
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses', icon: List },
    { value: 'scheduled', label: 'Scheduled', icon: Clock },
    { value: 'interviewed', label: 'Interviewed', icon: CalendarCheck },
    { value: 'wait_result', label: 'Wait Result', icon: HelpCircle },
    { value: 'passed', label: 'Passed', icon: CheckCircle },
    { value: 'failed', label: 'Failed', icon: XCircle },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">Company Interviews</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Manage interview schedules with companies.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {isIntern ? 'Schedule Interview' : 'Assign Interview'}
        </Button>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5] flex items-center gap-3">
          <FilterDropdown options={statusOptions} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />
          {!isIntern && (
            <FilterDropdown options={generationOptions} value={generation} onChange={(v) => { setGeneration(v); setPage(1); }} maxVisible={5} />
          )}
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
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Location</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Employment</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Result</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
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
                          <button
                            onClick={() => handleEdit(interview)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {(() => {
                            const m = String(interview.interview_date).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
                            const isPast = m ? new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]) <= new Date() : false;
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
                          {interview.result === 'passed' && isIntern && (
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
                      <td colSpan={9} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No interviews found.</td>
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

      {/* View Interview Modal */}
      <Modal open={!!viewInterview} onClose={() => setViewInterview(null)} title="Interview Details">
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
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">Interview Information</p>
              <div className="grid grid-cols-2 gap-3">
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
                      viewInterview.location.startsWith('http')
                        ? viewInterview.location
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(viewInterview.location)}`
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
      <Modal open={resultOpen} onClose={() => { setResultOpen(false); setResultInterview(null); }} title="Update Interview Result">
        <div className="space-y-4">
          <Select
            label="Result"
            options={[
              { value: '', label: 'Select Result' },
              { value: 'passed', label: 'Passed' },
              { value: 'failed', label: 'Failed' },
              { value: 'pending', label: 'Wait Result' },
            ]}
            value={resultValue}
            onChange={(e) => setResultValue(e.target.value)}
            required
          />
          <Input
            label="Feedback"
            value={resultFeedback}
            onChange={(e) => setResultFeedback(e.target.value)}
            placeholder="Optional feedback..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setResultOpen(false); setResultInterview(null); }}>Cancel</Button>
            <Button onClick={handleResultSubmit} loading={resultMutation.isPending} disabled={!resultValue}>Update Result</Button>
          </div>
        </div>
      </Modal>

      {/* Complete Internship Details Modal */}
      <Modal open={detailsOpen} onClose={() => { setDetailsOpen(false); setDetailsInterview(null); }} title="Complete Internship Details">
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
              label="Supervisor Name"
              type="text"
              value={detailsSupervisor}
              onChange={(e) => setDetailsSupervisor(e.target.value)}
              placeholder="e.g. Mr. John Doe"
            />

            <Select
              label="Tutor"
              options={[
                { value: '', label: 'Select a Tutor' },
                ...tutors.map((t) => ({ value: t.id, label: `${t.name}${t.department ? ` — ${t.department}` : ''}` })),
              ]}
              value={detailsTutor}
              onChange={(e) => setDetailsTutor(e.target.value)}
            />

            <Select
              label="Employment Agreement"
              options={[
                { value: 'internship', label: 'Internship' },
                { value: 'probation', label: 'Probation' },
                { value: 'staff', label: 'Staff' },
                { value: 'contract', label: 'Contract' },
              ]}
              value={detailsEmployment}
              onChange={(e) => setDetailsEmployment(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => { setDetailsOpen(false); setDetailsInterview(null); }}>Cancel</Button>
              <Button onClick={handleDetailsSubmit} disabled={!detailsCompany || !detailsPosition || !detailsEmployment}>Complete</Button>
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
    </div>
  );
}
