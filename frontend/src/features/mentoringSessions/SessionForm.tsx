import { useState, useEffect, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, X, Building2, Briefcase, GraduationCap, Mail, Phone } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { TimePicker } from '../../components/ui/TimePicker';
import { Button } from '../../components/ui/Button';
import { UserAvatar } from '../../components/ui/UserAvatar';
import type { MentoringSession } from '../../types/ims';

interface Intern {
  id: number;
  name: string;
  email: string;
  avatar?: string | null;
  company_name?: string | null;
  position?: string | null;
  generation?: string | null;
  department?: string | null;
  phone?: string | null;
}

interface SessionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    intern_ids: number[];
    title: string;
    scheduled_date: string;
    scheduled_time: string;
    duration_minutes: number;
    location?: string | null;
    meeting_link?: string | null;
    type: string;
    agenda?: string | null;
  }) => void;
  session?: MentoringSession | null;
  interns: Intern[];
  loading?: boolean;
}

export function SessionForm({ open, onClose, onSubmit, session, interns, loading }: SessionFormProps) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [internSearch, setInternSearch] = useState('');
  const [internDropdownOpen, setInternDropdownOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00');
  const [timePeriod, setTimePeriod] = useState<'AM' | 'PM'>('AM');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [location, setLocation] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [type, setType] = useState('in_person');
  const [agenda, setAgenda] = useState('');

  const isEdit = !!session;

  useEffect(() => {
    if (session) {
      setSelectedIds([session.intern_id]);
      setTitle(session.title || '');
      setScheduledDate(session.scheduled_date?.slice(0, 10) || '');
      if (session.scheduled_time) {
        const [h, m] = session.scheduled_time.split(':').map(Number);
        const p = h >= 12 ? 'PM' : 'AM';
        const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        setScheduledTime(`${h12}:${String(m).padStart(2, '0')}`);
        setTimePeriod(p as 'AM' | 'PM');
      } else {
        setScheduledTime('10:00');
        setTimePeriod('AM');
      }
      setDurationMinutes(session.duration_minutes?.toString() || '30');
      setLocation(session.location || '');
      setMeetingLink(session.meeting_link || '');
      setType(session.type || 'in_person');
      setAgenda(session.agenda || '');
    } else {
      setSelectedIds([]);
      setTitle('');
      setScheduledDate('');
      setScheduledTime('10:00');
      setTimePeriod('AM');
      setDurationMinutes('30');
      setLocation('');
      setMeetingLink('');
      setType('in_person');
      setAgenda('');
    }
    setInternSearch('');
    setInternDropdownOpen(false);
  }, [session, open]);

  const parseTo24 = (time: string, period: 'AM' | 'PM'): string => {
    const match = time.trim().match(/^(\d{1,2})(?::(\d{1,2}))?$/);
    if (!match) return time;
    let h = parseInt(match[1]);
    const m = String(parseInt(match[2] || '0')).padStart(2, '0');
    if (period === 'AM' && h === 12) h = 0;
    else if (period === 'PM' && h !== 12) h += 12;
    return `${String(h).padStart(2, '0')}:${m}`;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    onSubmit({
      intern_ids: selectedIds,
      title,
      scheduled_date: scheduledDate,
      scheduled_time: parseTo24(scheduledTime, timePeriod),
      duration_minutes: Number(durationMinutes) || 30,
      location: location || null,
      meeting_link: meetingLink || null,
      type,
      agenda: agenda || null,
    });
  };

  const toggleIntern = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(interns.map((i) => i.id));
    setInternDropdownOpen(false);
    setInternSearch('');
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const removeIntern = (id: number) => {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  };

  const selectedInterns = interns.filter((i) => selectedIds.includes(i.id));

  const filteredInterns = interns.filter((u) =>
    u.name.toLowerCase().includes(internSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(internSearch.toLowerCase())
  );

  const allSelected = interns.length > 0 && selectedIds.length === interns.length;

  const typeOptions = [
    { value: 'in_person', label: t('mentoring.inPerson') },
    { value: 'online', label: t('mentoring.online') },
    { value: 'hybrid', label: t('mentoring.hybrid') },
  ];

  const durationOptions = [
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
  ];

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t('mentoring.editSession') : t('mentoring.scheduleSession')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Intern selector */}
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">
            {t('mentoring.selectIntern')}<span className="text-[#dc2626] ml-0.5">*</span>
          </label>

          {/* Selected intern chips */}
          {selectedInterns.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedInterns.map((intern) => (
                <span
                  key={intern.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eef8fd] border border-[#48B6E8]/20 text-[0.78rem] font-medium text-[#1a6b8a]"
                >
                  <UserAvatar name={intern.name} avatar={intern.avatar} size="xs" />
                  {intern.name}
                  {!isEdit && (
                    <button type="button" onClick={() => removeIntern(intern.id)} className="ml-0.5 hover:text-[#dc2626] transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
              {selectedIds.length > 1 && !isEdit && (
                <button type="button" onClick={deselectAll} className="text-[0.75rem] text-[#9ca3af] hover:text-[#dc2626] px-2 py-1 transition-colors">
                  {t('mentoring.clearAll')}
                </button>
              )}
            </div>
          )}

          {!isEdit && (
            <div className="relative">
              <input
                type="text"
                value={internSearch}
                onChange={(e) => {
                  setInternSearch(e.target.value);
                  setInternDropdownOpen(true);
                }}
                onFocus={() => setInternDropdownOpen(true)}
                placeholder={selectedIds.length > 0 ? t('mentoring.addMoreInterns') : t('mentoring.searchIntern')}
                className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
              />
              {internDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e2d] border border-white/10 rounded-[5px] overflow-hidden z-50 max-h-[260px] overflow-y-auto" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
                  {/* Select All option */}
                  {interns.length > 1 && (
                    <button
                      type="button"
                      onClick={allSelected ? deselectAll : selectAll}
                      className={`flex items-center gap-2 w-full px-3 py-[10px] text-[0.82rem] font-semibold text-left transition-colors border-b border-white/10 ${
                        allSelected ? 'bg-[rgba(72,182,232,0.12)] text-white' : 'text-[#48B6E8] hover:bg-white/[0.06]'
                      }`}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      {allSelected ? t('mentoring.deselectAll') : t('mentoring.selectAllInterns')}
                      <span className="text-white/40 text-[0.75rem] ml-auto">{interns.length} {t('mentoring.interns')}</span>
                    </button>
                  )}
                  {filteredInterns.map((u) => {
                    const isSelected = selectedIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => { toggleIntern(u.id); }}
                        className={`flex items-center gap-2 w-full px-3 py-[10px] text-[0.82rem] font-medium text-left transition-colors ${
                          isSelected
                            ? 'bg-[rgba(72,182,232,0.12)] text-white'
                            : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#48B6E8] border-[#48B6E8]' : 'border-white/30'}`}>
                          {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <UserAvatar name={u.name} avatar={u.avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{u.name}</div>
                          {u.company_name && <div className="text-white/30 text-[0.7rem] truncate">{u.company_name}{u.position ? ` · ${u.position}` : ''}</div>}
                        </div>
                        {u.generation && <span className="text-white/30 text-[0.7rem] shrink-0">{u.generation}</span>}
                      </button>
                    );
                  })}
                  {filteredInterns.length === 0 && (
                    <div className="px-3 py-3 text-[0.82rem] text-white/40 text-center">{t('mentoring.noInternsFound')}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Intern info card — show when exactly 1 intern selected */}
        {selectedInterns.length === 1 && (
          <div className="p-3 rounded-[8px] bg-[#f8fafc] border border-[#e2e8f0]">
            <div className="flex items-center gap-3">
              <UserAvatar name={selectedInterns[0].name} avatar={selectedInterns[0].avatar} size="md" />
              <div className="flex-1 min-w-0">
                <p className="text-[0.9rem] font-semibold text-[#1a1a2e] truncate">{selectedInterns[0].name}</p>
                {selectedInterns[0].generation && (
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#48B6E8]/10 text-[#48B6E8] text-[0.7rem] font-medium">{selectedInterns[0].generation}</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
              {selectedInterns[0].email && (
                <div className="flex items-center gap-1.5 text-[0.78rem] text-[#6b7280]">
                  <Mail className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
                  <span className="truncate">{selectedInterns[0].email}</span>
                </div>
              )}
              {selectedInterns[0].phone && (
                <div className="flex items-center gap-1.5 text-[0.78rem] text-[#6b7280]">
                  <Phone className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
                  <span>{selectedInterns[0].phone}</span>
                </div>
              )}
              {selectedInterns[0].company_name && (
                <div className="flex items-center gap-1.5 text-[0.78rem] text-[#6b7280]">
                  <Building2 className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
                  <span className="truncate">{selectedInterns[0].company_name}</span>
                </div>
              )}
              {selectedInterns[0].position && (
                <div className="flex items-center gap-1.5 text-[0.78rem] text-[#6b7280]">
                  <Briefcase className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
                  <span className="truncate">{selectedInterns[0].position}</span>
                </div>
              )}
              {selectedInterns[0].department && (
                <div className="flex items-center gap-1.5 text-[0.78rem] text-[#6b7280]">
                  <GraduationCap className="h-3.5 w-3.5 text-[#9ca3af] shrink-0" />
                  <span className="truncate">{selectedInterns[0].department}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Multiple interns selected summary */}
        {selectedInterns.length > 1 && (
          <div className="p-3 rounded-[8px] bg-[#f0fdf4] border border-[#bbf7d0] flex items-center gap-2">
            <Users className="h-4 w-4 text-[#16a34a] shrink-0" />
            <p className="text-[0.82rem] text-[#15803d] font-medium">
              {t('mentoring.sessionForAll', { count: selectedInterns.length })}
            </p>
          </div>
        )}

        <Input label={t('mentoring.sessionTitle')} type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('mentoring.titlePlaceholder')} required />

        <div className="grid grid-cols-2 gap-3">
          <DatePicker label={t('mentoring.date')} value={scheduledDate} onChange={setScheduledDate} required />
          <TimePicker label={t('mentoring.time')} value={scheduledTime} period={timePeriod} onChange={setScheduledTime} onPeriodChange={setTimePeriod} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label={t('mentoring.duration')} options={durationOptions} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
          <Select label={t('mentoring.type')} options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} required />
        </div>

        <Input label={t('mentoring.location')} value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('mentoring.locationPlaceholder')} />
        {(type === 'online' || type === 'hybrid') && (
          <Input label={t('mentoring.meetingLink')} value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://meet.google.com/..." />
        )}

        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('mentoring.agenda')}</label>
          <textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            rows={3}
            placeholder={t('mentoring.agendaPlaceholder')}
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={loading} disabled={selectedIds.length === 0}>
            {isEdit ? t('common.update') : selectedIds.length > 1 ? t('mentoring.scheduleAll', { count: selectedIds.length }) : t('mentoring.schedule')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
