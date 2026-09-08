import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Search, Plus, MapPin, Calendar, Phone, ArrowLeft,
  Edit, Trash2, AlertTriangle, CheckCircle2, ChevronLeft,
  ChevronRight, Upload, X, Check, Loader2, AlertCircle, RefreshCw, Shield,
} from 'lucide-react';
import { lostFoundAPI } from '../../api/communityAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';
import { getWhatsAppUrl, buildLostFoundWhatsAppMsg } from '../../utils/formatters';

// ─── Shared helpers ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#111113] rounded-md border border-[#26262B] p-4 animate-pulse space-y-3">
      <div className="flex gap-2">
        <div className="h-5 w-14 bg-[#1E1E22] rounded-sm" />
        <div className="h-5 w-20 bg-[#17171A] rounded-sm" />
      </div>
      <div className="h-5 w-3/4 bg-[#1E1E22] rounded-sm" />
      <div className="h-4 w-full bg-[#17171A] rounded-sm" />
      <div className="h-4 w-1/2 bg-[#17171A] rounded-sm" />
      <div className="flex gap-2 pt-2 border-t border-[#1F1F24]">
        <div className="h-5 w-5 bg-[#1E1E22] rounded-full" />
        <div className="h-4 w-24 bg-[#17171A] rounded-sm" />
      </div>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#17171A] border border-[#26262B] rounded-md shadow-2xl p-6 max-w-sm w-full space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2.5 rounded-md border border-[#F87171]/30 bg-[#F87171]/10 text-[#F87171]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F2F2F3] text-base">Delete this post?</h3>
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

