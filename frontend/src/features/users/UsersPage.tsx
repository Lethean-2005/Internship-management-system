import { useState } from 'react';
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
import { UserForm } from './UserForm';
import type { User } from '../../types/ims';

const roleOptions = [
  { value: '', label: 'All Roles', icon: List },
  { value: 'admin', label: 'Admin', icon: ShieldCheck },
  { value: 'tutor', label: 'Tutor', icon: BookOpen },
  { value: 'supervisor', label: 'Supervisor', icon: Briefcase },
  { value: 'intern', label: 'Intern', icon: GraduationCap },
];

export function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewUser, setViewUser] = useState<User | null>(null);

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

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">Users</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Manage system users and their roles.</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5] flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users..." className="max-w-xs" />
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.7rem] font-semibold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[0.82rem] font-medium text-[#374151]">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewUser(user)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleEdit(user)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title="Edit"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => toggleMutation.mutate(user.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors" title={user.is_active ? 'Deactivate' : 'Activate'}>{user.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}</button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Email</span><span className="text-[0.82rem] text-[#374151] font-medium">{user.email}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Role</span><span className="text-[0.82rem] text-[#374151] font-medium">{user.role?.name || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Department</span><span className="text-[0.82rem] text-[#374151] font-medium">{user.department || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Generation</span><span className="text-[0.82rem] text-[#374151] font-medium">{(user as any).generation || '-'}</span></div>
                  <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Status</span><Badge color={user.is_active ? 'green' : 'gray'}>{user.is_active ? 'Active' : 'Inactive'}</Badge></div>
                </div>
              ))}
              {data?.data.length === 0 && (
                <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No users found.</div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-[#fafafa]">
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Name</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Email</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Role</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Department</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Generation</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((user) => (
                    <tr key={user.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.7rem] font-semibold shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[0.82rem] font-medium text-[#374151]">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{user.email}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{user.role?.name || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{user.department || '-'}</td>
                      <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{(user as any).generation || '-'}</td>
                      <td className="px-5 py-3">
                        <Badge color={user.is_active ? 'green' : 'gray'}>
                          {user.is_active ? 'Active' : 'Inactive'}
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
                        No users found.
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
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="User Details" size="lg">
        {viewUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[1.2rem] font-bold shrink-0">
                {viewUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-[1rem] font-bold text-[#1e1b4b]">{viewUser.name}</h3>
                <p className="text-[0.82rem] text-[#6b7280]">{viewUser.email}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge color={viewUser.is_active ? 'green' : 'gray'}>{viewUser.is_active ? 'Active' : 'Inactive'}</Badge>
                {viewUser.role && <Badge color="blue">{viewUser.role.name}</Badge>}
              </div>
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">Personal Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Phone</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewUser.phone || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Department</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewUser.department || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Generation</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).generation || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Registered</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{viewUser.created_at ? new Date(viewUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[0.72rem] font-semibold text-[#9ca3af] uppercase mb-3">Internship Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Company</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).company_name || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Position</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).position || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Supervisor</p>
                  <p className="text-[0.82rem] font-medium text-[#374151]">{(viewUser as any).supervisor_name || '-'}</p>
                </div>
                <div className="bg-[#f9fafb] rounded-[5px] p-3">
                  <p className="text-[0.72rem] text-[#9ca3af] mb-1">Tutor</p>
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
    </div>
  );
}
