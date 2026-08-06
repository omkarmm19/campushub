import { Link } from 'react-router-dom';
import { IndianRupee, Tag, Star } from 'lucide-react';

const CATEGORY_COLORS = {
  book: 'bg-blue-50 text-blue-700',
  gadget: 'bg-purple-50 text-purple-700',
  clothing: 'bg-pink-50 text-pink-700',
  furniture: 'bg-amber-50 text-amber-700',
  stationary: 'bg-teal-50 text-teal-700',
  other: 'bg-slate-100 text-slate-600',
};

const CONDITION_COLORS = {
  new: 'bg-emerald-100 text-emerald-700',
  good: 'bg-blue-100 text-blue-700',
  fair: 'bg-amber-100 text-amber-700',
  poor: 'bg-red-100 text-red-600',
};

const LISTING_TYPE_LABELS = {
  sell: 'For Sale',
  rent: 'For Rent',
  free: '🎁 Free',
};

export default function MarketplaceCard({ item }) {
  const firstImage = item.images?.[0]?.image_url;

  return (
    <Link
      to={`/marketplace/${item.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 shrink-0 overflow-hidden">
        {firstImage ? (
          <img
            src={firstImage}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <Tag className="h-10 w-10 mb-1" />
            <span className="text-xs">No photo</span>
          </div>
        )}

        {/* Sold overlay */}
        {item.is_sold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-sm rotate-[-8deg]">
              SOLD
            </span>
          </div>
        )}

        {/* Listing type badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
          item.listing_type === 'free'
            ? 'bg-emerald-600 text-white'
            : item.listing_type === 'rent'
            ? 'bg-violet-600 text-white'
            : 'bg-indigo-600 text-white'
        }`}>
          {LISTING_TYPE_LABELS[item.listing_type] || item.listing_type}
        </div>

        {/* Images count */}
        {item.images?.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
            +{item.images.length - 1}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Category + Condition */}
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}>
            {item.category}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${CONDITION_COLORS[item.condition] || ''}`}>
            {item.condition}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition">
          {item.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-0.5">
          {item.listing_type === 'free' ? (
            <span className="text-emerald-600 font-bold text-lg">Free</span>
          ) : (
            <>
              <IndianRupee className="h-4 w-4 text-indigo-600 mb-0.5" />
              <span className="text-xl font-bold text-slate-900">
                {item.price.toLocaleString('en-IN')}
              </span>
              {item.listing_type === 'rent' && (
                <span className="text-xs text-slate-400 ml-1">/month</span>
              )}
            </>
          )}
        </div>

        {/* Footer: Poster */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
            {item.user?.name?.charAt(0) || '?'}
          </div>
          <span className="text-xs text-slate-400 font-medium">{item.user?.name}</span>
        </div>
      </div>
    </Link>
  );
}
