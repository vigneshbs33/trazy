import React, { memo, useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import HybridRoute from './HybridRoute.jsx';
import MergeRoute from './MergeRoute.jsx';
import TrafficToggle from './TrafficToggle.jsx';

const containerStyle = { width: '100%', height: '100%' };

// Stable reference — prevents re-loading the Maps SDK on every render
const LIBRARIES = ['places', 'geometry'];

/**
 * MapView — React.memo wrapped Google Map container.
 * Renders HybridRoute (solo) or MergeRoute (group) based on mode.
 *
 * Google Services used here:
 *   - Maps JavaScript API (useJsApiLoader)
 *   - TrafficLayer (via TrafficToggle)
 *   - DirectionsService + DirectionsRenderer (via child route components)
 *   - PlacesService Nearby Search (via MergeRoute / server)
 *   - DistanceMatrix (via server-side mapsService)
 */
const MapView = memo(({ mode, routeData, intent }) => {
  const apiKey = import.meta.env.VITE_MAPS_PUBLIC_KEY
    || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || 'MISSING_KEY',
    libraries: LIBRARIES,
  });

  const [map, setMap] = useState(null);
  const onLoad    = useCallback((m) => setMap(m), []);
  const onUnmount = useCallback(() => setMap(null), []);

  // Dynamic center — derived from route data
  const center = useMemo(() => {
    const mp = routeData?.schedule?.mergePoint;
    if (mp?.lat && mp?.lng) return { lat: mp.lat, lng: mp.lng };
    // No fixed default — let Maps auto-center on drawn routes
    return { lat: 20.5937, lng: 78.9629 }; // India geographic center
  }, [routeData]);

  // ── No API key: render a styled mock map ────────────────────────────────────
  if (!apiKey) {
    const hybrid     = routeData?.routes?.find(r => r.type === 'hybrid');
    const mergePoint = routeData?.schedule?.mergePoint;
    return (
      <div
        data-testid="map-container"
        className="relative w-full h-full overflow-hidden bg-[#121b16]"
        role="application"
        aria-label="Trazy route map — mock mode (add VITE_MAPS_PUBLIC_KEY to enable live maps)"
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(163,230,53,.2) 1px,transparent 1px),linear-gradient(90deg,rgba(163,230,53,.2) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }} />
        {/* Route line mock */}
        <div className="absolute left-[10%] top-[40%] h-1 w-[45%] rounded-full bg-trazy-blue shadow-[0_0_20px_rgba(37,99,235,.5)]" />
        <div className="absolute left-[52%] top-[40%] h-1 w-[30%] rounded-full border-t-4 border-dashed border-trazy-purple opacity-80" />
        {/* Switch / merge pin */}
        <div
          data-testid="map-switch-label"
          className="absolute left-[50%] top-[32%] -translate-x-1/2 rounded-full bg-trazy-accent px-4 py-2 text-sm font-bold text-trazy-bg shadow-[0_0_24px_rgba(163,230,53,.5)] whitespace-nowrap"
        >
          {mode === 'group'
            ? `📍 ${mergePoint?.name || 'Merge Point'}`
            : `⚡ Switch: ${hybrid?.switchPoint || 'Switch Point'}`}
        </div>
        {/* Key missing notice */}
        <div className="absolute bottom-4 left-4 max-w-xs rounded-xl border border-white/10 bg-trazy-card/90 p-3 text-xs text-trazy-muted">
          Live map disabled. Add <span className="text-trazy-accent font-medium">VITE_MAPS_PUBLIC_KEY</span> to <code>.env</code> to enable Google Maps rendering.
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-trazy-bg text-trazy-muted text-sm">
        Maps failed to load. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-trazy-bg">
        <div className="w-8 h-8 border-4 border-trazy-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      data-testid="map-container"
      className="relative w-full h-full"
      role="application"
      aria-label="Trazy route map"
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          // Dark map style — "Trazy Dark"
          styles: [
            { elementType: 'geometry',            stylers: [{ color: '#1d2c3b' }] },
            { elementType: 'labels.text.stroke',  stylers: [{ color: '#1d2c3b' }] },
            { elementType: 'labels.text.fill',    stylers: [{ color: '#8d9199' }] },
            { featureType: 'road',                elementType: 'geometry',       stylers: [{ color: '#38414e' }] },
            { featureType: 'road.highway',        elementType: 'geometry',       stylers: [{ color: '#55606e' }] },
            { featureType: 'road.highway',        elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
            { featureType: 'transit',             elementType: 'geometry',       stylers: [{ color: '#2f3948' }] },
            { featureType: 'transit.station',     elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
            { featureType: 'water',               elementType: 'geometry',       stylers: [{ color: '#0e1626' }] },
            { featureType: 'poi',                 elementType: 'labels',         stylers: [{ visibility: 'off' }] },
          ],
        }}
      >
        {map && mode === 'solo' && routeData?.routes && (
          <HybridRoute
            map={map}
            hybridRoute={routeData.routes.find(r => r.type === 'hybrid')}
            city={intent?.city || ''}
          />
        )}
        {map && mode === 'group' && routeData?.schedule && (
          <MergeRoute
            map={map}
            schedule={routeData.schedule}
            city={intent?.city || ''}
          />
        )}
        {map && <TrafficToggle map={map} />}
      </GoogleMap>
    </div>
  );
});

MapView.displayName = 'MapView';
export default MapView;
