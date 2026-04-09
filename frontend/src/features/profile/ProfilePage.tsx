import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, ImagePlus, User as UserIcon, Briefcase, Shield, ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { getMe } from '../../api/auth';
import client from '../../api/client';
import i18n from '../../i18n';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from '../../stores/toastStore';

type Tab = 'account' | 'internship' | 'security';

export function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [tab, setTab] = useState<Tab>('account');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [generation, setGeneration] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDepartment(user.department || '');
      setCompanyName(user.company_name || '');
      setPosition(user.position || '');
      setSupervisorName(user.supervisor_name || '');
      setGeneration(user.generation || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = { name, email, phone: phone || null, department: department || null };
      if (tab === 'internship') {
        Object.assign(payload, {
          company_name: companyName || null,
          position: position || null,
          supervisor_name: supervisorName || null,
          generation: generation || null,
        });
      }
      await client.put('/me', payload);
      const updated = await getMe();
      setUser(updated);
      toast.success(t('profile.updateSuccess'));
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('profile.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    setSaving(true);
    try {
      await client.put('/me/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success(t('profile.passwordSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('profile.passwordFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('profile.avatarTooLarge'));
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await client.post('/me/avatar', formData);
      const updated = await getMe();
      setUser(updated);
      toast.success(t('profile.avatarSuccess'));
    } catch {
      toast.error(t('profile.avatarFailed'));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error(t('profile.coverTooLarge'));
      return;
    }
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('cover', file);
      await client.post('/me/cover', formData);
      const updated = await getMe();
      setUser(updated);
      toast.success(t('profile.coverSuccess'));
    } catch {
      toast.error(t('profile.coverFailed'));
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const roleSlug = user?.role?.slug || '';
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const isIntern = roleSlug === 'intern';

  const languages = [
    { code: 'en', label: 'English', native: 'English', country: 'gb' },
    { code: 'km', label: 'Khmer', native: 'ភាសាខ្មែរ', country: 'kh' },
    { code: 'fr', label: 'French', native: 'Français', country: 'fr' },
    { code: 'mg', label: 'Malagasy', native: 'Malagasy', country: 'mg' },
    { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt', country: 'vn' },
  ];

  const flagUrl = (country: string) => `/flags/${country}.svg`;

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    if (user?.id) {
      localStorage.setItem(`language_${user.id}`, code);
    }
    toast.success(t('profile.languageChanged'));
  };

  const tabs: { key: Tab; label: string; icon: typeof UserIcon }[] = [
    { key: 'account', label: t('profile.accountSettings'), icon: UserIcon },
    ...(isIntern ? [{ key: 'internship' as Tab, label: t('profile.internshipInfo'), icon: Briefcase }] : []),
    { key: 'security', label: t('profile.security'), icon: Shield },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      {/* Cover banner - full width */}
      <div
        className="absolute top-0 left-0 right-0 h-[220px] sm:h-[260px] rounded-[5px] overflow-hidden -mx-4 sm:-mx-6 -mt-4 sm:-mt-6"
        style={{ backgroundImage: `url(${user?.cover || '/passerelles_numriques_cambodia_cover.jfif'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
      </div>

      {/* Cover change button - separate from cover div so it's not clipped */}
      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      <button
        onClick={() => coverInputRef.current?.click()}
        disabled={uploadingCover}
        className="absolute top-0 right-0 mt-2 mr-2 sm:mt-3 sm:mr-3 z-[20] flex items-center gap-1.5 px-4 py-2 rounded-[5px] bg-black/50 hover:bg-black/70 text-white text-[0.82rem] font-medium backdrop-blur-sm transition-colors disabled:opacity-50 cursor-pointer"
      >
        <ImagePlus className="w-3.5 h-3.5" />
        {uploadingCover ? t('common.saving') : t('profile.changeCover')}
      </button>

      {/* Content over cover */}
      <div className="relative z-[2] pt-[140px] sm:pt-[170px] pointer-events-none">
        <div className="pointer-events-auto">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left - Profile Card (overlapping cover) */}
          <div className="lg:w-[260px] shrink-0">
            <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-6 text-center" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {/* Avatar */}
              <div className="relative inline-block mb-4 -mt-16">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-[90px] h-[90px] rounded-full object-cover border-[4px] border-white" style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }} />
                ) : (
                  <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-[#6366f1] to-[#818cf8] flex items-center justify-center text-white text-[1.6rem] font-bold border-[4px] border-white" style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                    {initials}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:text-[#6366f1] hover:border-[#6366f1] transition-colors disabled:opacity-50"
                  style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>

              <h2 className="text-[0.95rem] font-bold text-[#1e1b4b] mb-0.5">{user?.name || 'User'}</h2>
              <p className="text-[0.78rem] text-[#6366f1] font-medium capitalize">{roleSlug}</p>
              {isIntern && user?.company_name && (
                <p className="text-[0.75rem] text-[#9ca3af] mt-0.5">{user.company_name}</p>
              )}

              {/* Info */}
              <div className="mt-5 pt-5 border-t border-[#f0f0f0] space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[0.75rem] text-[#6b7280]">{t('auth.email')}</span>
                  <span className="text-[0.75rem] text-[#374151] font-medium truncate ml-2 max-w-[130px]">{user?.email}</span>
                </div>
                {user?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-[#6b7280]">{t('auth.phone')}</span>
                    <span className="text-[0.75rem] text-[#374151] font-medium">{user.phone}</span>
                  </div>
                )}
                {user?.department && (
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-[#6b7280]">{t('auth.department')}</span>
                    <span className="text-[0.75rem] text-[#374151] font-medium">{user.department}</span>
                  </div>
                )}
                {isIntern && user?.generation && (
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-[#6b7280]">{t('auth.generation')}</span>
                    <span className="text-[0.75rem] text-[#374151] font-medium">{user.generation}</span>
                  </div>
                )}
                {isIntern && user?.tutor && (
                  <div className="flex items-center justify-between">
                    <span className="text-[0.75rem] text-[#6b7280]">{t('profile.tutor')}</span>
                    <div className="flex items-center gap-1.5 ml-2">
                      {user.tutor.avatar ? (
                        <img src={user.tutor.avatar} alt={user.tutor.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white text-[0.5rem] font-semibold shrink-0">
                          {user.tutor.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-[0.75rem] text-[#374151] font-medium truncate max-w-[100px]">{user.tutor.name}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Verified */}
              <div className="mt-4 pt-4 border-t border-[#f0f0f0]">
                {user?.email_verified_at ? (
                  <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-[#22c55e] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                    {t('profile.verified')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-[#f59e0b] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                    {t('profile.unverified')}
                  </span>
                )}
              </div>

              {/* Language Dropdown */}
              <div className="mt-4 pt-4 border-t border-[#f0f0f0] relative">
                <label className="block text-[0.7rem] font-medium text-[#9ca3af] uppercase tracking-wider mb-2 text-left">{t('profile.language')}</label>
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[6px] border border-[#e5e7eb] hover:border-[#c7c8d9] bg-[#f9fafb] hover:bg-white transition-all text-left"
                >
                  <img src={flagUrl(currentLang.country)} alt={currentLang.label} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0" />
                  <span className="text-[0.82rem] font-medium text-[#374151] flex-1">{currentLang.native}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#9ca3af] transition-transform ${langDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {langDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setLangDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-[#e5e7eb] rounded-[8px] overflow-hidden z-40" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
                      {languages.map((lang) => {
                        const isActive = i18n.language === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => { changeLanguage(lang.code); setLangDropdownOpen(false); }}
                            className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-colors ${
                              isActive ? 'bg-[#6366f1]/5' : 'hover:bg-[#f5f5f5]'
                            }`}
                          >
                            <img src={flagUrl(lang.country)} alt={lang.label} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0" />
                            <div className="flex-1 min-w-0">
                              <span className={`text-[0.82rem] font-medium ${isActive ? 'text-[#6366f1]' : 'text-[#374151]'}`}>{lang.native}</span>
                            </div>
                            {isActive && <Check className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right - Settings Card (overlapping cover) */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[5px] border border-[#e5e7eb]" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              {/* Tabs */}
              <div className="border-b border-[#f0f0f0] px-6">
                <div className="flex gap-0 overflow-x-auto">
                  {tabs.map((t_item) => (
                    <button
                      key={t_item.key}
                      onClick={() => setTab(t_item.key)}
                      className={`flex items-center gap-2 px-4 py-3.5 text-[0.82rem] font-medium border-b-2 transition-colors whitespace-nowrap ${
                        tab === t_item.key
                          ? 'border-[#6366f1] text-[#6366f1]'
                          : 'border-transparent text-[#9ca3af] hover:text-[#374151]'
                      }`}
                    >
                      <t_item.icon className="w-4 h-4" />
                      {t_item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab content */}
              <div className="p-6">
                {tab === 'account' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input label={t('auth.fullName')} value={name} onChange={(e) => setName(e.target.value)} />
                      <Input label={t('auth.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <Input label={t('auth.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('auth.optional')} />
                      <Input label={t('auth.department')} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder={t('auth.optional')} />
                    </div>
                    <div className="flex justify-start pt-2">
                      <Button onClick={handleUpdateProfile} loading={saving}>{t('common.update')}</Button>
                    </div>
                  </div>
                )}

                {tab === 'internship' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input label={t('auth.companyName')} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder={t('auth.optional')} />
                      <Input label={t('users.position')} value={position} onChange={(e) => setPosition(e.target.value)} placeholder={t('auth.optional')} />
                      <Input label={t('users.supervisorName')} value={supervisorName} onChange={(e) => setSupervisorName(e.target.value)} placeholder={t('auth.optional')} />
                      <Input label={t('auth.generation')} value={generation} onChange={(e) => setGeneration(e.target.value)} placeholder={t('auth.optional')} />
                    </div>
                    <div className="flex justify-start pt-2">
                      <Button onClick={handleUpdateProfile} loading={saving}>{t('common.update')}</Button>
                    </div>
                  </div>
                )}

                {tab === 'security' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <Input label={t('profile.currentPassword')} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                      </div>
                      <Input label={t('profile.newPassword')} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      <Input label={t('auth.confirmPassword')} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>
                    <div className="flex justify-start pt-2">
                      <Button onClick={handleUpdatePassword} loading={saving} disabled={!currentPassword || !newPassword || !confirmPassword}>
                        {t('profile.changePassword')}
                      </Button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
