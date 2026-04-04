import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobPostings, getJobPosting, createJobPosting, updateJobPosting, deleteJobPosting } from '../api/jobPostings';
import type { JobPostingFilters, JobPostingPayload } from '../api/jobPostings';

export function useJobPostings(filters?: JobPostingFilters) {
  return useQuery({
    queryKey: ['job-postings', filters],
    queryFn: () => getJobPostings(filters),
  });
}

export function useJobPosting(id: number) {
  return useQuery({
    queryKey: ['job-postings', id],
    queryFn: () => getJobPosting(id),
    enabled: !!id,
  });
}

export function useCreateJobPosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: JobPostingPayload) => createJobPosting(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-postings'] }),
  });
}

export function useUpdateJobPosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<JobPostingPayload> }) => updateJobPosting(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-postings'] }),
  });
}

export function useDeleteJobPosting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteJobPosting(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['job-postings'] }),
  });
}
