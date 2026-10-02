import React, { useState, useMemo } from 'react';
import { Heart, Sparkles, Gift, Flame, ThumbsUp, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface GiftsTabProps {
  wishlist: Product[];
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
  onExploreCollections: () => void;
  onSelectRecipient?: (recipient: 'For Her' | 'For Him') => void;
}

export default function GiftsTab({
  wishlist,
  allProducts,
  onSelectProduct,
  onToggleWishlist,
  onAddToCartDirect,
  onExploreCollections,
  onSelectRecipient,
}: GiftsTabProps) {
  // Gifting filter states inside Gifts Portal
  const [activeRecipient, setActiveRecipient] = useState<'all' | 'For Her' | 'For Him'>('all');
  const [activeOccasion, setActiveOccasion] = useState<'all' | 'Birthday' | 'Anniversary' | 'Others'>('all');
  const [activeSection, setActiveSection] = useState<'curator' | 'favorites'>('curator');

  // Filtered list based on curator buttons clicked
  const curatedProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesRecipient = activeRecipient === 'all' || (p.recipients && p.recipients.includes(activeRecipient));
      const matchesOccasion = activeOccasion === 'all' || (p.occasions && p.occasions.includes(activeOccasion));
      return matchesRecipient && matchesOccasion;
    });
  }, [allProducts, activeRecipient, activeOccasion]);

  // Handler to quickly set filter and scroll to products
  const handleSelectRecipient = (recipient: 'For Her' | 'For Him') => {
    if (recipient === 'For Her' && onSelectRecipient) {
      onSelectRecipient('For Her');
    } else {
      setActiveRecipient(recipient);
      setActiveSection('curator');
      setTimeout(() => {
        const el = document.getElementById('curated-picks-view');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleSelectOccasion = (occasion: 'Birthday' | 'Anniversary' | 'Others') => {
    setActiveOccasion(occasion);
    setActiveSection('curator');
    setTimeout(() => {
      const el = document.getElementById('curated-picks-view');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleClearFilters = () => {
    setActiveRecipient('all');
    setActiveOccasion('all');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28">
      
      {/* Tab Navigation header for Gifting Screen */}
      <div className="flex border-b border-outline-variant/40 mb-6 font-sans">
        <button
          onClick={() => setActiveSection('curator')}
          className={`flex-1 py-3 text-center text-xs uppercase font-extrabold tracking-widest relative cursor-pointer ${
            activeSection === 'curator' ? 'text-primary' : 'text-on-surface-variant/70 hover:text-primary'
          }`}
          id="tab-btn-curator"
        >
          <span className="flex items-center justify-center gap-2">
            <Gift className="w-3.5 h-3.5" /> Luxury Gift Curator
          </span>
          {activeSection === 'curator' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveSection('favorites')}
          className={`flex-1 py-3 text-center text-xs uppercase font-extrabold tracking-widest relative cursor-pointer ${
            activeSection === 'favorites' ? 'text-primary' : 'text-on-surface-variant/70 hover:text-primary'
          }`}
          id="tab-btn-favorites"
        >
          <span className="flex items-center justify-center gap-2">
            <Heart className="w-3.5 h-3.5" /> Saved Favorites ({wishlist.length})
          </span>
          {activeSection === 'favorites' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {activeSection === 'curator' ? (
        <div className="space-y-12">
          {/* Giving Gifting Hero Section (Exactly matching screenshot layout) */}
          <section className="relative overflow-hidden bg-[#1f1216] select-none h-[280px] md:h-[420px] flex items-center justify-center text-center">
            {/* Dark luxury silk wrap backdrop image */}
            <div className="absolute inset-0 z-0">
              <img 
                src="https://images.unsplash.com/photo-1513201099495-a63671dde5a6?w=1200&auto=format&fit=crop&q=80" 
                alt="Luxury gift silk background" 
                className="w-full h-full object-cover object-center opacity-30 mix-blend-overlay scale-102"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1f1216] via-transparent to-black/40" />
            </div>

            <div className="relative z-10 px-6 max-w-2xl mx-auto space-y-4">
              <h1 className="font-serif text-5xl md:text-7xl font-extrabold text-white tracking-[0.14em] uppercase drop-shadow-sm">
                GIVING
              </h1>
              <p className="text-base md:text-xl font-serif text-white/95 italic tracking-wide max-w-lg mx-auto">
                Curated for someone special, crafted to last a lifetime.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveRecipient('all');
                    setActiveOccasion('all');
                    const el = document.getElementById('curated-picks-view');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-[#690027] hover:bg-[#8a1b3c] active:scale-98 transition-all text-white text-[11px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] px-8 py-3.5 shadow-lg border border-white/10"
                  id="gift-explore-curator-btn"
                >
                  EXPLORE CURATOR'S PICKS
                </button>
              </div>
            </div>
          </section>

          {/* SHOP BY RECIPIENT */}
          <section className="bg-white p-2">
            <div className="flex justify-between items-baseline mb-6 border-b border-outline-variant/30 pb-2">
              <h2 className="font-serif text-2xl md:text-3.5xl font-extrabold text-[#340014] tracking-wide uppercase leading-none">
                SHOP BY<br className="sm:hidden" /> RECIPIENT
              </h2>
              <button
                onClick={() => {
                  setActiveRecipient('all');
                  const el = document.getElementById('curated-picks-view');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#340014] hover:underline"
              >
                VIEW ALL —
              </button>
            </div>

            {/* Recipients Grid matching exactly the visual cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* For Her */}
              <button
                onClick={() => handleSelectRecipient('For Her')}
                className="group flex flex-col items-center bg-[#fdfaf7] border border-outline-variant/50 p-4 rounded-xl hover:border-[#690027] hover:shadow-md transition-all duration-300 relative overflow-hidden text-center cursor-pointer"
                id="recipient-card-her"
              >
                <div className="w-full aspect-square max-w-[200px] rounded-full overflow-hidden border border-outline-variant/40 bg-[#f9ecdc] p-1 group-hover:scale-[1.03] transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350&h=350&fit=crop&q=80"
                    alt="Elegant woman posing with jewelry"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-serif text-sm font-bold text-[#340014] tracking-wider uppercase mt-4 group-hover:text-primary transition-colors">
                  FOR HER
                </h3>
              </button>

              {/* For Him */}
              <button
                onClick={() => handleSelectRecipient('For Him')}
                className="group flex flex-col items-center bg-[#fdfaf7] border border-outline-variant/50 p-4 rounded-xl hover:border-[#690027] hover:shadow-md transition-all duration-300 relative overflow-hidden text-center cursor-pointer"
                id="recipient-card-him"
              >
                <div className="w-full aspect-square max-w-[200px] rounded-full overflow-hidden border border-outline-variant/40 bg-[#e4e2df] p-1 group-hover:scale-[1.03] transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=350&h=350&fit=crop&q=80"
                    alt="Polished gentleman in fine attire"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-serif text-sm font-bold text-[#340014] tracking-wider uppercase mt-4 group-hover:text-primary transition-colors">
                  FOR HIM
                </h3>
              </button>
            </div>
          </section>

          {/* SHOP BY OCCASION */}
          <section className="bg-white p-2">
            <div className="flex justify-between items-baseline mb-6 border-b border-outline-variant/30 pb-2">
              <h2 className="font-serif text-2xl md:text-3.5xl font-extrabold text-[#340014] tracking-wide uppercase leading-none">
                SHOP BY<br className="sm:hidden" /> OCCASION
              </h2>
              <button
                onClick={() => {
                  setActiveOccasion('all');
                  const el = document.getElementById('curated-picks-view');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#340014] hover:underline"
              >
                VIEW ALL —
              </button>
            </div>

            {/* Occasions Horizontal Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-5">
              {/* Birthday */}
              <button
                onClick={() => handleSelectOccasion('Birthday')}
                className="group flex flex-col items-center bg-[#fcf9f5] border border-outline-variant/40 p-3 rounded-lg hover:border-amber-400 hover:shadow-sm transition-all text-center cursor-pointer"
                id="occasion-card-birthday"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-amber-50 border border-outline-variant/40 p-0.5 group-hover:scale-[1.03] transition-transform duration-300 max-w-[120px]">
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=200&h=200&fit=crop&q=80"
                    alt="Elegant handwrapped gift box"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-sans text-[10px] md:text-xs font-extrabold text-on-surface-variant tracking-wider uppercase mt-3">
                  BIRTHDAY
                </h3>
              </button>

              {/* Anniversary */}
              <button
                onClick={() => handleSelectOccasion('Anniversary')}
                className="group flex flex-col items-center bg-[#fcf9f5] border border-outline-variant/40 p-3 rounded-lg hover:border-[#8c2a4e] hover:shadow-sm transition-all text-center cursor-pointer"
                id="occasion-card-anniversary"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-rose-50 border border-outline-variant/40 p-0.5 group-hover:scale-[1.03] transition-transform duration-300 max-w-[120px]">
                  <img
                    src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=200&h=200&fit=crop&q=80"
                    alt="Hands joined in love"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-sans text-[10px] md:text-xs font-extrabold text-on-surface-variant tracking-wider uppercase mt-3">
                  ANNIVERSARY
                </h3>
              </button>

              {/* Other Celebrations */}
              <button
                onClick={() => handleSelectOccasion('Others')}
                className="group flex flex-col items-center bg-[#fcf9f5] border border-outline-variant/40 p-3 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all text-center cursor-pointer"
                id="occasion-card-others"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden bg-blue-50 border border-outline-variant/40 p-0.5 group-hover:scale-[1.03] transition-transform duration-300 max-w-[120px]">
                  <img
                    src="https://images.unsplash.com/photo-1512909006721-3d6018887383?w=200&h=200&fit=crop&q=80"
                    alt="Luxury silver gifts"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-sans text-[10px] md:text-xs font-extrabold text-on-surface-variant tracking-wider uppercase mt-3">
                  OTHERS
                </h3>
              </button>
            </div>
          </section>

          {/* CURATOR'S RESULTS SECTION */}
          <section id="curated-picks-view" className="bg-[#fcfaf7] border border-outline-variant/40 p-4 md:p-6 rounded-sm scroll-mt-20">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-6 pb-4 border-b border-outline-variant/30">
              <div>
                <span className="text-[10px] font-mono tracking-widest font-extrabold uppercase text-[#690027]">
                  ✨ Curator's Handpicked Jewelry Feed
                </span>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-on-surface">
                  {activeRecipient === 'all' && activeOccasion === 'all' && 'All Curations'}
                  {activeRecipient !== 'all' && `Picks ${activeRecipient}`}
                  {activeOccasion !== 'all' && ` for ${activeOccasion}`}
                </h3>
              </div>

              {/* Active Filters indicators */}
              {(activeRecipient !== 'all' || activeOccasion !== 'all') && (
                <button
                  onClick={handleClearFilters}
                  className="bg-[#690027] hover:bg-[#8a1b3c] text-white font-sans font-extrabold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer self-start sm:self-center"
                >
                  Clear Curator Filters ×
                </button>
              )}
            </div>

            {curatedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-sans text-xs text-on-surface-variant/85">
                  No jewelry matches this specific dual curation currently. Explore recipient other combinations!
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-3 bg-primary text-white font-sans font-bold text-xs uppercase tracking-widest px-4 py-2 rounded-sm"
                >
                  Reset Curator Guide
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {curatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelect={onSelectProduct}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlist.some(item => item.id === p.id)}
                    onAddToCartDirect={onAddToCartDirect}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        /* Favorites (Durable, elegant Wishlist) */
        <div>
          <div className="mb-8 text-center sm:text-left">
            <h2 className="font-serif text-3xl font-bold text-on-surface">Your Gifting Heart List</h2>
            <p className="text-xs text-on-surface-variant font-sans mt-1 tracking-wide uppercase">
              {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} Saved — Perfect for curated surprises
            </p>
            <div className="w-12 h-1 bg-primary mt-2 mx-auto sm:mx-0" />
          </div>

          {wishlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-outline-variant/40 p-8 rounded-sm shadow-xs max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4 animate-bounce">
                <Heart className="w-7 h-7 stroke-[1.25]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-on-surface">Your Heart List is Empty</h3>
              <p className="text-xs text-on-surface-variant/80 font-sans mt-2 max-w-xs leading-relaxed">
                Save masterfully polished silverware, custom-engraved tags and bands to plan your surprises perfectly.
              </p>
              <button
                onClick={() => {
                  setActiveSection('curator');
                }}
                className="mt-6 bg-primary hover:bg-[#8a1b3c] text-white py-3 px-6 text-xs font-sans font-bold uppercase tracking-widest flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md"
                id="wishlist-back-curator-btn"
              >
                <Sparkles className="w-4 h-4" /> Go to curator guide <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {wishlist.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={onSelectProduct}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={true}
                  onAddToCartDirect={onAddToCartDirect}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
