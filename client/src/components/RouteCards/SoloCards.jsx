import React, { useState } from 'react';
import RouteCard from './RouteCard.jsx';
import GreenFlexBadge from '../Shared/GreenFlexBadge.jsx';
import ListenButton from '../Shared/ListenButton.jsx';

export default function SoloCards({ routes, globalInsight }) {
  const [selectedIdx, setSelectedIdx] = useState(null);
  if (!routes || routes.length === 0) return null;

  const hybridRoute  = routes.find(r => r.type === 'hybrid');
  const privateRoute = routes.find(r => r.type === 'private');

  const listenText = hybridRoute
    ? `Trazy recommends the hybrid route. ${hybridRoute.segments.map(s => s.description).join('. Then ')}. Total: ${hybridRoute.totalTime} minutes for ${hybridRoute.totalCost} rupees.`
    : 'Here are your route options.';

  return (
    <section
      className="flex flex-col h-full bg-trazy-bg p-5 overflow-y-auto"
      aria-label="Route options"
    >
      <h2 className="text-xl font-display font-semibold text-white mb-1">Your Options</h2>
      {globalInsight && (
        <p className="text-xs text-trazy-muted mb-5 leading-relaxed">{globalInsight}</p>
      )}

      <div className="space-y-3 flex-1" role="list">
        {routes.map((route, idx) => (
          <div key={idx} role="listitem">
            <RouteCard
              route={route}
              onClick={() => setSelectedIdx(idx === selectedIdx ? null : idx)}
            />
          </div>
        ))}
      </div>

      <div className="mt-5 pt-5 border-t border-white/10 flex flex-col gap-3">
        <ListenButton textToRead={listenText} />
        {hybridRoute && privateRoute && (
          <GreenFlexBadge
            hybridGrams={hybridRoute.co2Grams}
            privateGrams={privateRoute.co2Grams}
          />
        )}
      </div>
    </section>
  );
}
