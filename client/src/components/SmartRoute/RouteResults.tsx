import React from 'react';
import { RouteOption } from '../../types/travel';
import { Clock, Banknote, Star, ArrowRight, MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RouteResultsProps {
  routes: RouteOption[];
  insight: string;
}

const RouteResults: React.FC<RouteResultsProps> = ({ routes, insight }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl flex gap-3 items-start">
        <div className="bg-brand-yellow p-1.5 rounded-lg text-brand-green shrink-0 mt-0.5">
          <Star size={16} fill="currentColor" />
        </div>
        <p className="text-sm font-bold text-brand-green leading-relaxed">{insight}</p>
      </div>

      <div className="grid gap-4">
        {routes.map((route, idx) => (
          <div 
            key={idx}
            className={cn(
              "glass p-6 rounded-3xl border-2 transition-all duration-300 card-hover",
              route.recommended ? "border-brand-green" : "border-white/20"
            )}
          >
            {route.recommended && (
              <span className="inline-block px-3 py-1 bg-brand-green text-brand-yellow text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                Trazy Recommended ✦
              </span>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black text-brand-green capitalize">{route.type} Route</h3>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="flex items-center gap-1 text-brand-dark/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    <Clock size={12} /> Time
                  </div>
                  <div className="font-black text-brand-dark">{route.totalTime}m</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-brand-dark/50 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                    <Banknote size={12} /> Cost
                  </div>
                  <div className="font-black text-brand-dark">₹{route.totalCost}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {route.segments.map((seg, sIdx) => (
                <div key={sIdx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-brand-green" />
                  </div>
                  <p className="text-sm font-semibold text-brand-dark/80">{seg.description}</p>
                </div>
              ))}
            </div>

            {route.switchPoint && (
              <div className="p-4 bg-brand-green/5 rounded-2xl border border-brand-green/10 flex gap-4 items-center">
                <div className="bg-brand-green p-2 rounded-xl text-brand-yellow shadow-lg">
                  <MapPin size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-0.5">Switch Point</div>
                  <div className="font-bold text-brand-dark leading-tight">{route.switchPoint}</div>
                  <div className="text-xs text-brand-dark/60 font-medium mt-1 italic">"{route.switchReason}"</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteResults;
