import React, { useState } from 'react';
import { useSpeech } from '../../hooks/useSpeech.js';
import { Volume2, Square } from 'lucide-react';

export default function ListenButton({ textToRead }) {
  const { speak, stop, isSupported } = useSpeech();
  const [isPlaying, setIsPlaying]   = useState(false);

  if (!isSupported) return null; // Graceful degradation

  const handleToggle = async () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    try {
      await speak(textToRead, 'en-IN');
    } catch { /* speech error — silently reset */ }
    finally { setIsPlaying(false); }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isPlaying ? 'Stop route narration' : 'Listen to route description'}
      aria-pressed={isPlaying}
      className="inline-flex items-center gap-2 bg-trazy-card hover:bg-trazy-card/80 border border-white/10 rounded-full px-4 py-2 text-sm font-medium text-white transition-colors focus-ring"
    >
      {isPlaying
        ? <Square  className="w-4 h-4 text-trazy-accent" aria-hidden="true" />
        : <Volume2 className="w-4 h-4 text-trazy-accent" aria-hidden="true" />
      }
      {isPlaying ? 'Stop' : '🔊 Listen to Route'}
    </button>
  );
}
