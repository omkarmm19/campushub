import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase, Plus, Calendar, ExternalLink, ArrowLeft,
  Edit, Trash2, AlertTriangle, Loader2, AlertCircle,
  RefreshCw, Check, Building2, Shield,
} from 'lucide-react';
import { opportunitiesAPI } from '../../api/communityAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';

const TYPE_META = {
  internship: { label: 'Internship' },
  hackathon: { label: 'Hackathon' },
  workshop: { label: 'Workshop' },
  competition: { label: 'Competition' },
  other: { label: 'Other' },
};

const OPP_TYPES = ['internship', 'hackathon', 'workshop', 'competition', 'other'];

const inputCls =
  'w-full px-3 py-2 bg-[#111113] border border-[#26262B] focus:border-[#F5A623] rounded-md text-xs text-[#F2F2F3] placeholder-[#55555C] focus:outline-none transition-colors';

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#17171A] border border-[#26262B] rounded-md shadow-2xl p-6 max-w-sm w-full space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2.5 rounded-md border border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F2F2F3] text-base">Delete this opportunity?</h3>
            <p className="text-xs text-[#8A8A93] mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-3 w-full pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2 border border-[#26262B] bg-[#111113] hover:bg-[#1E1E22] text-xs font-medium text-[#D4D4D8] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2 bg-[#F87171] hover:bg-[#ef4444] text-[#0A0A0B] rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-[#111113] rounded-md border border-[#26262B] p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-5 w-20 bg-[#1E1E22] rounded-sm" />
        <div className="h-5 w-16 bg-[#17171A] rounded-sm" />
      </div>
      <div className="h-5 w-3/4 bg-[#1E1E22] rounded-sm" />
      <div className="h-4 w-1/2 bg-[#17171A] rounded-sm" />
      <div className="h-12 bg-[#17171A] rounded-sm" />
      <div className="flex gap-2 pt-2 border-t border-[#1F1F24]">
        <div className="h-5 w-5 bg-[#1E1E22] rounded-full" />
        <div className="h-4 w-24 bg-[#17171A] rounded-sm" />
      </div>
    </div>
  );
}

