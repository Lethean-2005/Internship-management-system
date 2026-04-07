import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import type { Company } from '../../types/ims';

interface InternshipFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    company_id: number;
    title: string;
    description?: string | null;
    department?: string | null;
    start_date: string;
    end_date: string;
    positions: number;
    requirements?: string | null;
  }) => void;
  companies: Company[];
  loading?: boolean;
}

export function InternshipForm({ open, onClose, onSubmit, companies, loading }: InternshipFormProps) {
  const { t } = useTranslation();
  const [companyId, setCompanyId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [positions, setPositions] = useState('1');
  const [requirements, setRequirements] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      company_id: Number(companyId),
      title,
      description: description || null,
      department: department || null,
      start_date: startDate,
      end_date: endDate,
      positions: Number(positions),
      requirements: requirements || null,
    });
  };

  const companyOptions = [
    { value: '', label: t('companies.selectCompany') },
    ...companies.map((c) => ({ value: c.id.toString(), label: c.name })),
  ];

  return (
    <Modal open={open} onClose={onClose} title={t('companies.createInternship')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label={t('users.company')} options={companyOptions} value={companyId} onChange={(e) => setCompanyId(e.target.value)} required />
        <Input label={t('common.title')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('roles.description')}</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <Input label={t('auth.department')} value={department} onChange={(e) => setDepartment(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <DatePicker label={t('companies.startDate')} value={startDate} onChange={setStartDate} required />
          <DatePicker label={t('companies.endDate')} value={endDate} onChange={setEndDate} required />
        </div>
        <Input label={t('companies.positions')} type="number" min="1" value={positions} onChange={(e) => setPositions(e.target.value)} required />
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('companies.requirements')}</label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={3}
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={loading}>{t('common.create')}</Button>
        </div>
      </form>
    </Modal>
  );
}
