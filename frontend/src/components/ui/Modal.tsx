import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      {/* Modal card */}
      <div
        className={`relative bg-white rounded-[5px] w-full mx-4 max-h-[90vh] overflow-y-auto ${size === 'lg' ? 'max-w-[900px]' : size === 'sm' ? 'max-w-[400px]' : 'max-w-[520px]'}`}
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#f0f0f0]">
            <h2 className="text-lg font-semibold text-[#1e1b4b]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#9ca3af] hover:text-[#374151] text-xl leading-none transition-colors"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
