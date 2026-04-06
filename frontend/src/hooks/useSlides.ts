import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSlides, getSlide, createSlide, updateSlide, deleteSlide, submitSlide, reviewSlide, uploadSlideFile,
} from '../api/slides';
import type { SlideFilters, SlidePayload, ReviewPayload } from '../api/slides';
import { toast } from '../stores/toastStore';

export function useSlides(filters?: SlideFilters) {
  return useQuery({
    queryKey: ['slides', filters],
    queryFn: () => getSlides(filters),
  });
}

export function useSlide(id: number) {
  return useQuery({
    queryKey: ['slides', id],
    queryFn: () => getSlide(id),
    enabled: !!id,
  });
}

export function useCreateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SlidePayload) => createSlide(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slides'] }); toast.success('Slide created successfully!'); },
    onError: () => toast.error('Failed to create slide.'),
  });
}

export function useUpdateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<SlidePayload> }) => updateSlide(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slides'] }); toast.success('Slide updated successfully!'); },
    onError: () => toast.error('Failed to update slide.'),
  });
}

export function useDeleteSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSlide(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slides'] }); toast.success('Slide deleted successfully!'); },
    onError: () => toast.error('Failed to delete slide.'),
  });
}

export function useSubmitSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => submitSlide(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slides'] }); toast.success('Slide submitted successfully!'); },
    onError: () => toast.error('Failed to submit slide.'),
  });
}

export function useReviewSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReviewPayload }) => reviewSlide(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slides'] }); toast.success('Slide reviewed successfully!'); },
    onError: () => toast.error('Failed to review slide.'),
  });
}

export function useUploadSlideFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadSlideFile(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['slides'] }); toast.success('File uploaded successfully!'); },
    onError: () => toast.error('Failed to upload file.'),
  });
}
