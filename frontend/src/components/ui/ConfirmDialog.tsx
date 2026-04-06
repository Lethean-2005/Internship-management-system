import { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = 'Delete Confirmation',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-[8px] w-full max-w-[400px] mx-4 overflow-hidden"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-[#9ca3af] hover:text-[#374151] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
          {/* Warning icon */}
          <div className="w-14 h-14 rounded-full bg-[#fff7ed] flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-[#f59e0b]" />
          </div>

          <h3 className="text-[1.05rem] font-semibold text-[#1e1b4b] mb-2">{title}</h3>
          <p className="text-[0.88rem] text-[#6b7280] leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-[9px] text-[0.82rem] font-semibold rounded-[5px] bg-white text-[#1e1e2d] border-[1.5px] border-[#d1d5db] hover:bg-[#f5f5f7] transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-[9px] text-[0.82rem] font-semibold rounded-[5px] bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
