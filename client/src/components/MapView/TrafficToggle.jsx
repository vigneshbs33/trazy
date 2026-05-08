import React, { useEffect, useState, useRef } from 'react';

export default function TrafficToggle({ map }) {
  const [isActive, setIsActive] = useState(false);
  const trafficLayerRef = useRef(null);

  useEffect(() => {
    if (window.google?.maps?.TrafficLayer && !trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }
  }, []);

  const toggleTraffic = () => {
    if (!map) return;
    if (trafficLayerRef.current && map) {
      const newState = !isActive;
      trafficLayerRef.current.setMap(newState ? map : null);
      setIsActive(newState);
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-bengaluru-card rounded-lg shadow-lg overflow-hidden border border-white/10 z-10">
      <button 
        onClick={toggleTraffic}
        aria-label="Toggle live traffic layer"
        disabled={!map}
        className={`px-4 py-2 text-sm font-semibold transition-colors focus-ring ${
          isActive 
            ? 'bg-bengaluru-accent text-bengaluru-bg' 
            : 'bg-transparent text-white hover:bg-white/10'
        }`}
      >
        {isActive ? 'Traffic: ON' : 'Traffic: OFF'}
      </button>
    </div>
  );
}
