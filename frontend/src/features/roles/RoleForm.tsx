import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Role } from '../../types/ims';

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; slug: string; description?: string | null }) => void;
  role?: Role | null;
  loading?: boolean;
}

export function RoleForm({ open, onClose, onSubmit, role, loading }: RoleFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(role?.name || '');
  const [slug, setSlug] = useState(role?.slug || '');
  const [description, setDescription] = useState(role?.description || '');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!role) {
      setSlug(val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ name, slug, description: description || null });
  };

  return (
    <Modal open={open} onClose={onClose} title={role ? t('roles.editRole') : t('roles.createRole')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('roles.name')} value={name} onChange={(e) => handleNameChange(e.target.value)} required />
        <Input label={t('roles.slug')} value={slug} onChange={(e) => setSlug(e.target.value)} required />
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('roles.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={loading}>{role ? t('common.update') : t('common.create')}</Button>
        </div>
      </form>
    </Modal>
  );
}
