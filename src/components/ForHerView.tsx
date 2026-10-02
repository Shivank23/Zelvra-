import React from 'react';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  Copy, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  Award, 
  Instagram, 
  Facebook, 
  Mail, 
  Globe 
} from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ForHerViewProps {
  filteredHomeProducts: Product[];
  wishlist: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: any) => void;
  selectedPolish: string;
  setSelectedPolish: (pol: any) => void;
  selectedRecipient: string;
  setSelectedRecipient: (rec: any) => void;
  selectedOccasion: string;
  setSelectedOccasion: (occ: any) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  isSortOpen: boolean;
  setIsSortOpen: (open: boolean) => void;
  sortBy: string;
  setSortBy: (sort: any) => void;
  copiedCodeBanner: boolean;
  copyPromoToClipboard: (code: string, isBanner: boolean) => void;
  setSelectedProduct: (prod: Product | null) => void;
  handleToggleWishlist: (prod: Product) => void;
  handleAddToCartDirect: (prod: Product) => void;
  showToast: (msg: string) => void;
}

export default function ForHerView({
  filteredHomeProducts,
  wishlist,
  selectedCategory,
  setSelectedCategory,
  selectedPolish,
  setSelectedPolish,
  selectedRecipient,
  setSelectedRecipient,
  selectedOccasion,
  setSelectedOccasion,
  isFilterOpen,
  setIsFilterOpen,
  isSortOpen,
  setIsSortOpen,
  sortBy,
  setSortBy,
  copiedCodeBanner,
  copyPromoToClipboard,
  setSelectedProduct,
  handleToggleWishlist,
  handleAddToCartDirect,
  showToast,
}: ForHerViewProps) {
  return (
    <main className="flex flex-col font-sans animate-fade-in">
      {/* Dynamic Editorial Hero Banner Section */}
      <section className="relative w-full aspect-[4/5.4] sm:aspect-[21/9] overflow-hidden flex items-end">
        <img 
          alt="Model wearing elegant silver rings" 
          className="absolute inset-0 w-full h-full object-cover select-none brightness-[0.88]" 
          src="https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=1600&auto=format&fit=crop&q=80&sig=rings-for-her-hero"
          referrerPolicy="no-referrer"
        />
        {/* Soft luxury gradient mask overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1b1c1b]/70 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 pb-12 sm:pb-20 text-left">
          <div className="max-w-md space-y-2">
            <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.3em] uppercase text-stone-300">
              NEW COLLECTION
            </span>
            <h1 className="font-serif text-3.5xl sm:text-6xl font-normal leading-tight tracking-wide text-white">
              Silver Rings
            </h1>
            <p className="font-sans text-xs sm:text-sm text-stone-200/90 max-w-sm leading-relaxed font-light">
              Elegance in every curve. Discover our curated collection of 925 Sterling Silver rings designed for the modern silhouette.
            </p>
          </div>
        </div>
      </section>

      {/* SHOP BY STYLE section */}
      <section className="py-10 bg-[#fbf9f7] select-none text-center">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-serif text-[17px] tracking-[0.25em] uppercase font-bold text-[#690027] mb-6">
            SHOP BY STYLE
          </h2>
          
          <div className="flex justify-center gap-5 sm:gap-10 py-1 overflow-x-auto hide-scrollbar">
            {[
              { 
                id: 'everyday', 
                label: 'EVERYDAY', 
                image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=300&auto=format&fit=crop&q=80',
                action: () => {
                  setSelectedCategory('rings');
                  setSelectedOccasion('all');
                  setSelectedRecipient('For Her');
                  showToast("Filtered style: Everyday Rings");
                }
              },
              { 
                id: 'office', 
                label: 'OFFICE', 
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&auto=format&fit=crop&q=80&sig=office-style',
                action: () => {
                  setSelectedCategory('rings');
                  setSelectedOccasion('Others');
                  setSelectedRecipient('For Her');
                  showToast("Filtered style: Professional Office Wear");
                }
              },
              { 
                id: 'party', 
                label: 'PARTY', 
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&auto=format&fit=crop&q=80',
                action: () => {
                  setSelectedCategory('rings');
                  setSelectedOccasion('Birthday');
                  setSelectedRecipient('For Her');
                  showToast("Filtered style: Party & Celebration Rings");
                }
              },
              { 
                id: 'wedding', 
                label: 'WEDDING', 
                image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop&q=80',
                action: () => {
                  setSelectedCategory('rings');
                  setSelectedOccasion('Anniversary');
                  setSelectedRecipient('For Her');
                  showToast("Filtered style: Classic Anniversary Rings");
                }
              }
            ].map((styleItem) => {
              return (
                <button
                  key={styleItem.id}
                  onClick={styleItem.action}
                  className="flex flex-col items-center gap-3 flex-shrink-0 group cursor-pointer focus:outline-none"
                  id={`style-select-${styleItem.id}`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 overflow-hidden border border-stone-200 transition-all duration-300 group-hover:border-[#690027] group-hover:scale-105 bg-white flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-stone-50 overflow-hidden">
                      <img 
                        alt={styleItem.label} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform group-hover:scale-106 duration-500" 
                        src={styleItem.image} 
                      />
                    </div>
                  </div>
                  <span className="font-sans text-[10px] tracking-[0.2em] font-bold text-stone-600 group-hover:text-[#690027] transition-colors">
                    {styleItem.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FILTER | SORT BY Control Bar */}
      <section className="w-full bg-[#fbf9f7] border-y border-stone-200/60 relative z-30">
        <div className="max-w-6xl mx-auto flex divide-x divide-stone-200/60 text-xs font-bold tracking-[0.15em] text-stone-700">
          <button 
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              setIsSortOpen(false);
            }} 
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 hover:text-[#690027] transition-colors cursor-pointer select-none ${isFilterOpen ? 'text-[#690027] bg-white' : ''}`}
            id="filter-toggle-btn"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>FILTER</span>
          </button>
          
          <button 
            onClick={() => {
              setIsSortOpen(!isSortOpen);
              setIsFilterOpen(false);
            }} 
            className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 hover:text-[#690027] transition-colors cursor-pointer select-none ${isSortOpen ? 'text-[#690027] bg-white' : ''}`}
            id="sort-toggle-btn"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>SORT BY</span>
          </button>
        </div>

        {/* Expandable Interactive Filter Area */}
        {isFilterOpen && (
          <div className="bg-white border-b border-stone-200/80 p-5 space-y-4 animate-slide-down">
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 text-left font-sans">
              {/* Category selection */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Category</span>
                <div className="flex flex-wrap gap-1.5">
                  {['all', 'rings', 'earrings', 'necklaces', 'bracelets', 'anklets'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat as any)}
                      className={`px-3 py-1 text-[11px] font-bold tracking-wide uppercase border transition-all cursor-pointer ${
                        selectedCategory === cat 
                          ? 'bg-[#690027] border-[#690027] text-white shadow-xs' 
                          : 'bg-[#fbf9f7] border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metal Finish Swatches */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Trim Polish</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'Silver', label: 'Silver' },
                    { id: 'Rose Gold', label: 'Rose' },
                    { id: 'Gold Plated', label: 'Gold' }
                  ].map((pol) => (
                    <button
                      key={pol.id}
                      onClick={() => setSelectedPolish(pol.id as any)}
                      className={`px-3 py-1 text-[11px] font-bold tracking-wide border transition-all cursor-pointer ${
                        selectedPolish === pol.id 
                          ? 'bg-[#690027] border-[#690027] text-white shadow-xs' 
                          : 'bg-[#fbf9f7] border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {pol.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Curated Recipients */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Patron curation</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Everyone' },
                    { id: 'For Her', label: 'For Her' },
                    { id: 'For Him', label: 'For Him' }
                  ].map((rec) => (
                    <button
                      key={rec.id}
                      onClick={() => setSelectedRecipient(rec.id as any)}
                      className={`px-3 py-1 text-[11px] font-bold tracking-wide border transition-all cursor-pointer ${
                        selectedRecipient === rec.id 
                          ? 'bg-[#690027] border-[#690027] text-white shadow-xs' 
                          : 'bg-[#fbf9f7] border-stone-200 text-stone-600 hover:border-stone-400'
                      }`}
                    >
                      {rec.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-4xl mx-auto pt-3 border-t border-stone-100 flex justify-between items-center text-[11px] font-sans">
              <span className="text-stone-500">Active filtration: {filteredHomeProducts.length} pieces of luxury matching</span>
              {(selectedCategory !== 'all' || selectedPolish !== 'all' || selectedRecipient !== 'all' || selectedOccasion !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedPolish('all');
                    setSelectedRecipient('all');
                    setSelectedOccasion('all');
                    showToast("Cleared active jewelry curators");
                  }}
                  className="text-[#690027] hover:underline uppercase font-bold tracking-wide cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Expandable Sort Selection Dropdown */}
        {isSortOpen && (
          <div className="bg-white border-b border-stone-200/80 p-3 animate-slide-down">
            <div className="max-w-xs mx-auto flex flex-col gap-1 text-center font-sans text-xs">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">Sort catalog</span>
              {[
                { id: 'default', label: 'Default / Curator Choice' },
                { id: 'bestsellers', label: 'Bestselling Pieces First' },
                { id: 'newest', label: 'Newly Released First' },
                { id: 'price-low', label: 'Price: Low to High' },
                { id: 'price-high', label: 'Price: High to Low' }
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setSortBy(option.id as any);
                    setIsSortOpen(false);
                    showToast(`Sorted catalog: ${option.label}`);
                  }}
                  className={`py-2 px-4 transition-colors rounded-xs cursor-pointer hover:bg-stone-50 text-[11px] font-bold ${
                    sortBy === option.id ? 'text-[#690027] bg-[#fbf9f7]' : 'text-stone-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Catalog grid view with 2-columns (matching mockup screen exactly) */}
      <section className="py-8 px-4 max-w-6xl mx-auto w-full">
        {filteredHomeProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-stone-100 rounded-xl max-w-md mx-auto">
            <span className="font-sans text-xs text-stone-500">
              No matching jewelry pieces found. Clear filters to browse!
            </span>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPolish('all');
                setSelectedRecipient('all');
                setSelectedOccasion('all');
              }}
              className="mt-3 bg-[#690027] hover:bg-[#8a1b3c] text-white py-2 px-5 text-xs font-sans font-bold uppercase tracking-wider cursor-pointer"
            >
              Show All 925 Jewelry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3.5 gap-y-6 sm:gap-x-6 sm:gap-y-10">
            {filteredHomeProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(prod) => setSelectedProduct(prod)}
                onToggleWishlist={handleToggleWishlist}
                isWishlisted={wishlist.some(item => item.id === product.id)}
                onAddToCartDirect={handleAddToCartDirect}
              />
            ))}
          </div>
        )}

        {/* DISCOVER MORE central action button */}
        <div className="flex justify-center mt-12 mb-6">
          <button 
            onClick={() => {
              setSelectedCategory('all');
              setSelectedPolish('all');
              setSelectedRecipient('all');
              setSelectedOccasion('all');
              showToast("Loading full ZELVRA luxury catalog");
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            className="border border-[#690027] text-[#690027] hover:bg-[#690027]/4 font-sans text-xs font-bold uppercase tracking-[0.25em] px-10 py-3.5 transition-all outline-hidden cursor-pointer"
            id="discover-more-scroll-btn"
          >
            DISCOVER MORE
          </button>
        </div>
      </section>

      {/* Promo offer card */}
      <section className="bg-[#7e5446] text-white px-5 py-12 text-center relative overflow-hidden select-none">
        {/* Ambient Background Circles */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 border border-white rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 border border-white rounded-full -ml-24 -mb-24" />
        </div>

        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <h3 className="font-serif text-[18px] sm:text-[22px] tracking-[0.2em] uppercase font-bold text-[#ffdbcf]">
            The Silver Affair Collection
          </h3>
          <p className="font-serif text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            FLAT 25% OFF
          </p>
          <p className="text-xs text-white/90 max-w-xs mx-auto leading-relaxed">
            Unlock handcrafted 925 jewelry pieces on special 0% making charges with our exclusive promo code:
          </p>
          
          <div className="inline-flex items-center gap-1.5 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <button
              type="button"
              onClick={() => copyPromoToClipboard('SILVER25', true)}
              className="bg-white text-[#7e5446] font-sans font-extrabold text-xs px-6 py-3 uppercase tracking-widest hover:bg-[#ffdbcf] transition-all flex items-center gap-2 cursor-pointer shadow-lg rounded-xl"
              id="promo-banner-copy-btn"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>USE CODE: {copiedCodeBanner ? 'COPIED!' : 'SILVER25'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Three Vertical/Horizontal clean structured trust banners */}
      <section className="py-14 bg-white border-y border-stone-100 select-none">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-1 md:grid-cols-3 gap-8 py-2">
          {[
            { 
              icon: ShieldCheck, 
              title: 'Lifetime Plating', 
              desc: 'We offer a lifetime replating service for all our 925 silver jewelry pieces.' 
            },
            { 
              icon: RefreshCw, 
              title: 'Global Shipping', 
              desc: 'Pristine packaging and secure door-step delivery to over 150 countries.' 
            },
            { 
              icon: Award, 
              title: 'Authenticity Certificate', 
              desc: 'Every purchase comes with a BIS Hallmark & Authenticity Certificate.' 
            }
          ].map((trustItem, index) => {
            const IconComp = trustItem.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center space-y-3.5 p-5 border border-stone-50 rounded-xl shadow-xs bg-[#fbf9f7]/40">
                <div className="w-12 h-12 rounded-full bg-[#690027]/6 flex items-center justify-center text-[#690027]">
                  <IconComp className="w-6 h-6 stroke-[1.25]" />
                </div>
                <h3 className="font-serif text-[15px] font-bold text-stone-900">{trustItem.title}</h3>
                <p className="text-xs text-stone-500 font-sans tracking-wide leading-relaxed">{trustItem.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* BRIGHT LUXURY FOOTER */}
      <footer className="bg-stone-50 py-16 px-5 border-t border-stone-200/50">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h2 className="font-serif text-[26px] tracking-[0.25em] font-normal text-[#690027] select-none">
            ZELVRA
          </h2>
          <p className="text-stone-500 font-sans text-xs sm:text-[13px] leading-relaxed max-w-md mx-auto">
            Redefining luxury through minimalist aesthetics and lustrous craftsmanship. Join our newsletter for exclusive collections and private viewings.
          </p>
          
          {/* Sleek newsletter signup field */}
          <div className="flex max-w-sm mx-auto border border-stone-300 rounded-sm overflow-hidden bg-white mt-4">
            <input 
              type="email" 
              placeholder="Enter your email address"
              className="px-4 py-2 text-xs font-sans w-full focus:outline-none placeholder-stone-400"
            />
            <button 
              onClick={() => showToast("Subscribed! Thank you for joining ZELVRA private circle.")}
              className="bg-[#690027] hover:bg-[#8a1b3c] text-white font-sans text-[10px] tracking-widest font-black px-4 uppercase transition-colors shrink-0 cursor-pointer"
            >
              SUBSCRIBE
            </button>
          </div>

          {/* Minimal social icons row */}
          <div className="flex justify-center gap-4 pt-6 text-stone-400 select-none">
            <button className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:text-[#690027] hover:border-[#690027] transition-all cursor-pointer">
              <Instagram className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:text-[#690027] hover:border-[#690027] transition-all cursor-pointer">
              <Facebook className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:text-[#690027] hover:border-[#690027] transition-all cursor-pointer">
              <Mail className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center hover:text-[#690027] hover:border-[#690027] transition-all cursor-pointer">
              <Globe className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          <div className="text-[10px] text-stone-400 font-mono pt-4">
            &copy; {new Date().getFullYear()} ZELVRA FINE SILVER JEWELRY. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </main>
  );
}
