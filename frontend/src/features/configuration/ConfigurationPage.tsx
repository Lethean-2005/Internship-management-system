import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Settings } from '../../api/settings';

const timezones = [
  'UTC', 'Europe/Paris', 'Europe/London', 'Europe/Berlin', 'Europe/Madrid',
  'Europe/Rome', 'Europe/Brussels', 'America/New_York', 'America/Chicago',
  'America/Denver', 'America/Los_Angeles', 'America/Toronto', 'America/Sao_Paulo',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore',
  'Australia/Sydney', 'Pacific/Auckland', 'Africa/Cairo', 'Africa/Casablanca',
];

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'km', label: 'ខ្មែរ (Khmer)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'mg', label: 'Malagasy' },
  { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
];

// semesters are defined inside the component to use t()

const inputClass = 'w-full px-3 py-[9px] text-[0.85rem] border border-[#d1d5db] rounded-[5px] focus:outline-none focus:ring-2 focus:ring-[#1e1e2d] focus:border-transparent transition-colors';
const selectClass = `${inputClass} bg-white`;
const labelClass = 'block text-[0.8rem] font-medium text-[#374151] mb-1.5';
const hintClass = 'mt-1 text-[0.75rem] text-[#9ca3af]';

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 lg:gap-10 border-b border-[#f0f0f0] pb-8">
      <div className="mb-4 lg:mb-0 lg:pt-1">
        <h2 className="text-[0.92rem] font-semibold text-[#1e1b4b]">{title}</h2>
        <p className="mt-1 text-[0.78rem] text-[#9ca3af] leading-relaxed">{description}</p>
      </div>
      <div className="bg-white border border-[#f0f0f0] rounded-[5px] p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description: string }) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer py-3 border-b border-[#f5f5f5] last:border-0">
      <div className="min-w-0">
        <span className="block text-[0.85rem] font-medium text-[#374151]">{label}</span>
        <span className="block text-[0.78rem] text-[#9ca3af] mt-0.5">{description}</span>
      </div>
      <div className="relative shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
        <div
          onClick={() => onChange(!checked)}
          className={`w-10 h-[22px] rounded-full transition-colors cursor-pointer ${checked ? 'bg-[#1e1e2d]' : 'bg-[#d1d5db]'}`}
        >
          <div className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`} />
        </div>
      </div>
    </label>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-1 sm:gap-4 items-start py-3 border-b border-[#f5f5f5] last:border-0">
      <div className="sm:pt-[9px]">
        <span className={labelClass}>{label}</span>
      </div>
      <div>
        {children}
        {hint && <p className={hintClass}>{hint}</p>}
      </div>
    </div>
  );
}

export function ConfigurationPage() {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [form, setForm] = useState<Partial<Settings>>({});

  const semesters = [
    { value: 'fall', label: t('config.fall') },
    { value: 'spring', label: t('config.spring') },
    { value: 'summer', label: t('config.summer') },
    { value: 'full_year', label: t('config.fullYear') },
  ];

  useEffect(() => {
    if (settings) {
      setForm({ ...settings });
    }
  }, [settings]);

  const handleChange = (key: keyof Settings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'default_language') {
      i18n.changeLanguage(value);
      localStorage.setItem('language', value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) return <LoadingSpinner className="py-12" />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">{t('config.title')}</h1>
          <p className="mt-1 text-[0.85rem] text-[#6b7280]">{t('config.subtitle')}</p>
        </div>
        <Button onClick={handleSubmit} loading={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {t('config.saveChanges')}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* General */}
        <Section title={t('config.general')} description={t('config.generalDesc')}>
          <FieldRow label={t('config.appName')}>
            <input type="text" value={form.app_name || ''} onChange={(e) => handleChange('app_name', e.target.value)} className={inputClass} />
          </FieldRow>
          <FieldRow label={t('config.appDescription')}>
            <textarea value={form.app_description || ''} onChange={(e) => handleChange('app_description', e.target.value)} rows={2} className={inputClass} placeholder="Brief description..." />
          </FieldRow>
          <FieldRow label={t('config.contactEmail')}>
            <input type="email" value={form.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} className={inputClass} placeholder="admin@example.com" />
          </FieldRow>
          <FieldRow label={t('config.timezone')}>
            <select value={form.app_timezone || 'UTC'} onChange={(e) => handleChange('app_timezone', e.target.value)} className={selectClass}>
              {timezones.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </FieldRow>
          <FieldRow label={t('config.language')}>
            <select value={form.default_language || 'en'} onChange={(e) => handleChange('default_language', e.target.value)} className={selectClass}>
              {languages.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </FieldRow>
        </Section>

        {/* Academic Period */}
        <Section title={t('config.academicPeriod')} description={t('config.academicPeriodDesc')}>
          <FieldRow label={t('config.academicYear')} hint={t('config.academicYearHint')}>
            <input type="text" value={form.academic_year || ''} onChange={(e) => handleChange('academic_year', e.target.value)} className={inputClass} placeholder="2025-2026" />
          </FieldRow>
          <FieldRow label={t('config.semester')}>
            <select value={form.semester || 'spring'} onChange={(e) => handleChange('semester', e.target.value)} className={selectClass}>
              {semesters.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </FieldRow>
        </Section>

        {/* Internship */}
        <Section title={t('config.internship')} description={t('config.internshipDesc')}>
          <FieldRow label={t('config.maxInternsPerTutor')} hint={t('config.maxInternsPerTutorHint')}>
            <input type="number" min="1" max="100" value={form.max_interns_per_tutor || ''} onChange={(e) => handleChange('max_interns_per_tutor', e.target.value)} className={inputClass} />
          </FieldRow>
          <FieldRow label={t('config.maxLeaveDays')} hint={t('config.maxLeaveDaysHint')}>
            <input type="number" min="0" max="60" value={form.max_leave_days_per_intern || ''} onChange={(e) => handleChange('max_leave_days_per_intern', e.target.value)} className={inputClass} />
          </FieldRow>
          <FieldRow label={t('config.minDuration')} hint={t('config.minDurationHint')}>
            <input type="number" min="1" max="52" value={form.internship_min_duration_weeks || ''} onChange={(e) => handleChange('internship_min_duration_weeks', e.target.value)} className={inputClass} />
          </FieldRow>
          <FieldRow label={t('config.maxDuration')} hint={t('config.maxDurationHint')}>
            <input type="number" min="1" max="104" value={form.internship_max_duration_weeks || ''} onChange={(e) => handleChange('internship_max_duration_weeks', e.target.value)} className={inputClass} />
          </FieldRow>
          <FieldRow label={t('config.submissionDay')} hint={t('config.submissionDayHint')}>
            <select value={form.worklog_submission_day || 'friday'} onChange={(e) => handleChange('worklog_submission_day', e.target.value)} className={selectClass}>
              {weekdays.map((day) => <option key={day} value={day}>{t(`weekdays.${day}`)}</option>)}
            </select>
          </FieldRow>
        </Section>

        {/* Approval Workflow */}
        <Section title={t('config.approvalWorkflow')} description={t('config.approvalWorkflowDesc')}>
          <Toggle
            checked={form.require_worklog_approval === '1'}
            onChange={(v) => handleChange('require_worklog_approval', v ? '1' : '0')}
            label={t('config.worklogApproval')}
            description={t('config.worklogApprovalDesc')}
          />
          <Toggle
            checked={form.require_report_approval === '1'}
            onChange={(v) => handleChange('require_report_approval', v ? '1' : '0')}
            label={t('config.finalReportApproval')}
            description={t('config.finalReportApprovalDesc')}
          />
          <Toggle
            checked={form.require_slide_approval === '1'}
            onChange={(v) => handleChange('require_slide_approval', v ? '1' : '0')}
            label={t('config.finalSlidesApproval')}
            description={t('config.finalSlidesApprovalDesc')}
          />
        </Section>

        {/* File Uploads */}
        <Section title={t('config.fileUploads')} description={t('config.fileUploadsDesc')}>
          <FieldRow label={t('config.maxUploadSize')} hint={t('config.maxUploadSizeHint')}>
            <div className="relative">
              <input type="number" min="1" max="100" value={form.max_file_upload_mb || ''} onChange={(e) => handleChange('max_file_upload_mb', e.target.value)} className={inputClass} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] text-[#9ca3af]">MB</span>
            </div>
          </FieldRow>
          <FieldRow label={t('config.reportFormats')} hint={t('config.reportFormatsHint')}>
            <input type="text" value={form.allowed_report_formats || ''} onChange={(e) => handleChange('allowed_report_formats', e.target.value)} className={inputClass} placeholder="pdf,docx" />
          </FieldRow>
          <FieldRow label={t('config.slideFormats')} hint={t('config.slideFormatsHint')}>
            <input type="text" value={form.allowed_slide_formats || ''} onChange={(e) => handleChange('allowed_slide_formats', e.target.value)} className={inputClass} placeholder="pdf,pptx" />
          </FieldRow>
        </Section>

        {/* Notifications */}
        <Section title={t('config.notifications')} description={t('config.notificationsDesc')}>
          <Toggle
            checked={form.notify_tutor_on_submission === '1'}
            onChange={(v) => handleChange('notify_tutor_on_submission', v ? '1' : '0')}
            label={t('config.tutorOnSubmission')}
            description={t('config.tutorOnSubmissionDesc')}
          />
          <Toggle
            checked={form.notify_intern_on_review === '1'}
            onChange={(v) => handleChange('notify_intern_on_review', v ? '1' : '0')}
            label={t('config.internOnReview')}
            description={t('config.internOnReviewDesc')}
          />
          <Toggle
            checked={form.notify_admin_on_registration === '1'}
            onChange={(v) => handleChange('notify_admin_on_registration', v ? '1' : '0')}
            label={t('config.adminOnRegistration')}
            description={t('config.adminOnRegistrationDesc')}
          />
        </Section>

        {/* Security & Access */}
        <Section title={t('config.securityAccess')} description={t('config.securityAccessDesc')}>
          <FieldRow label={t('config.sessionLifetime')} hint={t('config.sessionLifetimeHint')}>
            <div className="relative">
              <input type="number" min="5" max="1440" value={form.session_lifetime_minutes || ''} onChange={(e) => handleChange('session_lifetime_minutes', e.target.value)} className={inputClass} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] text-[#9ca3af]">min</span>
            </div>
          </FieldRow>
          <FieldRow label={t('config.passwordLength')} hint={t('config.passwordLengthHint')}>
            <div className="relative">
              <input type="number" min="6" max="32" value={form.password_min_length || ''} onChange={(e) => handleChange('password_min_length', e.target.value)} className={inputClass} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.78rem] text-[#9ca3af]">chars</span>
            </div>
          </FieldRow>
          <div className="mt-2">
            <Toggle
              checked={form.allow_registration === '1'}
              onChange={(v) => handleChange('allow_registration', v ? '1' : '0')}
              label={t('config.allowRegistration')}
              description={t('config.allowRegistrationDesc')}
            />
            <Toggle
              checked={form.require_email_verification === '1'}
              onChange={(v) => handleChange('require_email_verification', v ? '1' : '0')}
              label={t('config.emailVerification')}
              description={t('config.emailVerificationDesc')}
            />
            <Toggle
              checked={form.maintenance_mode === '1'}
              onChange={(v) => handleChange('maintenance_mode', v ? '1' : '0')}
              label={t('config.maintenanceMode')}
              description={t('config.maintenanceModeDesc')}
            />
          </div>
        </Section>

        {/* Bottom Save */}
        <div className="flex justify-end pt-2 pb-4">
          <Button type="submit" loading={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {t('config.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}
