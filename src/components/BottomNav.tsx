import { Home, Search, Gift, Heart, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cartCount: number;
  wishlistCount: number;
}

export default function BottomNav({ activeTab, setActiveTab, cartCount, wishlistCount }: BottomNavProps) {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { 
      id: 'gifts' as ActiveTab, 
      label: 'Gifting', 
      icon: Gift
    },
    { id: 'account' as ActiveTab, label: 'Account', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#faf8f6] border-t border-[#eae5e2] h-16 flex justify-around items-center px-2 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none rounded-xl ${
              isActive 
                ? 'bg-[#f4ecea] text-[#690027] font-semibold px-4 py-1 animate-fade-in' 
                : 'text-stone-500 hover:text-[#690027] px-2 py-1'
            }`}
            id={`bottom-nav-${tab.id}`}
          >
            <div className="relative flex flex-col items-center justify-center">
              <IconComponent className={`w-[18px] h-[18px] transition-transform ${isActive ? 'scale-105 stroke-[2]' : 'stroke-[1.5]'}`} />
              <span className="text-[10px] mt-0.5 tracking-wide font-sans font-medium">
                {tab.label}
              </span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
