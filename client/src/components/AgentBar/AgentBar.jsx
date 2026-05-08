import React, { useState, useId, useRef, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce.js';
import { Search, ArrowRight, Mic } from 'lucide-react';

const EXAMPLE_CHIPS = [
  { label: 'Solo: Koramangala → Whitefield',    value: 'I need to go from Koramangala to Whitefield, balanced' },
  { label: 'Group: HSR, Indiranagar → Chennai', value: 'Me at HSR, Priya at Indiranagar, Arjun at Jayanagar. Arjun drives to Chennai.' },
  { label: 'Solo: Bandra → Andheri (Mumbai)',   value: 'Bandra to Andheri fastest, Mumbai' },
  { label: 'Group: CP → Gurgaon (Delhi)',        value: 'Me at Connaught Place, Ravi at Lajpat Nagar, going to Gurgaon. Ravi has a car.' },
];

export default function AgentBar({ onIntentParsed, isParsing }) {
  const [input, setInput]       = useState('');
  const [listening, setListening] = useState(false);
  const inputId                 = useId();
  const inputRef                = useRef(null);
  const autocompleteRef         = useRef(null);

  // ── Google Places Autocomplete ─────────────────────────────────────────────
  // Google Service: Places Autocomplete API
  useEffect(() => {
    if (!window.google?.maps?.places || !inputRef.current) return;
    if (autocompleteRef.current) return; // already initialised

    const ac = new window.google.maps.places.Autocomplete(inputRef.current, {
      types:  ['geocode', 'establishment'],
      fields: ['formatted_address', 'name', 'geometry'],
    });

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      const val   = place.name || place.formatted_address || '';
      if (val) setInput((prev) => prev.replace(/([^,]+)$/, val));
    });

    autocompleteRef.current = ac;
  }, []);

  // ── Web Speech API — voice input ───────────────────────────────────────────
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang        = 'en-IN';
    rec.interimResults = false;
    rec.onstart  = () => setListening(true);
    rec.onend    = () => setListening(false);
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.start();
  }, []);

  const handleSearch = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isParsing) return;
    onIntentParsed(trimmed);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <label htmlFor={inputId} className="sr-only">
        Describe your trip to plan a route
      </label>

      <div className="w-full relative group">
        <div
          aria-hidden="true"
          className="absolute -inset-[2px] bg-gradient-to-r from-trazy-accent via-trazy-blue to-trazy-purple rounded-2xl blur-md opacity-40 group-hover:opacity-70 group-focus-within:opacity-80 transition duration-500"
        />
        <div className="relative flex items-center">
          <Search className="absolute left-5 w-5 h-5 text-trazy-muted pointer-events-none" aria-hidden="true" />

          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(input)}
            disabled={isParsing}
            maxLength={500}
            autoComplete="off"
            spellCheck={false}
            placeholder="Where are you and your friends going?"
            className="w-full glass-panel text-lg text-white placeholder-trazy-muted/60 pl-14 pr-28 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-trazy-accent/60 disabled:opacity-50 shadow-2xl font-medium"
            aria-label="Trip description — Google Places Autocomplete enabled"
            aria-busy={isParsing}
            aria-describedby="agent-bar-hint"
          />

          {/* Mic button — voice input */}
          <button
            onClick={startListening}
            disabled={isParsing || listening}
            aria-label={listening ? 'Listening…' : 'Use voice input'}
            className={`absolute right-14 w-9 h-9 rounded-xl flex items-center justify-center transition-all focus-ring
              ${listening ? 'bg-red-500 animate-pulse' : 'bg-white/5 hover:bg-white/15'}`}
          >
            <Mic className="w-4 h-4 text-white" aria-hidden="true" />
          </button>

          {/* Submit button */}
          <button
            onClick={() => handleSearch()}
            disabled={!input.trim() || isParsing}
            aria-label="Plan route"
            className="absolute right-3 w-9 h-9 rounded-xl bg-trazy-accent disabled:opacity-30 flex items-center justify-center transition-all hover:bg-trazy-accentHover focus-ring"
          >
            {isParsing
              ? <div className="w-4 h-4 border-2 border-trazy-bg border-t-transparent rounded-full animate-spin" />
              : <ArrowRight className="w-5 h-5 text-trazy-bg" />
            }
          </button>
        </div>
      </div>

      <p id="agent-bar-hint" className="sr-only">
        Type your trip details or use voice. Google Places Autocomplete will suggest locations.
        Press Enter or click the arrow button to plan your route.
      </p>

      <div className="mt-6 flex flex-wrap gap-2 justify-center" role="list" aria-label="Example trips">
        {EXAMPLE_CHIPS.map((chip) => (
          <button
            key={chip.label}
            role="listitem"
            onClick={() => { setInput(chip.value); handleSearch(chip.value); }}
            disabled={isParsing}
            className="px-4 py-2 rounded-full text-xs font-medium bg-white/5 hover:bg-white/15 text-trazy-muted hover:text-white border border-white/10 hover:border-white/30 transition-all focus-ring disabled:opacity-40"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
