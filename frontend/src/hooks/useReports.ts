import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getReports, getReport, createReport, updateReport, deleteReport, submitReport, reviewReport, uploadReportFile,
} from '../api/reports';
import type { ReportFilters, ReportPayload, ReviewPayload } from '../api/reports';
import { toast } from '../stores/toastStore';

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => getReports(filters),
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: ['reports', id],
    queryFn: () => getReport(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReportPayload) => createReport(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report created successfully!'); },
    onError: () => toast.error('Failed to create report.'),
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<ReportPayload> }) => updateReport(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report updated successfully!'); },
    onError: () => toast.error('Failed to update report.'),
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReport(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report deleted successfully!'); },
    onError: () => toast.error('Failed to delete report.'),
  });
}

export function useSubmitReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => submitReport(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report submitted successfully!'); },
    onError: () => toast.error('Failed to submit report.'),
  });
}

export function useReviewReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReviewPayload }) => reviewReport(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('Report reviewed successfully!'); },
    onError: () => toast.error('Failed to review report.'),
  });
}

export function useUploadReportFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => uploadReportFile(id, file),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reports'] }); toast.success('File uploaded successfully!'); },
    onError: () => toast.error('Failed to upload file.'),
  });
}
