import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

const colorMap: Record<string, string> = {
  red: 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]',
  critical: 'bg-[#fef2f2] text-[#dc2626] border border-[#fecaca]',
  orange: 'bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa]',
  warning: 'bg-[#fff7ed] text-[#d97706] border border-[#fed7aa]',
  yellow: 'bg-[#fefce8] text-[#d97706] border border-[#fef08a]',
  green: 'bg-[#f0fdf4] text-[#22c55e] border border-[#bbf7d0]',
  success: 'bg-[#f0fdf4] text-[#22c55e] border border-[#bbf7d0]',
  blue: 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
  info: 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]',
  purple: 'bg-[#eef8fd] text-[#7c3aed] border border-[#ddd6fe]',
  gray: 'bg-[#f9fafb] text-[#6b7280] border border-[#e5e7eb]',
  pink: 'bg-[#fdf2f8] text-[#ec4899] border border-[#fbcfe8]',
};

export const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => (
  <span
    className={`inline-flex items-center rounded-[5px] px-[10px] py-[3px] text-[0.7rem] font-semibold ${colorMap[color] || colorMap.gray} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
