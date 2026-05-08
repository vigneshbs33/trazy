import React, { useMemo } from 'react';

/**
 * GreenFlexBadge — shows CO2 saved by choosing the hybrid route over full private.
 * Props:
 *   hybridGrams  — CO2 of the hybrid route in grams
 *   privateGrams — CO2 of the full private route in grams
 *   customLabel  — override the default label (for group mode)
 */
export default function GreenFlexBadge({ hybridGrams, privateGrams, customLabel }) {
  const savedLabel = useMemo(() => {
    if (customLabel) return customLabel;
    if (!hybridGrams && !privateGrams) return null;
    const diff = (privateGrams || 0) - (hybridGrams || 0);
    if (diff <= 0) return null;
    const display = diff >= 1000
      ? `${(diff / 1000).toFixed(1)} kg`
      : `${diff} g`;
    return `Your Trazy Hybrid saves ${display} CO₂ vs full private`;
  }, [hybridGrams, privateGrams, customLabel]);

  if (!savedLabel) return null;

  return (
    <div
      role="status"
      aria-label={savedLabel}
      className="inline-flex items-center gap-2 bg-trazy-card border border-trazy-accent/30 rounded-full px-4 py-2"
    >
      <span aria-hidden="true">🍃</span>
      <span className="text-xs font-medium text-trazy-accent">{savedLabel}</span>
    </div>
  );
}
