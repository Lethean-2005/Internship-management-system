import { useState } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, List, BookOpen, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useToggleActive } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
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

  const handleFormSubmit = async (formData: {
    name: string;
    email: string;
    password?: string;
    role_id: number | null;
    phone?: string | null;
    department?: string | null;
  }) => {
    if (editUser) {
      await updateMutation.mutateAsync({ id: editUser.id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData as { name: string; email: string; password: string; role_id: number | null });
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">Users</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Manage system users and their roles.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        <div className="p-4 border-b border-[#f5f5f5] flex items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users..." className="max-w-xs" />

          <FilterDropdown options={roleOptions} value={roleFilter} onChange={(v) => { setRoleFilter(v); setPage(1); }} />
        </div>

        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#fafafa]">
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Name</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Email</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Role</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Department</th>
                    <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Status</th>
                    <th className="text-right px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
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
                      <td className="px-5 py-3">
                        <Badge color={user.is_active ? 'green' : 'gray'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleMutation.mutate(user.id)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">
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

      <UserForm
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
