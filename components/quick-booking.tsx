'use client';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, MapPin, Navigation } from 'lucide-react';
export function QuickBooking() {
  const router = useRouter();
  return (
    <form
      className="journey-bar"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        router.push(
          `/booking?${new URLSearchParams({ pickup: String(data.get('pickup')), drop: String(data.get('drop')), trip: String(data.get('trip')) })}`,
        );
      }}
    >
      <label>
        <MapPin size={18} />
        <span>
          <small>START SOMEWHERE</small>
          <input
            name="pickup"
            aria-label="Pickup location"
            placeholder="Your pickup city"
            minLength={3}
            maxLength={250}
            required
          />
        </span>
      </label>
      <label>
        <Navigation size={18} />
        <span>
          <small>GO SOMEWHERE</small>
          <input
            name="drop"
            aria-label="Destination"
            placeholder="Your destination"
            minLength={3}
            maxLength={250}
            required
          />
        </span>
      </label>
      <label className="journey-type">
        <span>
          <small>MAKE IT YOURS</small>
          <select name="trip" aria-label="Journey type">
            <option value="oneway">One-way journey</option>
            <option value="roundtrip">There & back</option>
            <option value="airport">Airport transfer</option>
          </select>
        </span>
      </label>
      <button className="button orange" type="submit">
        Find my ride <ArrowUpRight size={20} />
      </button>
    </form>
  );
}
