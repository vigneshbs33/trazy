import { useState } from 'react';
import Header from './components/Header';
import TabNav from './components/TabNav';
import RouteForm from './components/SmartRoute/RouteForm';
import RouteResults from './components/SmartRoute/RouteResults';
import MergeForm from './components/MergePoint/MergeForm';
import MergeResults from './components/MergePoint/MergeResults';
import MapDisplay from './components/Map/MapDisplay';
import { travelApi } from './services/api';
import { RouteOption, MergePointResponse, Traveler } from './types/travel';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState<'route' | 'merge'>('route');
  const [loading, setLoading] = useState(false);
  
  // Route state
  const [routeResults, setRouteResults] = useState<{ routes: RouteOption[], insight: string } | null>(null);
  
  // Merge state
  const [mergeResult, setMergeResult] = useState<MergePointResponse | null>(null);

  const handleRouteSearch = async (from: string, to: string, priority: string) => {
    setLoading(true);
    try {
      const data = await travelApi.getRoutes(from, to, priority);
      setRouteResults(data);
    } catch (error) {
      console.error(error);
      alert('Failed to fetch routes. Please check backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleMergeSearch = async (destination: string, travelers: Traveler[]) => {
    setLoading(true);
    try {
      const data = await travelApi.getMergePoint(destination, travelers);
      setMergeResult(data);
    } catch (error) {
      console.error(error);
      alert('Failed to find merge point.');
    } finally {
      setLoading(false);
    }
  };

  const getMarkers = () => {
    if (activeTab === 'route' && routeResults) {
      const recommended = routeResults.routes.find(r => r.recommended) || routeResults.routes[0];
      const markers = recommended.segments
        .filter(s => s.lat && s.lng)
        .map(s => ({ lat: s.lat!, lng: s.lng!, label: s.mode }));
      
      if (recommended.switchPointCoords) {
        markers.push({ ...recommended.switchPointCoords, label: 'SWITCH' });
      }
      return markers;
    }
    
    if (activeTab === 'merge' && mergeResult) {
      return [
        { ...mergeResult.mergePointCoords, label: 'MERGE' }
      ];
    }
    
    return [];
  };

  const getCenter = () => {
    const markers = getMarkers();
    if (markers.length > 0) return markers[0];
    return { lat: 12.9716, lng: 77.5946 };
  };

  return (
    <div className="min-h-screen bg-brand-white pb-12">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-4">
        <TabNav activeTab={activeTab} setActiveTab={(tab) => {
          setActiveTab(tab);
          setRouteResults(null);
          setMergeResult(null);
        }} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column: Forms and Results */}
          <div className="lg:col-span-5 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'route' ? (
                <motion.div
                  key="route-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!routeResults ? (
                    <RouteForm onSearch={handleRouteSearch} isLoading={loading} />
                  ) : (
                    <div className="space-y-6">
                      <button 
                        onClick={() => setRouteResults(null)}
                        className="text-xs font-black text-brand-green bg-brand-green/10 px-4 py-2 rounded-xl hover:bg-brand-green/20 transition-all mb-2"
                      >
                        ← New Search
                      </button>
                      <RouteResults routes={routeResults.routes} insight={routeResults.insight} />
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="merge-mode"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {!mergeResult ? (
                    <MergeForm onSearch={handleMergeSearch} isLoading={loading} />
                  ) : (
                    <div className="space-y-6">
                      <button 
                        onClick={() => setMergeResult(null)}
                        className="text-xs font-black text-brand-green bg-brand-green/10 px-4 py-2 rounded-xl hover:bg-brand-green/20 transition-all mb-2"
                      >
                        ← New Search
                      </button>
                      <MergeResults data={mergeResult} />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Map */}
          <div className="lg:col-span-7 h-[500px] lg:h-[calc(100vh-200px)] sticky top-24">
            <MapDisplay center={getCenter()} markers={getMarkers()} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
