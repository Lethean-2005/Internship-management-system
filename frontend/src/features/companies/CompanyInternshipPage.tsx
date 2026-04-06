import { useState } from 'react';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { useCompanies, useCreateCompany, useUpdateCompany, useDeleteCompany } from '../../hooks/useCompanies';
import { useInternships, useCreateInternship, useDeleteInternship } from '../../hooks/useInternships';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CompanyForm } from './CompanyForm';
import { InternshipForm } from './InternshipForm';
import { STATUS_COLORS, STATUS_LABELS } from '../../lib/constants';
import { formatDate } from '../../lib/formatDate';
import type { Company } from '../../types/ims';

export function CompanyInternshipPage() {
  const [search, setSearch] = useState('');
  const [intPage, setIntPage] = useState(1);
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [internshipFormOpen, setInternshipFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'company' | 'internship'; id: number } | null>(null);

  const { data: companiesData, isLoading: companiesLoading } = useCompanies({ search });
  const { data: internshipsData, isLoading: internshipsLoading } = useInternships({ page: intPage });
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();
  const deleteCompanyMutation = useDeleteCompany();
  const createInternshipMutation = useCreateInternship();
  const deleteInternshipMutation = useDeleteInternship();

  const handleCompanySubmit = async (formData: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    industry?: string | null;
    description?: string | null;
    contact_person?: string | null;
    contact_phone?: string | null;
  }) => {
    if (editCompany) {
      await updateCompanyMutation.mutateAsync({ id: editCompany.id, payload: formData });
    } else {
      await createCompanyMutation.mutateAsync(formData);
    }
    setCompanyFormOpen(false);
    setEditCompany(null);
  };

  const handleInternshipSubmit = async (formData: {
    company_id: number;
    title: string;
    description?: string | null;
    department?: string | null;
    start_date: string;
    end_date: string;
    positions: number;
    requirements?: string | null;
  }) => {
    await createInternshipMutation.mutateAsync(formData);
    setInternshipFormOpen(false);
  };

  const handleDeleteCompany = (id: number) => setDeleteTarget({ type: 'company', id });
  const handleDeleteInternship = (id: number) => setDeleteTarget({ type: 'internship', id });

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'company') {
      await deleteCompanyMutation.mutateAsync(deleteTarget.id);
    } else {
      await deleteInternshipMutation.mutateAsync(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">Company & Internship</h1>
        <p className="mt-1 text-[0.85rem] text-[#6b7280]">Manage companies and their internship programs.</p>
      </div>

      {/* Companies Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[1.1rem] font-semibold text-[#1e1b4b]">Companies</h2>
          <Button onClick={() => { setEditCompany(null); setCompanyFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Add Company
          </Button>
        </div>

        {companiesLoading ? (
          <LoadingSpinner className="py-8" />
        ) : (
          <>
            <div className="mb-4">
              <SearchInput value={search} onChange={setSearch} placeholder="Search companies..." className="max-w-xs" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {companiesData?.data.map((company) => (
                <div key={company.id} className="bg-white border border-[#f0f0f0] rounded-[5px] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-[5px] bg-[#eef8fd] flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-[#3a9fd4]" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditCompany(company); setCompanyFormOpen(true); }}
                        className="p-1 rounded text-[#9ca3af] hover:text-[#48B6E8] transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCompany(company.id)}
                        className="p-1 rounded text-[#9ca3af] hover:text-[#dc2626] transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-[0.88rem] font-semibold text-[#1e1b4b] mb-1">{company.name}</h3>
                  <p className="text-[0.78rem] text-[#6b7280] mb-2">{company.industry || 'No industry'}</p>
                  <div className="flex items-center justify-between">
                    <Badge color={company.is_active ? 'green' : 'gray'}>
                      {company.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-[0.72rem] text-[#9ca3af]">
                      {company.internships_count ?? 0} internships
                    </span>
                  </div>
                </div>
              ))}
              {companiesData?.data.length === 0 && (
                <p className="col-span-full text-center py-8 text-[0.85rem] text-[#9ca3af]">No companies found.</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Internships Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[1.1rem] font-semibold text-[#1e1b4b]">Internships</h2>
          <Button onClick={() => setInternshipFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Internship
          </Button>
        </div>

        <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
          {internshipsLoading ? (
            <LoadingSpinner className="py-12" />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#fafafa]">
                      <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Title</th>
                      <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Company</th>
                      <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Dates</th>
                      <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Positions</th>
                      <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                      <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Applicants</th>
                      <th className="text-right px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {internshipsData?.data.map((internship) => (
                      <tr key={internship.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                        <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{internship.title}</td>
                        <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{internship.company?.name || '-'}</td>
                        <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{formatDate(internship.start_date)} - {formatDate(internship.end_date)}</td>
                        <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{internship.positions}</td>
                        <td className="px-5 py-3">
                          <Badge color={STATUS_COLORS[internship.status] || 'gray'}>{STATUS_LABELS[internship.status] || internship.status}</Badge>
                        </td>
                        <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{internship.applications_count ?? 0}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDeleteInternship(internship.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {internshipsData?.data.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No internships found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {internshipsData?.meta && internshipsData.meta.last_page > 1 && (
                <div className="p-4 border-t border-[#f5f5f5]">
                  <Pagination currentPage={internshipsData.meta.current_page} lastPage={internshipsData.meta.last_page} onPageChange={setIntPage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <CompanyForm
        open={companyFormOpen}
        onClose={() => { setCompanyFormOpen(false); setEditCompany(null); }}
        onSubmit={handleCompanySubmit}
        company={editCompany}
        loading={createCompanyMutation.isPending || updateCompanyMutation.isPending}
      />

      <InternshipForm
        open={internshipFormOpen}
        onClose={() => setInternshipFormOpen(false)}
        onSubmit={handleInternshipSubmit}
        companies={companiesData?.data || []}
        loading={createInternshipMutation.isPending}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        message={`Are you sure you want to delete this ${deleteTarget?.type || 'item'}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
