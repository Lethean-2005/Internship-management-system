import { useState, useRef, type FormEvent, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';

interface ReportFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content?: string | null; file?: File | null }) => void;
  loading?: boolean;
}

export function ReportForm({ open, onClose, onSubmit, loading }: ReportFormProps) {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const position = (user as any)?.position || '';
  const company = (user as any)?.company_name || '';

  const [title, setTitle] = useState(position ? `Final Report — ${position} at ${company}` : '');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content: content || null,
      file: file || null,
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Modal open={open} onClose={onClose} title={t('reports.createReport')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('common.title')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        <div className="w-full">
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('reports.content')}</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="block w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]"
          />
        </div>

        {/* Upload Area */}
        <div>
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-2">{t('reports.uploadFile')}</label>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center rounded-[5px] border-2 border-dashed py-6 px-4 cursor-pointer transition-colors ${
              dragOver ? 'border-[#48B6E8] bg-[#eef8fd]' : 'border-[#e0e0e0] hover:border-[#48B6E8] hover:bg-[#fafbfc]'
            }`}
          >
            <Upload className="w-8 h-8 text-[#9ca3af] mb-2" />
            <p className="text-[0.85rem] font-medium text-[#374151]">{t('reports.chooseFile')}</p>
            <p className="text-[0.75rem] text-[#9ca3af] mt-1">{t('reports.fileFormats')}</p>
            <button
              type="button"
              className="mt-3 px-4 py-[6px] rounded-[5px] border border-[#e0e0e0] text-[0.82rem] font-medium text-[#374151] hover:bg-[#f5f5f7] transition-colors"
            >
              {t('reports.browseFile')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.pptx,.zip"
              onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
            />
          </div>

          {file && (
            <div className="mt-3 flex items-center gap-3 rounded-[5px] border border-[#e0e0e0] p-3">
              <div className="w-9 h-9 rounded-[5px] bg-[#fef2f2] flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-[#dc2626]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[0.82rem] font-medium text-[#374151] truncate">{file.name}</p>
                <p className="text-[0.72rem] text-[#9ca3af] flex items-center gap-1">
                  {formatSize(file.size)}
                  <span className="mx-1">·</span>
                  <CheckCircle className="w-3 h-3 text-[#22c55e]" />
                  <span className="text-[#22c55e]">{t('reports.ready')}</span>
                </p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-1 text-[#9ca3af] hover:text-[#dc2626] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={loading}>{t('common.create')}</Button>
        </div>
      </form>
    </Modal>
  );
}
