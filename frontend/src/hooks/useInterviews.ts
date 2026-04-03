import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInterviews, getInterview, createInterview, updateInterview, deleteInterview, updateResult,
} from '../api/interviews';
import type { InterviewFilters, InterviewPayload, ResultPayload } from '../api/interviews';

export function useInterviews(filters?: InterviewFilters) {
  return useQuery({
    queryKey: ['interviews', filters],
    queryFn: () => getInterviews(filters),
  });
}

export function useInterview(id: number) {
  return useQuery({
    queryKey: ['interviews', id],
    queryFn: () => getInterview(id),
    enabled: !!id,
  });
}

export function useCreateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InterviewPayload) => createInterview(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  });
}

export function useUpdateInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<InterviewPayload> }) => updateInterview(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  });
}

export function useDeleteInterview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInterview(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  });
}

export function useUpdateResult() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ResultPayload }) => updateResult(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interviews'] }),
  });
}
