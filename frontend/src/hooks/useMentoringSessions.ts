import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessions, getSession, createSession, updateSession, deleteSession,
  cancelSession, completeSession, addFeedback,
} from '../api/mentoringSessions';
import type { SessionFilters, SessionPayload, UpdateSessionPayload, CancelPayload, CompletePayload, FeedbackPayload } from '../api/mentoringSessions';
import { toast } from '../stores/toastStore';

export function useSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: ['mentoring-sessions', filters],
    queryFn: () => getSessions(filters),
  });
}

export function useSession(id: number) {
  return useQuery({
    queryKey: ['mentoring-sessions', id],
    queryFn: () => getSession(id),
    enabled: !!id,
  });
}

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SessionPayload) => createSession(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentoring-sessions'] }); toast.success('Session scheduled successfully!'); },
    onError: () => toast.error('Failed to schedule session.'),
  });
}

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSessionPayload }) => updateSession(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentoring-sessions'] }); toast.success('Session updated successfully!'); },
    onError: () => toast.error('Failed to update session.'),
  });
}

export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSession(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentoring-sessions'] }); toast.success('Session deleted successfully!'); },
    onError: () => toast.error('Failed to delete session.'),
  });
}

export function useCancelSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CancelPayload }) => cancelSession(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentoring-sessions'] }); toast.success('Session cancelled.'); },
    onError: () => toast.error('Failed to cancel session.'),
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CompletePayload }) => completeSession(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentoring-sessions'] }); toast.success('Session completed!'); },
    onError: () => toast.error('Failed to complete session.'),
  });
}

export function useAddFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FeedbackPayload }) => addFeedback(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentoring-sessions'] }); toast.success('Feedback submitted!'); },
    onError: () => toast.error('Failed to submit feedback.'),
  });
}
