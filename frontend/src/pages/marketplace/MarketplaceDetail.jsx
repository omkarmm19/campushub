import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, IndianRupee, Phone, Edit, Trash2, AlertTriangle,
  ChevronLeft, ChevronRight, Tag,
} from 'lucide-react';
import { marketplaceAPI } from '../../api/marketplaceAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';
import { getWhatsAppUrl, buildMarketplaceWhatsAppMsg } from '../../utils/formatters';

const CONDITION_LABELS = { new: 'Brand New', good: 'Good Condition', fair: 'Fair Condition', poor: 'Needs Work' };
const CATEGORY_LABELS = { book: 'Books', gadget: 'Gadgets', clothing: 'Clothing', furniture: 'Furniture', stationary: 'Stationary', other: 'Other' };

function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const sorted = [...(images || [])].sort((a, b) => a.display_order - b.display_order);

  if (!sorted.length) {
    return (
      <div className="h-72 md:h-84 rounded-md border border-[#26262B] bg-[#111113] flex flex-col items-center justify-center text-[#52525A]">
        <Tag className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-xs font-mono">No photos uploaded</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-md border border-[#26262B] bg-[#0E0E10] overflow-hidden">
      <img src={sorted[current].image_url} alt="" className="w-full h-72 md:h-84 object-contain bg-[#0A0A0B]" />
      {sorted.length > 1 && (
        <>
          <button onClick={() => setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-sm bg-[#0A0A0B]/80 border border-[#26262B] text-[#F2F2F3] hover:border-[#3A3A42] transition">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-sm bg-[#0A0A0B]/80 border border-[#26262B] text-[#F2F2F3] hover:border-[#3A3A42] transition">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sorted.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)} className={`h-1 rounded-sm transition-all ${i === current ? 'w-5 bg-[#22D3EE]' : 'w-2 bg-[#80808A]'}`} />
            ))}
          </div>
        </>
      )}
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-sm bg-[#0A0A0B]/80 border border-[#26262B] text-[#8B8B92] text-[10px] font-mono">
        {current + 1} / {sorted.length}
      </div>
    </div>
  );
}

function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#26262B] rounded-md p-6 max-w-sm w-full space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F2F2F3] text-base">Delete this item?</h3>
            <p className="text-xs text-[#8B8B92] mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex gap-2 w-full pt-2">
            <button onClick={onCancel} className="flex-1 py-1.5 border border-[#26262B] rounded-md text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#17171A] transition">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-semibold transition disabled:opacity-50">
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
      <div className="h-72 bg-[#17171A] rounded-md" />
      <div className="space-y-3">
        <div className="h-6 w-2/3 bg-[#17171A] rounded-sm" />
        <div className="h-5 w-1/3 bg-[#17171A] rounded-sm" />
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto py-20 text-center border border-[#26262B] bg-[#111113] rounded-md p-8">
      <p className="text-xs text-red-400 font-medium mb-3">{error}</p>
      <Link to="/marketplace" className="text-xs text-[#22D3EE] hover:underline font-mono">
        ← Back to marketplace
      </Link>
    </div>
  );

  const canManage = user && (item.user_id === user.id || user.is_admin);
  const postedDate = new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <>
      {showDelete && <DeleteModal onConfirm={handleDelete} onCancel={() => setShowDelete(false)} loading={deleteLoading} />}

      <div className="max-w-2xl mx-auto py-4 space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-[#8B8B92] hover:text-[#F2F2F3] font-medium transition">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="flex items-center gap-2">
            <SaveButton module="marketplace" postId={id} />
            {canManage && (
              <>
                <Link to={`/marketplace/${id}/edit`} className="flex items-center gap-1.5 px-3 py-1 border border-[#26262B] text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#17171A] rounded-sm transition">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Link>
                <button onClick={() => setShowDelete(true)} className="flex items-center gap-1.5 px-3 py-1 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-sm transition">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        <ImageCarousel images={item.images} />

        {/* Title + Price */}
        <div className="space-y-3 border-b border-[#26262B] pb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-2 py-0.5 rounded-sm border border-[#94A3B8]/25 bg-[#94A3B8]/5 text-[#94A3B8] text-[11px] font-mono capitalize">
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
            <span className="px-2 py-0.5 rounded-sm border border-[#94A3B8]/25 bg-[#94A3B8]/5 text-[#80808A] text-[11px] font-mono capitalize">
              {CONDITION_LABELS[item.condition] || item.condition}
            </span>
            {item.is_sold && (
              <span className="px-2 py-0.5 rounded-sm border border-red-500/30 bg-red-500/10 text-red-400 text-[11px] font-mono font-semibold">
                Sold
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F2F3] tracking-tight">{item.title}</h1>

          <div className="flex items-baseline gap-1">
            {item.listing_type === 'free' ? (
              <span className="text-2xl font-mono font-semibold text-[#34D399]">Free</span>
            ) : (
              <div className="flex items-baseline gap-1">
                <IndianRupee className="h-5 w-5 text-[#22D3EE]" />
                <span className="text-2xl sm:text-3xl font-mono font-semibold text-[#F2F2F3]">
                  {item.price.toLocaleString('en-IN')}
                </span>
                {item.listing_type === 'rent' && <span className="text-[#80808A] text-xs font-mono ml-1">/mo</span>}
              </div>
            )}
          </div>
          <p className="text-[11px] font-mono text-[#80808A]">Posted {postedDate}</p>
        </div>

        {/* Description */}
        {item.description && (
          <div className="bg-[#111113] rounded-md border border-[#26262B] p-5">
            <h2 className="text-xs font-semibold text-[#F2F2F3] font-mono uppercase tracking-wider mb-2.5">
              Description
            </h2>
            <p className="text-xs text-[#8B8B92] leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}

        {/* Seller + Contact */}
        <div className="bg-[#111113] rounded-md border border-[#26262B] p-5">
          <h2 className="text-xs font-semibold text-[#F2F2F3] font-mono uppercase tracking-wider mb-3">
            Seller Information
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#17171A] border border-[#26262B] flex items-center justify-center text-[#F2F2F3] font-semibold text-sm">
                {item.user?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-xs font-medium text-[#F2F2F3]">{item.user?.name}</p>
                <p className="text-[11px] font-mono text-[#80808A]">Block {item.user?.block_number}, Room {item.user?.room_number}</p>
              </div>
            </div>

            {user ? (
              <a
                href={getWhatsAppUrl(item.whatsapp, buildMarketplaceWhatsAppMsg(item))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#34D399] hover:bg-[#2EB882] text-[#0A0A0B] font-semibold text-xs rounded-md transition"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 px-3.5 py-2 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-semibold text-xs rounded-md transition">
                <span>Login to contact</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
