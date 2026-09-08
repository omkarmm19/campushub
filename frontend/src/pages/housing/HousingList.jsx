import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, Plus, RefreshCw, Shield } from 'lucide-react';
import { housingAPI } from '../../api/housingAPI';
import { useAuth } from '../../context/AuthContext';
import HousingCard from '../../components/housing/HousingCard';
import HousingFilters from '../../components/housing/HousingFilters';

// Precision skeleton card
function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[#111113] rounded-md border border-[#26262B] p-3 space-y-3 animate-pulse">
      <div className="h-44 bg-[#17171A] rounded-sm" />
      <div className="space-y-2 pt-1">
        <div className="h-5 bg-[#17171A] rounded-sm w-1/3" />
        <div className="h-3.5 bg-[#17171A] rounded-sm w-3/4" />
        <div className="h-3.5 bg-[#17171A] rounded-sm w-1/2" />
        <div className="flex gap-1.5 pt-1">
          <div className="h-4 w-12 bg-[#17171A] rounded-sm" />
          <div className="h-4 w-12 bg-[#17171A] rounded-sm" />
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

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings(filters);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters, fetchListings]);

  return (
    <div className="space-y-6 py-2">
      {/* Header — BUG 1 fix: high contrast, solid icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26262B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Home className="h-5 w-5 text-[#F2F2F3]" />
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F2F3] tracking-tight">
              Housing
            </h1>
          </div>
          <p className="text-xs text-[#8B8B92]">
            Verified off-campus flats, rooms, and roommate matching
          </p>
        </div>

        {user && (
          <Link
            to="/housing/create"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-semibold text-xs rounded-md transition duration-150 shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post a Listing</span>
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
        <div className="p-4 bg-[#111113] border border-red-500/30 rounded-md text-center">
          <p className="text-xs text-red-400 font-medium mb-3">{error}</p>
          <button
            onClick={() => fetchListings(filters)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] text-[#F2F2F3] text-xs font-medium rounded-md transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Listings grid */}
      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <HousingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && listings.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center text-[#8B8B92] border border-[#26262B] bg-[#111113] rounded-md p-8">
          <div className="h-10 w-10 rounded-sm bg-[#17171A] border border-[#26262B] flex items-center justify-center mb-3">
            <Home className="h-5 w-5 text-[#80808A]" />
          </div>
          <h3 className="text-sm font-semibold text-[#F2F2F3] mb-1">No listings found</h3>
          <p className="text-xs text-[#80808A] max-w-xs leading-relaxed">
            Adjust your rent or distance filters, or be the first student to list a room.
          </p>
          {user && (
            <Link
              to="/housing/create"
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] text-xs font-semibold rounded-md transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Post a Listing
            </Link>
          )}
        </div>
      )}

      {/* Guest notice banner — BUG 2 fix: dark banner with hairline secondary button */}
      {!user && !loading && listings.length > 0 && (
        <div className="p-3.5 bg-[#17171A] border border-[#22D3EE]/30 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-[#22D3EE] shrink-0" />
            <p className="text-xs text-[#8B8B92]">
              Log in with your college email to view WhatsApp contact numbers and post rooms.
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
