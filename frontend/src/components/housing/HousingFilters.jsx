import { SlidersHorizontal, X } from 'lucide-react';

const LISTING_TYPES = [
  { value: '', label: 'All' },
  { value: 'room_available', label: 'Room Available' },
  { value: 'roommate_needed', label: 'Roommate Needed' },
];

const SHARING_TYPES = [
  { value: '', label: 'Any' },
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'triple', label: 'Triple' },
];

export default function HousingFilters({ filters, onChange, resultCount }) {
  const hasActiveFilters =
    filters.listing_type || filters.max_rent || filters.sharing_type || filters.max_distance;

  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onChange({ listing_type: '', max_rent: '', sharing_type: '', max_distance: '' });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
          Filters
          {resultCount !== undefined && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium">
              {resultCount} results
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition"
          >
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {/* Listing Type — Segmented */}
        <div className="flex flex-col gap-1.5 min-w-[220px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Listing Type
          </label>
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
            {LISTING_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleChange('listing_type', t.value)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
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

        {/* Sharing Type */}
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Sharing Type
          </label>
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
            {SHARING_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleChange('sharing_type', t.value)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                  filters.sharing_type === t.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Rent */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Max Rent (₹/month)
          </label>
          <input
            type="number"
            placeholder="e.g. 8000"
            value={filters.max_rent}
            onChange={(e) => handleChange('max_rent', e.target.value)}
            className="w-36 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>

        {/* Max Distance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Max Distance (km)
          </label>
          <input
            type="number"
            step="0.5"
            placeholder="e.g. 3"
            value={filters.max_distance}
            onChange={(e) => handleChange('max_distance', e.target.value)}
            className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>
      </div>
    </div>
  );
}
