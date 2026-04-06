import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInternships, getInternship, createInternship, updateInternship, deleteInternship,
  applyInternship, reviewApplication,
} from '../api/internships';
import type { InternshipFilters, InternshipPayload, ApplicationReviewPayload } from '../api/internships';
import { toast } from '../stores/toastStore';

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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['internships'] }); toast.success('Internship created successfully!'); },
    onError: () => toast.error('Failed to create internship.'),
  });
}

export function useUpdateInternship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<InternshipPayload> }) => updateInternship(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['internships'] }); toast.success('Internship updated successfully!'); },
    onError: () => toast.error('Failed to update internship.'),
  });
}

export function useDeleteInternship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInternship(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['internships'] }); toast.success('Internship deleted successfully!'); },
    onError: () => toast.error('Failed to delete internship.'),
  });
}

export function useApplyInternship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (internshipId: number) => applyInternship(internshipId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['internships'] }); toast.success('Application submitted successfully!'); },
    onError: () => toast.error('Failed to submit application.'),
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['internships'] }); toast.success('Application reviewed successfully!'); },
    onError: () => toast.error('Failed to review application.'),
  });
}
