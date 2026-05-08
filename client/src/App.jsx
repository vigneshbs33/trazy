import React, { useState, useRef } from 'react';
import AgentBar from './components/AgentBar/AgentBar.jsx';
import ConfirmModal from './components/ConfirmModal/ConfirmModal.jsx';
import MapView from './components/MapView/MapView.jsx';
import SoloCards from './components/RouteCards/SoloCards.jsx';
import LiveSyncPanel from './components/LiveSyncPanel/LiveSyncPanel.jsx';
import AriaLiveRegion from './components/Shared/AriaLiveRegion.jsx';
import { planRoute } from './services/api.js';
import { useRouteCache } from './hooks/useRouteCache.js';

// State machine: LANDING → PARSING → CONFIRMING → SOLO_RESULTS | GROUP_RESULTS
function App() {
  const [phase, setPhase]           = useState('LANDING');
  const [rawInput, setRawInput]     = useState('');
  const [parsedIntent, setParsedIntent] = useState(null);
  const [routeData, setRouteData]   = useState(null);
  const [isParsing, setIsParsing]   = useState(false);
  const [error, setError]           = useState(null);
  const [statusMsg, setStatusMsg]   = useState('');
  const abortRef                    = useRef(null);
  const { getCachedRoute, setCachedRoute } = useRouteCache();

  const handleIntentParsed = async (text) => {
    if (!text.trim() || isParsing) return;
    setRawInput(text);
    setError(null);
    setIsParsing(true);
    setPhase('PARSING');
    setStatusMsg('Calculating route...');

    // Client-side cache check — skip API entirely on hit
    const cached = getCachedRoute(text);
    if (cached) {
      setParsedIntent(cached.intent);
      setRouteData(cached);
      setPhase('CONFIRMING');
      setIsParsing(false);
      setStatusMsg('Route loaded from cache.');
      return;
    }

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await planRoute(text, controller.signal);
      setParsedIntent(data.intent);
      setRouteData(data);
      setCachedRoute(text, data);
      setPhase('CONFIRMING');
      setStatusMsg('Route calculated. Please confirm.');
    } catch (err) {
      if (err.name === 'AbortError') return; // user navigated away
      setError(err.message || 'Failed to plan route. Please try again.');
      setPhase('LANDING');
      setStatusMsg('Route planning failed.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirm = () => {
    setPhase(parsedIntent?.mode === 'solo' ? 'SOLO_RESULTS' : 'GROUP_RESULTS');
    setStatusMsg(`Map loaded. Showing ${parsedIntent?.mode === 'solo' ? 'route options' : 'group sync schedule'}.`);
  };

  const handleEdit = () => {
    setPhase('LANDING');
    setStatusMsg('');
  };

  const isResults = phase.includes('RESULTS');

  return (
    <div className="h-screen w-full bg-trazy-bg text-trazy-text overflow-hidden flex flex-col font-sans relative">

      {/* Global ARIA live region — always mounted */}
      <AriaLiveRegion message={statusMsg} />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-[-15%] left-[-10%] w-[45%] h-[45%] rounded-full bg-trazy-accent/8 blur-[130px]" />
      <div className="pointer-events-none absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-trazy-blue/8 blur-[160px]" />
      <div className="pointer-events-none absolute top-[45%] left-[55%] w-[35%] h-[35%] rounded-full bg-trazy-purple/8 blur-[110px]" />

      {/* Results header */}
      {isResults && (
        <header className="h-14 border-b border-white/5 flex items-center justify-between px-8 bg-trazy-bg/50 backdrop-blur-xl z-20 shrink-0">
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 group focus-ring rounded-lg px-2 py-1"
            aria-label="Return to home screen"
          >
            <span className="text-xl font-display font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 group-hover:from-trazy-accent group-hover:to-trazy-blue transition-all duration-300">
              TRAZY
            </span>
            <span className="text-[10px] bg-trazy-accent text-trazy-bg px-2 py-0.5 rounded-sm font-bold uppercase tracking-widest">
              BETA
            </span>
          </button>
          <button
            onClick={handleEdit}
            className="text-sm font-semibold text-trazy-muted hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-colors focus-ring"
          >
            New Trip
          </button>
        </header>
      )}

      {/* Main */}
      <main className="flex-1 relative flex overflow-hidden">

        {/* LANDING / PARSING / CONFIRMING — centered layout */}
        {(phase === 'LANDING' || phase === 'PARSING' || phase === 'CONFIRMING') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10">
            <div className="mb-10 text-center animate-fade-in-up">
              <h1 className="text-7xl sm:text-9xl font-display font-extrabold tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 drop-shadow-2xl">
                TRAZY
              </h1>
              <p className="text-lg sm:text-xl text-trazy-accent font-medium tracking-wide">
                Your City&apos;s Transport Brain
              </p>
            </div>

            {/* Inline error banner */}
            {error && (
              <div
                role="alert"
                className="mb-6 w-full max-w-2xl rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 text-sm text-red-400"
              >
                ⚠ {error}
              </div>
            )}

            <AgentBar onIntentParsed={handleIntentParsed} isParsing={isParsing} />
          </div>
        )}

        {/* Confirm modal */}
        {phase === 'CONFIRMING' && (
          <ConfirmModal intent={parsedIntent} onConfirm={handleConfirm} onEdit={handleEdit} />
        )}

        {/* Split-screen results */}
        {isResults && (
          <div className="flex w-full h-full">
            {/* Map — 60% */}
            <div className="w-[60%] h-full relative">
              <MapView mode={parsedIntent?.mode} routeData={routeData} intent={parsedIntent} />
            </div>
            {/* Sidebar — 40% */}
            <div className="w-[40%] h-full border-l border-white/10 z-10 shadow-[-12px_0_40px_rgba(0,0,0,0.6)] overflow-hidden">
              {phase === 'SOLO_RESULTS' && (
                <SoloCards routes={routeData?.routes} globalInsight={routeData?.globalInsight} />
              )}
              {phase === 'GROUP_RESULTS' && (
                <LiveSyncPanel schedule={routeData?.schedule} />
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
