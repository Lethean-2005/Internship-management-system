import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, GraduationCap } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface PassedInterview {
  id: number;
  company_name: string;
  employment_type: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    avatar: string | null;
    company_name: string | null;
    position: string | null;
    generation: string | null;
    role: string | null;
  } | null;
}

interface Props {
  interview: PassedInterview;
  onClose: () => void;
}

export function CongratulationsOverlay({ interview, onClose }: Props) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  const u = interview.user;
  if (!u) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div
        className="relative w-full max-w-[440px] mx-4 bg-white rounded-[5px] overflow-hidden"
        style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.2)', animation: 'congratsSlideUp 0.4s ease-out' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-[5px] bg-[#f0f0f0] hover:bg-[#e5e5e5] flex items-center justify-center text-[#6b7280] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Countdown */}
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-[5px] bg-[#f0f0f0] text-[#6b7280] text-[0.7rem] font-medium">
          {countdown}s
        </div>

        {/* Content */}
        <div className="px-8 pt-8 pb-7 text-center">
          {/* Congrats image as icon */}
          <div className="flex justify-center mb-4">
            <div className="w-[120px] h-[120px] rounded-full bg-[#f0fdf4] flex items-center justify-center">
              <GraduationCap className="w-16 h-16 text-[#22c55e]" />
            </div>
          </div>

          <h2 className="text-[1.5rem] font-extrabold text-[#1e1b4b] mb-1">
            {t('congrats.title')}
          </h2>
          <p className="text-[0.88rem] text-[#6b7280] font-medium mb-6">
            {t('congrats.subtitle')}
          </p>

          {/* User card */}
          <div className="bg-[#f9fafb] rounded-[5px] p-5 mb-5 border border-[#f0f0f0]">
            <div className="flex items-center gap-4">
              <UserAvatar name={u.name} avatar={u.avatar} size="lg" className="border-[3px] border-white shadow-md" />
              <div className="text-left flex-1 min-w-0">
                <h3 className="text-[0.95rem] font-bold text-[#1e1b4b] truncate">{u.name}</h3>
                {u.position && (
                  <p className="text-[0.8rem] text-[#374151] font-medium truncate">{u.position}</p>
                )}
                {(interview.company_name || u.company_name) && (
                  <p className="text-[0.78rem] text-[#6b7280] truncate">{interview.company_name || u.company_name}</p>
                )}
                {u.generation && (
                  <p className="text-[0.72rem] text-[#9ca3af] mt-0.5">Gen {u.generation}</p>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center justify-center gap-3 text-[0.78rem]">
            {interview.employment_type && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-[#f0fdf4] text-[#22c55e] font-medium border border-[#bbf7d0]">
                {interview.employment_type.charAt(0).toUpperCase() + interview.employment_type.slice(1)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[5px] bg-[#f0fdf4] text-[#22c55e] font-medium border border-[#bbf7d0]">
              ✅ {t('congrats.passed')}
            </span>
          </div>

          <p className="text-[0.78rem] text-[#9ca3af] mt-5">
            {t('congrats.description')}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes congratsSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
