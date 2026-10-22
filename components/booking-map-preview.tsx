'use client';

import { useEffect, useRef, useState } from 'react';
import {
  DirectionsRenderer,
  GoogleMap,
  useJsApiLoader,
  type Libraries,
} from '@react-google-maps/api';
import { MapPin, Route } from 'lucide-react';

const libraries: Libraries = ['places'];
const defaultCenter = { lat: 11.0168, lng: 76.9558 };

type RouteResult = {
  directions?: google.maps.DirectionsResult;
  distance?: string;
  duration?: string;
  key: string;
  error?: string;
};

export type RouteMetrics = {
  distanceKm: number;
  durationMins: number;
};

type BookingMapPreviewProps = {
  pickup: string;
  drop: string;
  onRouteResolved?: (route: RouteMetrics) => void;
  onRouteError?: (message: string) => void;
};

export function BookingMapPreview({
  pickup,
  drop,
  onRouteResolved,
  onRouteError,
}: BookingMapPreviewProps) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
    return <UnavailablePreview pickup={pickup} drop={drop} onRouteError={onRouteError} />;
  return (
    <ConnectedPreview
      pickup={pickup}
      drop={drop}
      onRouteResolved={onRouteResolved}
      onRouteError={onRouteError}
    />
  );
}

function UnavailablePreview({
  pickup,
  drop,
  onRouteError,
}: Pick<BookingMapPreviewProps, 'pickup' | 'drop' | 'onRouteError'>) {
  useEffect(() => {
    onRouteError?.('Google Maps is unavailable. Check the public Maps API key.');
  }, [onRouteError]);
  return (
    <aside className="booking-map-card">
      <div className="booking-map-heading">
        <span>
          <Route size={21} />
        </span>
        <div>
          <h2>Your road ahead.</h2>
          <p>A little preview of your plan.</p>
        </div>
      </div>
      <div className="booking-map-canvas">
        <div className="booking-map-empty">
          <MapPin size={38} />
          <strong>Somewhere good is waiting.</strong>
          <span>
            Live maps are temporarily unavailable.
            <br />
            You can still send a journey enquiry.
          </span>
        </div>
      </div>
      <div className="booking-map-route">
        <div>
          <span className="route-dot start" />
          <small>PICKUP</small>
          <strong>{pickup || 'Your starting point'}</strong>
        </div>
        <div>
          <span className="route-dot end" />
          <small>DESTINATION</small>
          <strong>{drop || 'Your next chapter'}</strong>
        </div>
      </div>
    </aside>
  );
}
function ConnectedPreview({ pickup, drop, onRouteResolved, onRouteError }: BookingMapPreviewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'riders-google-maps',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
    preventGoogleFontsLoading: true,
  });
  const mapRef = useRef<google.maps.Map | null>(null);
  const [result, setResult] = useState<RouteResult | null>(null);
  const routeKey = `${pickup.trim()}|${drop.trim()}`;
  const routeReady = isLoaded && pickup.trim().length >= 3 && drop.trim().length >= 3;
  const currentResult = result?.key === routeKey ? result : null;
  const status = !routeReady
    ? 'Enter pickup and drop locations to preview your route.'
    : !currentResult
      ? 'Finding the best driving route…'
      : currentResult.error || '';

  useEffect(() => {
    if (!routeReady || !window.google?.maps) return;
    let active = true;
    const timer = window.setTimeout(() => {
      const service = new google.maps.DirectionsService();
      service.route(
        { origin: pickup, destination: drop, travelMode: google.maps.TravelMode.DRIVING },
        (directions, code) => {
          if (!active) return;
          if (code === 'OK' && directions) {
            const leg = directions.routes[0]?.legs[0];
            if (!leg?.distance?.value || !leg?.duration?.value) {
              const message = 'We could not calculate this driving route. Please retry.';
              setResult({ key: routeKey, error: message });
              onRouteError?.(message);
              return;
            }
            setResult({
              directions,
              distance: leg?.distance?.text || '',
              duration: leg?.duration?.text || '',
              key: routeKey,
            });
            onRouteResolved?.({
              distanceKm: leg.distance.value / 1000,
              durationMins: leg.duration.value / 60,
            });
            if (mapRef.current && directions.routes[0]?.bounds)
              mapRef.current.fitBounds(directions.routes[0].bounds, 44);
          } else {
            const message =
              'We could not calculate this driving route. Check the locations and retry.';
            setResult({
              key: routeKey,
              error: message,
            });
            onRouteError?.(message);
          }
        },
      );
    }, 650);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [drop, onRouteError, onRouteResolved, pickup, routeKey, routeReady]);

  useEffect(() => {
    if (loadError)
      onRouteError?.('Google Maps could not load. Check the API key and enabled APIs.');
  }, [loadError, onRouteError]);

  return (
    <aside className="booking-map-card">
      <div className="booking-map-heading">
        <span>
          <Route size={21} />
        </span>
        <div>
          <h2>Route preview</h2>
          <p>
            {currentResult?.directions
              ? `${currentResult.distance} · ${currentResult.duration}`
              : 'See your journey on the map'}
          </p>
        </div>
      </div>
      <div className="booking-map-canvas">
        {isLoaded && !loadError ? (
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={defaultCenter}
            zoom={7}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            options={{
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
              clickableIcons: false,
            }}
          >
            {currentResult?.directions && (
              <DirectionsRenderer
                directions={currentResult.directions}
                options={{
                  suppressMarkers: false,
                  polylineOptions: { strokeColor: '#F77331', strokeWeight: 5 },
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="booking-map-empty">
            <MapPin size={38} />
            <strong>Map preview</strong>
            <span>{loadError ? 'The map is temporarily unavailable.' : 'Loading the map…'}</span>
          </div>
        )}
      </div>
      <div className="booking-map-route">
        <div>
          <span className="route-dot start" />
          <small>PICKUP</small>
          <strong>{pickup || 'Add your pickup location'}</strong>
        </div>
        <div>
          <span className="route-dot end" />
          <small>DESTINATION</small>
          <strong>{drop || 'Add your drop location'}</strong>
        </div>
      </div>
      {status && <p className="booking-map-status">{status}</p>}
    </aside>
  );
}
