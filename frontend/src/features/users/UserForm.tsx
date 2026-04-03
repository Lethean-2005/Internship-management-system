import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import type { User, Role } from '../../types/ims';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    password?: string;
    role_id: number | null;
    phone?: string | null;
    department?: string | null;
  }) => void;
  user?: User | null;
  roles: Role[];
  loading?: boolean;
}

export function UserForm({ open, onClose, onSubmit, user, roles, loading }: UserFormProps) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<string>(user?.role_id?.toString() || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [department, setDepartment] = useState(user?.department || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      ...(password ? { password } : {}),
      role_id: roleId ? Number(roleId) : null,
      phone: phone || null,
      department: department || null,
    });
  };

  const roleOptions = [
    { value: '', label: 'Select Role' },
    ...roles.map((r) => ({ value: r.id.toString(), label: r.name })),
  ];

  return (
    <Modal open={open} onClose={onClose} title={user ? 'Edit User' : 'Create User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label={user ? 'Password (leave blank to keep)' : 'Password'}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required={!user}
        />
        <Select label="Role" options={roleOptions} value={roleId} onChange={(e) => setRoleId(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{user ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