// ─── LIST PAGE ─────────────────────────────────────────────────────
export function LostFoundList() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');   // '' | 'lost' | 'found'

  const fetch = useCallback(async (type) => {
    setLoading(true);
    setError('');
    try {
      const data = await lostFoundAPI.getPosts({ post_type: type, is_resolved: false });
      setPosts(data);
    } catch {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(filter);
  }, [filter, fetch]);

  return (
    <div className="space-y-6 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#26262B]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Search className="h-5 w-5 text-[#22D3EE] shrink-0" />
            <h1 className="text-2xl font-semibold text-[#F2F2F3] tracking-tight">Lost &amp; Found</h1>
          </div>
          <p className="text-xs text-[#8A8A93]">Report or find lost items on campus</p>
        </div>
        {user && (
          <Link
            to="/lost-found/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors shadow-none"
          >
            <Plus className="h-4 w-4" /> Post a Report
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
            !filter
              ? 'border-[#22D3EE] bg-[#22D3EE]/10 text-[#22D3EE]'
              : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('lost')}
          className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
            filter === 'lost'
              ? 'border-[#F87171] bg-[#F87171]/10 text-[#F87171]'
              : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
          }`}
        >
          Lost
        </button>
        <button
          onClick={() => setFilter('found')}
          className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-colors ${
            filter === 'found'
              ? 'border-[#34D399] bg-[#34D399]/10 text-[#34D399]'
              : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F] hover:text-[#F2F2F3]'
          }`}
        >
          Found
        </button>
      </div>

      {error && (
        <div className="p-4 bg-[#17171A] border border-[#F87171]/30 rounded-md text-center">
          <p className="text-xs text-[#F87171] font-medium mb-2">{error}</p>
          <button
            onClick={() => fetch(filter)}
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

      {!loading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => {
            const isLost = post.post_type === 'lost';
            return (
              <Link
                key={post.id}
                to={`/lost-found/${post.id}`}
                className="group bg-[#111113] rounded-md border border-[#26262B] hover:border-[#38383F] transition-colors p-4 flex flex-col gap-3"
              >
                {post.images?.[0] && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm border border-[#26262B] bg-[#0E0E10]">
                    <img
                      src={post.images[0].image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border ${
                      isLost
                        ? 'border-[#F87171]/40 bg-[#F87171]/10 text-[#F87171]'
                        : 'border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]'
                    }`}
                  >
                    {isLost ? 'Lost' : 'Found'}
                  </span>
                  {post.images?.[0] && (
                    <span className="text-[11px] text-[#8A8A93] font-mono">Photo</span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-[#F2F2F3] group-hover:text-[#22D3EE] transition-colors line-clamp-1 text-sm">
                    {post.title}
                  </h3>
                  <p className="text-xs text-[#8A8A93] line-clamp-2 leading-relaxed mt-1">
                    {post.description}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-[#8A8A93] font-mono">
                  {post.location && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-[#55555C] shrink-0" />
                      <span className="truncate">{post.location}</span>
                    </div>
                  )}
                  {post.incident_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-[#55555C] shrink-0" />
                      <span>{new Date(post.incident_date).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-[#1F1F24] flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-[#1E1E22] border border-[#26262B] flex items-center justify-center text-[#D4D4D8] text-[10px] font-bold">
                    {post.user?.name?.charAt(0)}
                  </div>
                  <span className="text-xs text-[#8A8A93] truncate">{post.user?.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-md border border-[#26262B] bg-[#111113] flex items-center justify-center mb-3 text-[#55555C]">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-[#F2F2F3] mb-1">No reports found</h3>
          <p className="text-xs text-[#8A8A93] max-w-xs">
            Lost something on campus? Post a report and let the community assist.
          </p>
          {user && (
            <Link
              to="/lost-found/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Post a Report
            </Link>
          )}
        </div>
      )}

      {!user && !loading && posts.length > 0 && (
        <div className="p-3.5 bg-[#17171A] border border-[#22D3EE]/30 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-[#22D3EE] shrink-0" />
            <p className="text-xs text-[#8B8B92]">
              Log in with your college email to view reporter contact details and submit reports.
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
function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const sorted = [...(images || [])].sort((a, b) => a.display_order - b.display_order);

  if (!sorted.length) {
    return (
      <div className="h-56 rounded-md border border-[#26262B] bg-[#0E0E10] flex items-center justify-center text-[#55555C] text-xs font-mono">
        No photos uploaded
      </div>
    );
  }

  return (
    <div className="relative rounded-md overflow-hidden border border-[#26262B] bg-[#0E0E10]">
      <img
        src={sorted[current].image_url}
        alt=""
        className="w-full h-72 object-cover"
      />
      {sorted.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
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
    lostFoundAPI.getPost(id)
      .then(setPost)
      .catch(() => setError('Post not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await lostFoundAPI.deletePost(id);
      navigate('/lost-found', { replace: true });
    } catch {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  const markResolved = async () => {
    setMarkingResolved(true);
    try {
      const updated = await lostFoundAPI.updatePost(id, { is_resolved: true });
      setPost(updated);
    } finally {
      setMarkingResolved(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#22D3EE]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-xs text-[#8A8A93] mb-3">{error}</p>
        <Link to="/lost-found" className="text-xs text-[#22D3EE] hover:underline font-medium">
          ← Back to Lost &amp; Found
        </Link>
      </div>
    );
  }

  const canManage = user && (post.user_id === user.id || user.is_admin);
  const isLost = post.post_type === 'lost';

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
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-[#8A8A93] hover:text-[#F2F2F3] font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <SaveButton module="lostfound" postId={id} />
            {canManage && (
              <>
                {!post.is_resolved && (
                  <button
                    onClick={markResolved}
                    disabled={markingResolved}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399] hover:bg-[#34D399]/20 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {markingResolved ? 'Marking...' : 'Mark Resolved'}
                  </button>
                )}
                <Link
                  to={`/lost-found/${id}/edit`}
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

        {/* Media */}
        <ImageCarousel images={post.images} />

        {/* Title Header */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border ${
                isLost
                  ? 'border-[#F87171]/40 bg-[#F87171]/10 text-[#F87171]'
                  : 'border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]'
              }`}
            >
              {isLost ? 'Lost' : 'Found'}
            </span>
            {post.is_resolved && (
              <span className="px-2.5 py-0.5 rounded-sm text-xs font-mono font-medium tracking-wide border border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]">
                Resolved
              </span>
            )}
          </div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">{post.title}</h1>
          <p className="text-xs text-[#8A8A93] font-mono">
            Posted on {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Description & metadata */}
        <div className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
          <p className="text-xs text-[#D4D4D8] leading-relaxed whitespace-pre-wrap">
            {post.description}
          </p>
          <div className="pt-3 border-t border-[#1F1F24] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#8A8A93] font-mono">
            {post.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#55555C]" />
                <span>{post.location}</span>
              </div>
            )}
            {post.incident_date && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#55555C]" />
                <span>{new Date(post.incident_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Reporter */}
        <div className="bg-[#111113] rounded-md border border-[#26262B] p-5">
          <h2 className="text-xs font-mono uppercase tracking-wider text-[#8A8A93] mb-3">Reported by</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#1E1E22] border border-[#26262B] flex items-center justify-center text-[#F2F2F3] font-semibold text-sm">
                {post.user?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-[#F2F2F3] text-xs">{post.user?.name}</p>
                <p className="text-[11px] text-[#8A8A93] font-mono">
                  Block {post.user?.block_number}, Room {post.user?.room_number}
                </p>
              </div>
            </div>
            {user ? (
              <a
                href={getWhatsAppUrl(post.whatsapp, buildLostFoundWhatsAppMsg(post))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#34D399] hover:bg-[#10B981] text-[#0A0A0B] font-medium text-xs rounded-md transition-colors"
              >
                <Phone className="h-3.5 w-3.5" /> WhatsApp
              </a>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] text-[#F2F2F3] font-medium text-xs rounded-md transition-colors text-center"
              >
                Login to contact
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── CREATE PAGE ───────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2 bg-[#111113] border border-[#26262B] focus:border-[#22D3EE] rounded-md text-xs text-[#F2F2F3] placeholder-[#55555C] focus:outline-none transition-colors';

export function LostFoundCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [form, setForm] = useState({
    post_type: 'lost',
    title: '',
    description: '',
    location: '',
    incident_date: '',
    whatsapp: user?.phone || '',
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleImages = (files) => {
    const arr = Array.from(files).slice(0, 5 - imageFiles.length);
    setImageFiles((p) => [...p, ...arr]);
    arr.forEach((file) => {
      const r = new FileReader();
      r.onload = (e) => setImagePreviews((p) => [...p, e.target.result]);
      r.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !/^\d{10}$/.test(form.whatsapp)) {
      setError('Please fill all required fields with a valid 10-digit WhatsApp number.');
      return;
    }
    setSubmitting(true);
    setError('');
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
    <div className="max-w-xl mx-auto py-6">
      <div className="mb-5 flex items-center gap-2.5 pb-2 border-b border-[#26262B]">
        <Search className="h-5 w-5 text-[#22D3EE] shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Post a Lost &amp; Found Report</h1>
          <p className="text-xs text-[#8A8A93]">Help the campus community locate lost items</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#17171A] border border-[#F87171]/30 rounded-md flex items-center gap-2 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
        {/* Type Selection */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Report Type *</label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => set('post_type', 'lost')}
              className={`p-3 rounded-md border text-xs font-medium text-left transition-colors ${
                form.post_type === 'lost'
                  ? 'border-[#F87171] bg-[#F87171]/10 text-[#F87171]'
                  : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F]'
              }`}
            >
              Lost Item
            </button>
            <button
              type="button"
              onClick={() => set('post_type', 'found')}
              className={`p-3 rounded-md border text-xs font-medium text-left transition-colors ${
                form.post_type === 'found'
                  ? 'border-[#34D399] bg-[#34D399]/10 text-[#34D399]'
                  : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F]'
              }`}
            >
              Found Item
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Title *</label>
          <input
            type="text"
            placeholder="e.g. Blue water bottle with SPPU sticker"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputCls}
            required
            maxLength={200}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Description *</label>
          <textarea
            rows={4}
            placeholder="Describe the item in detail — color, brand, markings, etc."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputCls} resize-none`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="text"
                placeholder="e.g. Library, Block A"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="date"
                value={form.incident_date}
                onChange={(e) => set('incident_date', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">WhatsApp Number *</label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={form.whatsapp}
            onChange={(e) => set('whatsapp', e.target.value)}
            className={inputCls}
            maxLength={10}
          />
        </div>

        {/* Images */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Photos (up to 5)</label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={imageFiles.length >= 5}
            className="w-full border border-dashed border-[#26262B] hover:border-[#22D3EE]/50 bg-[#17171A] rounded-md p-4 flex items-center justify-center gap-2 text-[#8A8A93] hover:text-[#F2F2F3] transition-colors disabled:opacity-40"
          >
            <Upload className="h-4 w-4" />
            <span className="text-xs font-medium">Click to upload photos</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleImages(e.target.files)}
          />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 pt-1">
              {imagePreviews.map((src, i) => (
                <div key={i} className="relative group rounded-sm overflow-hidden aspect-square border border-[#26262B] bg-[#0E0E10]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFiles((f) => f.filter((_, idx) => idx !== i));
                      setImagePreviews((p) => p.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] rounded-md font-medium text-xs transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Submit Report
              </>
            )}
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
    lostFoundAPI.getPost(id)
      .then((data) => {
        if (data.user_id !== user?.id && !user?.is_admin) {
          navigate('/lost-found', { replace: true });
          return;
        }
        setForm({
          post_type: data.post_type ?? 'lost',
          title: data.title ?? '',
          description: data.description ?? '',
          location: data.location ?? '',
          incident_date: data.incident_date ?? '',
          whatsapp: data.whatsapp ?? '',
          is_resolved: data.is_resolved ?? false,
        });
      })
      .catch(() => setError('Failed to load post.'))
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !/^\d{10}$/.test(form.whatsapp)) {
      setError('Please fill all required fields with a valid 10-digit WhatsApp number.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await lostFoundAPI.updatePost(id, {
        ...form,
        incident_date: form.incident_date || null,
        location: form.location || null,
      });
      navigate(`/lost-found/${id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto py-16 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#22D3EE]" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center text-xs text-[#8A8A93]">
        {error || 'Unable to load post.'}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="mb-5 flex items-center gap-2.5 pb-2 border-b border-[#26262B]">
        <Search className="h-5 w-5 text-[#22D3EE] shrink-0" />
        <div>
          <h1 className="text-xl font-semibold text-[#F2F2F3] tracking-tight">Edit Report</h1>
          <p className="text-xs text-[#8A8A93]">Update your lost &amp; found report</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#17171A] border border-[#F87171]/30 rounded-md flex items-center gap-2 text-xs text-[#F87171]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#111113] rounded-md border border-[#26262B] p-5 space-y-4">
        {/* Status Toggle */}
        <div className="flex items-center justify-between p-3 bg-[#17171A] rounded-md border border-[#26262B]">
          <div>
            <p className="text-xs font-semibold text-[#F2F2F3]">Listing Status</p>
            <p className="text-[11px] text-[#8A8A93]">Mark resolved if the item was recovered</p>
          </div>
          <button
            type="button"
            onClick={() => set('is_resolved', !form.is_resolved)}
            className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium border transition-colors ${
              form.is_resolved
                ? 'border-[#34D399]/40 bg-[#34D399]/10 text-[#34D399]'
                : 'border-[#26262B] bg-[#111113] text-[#8A8A93]'
            }`}
          >
            {form.is_resolved ? 'Resolved' : 'Active'}
          </button>
        </div>

        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => set('post_type', 'lost')}
            className={`p-3 rounded-md border text-xs font-medium text-left transition-colors ${
              form.post_type === 'lost'
                ? 'border-[#F87171] bg-[#F87171]/10 text-[#F87171]'
                : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F]'
            }`}
          >
            Lost Item
          </button>
          <button
            type="button"
            onClick={() => set('post_type', 'found')}
            className={`p-3 rounded-md border text-xs font-medium text-left transition-colors ${
              form.post_type === 'found'
                ? 'border-[#34D399] bg-[#34D399]/10 text-[#34D399]'
                : 'border-[#26262B] bg-[#17171A] text-[#8A8A93] hover:border-[#38383F]'
            }`}
          >
            Found Item
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputCls}
            required
            maxLength={200}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Description *</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputCls} resize-none`}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="text"
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#55555C]" />
              <input
                type="date"
                value={form.incident_date}
                onChange={(e) => set('incident_date', e.target.value)}
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#8A8A93]">WhatsApp *</label>
          <input
            type="tel"
            value={form.whatsapp}
            onChange={(e) => set('whatsapp', e.target.value)}
            className={inputCls}
            maxLength={10}
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
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] rounded-md font-medium text-xs transition-colors disabled:opacity-60"
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
