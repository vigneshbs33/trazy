import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseIntent } from '../services/geminiService.js';

// ─── Mock Gemini SDK ─────────────────────────────────────────────────────────
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockImplementation(async (prompt) => {
        // Solo intent — any city
        if (/HSR to Majestic fastest/i.test(prompt)) {
          return { response: { text: () => JSON.stringify({
            mode: 'solo',
            destination: 'Majestic',
            city: 'Bengaluru, India',
            travelers: [{ name: 'You', location: 'HSR Layout', hasCar: false }],
            inferredPriority: 'fastest',
          }) } };
        }
        // Group intent
        if (/Me HSR.*Priya Indiranagar.*Arjun Jayanagar driving Chennai/i.test(prompt)) {
          return { response: { text: () => JSON.stringify({
            mode: 'group',
            destination: 'Chennai',
            city: 'Bengaluru, India',
            travelers: [
              { name: 'Me',    location: 'HSR Layout',  hasCar: false },
              { name: 'Priya', location: 'Indiranagar', hasCar: false },
              { name: 'Arjun', location: 'Jayanagar',   hasCar: true  },
            ],
            inferredPriority: 'balanced',
          }) } };
        }
        // Global city — New York
        if (/Brooklyn.*JFK.*fastest/i.test(prompt)) {
          return { response: { text: () => JSON.stringify({
            mode: 'solo',
            destination: 'JFK Airport',
            city: 'New York, USA',
            travelers: [{ name: 'You', location: 'Brooklyn', hasCar: false }],
            inferredPriority: 'fastest',
          }) } };
        }
        // HTML injection / sanitized input → malformed JSON from Gemini
        return { response: { text: () => 'Not valid JSON at all.' } };
      }),
    }),
  })),
}));

describe('geminiService — parseIntent', () => {
  it('parses a solo intent correctly (Bengaluru)', async () => {
    const result = await parseIntent('HSR to Majestic fastest');
    expect(result.mode).toBe('solo');
    expect(result.travelers).toHaveLength(1);
    expect(result.destination).toBe('Majestic');
    expect(result.city).toBe('Bengaluru, India');
  });

  it('parses a group intent and identifies the driver', async () => {
    const result = await parseIntent(
      'Me HSR, Priya Indiranagar, Arjun Jayanagar driving Chennai'
    );
    expect(result.mode).toBe('group');
    expect(result.destination).toBe('Chennai');
    const driver = result.travelers.find(t => t.hasCar);
    expect(driver?.name).toBe('Arjun');
  });

  it('works for a non-Indian city (New York → JFK)', async () => {
    const result = await parseIntent('Brooklyn to JFK fastest');
    expect(result.mode).toBe('solo');
    expect(result.city).toBe('New York, USA');
    expect(result.destination).toBe('JFK Airport');
  });

  it('falls back gracefully on malformed Gemini output', async () => {
    const result = await parseIntent('completely_random_gibberish_xyz');
    expect(result).toHaveProperty('mode');
    expect(result).toHaveProperty('destination');
    expect(result).toHaveProperty('travelers');
    expect(Array.isArray(result.travelers)).toBe(true);
  });

  it('sanitized HTML input produces valid fallback (no crash)', async () => {
    const result = await parseIntent('<script>alert(1)</script>');
    expect(result).toHaveProperty('mode');
    expect(result.mode).toMatch(/^(solo|group)$/);
  });
});
