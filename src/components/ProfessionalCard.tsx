import { Link } from 'react-router-dom'
import { Icon } from './Icon'
import type { ProfessionalListing } from '../lib/types'

export function ProfessionalCard({ listing, distanceKm }: { listing: ProfessionalListing; distanceKm?: number | null }) {
  const name = listing.profile?.full_name || listing.profile?.username || 'Local pro'

  return (
    <Link
      to={`/professionals/${listing.id}`}
      className="block bg-white rounded-2xl border border-rally-border overflow-hidden shadow-[0_1px_2px_rgba(17,17,16,0.04)] hover:shadow-[0_8px_20px_rgba(17,17,16,0.08)] hover:-translate-y-0.5 transition-all duration-200"
    >
      {listing.profile?.avatar_url ? (
        <img src={listing.profile.avatar_url} alt="" className="w-full h-36 object-cover" />
      ) : (
        <div className="w-full h-36 bg-rally-amber-light flex items-center justify-center">
          <Icon name="wrench" size={32} className="text-rally-amber" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-rally-black" style={{ fontFamily: 'Circular' }}>{name}</p>
          <span className="text-[10px] bg-rally-cream text-gray-500 px-2 py-0.5 rounded-full flex-shrink-0">{listing.category}</span>
        </div>

        {listing.description && (
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed line-clamp-3">{listing.description}</p>
        )}

        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {listing.price_note && (
            <span className="flex items-center gap-1 text-[11px] text-rally-black">
              <Icon name="currency-dollar" size={12} /> {listing.price_note}
            </span>
          )}
          {distanceKm != null ? (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Icon name="map-pin" size={12} /> {distanceKm < 1 ? '<1' : distanceKm.toFixed(1)} km
            </span>
          ) : listing.profile?.location_text ? (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Icon name="map-pin" size={12} /> {listing.profile.location_text}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
