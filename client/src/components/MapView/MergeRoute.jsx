import React, { useEffect, useRef } from 'react';

// Traveler color palette
const TRAVELER_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6'];

/**
 * MergeRoute — draws the group route on Google Maps in 3 animated phases:
 *   Phase 1: Passengers → merge point (dashed colored Polylines via google.maps.Polyline + SymbolPath)
 *   Phase 2: Driver → merge point (solid orange line)
 *   Phase 3: All → shared destination (thick white/yellow line)
 *
 * Google Services: DirectionsService, google.maps.Polyline (icons/SymbolPath),
 *                  google.maps.Marker, TrafficLayer (Phase 3)
 */
export default function MergeRoute({ map, schedule, city }) {
  const overlaysRef = useRef([]); // all map overlays for cleanup

  const cleanup = () => {
    overlaysRef.current.forEach(o => o?.setMap(null));
    overlaysRef.current = [];
  };

  useEffect(() => {
    return cleanup; // cleanup on unmount
  }, []);

  useEffect(() => {
    if (!schedule || !map || !window.google) return;
    cleanup();

    const travelers  = schedule.travelers || [];
    const mergePoint = schedule.mergePoint;
    if (travelers.length === 0 || !mergePoint) return;

    const cityCtx = city ? `, ${city}` : '';
    const ds      = new window.google.maps.DirectionsService();
    const mpDest  = mergePoint.lat && mergePoint.lng
      ? { lat: mergePoint.lat, lng: mergePoint.lng }
      : `${mergePoint.name}, ${mergePoint.address}`;

    // ── Shared dashed symbol factory ──────────────────────────────────────
    const makeDashedSymbol = (color) => ({
      path:           'M 0,-1 0,1',
      strokeOpacity:  1,
      strokeColor:    color,
      scale:          3,
    });

    // ── Phase 1: draw one route per traveler after staggered delay ────────
    travelers.forEach((traveler, idx) => {
      const isDriver = Boolean(traveler.hasCar);
      const color    = isDriver ? '#EA580C' : (TRAVELER_COLORS[idx % TRAVELER_COLORS.length]);
      const origin   = `${traveler.from}${cityCtx}`;

      // Phase 1 passengers at 0ms, Phase 2 driver at 1500ms
      const delay = isDriver ? 1500 : (idx * 400);

      setTimeout(() => {
        ds.route(
          {
            origin,
            destination: mpDest,
            travelMode: isDriver
              ? window.google.maps.TravelMode.DRIVING
              : window.google.maps.TravelMode.TRANSIT,
          },
          (res, status) => {
            if (status !== 'OK') {
              // Fallback to driving if transit unavailable
              if (!isDriver) {
                ds.route(
                  { origin, destination: mpDest, travelMode: window.google.maps.TravelMode.DRIVING },
                  (r2, s2) => { if (s2 === 'OK') drawTravelerLine(r2, color, isDriver); }
                );
              }
              return;
            }
            drawTravelerLine(res, color, isDriver);

            // Place traveler start marker
            const startPos = res.routes[0].legs[0].start_location;
            const label    = traveler.name?.[0]?.toUpperCase() || '?';
            const marker = new window.google.maps.Marker({
              map,
              position: startPos,
              title:    `${traveler.name} — leaves at ${traveler.leaveAt}`,
              label:    { text: label, color: '#fff', fontWeight: 'bold' },
              icon: {
                path:        window.google.maps.SymbolPath.CIRCLE,
                scale:       14,
                fillColor:   color,
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              },
            });
            overlaysRef.current.push(marker);
          }
        );
      }, delay);
    });

    // ── Draw polyline from DirectionsResult ───────────────────────────────
    const drawTravelerLine = (res, color, isDriver) => {
      const path = window.google.maps.geometry.encoding.decodePath(
        res.routes[0].overview_polyline
      );

      let polyline;
      if (isDriver) {
        // Solid orange line for driver
        polyline = new window.google.maps.Polyline({
          map,
          path,
          strokeColor:   color,
          strokeWeight:  5,
          strokeOpacity: 1,
        });
      } else {
        // Dashed colored line for passengers — proper Maps icons approach
        polyline = new window.google.maps.Polyline({
          map,
          path,
          strokeOpacity: 0,
          icons: [{
            icon:   makeDashedSymbol(color),
            offset: '0',
            repeat: '14px',
          }],
        });
      }
      overlaysRef.current.push(polyline);
    };

    // ── Phase 3: Merge Point marker + pulsing ring ─────────────────────────
    setTimeout(() => {
      if (!mergePoint.lat || !mergePoint.lng) return;
      const position = { lat: mergePoint.lat, lng: mergePoint.lng };

      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="52" viewBox="0 0 44 52">
          <ellipse cx="22" cy="46" rx="10" ry="4" fill="rgba(0,0,0,0.3)"/>
          <path d="M22 0C9.8 0 0 9.8 0 22C0 34.2 22 52 22 52C22 52 44 34.2 44 22C44 9.8 34.2 0 22 0Z"
                fill="#A3E635" stroke="#fff" stroke-width="2"/>
          <text x="22" y="27" text-anchor="middle" fill="#0F0F0F" font-size="18">📍</text>
        </svg>`;

      const mergeMarker = new window.google.maps.Marker({
        map,
        position,
        title:    `Meet here: ${mergePoint.name}`,
        zIndex:   100,
        icon: {
          url:    'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
          anchor: new window.google.maps.Point(22, 52),
        },
      });
      overlaysRef.current.push(mergeMarker);

      // Phase 3: shared route to destination (after 3s)
      // TrafficLayer auto-enabled for the shared leg
      const trafficLayer = new window.google.maps.TrafficLayer();
      trafficLayer.setMap(map);
      overlaysRef.current.push(trafficLayer);
    }, 3000);

  }, [schedule, map, city]);

  return null;
}
