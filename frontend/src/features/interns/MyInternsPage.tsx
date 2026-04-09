import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Search, UserPlus, X } from 'lucide-react';
import { Pagination } from '../../components/ui/Pagination';
import { getDefaultPerPage } from '../../lib/perPage';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { UserAvatar } from '../../components/ui/UserAvatar';
import client from '../../api/client';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDateTime } from '../../lib/formatDate';
import { toast } from '../../stores/toastStore';
import type { User } from '../../types/auth';
import type { PaginatedResponse } from '../../types/api';

export function MyInternsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [viewIntern, setViewIntern] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [chooseSearch, setChooseSearch] = useState('');
  const [chooseDropdownOpen, setChooseDropdownOpen] = useState(false);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(getDefaultPerPage());

  const { data, isLoading } = useQuery({
    queryKey: ['my-interns', page, perPage],
    queryFn: () => client.get<PaginatedResponse<User>>('/my-interns', { params: { page, per_page: perPage } }).then((r) => r.data),
  });

  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ['intern-interviews', viewIntern?.id],
    queryFn: () => client.get(`/my-interns/${viewIntern.id}/interviews`).then((r: any) => r.data.data),
    enabled: !!viewIntern,
  });

  // Fetch all interns for choose
  const { data: allInterns } = useQuery({
    queryKey: ['all-interns'],
    queryFn: () => client.get('/interns-list').then((r: any) => r.data),
  });

  const chooseMutation = useMutation({
    mutationFn: (userId: number) => client.post('/my-interns/choose', { user_id: userId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-interns'] }); qc.invalidateQueries({ queryKey: ['all-interns'] }); toast.success('Intern assigned successfully!'); setChooseDropdownOpen(false); setChooseSearch(''); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to assign intern.'),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => client.delete(`/my-interns/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-interns'] }); toast.success('Intern removed.'); setRemoveId(null); },
    onError: () => toast.error('Failed to remove intern.'),
  });

  const filteredData = data?.data.filter((intern: any) =>
    intern.name.toLowerCase().includes(search.toLowerCase()) ||
    intern.email.toLowerCase().includes(search.toLowerCase())
  );

  // Show max 3 results, filter when searching
  const availableInterns = (allInterns?.data || []).filter((i: any) =>
    !chooseSearch.trim() || i.name.toLowerCase().includes(chooseSearch.toLowerCase()) || i.email.toLowerCase().includes(chooseSearch.toLowerCase())
  ).slice(0, 3);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">{t('myInterns.title')}</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">{t('myInterns.subtitle')}</p>
        </div>
        <Button onClick={() => setChooseDropdownOpen(true)} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" /> {t('myInterns.chooseIntern')}
        </Button>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5]">
          <div className="relative max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('myInterns.searchIntern')}
              className="block w-full rounded-[5px] border border-[#e0e0e0] pl-10 pr-[14px] py-[9px] text-[0.82rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
          {/* Mobile card view */}
          <div className="md:hidden space-y-3 p-4">
            {filteredData?.map((intern: any) => (
              <div key={intern.id} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 space-y-2 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <UserAvatar name={intern.name} avatar={(intern as any).avatar} size="sm" />
                    <span className="text-[0.82rem] font-medium text-[#374151]">{intern.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewIntern(intern)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"><Eye className="h-4 w-4" /></button>
                    <button onClick={() => setRemoveId(intern.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Remove"><X className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Email</span><span className="text-[0.82rem] text-[#374151] font-medium">{intern.email}</span></div>
                <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Company</span><span className="text-[0.82rem] text-[#374151] font-medium">{intern.company_name || '-'}</span></div>
                <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Position</span><span className="text-[0.82rem] text-[#374151] font-medium">{intern.position || '-'}</span></div>
                <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Generation</span><span className="text-[0.82rem] text-[#374151] font-medium">{intern.generation || '-'}</span></div>
              </div>
            ))}
            {filteredData?.length === 0 && (
              <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">{search ? 'No interns match your search.' : 'No interns assigned to you yet.'}</div>
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-[#fafafa]">
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Name</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Email</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Company</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Position</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Generation</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((intern: any) => (
                  <tr key={intern.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={intern.name} avatar={(intern as any).avatar} size="sm" />
                        <span className="text-[0.82rem] font-medium text-[#374151]">{intern.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.email}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.company_name || '-'}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.position || '-'}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.generation || '-'}</td>
                    <td className="px-5 py-3">
                      <Badge color={intern.is_active ? 'green' : 'gray'}>
                        {intern.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewIntern(intern)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => setRemoveId(intern.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Remove">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">
                      {search ? 'No interns match your search.' : 'No interns assigned to you yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {data?.meta && <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} total={data.meta.total} perPage={perPage} onPerPageChange={(v: number) => { setPerPage(v); setPage(1); }} />}

      {/* Choose Intern Modal */}
      <Modal open={chooseDropdownOpen} onClose={() => { setChooseDropdownOpen(false); setChooseSearch(''); }} title="Choose Intern">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              type="text"
              value={chooseSearch}
              onChange={(e) => setChooseSearch(e.target.value)}
              placeholder="Search intern by name..."
              autoFocus
              className="block w-full rounded-[5px] border border-[#e0e0e0] pl-10 pr-[14px] py-[9px] text-[0.82rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
          <div className="max-h-[350px] overflow-y-auto">
            {availableInterns.length > 0 ? availableInterns.map((intern: any) => (
              <button
                key={intern.id}
                type="button"
                onClick={() => { chooseMutation.mutate(intern.id); setChooseSearch(''); setChooseDropdownOpen(false); }}
                disabled={chooseMutation.isPending}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-[5px] hover:bg-[#f5f5f7] transition-colors text-left"
              >
                <UserAvatar name={intern.name} avatar={(intern as any).avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[0.82rem] font-medium text-[#374151]">{intern.name}</p>
                  <p className="text-[0.72rem] text-[#9ca3af]">{intern.email}</p>
                </div>
                <div className="text-right shrink-0">
                  {intern.company_name && <p className="text-[0.72rem] text-[#6b7280]">{intern.company_name}</p>}
                  {intern.generation && <p className="text-[0.65rem] text-[#9ca3af]">{intern.generation}</p>}
                </div>
              </button>
            )) : (
              <div className="py-8 text-center text-[0.85rem] text-[#9ca3af]">
No interns found
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* View Intern Modal */}
      <Modal open={!!viewIntern} onClose={() => setViewIntern(null)} title="Intern Details" size="lg">
        {viewIntern && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <UserAvatar name={viewIntern.name} avatar={(viewIntern as any).avatar} size="lg" />
              <div>
                <h3 className="text-[1rem] font-bold text-[#1e1b4b]">{viewIntern.name}</h3>
                <p className="text-[0.82rem] text-[#6b7280]">{viewIntern.email}</p>
              </div>
              <div className="ml-auto">
                <Badge color={viewIntern.is_active ? 'green' : 'gray'}>
                  {viewIntern.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">Internship Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Company</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.company_name || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Position</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.position || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Supervisor</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.supervisor_name || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Generation</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.generation || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Phone</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.phone || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Allowance</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.allowance ? `$${viewIntern.allowance}/month` : '-'}</p>
                </div>
              </div>
            </div>

            {/* Interview History */}
            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">Interview History</p>
              {interviewsLoading ? (
                <LoadingSpinner className="py-6" />
              ) : interviews && interviews.length > 0 ? (
                <div className="border border-[#f0f0f0] rounded-[5px] overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-[#fafafa]">
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Company</th>
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Date</th>
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Type</th>
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.map((iv: any) => (
                        <tr key={iv.id} className="border-t border-[#f5f5f5]">
                          <td className="px-4 py-2 text-[0.78rem] font-medium text-[#374151]">{iv.company_name || iv.company?.name || '-'}</td>
                          <td className="px-4 py-2 text-[0.78rem] text-[#374151]">{formatDateTime(iv.interview_date)}</td>
                          <td className="px-4 py-2"><Badge color={STATUS_COLORS[iv.type] || 'gray'}>{STATUS_LABELS[iv.type] || iv.type}</Badge></td>
                          <td className="px-4 py-2">
                            {iv.result ? <Badge color={STATUS_COLORS[iv.result] || 'gray'}>{STATUS_LABELS[iv.result] || iv.result}</Badge> : <span className="text-[0.78rem] text-[#9ca3af]">-</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-[0.82rem] text-[#9ca3af] bg-[#f9fafb] rounded-[5px]">No interviews yet.</div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Remove Confirm */}
      <ConfirmDialog
        open={removeId !== null}
        title="Remove Intern"
        message="Are you sure you want to remove this intern from your list?"
        confirmLabel="Remove"
        onConfirm={() => { if (removeId) removeMutation.mutate(removeId); }}
        onCancel={() => setRemoveId(null)}
      />
    </div>
  );
}
