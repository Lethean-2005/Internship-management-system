import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    { value: '', label: t('users.selectRole') },
    ...roles.map((r) => ({ value: r.id.toString(), label: r.name })),
  ];

  const currentYear = new Date().getFullYear();
  const generationOptions = [
    { value: '', label: t('auth.selectGeneration') },
    ...Array.from({ length: currentYear - 2007 + 1 }, (_, i) => ({
      value: String(currentYear - i),
      label: `Generation ${currentYear - i}`,
    })),
  ];

  return (
    <Modal open={open} onClose={onClose} title={user ? t('users.editUser') : t('users.createUser')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-[0.8rem] font-semibold text-[#9ca3af] uppercase tracking-wider">{t('users.account')}</p>
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('users.name')} value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={user ? t('users.passwordKeep') : t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!user}
          />
          <Select label={t('users.role')} options={roleOptions} value={roleId} onChange={(e) => setRoleId(e.target.value)} />
        </div>

        <div className="border-t border-[#f0f0f2] pt-4 mt-4">
          <p className="text-[0.8rem] font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">{t('users.personalInfo')}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('auth.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('auth.optional')} />
          <Input label={t('auth.department')} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder={t('auth.optional')} />
        </div>

        <div className="border-t border-[#f0f0f2] pt-4 mt-4">
          <p className="text-[0.8rem] font-semibold text-[#9ca3af] uppercase tracking-wider mb-4">{t('users.internshipDetails')}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('users.company')} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t('auth.optional')} />
          <Input label={t('users.position')} value={position} onChange={(e) => setPosition(e.target.value)} placeholder={t('auth.optional')} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('auth.supervisor')} value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder={t('auth.optional')} />
          <Select label={t('auth.generation')} options={generationOptions} value={generation} onChange={(e) => setGeneration(e.target.value)} />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={loading}>{user ? t('common.update') : t('common.create')}</Button>
        </div>
      </form>
    </Modal>
  );
}
