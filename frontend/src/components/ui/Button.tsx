import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-[#1e1e2d] text-white hover:bg-[#252a3e] focus:ring-[#1e1e2d]',
  secondary:
    'bg-white text-[#1e1e2d] border-[1.5px] border-[#d1d5db] hover:bg-[#f5f5f7] focus:ring-[#1e1e2d]',
  danger:
    'bg-white text-[#dc2626] border border-[#fecaca] hover:bg-[#fef2f2] focus:ring-[#dc2626]',
  ghost:
    'bg-transparent text-[#374151] hover:bg-[#f5f5f7] focus:ring-[#1e1e2d]',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-[0.8rem]',
  md: 'px-4 py-[9px] text-[0.82rem]',
  lg: 'px-6 py-3 text-base',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => (
  <button
    className={`inline-flex items-center justify-center rounded-[5px] font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    disabled={disabled || loading}
    {...props}
  >
    {loading && (
      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
    )}
    {children}
  </button>
);

export default Button;
