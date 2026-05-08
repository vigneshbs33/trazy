import { useCallback, useRef } from 'react';

export function useSpeech() {
  const utteranceRef = useRef(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  /**
   * Speak text aloud. Returns a Promise that resolves when speech ends
   * or rejects on error. Falls back gracefully if API unavailable.
   * @param {string} text
   * @param {string} [lang='en-US']
   */
  const speak = useCallback((text, lang = 'en-IN') => {
    if (!isSupported) {
      console.warn('[useSpeech] SpeechSynthesis not supported in this browser.');
      return Promise.resolve();
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang  = lang;
      utterance.rate  = 0.95;

      utterance.onend   = () => resolve();
      utterance.onerror = (e) => reject(new Error(e.error));

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [isSupported]);

  const stop = useCallback(() => {
    if (isSupported) window.speechSynthesis.cancel();
  }, [isSupported]);

  return { speak, stop, isSupported };
}
