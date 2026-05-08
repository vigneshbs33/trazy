import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RouteCard from '../../components/RouteCards/RouteCard.jsx';

const HYBRID_ROUTE = {
  type:    'hybrid',
  name:    'Trazy Hybrid',
  segments: [
    { mode: 'bus',  description: 'Bus 500C to Marathahalli', from: 'Koramangala', to: 'Marathahalli', duration: 32, cost: 25 },
    { mode: 'auto', description: 'Auto to Whitefield',        from: 'Marathahalli', to: 'Whitefield',   duration: 16, cost: 95 },
  ],
  switchPoint:          'Marathahalli Bridge',
  switchReason:         'Avoid the KR Puram traffic choke.',
  firstMileSuggestion:  null,
  totalTime:   48,
  totalCost:   120,
  comfort:     4,
  co2Grams:    420,
  recommended: true,
  insight:     'Best balance of speed and cost.',
};

describe('RouteCard component', () => {
  it('renders route name, cost, time, and switch point', () => {
    const html = renderToStaticMarkup(<RouteCard route={HYBRID_ROUTE} />);
    expect(html).toContain('Trazy Hybrid');
    expect(html).toContain('₹120');
    expect(html).toContain('48 min');
    expect(html).toContain('Marathahalli Bridge');
  });

  it('renders the Trazy Pick badge when recommended', () => {
    const html = renderToStaticMarkup(<RouteCard route={HYBRID_ROUTE} />);
    expect(html).toContain('Trazy Pick');
  });

  it('renders correct accessibility label for comfort rating', () => {
    const html = renderToStaticMarkup(<RouteCard route={HYBRID_ROUTE} />);
    expect(html).toContain('Comfort rating 4 out of 5');
  });

  it('renders segment aria-labels for screen readers', () => {
    const html = renderToStaticMarkup(<RouteCard route={HYBRID_ROUTE} />);
    expect(html).toContain('Segment 1 of 2');
    expect(html).toContain('32 minutes');
    expect(html).toContain('25 rupees');
  });

  it('renders route insight text', () => {
    const html = renderToStaticMarkup(<RouteCard route={HYBRID_ROUTE} />);
    expect(html).toContain('Best balance of speed and cost.');
  });

  it('does not crash when optional fields are missing', () => {
    const minimal = {
      type: 'public', name: 'Bus Only',
      segments: [], totalTime: 60, totalCost: 20,
      recommended: false,
    };
    expect(() => renderToStaticMarkup(<RouteCard route={minimal} />)).not.toThrow();
  });

  it('returns null when route prop is undefined', () => {
    const html = renderToStaticMarkup(<RouteCard route={undefined} />);
    expect(html).toBe('');
  });
});
