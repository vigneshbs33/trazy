import React, { useEffect, useRef } from 'react';

/**
 * HybridRoute — draws the solo hybrid route on Google Maps using:
 *   - DirectionsService (transit mode) for the public leg  [blue solid]
 *   - DirectionsService (driving mode) for the private leg [purple dashed via google.maps.Polyline]
 *   - google.maps.Marker with custom SVG for the switch point
 *
 * Google Services: DirectionsService, DirectionsRenderer, google.maps.Polyline (icons),
 *                  google.maps.Marker
 */
export default function HybridRoute({ map, hybridRoute, city }) {
  const renderer1Ref = useRef(null); // public leg (blue)
  const polyline2Ref = useRef(null); // private leg (purple dashed)
  const markerRef    = useRef(null); // switch point marker

  useEffect(() => {
    // Cleanup on unmount or route change
    return () => {
      renderer1Ref.current?.setMap(null);
      polyline2Ref.current?.setMap(null);
      markerRef.current?.setMap(null);
    };
  }, []);

  useEffect(() => {
    if (!hybridRoute || !map || !window.google) return;

    // Clear previous overlays
    renderer1Ref.current?.setMap(null);
    polyline2Ref.current?.setMap(null);
    markerRef.current?.setMap(null);

    const segs   = hybridRoute.segments || [];
    if (segs.length === 0) return;

    const cityCtx  = city ? `, ${city}` : '';
    const origin   = `${segs[0].from}${cityCtx}`;
    const dest     = `${segs[segs.length - 1].to}${cityCtx}`;
    const switchPt = hybridRoute.switchPoint
      ? `${hybridRoute.switchPoint}${cityCtx}`
      : null;

    const ds = new window.google.maps.DirectionsService();

    // ── Leg 1: public transit (origin → switch point) ─────────────────────
    const leg1Dest = switchPt || dest;
    ds.route(
      { origin, destination: leg1Dest, travelMode: window.google.maps.TravelMode.TRANSIT },
      (res, status) => {
        if (status !== 'OK') {
          // Fallback to driving if transit unavailable
          ds.route(
            { origin, destination: leg1Dest, travelMode: window.google.maps.TravelMode.DRIVING },
            (r2, s2) => { if (s2 === 'OK') drawPublicLeg(r2); }
          );
          return;
        }
        drawPublicLeg(res);
      }
    );

    const drawPublicLeg = (res) => {
      renderer1Ref.current = new window.google.maps.DirectionsRenderer({
        map,
        directions: res,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor:   '#2563EB',  // trazy-blue
          strokeWeight:  5,
          strokeOpacity: 1,
        },
      });
    };

    // ── Leg 2: private / driving (switch point → destination) ────────────
    if (switchPt) {
      ds.route(
        { origin: switchPt, destination: dest, travelMode: window.google.maps.TravelMode.DRIVING },
        (res, status) => {
          if (status !== 'OK') return;

          // Decode the polyline path and draw a dashed Polyline
          const path = window.google.maps.geometry.encoding.decodePath(
            res.routes[0].overview_polyline
          );

          // Dashed symbol using SymbolPath — correct Maps API approach
          const dashedSymbol = {
            path:           'M 0,-1 0,1',
            strokeOpacity:  1,
            scale:          3,
          };

          polyline2Ref.current = new window.google.maps.Polyline({
            map,
            path,
            strokeOpacity: 0,
            icons: [{
              icon:   dashedSymbol,
              offset: '0',
              repeat: '15px',
            }],
            strokeColor: '#7C3AED',  // trazy-purple
          });

          // Place switch marker at start of leg 2 (end of leg 1)
          const switchLatLng = path[0];
          if (switchLatLng) drawSwitchMarker(switchLatLng);
        }
      );
    }

    // ── Switch Point Marker ───────────────────────────────────────────────
    const drawSwitchMarker = (position) => {
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="42" viewBox="0 0 36 42">
          <ellipse cx="18" cy="38" rx="8" ry="3" fill="rgba(0,0,0,0.25)"/>
          <path d="M18 0 C8 0 0 8 0 18 C0 28 18 42 18 42 C18 42 36 28 36 18 C36 8 28 0 18 0Z"
                fill="#7C3AED" stroke="#fff" stroke-width="2"/>
          <text x="18" y="22" text-anchor="middle" fill="white" font-size="14" font-weight="bold">⚡</text>
        </svg>`;
      markerRef.current = new window.google.maps.Marker({
        map,
        position,
        title: `Switch here: ${hybridRoute.switchPoint}`,
        icon: {
          url:    'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
          anchor: new window.google.maps.Point(18, 42),
        },
      });
    };

  }, [hybridRoute, map, city]);

  return null; // All rendering is via imperative Maps API
}
