import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useWorklog, useSubmitWorklog, useReviewWorklog } from '../../hooks/useWorklogs';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { STATUS_COLORS } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';

export function WorklogDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: worklog, isLoading } = useWorklog(Number(id));
  const submitMutation = useSubmitWorklog();
  const reviewMutation = useReviewWorklog();
  const [feedback, setFeedback] = useState('');

  if (isLoading) return <LoadingSpinner className="py-20" />;
  if (!worklog) return <p className="text-center py-12 text-[#9ca3af]">Worklog not found.</p>;

  const handleSubmit = async () => {
    await submitMutation.mutateAsync(worklog.id);
  };

  const handleReview = async (status: string) => {
    await reviewMutation.mutateAsync({ id: worklog.id, payload: { status, feedback: feedback || null } });
  };

  return (
    <div>
      <button onClick={() => navigate('/weekly-worklogs')} className="flex items-center gap-2 text-[0.85rem] text-[#6b7280] hover:text-[#48B6E8] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Worklogs
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">
            Week {worklog.week_number} Worklog
          </h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">
            {formatDate(worklog.start_date)} - {formatDate(worklog.end_date)}
          </p>
        </div>
        <Badge color={STATUS_COLORS[worklog.status] || 'gray'}>
          {worklog.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-[#f0f0f0] rounded-[5px] p-5">
            <h3 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-3">Tasks Completed</h3>
            <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{worklog.tasks_completed}</p>
          </div>

          {worklog.challenges && (
            <div className="bg-white border border-[#f0f0f0] rounded-[5px] p-5">
              <h3 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-3">Challenges</h3>
              <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{worklog.challenges}</p>
            </div>
          )}

          {worklog.plans_next_week && (
            <div className="bg-white border border-[#f0f0f0] rounded-[5px] p-5">
              <h3 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-3">Plans for Next Week</h3>
              <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{worklog.plans_next_week}</p>
            </div>
          )}

          {worklog.feedback && (
            <div className="bg-white border border-[#f0f0f0] rounded-[5px] p-5">
              <h3 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-3">Reviewer Feedback</h3>
              <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{worklog.feedback}</p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-white border border-[#f0f0f0] rounded-[5px] p-5">
            <h3 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-3">Details</h3>
            <div className="space-y-3 text-[0.82rem]">
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Intern</span>
                <span className="text-[#374151] font-medium">{worklog.user?.name || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Hours Worked</span>
                <span className="text-[#374151] font-medium">{worklog.hours_worked}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6b7280]">Internship</span>
                <span className="text-[#374151] font-medium">{worklog.internship?.title || '-'}</span>
              </div>
              {worklog.submitted_at && (
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Submitted</span>
                  <span className="text-[#374151] font-medium">{formatDate(worklog.submitted_at)}</span>
                </div>
              )}
              {worklog.reviewer && (
                <div className="flex justify-between">
                  <span className="text-[#6b7280]">Reviewed by</span>
                  <span className="text-[#374151] font-medium">{worklog.reviewer.name}</span>
                </div>
              )}
            </div>
          </div>

          {worklog.status === 'draft' && (
            <Button onClick={handleSubmit} loading={submitMutation.isPending} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Submit Worklog
            </Button>
          )}

          {worklog.status === 'submitted' && (
            <div className="bg-white border border-[#f0f0f0] rounded-[5px] p-5">
              <h3 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-3">Review</h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Feedback (optional)"
                rows={3}
                className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] mb-3 transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
              />
              <div className="flex gap-2">
                <Button onClick={() => handleReview('approved')} loading={reviewMutation.isPending} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button variant="danger" onClick={() => handleReview('rejected')} loading={reviewMutation.isPending} className="flex-1">
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
