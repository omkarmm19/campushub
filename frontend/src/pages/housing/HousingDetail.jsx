import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Users, Calendar, IndianRupee, Phone,
  Wifi, Zap, Droplets, Car, Utensils, Wind, CheckCircle2,
  XCircle, ChevronLeft, ChevronRight, Edit, Trash2, AlertTriangle,
} from 'lucide-react';
import { housingAPI } from '../../api/housingAPI';
import { useAuth } from '../../context/AuthContext';

const AMENITY_ICONS = {
  wifi: <Wifi className="h-4 w-4" />,
  electricity: <Zap className="h-4 w-4" />,
  water: <Droplets className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  mess: <Utensils className="h-4 w-4" />,
  ac: <Wind className="h-4 w-4" />,
};

const SHARING_LABELS = { single: 'Single', double: 'Double', triple: 'Triple', other: 'Other' };

// Image carousel
function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="h-72 md:h-96 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-300">
        <svg className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <p className="text-sm">No photos uploaded</p>
      </div>
    );
  }

  const sorted = [...images].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-black shadow-lg">
      <img
        src={sorted[current].image_url}
        alt={`Photo ${current + 1}`}
        className="w-full h-72 md:h-96 object-cover"
      />

      {sorted.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c === 0 ? sorted.length - 1 : c - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c === sorted.length - 1 ? 0 : c + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition backdrop-blur-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
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

// Delete confirmation modal
function DeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Delete Listing?</h3>
            <p className="text-sm text-slate-500 mt-1">
              This will permanently remove your listing. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-semibold">{value}</p>
      </div>
    </div>
  );
}

import SaveButton from '../../components/common/SaveButton';
import { getWhatsAppUrl } from '../../utils/formatters';

function PrefChip({ label, value }) {
  if (value === null || value === undefined) return null;
  const positive = value === true;
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
      positive
        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
        : 'bg-red-50 border-red-200 text-red-600'
    }`}>
      {positive
        ? <CheckCircle2 className="h-3.5 w-3.5" />
        : <XCircle className="h-3.5 w-3.5" />}
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
        <div className="h-5 w-24 bg-slate-200 rounded-lg" />
        <div className="h-80 bg-slate-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 w-1/2 bg-slate-200 rounded-lg" />
          <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
          <div className="h-4 w-2/3 bg-slate-100 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-slate-500 font-medium mb-4">{error}</p>
        <Link to="/housing" className="text-sm text-indigo-600 font-semibold hover:underline">
          ← Back to listings
        </Link>
      </div>
    );
  }

  const availableDate = new Date(listing.available_from).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
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

      <div className="max-w-3xl mx-auto py-6 space-y-6">
        {/* Back + Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 font-medium transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          <div className="flex items-center gap-2">
            <SaveButton module="housing" postId={id} />
            {canManage && (
              <>
                <Link
                  to={`/housing/${id}/edit`}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition"
                >
                  <Edit className="h-4 w-4" /> Edit
                </Link>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Image Carousel */}
        <ImageCarousel images={listing.images} />

        {/* Title block */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
              isRoomAvailable ? 'bg-blue-100 text-blue-700' : 'bg-violet-100 text-violet-700'
            }`}>
              {isRoomAvailable ? '🏠 Room Available' : '🤝 Roommate Needed'}
            </span>
            {!listing.is_active && (
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                Inactive
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-5 w-5 text-indigo-600" />
              <span className="text-3xl font-extrabold text-slate-900">
                {listing.rent_per_person.toLocaleString('en-IN')}
              </span>
              <span className="text-slate-400 text-sm font-medium">/month per person</span>
            </div>
            {listing.security_deposit && (
              <p className="text-sm text-slate-400">
                Security deposit: ₹{listing.security_deposit.toLocaleString('en-IN')}
              </p>
            )}
          </div>

          <p className="text-xs text-slate-400 sm:text-right shrink-0">
            Posted on {postedDate}
          </p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow
            icon={<MapPin className="h-4 w-4" />}
            label="Location"
            value={listing.location || 'Not specified'}
          />
          <InfoRow
            icon={<Users className="h-4 w-4" />}
            label="Sharing"
            value={SHARING_LABELS[listing.sharing_type] || listing.sharing_type}
          />
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Available From"
            value={availableDate}
          />
          {listing.distance_km && (
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Distance"
              value={`${listing.distance_km} km from college`}
            />
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-3">About this listing</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
            {listing.description}
          </p>
        </div>

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-3">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {listing.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium capitalize"
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-bold text-slate-900 mb-3">Roommate Preferences</h2>
            <div className="flex flex-wrap gap-2">
              <PrefChip label="Vegetarian" value={listing.pref_veg} />
              <PrefChip label="Non-smoking" value={listing.pref_smoking === false ? true : listing.pref_smoking === true ? false : null} />
              <PrefChip label="Study Friendly" value={listing.pref_study_friendly} />
              {listing.pref_sleep_schedule && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                  🌙 {listing.pref_sleep_schedule} person
                </div>
              )}
            </div>
          </div>
        )}

        {/* Poster + Contact */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-bold text-slate-900 mb-4">Posted by</h2>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                {listing.user?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{listing.user?.name}</p>
                <p className="text-xs text-slate-400">Room {listing.user?.room_number}, Block {listing.user?.block_number}</p>
              </div>
            </div>

            {user ? (
              <a
                href={getWhatsAppUrl(listing.whatsapp, "Hi! I saw your listing on CampusHub.")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-200 transition"
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </a>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition"
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
