import { useState, useRef } from 'react';
import { Briefcase, Plus, Pencil, Trash2, MapPin, Calendar, Users, Mail, Clock, List, CheckCircle, XCircle, Building2, Laptop, ExternalLink, ImagePlus } from 'lucide-react';
import { useJobPostings, useCreateJobPosting, useUpdateJobPosting, useDeleteJobPosting } from '../../hooks/useJobPostings';
import { useAuthStore } from '../../stores/authStore';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { FilterDropdown } from '../../components/ui/FilterDropdown';
import { DatePicker } from '../../components/ui/DatePicker';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import type { JobPosting } from '../../types/ims';
import type { JobPostingPayload } from '../../api/jobPostings';

const statusFilterOptions = [
  { value: '', label: 'All Status', icon: List },
  { value: 'open', label: 'Open', icon: CheckCircle },
  { value: 'closed', label: 'Closed', icon: XCircle },
];

const typeFilterOptions = [
  { value: '', label: 'All Types', icon: List },
  { value: 'internship', label: 'Internship', icon: Building2 },
  { value: 'full-time', label: 'Full Time', icon: Briefcase },
  { value: 'part-time', label: 'Part Time', icon: Laptop },
];

const TYPE_LABELS: Record<string, string> = {
  internship: 'Internship',
  'full-time': 'Full-time',
  'part-time': 'Part-time',
};

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
  const { user } = useAuthStore();
  const isAdmin = user?.role?.slug === 'admin';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPosting, setEditPosting] = useState<JobPosting | null>(null);
  const [viewPosting, setViewPosting] = useState<JobPosting | null>(null);

  const { data, isLoading } = useJobPostings({
    search, page,
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

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this job posting?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[1.35rem] font-bold text-[#1e1b4b]">Job Postings</h1>
        <p className="mt-1 text-[0.88rem] text-[#6b7280]">
          {isAdmin ? 'Manage internship job postings.' : 'Browse available internship opportunities.'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search jobs..." />
        <FilterDropdown options={statusFilterOptions} value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
        <FilterDropdown options={typeFilterOptions} value={typeFilter} onChange={(v) => { setTypeFilter(v); setPage(1); }} />
        {isAdmin && (
          <Button onClick={() => setShowForm(true)} className="ml-auto">
            <Plus className="w-4 h-4 mr-1.5" /> New Job Posting
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : !data?.data?.length ? (
        <EmptyState icon={<Briefcase className="w-10 h-10" />} title="No job postings found" description="No job postings match your search criteria." />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((posting) =>
              posting.post_mode === 'image' ? (
                <ImageCard key={posting.id} posting={posting} isAdmin={isAdmin} onView={setViewPosting} onEdit={setEditPosting} onDelete={handleDelete} />
              ) : (
                <DetailCard key={posting.id} posting={posting} isAdmin={isAdmin} onView={setViewPosting} onEdit={setEditPosting} onDelete={handleDelete} />
              )
            )}
          </div>

          {data.meta && data.meta.last_page > 1 && (
            <div className="mt-6">
              <Pagination currentPage={data.meta.current_page} lastPage={data.meta.last_page} onPageChange={setPage} />
            </div>
          )}
        </>
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
          {viewPosting.post_mode === 'image' ? (
            <div className="space-y-4">
              {viewPosting.image_url && (
                <img src={viewPosting.image_url} alt={viewPosting.title} className="w-full rounded-[5px] object-cover" />
              )}
              <h2 className="text-[1.15rem] font-bold text-[#111827]">{viewPosting.title}</h2>
              <p className="text-[0.88rem] text-[#6b7280]">{viewPosting.company_name}</p>
              {viewPosting.description && (
                <p className="text-[0.83rem] text-[#4b5563] whitespace-pre-wrap leading-relaxed">{viewPosting.description}</p>
              )}
              {viewPosting.location && (
                <div className="text-[0.82rem] text-[#6b7280]">
                  <LocationDisplay location={viewPosting.location} />
                </div>
              )}
              {viewPosting.creator && (
                <p className="text-[0.75rem] text-[#9ca3af] pt-2 border-t border-[#f0f0f0]">Posted by {viewPosting.creator.name} · {timeAgo(viewPosting.created_at)}</p>
              )}
            </div>
          ) : (
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
                  {viewPosting.status === 'open' ? 'Open' : 'Closed'}
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

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-[#f9fafb] rounded-[5px] p-4">
                <div className="flex items-center gap-2 text-[0.82rem]">
                  <Users className="w-4 h-4 text-[#6b7280]" />
                  <span className="text-[#6b7280]">Positions:</span>
                  <span className="font-semibold text-[#111827]">{viewPosting.positions}</span>
                </div>
                {viewPosting.start_date && (
                  <div className="flex items-center gap-2 text-[0.82rem]">
                    <Calendar className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-[#6b7280]">Start:</span>
                    <span className="font-semibold text-[#111827]">{new Date(viewPosting.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {viewPosting.end_date && (
                  <div className="flex items-center gap-2 text-[0.82rem]">
                    <Calendar className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-[#6b7280]">End:</span>
                    <span className="font-semibold text-[#111827]">{new Date(viewPosting.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
                {viewPosting.application_deadline && (
                  <div className="flex items-center gap-2 text-[0.82rem]">
                    <Clock className="w-4 h-4 text-[#6b7280]" />
                    <span className="text-[#6b7280]">Deadline:</span>
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
                  <h4 className="text-[0.88rem] font-bold text-[#111827] mb-2">Description</h4>
                  <p className="text-[0.83rem] text-[#4b5563] whitespace-pre-wrap leading-relaxed">{viewPosting.description}</p>
                </div>
              )}
              {viewPosting.requirements && (
                <div>
                  <h4 className="text-[0.88rem] font-bold text-[#111827] mb-2">Requirements</h4>
                  <p className="text-[0.83rem] text-[#4b5563] whitespace-pre-wrap leading-relaxed">{viewPosting.requirements}</p>
                </div>
              )}
              {viewPosting.benefits && (
                <div>
                  <h4 className="text-[0.88rem] font-bold text-[#111827] mb-2">Benefits</h4>
                  <p className="text-[0.83rem] text-[#4b5563] whitespace-pre-wrap leading-relaxed">{viewPosting.benefits}</p>
                </div>
              )}
              {viewPosting.creator && (
                <p className="text-[0.75rem] text-[#9ca3af] pt-2 border-t border-[#f0f0f0]">Posted by {viewPosting.creator.name}</p>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// === Detail Card (existing style) ===
function DetailCard({ posting, isAdmin, onView, onEdit, onDelete }: {
  posting: JobPosting; isAdmin: boolean;
  onView: (p: JobPosting) => void; onEdit: (p: JobPosting) => void; onDelete: (id: number) => void;
}) {
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
          <span className="text-[0.68rem] font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-[5px]">Closed</span>
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
            View detail
          </button>
        </div>
      </div>
    </div>
  );
}

// === Image Card ===
function ImageCard({ posting, isAdmin, onView, onEdit, onDelete }: {
  posting: JobPosting; isAdmin: boolean;
  onView: (p: JobPosting) => void; onEdit: (p: JobPosting) => void; onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-[5px] border border-[#e5e7eb] overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Image */}
      {posting.image_url && (
        <div className="w-full aspect-[4/3] overflow-hidden bg-[#f3f4f6]">
          <img src={posting.image_url} alt={posting.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-[5px] bg-[#f8f9fa] border border-[#e5e7eb] flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/passerellesnum_riques_logo.jfif" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <p className="text-[0.8rem] font-medium text-[#6b7280]">{posting.company_name}</p>
          <span className="text-[0.7rem] text-[#9ca3af] ml-auto">{timeAgo(posting.created_at)}</span>
        </div>

        <h3 className="text-[1rem] font-bold text-[#111827] mb-2 leading-snug">{posting.title}</h3>

        {posting.description && (
          <p className="text-[0.78rem] text-[#6b7280] mb-3 line-clamp-2">{posting.description}</p>
        )}

        <div className="flex-1" />

        <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
          {posting.location ? (
            <span className="text-[0.75rem] text-[#6b7280]">
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
              View detail
            </button>
          </div>
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
  const [postMode, setPostMode] = useState(posting?.post_mode || 'detail');
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(posting?.image_url || null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: JobPostingPayload = {
      post_mode: postMode,
      title,
      company_name: companyName,
      location: location || null,
      type,
      description: description || null,
      status,
    };

    if (postMode === 'detail') {
      payload.requirements = requirements || null;
      payload.benefits = benefits || null;
      payload.department = department || null;
      payload.positions = positions;
      payload.start_date = startDate || null;
      payload.end_date = endDate || null;
      payload.application_deadline = deadline || null;
      payload.contact_email = contactEmail || null;
    }

    if (imageFile) {
      payload.image = imageFile;
    }

    onSubmit(payload);
  };

  return (
    <Modal open={true} onClose={onClose} title={posting ? 'Edit Job Posting' : 'New Job Posting'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Post Mode Selector */}
        <Select label="Posting Type" value={postMode} onChange={(e) => setPostMode(e.target.value)} options={[
          { value: 'detail', label: 'Detail Form — Fill in all job details' },
          { value: 'image', label: 'Image Post — Upload a job posting image' },
        ]} />

        {/* Image upload (image mode) */}
        {postMode === 'image' && (
          <div>
            <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Job Posting Image *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-[#d1d5db] rounded-[5px] p-6 text-center cursor-pointer hover:border-[#48B6E8] transition-colors bg-[#fafafa]"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-[250px] mx-auto rounded-[5px] object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#9ca3af]">
                  <ImagePlus className="w-10 h-10" />
                  <p className="text-[0.85rem] font-medium">Click to upload image</p>
                  <p className="text-[0.75rem]">PNG, JPG, WEBP up to 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
        )}

        {/* Common fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Job Title *" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Frontend Developer Intern" />
          <Input label="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="e.g. Acme Corp" />
        </div>

        <div>
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder="Job description..." />
        </div>

        <div>
          <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Location</label>
          <textarea value={location} onChange={(e) => setLocation(e.target.value)} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder="Enter address or paste a link (e.g. https://maps.google.com/...)" />
          <p className="mt-1 text-[0.75rem] text-[#9ca3af]">You can type an address or paste a Google Maps link</p>
        </div>

        {/* Detail-only fields */}
        {postMode === 'detail' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={[
                { value: 'internship', label: 'Internship' },
                { value: 'full-time', label: 'Full Time' },
                { value: 'part-time', label: 'Part Time' },
              ]} />
              <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
            </div>

            <div>
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Requirements</label>
              <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder="Job requirements..." />
            </div>

            <div>
              <label className="block text-[0.85rem] font-medium text-[#374151] mb-1">Benefits</label>
              <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={2} className="w-full rounded-[5px] border border-[#e0e0e0] px-[14px] py-[11px] text-[0.88rem] transition-all focus:outline-none focus:border-[#48B6E8] focus:ring-[3px] focus:ring-[rgba(72,182,232,0.08)]" placeholder="Benefits offered..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input label="Positions" type="number" min={1} value={positions} onChange={(e) => setPositions(parseInt(e.target.value) || 1)} />
              <Input label="Contact Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hr@company.com" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <DatePicker label="Start Date" value={startDate} onChange={setStartDate} placeholder="Choose start date" />
              <DatePicker label="End Date" value={endDate} onChange={setEndDate} placeholder="Choose end date" />
              <DatePicker label="Application Deadline" value={deadline} onChange={setDeadline} placeholder="Choose deadline" />
            </div>
          </>
        )}

        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ]} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading || !title || !companyName || (postMode === 'image' && !imageFile && !posting?.image_url)}>
            {isLoading ? 'Saving...' : posting ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
