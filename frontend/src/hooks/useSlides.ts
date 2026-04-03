import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSlides, getSlide, createSlide, updateSlide, deleteSlide, submitSlide, reviewSlide, uploadSlideFile,
} from '../api/slides';
import type { SlideFilters, SlidePayload, ReviewPayload } from '../api/slides';

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides'] }),
  });
}

export function useUpdateSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<SlidePayload> }) => updateSlide(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides'] }),
  });
}

export function useDeleteSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSlide(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides'] }),
  });
}

export function useSubmitSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => submitSlide(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides'] }),
  });
}

export function useReviewSlide() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReviewPayload }) => reviewSlide(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides'] }),
  });
}

export function useUploadSlideFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadSlideFile(id, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slides'] }),
  });
}
