import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { verifyEmail, resendCode, getMe } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { toast } from '../../stores/toastStore';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  // Redirect if already verified
  useEffect(() => {
    if (user?.email_verified_at) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];

    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 4).split('');
      digits.forEach((d, i) => {
        if (i + index < 4) newCode[i + index] = d;
      });
      setCode(newCode);
      inputRefs.current[Math.min(index + digits.length, 3)]?.focus();
      return;
    }

    newCode[index] = value;
    setCode(newCode);
    setError('');

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError(t('verify.enterAllDigits'));
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyEmail(fullCode);
      const updatedUser = await getMe();
      setUser(updatedUser);
      toast.success(t('verify.success'));
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || t('verify.failed'));
      setCode(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendCode();
      toast.success(t('verify.codeSent'));
      setCode(['', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('verify.resendFailed'));
    } finally {
      setResending(false);
    }
  };

  const handleCancel = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  // Auto-submit when all 4 digits entered
  useEffect(() => {
    if (code.every(d => d !== '')) {
      handleVerify();
    }
  }, [code]);

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  if (!token) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f7fa' }}>
      <div
        className="bg-white rounded-[5px] w-full max-w-[400px] overflow-hidden"
        style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}
      >
        {/* Content */}
        <div className="px-8 pt-10 pb-6">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#1e1e2d] flex items-center justify-center" style={{ boxShadow: '0 4px 16px rgba(30,30,45,0.2)' }}>
              <Mail className="w-7 h-7 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-[1.35rem] font-bold text-[#1e1b4b] text-center mb-2">
            {t('verify.title')}
          </h1>
          <p className="text-[0.88rem] text-[#6b7280] text-center mb-8">
            {t('verify.subtitle')}{' '}
            <span className="font-semibold text-[#374151]">{maskedEmail}</span>
          </p>

          {/* OTP Inputs */}
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
                  digit
                    ? 'border-[#1e1e2d] bg-[#f8f9fb] text-[#1e1b4b]'
                    : 'border-[#e5e7eb] bg-white text-[#1e1b4b]'
                } focus:border-[#1e1e2d] focus:ring-4 focus:ring-[#1e1e2d]/10`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-[0.82rem] text-[#dc2626] text-center mb-3">{error}</p>
          )}

          {/* Resend */}
          <p className="text-[0.85rem] text-[#6b7280] text-center mt-5">
            {t('verify.noCode')}{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-semibold text-[#1e1b4b] hover:text-[#48B6E8] transition-colors disabled:opacity-50"
            >
              {resending ? t('verify.sending') : t('verify.clickResend')}
            </button>
          </p>
        </div>

        {/* Bottom buttons */}
        <div className="flex gap-3 px-8 py-5 bg-[#f9fafb] border-t border-[#f0f0f0]">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            className="flex-1 py-[11px]"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleVerify}
            loading={loading}
            disabled={code.some(d => d === '')}
            className="flex-1 py-[11px]"
          >
            {t('verify.verify')}
          </Button>
        </div>
      </div>
    </div>
  );
}
