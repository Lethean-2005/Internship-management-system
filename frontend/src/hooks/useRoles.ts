import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, createRole, updateRole, deleteRole } from '../api/roles';
import type { RolePayload } from '../api/roles';
import { toast } from '../stores/toastStore';

export function useRoles() {
  return useQuery({
    queryKey: ['roles'],
    queryFn: getRoles,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RolePayload) => createRole(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role created successfully!'); },
    onError: () => toast.error('Failed to create role.'),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<RolePayload> }) => updateRole(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role updated successfully!'); },
    onError: () => toast.error('Failed to update role.'),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteRole(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Role deleted successfully!'); },
    onError: () => toast.error('Failed to delete role.'),
  });
}
