import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Eye, List, BookOpen, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useToggleActive } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { UserForm } from './UserForm';
import { UserAvatar } from '../../components/ui/UserAvatar';
import type { User } from '../../types/ims';

export function UsersPage() {
  const { t } = useTranslation();

  const roleOptions = [
    { value: '', label: t('users.allRoles'), icon: List },
    { value: 'admin', label: t('users.admin'), icon: ShieldCheck },
    { value: 'tutor', label: t('auth.tutor'), icon: BookOpen },
    { value: 'supervisor', label: t('auth.supervisor'), icon: Briefcase },
    { value: 'intern', label: t('auth.intern'), icon: GraduationCap },
  ];
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useUsers({ search, role: roleFilter || undefined, page });
  const { data: roles } = useRoles();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const toggleMutation = useToggleActive();

  const handleCreate = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    if (editUser) {
      await updateMutation.mutateAsync({ id: editUser.id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData as any);
    }
    setFormOpen(false);
  };

  const handleDelete = (id: number) => setDeleteId(id);

  const confirmDelete = async () => {
    if (deleteId !== null) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">{t('users.title')}</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">{t('users.subtitle')}</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          {t('users.addUser')}
        </Button>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5] flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder={t('users.searchUsers')} className="max-w-xs" />
          <FilterDropdown options={roleOptions} value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }} />
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden space-y-3 p-4">
              {data?.data.map((user) => (
                <div key={user.id} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 space-y-2 relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                      <span className="text-[0.82rem] font-medium text-[#374151]">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewUser(user)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(user)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => toggleMutation.mutate(user.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title={user.is_active ? 'Deactivate' : 'Activate'}>{user.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('auth.email')}</span><span className="text-[0.82rem] text-[#374151] font-medium">{user.email}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('users.role')}</span><span className="text-[0.82rem] text-[#374151] font-medium">{user.role?.name || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('auth.department')}</span><span className="text-[0.82rem] text-[#374151] font-medium">{user.department || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('auth.generation')}</span><span className="text-[0.82rem] text-[#374151] font-medium">{(user as any).generation || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">{t('users.status')}</span><Badge color={user.is_active ? 'green' : 'gray'}>{user.is_active ? t('users.active') : t('users.inactive')}</Badge></div>
                </div>
              ))}
              {data?.data.length === 0 && (
                <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">{t('users.noUsersFound')}</div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-[#fafafa]">
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.name')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('auth.email')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.role')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('auth.department')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('auth.generation')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.status')}</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">{t('users.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((user) => (
                    <tr key={user.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.name} avatar={user.avatar} size="sm" />
                          <span className="text-[0.82rem] font-medium text-[#374151]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{user.email}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{user.role?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{user.department || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{(user as any).generation || '-'}</td>
                      <td className="px-5 py-3">
                        <Badge color={user.is_active ? 'green' : 'gray'}>
                          {user.is_active ? t('users.active') : t('users.inactive')}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setViewUser(user)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => toggleMutation.mutate(user.id)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">
                        {t('users.noUsersFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data?.meta && data.meta.last_page > 1 && (
              <div className="p-4 border-t border-[#f5f5f5]">
                <Pagination
                  currentPage={data.meta.current_page}
                  lastPage={data.meta.last_page}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* View User Modal */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title={t('users.userDetails')} size="lg">
        {viewUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <UserAvatar name={viewUser.name} avatar={viewUser.avatar} size="lg" />
              <div>
                <h3 className="text-[1rem] font-bold text-[#1e1b4b]">{viewUser.name}</h3>
                <p className="text-[0.82rem] text-[#6b7280]">{viewUser.email}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge color={viewUser.is_active ? 'green' : 'gray'}>{viewUser.is_active ? t('users.active') : t('users.inactive')}</Badge>
                {viewUser.role && <Badge color="blue">{viewUser.role.name}</Badge>}
              </div>
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">{t('users.personalInfo')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">{t('auth.phone')}</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewUser.phone || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">{t('auth.department')}</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewUser.department || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">{t('auth.generation')}</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).generation || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">{t('users.registered')}</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewUser.created_at ? new Date(viewUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">{t('users.internshipDetails')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">{t('users.company')}</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).company_name || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">{t('users.position')}</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).position || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">{t('auth.supervisor')}</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).supervisor_name || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">{t('auth.tutor')}</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).tutor?.name || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <UserForm
        key={editUser ? `edit-${editUser.id}` : 'create'}
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={editUser}
        roles={roles || []}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        open={deleteId !== null}
        message={t('users.deleteConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
