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
    <div className="bg-[#111113] border border-[#26262B] rounded-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#F2F2F3] font-mono">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#8B8B92]" />
          <span>Filters</span>
          {resultCount !== undefined && (
            <span className="ml-1 px-2 py-0.5 rounded-sm bg-[#17171A] border border-[#26262B] text-[#8B8B92] text-[11px] font-mono">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-mono transition"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        {/* Listing Type — Segmented */}
        <div className="flex flex-col gap-1.5 min-w-[220px]">
          <label className="text-[11px] font-mono text-[#8B8B92] uppercase tracking-wider">
            Listing Type
          </label>
          <div className="flex rounded-md bg-[#17171A] border border-[#26262B] p-1 gap-1">
            {LISTING_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleChange('listing_type', t.value)}
                className={`flex-1 py-1 px-2 rounded-sm text-xs font-medium transition ${
                  filters.listing_type === t.value
                    ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30'
                    : 'text-[#8B8B92] hover:text-[#F2F2F3] border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sharing Type */}
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label className="text-[11px] font-mono text-[#8B8B92] uppercase tracking-wider">
            Sharing Type
          </label>
          <div className="flex rounded-md bg-[#17171A] border border-[#26262B] p-1 gap-1">
            {SHARING_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleChange('sharing_type', t.value)}
                className={`flex-1 py-1 px-2 rounded-sm text-xs font-medium transition ${
                  filters.sharing_type === t.value
                    ? 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/30'
                    : 'text-[#8B8B92] hover:text-[#F2F2F3] border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max Rent */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-[#8B8B92] uppercase tracking-wider">
            Max Rent (₹/mo)
          </label>
          <input
            type="number"
            placeholder="e.g. 8000"
            value={filters.max_rent}
            onChange={(e) => handleChange('max_rent', e.target.value)}
            className="w-32 px-2.5 py-1.5 bg-[#17171A] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] placeholder:text-[#80808A] focus:outline-none focus:border-[#F5A623] font-mono"
          />
        </div>

        {/* Max Distance */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono text-[#8B8B92] uppercase tracking-wider">
            Max Distance (km)
          </label>
          <input
            type="number"
            step="0.5"
            placeholder="e.g. 3"
            value={filters.max_distance}
            onChange={(e) => handleChange('max_distance', e.target.value)}
            className="w-28 px-2.5 py-1.5 bg-[#17171A] border border-[#26262B] rounded-md text-xs text-[#F2F2F3] placeholder:text-[#80808A] focus:outline-none focus:border-[#F5A623] font-mono"
          />
        </div>
      </div>
    </div>
  );
}
