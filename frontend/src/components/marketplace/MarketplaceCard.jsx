import { Link } from 'react-router-dom';
import { IndianRupee, Tag } from 'lucide-react';

const LISTING_TYPE_LABELS = {
  sell: 'For Sale',
  rent: 'For Rent',
  free: 'Free',
};

export default function MarketplaceCard({ item }) {
  const firstImage = item.images?.[0]?.image_url;

  return (
    <Link
      to={`/marketplace/${item.id}`}
      className="group flex flex-col bg-[#111113] rounded-md border border-[#26262B] hover:border-[#38383F] hover:bg-[#141417] transition duration-150 overflow-hidden"
    >
      {/* Framed Photo Container */}
      <div className="p-3 pb-0">
        <div className="relative h-44 rounded-sm border border-[#26262B] bg-[#0E0E10] shrink-0 overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#52525A]">
              <Tag className="h-8 w-8 mb-1 opacity-50" />
              <span className="text-[11px] font-mono">No photo</span>
            </div>
          )}

          {/* Sold overlay */}
          {item.is_sold && (
            <div className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-xs flex items-center justify-center">
              <span className="px-3 py-1 bg-red-500/20 border border-red-500/40 text-red-400 font-mono font-semibold text-xs rounded-sm rotate-[-6deg]">
                Sold
              </span>
            </div>
          )}

          {/* Outlined Listing Type Chip — Zero Emojis */}
          <div className="absolute top-2.5 left-2.5">
            {item.listing_type === 'free' ? (
              <span className="inline-block px-2 py-0.5 rounded-sm border border-[#34D399]/30 bg-[#0A0A0B]/80 text-[#34D399] text-[10px] font-mono backdrop-blur-sm">
                Free
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded-sm border border-[#38BDF8]/30 bg-[#0A0A0B]/80 text-[#38BDF8] text-[10px] font-mono backdrop-blur-sm">
                {LISTING_TYPE_LABELS[item.listing_type] || item.listing_type}
              </span>
            )}
          </div>

          {/* Images count */}
          {item.images?.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded-sm bg-[#0A0A0B]/80 border border-[#26262B] text-[#8B8B92] text-[10px] font-mono backdrop-blur-sm">
              +{item.images.length - 1} photos
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 gap-2">
        {/* Category + Condition: Slate neutral outlined chips */}
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.2 rounded-sm border border-[#94A3B8]/20 bg-[#94A3B8]/5 text-[#94A3B8] text-[10px] font-mono capitalize">
            {item.category}
          </span>
          <span className="px-1.5 py-0.2 rounded-sm border border-[#94A3B8]/20 bg-[#94A3B8]/5 text-[#80808A] text-[10px] font-mono capitalize">
            {item.condition}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[#F2F2F3] text-xs leading-snug line-clamp-2 group-hover:text-white transition">
          {item.title}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-0.5 mt-auto pt-1">
          {item.listing_type === 'free' ? (
            <span className="text-[#34D399] font-mono font-semibold text-base">Free</span>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <IndianRupee className="h-3.5 w-3.5 text-[#22D3EE] mb-0.5" />
              <span className="text-lg font-mono font-semibold text-[#F2F2F3]">
                {item.price.toLocaleString('en-IN')}
              </span>
              {item.listing_type === 'rent' && (
                <span className="text-[11px] text-[#80808A] font-mono ml-1">/mo</span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Poster */}
        <div className="pt-2 border-t border-[#1F1F24] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-4 w-4 rounded-full bg-[#17171A] border border-[#26262B] flex items-center justify-center text-[#8B8B92] text-[9px] font-mono">
              {item.user?.name?.charAt(0) || '?'}
            </div>
            <span className="text-[11px] text-[#8B8B92] truncate max-w-[140px]">{item.user?.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
