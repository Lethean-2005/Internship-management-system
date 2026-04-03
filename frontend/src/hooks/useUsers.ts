import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, getUser, createUser, updateUser, deleteUser, toggleActive } from '../api/users';
import type { UserFilters, UserPayload } from '../api/users';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserPayload) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserPayload> }) => updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useToggleActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleActive(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}
