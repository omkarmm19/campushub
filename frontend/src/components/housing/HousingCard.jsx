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
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden shrink-0">
        {firstImage ? (
          <img
            src={firstImage}
            alt={listing.location || 'Housing listing'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
            <svg className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">No photos yet</span>
          </div>
        )}

        {/* Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${
          isRoomAvailable
            ? 'bg-blue-600 text-white'
            : 'bg-violet-600 text-white'
        }`}>
          {isRoomAvailable ? '🏠 Room Available' : '🤝 Roommate Needed'}
        </div>

        {/* Images count */}
        {listing.images?.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/50 text-white text-xs backdrop-blur-sm">
            +{listing.images.length - 1} more
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Rent */}
        <div className="flex items-baseline gap-1">
          <IndianRupee className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
          <span className="text-xl font-bold text-slate-900">
            {listing.rent_per_person.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-slate-400 font-medium">/month per person</span>
        </div>

        {/* Location & Distance */}
        {(listing.location || listing.distance_km) && (
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">
              {listing.location || 'Location not specified'}
              {listing.distance_km && (
                <span className="text-slate-400 ml-1">· {listing.distance_km} km from college</span>
              )}
            </span>
          </div>
        )}

        {/* Sharing type + Available from */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {SHARING_LABELS[listing.sharing_type] || listing.sharing_type} sharing
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            From {availableDate}
          </span>
        </div>

        {/* Amenities */}
        {listing.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {listing.amenities.slice(0, 4).map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium capitalize"
              >
                {AMENITY_ICONS[amenity.toLowerCase()] || null}
                {amenity}
              </span>
            ))}
            {listing.amenities.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 text-xs">
                +{listing.amenities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer: Poster name */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
              {listing.user?.name?.charAt(0) || '?'}
            </div>
            <span className="text-xs text-slate-500 font-medium">{listing.user?.name || 'Anonymous'}</span>
          </div>
          {listing.security_deposit && (
            <span className="text-xs text-slate-400">
              Deposit ₹{listing.security_deposit.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
