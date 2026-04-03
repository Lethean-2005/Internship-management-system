import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import type { User, Role } from '../../types/ims';

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  user?: User | null;
  roles: Role[];
  loading?: boolean;
}

export function UserForm({ open, onClose, onSubmit, user, roles, loading }: UserFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [generation, setGeneration] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setRoleId(user.role_id?.toString() || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setCompanyName((user as any).company_name || '');
      setPosition((user as any).position || '');
      setSupervisorName((user as any).supervisor_name || '');
      setGeneration((user as any).generation || '');
    } else {
      setName('');
      setEmail('');
      setPassword('');
      setRoleId('');
      setPhone('');
      setDepartment('');
      setCompanyName('');
      setPosition('');
      setSupervisorName('');
      setGeneration('');
    }
  }, [user, open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: Record<string, any> = {
      name,
      email,
      role_id: roleId ? Number(roleId) : null,
      phone: phone || null,
      department: department || null,
      company_name: companyName || null,
      position: position || null,
      supervisor_name: supervisorName || null,
      generation: generation || null,
    };
    if (password) data.password = password;
    onSubmit(data);
  };

  const roleOptions = [
    { value: '', label: 'Select Role' },
    ...roles.map((r) => ({ value: r.id.toString(), label: r.name })),
  ];

  const currentYear = new Date().getFullYear();
  const generationOptions = [
    { value: '', label: 'Select Generation' },
    ...Array.from({ length: currentYear - 2007 + 1 }, (_, i) => ({
      value: String(currentYear - i),
      label: `Generation ${currentYear - i}`,
    })),
  ];

  return (
    <Modal open={open} onClose={onClose} title={user ? 'Edit User' : 'Create User'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-[0.8rem] font-semibold text-[#9ca3af] uppercase tracking-wider">Account</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={user ? 'Password (leave blank to keep)' : 'Password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!user}
          />
          <Select label="Role" options={roleOptions} value={roleId} onChange={(e) => setRoleId(e.target.value)} />
        </div>

        <div className="border-t border-[#f0f0f2] pt-4 mt-4">
          <p className="text-[0.8rem] font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">Personal Information</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
          <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Optional" />
        </div>

        <div className="border-t border-[#f0f0f2] pt-4 mt-4">
          <p className="text-[0.8rem] font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">Internship Details</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Optional" />
          <Input label="Position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Optional" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Supervisor Name" value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder="Optional" />
          <Select label="Generation" options={generationOptions} value={generation} onChange={(e) => setGeneration(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{user ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
