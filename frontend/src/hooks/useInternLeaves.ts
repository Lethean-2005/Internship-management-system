import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLeaves, createLeave, reviewLeave, deleteLeave } from '../api/internLeaves';
import type { LeaveFilters, LeavePayload, ReviewPayload } from '../api/internLeaves';

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['intern-leaves'] }),
  });
}

export function useReviewLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReviewPayload }) => reviewLeave(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['intern-leaves'] }),
  });
}

export function useDeleteLeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteLeave(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['intern-leaves'] }),
  });
}
