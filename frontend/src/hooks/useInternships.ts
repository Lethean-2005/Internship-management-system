import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInternships, getInternship, createInternship, updateInternship, deleteInternship,
  applyInternship, reviewApplication,
} from '../api/internships';
import type { InternshipFilters, InternshipPayload, ApplicationReviewPayload } from '../api/internships';

export function useInternships(filters?: InternshipFilters) {
  return useQuery({
    queryKey: ['internships', filters],
    queryFn: () => getInternships(filters),
  });
}

export function useInternship(id: number) {
  return useQuery({
    queryKey: ['internships', id],
    queryFn: () => getInternship(id),
    enabled: !!id,
  });
}

export function useCreateInternship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InternshipPayload) => createInternship(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships'] }),
  });
}

export function useUpdateInternship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<InternshipPayload> }) => updateInternship(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships'] }),
  });
}

export function useDeleteInternship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInternship(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships'] }),
  });
}

export function useApplyInternship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (internshipId: number) => applyInternship(internshipId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships'] }),
  });
}

export function useReviewApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      internshipId,
      applicationId,
      payload,
    }: {
      internshipId: number;
      applicationId: number;
      payload: ApplicationReviewPayload;
    }) => reviewApplication(internshipId, applicationId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['internships'] }),
  });
}
