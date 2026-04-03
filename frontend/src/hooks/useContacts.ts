import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContacts, getContact, createContact, replyContact } from '../api/contacts';
import type { ContactFilters, ContactPayload, ReplyPayload } from '../api/contacts';

export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: ['contacts', filters],
    queryFn: () => getContacts(filters),
  });
}

export function useContact(id: number) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => getContact(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContactPayload) => createContact(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useReplyContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReplyPayload }) => replyContact(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}
