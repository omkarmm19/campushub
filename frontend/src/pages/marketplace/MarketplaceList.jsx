import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
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
    <div className="flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-200" />
      <div className="p-4 space-y-2.5">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
          <div className="h-5 w-12 bg-slate-100 rounded-full" />
        </div>
        <div className="h-4 w-full bg-slate-200 rounded-lg" />
        <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
        <div className="h-6 w-1/3 bg-slate-200 rounded-lg" />
        <div className="pt-2.5 border-t border-slate-100 flex gap-2 items-center">
          <div className="h-5 w-5 bg-slate-200 rounded-full" />
          <div className="h-4 w-20 bg-slate-100 rounded-lg" />
        </div>
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
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Marketplace</h1>
          </div>
          <p className="text-sm text-slate-500">Buy, sell or rent student essentials</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 border text-sm font-semibold rounded-xl transition ${
              showFilters || hasActive
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters {hasActive && <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">{Object.values(filters).filter(Boolean).length}</span>}
          </button>
          {user && (
            <Link
              to="/marketplace/create"
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition"
            >
              <Plus className="h-4 w-4" /> Post Item
            </Link>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Filters · {!loading ? `${items.length} results` : '...'}</p>
            {hasActive && (
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                <X className="h-3.5 w-3.5" /> Clear all
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Listing Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</label>
              <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                {LISTING_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => set('listing_type', t.value)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                      filters.listing_type === t.value
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Condition</label>
              <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                {CONDITIONS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => set('condition', c.value)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition ${
                      filters.condition === c.value
                        ? 'bg-white text-indigo-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Max Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={filters.max_price}
                onChange={(e) => set('max_price', e.target.value)}
                className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => set('category', '')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  !filters.category ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => set('category', filters.category === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border capitalize transition ${
                    filters.category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
          <button onClick={() => fetchItems(filters)} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition">
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Items grid */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item) => <MarketplaceCard key={item.id} item={item} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && items.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center text-slate-400">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-600 mb-1">No items found</h3>
          <p className="text-sm max-w-xs">Try adjusting your filters or post something to sell!</p>
          {user && (
            <Link to="/marketplace/create" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-200 transition">
              <Plus className="h-4 w-4" /> Post first item
            </Link>
          )}
        </div>
      )}

      {!user && !loading && items.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-amber-800 font-medium">🔒 Log in to contact sellers and post your own items.</p>
          <Link to="/login" className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition">Log In</Link>
        </div>
      )}
    </div>
  );
}
