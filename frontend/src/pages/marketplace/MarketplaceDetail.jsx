import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, IndianRupee, Phone, Edit, Trash2, AlertTriangle,
  ChevronLeft, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { marketplaceAPI } from '../../api/marketplaceAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';
import { getWhatsAppUrl, buildMarketplaceWhatsAppMsg } from '../../utils/formatters';

const CONDITION_LABELS = { new: 'Brand New', good: 'Good Condition', fair: 'Fair Condition', poor: 'Needs Work' };
const CONDITION_COLORS = { new: 'bg-emerald-100 text-emerald-700', good: 'bg-blue-100 text-blue-700', fair: 'bg-amber-100 text-amber-700', poor: 'bg-red-100 text-red-600' };
const CATEGORY_LABELS = { book: '📚 Books', gadget: '💻 Gadgets', clothing: '👕 Clothing', furniture: '🪑 Furniture', stationary: '✏️ Stationary', other: '📦 Other' };

function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const sorted = [...(images || [])].sort((a, b) => a.display_order - b.display_order);

  if (!sorted.length) {
    return (
      <div className="h-72 md:h-80 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-300">
        <span className="text-6xl mb-2">📷</span>
        <p className="text-sm">No photos uploaded</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
      <img src={sorted[current].image_url} alt="" className="w-full h-72 md:h-80 object-cover" />
      {sorted.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sorted.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all ${i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
        {current + 1} / {sorted.length}
      </div>
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
            <h3 className="font-bold text-slate-900 text-lg">Delete this item?</h3>
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

export default function MarketplaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    marketplaceAPI.getItem(id)
      .then(setItem)
      .catch(() => setError('Item not found or has been removed.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await marketplaceAPI.deleteItem(id);
      navigate('/marketplace', { replace: true });
    } catch {
      setDeleteLoading(false);
      setShowDelete(false);
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto py-6 space-y-6 animate-pulse">
      <div className="h-80 bg-slate-200 rounded-2xl" />
      <div className="space-y-4">
        <div className="h-7 w-2/3 bg-slate-200 rounded-lg" />
        <div className="h-5 w-1/3 bg-slate-100 rounded-lg" />
        <div className="h-20 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto py-20 text-center">
      <p className="text-slate-500 font-medium mb-4">{error}</p>
      <Link to="/marketplace" className="text-sm text-indigo-600 font-semibold hover:underline">← Back to marketplace</Link>
    </div>
  );

  const canManage = user && (item.user_id === user.id || user.is_admin);
  const postedDate = new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      {showDelete && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} loading={deleteLoading} />}

      <div className="max-w-2xl mx-auto py-6 space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium transition">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <SaveButton module="marketplace" postId={id} />
            {canManage && (
              <>
                <Link to={`/marketplace/${id}/edit`} className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition">
                  <Edit className="h-4 w-4" /> Edit
                </Link>
                <button onClick={() => setShowDelete(true)} className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        <ImageCarousel images={item.images} />

        {/* Title + Price */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 capitalize">
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${CONDITION_COLORS[item.condition] || ''}`}>
              {CONDITION_LABELS[item.condition] || item.condition}
            </span>
            {item.is_sold && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">Sold</span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{item.title}</h1>

          <div className="flex items-baseline gap-1">
            {item.listing_type === 'free' ? (
              <span className="text-2xl font-extrabold text-emerald-600">🎁 Free</span>
            ) : (
              <>
                <IndianRupee className="h-5 w-5 text-indigo-600" />
                <span className="text-3xl font-extrabold text-slate-900">{item.price.toLocaleString('en-IN')}</span>
                {item.listing_type === 'rent' && <span className="text-slate-400 text-sm ml-1">/month</span>}
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">Posted on {postedDate}</p>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-3">Description</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{item.description}</p>
        </div>

        {/* Seller + Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4">Seller</h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg">
                {item.user?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{item.user?.name}</p>
                <p className="text-xs text-slate-400">Block {item.user?.block_number}, Room {item.user?.room_number}</p>
              </div>
            </div>
            {user ? (
              <a
                href={getWhatsAppUrl(item.whatsapp, buildMarketplaceWhatsAppMsg(item))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 transition"
              >
                <Phone className="h-4 w-4" /> WhatsApp
              </a>
            ) : (
              <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
                Login to contact
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
