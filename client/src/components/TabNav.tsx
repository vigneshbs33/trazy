import React from 'react';
import { Route, Users } from 'lucide-react';
import { cn } from '../utils/cn';

interface TabNavProps {
  activeTab: 'route' | 'merge';
  setActiveTab: (tab: 'route' | 'merge') => void;
}

const TabNav: React.FC<TabNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex p-1 bg-brand-green/10 rounded-2xl gap-1 max-w-md mx-auto my-6">
      <button
        onClick={() => setActiveTab('route')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300",
          activeTab === 'route' 
            ? "bg-brand-green text-brand-yellow shadow-lg scale-100" 
            : "text-brand-green/70 hover:bg-white/50 scale-95"
        )}
      >
        <Route size={20} />
        <span>Smart Route</span>
      </button>
      <button
        onClick={() => setActiveTab('merge')}
        className={cn(
          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all duration-300",
          activeTab === 'merge' 
            ? "bg-brand-green text-brand-yellow shadow-lg scale-100" 
            : "text-brand-green/70 hover:bg-white/50 scale-95"
        )}
      >
        <Users size={20} />
        <span>Merge Point</span>
      </button>
    </div>
  );
};

export default TabNav;
