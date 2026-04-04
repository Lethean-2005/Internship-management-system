import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '../../hooks/useRoles';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { RoleForm } from './RoleForm';
import type { Role } from '../../types/ims';

export function RolesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);

  const { data: roles, isLoading } = useRoles();
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();

  const handleCreate = () => {
    setEditRole(null);
    setFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditRole(role);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData: { name: string; slug: string; description?: string | null }) => {
    if (editRole) {
      await updateMutation.mutateAsync({ id: editRole.id, payload: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    setFormOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this role?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">Roles</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">Manage user roles and permissions.</p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="bg-white border border-[#f0f0f0] rounded-[5px]">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <>
          {/* Mobile card view */}
          <div className="md:hidden space-y-3 p-4">
            {roles?.map((role) => (
              <div key={role.id} className="bg-white rounded-[5px] border border-[#e5e7eb] p-4 space-y-2 relative">
                <div className="flex items-start justify-between">
                  <span className="text-[0.82rem] font-medium text-[#374151]">{role.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(role)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(role.id)} className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="flex items-center"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Slug</span><span className="text-[0.82rem] text-[#374151] font-medium font-mono">{role.slug}</span></div>
                <div className="flex items-start"><span className="text-[0.78rem] text-[#6b7280] w-[120px] shrink-0">Description</span><span className="text-[0.82rem] text-[#374151] font-medium">{role.description || '-'}</span></div>
              </div>
            ))}
            {roles?.length === 0 && (
              <div className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">No roles found.</div>
            )}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-[#fafafa]">
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Name</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Slug</th>
                  <th className="text-left px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Description</th>
                  <th className="text-right px-5 py-3 text-[0.72rem] font-semibold text-[#9ca3af] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles?.map((role) => (
                  <tr key={role.id} className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3 text-[0.82rem] font-medium text-[#374151]">{role.name}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#6b7280] font-mono">{role.slug}</td>
                    <td className="px-5 py-3 text-[0.82rem] text-[#374151]">{role.description || '-'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(role)}
                          className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#48B6E8] hover:bg-[#eef8fd] transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-1.5 rounded-[5px] text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {roles?.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-[0.85rem] text-[#9ca3af]">
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      <RoleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        role={editRole}
        loading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
