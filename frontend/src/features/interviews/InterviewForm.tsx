import { useState, useEffect, type FormEvent } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { TimePicker } from '../../components/ui/TimePicker';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useInterviews } from '../../hooks/useInterviews';
import type { CompanyInterview, User } from '../../types/ims';

function parseTo24(time: string): string {
  const t = time.trim();
  // Match: "5PM", "5 PM", "5:5PM", "5:05 PM", "05:00 PM", "4:5 PM"
  const match = t.match(/^(\d{1,2})(?::(\d{1,2}))?\s*(AM|PM)$/i);
  if (!match) return t;
  let h = parseInt(match[1]);
  const m = String(parseInt(match[2] || '0')).padStart(2, '0');
  const p = match[3].toUpperCase();
  if (p === 'AM' && h === 12) h = 0;
  else if (p === 'PM' && h !== 12) h += 12;
  return `${String(h).padStart(2, '0')}:${m}:00`;
}

interface InterviewFormProps {
  open: boolean;
  onClose: () => void;
  users?: User[];
  onSubmit: (data: {
    user_id?: number;
    company_name: string;
    interview_date: string;
    location?: string | null;
    type: string;
    employment?: string | null;
    notes?: string | null;
  }) => void;
  interview?: CompanyInterview | null;
  loading?: boolean;
}

