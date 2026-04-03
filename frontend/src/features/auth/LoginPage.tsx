import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import type { ApiError } from '../../types/api';

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const res = await login({ email, password });
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
        setErrors({ general: apiErr?.message || 'Login failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9fb' }}>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-[5px] border border-[#f0f0f0] p-10 w-full max-w-[420px]" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div className="text-center mb-8">
            <h1 className="text-[1.7rem] font-bold text-[#1e1b4b]">Sign in</h1>
            <p className="mt-2 text-[0.92rem] text-[#9ca3af]">Sign in to your account</p>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 rounded-[5px] bg-[#fef2f2] border border-[#fecaca] text-[0.85rem] text-[#dc2626]">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              required
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              required
            />
            <Button type="submit" loading={loading} className="w-full py-[11px]">
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-[0.85rem] text-[#6b7280]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#3a9fd4] hover:text-[#3a9fd4] font-semibold transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
