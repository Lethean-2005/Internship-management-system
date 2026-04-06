import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore } from '../../stores/toastStore';
import type { ToastType } from '../../stores/toastStore';

const config: Record<ToastType, { icon: typeof CheckCircle; bg: string; border: string; text: string; iconColor: string }> = {
  success: { icon: CheckCircle, bg: 'bg-[#f0fdf4]', border: 'border-[#bbf7d0]', text: 'text-[#16a34a]', iconColor: 'text-[#16a34a]' },
  error:   { icon: XCircle,    bg: 'bg-[#fef2f2]', border: 'border-[#fecaca]', text: 'text-[#dc2626]', iconColor: 'text-[#dc2626]' },
  warning: { icon: AlertTriangle, bg: 'bg-[#fffbeb]', border: 'border-[#fde68a]', text: 'text-[#d97706]', iconColor: 'text-[#d97706]' },
  info:    { icon: Info,        bg: 'bg-[#eff6ff]', border: 'border-[#bfdbfe]', text: 'text-[#2563eb]', iconColor: 'text-[#2563eb]' },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-[400px] w-full pointer-events-none">
      {toasts.map((t) => {
        const c = config[t.type];
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={`${c.bg} ${c.border} border rounded-[8px] px-4 py-3 flex items-center gap-3 shadow-lg pointer-events-auto`}
            style={{ animation: 'toastSlideIn 0.3s ease-out' }}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 ${c.iconColor}`} />
            <span className={`${c.text} text-[0.88rem] font-medium flex-1`}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#9ca3af] hover:text-[#374151] transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
