import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import type { Internship } from '../../types/ims';

interface SlideFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { internship_id: number; title: string; description?: string | null; presentation_date?: string | null }) => void;
  internships: Internship[];
  loading?: boolean;
}

export function SlideForm({ open, onClose, onSubmit, internships, loading }: SlideFormProps) {
  const [internshipId, setInternshipId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [presentationDate, setPresentationDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      internship_id: Number(internshipId),
      title,
      description: description || null,
      presentation_date: presentationDate || null,
    });
  };

  const internshipOptions = [
    { value: '', label: 'Select Internship' },
    ...internships.map((i) => ({ value: i.id.toString(), label: i.title })),
  ];

  return (
    <Modal open={open} onClose={onClose} title="Create Final Slide">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Internship" options={internshipOptions} value={internshipId} onChange={(e) => setInternshipId(e.target.value)} required />
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <DatePicker label="Presentation Date" value={presentationDate} onChange={setPresentationDate} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}
