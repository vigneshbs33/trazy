import { useCallback } from 'react';

// Hash string for simple client-side key generation
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; 
  }
  return hash.toString();
};

export function useRouteCache() {
  const ttlMs = 1800000; // 30 mins

  const getCachedRoute = useCallback((text) => {
    if (!text) return null;
    const hash = hashString(text);
    const key = `trazy_cache_${hash}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    try {
      const item = JSON.parse(raw);
      if (Date.now() - item.timestamp > ttlMs) {
        localStorage.removeItem(key);
        return null;
      }
      return item.data;
    } catch (e) {
      return null;
    }
  }, []);

  const setCachedRoute = useCallback((text, data) => {
    if (!text) return;
    const hash = hashString(text);
    const key = `trazy_cache_${hash}`;
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  }, []);

  return { getCachedRoute, setCachedRoute };
}
