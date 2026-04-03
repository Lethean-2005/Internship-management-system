import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWorklogs, getWorklog, createWorklog, updateWorklog, deleteWorklog, submitWorklog, reviewWorklog,
} from '../api/worklogs';
import type { WorklogFilters, WorklogPayload, ReviewPayload } from '../api/worklogs';

export function useWorklogs(filters?: WorklogFilters) {
  return useQuery({
    queryKey: ['worklogs', filters],
    queryFn: () => getWorklogs(filters),
  });
}

export function useWorklog(id: number) {
  return useQuery({
    queryKey: ['worklogs', id],
    queryFn: () => getWorklog(id),
    enabled: !!id,
  });
}

export function useCreateWorklog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WorklogPayload) => createWorklog(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worklogs'] }),
  });
}

export function useUpdateWorklog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<WorklogPayload> }) => updateWorklog(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worklogs'] }),
  });
}

export function useDeleteWorklog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteWorklog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worklogs'] }),
  });
}

export function useSubmitWorklog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => submitWorklog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worklogs'] }),
  });
}

export function useReviewWorklog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReviewPayload }) => reviewWorklog(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['worklogs'] }),
  });
}
