// API base — Vite proxy forwards /api to localhost:8080 in dev
const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

const REQUEST_TIMEOUT_MS = 30_000; // 30 seconds

/**
 * Plan a route by sending raw NLP text to the Trazy backend.
 * The Gemini API key lives ONLY on the server — never in this bundle.
 */
export const planRoute = async (rawText, signal) => {
  // AbortController for timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // Allow caller to also cancel
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }

  try {
    const response = await fetch(`${API_BASE}/api/plan-route`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ text: rawText }),
      signal:  controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      // Try to parse server error message
      let msg = `Server error ${response.status}`;
      try {
        const body = await response.json();
        if (body.error) msg = body.error;
      } catch { /* ignore parse failure */ }
      throw new Error(msg);
    }

    return response.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') throw new Error('Request timed out — please try again.');
    throw err;
  }
};
