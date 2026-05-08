import React, { useState } from 'react';
import { UserPlus, Trash2, MapPin, Navigation, Compass } from 'lucide-react';
import { Traveler } from '../../types/travel';

interface MergeFormProps {
  onSearch: (destination: string, travelers: Traveler[]) => void;
  isLoading: boolean;
}

const MergeForm: React.FC<MergeFormProps> = ({ onSearch, isLoading }) => {
  const [destination, setDestination] = useState('');
  const [travelers, setTravelers] = useState<Traveler[]>([
    { name: '', location: '', hasCar: false }
  ]);

  const addTraveler = () => {
    setTravelers([...travelers, { name: '', location: '', hasCar: false }]);
  };

  const removeTraveler = (index: number) => {
    setTravelers(travelers.filter((_, i) => i !== index));
  };

  const updateTraveler = (index: number, updates: Partial<Traveler>) => {
    const newTravelers = [...travelers];
    newTravelers[index] = { ...newTravelers[index], ...updates };
    setTravelers(newTravelers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destination && travelers.every(t => t.name && t.location)) {
      onSearch(destination, travelers);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass p-6 rounded-3xl">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-green/50">
          <Navigation size={20} />
        </div>
        <input
          type="text"
          placeholder="Destination (e.g., MG Road Metro)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/50 border border-brand-green/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green/20 font-bold placeholder:text-brand-dark/30 shadow-inner"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-brand-green uppercase tracking-widest flex items-center gap-2">
            <UserPlus size={16} /> Travelers
          </h3>
          <button 
            type="button" 
            onClick={addTraveler}
            className="text-xs font-bold text-brand-green bg-brand-green/5 px-3 py-1.5 rounded-lg hover:bg-brand-green/10 transition-colors"
          >
            + Add Another
          </button>
        </div>

        {travelers.map((traveler, index) => (
          <div key={index} className="p-4 bg-white/30 rounded-2xl border border-brand-green/5 space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Name"
                value={traveler.name}
                onChange={(e) => updateTraveler(index, { name: e.target.value })}
                className="w-1/3 px-4 py-2.5 bg-white/50 border border-brand-green/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green/20 text-sm font-semibold"
              />
              <input
                type="text"
                placeholder="Starting Location"
                value={traveler.location}
                onChange={(e) => updateTraveler(index, { location: e.target.value })}
                className="flex-1 px-4 py-2.5 bg-white/50 border border-brand-green/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green/20 text-sm font-semibold"
              />
              {travelers.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeTraveler(index)}
                  className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
            
            <label className="flex items-center gap-3 px-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={traveler.hasCar}
                onChange={(e) => updateTraveler(index, { hasCar: e.target.checked })}
                className="w-5 h-5 rounded-md border-brand-green/20 text-brand-green focus:ring-brand-green/30"
              />
              <span className="text-xs font-bold text-brand-dark/70 group-hover:text-brand-green transition-colors">Has a Car / Driving</span>
            </label>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading || !destination || travelers.some(t => !t.name || !t.location)}
        className="w-full py-4 bg-brand-green text-brand-yellow rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-brand-green/90 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-brand-yellow/30 border-t-brand-yellow rounded-full animate-spin" />
        ) : (
          <>
            <Compass size={20} />
            <span>Find Merge Point</span>
          </>
        )}
      </button>
    </form>
  );
};

export default MergeForm;
