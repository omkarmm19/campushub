import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Search, Plus, MapPin, Calendar, Phone, ArrowLeft,
  Edit, Trash2, AlertTriangle, CheckCircle2, ChevronLeft,
  ChevronRight, Upload, X, Check, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { lostFoundAPI } from '../../api/communityAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';
import { getWhatsAppUrl } from '../../utils/formatters';

// ─── Shared helpers ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-pulse space-y-3">
      <div className="flex gap-2"><div className="h-5 w-14 bg-slate-200 rounded-full" /><div className="h-5 w-20 bg-slate-100 rounded-full" /></div>
      <div className="h-5 w-3/4 bg-slate-200 rounded-lg" />
      <div className="h-4 w-full bg-slate-100 rounded-lg" />
      <div className="h-4 w-1/2 bg-slate-100 rounded-lg" />
      <div className="flex gap-2 pt-2 border-t border-slate-100"><div className="h-5 w-5 bg-slate-200 rounded-full" /><div className="h-4 w-24 bg-slate-100 rounded-lg" /></div>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-red-100 rounded-full"><AlertTriangle className="h-7 w-7 text-red-600" /></div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Delete this post?</h3>
            <p className="text-sm text-slate-500 mt-1">This cannot be undone.</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50">
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LIST PAGE ─────────────────────────────────────────────────────
export function LostFoundList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');   // '' | 'lost' | 'found'

  const fetch = useCallback(async (type) => {
    setLoading(true); setError('');
    try {
      const data = await lostFoundAPI.getPosts({ post_type: type, is_resolved: false });
      setPosts(data);
    } catch { setError('Failed to load posts.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(filter); }, [filter, fetch]);

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Search className="h-4 w-4" /></div>
            <h1 className="text-2xl font-bold text-slate-900">Lost &amp; Found</h1>
          </div>
          <p className="text-sm text-slate-500">Report or find lost items on campus</p>
        </div>
        {user && (
          <Link to="/lost-found/create" className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
            <Plus className="h-4 w-4" /> Post a Report
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 gap-1 w-fit">
        {[['', 'All'], ['lost', '😔 Lost'], ['found', '✅ Found']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`py-2 px-4 rounded-lg text-sm font-semibold transition ${filter === val ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
          <button onClick={() => fetch(filter)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl"><RefreshCw className="h-4 w-4" /> Retry</button>
        </div>
      )}

      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link key={post.id} to={`/lost-found/${post.id}`}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${post.post_type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                  {post.post_type === 'lost' ? '😔 Lost' : '✅ Found'}
                </span>
                {post.images?.[0] && <span className="text-xs text-slate-400">📷 Has photo</span>}
              </div>
              <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2">{post.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{post.description}</p>
              {post.location && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5" /> {post.location}
                </div>
              )}
              {post.incident_date && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" /> {new Date(post.incident_date).toLocaleDateString('en-IN')}
                </div>
              )}
              <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold">{post.user?.name?.charAt(0)}</div>
                <span className="text-xs text-slate-400">{post.user?.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center text-slate-400">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4"><Search className="h-8 w-8 text-slate-300" /></div>
          <h3 className="text-lg font-semibold text-slate-600 mb-1">No reports found</h3>
          <p className="text-sm max-w-xs">Lost something? Post a report and let the community help!</p>
          {user && (
            <Link to="/lost-found/create" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
              <Plus className="h-4 w-4" /> Post a Report
            </Link>
          )}
        </div>
      )}

      {!user && !loading && posts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-amber-800 font-medium">🔒 Log in to contact reporters and post your own reports.</p>
          <Link to="/login" className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition">Log In</Link>
        </div>
      )}
    </div>
  );
}

// ─── DETAIL PAGE ───────────────────────────────────────────────────
function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const sorted = [...(images || [])].sort((a, b) => a.display_order - b.display_order);
  if (!sorted.length) return (
    <div className="h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-300 text-sm">No photos uploaded</div>
  );
  return (
    <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
      <img src={sorted[current].image_url} alt="" className="w-full h-64 object-cover" />
      {sorted.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white"><ChevronRight className="h-5 w-5" /></button>
        </>
      )}
    </div>
  );
}

export function LostFoundDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [markingResolved, setMarkingResolved] = useState(false);

  useEffect(() => {
    lostFoundAPI.getPost(id).then(setPost).catch(() => setError('Post not found.')).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try { await lostFoundAPI.deletePost(id); navigate('/lost-found', { replace: true }); }
    catch { setDeleteLoading(false); setShowDelete(false); }
  };

  const markResolved = async () => {
    setMarkingResolved(true);
    try {
      const updated = await lostFoundAPI.updatePost(id, { is_resolved: true });
      setPost(updated);
    } finally { setMarkingResolved(false); }
  };

  if (loading) return <div className="max-w-2xl mx-auto py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>;
  if (error) return <div className="max-w-2xl mx-auto py-20 text-center"><p className="text-slate-500 mb-4">{error}</p><Link to="/lost-found" className="text-indigo-600 font-semibold text-sm hover:underline">← Back</Link></div>;

  const canManage = user && (post.user_id === user.id || user.is_admin);

  return (
    <>
      {showDelete && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} loading={deleteLoading} />}
      <div className="max-w-2xl mx-auto py-6 space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium transition"><ArrowLeft className="h-4 w-4" /> Back</button>
          <div className="flex items-center gap-2">
            <SaveButton module="lostfound" postId={id} />
            {canManage && (
              <>
                {!post.is_resolved && (
                  <button onClick={markResolved} disabled={markingResolved}
                    className="flex items-center gap-1.5 px-4 py-2 border border-emerald-200 text-sm font-semibold text-emerald-600 rounded-xl hover:bg-emerald-50 transition disabled:opacity-50">
                    <CheckCircle2 className="h-4 w-4" /> {markingResolved ? 'Marking...' : 'Mark Resolved'}
                  </button>
                )}
                <Link to={`/lost-found/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition">
                  <Edit className="h-4 w-4" /> Edit
                </Link>
                <button onClick={() => setShowDelete(true)} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        <ImageCarousel images={post.images} />

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${post.post_type === 'lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
              {post.post_type === 'lost' ? '😔 Lost' : '✅ Found'}
            </span>
            {post.is_resolved && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">✓ Resolved</span>}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{post.title}</h1>
          <p className="text-xs text-slate-400">Posted on {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{post.description}</p>
          {post.location && <div className="flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4 text-slate-400" />{post.location}</div>}
          {post.incident_date && <div className="flex items-center gap-2 text-sm text-slate-500"><Calendar className="h-4 w-4 text-slate-400" />{new Date(post.incident_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4">Posted by</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-lg">{post.user?.name?.charAt(0)}</div>
              <div>
                <p className="font-semibold text-slate-800">{post.user?.name}</p>
                <p className="text-xs text-slate-400">Block {post.user?.block_number}, Room {post.user?.room_number}</p>
              </div>
            </div>
            {user ? (
              <a href={getWhatsAppUrl(post.whatsapp, 'Hi! I saw your Lost & Found post on CampusHub.')} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 transition">
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            ) : (
              <Link to="/login" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">Login to contact</Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── CREATE PAGE ───────────────────────────────────────────────────
const inputCls = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400';

export function LostFoundCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({ post_type: 'lost', title: '', description: '', location: '', incident_date: '', whatsapp: user?.phone || '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImages = (files) => {
    const arr = Array.from(files).slice(0, 5 - imageFiles.length);
    setImageFiles((p) => [...p, ...arr]);
    arr.forEach((file) => { const r = new FileReader(); r.onload = (e) => setImagePreviews((p) => [...p, e.target.result]); r.readAsDataURL(file); });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !/^\d{10}$/.test(form.whatsapp)) {
      setError('Please fill all required fields with a valid 10-digit WhatsApp number.'); return;
    }
    setSubmitting(true); setError('');
    try {
      const created = await lostFoundAPI.createPost({ ...form, incident_date: form.incident_date || null });
      if (imageFiles.length) await lostFoundAPI.uploadImages(created.id, imageFiles);
      navigate(`/lost-found/${created.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Search className="h-4 w-4" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Post a Lost &amp; Found Report</h1>
          <p className="text-sm text-slate-500">Help the community find lost items</p>
        </div>
      </div>

      {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        {/* Type */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Report Type *</label>
          <div className="grid grid-cols-2 gap-3">
            {[['lost', '😔 I Lost Something'], ['found', '✅ I Found Something']].map(([val, label]) => (
              <button key={val} type="button" onClick={() => set('post_type', val)}
                className={`p-4 rounded-xl border-2 text-sm font-semibold text-left transition ${form.post_type === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label>
          <input type="text" placeholder="e.g. Blue water bottle with SPPU sticker" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} required maxLength={200} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label>
          <textarea rows={4} placeholder="Describe the item in detail — color, brand, markings, etc." value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</label>
            <div className="relative"><MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="text" placeholder="e.g. Library, Block A" value={form.location} onChange={(e) => set('location', e.target.value)} className={`${inputCls} pl-9`} /></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
            <div className="relative"><Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="date" value={form.incident_date} onChange={(e) => set('incident_date', e.target.value)} className={`${inputCls} pl-9`} /></div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WhatsApp Number *</label>
          <input type="tel" placeholder="10-digit number" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} maxLength={10} />
        </div>

        {/* Images */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Photos (optional, up to 5)</label>
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageFiles.length >= 5}
            className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-5 flex items-center justify-center gap-3 text-slate-400 hover:text-indigo-500 transition disabled:opacity-40">
            <Upload className="h-5 w-5" /><span className="text-sm">Click to upload photos</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setImageFiles((f) => f.filter((_, idx) => idx !== i)); setImagePreviews((p) => p.filter((_, idx) => idx !== i)); }}
                    className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-60">
            {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Check className="h-4 w-4" /> Submit Report</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── EDIT PAGE ─────────────────────────────────────────────────────
export function LostFoundEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    lostFoundAPI.getPost(id).then((data) => {
      if (data.user_id !== user?.id && !user?.is_admin) { navigate('/lost-found', { replace: true }); return; }
      setForm({
        post_type: data.post_type ?? 'lost',
        title: data.title ?? '',
        description: data.description ?? '',
        location: data.location ?? '',
        incident_date: data.incident_date ?? '',
        whatsapp: data.whatsapp ?? '',
        is_resolved: data.is_resolved ?? false,
      });
    }).catch(() => setError('Failed to load post.')).finally(() => setLoading(false));
  }, [id, user, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !/^\d{10}$/.test(form.whatsapp)) {
      setError('Please fill all required fields with a valid 10-digit WhatsApp number.'); return;
    }
    setSubmitting(true); setError('');
    try {
      await lostFoundAPI.updatePost(id, { ...form, incident_date: form.incident_date || null, location: form.location || null });
      navigate(`/lost-found/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update.'); setSubmitting(false);
    }
  };

  if (loading) return <div className="max-w-xl mx-auto py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-400" /></div>;
  if (!form) return <div className="max-w-xl mx-auto py-20 text-center text-slate-500">{error || 'Unable to load post.'}</div>;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="mb-6 flex items-center gap-2">
        <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Search className="h-4 w-4" /></div>
        <div><h1 className="text-2xl font-bold text-slate-900">Edit Report</h1><p className="text-sm text-slate-500">Update your lost & found report</p></div>
      </div>
      {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        {/* Mark resolved */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-sm font-semibold text-slate-700">Status</p>
          <button type="button" onClick={() => set('is_resolved', !form.is_resolved)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${form.is_resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
            {form.is_resolved ? <>✅ Resolved</> : <>🔍 Active</>}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[['lost', '😔 I Lost Something'], ['found', '✅ I Found Something']].map(([val, label]) => (
            <button key={val} type="button" onClick={() => set('post_type', val)}
              className={`p-3 rounded-xl border-2 text-sm font-semibold text-left transition ${form.post_type === val ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title *</label>
          <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} className={inputCls} required maxLength={200} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description *</label>
          <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls} resize-none`} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</label>
            <div className="relative"><MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="text" value={form.location} onChange={(e) => set('location', e.target.value)} className={`${inputCls} pl-9`} /></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
            <div className="relative"><Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input type="date" value={form.incident_date} onChange={(e) => set('incident_date', e.target.value)} className={`${inputCls} pl-9`} /></div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">WhatsApp *</label>
          <input type="tel" value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className={inputCls} maxLength={10} />
        </div>
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

