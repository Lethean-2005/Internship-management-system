import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { Company } from '../../types/ims';

interface CompanyFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    industry?: string | null;
    description?: string | null;
    contact_person?: string | null;
    contact_phone?: string | null;
  }) => void;
  company?: Company | null;
  loading?: boolean;
}

export function CompanyForm({ open, onClose, onSubmit, company, loading }: CompanyFormProps) {
  const [name, setName] = useState(company?.name || '');
  const [address, setAddress] = useState(company?.address || '');
  const [phone, setPhone] = useState(company?.phone || '');
  const [email, setEmail] = useState(company?.email || '');
  const [website, setWebsite] = useState(company?.website || '');
  const [industry, setIndustry] = useState(company?.industry || '');
  const [description, setDescription] = useState(company?.description || '');
  const [contactPerson, setContactPerson] = useState(company?.contact_person || '');
  const [contactPhone, setContactPhone] = useState(company?.contact_phone || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      address: address || null,
      phone: phone || null,
      email: email || null,
      website: website || null,
      industry: industry || null,
      description: description || null,
      contact_person: contactPerson || null,
      contact_phone: contactPhone || null,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title={company ? 'Edit Company' : 'Add Company'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Company Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </div>
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          <Input label="Contact Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{company ? 'Update' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}
