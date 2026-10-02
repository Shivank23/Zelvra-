import { Menu, Search, ShoppingBag, Heart } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  setActiveTab: (tab: ActiveTab) => void;
  openMenu: () => void;
  onSearchClick: () => void;
  productSource: 'supabase' | 'local';
}

export default function Header({ cartCount, wishlistCount, setActiveTab, openMenu, onSearchClick, productSource }: HeaderProps) {
  return (
    <div className="sticky top-0 z-50 w-full bg-[#fbf9f7]/95 backdrop-blur-md shadow-sm border-b border-[#faf3f4]">
      {/* Top Announcement Bar */}
      <div className="bg-[#690027] text-white py-1.5 px-4 text-center text-[10px] sm:text-[11px] font-sans tracking-[0.1em] sm:tracking-[0.2em] uppercase font-bold select-none flex items-center justify-center">
        <span>0% MAKING CHARGES ON GOLD &amp; SILVER JEWELLERY</span>
      </div>

      {/* Top App Bar */}
      <header className="w-full h-14 flex justify-between items-center px-4">
        <div className="flex items-center">
          <button 
            onClick={openMenu}
            className="p-1.5 -ml-1.5 hover:text-primary transition-colors cursor-pointer"
            aria-label="Toggle Side Menu"
            id="menu-toggle-btn"
          >
            <Menu className="w-5 h-5 text-stone-800 stroke-[1.5]" />
          </button>
        </div>

        {/* Elegant Centered ZELVRA Branding */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center cursor-pointer">
          <span 
            onClick={() => setActiveTab('home')} 
            className="font-serif text-[15px] tracking-[0.2em] font-bold text-[#690027] hover:text-[#8a1b3c] transition-colors select-none"
          >
            ZELVRA
          </span>
        </div>

        {/* Activity Buttons on Right */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onSearchClick}
            className="p-1 hover:text-[#690027] transition-colors cursor-pointer"
            aria-label="Search"
            id="search-icon-btn"
          >
            <Search className="w-5 h-5 text-stone-800 stroke-[1.5]" />
          </button>
          <button 
            onClick={() => setActiveTab('wishlist')}
            className="p-1 hover:text-[#690027] transition-colors cursor-pointer relative"
            aria-label="Go to Wishlist"
            id="header-wishlist-btn"
          >
            <Heart className="w-5 h-5 text-stone-800 stroke-[1.5]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#690027] text-white text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#fbf9f7]">
                {wishlistCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('cart')}
            className="p-1 hover:text-[#690027] transition-colors cursor-pointer relative"
            aria-label="Go to Cart"
            id="shopping-cart-btn"
          >
            <ShoppingBag className="w-5 h-5 text-stone-800 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#690027] text-white text-[8px] font-sans font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#fbf9f7]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>
    </div>
  );
}
