import { useState } from 'react';
import { Plus, Mail, MailOpen, Reply } from 'lucide-react';
import { useContacts, useCreateContact, useReplyContact } from '../../hooks/useContacts';
import { useUsers } from '../../hooks/useUsers';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ContactForm } from './ContactForm';
import { formatDateTime } from '../../lib/formatDate';
import type { SupervisorContact } from '../../types/ims';

export function ContactSupervisorPage() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [viewContact, setViewContact] = useState<SupervisorContact | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = useContacts({ page });
  const { data: usersData } = useUsers();
  const createMutation = useCreateContact();
  const replyMutation = useReplyContact();

  const handleFormSubmit = async (formData: { supervisor_id: number; subject: string; message: string }) => {
    await createMutation.mutateAsync(formData);
    setFormOpen(false);
  };

  const handleReply = async () => {
    if (!viewContact || !replyText.trim()) return;
    await replyMutation.mutateAsync({ id: viewContact.id, payload: { reply: replyText } });
    setReplyText('');
    setViewContact(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">Contact Supervisor</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Messages between interns and supervisors.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
            <div className="divide-y divide-[#f5f5f5]">
              {data?.data.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => setViewContact(contact)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                >
                  <div className="shrink-0">
                    {contact.is_read ? (
                      <MailOpen className="h-5 w-5 text-[#9ca3af]" />
                    ) : (
                      <Mail className="h-5 w-5 text-[#3a9fd4]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[0.85rem] font-medium truncate ${contact.is_read ? 'text-[#374151]' : 'text-[#1e1b4b] font-semibold'}`}>
                        {contact.subject}
                      </span>
                      {!contact.is_read && <Badge color="blue">New</Badge>}
                      {contact.reply && <Badge color="green">Replied</Badge>}
                    </div>
                    <p className="text-[0.78rem] text-[#6b7280] truncate">
                      From: {contact.user?.name || '-'} &middot; To: {contact.supervisor?.name || '-'}
                    </p>
                  </div>
                  <span className="text-[0.72rem] text-[#9ca3af] shrink-0">
                    {formatDateTime(contact.created_at)}
                  </span>
                </button>
              ))}
              {data?.data.length === 0 && (
                <p className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No messages found.</p>
              )}
            </div>

            {data?.meta && data.meta.last_page > 1 && (
              <div className="p-4 border-t border-[#f5f5f5]">
                <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* View message modal */}
      <Modal open={!!viewContact} onClose={() => { setViewContact(null); setReplyText(''); }} title={viewContact?.subject || 'Message'}>
        {viewContact && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[0.82rem] text-[#6b7280]">
              <span>From: <strong className="text-[#374151]">{viewContact.user?.name}</strong></span>
              <span>&middot;</span>
              <span>To: <strong className="text-[#374151]">{viewContact.supervisor?.name}</strong></span>
            </div>
            <div className="bg-[#fafafa] rounded-[5px] p-4">
              <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{viewContact.message}</p>
            </div>

            {viewContact.reply && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-2">Reply</p>
                <div className="bg-[#f0fdf4] rounded-[5px] p-4">
                  <p className="text-[0.82rem] text-[#374151] whitespace-pre-wrap">{viewContact.reply}</p>
                  {viewContact.replied_at && (
                    <p className="text-[0.72rem] text-[#9ca3af] mt-2">{formatDateTime(viewContact.replied_at)}</p>
                  )}
                </div>
              </div>
            )}

            {!viewContact.reply && (
              <div>
                <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-2">Reply</p>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Type your reply..."
                  className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)] mb-3"
                />
                <Button onClick={handleReply} loading={replyMutation.isPending} disabled={!replyText.trim()}>
                  <Reply className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ContactForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        supervisors={usersData?.data || []}
        loading={createMutation.isPending}
      />
    </div>
  );
}
