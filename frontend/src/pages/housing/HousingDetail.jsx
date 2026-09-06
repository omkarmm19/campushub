import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Users, Calendar, IndianRupee, Phone,
  Wifi, Zap, Droplets, Car, Utensils, Wind, CheckCircle2,
  XCircle, ChevronLeft, ChevronRight, Edit, Trash2, AlertTriangle,
} from 'lucide-react';
import { housingAPI } from '../../api/housingAPI';
import { useAuth } from '../../context/AuthContext';
import SaveButton from '../../components/common/SaveButton';
import { getWhatsAppUrl, buildHousingWhatsAppMsg } from '../../utils/formatters';

const AMENITY_ICONS = {
  wifi: <Wifi className="h-3.5 w-3.5" />,
  electricity: <Zap className="h-3.5 w-3.5" />,
  water: <Droplets className="h-3.5 w-3.5" />,
  parking: <Car className="h-3.5 w-3.5" />,
  mess: <Utensils className="h-3.5 w-3.5" />,
  ac: <Wind className="h-3.5 w-3.5" />,
};

const SHARING_LABELS = { single: 'Single', double: 'Double', triple: 'Triple', other: 'Other' };

// Image carousel with framed dark container
function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-72 md:h-84 rounded-md border border-[#26262B] bg-[#111113] flex flex-col items-center justify-center text-[#52525A]">
        <svg className="h-12 w-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <p className="text-xs font-mono">No photos uploaded</p>
      </div>
    );
  }

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="relative rounded-md border border-[#26262B] bg-[#0E0E10] overflow-hidden">
      <img
        src={sorted[current].image_url}
        alt={`Photo ${current + 1}`}
        className="w-full h-72 md:h-84 object-contain bg-[#0A0A0B]"
      />

      {sorted.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-sm bg-[#0A0A0B]/80 border border-[#26262B] text-[#F2F2F3] hover:border-[#3A3A42] transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-sm bg-[#0A0A0B]/80 border border-[#26262B] text-[#F2F2F3] hover:border-[#3A3A42] transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 rounded-sm transition-all ${
                  i === current ? 'w-5 bg-[#F5A623]' : 'w-2 bg-[#80808A]'
                }`}
              />
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

// Delete confirmation modal
function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111113] border border-[#26262B] rounded-md p-6 max-w-sm w-full space-y-4">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F2F2F3] text-base">Delete Listing?</h3>
            <p className="text-xs text-[#8B8B92] mt-1">
              This will permanently remove your listing from the platform.
            </p>
          </div>
          <div className="flex gap-2 w-full pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-1.5 border border-[#26262B] rounded-md text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#17171A] transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-md bg-[#111113] border border-[#26262B]">
      <div className="p-1.5 bg-[#17171A] border border-[#26262B] rounded-sm text-[#8B8B92] shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-[#80808A]">{label}</p>
        <p className="text-xs font-medium text-[#F2F2F3] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function PrefChip({ label, value }) {
  if (value === null || value === undefined) return null;
  const positive = value === true;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono border ${
      positive
        ? 'border-[#34D399]/25 bg-[#34D399]/5 text-[#34D399]'
        : 'border-red-500/25 bg-red-500/5 text-red-400'
    }`}>
      {positive
        ? <CheckCircle2 className="h-3 w-3" />
        : <XCircle className="h-3 w-3" />}
      {label}
    </div>
  );
}

