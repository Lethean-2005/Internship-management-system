import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompanies, getCompany, createCompany, updateCompany, deleteCompany } from '../api/companies';
import type { CompanyFilters, CompanyPayload } from '../api/companies';
import { toast } from '../stores/toastStore';

export function useCompanies(filters?: CompanyFilters) {
  return useQuery({
    queryKey: ['companies', filters],
    queryFn: () => getCompanies(filters),
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: ['companies', id],
    queryFn: () => getCompany(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CompanyPayload) => createCompany(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companies'] }); toast.success('Company created successfully!'); },
    onError: () => toast.error('Failed to create company.'),
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CompanyPayload> }) => updateCompany(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companies'] }); toast.success('Company updated successfully!'); },
    onError: () => toast.error('Failed to update company.'),
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCompany(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['companies'] }); toast.success('Company deleted successfully!'); },
    onError: () => toast.error('Failed to delete company.'),
  });
}
