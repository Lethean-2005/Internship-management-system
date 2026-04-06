import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeaves, createLeave, reviewLeave, deleteLeave } from '../api/internLeaves';
import type { LeaveFilters, LeavePayload, ReviewPayload } from '../api/internLeaves';
import { toast } from '../stores/toastStore';

export function useInternLeaves(filters?: LeaveFilters) {
  return useQuery({
    queryKey: ['intern-leaves', filters],
    queryFn: () => getLeaves(filters),
  });
}

export function useCreateLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeavePayload) => createLeave(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['intern-leaves'] }); toast.success('Leave request submitted successfully!'); },
    onError: () => toast.error('Failed to submit leave request.'),
  });
}

export function useReviewLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReviewPayload }) => reviewLeave(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['intern-leaves'] }); toast.success('Leave request reviewed successfully!'); },
    onError: () => toast.error('Failed to review leave request.'),
  });
}

export function useDeleteLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteLeave(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['intern-leaves'] }); toast.success('Leave request deleted successfully!'); },
    onError: () => toast.error('Failed to delete leave request.'),
  });
}
