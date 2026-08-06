import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, Plus, RefreshCw } from 'lucide-react';
import { housingAPI } from '../../api/housingAPI';
import { useAuth } from '../../context/AuthContext';
import HousingCard from '../../components/housing/HousingCard';
import HousingFilters from '../../components/housing/HousingFilters';

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-200" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-slate-200 rounded-lg w-2/5" />
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 w-14 bg-slate-100 rounded-full" />
          <div className="h-5 w-14 bg-slate-100 rounded-full" />
        </div>
        <div className="pt-3 border-t border-slate-100 flex gap-2 items-center">
          <div className="h-6 w-6 bg-slate-200 rounded-full" />
          <div className="h-4 w-24 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

const DEFAULT_FILTERS = {
  listing_type: '',
  max_rent: '',
  sharing_type: '',
  max_distance: '',
};

export default function HousingList() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const fetchListings = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      // Strip empty string values
      const cleanFilters = Object.fromEntries(
        Object.entries(activeFilters).filter(([, v]) => v !== '' && v !== null && v !== undefined)
      );
      const data = await housingAPI.getListings(cleanFilters);
      setListings(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings(filters);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters, fetchListings]);

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <Home className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Housing</h1>
          </div>
          <p className="text-sm text-slate-500">
            Find rooms &amp; roommates near your college
          </p>
        </div>

        {user && (
          <Link
            to="/housing/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition"
          >
            <Plus className="h-4 w-4" />
            Post a Listing
          </Link>
        )}
      </div>

      {/* Filters */}
      <HousingFilters
        filters={filters}
        onChange={setFilters}
        resultCount={!loading ? listings.length : undefined}
      />

      {/* Error state */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={() => fetchListings(filters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Listings grid */}
      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((listing) => (
            <HousingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && listings.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center text-slate-400">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-1">No listings found</h3>
          <p className="text-sm max-w-xs">
            Try adjusting your filters or check back later. New listings are posted regularly!
          </p>
          {user && (
            <Link
              to="/housing/create"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition"
            >
              <Plus className="h-4 w-4" />
              Be the first to post
            </Link>
          )}
        </div>
      )}

      {/* Guest banner */}
      {!user && !loading && listings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-amber-800 font-medium">
            🔒 Log in to view WhatsApp contact details and post your own listings.
          </p>
          <Link
            to="/login"
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition"
          >
            Log In
          </Link>
        </div>
      )}
    </div>
  );
}
