import React, { memo } from 'react';
import ListenButton from '../Shared/ListenButton.jsx';
import GreenFlexBadge from '../Shared/GreenFlexBadge.jsx';

const LiveSyncPanel = memo(({ schedule }) => {
  if (!schedule) return null;

  const {
    mergePoint = {},
    travelers  = [],
    sharedDeparture,
    estimatedArrival,
    co2ComparedToAllPrivate,
  } = schedule;

  const readText = [
    `You are all meeting at ${mergePoint.name || 'the merge point'}.`,
    ...travelers.map(t => `${t.name} should leave at ${t.leaveAt || 'TBD'} and ${t.route || 'take transit'}.`),
    `Depart together at ${sharedDeparture || 'TBD'}.`,
  ].join(' ');

  return (
    <section
      className="flex flex-col h-full bg-trazy-bg p-5 overflow-y-auto"
      role="region"
      aria-label="Group departure schedule"
    >
      <h2 className="text-xl font-display font-semibold text-white mb-4">Live Sync Schedule</h2>

      {/* Merge point card */}
      <div
        data-testid="merge-point-card"
        className="glass-panel p-4 rounded-xl border-l-4 border-l-trazy-orange mb-6"
      >
        <p className="text-[10px] text-trazy-orange font-bold uppercase tracking-wider mb-1">📍 Merge Point</p>
        <p className="text-base text-white font-semibold">{mergePoint.name || '—'}</p>
        <p className="text-sm text-trazy-muted">{mergePoint.address || ''}</p>
        {mergePoint.arrivalTime && (
          <p className="text-sm text-white mt-2 flex items-center gap-2">
            <span aria-hidden="true">🕒</span>
            Meet at <strong className="text-trazy-accent">{mergePoint.arrivalTime}</strong>
          </p>
        )}
      </div>

      {/* Traveler timeline */}
      <ol
        className="space-y-4 flex-1 relative before:absolute before:left-5 before:top-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/15 before:to-transparent"
        aria-label="Departure schedule per traveler"
      >
        {travelers.map((t, idx) => (
          <li key={idx} className="relative flex items-start pl-12">
            {/* Timeline dot */}
            <div
              aria-hidden="true"
              className="absolute left-5 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-trazy-accent bg-trazy-bg flex items-center justify-center"
            >
              <div className="w-2 h-2 rounded-full bg-trazy-accent" />
            </div>

            <div className="w-full glass-panel p-4 rounded-xl">
              <div className="flex justify-between items-start mb-1">
                <p className="text-white font-semibold text-sm">
                  <span aria-hidden="true">{t.hasCar ? '🚗' : '👤'} </span>
                  {(t.name || '').toUpperCase()}
                  <span className="ml-1 text-xs font-normal text-trazy-muted">({t.from})</span>
                </p>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-trazy-muted uppercase tracking-wide">Leave at</p>
                  <p
                    className="text-lg font-bold text-trazy-accent"
                    aria-label={`Leave at ${t.leaveAt}`}
                  >
                    {t.leaveAt || '—'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">{t.route}</p>
              {t.arriveAt && (
                <p className="text-xs text-trazy-muted mt-1">Arrives {t.arriveAt}</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Depart together */}
      <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-trazy-accent">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-trazy-accent font-bold uppercase tracking-wider mb-0.5">Depart Together</p>
              <p className="text-lg text-white font-bold">{sharedDeparture || '—'}</p>
            </div>
            {estimatedArrival && (
              <div className="text-right">
                <p className="text-[10px] text-trazy-muted uppercase tracking-wider mb-0.5">Estimated Arrival</p>
                <p className="text-base text-white font-medium">~{estimatedArrival}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <ListenButton textToRead={readText} />
          {co2ComparedToAllPrivate > 0 && (
            <GreenFlexBadge
              hybridGrams={0}
              privateGrams={co2ComparedToAllPrivate}
              customLabel={`Group saved ${(co2ComparedToAllPrivate / 1000).toFixed(1)} kg CO₂ vs driving separately`}
            />
          )}
        </div>
      </div>
    </section>
  );
});

LiveSyncPanel.displayName = 'LiveSyncPanel';
export default LiveSyncPanel;
