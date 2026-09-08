import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, RefreshCw, SlidersHorizontal, X, Shield } from 'lucide-react';
import { marketplaceAPI } from '../../api/marketplaceAPI';
import { useAuth } from '../../context/AuthContext';
import MarketplaceCard from '../../components/marketplace/MarketplaceCard';

const CATEGORIES = ['book', 'gadget', 'clothing', 'furniture', 'stationary', 'other'];
const LISTING_TYPES = [
  { value: '', label: 'All' },
  { value: 'sell', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
  { value: 'free', label: 'Free' },
];
const CONDITIONS = [
  { value: '', label: 'Any' },
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const DEFAULT_FILTERS = { category: '', listing_type: '', max_price: '', condition: '' };

function SkeletonCard() {
  return (
    <div className="flex flex-col bg-[#111113] rounded-md border border-[#26262B] p-3 space-y-3 animate-pulse">
      <div className="h-44 bg-[#17171A] rounded-sm" />
      <div className="space-y-2 pt-1">
        <div className="flex gap-1.5">
          <div className="h-4 w-12 bg-[#17171A] rounded-sm" />
          <div className="h-4 w-12 bg-[#17171A] rounded-sm" />
        </div>
        <div className="h-4 w-full bg-[#17171A] rounded-sm" />
        <div className="h-5 w-1/3 bg-[#17171A] rounded-sm" />
      </div>
    </div>
  );
}

export default function MarketplaceList() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const set = (key, val) => setFilters((f) => ({ ...f, [key]: val }));

  const hasActive = Object.values(filters).some((v) => v !== '');

  const fetchItems = useCallback(async (activeFilters) => {
    setLoading(true);
    setError('');
    try {
      const clean = Object.fromEntries(Object.entries(activeFilters).filter(([, v]) => v !== ''));
      const data = await marketplaceAPI.getItems(clean);
      setItems(data);
    } catch {
      setError('Failed to load items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(filters), 400);
    return () => clearTimeout(t);
  }, [filters, fetchItems]);

  return (
    <div className="space-y-6 py-2">
      {/* Header — BUG 1 fix: high contrast, solid icon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#26262B] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="h-5 w-5 text-[#F2F2F3]" />
            <h1 className="text-xl sm:text-2xl font-semibold text-[#F2F2F3] tracking-tight">
              Marketplace
            </h1>
          </div>
          <p className="text-xs text-[#8B8B92]">
            Buy, sell, or rent student essentials on campus
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-mono rounded-md transition ${
              showFilters || hasActive
                ? 'border-[#22D3EE]/40 bg-[#22D3EE]/10 text-[#22D3EE]'
                : 'border-[#26262B] bg-[#111113] text-[#8B8B92] hover:text-[#F2F2F3]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {hasActive && (
              <span className="px-1.5 py-0.2 bg-[#22D3EE] text-[#0A0A0B] text-[10px] font-semibold rounded-sm">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>

          {user && (
            <Link
              to="/marketplace/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] font-semibold text-xs rounded-md transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Sell an Item</span>
            </Link>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="bg-[#111113] border border-[#26262B] rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8B8B92]">Filter Listings</span>
            {hasActive && (
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-mono transition"
              >
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">Type</label>
              <div className="flex rounded-md bg-[#17171A] border border-[#26262B] p-1 gap-1">
                {LISTING_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => set('listing_type', t.value)}
                    className={`flex-1 py-1 px-1.5 rounded-sm text-xs font-medium transition ${
                      filters.listing_type === t.value
                        ? 'bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30'
                        : 'text-[#8B8B92] hover:text-[#F2F2F3] border border-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">Condition</label>
              <div className="flex rounded-md bg-[#17171A] border border-[#26262B] p-1 gap-1">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => set('condition', c.value)}
                    className={`flex-1 py-1 px-1.5 rounded-sm text-xs font-medium transition ${
                      filters.condition === c.value
                        ? 'bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30'
                        : 'text-[#8B8B92] hover:text-[#F2F2F3] border border-transparent'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">Category</label>
              <select
                value={filters.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#17171A] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] focus:outline-none focus:border-[#22D3EE] font-mono capitalize"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Max price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono text-[#8B8B92] uppercase">Max Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={filters.max_price}
                onChange={(e) => set('max_price', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#17171A] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] placeholder:text-[#80808A] focus:outline-none focus:border-[#22D3EE] font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-[#111113] border border-red-500/30 rounded-md text-center">
          <p className="text-xs text-red-400 font-medium mb-3">{error}</p>
          <button
            onClick={() => fetchItems(filters)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#26262B] bg-[#17171A] hover:bg-[#1E1E22] text-[#F2F2F3] text-xs font-medium rounded-md transition"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Items grid */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <MarketplaceCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="py-16 flex flex-col items-center text-center text-[#8B8B92] border border-[#26262B] bg-[#111113] rounded-md p-8">
          <div className="h-10 w-10 rounded-sm bg-[#17171A] border border-[#26262B] flex items-center justify-center mb-3">
            <ShoppingBag className="h-5 w-5 text-[#80808A]" />
          </div>
          <h3 className="text-sm font-semibold text-[#F2F2F3] mb-1">No items listed</h3>
          <p className="text-xs text-[#80808A] max-w-xs leading-relaxed">
            Try adjusting your search criteria or list your textbooks, electronics, or dorm gear.
          </p>
          {user && (
            <Link
              to="/marketplace/create"
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#22D3EE] hover:bg-[#0EA5C4] text-[#0A0A0B] text-xs font-semibold rounded-md transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Sell an Item
            </Link>
          )}
        </div>
      )}

      {/* Guest notice banner */}
      {!user && !loading && items.length > 0 && (
        <div className="p-3.5 bg-[#17171A] border border-[#22D3EE]/30 rounded-md flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Shield className="h-4 w-4 text-[#22D3EE] shrink-0" />
            <p className="text-xs text-[#8B8B92]">
              Log in with your college email to view WhatsApp contacts, save items, and post listings.
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
