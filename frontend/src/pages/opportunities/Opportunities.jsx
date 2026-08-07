import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Briefcase, Plus, Calendar, ExternalLink, ArrowLeft,
  Edit, Trash2, AlertTriangle, Loader2, AlertCircle,
  RefreshCw, Check, Building2,
} from 'lucide-react';
import { opportunitiesAPI } from '../../api/communityAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';

const TYPE_META = {
  internship: { label: '💼 Internship', color: 'bg-blue-100 text-blue-700' },
  hackathon: { label: '⚡ Hackathon', color: 'bg-violet-100 text-violet-700' },
  workshop: { label: '🛠️ Workshop', color: 'bg-amber-100 text-amber-700' },
  competition: { label: '🏆 Competition', color: 'bg-rose-100 text-rose-700' },
  other: { label: '📌 Other', color: 'bg-slate-100 text-slate-600' },
};

const OPP_TYPES = ['internship', 'hackathon', 'workshop', 'competition', 'other'];

const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-red-100 rounded-full"><AlertTriangle className="h-7 w-7 text-red-600" /></div>
          <div><h3 className="font-bold text-slate-900 text-lg">Delete this opportunity?</h3><p className="text-sm text-slate-500 mt-1">This cannot be undone.</p></div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">{loading ? 'Deleting...' : 'Delete'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse space-y-3">
      <div className="flex gap-2"><div className="h-5 w-20 bg-slate-200 rounded-full" /></div>
      <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
      <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
      <div className="h-16 bg-slate-100 rounded-lg" />
      <div className="flex gap-2"><div className="h-8 w-24 bg-slate-200 rounded-xl" /></div>
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
    setLoading(true); setError('');
    try { setOpps(await opportunitiesAPI.getOpportunities({ opp_type: type })); }
    catch { setError('Failed to load opportunities.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(filter); }, [filter, fetchData]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Briefcase className="h-4 w-4" /></div>
            <h1 className="text-2xl font-bold text-slate-900">Opportunities</h1>
          </div>
          <p className="text-sm text-slate-500">Internships, hackathons &amp; workshops</p>
        </div>
        {user && (
          <Link to="/opportunities/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
            <Plus className="h-4 w-4" /> Post Opportunity
          </Link>
        )}
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${!filter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>All</button>
        {OPP_TYPES.map((t) => (
          <button key={t} onClick={() => setFilter(filter === t ? '' : t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${filter === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
            {TYPE_META[t]?.label}
          </button>
        ))}
      </div>

      {error && <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center"><p className="text-sm text-red-600 mb-3">{error}</p><button onClick={() => fetchData(filter)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl"><RefreshCw className="h-4 w-4" /> Retry</button></div>}
      {loading && !error && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>}

      {!loading && !error && opps.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {opps.map((opp) => {
            const days = daysLeft(opp.deadline);
            const meta = TYPE_META[opp.opp_type] || TYPE_META.other;
            return (
              <Link key={opp.id} to={`/opportunities/${opp.id}`}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                  {opp.deadline && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isDue(opp.deadline) ? 'bg-red-100 text-red-600' : days <= 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                      {isDue(opp.deadline) ? 'Expired' : days === 0 ? 'Due Today' : `${days}d left`}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2">{opp.title}</h3>
                {opp.organization && <div className="flex items-center gap-1.5 text-xs text-slate-500"><Building2 className="h-3.5 w-3.5" />{opp.organization}</div>}
                <p className="text-sm text-slate-500 line-clamp-3">{opp.description}</p>
                {opp.deadline && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5" />Deadline: {new Date(opp.deadline).toLocaleDateString('en-IN')}</div>
                )}
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">{opp.user?.name?.charAt(0)}</div>
                  <span className="text-xs text-slate-400">{opp.user?.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && opps.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center text-slate-400">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><Briefcase className="h-8 w-8 text-slate-300" /></div>
          <h3 className="text-lg font-semibold text-slate-600 mb-1">No opportunities yet</h3>
          <p className="text-sm max-w-xs">Know of an internship or hackathon? Share it with the community!</p>
          {user && <Link to="/opportunities/create" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition"><Plus className="h-4 w-4" /> Post first</Link>}
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
    opportunitiesAPI.getOpportunity(id).then(setOpp).catch(() => setError('Not found.')).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await opportunitiesAPI.deleteOpportunity(id); navigate('/opportunities', { replace: true }); }
    catch { setDeleteLoading(false); setShowDelete(false); }
  };

  if (loading) return <div className="max-w-2xl mx-auto py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>;
  if (error) return <div className="max-w-2xl mx-auto py-20 text-center"><p className="text-slate-500 mb-4">{error}</p><Link to="/opportunities" className="text-indigo-600 font-semibold text-sm hover:underline">← Back</Link></div>;

  const meta = TYPE_META[opp.opp_type] || TYPE_META.other;
  const canManage = user && (opp.user_id === user.id || user.is_admin);

  return (
    <>
      {showDelete && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} loading={deleteLoading} />}
      <div className="max-w-2xl mx-auto py-6 space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium transition"><ArrowLeft className="h-4 w-4" /> Back</button>
          <div className="flex items-center gap-2">
            <SaveButton module="opportunities" postId={id} />
            {canManage && (
              <>
                <Link to={`/opportunities/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition"><Edit className="h-4 w-4" /> Edit</Link>
                <button onClick={() => setShowDelete(true)} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition"><Trash2 className="h-4 w-4" /> Delete</button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${meta.color}`}>{meta.label}</span>
          <h1 className="text-2xl font-bold text-slate-900">{opp.title}</h1>
          {opp.organization && <div className="flex items-center gap-2 text-slate-600 font-medium"><Building2 className="h-4 w-4 text-slate-400" />{opp.organization}</div>}
          {opp.deadline && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="h-4 w-4 text-slate-400" />
              Deadline: <strong>{new Date(opp.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </div>
          )}
          <div className="h-px bg-slate-100" />
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{opp.description}</p>
          {opp.apply_link && (
            <a href={opp.apply_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
              Apply Now <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">{opp.user?.name?.charAt(0)}</div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{opp.user?.name}</p>
            <p className="text-xs text-slate-400">Posted on {new Date(opp.created_at).toLocaleDateString('en-IN')}</p>
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
  const [form, setForm] = useState({ title: '', opp_type: 'internship', organization: '', description: '', deadline: '', apply_link: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError('Title and description are required.'); return; }
    setSubmitting(true); setError('');
    try {
      const created = await opportunitiesAPI.createOpportunity({ ...form, deadline: form.deadline || null, apply_link: form.apply_link || null, organization: form.organization || null });
      navigate(`/opportunities/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to post. Try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Briefcase className="h-4 w-4" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Post an Opportunity</h1><p className="text-sm text-slate-500">Share internships, hackathons &amp; workshops</p></div>
      </div>

      {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type *</label>
          <div className="flex flex-wrap gap-2">
            {OPP_TYPES.map((t) => (
              <button key={t} type="button" onClick={() => set('opp_type', t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${form.opp_type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                {TYPE_META[t]?.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label>
          <input type="text" placeholder="e.g. Summer Internship at Google" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} required maxLength={200} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Organization</label>
            <input type="text" placeholder="e.g. Google, TCS, etc." value={form.organization} onChange={(e) => set('organization', e.target.value)} className={inputCls} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</label>
            <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label>
          <textarea rows={5} placeholder="Describe the opportunity, eligibility, perks, etc." value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} required />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Apply Link</label>
          <input type="url" placeholder="https://..." value={form.apply_link} onChange={(e) => set('apply_link', e.target.value)} className={inputCls} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</> : <><Check className="h-4 w-4" /> Post Opportunity</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── EDIT PAGE ─────────────────────────────────────────────────────
const OPP_TYPES_EDIT = ['internship', 'hackathon', 'workshop', 'competition', 'other'];
const inputClsEdit = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

export function OpportunityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    opportunitiesAPI.getOpportunity(id).then((data) => {
      if (data.user_id !== user?.id && !user?.is_admin) { navigate('/opportunities', { replace: true }); return; }
      setForm({ title: data.title ?? '', opp_type: data.opp_type ?? 'internship', organization: data.organization ?? '', description: data.description ?? '', deadline: data.deadline ?? '', apply_link: data.apply_link ?? '', is_active: data.is_active ?? true });
    }).catch(() => setError('Failed to load.')).finally(() => setLoading(false));
  }, [id, user, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError('Title and description required.'); return; }
    setSubmitting(true); setError('');
    try {
      await opportunitiesAPI.updateOpportunity(id, { ...form, deadline: form.deadline || null, apply_link: form.apply_link || null, organization: form.organization || null });
      navigate(`/opportunities/${id}`);
    } catch (err) { setError(err.response?.data?.detail || 'Failed to update.'); setSubmitting(false); }
  };

  if (loading) return <div className="max-w-xl mx-auto py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>;
  if (!form) return <div className="max-w-xl mx-auto py-20 text-center text-slate-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg"><Briefcase className="h-4 w-4" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Edit Opportunity</h1><p className="text-sm text-slate-500">Update opportunity details</p></div>
      </div>
      {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</label>
          <div className="flex flex-wrap gap-2">
            {OPP_TYPES_EDIT.map((t) => (
              <button key={t} type="button" onClick={() => set('opp_type', t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition capitalize ${form.opp_type === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                {TYPE_META[t]?.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label><input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputClsEdit} required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Organization</label><input type="text" value={form.organization} onChange={(e) => set('organization', e.target.value)} className={inputClsEdit} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deadline</label><input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={inputClsEdit} /></div>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label><textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputClsEdit} resize-none`} required /></div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Apply Link</label><input type="url" value={form.apply_link} onChange={(e) => set('apply_link', e.target.value)} className={inputClsEdit} /></div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Check className="h-4 w-4" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  );
}