export default function HousingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await housingAPI.getListing(id);
        setListing(data);
      } catch {
        setError('Listing not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await housingAPI.deleteListing(id);
      navigate('/housing', { replace: true });
    } catch {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setError('Failed to delete. Please try again.');
    }
  };

  const isOwner = user && listing && user.id === listing.user_id;
  const isAdmin = user?.is_admin;
  const canManage = isOwner || isAdmin;

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-6 space-y-6 animate-pulse">
        <div className="h-4 w-20 bg-[#17171A] rounded-sm" />
        <div className="h-72 bg-[#17171A] rounded-md" />
        <div className="space-y-3">
          <div className="h-7 w-1/3 bg-[#17171A] rounded-sm" />
          <div className="h-4 w-3/4 bg-[#17171A] rounded-sm" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center border border-[#26262B] bg-[#111113] rounded-md p-8">
        <p className="text-xs text-red-400 font-medium mb-3">{error}</p>
        <Link to="/housing" className="text-xs text-[#F5A623] hover:underline font-mono">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const availableDate = new Date(listing.available_from).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const postedDate = new Date(listing.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const isRoomAvailable = listing.listing_type === 'room_available';

  return (
    <>
      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          loading={deleteLoading}
        />
      )}

      <div className="max-w-3xl mx-auto py-4 space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-[#8B8B92] hover:text-[#F2F2F3] font-medium transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>

          <div className="flex items-center gap-2">
            <SaveButton module="housing" postId={id} />
            {canManage && (
              <>
                <Link
                  to={`/housing/${id}/edit`}
                  className="flex items-center gap-1.5 px-3 py-1 border border-[#26262B] text-xs font-medium text-[#8B8B92] hover:text-[#F2F2F3] hover:bg-[#17171A] rounded-sm transition"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 border border-red-500/30 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-sm transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Image Carousel */}
        <ImageCarousel images={listing.images} />

        {/* Title block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#26262B] pb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isRoomAvailable ? (
                <span className="px-2 py-0.5 rounded-sm border border-[#34D399]/30 bg-[#34D399]/5 text-[#34D399] text-[10px] font-mono">
                  Room Available
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-sm border border-[#38BDF8]/30 bg-[#38BDF8]/5 text-[#38BDF8] text-[10px] font-mono">
                  Roommate Needed
                </span>
              )}
              {!listing.is_active && (
                <span className="px-2 py-0.5 rounded-sm border border-[#26262B] bg-[#17171A] text-[#80808A] text-[10px] font-mono">
                  Inactive
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-5 w-5 text-[#F5A623]" />
              <span className="text-2xl sm:text-3xl font-mono font-semibold text-[#F2F2F3]">
                {listing.rent_per_person.toLocaleString('en-IN')}
              </span>
              <span className="text-[#80808A] text-xs font-mono">/mo per person</span>
            </div>

            {listing.security_deposit && (
              <p className="text-xs text-[#80808A] font-mono">
                Security deposit: ₹{listing.security_deposit.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <p className="text-[11px] font-mono text-[#80808A] sm:text-right shrink-0">
            Posted {postedDate}
          </p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoRow
            icon={<MapPin className="h-3.5 w-3.5" />}
            label="Location"
            value={listing.location || 'Not specified'}
          />
          <InfoRow
            icon={<Users className="h-3.5 w-3.5" />}
            label="Sharing"
            value={SHARING_LABELS[listing.sharing_type] || listing.sharing_type}
          />
          <InfoRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="Available"
            value={availableDate}
          />
          {listing.distance_km && (
            <InfoRow
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="Distance"
              value={`${listing.distance_km} km`}
            />
          )}
        </div>

        {/* Description */}
        {listing.description && (
          <div className="bg-[#111113] rounded-md border border-[#26262B] p-5">
            <h2 className="text-xs font-semibold text-[#F2F2F3] font-mono uppercase tracking-wider mb-2.5">
              Description
            </h2>
            <p className="text-xs text-[#8B8B92] leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>
        )}

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div className="bg-[#111113] rounded-md border border-[#26262B] p-5">
            <h2 className="text-xs font-semibold text-[#F2F2F3] font-mono uppercase tracking-wider mb-2.5">
              Amenities
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {listing.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#17171A] border border-[#26262B] text-[#8B8B92] rounded-sm text-xs font-mono capitalize"
                >
                  {AMENITY_ICONS[amenity.toLowerCase()] || null}
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Roommate Preferences */}
        {isRoomAvailable && (listing.pref_veg !== null || listing.pref_smoking !== null || listing.pref_study_friendly !== null || listing.pref_sleep_schedule) && (
          <div className="bg-[#111113] rounded-md border border-[#26262B] p-5">
            <h2 className="text-xs font-semibold text-[#F2F2F3] font-mono uppercase tracking-wider mb-2.5">
              Roommate Preferences
            </h2>
            <div className="flex flex-wrap gap-2">
              <PrefChip label="Vegetarian" value={listing.pref_veg} />
              <PrefChip label="Non-smoking" value={listing.pref_smoking === false ? true : listing.pref_smoking === true ? false : null} />
              <PrefChip label="Study Friendly" value={listing.pref_study_friendly} />
              {listing.pref_sleep_schedule && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-mono bg-[#17171A] border border-[#26262B] text-[#8B8B92] capitalize">
                  {listing.pref_sleep_schedule} schedule
                </div>
              )}
            </div>
          </div>
        )}

        {/* Poster + Contact */}
        <div className="bg-[#111113] rounded-md border border-[#26262B] p-5">
          <h2 className="text-xs font-semibold text-[#F2F2F3] font-mono uppercase tracking-wider mb-3">
            Posted By
          </h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-[#17171A] border border-[#26262B] flex items-center justify-center text-[#F2F2F3] font-semibold text-sm">
                {listing.user?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-xs font-medium text-[#F2F2F3]">{listing.user?.name}</p>
                <p className="text-[11px] font-mono text-[#80808A]">
                  Room {listing.user?.room_number}, Block {listing.user?.block_number}
                </p>
              </div>
            </div>

            {user ? (
              <a
                href={getWhatsAppUrl(listing.whatsapp, buildHousingWhatsAppMsg(listing))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#34D399] hover:bg-[#2EB882] text-[#0A0A0B] font-semibold text-xs rounded-md transition"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F5A623] hover:bg-[#E0921B] text-[#0A0A0B] font-semibold text-xs rounded-md transition"
              >
                <span>Login to contact</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
