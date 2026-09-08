import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, IndianRupee, Wifi, Zap, Droplets, Car, Utensils, Wind } from 'lucide-react';

const AMENITY_ICONS = {
  wifi: <Wifi className="h-3 w-3" />,
  electricity: <Zap className="h-3 w-3" />,
  water: <Droplets className="h-3 w-3" />,
  parking: <Car className="h-3 w-3" />,
  mess: <Utensils className="h-3 w-3" />,
  ac: <Wind className="h-3 w-3" />,
};

const SHARING_LABELS = {
  single: 'Single',
  double: 'Double',
  triple: 'Triple',
  other: 'Other',
};

export default function HousingCard({ listing }) {
  const isRoomAvailable = listing.listing_type === 'room_available';
  const firstImage = listing.images?.[0]?.image_url;
  const availableDate = new Date(listing.available_from).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Link
      to={`/housing/${listing.id}`}
      className="group flex flex-col bg-[#111113] rounded-md border border-[#26262B] hover:border-[#38383F] hover:bg-[#141417] transition duration-150 overflow-hidden"
    >
      {/* Framed Photo Container */}
      <div className="p-3 pb-0">
        <div className="relative h-44 rounded-sm border border-[#26262B] bg-[#0E0E10] overflow-hidden shrink-0">
          {firstImage ? (
            <img
              src={firstImage}
              alt={listing.location || 'Housing listing'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#52525A]">
              <svg className="h-8 w-8 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-[11px] font-mono">No photos</span>
            </div>
          )}

          {/* Outlined Status Badge — Zero Emojis */}
          <div className="absolute top-2.5 left-2.5">
            {isRoomAvailable ? (
              <span className="inline-block px-2 py-0.5 rounded-sm border border-[#34D399]/30 bg-[#0A0A0B]/80 text-[#34D399] text-[10px] font-mono backdrop-blur-sm">
                Room Available
              </span>
            ) : (
              <span className="inline-block px-2 py-0.5 rounded-sm border border-[#38BDF8]/30 bg-[#0A0A0B]/80 text-[#38BDF8] text-[10px] font-mono backdrop-blur-sm">
                Roommate Needed
              </span>
            )}
          </div>

          {/* Images count */}
          {listing.images?.length > 1 && (
            <div className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded-sm bg-[#0A0A0B]/80 border border-[#26262B] text-[#8B8B92] text-[10px] font-mono backdrop-blur-sm">
              +{listing.images.length - 1} photos
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-3.5 gap-2.5">
        {/* Rent & Per person */}
        <div className="flex items-baseline gap-1">
          <IndianRupee className="h-3.5 w-3.5 text-[#22D3EE] shrink-0 mt-0.5" />
          <span className="text-lg font-mono font-semibold text-[#F2F2F3]">
            {listing.rent_per_person.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-[#80808A] font-mono">/mo per person</span>
        </div>

        {/* Location & Distance */}
        {(listing.location || listing.distance_km) && (
          <div className="flex items-center gap-1.5 text-xs text-[#8B8B92]">
            <MapPin className="h-3 w-3 shrink-0 text-[#80808A]" />
            <span className="truncate">
              {listing.location || 'Location not specified'}
              {listing.distance_km && (
                <span className="text-[#80808A] ml-1 font-mono">· {listing.distance_km} km</span>
              )}
            </span>
          </div>
        )}

        {/* Sharing type + Available from */}
        <div className="flex items-center gap-2 text-xs text-[#8B8B92]">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-[#80808A]" />
            {SHARING_LABELS[listing.sharing_type] || listing.sharing_type} sharing
          </span>
          <span className="text-[#26262B]">·</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Calendar className="h-3 w-3 text-[#80808A]" />
            {availableDate}
          </span>
        </div>

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {listing.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-[#17171A] border border-[#26262B] text-[#8B8B92] text-[10px] font-mono capitalize"
              >
                {AMENITY_ICONS[amenity.toLowerCase()] || null}
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 4 && (
              <span className="px-1.5 py-0.5 rounded-sm bg-[#17171A] border border-[#26262B] text-[#80808A] text-[10px] font-mono">
                +{listing.amenities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer: Poster name & Deposit */}
        <div className="mt-auto pt-2.5 border-t border-[#1F1F24] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-full bg-[#17171A] border border-[#26262B] flex items-center justify-center text-[#8B8B92] text-[10px] font-mono">
              {listing.user?.name?.charAt(0) || '?'}
            </div>
            <span className="text-xs text-[#8B8B92] truncate max-w-[120px]">
              {listing.user?.name || 'Anonymous'}
            </span>
          </div>
          {listing.security_deposit && (
            <span className="text-[11px] font-mono text-[#80808A]">
              Dep: ₹{listing.security_deposit.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
