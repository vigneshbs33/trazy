import React from 'react';
import { MergePointResponse } from '../../types/travel';
import { MapPin, Info, Car, Timer, IndianRupee } from 'lucide-react';

interface MergeResultsProps {
  data: MergePointResponse;
}

const MergeResults: React.FC<MergeResultsProps> = ({ data }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass p-8 rounded-[2.5rem] border-brand-green border-4 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/5 rounded-full -mr-16 -mt-16" />
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="bg-brand-green p-4 rounded-3xl text-brand-yellow shadow-xl mb-4">
            <MapPin size={32} />
          </div>
          <div className="text-[10px] font-black text-brand-green uppercase tracking-[0.2em] mb-2">Optimal Merge Point</div>
          <h2 className="text-3xl font-black text-brand-dark mb-1">{data.mergePoint}</h2>
          <p className="text-brand-green font-bold text-sm">{data.mergePointArea}</p>
          
          <div className="mt-6 p-4 bg-brand-green/5 rounded-2xl flex gap-3 items-center text-left max-w-sm">
            <Info size={18} className="text-brand-green shrink-0" />
            <p className="text-xs font-semibold text-brand-dark/80 italic">"{data.mergeReason}"</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-brand-green uppercase tracking-widest px-2">Individual Paths to Merge Point</h3>
        {data.travelerRoutes.map((route, idx) => (
          <div key={idx} className="glass p-5 rounded-3xl flex items-center justify-between border-white/40 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-green text-brand-yellow flex items-center justify-center font-black text-sm">
                {route.name[0]}
              </div>
              <div>
                <div className="font-black text-brand-dark leading-none mb-1">{route.name}</div>
                <div className="text-[10px] font-bold text-brand-dark/40 uppercase tracking-wider">{route.from}</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-1.5 justify-end text-brand-green font-black text-sm">
                {route.mode.includes('Bus') || route.mode.includes('Metro') ? (
                  <span className="px-2 py-0.5 bg-brand-green/10 rounded-md text-[10px] tracking-tight">{route.mode}</span>
                ) : (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] tracking-tight">Personal Cab</span>
                )}
              </div>
              <div className="flex gap-3 justify-end mt-1 text-[10px] font-bold text-brand-dark/50">
                <span className="flex items-center gap-1"><Timer size={10} /> {route.duration}m</span>
                <span className="flex items-center gap-1"><IndianRupee size={10} /> ₹{route.cost}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-brand-dark text-white rounded-[2rem] shadow-xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 opacity-10">
          <Car size={100} />
        </div>
        <div className="relative z-10 flex gap-4 items-center">
          <div className="bg-white/10 p-3 rounded-2xl">
            <Car size={24} className="text-brand-yellow" />
          </div>
          <div>
            <div className="text-[10px] font-black text-brand-yellow uppercase tracking-widest mb-1">Final Shared Leg</div>
            <p className="text-sm font-bold leading-tight">{data.finalLeg.description}</p>
            <p className="text-[10px] text-white/50 font-medium mt-1">Estimated duration: {data.finalLeg.duration} mins</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-2 border-dashed border-brand-green/20 rounded-2xl bg-brand-green/[0.02]">
        <p className="text-center text-xs font-bold text-brand-green/70 leading-relaxed italic">{data.insight}</p>
      </div>
    </div>
  );
};

export default MergeResults;
