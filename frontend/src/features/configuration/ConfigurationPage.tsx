import { useState, useEffect } from 'react';
import { Save, Globe, GraduationCap, Briefcase, Shield, Mail, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { useSettings, useUpdateSettings } from '../../hooks/useSettings';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import type { Settings } from '../../api/settings';

const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const languages = [
  { value: 'en', label: 'English' },
  { value: 'km', label: 'ខ្មែរ (Khmer)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'mg', label: 'Malagasy' },
  { value: 'vi', label: 'Tiếng Việt (Vietnamese)' },
];

const inputClass = 'w-full px-3 py-[8px] text-[0.82rem] border border-[#e5e7eb] rounded-[6px] bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20 focus:border-[#6366f1] focus:bg-white transition-all';

function MiniCard({ icon: Icon, color, title, children }: { icon: LucideIcon; color: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[8px] border border-[#e5e7eb] relative" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#f3f4f6] rounded-t-[8px]">
        <div className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}14` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <h3 className="text-[0.82rem] font-semibold text-[#1e1b4b]">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-3">{children}</div>
    </div>
  );
}

function SmallField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[0.75rem] font-medium text-[#6b7280] mb-1">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[0.68rem] text-[#9ca3af]">{hint}</p>}
    </div>
  );
}

function SmallToggle({ checked, onChange, label, icon: Icon, color }: { checked: boolean; onChange: (v: boolean) => void; label: string; icon?: LucideIcon; color?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-[#f5f5f5] last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: color || '#9ca3af' }} />}
        <span className="text-[0.8rem] text-[#374151] truncate">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${checked ? 'bg-[#6366f1]' : 'bg-[#d1d5db]'}`}
      >
        <div className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

export function ConfigurationPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: settings, isLoading } = useSettings();
  const updateMutation = useUpdateSettings();
  const [form, setForm] = useState<Partial<Settings>>({});

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const handleChange = (key: keyof Settings, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'default_language') {
      i18n.changeLanguage(value);
      localStorage.setItem('language', value);
      if (user?.id) {
        localStorage.setItem(`language_${user.id}`, value);
      }
    }
  };

  const sel = (key: keyof Settings) => ({
    value: form[key] || '',
    onChange: (e: { target: { value: string } }) => handleChange(key, e.target.value),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const semesterOptions = [
    { value: 'fall', label: t('config.fall') },
    { value: 'spring', label: t('config.spring') },
    { value: 'summer', label: t('config.summer') },
    { value: 'full_year', label: t('config.fullYear') },
  ];

  const languageOptions = languages.map((l) => ({ value: l.value, label: l.label }));
  const weekdayOptions = weekdays.map((day) => ({ value: day, label: t(`weekdays.${day}`) }));

  if (isLoading) return <LoadingSpinner className="py-12" />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[1.2rem] font-bold text-[#1e1b4b]">{t('config.title')}</h1>
          <p className="mt-0.5 text-[0.82rem] text-[#6b7280]">{t('config.subtitle')}</p>
        </div>
        <Button onClick={handleSubmit} loading={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-1.5" />
          {t('config.saveChanges')}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* General */}
        <MiniCard icon={Globe} color="#6366f1" title={t('config.general')}>
          <SmallField label={t('config.appName')}>
            <input type="text" value={form.app_name || ''} onChange={(e) => handleChange('app_name', e.target.value)} className={inputClass} />
          </SmallField>
          <SmallField label={t('config.language')}>
            <Select options={languageOptions} {...sel('default_language')} />
          </SmallField>
        </MiniCard>

        {/* Academic Period */}
        <MiniCard icon={GraduationCap} color="#22c55e" title={t('config.academicPeriod')}>
          <SmallField label={t('config.academicYear')} hint={t('config.academicYearHint')}>
            <input type="text" value={form.academic_year || ''} onChange={(e) => handleChange('academic_year', e.target.value)} className={inputClass} placeholder="2025-2026" />
          </SmallField>
          <SmallField label={t('config.semester')}>
            <Select options={semesterOptions} {...sel('semester')} />
          </SmallField>
        </MiniCard>

        {/* Internship Rules */}
        <MiniCard icon={Briefcase} color="#f59e0b" title={t('config.internship')}>
          <div className="grid grid-cols-2 gap-3">
            <SmallField label={t('config.maxInternsPerTutor')} hint={t('config.maxInternsPerTutorHint')}>
              <input type="number" min="1" max="100" value={form.max_interns_per_tutor || ''} onChange={(e) => handleChange('max_interns_per_tutor', e.target.value)} className={inputClass} />
            </SmallField>
            <SmallField label={t('config.maxLeaveDays')} hint={t('config.maxLeaveDaysHint')}>
              <input type="number" min="0" max="60" value={form.max_leave_days_per_intern || ''} onChange={(e) => handleChange('max_leave_days_per_intern', e.target.value)} className={inputClass} />
            </SmallField>
          </div>
          <SmallField label={t('config.submissionDay')} hint={t('config.submissionDayHint')}>
            <Select options={weekdayOptions} {...sel('worklog_submission_day')} />
          </SmallField>
        </MiniCard>

        {/* Users & Registration */}
        <MiniCard icon={Users} color="#6366f1" title={t('config.userManagement')}>
          <SmallToggle
            checked={form.allow_registration === '1'}
            onChange={(v) => handleChange('allow_registration', v ? '1' : '0')}
            label={t('config.allowRegistration')}
            icon={Users}
            color="#6366f1"
          />
          <SmallToggle
            checked={form.require_email_verification === '1'}
            onChange={(v) => handleChange('require_email_verification', v ? '1' : '0')}
            label={t('config.emailVerification')}
            icon={Mail}
            color="#0d9488"
          />
        </MiniCard>

        {/* Security & Access */}
        <MiniCard icon={Shield} color="#ef4444" title={t('config.securityAccess')}>
          <SmallField label={t('config.passwordLength')} hint={t('config.passwordLengthHint')}>
            <div className="relative">
              <input type="number" min="6" max="32" value={form.password_min_length || ''} onChange={(e) => handleChange('password_min_length', e.target.value)} className={inputClass} />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.68rem] text-[#9ca3af] pointer-events-none">chars</span>
            </div>
          </SmallField>
          <SmallToggle
            checked={form.maintenance_mode === '1'}
            onChange={(v) => handleChange('maintenance_mode', v ? '1' : '0')}
            label={t('config.maintenanceMode')}
            icon={Shield}
            color="#ef4444"
          />
        </MiniCard>

        {/* Bottom Save */}
        <div className="md:col-span-2 xl:col-span-3 flex justify-end pt-1 pb-4">
          <Button type="submit" loading={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-1.5" />
            {t('config.saveChanges')}
          </Button>
        </div>
      </form>
    </div>
  );
}
