import { useState, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { Button } from '../../components/ui/Button';
import type { Internship } from '../../types/ims';

interface WorklogFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    internship_id: number;
    week_number: number;
    start_date: string;
    end_date: string;
    tasks_completed: string;
    challenges?: string | null;
    plans_next_week?: string | null;
    hours_worked: number;
  }) => void;
  internships: Internship[];
  loading?: boolean;
}

export function WorklogForm({ open, onClose, onSubmit, internships, loading }: WorklogFormProps) {
  const [internshipId, setInternshipId] = useState('');
  const [weekNumber, setWeekNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [challenges, setChallenges] = useState('');
  const [plansNextWeek, setPlansNextWeek] = useState('');
  const [hoursWorked, setHoursWorked] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      internship_id: Number(internshipId),
      week_number: Number(weekNumber),
      start_date: startDate,
      end_date: endDate,
      tasks_completed: tasksCompleted,
      challenges: challenges || null,
      plans_next_week: plansNextWeek || null,
      hours_worked: Number(hoursWorked),
    });
  };

  const internshipOptions = [
    { value: '', label: 'Select Internship' },
    ...internships.map((i) => ({ value: i.id.toString(), label: i.title })),
  ];

  return (
    <Modal open={open} onClose={onClose} title="Create Weekly Worklog" size="lg">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Select label="Internship" options={internshipOptions} value={internshipId} onChange={(e) => setInternshipId(e.target.value)} required />
          <Input label="Week Number" type="number" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} required />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <DatePicker label="Start Date" value={startDate} onChange={setStartDate} required />
          <DatePicker label="End Date" value={endDate} onChange={setEndDate} required />
          <Input label="Hours Worked" type="number" value={hoursWorked} onChange={(e) => setHoursWorked(e.target.value)} required />
        </div>
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Tasks Completed</label>
          <textarea
            value={tasksCompleted}
            onChange={(e) => setTasksCompleted(e.target.value)}
            rows={2}
            required
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="w-full">
            <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Challenges</label>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              rows={2}
              className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
          <div className="w-full">
            <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Plans for Next Week</label>
            <textarea
              value={plansNextWeek}
              onChange={(e) => setPlansNextWeek(e.target.value)}
              rows={2}
              className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Create</Button>
        </div>
      </form>
    </Modal>
  );
}
