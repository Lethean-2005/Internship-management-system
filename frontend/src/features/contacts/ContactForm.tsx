import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import type { User } from '../../types/ims';

interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { supervisor_id: number; subject: string; message: string }) => void;
  supervisors: User[];
  loading?: boolean;
}

export function ContactForm({ open, onClose, onSubmit, supervisors, loading }: ContactFormProps) {
  const [supervisorId, setSupervisorId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      supervisor_id: Number(supervisorId),
      subject,
      message,
    });
  };

  const supervisorOptions = [
    { value: '', label: 'Select Supervisor' },
    ...supervisors.map((u) => ({ value: u.id.toString(), label: u.name })),
  ];

  return (
    <Modal open={open} onClose={onClose} title="Contact Supervisor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Supervisor" options={supervisorOptions} value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)} required />
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            required
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Send Message</Button>
        </div>
      </form>
    </Modal>
  );
}