export function InterviewForm({ open, onClose, onSubmit, users, interview, loading }: InterviewFormProps) {
  const user = useAuthStore((s) => s.user);
  const roleSlug = user?.role?.slug || '';
  const isAdmin = roleSlug === 'admin' || roleSlug === 'supervisor';
  const { data: allInterviews } = useInterviews();
  const [assignUserId, setAssignUserId] = useState('');
  const [internSearch, setInternSearch] = useState('');
  const [internDropdownOpen, setInternDropdownOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [interviewPeriod, setInterviewPeriod] = useState<'AM' | 'PM'>('AM');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('onsite');
  const [employment, setEmployment] = useState('internship');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (interview) {
      setAssignUserId(interview.user_id?.toString() || '');
      setInternSearch(interview.user?.name || '');
      setInternDropdownOpen(false);
      setCompanyName((interview as any).company_name || interview.company?.name || '');
      if (interview.interview_date) {
        // Parse the ISO string directly without timezone conversion
        const raw = String(interview.interview_date);
        const dateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
        if (dateMatch) {
          setInterviewDate(`${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`);
          const hr = parseInt(dateMatch[4]);
          const mi = dateMatch[5];
          const p = hr >= 12 ? 'PM' : 'AM';
          const h12 = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
          setInterviewTime(`${h12}:${mi}`);
          setInterviewPeriod(p as 'AM' | 'PM');
        }
      }
      setLocation(interview.location || '');
      setType(interview.type || 'onsite');
      setEmployment((interview as any).employment || '');
      setNotes(interview.notes || '');
    } else {
      setAssignUserId('');
      setInternSearch('');
      setInternDropdownOpen(false);
      setCompanyName('');
      setInterviewDate('');
      setInterviewTime('10:00');
      setInterviewPeriod('AM');
      setLocation('');
      setType('onsite');
      setEmployment('internship');
      setNotes('');
    }
  }, [interview, open]);

  const isDateExpired = (() => {
    if (!interviewDate || !interviewTime) return false;
    const time24 = parseTo24(`${interviewTime} ${interviewPeriod}`);
    const [h, m] = time24.split(':').map(Number);
    const [y, mo, d] = interviewDate.split('-').map(Number);
    const selected = new Date(y, mo - 1, d, h, m);
    return selected <= new Date();
  })();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isDateExpired) return;
    onSubmit({
      ...(isAdmin && assignUserId ? { user_id: Number(assignUserId) } : {}),
      company_name: companyName,
      interview_date: interviewDate ? `${interviewDate} ${parseTo24(`${interviewTime} ${interviewPeriod}`)}` : '',
      location: location || null,
      type,
      employment: employment || null,
      notes: notes || null,
    });
  };

  const typeOptions = [
    { value: 'onsite', label: 'Onsite' },
    { value: 'online', label: 'Online' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const hasPassed = interview?.result === 'passed';

  const employmentOptions = hasPassed ? [
    { value: '', label: 'Select Employment Agreement' },
    { value: 'internship', label: 'Internship' },
    { value: 'probation', label: 'Probation' },
    { value: 'staff', label: 'Staff' },
    { value: 'contract', label: 'Contract' },
  ] : [
    { value: 'internship', label: 'Internship' },
  ];

  return (
    <Modal open={open} onClose={onClose} title={interview ? 'Edit Interview' : 'Schedule Interview'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isAdmin && users && (
          <div className="w-full relative">
            <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">
              Assign Intern<span className="text-[#dc2626] ml-0.5">*</span>
            </label>
            <input
              type="text"
              value={internSearch}
              onChange={(e) => {
                setInternSearch(e.target.value);
                setInternDropdownOpen(true);
                if (!e.target.value) setAssignUserId('');
              }}
              onFocus={() => setInternDropdownOpen(true)}
              placeholder="Search intern by name..."
              required={!assignUserId}
              className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
            />
            {internDropdownOpen && internSearch && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e2d] border border-white/10 rounded-[5px] overflow-hidden z-50 max-h-[200px] overflow-y-auto" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.25)', animation: 'slideDown 0.15s ease-out' }}>
                {users
                  .filter((u) => u.name.toLowerCase().includes(internSearch.toLowerCase()))
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setAssignUserId(u.id.toString());
                        setInternSearch(u.name);
                        setInternDropdownOpen(false);
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-[10px] text-[0.82rem] font-medium text-left transition-colors ${
                        assignUserId === u.id.toString()
                          ? 'bg-[rgba(72,182,232,0.12)] text-white'
                          : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.6rem] font-semibold shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                      <span className="text-white/40 text-[0.75rem] ml-auto">{u.email}</span>
                    </button>
                  ))}
                {users.filter((u) => u.name.toLowerCase().includes(internSearch.toLowerCase())).length === 0 && (
                  <div className="px-3 py-3 text-[0.82rem] text-white/40 text-center">No interns found</div>
                )}
              </div>
            )}
            {assignUserId && allInterviews?.data && (() => {
              const passedInterviews = allInterviews.data.filter(
                (iv: any) => String(iv.user_id) === assignUserId && iv.result === 'passed'
              );
              if (passedInterviews.length === 0) return null;
              const internName = users.find((u) => u.id.toString() === assignUserId)?.name || 'Intern';
              return (
                <div className="mt-2 p-2.5 rounded-[5px] bg-[#fff7ed] border border-[#fed7aa] text-[0.78rem] text-[#ea580c]">
                  {passedInterviews.map((iv: any, i: number) => (
                    <p key={i}>{internName} has passed at <strong>{iv.company_name || iv.company?.name || 'a company'}</strong></p>
                  ))}
                </div>
              );
            })()}
          </div>
        )}
        <Input label="Company Name" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Tech Solutions Inc." required />
        <div className="grid grid-cols-2 gap-3">
          <DatePicker label="Interview Date" value={interviewDate} onChange={setInterviewDate} required />
          <TimePicker label="Time" value={interviewTime} period={interviewPeriod} onChange={setInterviewTime} onPeriodChange={setInterviewPeriod} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Room 201 or https://maps.google.com/..." required />
          <Select label="Type" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} required />
        </div>
        <Select label="Employment Agreement" options={employmentOptions} value={employment} onChange={(e) => setEmployment(e.target.value)} required />
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Notes<span className="text-[#dc2626] ml-0.5">*</span></label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            required
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          {isDateExpired && (
            <div className="flex-1 p-2 rounded-[5px] bg-[#fef2f2] border border-[#fecaca] text-[0.78rem] text-[#dc2626] font-medium">
              Date is Expired
            </div>
          )}
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading} disabled={isDateExpired}>{interview ? 'Update' : 'Schedule'}</Button>
        </div>
      </form>
    </Modal>
  );
}
