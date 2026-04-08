import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Plus, Pencil, Trash2, MapPin, Calendar, Users, Mail, Clock, List, CheckCircle, XCircle, Building2, Laptop, ExternalLink } from 'lucide-react';
import { useJobPostings, useCreateJobPosting, useUpdateJobPosting, useDeleteJobPosting } from '../../hooks/useJobPostings';
import { useAuthStore } from '../../stores/authStore';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { DatePicker } from '../../components/ui/DatePicker';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { getDefaultPerPage } from '../../lib/perPage';
import type { JobPosting } from '../../types/ims';
import type { JobPostingPayload } from '../../api/jobPostings';

function useTypeLabels() {
  const { t } = useTranslation();
  return {
    internship: t('status.internship'),
    'full-time': t('jobPostings.fullTime'),
    'part-time': t('jobPostings.partTime'),
  } as Record<string, string>;
}

function isLink(str: string | null): boolean {
  return !!str && (str.startsWith('http://') || str.startsWith('https://'));
}

function locationLabel(str: string): string {
  try {
    const url = new URL(str);
    return url.hostname.replace('www.', '');
  } catch {
    return str;
  }
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
}

function LocationDisplay({ location, className }: { location: string; className?: string }) {
  if (isLink(location)) {
    return (
      <a href={location} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 text-[#6366f1] hover:text-[#4f46e5] transition-colors ${className || ''}`}>
        <MapPin className="w-3 h-3" /> {locationLabel(location)} <ExternalLink className="w-3 h-3" />
      </a>
    );
  }
  return <span className={`inline-flex items-center gap-1 ${className || ''}`}><MapPin className="w-3 h-3" /> {location}</span>;
}

export default function JobPostingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const TYPE_LABELS = useTypeLabels();

  const statusFilterOptions = [
    { value: '', label: t('jobPostings.allStatus'), icon: List },
    { value: 'open', label: t('jobPostings.open'), icon: CheckCircle },
    { value: 'closed', label: t('jobPostings.closed'), icon: XCircle },
  ];

  const typeFilterOptions = [
    { value: '', label: t('jobPostings.allTypes'), icon: List },
    { value: 'internship', label: t('status.internship'), icon: Building2 },
    { value: 'full-time', label: t('jobPostings.fullTime'), icon: Briefcase },
    { value: 'part-time', label: t('jobPostings.partTime'), icon: Laptop },
  ];
  const isAdmin = user?.role?.slug === 'admin';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage] = useState(getDefaultPerPage());
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPosting, setEditPosting] = useState<JobPosting | null>(null);
  const [viewPosting, setViewPosting] = useState<JobPosting | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useJobPostings({
    search, page, per_page: perPage,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });
  const createMutation = useCreateJobPosting();
  const updateMutation = useUpdateJobPosting();
  const deleteMutation = useDeleteJobPosting();

  const handleCreate = (payload: JobPostingPayload) => {
    createMutation.mutate(payload, { onSuccess: () => setShowForm(false) });
  };

  const handleUpdate = (id: number, payload: Partial<JobPostingPayload>) => {
    updateMutation.mutate({ id, payload }, { onSuccess: () => setEditPosting(null) });
  };

  const handleDelete = (id: number) => setDeleteId(id);

  const confirmDelete = () => {
    if (deleteId !== null) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.1rem] sm:text-[1.35rem] font-bold text-[#1e1b4b]">{t('jobPostings.title')}</h1>
        <p className="mt-1 text-[0.88rem] text-[#6b7280]">
          {isAdmin ? t('jobPostings.subtitleAdmin') : t('jobPostings.subtitleUser')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t('jobPostings.searchJobs')} />
        <FilterDropdown options={statusFilterOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
        <FilterDropdown options={typeFilterOptions} value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }} />
        {isAdmin && (
          <Button onClick={() => setShowForm(true)} className="ml-auto">
            <Plus className="w-4 h-4 mr-1.5" /> {t('jobPostings.newJobPosting')}
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data?.length ? (
        <EmptyState icon={<Briefcase className="w-10 h-10" />} title={t('jobPostings.noJobPostingsFound')} description={t('jobPostings.noJobPostingsDescription')} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((posting) => (
            <DetailCard key={posting.id} posting={posting} isAdmin={isAdmin} onView={setViewPosting} onEdit={setEditPosting} onDelete={handleDelete} />
          ))}
        </div>
      )}


      {/* Create Modal */}
      {showForm && (
        <JobPostingFormModal
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
          isLoading={createMutation.isPending}
        />
      )}

      {/* Edit Modal */}
      {editPosting && (
        <JobPostingFormModal
          posting={editPosting}
          onClose={() => setEditPosting(null)}
          onSubmit={(payload) => handleUpdate(editPosting.id, payload)}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* View Detail Modal */}
      {viewPosting && (
        <Modal open={true} onClose={() => setViewPosting(null)} title="" size="lg">
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-[5px] bg-[#f8f9fa] border border-[#e5e7eb] flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src="/passerellesnum_riques_logo.jfif" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div className="flex-1">
                  <h2 className="text-[1.15rem] font-bold text-[#111827]">{viewPosting.title}</h2>
                  <p className="text-[0.88rem] text-[#6b7280] mt-0.5">{viewPosting.company_name}</p>
                  <p className="text-[0.75rem] text-[#9ca3af] mt-0.5">{timeAgo(viewPosting.created_at)}</p>
                </div>
                <span className={`text-[0.73rem] font-semibold px-3 py-1 rounded-[5px] ${viewPosting.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {viewPosting.status === 'open' ? t('jobPostings.open') : t('jobPostings.closed')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-[5px] border border-[#e5e7eb] px-3 py-1 text-[0.76rem] font-medium text-[#374151]">
                  {TYPE_LABELS[viewPosting.type] || viewPosting.type}
                </span>
                {viewPosting.department && (
                  <span className="inline-flex items-center rounded-[5px] border border-[#e5e7eb] px-3 py-1 text-[0.76rem] font-medium text-[#374151]">
                    {viewPosting.department}
                  </span>
                )}
                {viewPosting.location && (
                  <span className="inline-flex items-center rounded-[5px] border border-[#e5e7eb] px-3 py-1 text-[0.76rem] font-medium">
                    <LocationDisplay location={viewPosting.location} />
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 bg-[#f9fafb] rounded-[5px] p-4">
                <div className="flex items-center gap-2 text-[0.82rem]">
                  <Users className="w-4 h-4 text-[#6b7280]" />
                  <span className="text-[#6b7280]">{t('companies.positions')}:</span>
                  <span className="font-semibold text-[#111827]">{viewPosting.positions}</span>
                </div>
                {viewPosting.start_date && (
                  <div className="flex items-center gap-2 text-[0.82rem]">
                    <Calendar className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-[#6b7280]">{t('companies.startDate')}:</span>
                    <span className="font-semibold text-[#111827]">{new Date(viewPosting.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {viewPosting.end_date && (
                  <div className="flex items-center gap-2 text-[0.82rem]">
                    <Calendar className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-[#6b7280]">{t('companies.endDate')}:</span>
                    <span className="font-semibold text-[#111827]">{new Date(viewPosting.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {viewPosting.application_deadline && (
                  <div className="flex items-center gap-2 text-[0.82rem]">
                    <Clock className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-[#6b7280]">{t('jobPostings.deadline')}:</span>
                    <span className="font-semibold text-[#111827]">{new Date(viewPosting.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {viewPosting.contact_email && (
                  <div className="flex items-center gap-2 text-[0.82rem]">
                    <Mail className="w-4 h-4 text-[#6b7280]" />
                    <span className="font-semibold text-[#111827]">{viewPosting.contact_email}</span>
                  </div>
                )}
              </div>

              {viewPosting.description && (
                <div>
                  <h4 className="text-[0.88rem] font-bold text-[#111827] mb-2">{t('roles.description')}</h4>
                  <p className="text-[0.83rem] text-[#4b5563] whitespace-pre-wrap leading-relaxed">{viewPosting.description}</p>
                </div>
              )}
              {viewPosting.requirements && (
                <div>
                  <h4 className="text-[0.88rem] font-bold text-[#111827] mb-2">{t('companies.requirements')}</h4>
                  <p className="text-[0.83rem] text-[#4b5563] whitespace-pre-wrap leading-relaxed">{viewPosting.requirements}</p>
                </div>
              )}
              {viewPosting.benefits && (
                <div>
                  <h4 className="text-[0.88rem] font-bold text-[#111827] mb-2">{t('jobPostings.benefits')}</h4>
                  <p className="text-[0.83rem] text-[#4b5563] whitespace-pre-wrap leading-relaxed">{viewPosting.benefits}</p>
                </div>
              )}
              {viewPosting.creator && (
                <p className="text-[0.75rem] text-[#9ca3af] pt-2 border-t border-[#f0f0f0]">{t('jobPostings.postedBy')} {viewPosting.creator.name}</p>
              )}
            </div>
        </Modal>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        message={t('jobPostings.deleteConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

// === Detail Card (existing style) ===
function DetailCard({ posting, isAdmin, onView, onEdit, onDelete }: {
  posting: JobPosting; isAdmin: boolean;
  onView: (p: JobPosting) => void; onEdit: (p: JobPosting) => void; onDelete: (id: number) => void;
}) {
  const { t } = useTranslation();
  const TYPE_LABELS = useTypeLabels();
  return (
    <div className="bg-white rounded-[5px] border border-[#e5e7eb] p-6 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[5px] bg-[#f8f9fa] border border-[#e5e7eb] flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/passerellesnum_riques_logo.jfif" alt="Logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <p className="text-[0.85rem] font-semibold text-[#1e1b4b]">{posting.company_name}</p>
            <p className="text-[0.72rem] text-[#9ca3af]">{timeAgo(posting.created_at)}</p>
          </div>
        </div>
        {posting.status === 'closed' && (
          <span className="text-[0.68rem] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-[5px]">{t('jobPostings.closed')}</span>
        )}
      </div>

      <h3 className="text-[1.05rem] font-bold text-[#111827] mb-3 leading-snug">{posting.title}</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center rounded-[5px] border border-[#e5e7eb] px-3 py-1 text-[0.73rem] font-medium text-[#374151] bg-white">
          {TYPE_LABELS[posting.type] || posting.type}
        </span>
        {posting.department && (
          <span className="inline-flex items-center rounded-[5px] border border-[#e5e7eb] px-3 py-1 text-[0.73rem] font-medium text-[#374151] bg-white">
            {posting.department}
          </span>
        )}
        {posting.location && (
          <span className="inline-flex items-center rounded-[5px] border border-[#e5e7eb] px-3 py-1 text-[0.73rem] font-medium bg-white">
            <LocationDisplay location={posting.location} className="text-[#374151]" />
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-5 text-[0.78rem] text-[#6b7280]">
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" /> {posting.positions} position{posting.positions !== 1 ? 's' : ''}
        </span>
        {posting.application_deadline && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {new Date(posting.application_deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
        {posting.location ? (
          <span className="text-[0.78rem] text-[#6b7280]">
            <LocationDisplay location={posting.location} />
          </span>
        ) : <span />}

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button onClick={() => onEdit(posting)} className="p-1.5 rounded-[5px] hover:bg-[#f5f5f7] text-[#9ca3af] hover:text-[#f59e0b] transition-colors" title="Edit">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(posting.id)} className="p-1.5 rounded-[5px] hover:bg-red-50 text-[#9ca3af] hover:text-[#ef4444] transition-colors" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button onClick={() => onView(posting)} className="inline-flex items-center gap-1 rounded-[5px] bg-[#1e1b4b] text-white px-4 py-2 text-[0.78rem] font-semibold hover:bg-[#2d2a5e] transition-colors">
            {t('jobPostings.viewDetail')}
          </button>
        </div>
      </div>
    </div>
  );
}

// === Form Modal ===
function JobPostingFormModal({ posting, onClose, onSubmit, isLoading }: {
  posting?: JobPosting;
  onClose: () => void;
  onSubmit: (payload: JobPostingPayload) => void;
  isLoading: boolean;
}) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(posting?.title || '');
  const [companyName, setCompanyName] = useState(posting?.company_name || '');
  const [location, setLocation] = useState(posting?.location || '');
  const [type, setType] = useState(posting?.type || 'internship');
  const [description, setDescription] = useState(posting?.description || '');
  const [requirements, setRequirements] = useState(posting?.requirements || '');
  const [benefits, setBenefits] = useState(posting?.benefits || '');
  const [department, setDepartment] = useState(posting?.department || '');
  const [positions, setPositions] = useState(posting?.positions || 1);
  const [startDate, setStartDate] = useState(posting?.start_date || '');
  const [endDate, setEndDate] = useState(posting?.end_date || '');
  const [deadline, setDeadline] = useState(posting?.application_deadline || '');
  const [contactEmail, setContactEmail] = useState(posting?.contact_email || '');
  const [status, setStatus] = useState(posting?.status || 'open');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      company_name: companyName,
      location: location || null,
      type,
      description: description || null,
      requirements: requirements || null,
      benefits: benefits || null,
      department: department || null,
      positions,
      start_date: startDate || null,
      end_date: endDate || null,
      application_deadline: deadline || null,
      contact_email: contactEmail || null,
      status,
    });
  };

  return (
    <Modal open={true} onClose={onClose} title={posting ? t('jobPostings.editJobPosting') : t('jobPostings.newJobPosting')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label={`${t('jobPostings.jobTitle')} *`} value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Frontend Developer Intern" />
          <Input label={`${t('auth.companyName')} *`} value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="e.g. Acme Corp" />
        </div>

        <div>
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('roles.description')}</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder={t('jobPostings.jobDescription')} />
        </div>

        <div>
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('jobPostings.location')}</label>
          <textarea value={location} onChange={(e) => setLocation(e.target.value)} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder={t('jobPostings.locationPlaceholder')} />
          <p className="mt-1 text-[0.75rem] text-[#9ca3af]">{t('jobPostings.locationHint')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label={t('interviews.type')} value={type} onChange={(e) => setType(e.target.value)} options={[
                { value: 'internship', label: t('status.internship') },
                { value: 'full-time', label: t('jobPostings.fullTime') },
                { value: 'part-time', label: t('jobPostings.partTime') },
              ]} />
              <Input label={t('auth.department')} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
            </div>

            <div>
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('companies.requirements')}</label>
              <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder={t('jobPostings.jobRequirements')} />
            </div>

            <div>
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">{t('jobPostings.benefits')}</label>
              <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder={t('jobPostings.benefitsPlaceholder')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label={t('companies.positions')} type="number" min={1} value={positions} onChange={(e) => setPositions(parseInt(e.target.value) || 1)} />
              <Input label={t('jobPostings.contactEmail')} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hr@company.com" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DatePicker label={t('companies.startDate')} value={startDate} onChange={setStartDate} placeholder={t('jobPostings.chooseStartDate')} />
              <DatePicker label={t('companies.endDate')} value={endDate} onChange={setEndDate} placeholder={t('jobPostings.chooseEndDate')} />
              <DatePicker label={t('jobPostings.applicationDeadline')} value={deadline} onChange={setDeadline} placeholder={t('jobPostings.chooseDeadline')} />
        </div>

        <Select label={t('common.status')} value={status} onChange={(e) => setStatus(e.target.value)} options={[
          { value: 'open', label: t('jobPostings.open') },
          { value: 'closed', label: t('jobPostings.closed') },
        ]} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
          <Button type="submit" disabled={isLoading || !title || !companyName}>
            {isLoading ? t('common.saving') : posting ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
