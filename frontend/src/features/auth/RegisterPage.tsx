import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';

import { Button } from '../../components/ui/Button';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import type { ApiError } from '../../types/api';
import { GraduationCap, List } from 'lucide-react';

const roleCards = [
  { slug: 'tutor', label: 'Tutor', image: '/tutor.png' },
  { slug: 'supervisor', label: 'Supervisor', image: '/supervisor.jpg' },
  { slug: 'intern', label: 'Intern', image: '/Intern.webp' },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState(1);
  const [roleSlug, setRoleSlug] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [department, setDepartment] = useState('');
  const [generation, setGeneration] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isIntern = roleSlug === 'intern';
  const totalSteps = isIntern ? 3 : 2;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        phone: phone || undefined,
        role: roleSlug,
        department: department || undefined,
        generation: generation || undefined,
        company_name: (isIntern || roleSlug === 'supervisor') ? (companyName || undefined) : undefined,
      });
      setAuth(res.user, res.token);
      navigate('/');
    } catch (err: unknown) {
      const apiErr = (err as { response?: { data?: ApiError } }).response?.data;
      if (apiErr?.errors) {
        const flat: Record<string, string> = {};
        for (const [key, msgs] of Object.entries(apiErr.errors)) {
          flat[key] = msgs[0];
        }
        setErrors(flat);
      } else {
        setErrors({ general: apiErr?.message || 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const dots = (
    <div className="flex items-center justify-center gap-[6px]">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={`w-[7px] h-[7px] rounded-full transition-all ${
            i + 1 === step ? 'bg-[#48B6E8]' : i + 1 < step ? 'bg-[#48B6E8] opacity-60' : 'bg-[#d9dbe4]'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f7fa' }}>

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="bg-white rounded-[5px] w-full max-w-[760px] px-12 py-14" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <div className="text-center mb-12">
            <h1 className="text-[1.55rem] font-bold text-[#1e1e2d]">Select your role</h1>
            <p className="mt-2 text-[0.88rem] text-[#a0a3b1]">
              To start your registration we need to know your role.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-10">
            {roleCards.map((role) => {
              const isSelected = roleSlug === role.slug;
              return (
                <button
                  key={role.slug}
                  type="button"
                  onClick={() => setRoleSlug(role.slug)}
                  className={`group flex flex-col items-center rounded-[5px] pt-6 pb-5 px-4 transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'border-[#48B6E8] bg-white'
                      : 'border-transparent bg-white hover:border-[#d1ecf8]'
                  }`}
                  style={isSelected ? { boxShadow: '0 0 0 1px #48B6E8' } : {}}
                >
                  <div className="w-[150px] h-[130px] flex items-center justify-center mb-4">
                    <img src={role.image} alt={role.label} className="max-w-full max-h-full object-contain" />
                  </div>
                  <span className={`text-[0.92rem] font-semibold transition-colors ${isSelected ? 'text-[#48B6E8]' : 'text-[#2d2d3a]'}`}>
                    {role.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-8">{dots}</div>

          <div className="flex flex-col items-center gap-5">
            <button
              type="button"
              disabled={!roleSlug}
              onClick={handleNext}
              className="px-12 py-[11px] rounded-[5px] bg-[#1e1e2d] text-white font-semibold text-[0.9rem] hover:bg-[#252a3e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <p className="text-[0.84rem] text-[#a0a3b1]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#48B6E8] hover:text-[#3a9fd4] font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Personal Information */}
      {step === 2 && (
        <div className="bg-white rounded-[5px] w-full max-w-[480px] px-10 py-10" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <div className="text-center mb-8">
            <h1 className="text-[1.55rem] font-bold text-[#1e1e2d]">Personal Information</h1>
            <p className="mt-2 text-[0.88rem] text-[#a0a3b1]">
              Registering as{' '}
              <span className="font-semibold text-[#48B6E8] capitalize">{roleSlug}</span>
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 rounded-[5px] bg-[#fef2f2] border border-[#fecaca] text-[0.85rem] text-[#dc2626]">
              {errors.general}
            </div>
          )}

          <div className="space-y-4">
            <Input label="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} required autoFocus />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} required />
              <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} placeholder="Optional" />
            </div>

            <Input label="Department" type="text" value={department} onChange={(e) => setDepartment(e.target.value)} error={errors.department} placeholder={isIntern ? 'e.g. Engineering' : 'e.g. Computer Science'} />

            {isIntern && (
              <div>
                <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Generation</label>
                <FilterDropdown
                  options={[
                    { value: '', label: 'Select Generation', icon: List },
                    ...Array.from({ length: new Date().getFullYear() - 2007 + 1 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return { value: String(year), label: `Generation ${year}`, icon: GraduationCap };
                    }),
                  ]}
                  value={generation}
                  onChange={setGeneration}
                  maxVisible={5}
                />
                {errors.generation && <p className="mt-1 text-[0.8rem] text-[#dc2626]">{errors.generation}</p>}
              </div>
            )}

            {roleSlug === 'supervisor' && (
              <Input label="Company Name" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} error={errors.company_name} placeholder="e.g. Tech Solutions Inc." required />
            )}

            {!isIntern && (
              <>
                <div className="border-t border-[#f0f0f2] pt-4 mt-4">
                  <p className="text-[0.8rem] font-semibold text-[#a0a3b1] uppercase tracking-wider mb-4">Security</p>
                </div>
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
                <Input label="Confirm Password" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} error={errors.password_confirmation} required />
              </>
            )}

            <div className="pt-3">{dots}</div>

            <div className="flex gap-3 pt-3">
              <button type="button" onClick={handleBack} className="flex-1 py-[11px] rounded-[5px] border border-[#e2e4ea] text-[#2d2d3a] font-semibold text-[0.9rem] hover:bg-[#f9fafb] transition-colors">
                Back
              </button>
              {isIntern ? (
                <button type="button" onClick={handleNext} className="flex-1 py-[11px] rounded-[5px] bg-[#1e1e2d] text-white font-semibold text-[0.9rem] hover:bg-[#252a3e] transition-colors">
                  Next
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="flex-1">
                  <Button type="submit" loading={loading} className="w-full py-[11px]">
                    Create account
                  </Button>
                </form>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-[0.84rem] text-[#a0a3b1]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#48B6E8] hover:text-[#3a9fd4] font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      )}

      {/* Step 3: Internship Details + Security (Intern only) */}
      {step === 3 && isIntern && (
        <div className="bg-white rounded-[5px] w-full max-w-[480px] px-10 py-10" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <div className="text-center mb-8">
            <h1 className="text-[1.55rem] font-bold text-[#1e1e2d]">Security</h1>
            <p className="mt-2 text-[0.88rem] text-[#a0a3b1]">
              Set your password to secure your account.
            </p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 rounded-[5px] bg-[#fef2f2] border border-[#fecaca] text-[0.85rem] text-[#dc2626]">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} required />
            <Input label="Confirm Password" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} error={errors.password_confirmation} required />

            <div className="pt-3">{dots}</div>

            <div className="flex gap-3 pt-3">
              <button type="button" onClick={handleBack} className="flex-1 py-[11px] rounded-[5px] border border-[#e2e4ea] text-[#2d2d3a] font-semibold text-[0.9rem] hover:bg-[#f9fafb] transition-colors">
                Back
              </button>
              <Button type="submit" loading={loading} className="flex-1 py-[11px]">
                Create account
              </Button>
            </div>
          </form>

          <p className="mt-6 text-center text-[0.84rem] text-[#a0a3b1]">
            Already have an account?{' '}
            <Link to="/login" className="text-[#48B6E8] hover:text-[#3a9fd4] font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
