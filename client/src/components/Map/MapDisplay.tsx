import React from 'react';
import { Map, Marker, useMap } from '@vis.gl/react-google-maps';

interface MapDisplayProps {
  center?: { lat: number, lng: number };
  markers?: Array<{ lat: number, lng: number, label?: string }>;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  center = { lat: 12.9716, lng: 77.5946 }, // Bengaluru center
  markers = [] 
}) => {
  return (
    <div className="w-full h-full min-h-[300px] rounded-[2.5rem] overflow-hidden shadow-inner border border-brand-green/10">
      <Map
        defaultCenter={center}
        defaultZoom={12}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapId={'trazy_map'} // Optional: use a styled map ID if you have one
      >
        {markers.map((marker, i) => (
          <Marker 
            key={i} 
            position={{ lat: marker.lat, lng: marker.lng }}
            label={marker.label}
          />
        ))}
      </Map>
    </div>
  );
};

export default MapDisplay;