// ─── LIST PAGE ─────────────────────────────────────────────────────
export function OpportunitiesList() {
  const { user } = useAuth();
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const fetchData = useCallback(async (type) => {
    setLoading(true);
    setError('');
    try {
      setOpps(await opportunitiesAPI.getOpportunities({ opp_type: type }));
    } catch {
      setError('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(filter);
  }, [filter, fetchData]);

  const isDue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const daysLeft = (deadline) => {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26262B]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Briefcase className="h-5 w-5 text-[#F5A623] shrink-0" />
            <h1 className="text-2xl font-semibold text-[#F2F2F3] tracking-tight">Opportunities</h1>
          </div>
          <p className="text-xs text-[#8A8A93]">Internships, hackathons &amp; technical workshops</p>
        </div>
        {user && (
          <Link
            to="/opportunities/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors shadow-none"
          >
            <Plus className="h-4 w-4" /> Post Opportunity
          </Link>
        )}
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
            !filter
              ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
              : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
          }`}
        >
          All
        </button>
        {OPP_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(filter === t ? '' : t)}
            className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
              filter === t
                ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
            }`}
          >
            {TYPE_META[t]?.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-[#17171A] border border-[#F87171]/30 rounded-md text-center">
          <p className="text-xs text-[#F87171] mb-2">{error}</p>
          <button
            onClick={() => fetchData(filter)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#26262B] bg-[#111113] hover:bg-[#17171A] text-[#F2F2F3] text-xs font-medium rounded-md transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && !error && opps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {opps.map((opp) => {
            const days = daysLeft(opp.deadline);
            const meta = TYPE_META[opp.opp_type] || TYPE_META.other;
            const expired = isDue(opp.deadline);
            return (
              <Link
                key={opp.id}
                to={`/opportunities/${opp.id}`}
                className="group bg-[#111113] rounded-md border border-[#26262B] hover:border-[#38383F] transition-colors p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8]">
                    {meta.label}
                  </span>
                  {opp.deadline && (
                    <span
                      className={`px-2 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border ${
                        expired
                          ? 'border-[#F87171]/40 bg-[#F87171]/10 text-[#F87171]'
                          : days <= 3
                          ? 'border-[#F5A623]/40 bg-[#F5A623]/10 text-[#F5A623]'
                          : 'border-[#26262B] bg-[#17171A] text-[#8A8A93]'
                      }`}
                    >
                      {expired ? 'Expired' : days === 0 ? 'Due today' : `${days}d left`}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-[#F2F2F3] group-hover:text-[#F5A623] transition-colors line-clamp-1 text-sm">
                    {opp.title}
                  </h3>
                  {opp.organization && (
                    <div className="flex items-center gap-1.5 text-xs text-[#D4D4D8] font-medium mt-1">
                      <Building2 className="h-3.5 w-3.5 text-[#55555C]" />
                      <span>{opp.organization}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-[#8A8A93] line-clamp-2 leading-relaxed">
                  {opp.description}
                </p>

                {opp.deadline && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8A8A93] font-mono">
                    <Calendar className="h-3.5 w-3.5 text-[#55555C]" />
                    <span>Deadline: {new Date(opp.deadline).toLocaleDateString('en-IN')}</span>
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-[#1F1F24] flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#1E1E22] border border-[#26262B] flex items-center justify-center text-[#D4D4D8] text-[10px] font-bold">
                    {opp.user?.name?.charAt(0)}
                  </div>
                  <span className="text-xs text-[#8A8A93] truncate">{opp.user?.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && opps.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-md border border-[#26262B] bg-[#111113] flex items-center justify-center mb-3 text-[#55555C]">
            <Briefcase className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F2F2F3] mb-1">No opportunities yet</h3>
          <p className="text-xs text-[#8A8A93] max-w-xs">
            Know of an internship, hackathon or workshop? Share it with the campus community!
          </p>
          {user && (
            <Link
              to="/opportunities/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Post First Opportunity
            </Link>
          )}
        </div>
      )}

      {!user && !loading && opps.length > 0 && (
        <div className="p-3.5 bg-[#17171A] border border-[#F5A623]/30 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-[#F5A623] shrink-0" />
            <p className="text-xs text-[#8B8B92]">
              Log in with your college email to post internships, hackathons, and opportunities.
            </p>
          </div>
          <Link
            to="/login"
            className="shrink-0 px-3 py-1.5 border border-[#26262B] bg-[#111113] hover:bg-[#1E1E22] hover:border-[#38383F] text-[#F2F2F3] text-xs font-medium rounded-md transition"
          >
            Log In →
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── DETAIL PAGE ───────────────────────────────────────────────────
export function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    opportunitiesAPI.getOpportunity(id)
      .then(setOpp)
      .catch(() => setError('Opportunity not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await opportunitiesAPI.deleteOpportunity(id);
      navigate('/opportunities', { replace: true });
    } catch {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-xs text-[#8A8A93] mb-3">{error}</p>
        <Link to="/opportunities" className="text-xs text-[#F5A623] hover:underline font-medium">
          ← Back to Opportunities
        </Link>
      </div>
    );
  }

  const meta = TYPE_META[opp.opp_type] || TYPE_META.other;
  const canManage = user && (opp.user_id === user.id || user.is_admin);

  return (
    <>
      {showDelete && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleteLoading}
        />
      )}
      <div className="max-w-2xl mx-auto py-6 space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-[#8A8A93] hover:text-[#F2F2F3] font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <SaveButton module="opportunities" postId={id} />
            {canManage && (
              <>
                <Link
                  to={`/opportunities/${id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#26262B] bg-[#17171A] hover:border-[#38383F] text-xs font-medium text-[#D4D4D8] rounded-md transition-colors"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#F87171]/40 bg-[#F87171]/10 hover:bg-[#F87171]/20 text-xs font-medium text-[#F87171] rounded-md transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8]">
              {meta.label}
            </span>
          </div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">{opp.title}</h1>
          {opp.organization && (
            <div className="flex items-center gap-2 text-xs text-[#D4D4D8] font-medium">
              <Building2 className="h-4 w-4 text-[#55555C]" />
              <span>{opp.organization}</span>
            </div>
          )}
          {opp.deadline && (
            <div className="flex items-center gap-2 text-xs text-[#8A8A93] font-mono">
              <Calendar className="h-4 w-4 text-[#55555C]" />
              <span>
                Deadline: <strong className="text-[#F2F2F3]">{new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </span>
            </div>
          )}
          <div className="h-px bg-[#1F1F24]" />
          <p className="text-xs text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">{opp.description}</p>
          {opp.apply_link && (
            <div className="pt-2">
              <a
                href={opp.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors"
              >
                Apply Now <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        <div className="bg-[#111113] rounded-md border border-[#26262B] p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#1E1E22] border border-[#26262B] flex items-center justify-center text-[#F2F2F3] font-semibold text-sm">
            {opp.user?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-[#F2F2F3] text-xs">{opp.user?.name}</p>
            <p className="text-[11px] text-[#8A8A93] font-mono">
              Posted on {new Date(opp.created_at).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── CREATE PAGE ───────────────────────────────────────────────────
export function OpportunityCreate() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    opp_type: 'internship',
    organization: '',
    description: '',
    deadline: '',
    apply_link: '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const created = await opportunitiesAPI.createOpportunity({
        ...form,
        deadline: form.deadline || null,
        apply_link: form.apply_link || null,
        organization: form.organization || null,
      });
      navigate(`/opportunities/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post. Try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="mb-5 flex items-center gap-2.5 pb-2 border-b border-[#26262B]">
        <Briefcase className="h-5 w-5 text-[#F5A623] shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Post an Opportunity</h1>
          <p className="text-xs text-[#8A8A93]">Share internships, hackathons &amp; technical workshops</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#17171A] border border-[#F87171]/30 rounded-md flex items-center gap-2 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Type *</label>
          <div className="flex flex-wrap gap-1.5">
            {OPP_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('opp_type', t)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                  form.opp_type === t
                    ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                    : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F]'
                }`}
              >
                {TYPE_META[t]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Title *</label>
          <input
            type="text"
            placeholder="e.g. Summer SDE Internship at Google"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputCls}
            required
            maxLength={200}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Organization</label>
            <input
              type="text"
              placeholder="e.g. Google, Microsoft, IEEE"
              value={form.organization}
              onChange={(e) => set('organization', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Deadline</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Description *</label>
          <textarea
            rows={5}
            placeholder="Describe the opportunity, eligibility criteria, stipends, perks, etc."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputCls} resize-none`}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Apply Link</label>
          <input
            type="url"
            placeholder="https://..."
            value={form.apply_link}
            onChange={(e) => set('apply_link', e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] text-[#D4D4D8] rounded-md text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] rounded-md font-medium text-xs transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Posting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Post Opportunity
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── EDIT PAGE ─────────────────────────────────────────────────────
export function OpportunityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    opportunitiesAPI.getOpportunity(id)
      .then((data) => {
        if (data.user_id !== user?.id && !user?.is_admin) {
          navigate('/opportunities', { replace: true });
          return;
        }
        setForm({
          title: data.title ?? '',
          opp_type: data.opp_type ?? 'internship',
          organization: data.organization ?? '',
          description: data.description ?? '',
          deadline: data.deadline ?? '',
          apply_link: data.apply_link ?? '',
          is_active: data.is_active ?? true,
        });
      })
      .catch(() => setError('Failed to load.'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await opportunitiesAPI.updateOpportunity(id, {
        ...form,
        deadline: form.deadline || null,
        apply_link: form.apply_link || null,
        organization: form.organization || null,
      });
      navigate(`/opportunities/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#F5A623]" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-xs text-[#8A8A93]">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="mb-5 flex items-center gap-2.5 pb-2 border-b border-[#26262B]">
        <Briefcase className="h-5 w-5 text-[#F5A623] shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Edit Opportunity</h1>
          <p className="text-xs text-[#8A8A93]">Update opportunity details</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#17171A] border border-[#F87171]/30 rounded-md flex items-center gap-2 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Type</label>
          <div className="flex flex-wrap gap-1.5">
            {OPP_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => set('opp_type', t)}
                className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
                  form.opp_type === t
                    ? 'border-[#F5A623] bg-[#F5A623]/10 text-[#F5A623]'
                    : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F]'
                }`}
              >
                {TYPE_META[t]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputCls}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Organization</label>
            <input
              type="text"
              value={form.organization}
              onChange={(e) => set('organization', e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Deadline</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set('deadline', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Description *</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputCls} resize-none`}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Apply Link</label>
          <input
            type="url"
            value={form.apply_link}
            onChange={(e) => set('apply_link', e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] text-[#D4D4D8] rounded-md text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#F5A623] hover:bg-[#D48B17] text-[#0A0A0B] rounded-md font-medium text-xs transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
