import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import type { User, Company } from '../../types/ims';

interface InterviewFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    user_id: number;
    company_id: number;
    interview_date: string;
    location?: string | null;
    type: string;
    notes?: string | null;
  }) => void;
  users: User[];
  companies: Company[];
  loading?: boolean;
}

export function InterviewForm({ open, onClose, onSubmit, users, companies, loading }: InterviewFormProps) {
  const [userId, setUserId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('onsite');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      user_id: Number(userId),
      company_id: Number(companyId),
      interview_date: interviewDate,
      location: location || null,
      type,
      notes: notes || null,
    });
  };

  const userOptions = [
    { value: '', label: 'Select Intern' },
    ...users.map((u) => ({ value: u.id.toString(), label: u.name })),
  ];

  const companyOptions = [
    { value: '', label: 'Select Company' },
    ...companies.map((c) => ({ value: c.id.toString(), label: c.name })),
  ];

  const typeOptions = [
    { value: 'onsite', label: 'Onsite' },
    { value: 'online', label: 'Online' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Schedule Interview">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Intern" options={userOptions} value={userId} onChange={(e) => setUserId(e.target.value)} required />
        <Select label="Company" options={companyOptions} value={companyId} onChange={(e) => setCompanyId(e.target.value)} required />
        <Input label="Interview Date" type="datetime-local" value={interviewDate} onChange={(e) => setInterviewDate(e.target.value)} required />
        <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
        <Select label="Type" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Schedule</Button>
        </div>
      </form>
    </Modal>
  );
}
