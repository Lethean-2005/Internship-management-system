import { useState } from 'react';
import { Briefcase, Plus, Pencil, Trash2, Eye, MapPin, Calendar, Users, Mail } from 'lucide-react';
import { useJobPostings, useCreateJobPosting, useUpdateJobPosting, useDeleteJobPosting } from '../../hooks/useJobPostings';
import { useAuthStore } from '../../stores/authStore';
import { SearchInput } from '../../components/ui/SearchInput';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { Badge } from '../../components/ui/Badge';
import type { JobPosting } from '../../types/ims';
import type { JobPostingPayload } from '../../api/jobPostings';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-red-100 text-red-700',
};

const TYPE_LABELS: Record<string, string> = {
  internship: 'Internship',
  'full-time': 'Full Time',
  'part-time': 'Part Time',
};

export default function JobPostingsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.slug === 'admin';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPosting, setEditPosting] = useState<JobPosting | null>(null);
  const [viewPosting, setViewPosting] = useState<JobPosting | null>(null);

  const { data, isLoading } = useJobPostings({ search, page, status: statusFilter || undefined });
  const createMutation = useCreateJobPosting();
  const updateMutation = useUpdateJobPosting();
  const deleteMutation = useDeleteJobPosting();

  const handleCreate = (payload: JobPostingPayload) => {
    createMutation.mutate(payload, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleUpdate = (id: number, payload: Partial<JobPostingPayload>) => {
    updateMutation.mutate({ id, payload }, {
      onSuccess: () => setEditPosting(null),
    });
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
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search job postings..." />
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} options={[
          { value: '', label: 'All Status' },
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ]} />
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.data.map((posting) => (
              <div key={posting.id} className="bg-white rounded-lg border border-[#e5e7eb] p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[0.95rem] font-semibold text-[#1e1b4b] truncate">{posting.title}</h3>
                    <p className="text-[0.82rem] text-[#6b7280] mt-0.5">{posting.company_name}</p>
                  </div>
                  <Badge className={STATUS_COLORS[posting.status] || 'bg-gray-100 text-gray-700'}>
                    {posting.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 mb-4">
                  {posting.location && (
                    <div className="flex items-center gap-1.5 text-[0.8rem] text-[#6b7280]">
                      <MapPin className="w-3.5 h-3.5" /> {posting.location}
                    </div>
                  )}
                  {posting.department && (
                    <div className="flex items-center gap-1.5 text-[0.8rem] text-[#6b7280]">
                      <Briefcase className="w-3.5 h-3.5" /> {posting.department}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[0.8rem] text-[#6b7280]">
                    <Users className="w-3.5 h-3.5" /> {posting.positions} position{posting.positions !== 1 ? 's' : ''}
                  </div>
                  {posting.application_deadline && (
                    <div className="flex items-center gap-1.5 text-[0.8rem] text-[#6b7280]">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {new Date(posting.application_deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <Badge className="bg-blue-50 text-blue-700 text-[0.72rem]">
                    {TYPE_LABELS[posting.type] || posting.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#f0f0f0]">
                  <button onClick={() => setViewPosting(posting)} className="text-[0.78rem] text-[#6366f1] hover:text-[#4f46e5] flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  {isAdmin && (
                    <>
                      <button onClick={() => setEditPosting(posting)} className="text-[0.78rem] text-[#f59e0b] hover:text-[#d97706] flex items-center gap-1 ml-auto">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDelete(posting.id)} className="text-[0.78rem] text-[#ef4444] hover:text-[#dc2626] flex items-center gap-1">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
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

      {/* View Modal */}
      {viewPosting && (
        <Modal open={true} onClose={() => setViewPosting(null)} title={viewPosting.title} size="lg">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className={STATUS_COLORS[viewPosting.status] || 'bg-gray-100 text-gray-700'}>{viewPosting.status}</Badge>
              <Badge className="bg-blue-50 text-blue-700">{TYPE_LABELS[viewPosting.type] || viewPosting.type}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[0.85rem]">
              <div><span className="text-[#6b7280]">Company:</span> <span className="font-medium">{viewPosting.company_name}</span></div>
              {viewPosting.location && <div><span className="text-[#6b7280]">Location:</span> <span className="font-medium">{viewPosting.location}</span></div>}
              {viewPosting.department && <div><span className="text-[#6b7280]">Department:</span> <span className="font-medium">{viewPosting.department}</span></div>}
              <div><span className="text-[#6b7280]">Positions:</span> <span className="font-medium">{viewPosting.positions}</span></div>
              {viewPosting.start_date && <div><span className="text-[#6b7280]">Start:</span> <span className="font-medium">{new Date(viewPosting.start_date).toLocaleDateString()}</span></div>}
              {viewPosting.end_date && <div><span className="text-[#6b7280]">End:</span> <span className="font-medium">{new Date(viewPosting.end_date).toLocaleDateString()}</span></div>}
              {viewPosting.application_deadline && <div><span className="text-[#6b7280]">Deadline:</span> <span className="font-medium">{new Date(viewPosting.application_deadline).toLocaleDateString()}</span></div>}
              {viewPosting.contact_email && <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#6b7280]" /> <span className="font-medium">{viewPosting.contact_email}</span></div>}
            </div>

            {viewPosting.description && (
              <div>
                <h4 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-1">Description</h4>
                <p className="text-[0.83rem] text-[#374151] whitespace-pre-wrap">{viewPosting.description}</p>
              </div>
            )}

            {viewPosting.requirements && (
              <div>
                <h4 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-1">Requirements</h4>
                <p className="text-[0.83rem] text-[#374151] whitespace-pre-wrap">{viewPosting.requirements}</p>
              </div>
            )}

            {viewPosting.benefits && (
              <div>
                <h4 className="text-[0.85rem] font-semibold text-[#1e1b4b] mb-1">Benefits</h4>
                <p className="text-[0.83rem] text-[#374151] whitespace-pre-wrap">{viewPosting.benefits}</p>
              </div>
            )}

            {viewPosting.creator && (
              <p className="text-[0.78rem] text-[#9ca3af]">Posted by {viewPosting.creator.name}</p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// Form Modal Component
function JobPostingFormModal({ posting, onClose, onSubmit, isLoading }: {
  posting?: JobPosting;
  onClose: () => void;
  onSubmit: (payload: JobPostingPayload) => void;
  isLoading: boolean;
}) {
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
    <Modal open={true} onClose={onClose} title={posting ? 'Edit Job Posting' : 'New Job Posting'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Job Title *" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Frontend Developer Intern" />
          <Input label="Company Name *" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required placeholder="e.g. Acme Corp" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Phnom Penh" />
          <Select label="Type" value={type} onChange={(e) => setType(e.target.value)} options={[
            { value: 'internship', label: 'Internship' },
            { value: 'full-time', label: 'Full Time' },
            { value: 'part-time', label: 'Part Time' },
          ]} />
          <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
        </div>

        <div>
          <label className="block text-[0.82rem] font-medium text-[#374151] mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent" placeholder="Job description..." />
        </div>

        <div>
          <label className="block text-[0.82rem] font-medium text-[#374151] mb-1">Requirements</label>
          <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} rows={3} className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent" placeholder="Job requirements..." />
        </div>

        <div>
          <label className="block text-[0.82rem] font-medium text-[#374151] mb-1">Benefits</label>
          <textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} rows={2} className="w-full rounded-md border border-[#d1d5db] px-3 py-2 text-[0.85rem] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent" placeholder="Benefits offered..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Positions" type="number" min={1} value={positions} onChange={(e) => setPositions(parseInt(e.target.value) || 1)} />
          <Input label="Contact Email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="hr@company.com" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Input label="Application Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>

        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ]} />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading || !title || !companyName}>
            {isLoading ? 'Saving...' : posting ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
