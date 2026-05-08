import React, { memo, useMemo } from 'react';

const MODE_ICONS = {
  bus:    '🚌', metro: '🚇', walk: '🚶', uber: '🚗',
  auto:   '🛺', bike:  '🚲', taxi: '🚖', train: '🚆',
  car:    '🚗', transit: '🚌',
};

const RouteCard = memo(({ route, onClick }) => {
  if (!route) return null;

  const totalSegs = route.segments?.length ?? 0;

  const co2Display = useMemo(() => {
    if (!route.co2Grams || route.co2Grams <= 0) return null;
    return route.co2Grams >= 1000
      ? `${(route.co2Grams / 1000).toFixed(1)} kg`
      : `${route.co2Grams} g`;
  }, [route.co2Grams]);

  return (
    <article
      role="article"
      tabIndex={0}
      data-testid={`route-card-${route.type}`}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={`p-5 rounded-2xl border cursor-default transition-all outline-none
        focus-visible:ring-2 focus-visible:ring-trazy-accent focus-visible:ring-offset-2 focus-visible:ring-offset-trazy-bg
        ${route.recommended
          ? 'bg-trazy-card border-trazy-accent shadow-[0_0_20px_rgba(163,230,53,0.12)]'
          : 'glass-panel hover:bg-white/5'
        }`}
      aria-label={`${route.name}. ${route.totalTime} minutes. ${route.totalCost} rupees. Comfort ${route.comfort} out of 5.${route.recommended ? ' Recommended.' : ''}`}
    >
      {/* Header row */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-display font-semibold text-white">
            {route.type === 'hybrid' ? '✦ ' : ''}{route.name}
          </h3>
          {route.recommended && (
            <span
              data-testid="trazy-pick-badge"
              className="inline-block mt-1 text-[9px] uppercase tracking-widest font-bold bg-trazy-accent text-trazy-bg px-2 py-0.5 rounded-sm"
            >
              Trazy Pick
            </span>
          )}
        </div>
        <div className="text-right shrink-0 ml-3">
          <p className="text-xl font-bold text-white">₹{route.totalCost}</p>
          <p className="text-sm text-trazy-muted">{route.totalTime} min</p>
        </div>
      </div>

      {/* Segments */}
      <ul className="space-y-1.5 mb-3" aria-label="Route segments">
        {(route.segments || []).map((seg, idx) => (
          <li
            key={idx}
            className="seg-pill"
            aria-label={`Segment ${idx + 1} of ${totalSegs}: ${seg.description}, ${seg.duration} minutes, costs ${seg.cost} rupees`}
          >
            <span aria-hidden="true">{MODE_ICONS[seg.mode] || '🔀'}</span>
            <span className="text-white/80 truncate max-w-[220px]">{seg.description}</span>
            <span className="text-trazy-muted ml-auto shrink-0">{seg.duration}m</span>
          </li>
        ))}
      </ul>

      {/* Switch point callout */}
      {route.switchPoint && (
        <div
          data-testid="switch-point"
          className="bg-trazy-blue/10 border border-trazy-blue/30 rounded-lg p-3 mb-3"
        >
          <p className="text-[10px] text-trazy-blue font-bold uppercase tracking-wider mb-1">⚡ Switch Point</p>
          <p className="text-sm text-white font-medium">{route.switchPoint}</p>
          {route.switchReason && (
            <p className="text-xs text-trazy-muted mt-1">{route.switchReason}</p>
          )}
        </div>
      )}

      {/* First mile tip */}
      {route.firstMileSuggestion && (
        <div className="bg-trazy-secondary/10 border border-trazy-secondary/30 rounded-lg p-3 mb-3">
          <p className="text-[10px] text-trazy-secondary font-bold uppercase tracking-wider mb-1">First Mile</p>
          <p className="text-sm text-white">{route.firstMileSuggestion}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 mt-2">
        <div
          className="text-sm text-trazy-muted"
          aria-label={`Comfort rating ${route.comfort ?? 0} out of 5`}
        >
          {'★'.repeat(route.comfort ?? 0)}{'☆'.repeat(Math.max(0, 5 - (route.comfort ?? 0)))}
        </div>
        {co2Display && (
          <span className="text-xs text-trazy-muted">
            🌿 {co2Display} CO₂
          </span>
        )}
      </div>

      {/* Route insight */}
      {route.insight && (
        <p className="mt-2 text-xs text-trazy-muted italic leading-relaxed">{route.insight}</p>
      )}
    </article>
  );
});

RouteCard.displayName = 'RouteCard';
export default RouteCard;
