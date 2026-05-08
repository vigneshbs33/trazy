import React from 'react';
import { MapPin, Zap } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 glass border-b sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-brand-green p-2 rounded-xl text-brand-yellow">
          <Zap size={24} fill="currentColor" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-green">Trazy</h1>
          <p className="text-xs text-brand-dark/60 font-medium uppercase tracking-widest">Bengaluru Tech Engine</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 text-brand-green/80 text-sm font-medium">
        <MapPin size={16} />
        <span>Namma Bengaluru</span>
      </div>
    </header>
  );
};

export default Header;
