import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Search } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import client from '../../api/client';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDateTime } from '../../lib/formatDate';
import type { User } from '../../types/auth';
import type { PaginatedResponse } from '../../types/api';

export function MyInternsPage() {
  const [viewIntern, setViewIntern] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-interns'],
    queryFn: () => client.get<PaginatedResponse<User>>('/my-interns').then((r) => r.data),
  });

  const { data: interviews, isLoading: interviewsLoading } = useQuery({
    queryKey: ['intern-interviews', viewIntern?.id],
    queryFn: () => client.get(`/my-interns/${viewIntern.id}/interviews`).then((r: any) => r.data.data),
    enabled: !!viewIntern,
  });

  const filteredData = data?.data.filter((intern: any) =>
    intern.name.toLowerCase().includes(search.toLowerCase()) ||
    intern.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">My Interns</h1>
        <p className="mt-1 text-[0.85rem] text-[#6b7280]">Interns assigned to you as their tutor.</p>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5]">
          <div className="relative max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9ca3af]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search intern by name or email..."
              className="block w-full rounded-[5px] border border-[#e0e0e0] pl-10 pr-[14px] py-[9px] text-[0.82rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#fafafa]">
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Name</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Email</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Company</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Position</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Supervisor</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Allowance</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData?.map((intern: any) => (
                  <tr key={intern.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.7rem] font-semibold shrink-0">
                          {intern.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[0.82rem] font-medium text-[#374151]">{intern.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.email}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.company_name || '-'}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.position || '-'}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.supervisor_name || '-'}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{intern.allowance ? `$${intern.allowance}` : '-'}</td>
                    <td className="px-5 py-3">
                      <Badge color={intern.is_active ? 'green' : 'gray'}>
                        {intern.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setViewIntern(intern)}
                        className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredData?.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">
                      {search ? 'No interns match your search.' : 'No interns assigned to you yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Intern Modal */}
      <Modal open={!!viewIntern} onClose={() => setViewIntern(null)} title="Intern Details" size="lg">
        {viewIntern && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[1.2rem] font-bold shrink-0">
                {viewIntern.name.charAt(0).toUpperCase()}
              </div>
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

            {/* Personal Info */}
            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">Personal Information</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Phone</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.phone || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Department</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.department || '-'}</p>
                </div>
              </div>
            </div>

            {/* Internship Info */}
            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">Internship Details</p>
              <div className="grid grid-cols-2 gap-3">
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
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Allowance</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.allowance ? `$${viewIntern.allowance}/month` : '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Registered</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewIntern.created_at ? new Date(viewIntern.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</p>
                </div>
              </div>
            </div>

            {/* Interview History */}
            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">Interview History</p>
              {interviewsLoading ? (
                <LoadingSpinner className="py-6" />
              ) : interviews && interviews.length > 0 ? (
                <div className="border border-[#f0f0f0] rounded-[5px] overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#fafafa]">
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Company</th>
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Date</th>
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Type</th>
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Result</th>
                        <th className="text-left px-4 py-2 text-[0.68rem] font-semibold text-[#9ca3af] uppercase">Employment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {interviews.map((iv: any) => {
                        const m = String(iv.interview_date).match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
                        const isPast = m ? new Date(+m[1], +m[2]-1, +m[3], +m[4], +m[5]) <= new Date() : false;
                        return (
                          <tr key={iv.id} className="border-t border-[#f5f5f5]">
                            <td className="px-4 py-2 text-[0.78rem] font-medium text-[#374151]">{iv.company_name || iv.company?.name || '-'}</td>
                            <td className="px-4 py-2 text-[0.78rem] text-[#374151]">{formatDateTime(iv.interview_date)}</td>
                            <td className="px-4 py-2"><Badge color={STATUS_COLORS[iv.type] || 'gray'}>{STATUS_LABELS[iv.type] || iv.type}</Badge></td>
                            <td className="px-4 py-2">
                              {isPast && iv.status === 'scheduled'
                                ? <Badge color="green">Interviewed</Badge>
                                : <Badge color={STATUS_COLORS[iv.status] || 'gray'}>{STATUS_LABELS[iv.status] || iv.status}</Badge>
                              }
                            </td>
                            <td className="px-4 py-2">
                              {iv.result
                                ? <Badge color={STATUS_COLORS[iv.result] || 'gray'}>{STATUS_LABELS[iv.result] || iv.result}</Badge>
                                : <span className="text-[0.78rem] text-[#9ca3af]">-</span>
                              }
                            </td>
                            <td className="px-4 py-2">
                              {iv.employment
                                ? <Badge color={STATUS_COLORS[iv.employment] || 'gray'}>{STATUS_LABELS[iv.employment] || iv.employment}</Badge>
                                : <span className="text-[0.78rem] text-[#9ca3af]">-</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-[0.82rem] text-[#9ca3af] bg-[#f9fafb] rounded-[5px]">
                  No interviews yet.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
