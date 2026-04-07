import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { verifyEmail, resendCode } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { toast } from '../../stores/toastStore';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if not logged in
  if (!token) {
    window.location.href = '/login';
    return null;
  }

  // Redirect if already verified
  if (user?.email_verified_at) {
    window.location.href = '/';
    return null;
  }

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (loading) return;
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError(t('verify.enterAllDigits'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verifyEmail(fullCode);
      // Force full page reload — app will re-fetch user with email_verified_at set
      window.location.replace('/');
    } catch (err: any) {
      setError(err.response?.data?.message || t('verify.failed'));
      setCode(['', '', '', '']);
      setLoading(false);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await resendCode();
      toast.success(t('verify.codeSent'));
      setCode(['', '', '', '']);
      setCountdown(300);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('verify.resendFailed'));
    } finally {
      setResending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 4).split('');
      digits.forEach((d, i) => { if (i + index < 4) newCode[i + index] = d; });
      setCode(newCode);
      inputRefs.current[Math.min(index + digits.length, 3)]?.focus();
      return;
    }
    newCode[index] = value;
    setCode(newCode);
    setError('');
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length > 0) {
      const newCode = ['', '', '', ''];
      pasted.split('').forEach((d, i) => { newCode[i] = d; });
      setCode(newCode);
      inputRefs.current[Math.min(pasted.length, 3)]?.focus();
    }
  };

  // Auto-submit when all 4 digits entered
  useEffect(() => {
    if (code.every(d => d !== '') && !loading) handleVerify();
  }, [code]);

  const maskedEmail = user?.email ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f7fa' }}>
      <div className="bg-white rounded-[5px] w-full max-w-[400px] overflow-hidden" style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
        <div className="px-8 pt-10 pb-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#1e1e2d] flex items-center justify-center" style={{ boxShadow: '0 4px 16px rgba(30,30,45,0.2)' }}>
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>

          <h1 className="text-[1.35rem] font-bold text-[#1e1b4b] text-center mb-2">{t('verify.title')}</h1>
          <p className="text-[0.88rem] text-[#6b7280] text-center mb-8">
            {t('verify.subtitle')} <span className="font-semibold text-[#374151]">{maskedEmail}</span>
          </p>

          <div className="flex justify-center gap-3 mb-4" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-[64px] h-[64px] text-center text-[1.5rem] font-bold rounded-[5px] border-2 transition-all outline-none ${
                  digit ? 'border-[#1e1e2d] bg-[#f8f9fb] text-[#1e1b4b]' : 'border-[#e5e7eb] bg-white text-[#1e1b4b]'
                } focus:border-[#1e1e2d] focus:ring-4 focus:ring-[#1e1e2d]/10`}
              />
            ))}
          </div>

          {error && <p className="text-[0.82rem] text-[#dc2626] text-center mb-3">{error}</p>}

          <div className="text-center mt-4 mb-2">
            {countdown > 0 ? (
              <span className={`text-[0.85rem] font-medium ${countdown <= 30 ? 'text-[#dc2626]' : 'text-[#6b7280]'}`}>
                {t('verify.expiresIn')} {formatTime(countdown)}
              </span>
            ) : (
              <span className="text-[0.85rem] font-medium text-[#dc2626]">{t('verify.expired')}</span>
            )}
          </div>

          <p className="text-[0.85rem] text-[#6b7280] text-center mt-3">
            {t('verify.noCode')}{' '}
            <button onClick={handleResend} disabled={resending} className="font-semibold text-[#1e1b4b] hover:text-[#48B6E8] transition-colors disabled:opacity-50">
              {resending ? t('verify.sending') : t('verify.clickResend')}
            </button>
          </p>
        </div>

        <div className="flex gap-3 px-8 py-5 bg-[#f9fafb] border-t border-[#f0f0f0]">
          <Button type="button" variant="secondary" onClick={() => { clearAuth(); window.location.href = '/login'; }} className="flex-1 py-[11px]">
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={handleVerify} loading={loading} disabled={code.some(d => d === '') || countdown === 0} className="flex-1 py-[11px]">
            {t('verify.verify')}
          </Button>
        </div>
      </div>
    </div>
  );
}
