import React, { useState } from 'react';
import { Search, MapPin, Navigation } from 'lucide-react';

interface RouteFormProps {
  onSearch: (from: string, to: string, priority: string) => void;
  isLoading: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({ onSearch, isLoading }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [priority, setPriority] = useState('balanced');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (from && to) {
      onSearch(from, to, priority);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 glass p-6 rounded-3xl">
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green/50">
            <MapPin size={20} />
          </div>
          <input
            type="text"
            placeholder="Starting Point (e.g., Koramangala)"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-brand-green/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 font-medium placeholder:text-brand-dark/30"
          />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green/50">
            <Navigation size={20} />
          </div>
          <input
            type="text"
            placeholder="Destination (e.g., Whitefield)"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-brand-green/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 font-medium placeholder:text-brand-dark/30"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-brand-green/5 rounded-xl">
        {['Fastest', 'Cheapest', 'Balanced'].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPriority(p.toLowerCase())}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-300 ${
              priority === p.toLowerCase() 
                ? "bg-brand-green text-brand-yellow shadow-md" 
                : "text-brand-green/60 hover:bg-white/50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading || !from || !to}
        className="w-full py-4 bg-brand-green text-brand-yellow rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-brand-green/90 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
        ) : (
          <>
            <Search size={20} className="group-hover:scale-110 transition-transform" />
            <span>Find Routes</span>
          </>
        )}
      </button>
    </form>
  );
};

export default RouteForm;
