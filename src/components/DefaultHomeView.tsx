import React from 'react';
import { 
  SlidersHorizontal, 
  Gift, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  RefreshCw, 
  Clock, 
  Check, 
  Copy, 
  Instagram, 
  Facebook, 
  Mail, 
  Globe,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// @ts-ignore
import heroBannerImage from '../assets/images/zelvra_hero_banner_1781433770367.jpg';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface DefaultHomeViewProps {
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
  copiedCodeBanner: boolean;
  copyPromoToClipboard: (code: string, isBanner: boolean) => void;
  setSelectedProduct: (prod: Product | null) => void;
  handleToggleWishlist: (prod: Product) => void;
  handleAddToCartDirect: (prod: Product) => void;
  showToast: (msg: string) => void;
}

export default function DefaultHomeView({
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
  copiedCodeBanner,
  copyPromoToClipboard,
  setSelectedProduct,
  handleToggleWishlist,
  handleAddToCartDirect,
  showToast,
}: DefaultHomeViewProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const SLIDES = [
    {
      image: heroBannerImage,
      tagline: "EXQUISITE SILVER JEWELRY",
      titleStyled: (
        <h1 className="font-serif text-3xl sm:text-5.5xl font-medium tracking-wide text-white leading-[1.15]">
          The <span className="italic font-light text-[#ffd4db]">Silver</span> Affair
        </h1>
      ),
      desc: "Handcrafted with flawless reflection and pristine quality certified 925 purity designed to celebrate life's milestones.",
      btnText: "Shop The Collection",
      action: () => {
        setSelectedCategory('all');
        setSelectedPolish('all');
        const element = document.getElementById('bestsellers-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        showToast("Explore the full 925 Sterling Catalog");
      }
    },
    {
      image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1600&auto=format&fit=crop&q=80&sig=luxury-shimmer-ring",
      tagline: "FINE 925 STERLING SILVER",
      titleStyled: (
        <h1 className="font-serif text-3xl sm:text-5.5xl font-medium tracking-wide text-white leading-[1.15]">
          The <span className="italic font-light text-[#ffd4db]">Zelvra</span> Signature
        </h1>
      ),
      desc: "Experience curated haute couture 925 sterling silver classics handcrafted for the modern silhouette.",
      btnText: "Explore Best Sellers",
      action: () => {
        setSelectedCategory('all');
        setSelectedPolish('all');
        const element = document.getElementById('bestsellers-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        showToast("Showing Zelvra Best Sellers");
      }
    }
  ];

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  return (
    <main className="flex flex-col animate-fade-in">
      {/* Dynamic Editorial Hero Banner Carousel Section */}
      <section className="relative w-full aspect-[3/4.4] sm:aspect-[21/9] overflow-hidden bg-stone-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              alt="Editorial model with premium sterling silver jewelry" 
              className="absolute inset-0 w-full h-full object-cover select-none brightness-[0.82]" 
              src={SLIDES[currentSlide].image}
              referrerPolicy="no-referrer"
            />
            {/* Soft high-fashion gradient mask overlay with rich bottom shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />
            
            <div className="relative z-10 w-full h-full max-w-6xl mx-auto px-6 flex items-end pb-14 sm:pb-24 text-left">
              <div className="max-w-xl space-y-4 text-white">
                <span className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.4em] uppercase text-[#ffd4db]">
                  {SLIDES[currentSlide].tagline}
                </span>
                
                {SLIDES[currentSlide].titleStyled}
                
                <p className="font-sans text-xs sm:text-[13.5px] text-white/80 max-w-md leading-relaxed font-normal tracking-wide">
                  {SLIDES[currentSlide].desc}
                </p>
                
                <div className="pt-3">
                  <button 
                    onClick={SLIDES[currentSlide].action}
                    className="bg-[#690027] hover:bg-[#830a38] text-white font-sans text-xs font-semibold px-8 py-3.5 uppercase tracking-widest shadow-2xl transition-all hover:shadow-[#690027]/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                    id={`hero-shop-collection-btn-${currentSlide}`}
                  >
                    {SLIDES[currentSlide].btnText}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Side Controls (Explicit clicking, always visible and elegant) */}
        <button 
          onClick={handlePrevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-[#690027]/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/15 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={handleNextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-[#690027]/90 text-white flex items-center justify-center backdrop-blur-xs border border-white/15 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel Visual Page Indicator Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Interactive Category Circles */}
      <section className="py-8 bg-white border-b border-outline-variant/30 select-none">
        <div className="max-w-6xl mx-auto px-4">
          <p className="text-[10px] font-sans font-extrabold text-center tracking-[0.25em] text-on-surface-variant/75 uppercase mb-5">
            Browse Jewel Categories
          </p>
          
          <div className="overflow-x-auto hide-scrollbar flex justify-center gap-6 sm:gap-12 py-1">
            {[
              { 
                id: 'rings', 
                label: 'Rings', 
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&auto=format&fit=crop&q=80&sig=rings-cat' 
              },
              { 
                id: 'earrings', 
                label: 'Earrings', 
                image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=300&auto=format&fit=crop&q=80&sig=earrings-cat' 
              },
              { 
                id: 'necklaces', 
                label: 'Necklaces', 
                image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&auto=format&fit=crop&q=80&sig=necklaces-cat' 
              },
              { 
                id: 'bracelets', 
                label: 'Bracelets', 
                image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=300&auto=format&fit=crop&q=80&sig=bracelets-cat' 
              },
              { 
                id: 'anklets', 
                label: 'Anklets', 
                image: 'https://images.unsplash.com/photo-1543294001-f7cbfe92237e?w=300&auto=format&fit=crop&q=80&sig=anklets-cat' 
              },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id as any);
                    const element = document.getElementById('bestsellers-section');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer focus:outline-none"
                  id={`category-circle-${cat.id}`}
                >
                  <div className={`w-20 h-20 rounded-full border-2 p-0.5 overflow-hidden transition-all duration-300 ${
                    isSelected 
                      ? 'border-[#690027] ring-4 ring-primary/10 scale-105' 
                      : 'border-outline-variant/60 group-hover:border-on-surface-variant group-hover:scale-102'
                  }`}>
                    <div className="w-full h-full rounded-full bg-surface-container overflow-hidden">
                      <img 
                        alt={cat.label} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform group-hover:scale-106 duration-300" 
                        src={cat.image} 
                      />
                    </div>
                  </div>
                  <span className={`font-sans text-[11.5px] uppercase tracking-widest font-extrabold ${isSelected ? 'text-[#690027]' : 'text-on-surface'}`}>
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Genuine Trust Badges bar */}
      <section className="bg-surface-container-low py-7 border-b border-outline-variant/20 select-none">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 max-w-6xl mx-auto">
          {[
            { icon: ShieldCheck, title: '925 Fine Silver', desc: 'Sourced Authenticity' },
            { icon: Award, title: '6 Month Warranty', desc: 'Secure Protection Plans' },
            { icon: RefreshCw, title: 'Lifetime Plating', desc: 'Durable Mirror Coating' },
            { icon: Clock, title: 'Easy 30-Day Returns', desc: '100% Insured Shipping' }
          ].map((badge, idx) => {
            const IconComp = badge.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center space-y-1 p-2">
                <IconComp className="text-[#690027] w-6.5 h-6.5 stroke-[1.5]" />
                <h3 className="font-serif text-[14px] font-bold text-on-surface">{badge.title}</h3>
                <p className="text-[10.5px] text-on-surface-variant/80 font-sans tracking-wide leading-none">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ZELVRA'S Dynamic Catalog Grid */}
      <section id="bestsellers-section" className="mt-14 px-4 max-w-6xl mx-auto w-full scroll-mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div>
            <h2 className="font-serif text-3.5xl font-extrabold text-on-surface text-center md:text-left leading-tight">
              Zelvra's Collection
            </h2>
            <div className="w-16 h-1 mt-2.5 bg-[#690027] mx-auto md:mx-0" />
          </div>

          {/* Filtering Controls */}
          <div className="flex flex-wrap justify-center items-center gap-3 w-full md:w-auto">
            {/* Active Category pill filter */}
            <div className="flex bg-surface-container p-1 rounded-sm border border-outline-variant/50 max-w-full overflow-x-auto hide-scrollbar">
              {['all', 'rings', 'earrings', 'necklaces', 'bracelets', 'anklets'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat as any);
                  }}
                  className={`text-[10px] font-sans font-extrabold uppercase tracking-widest px-3 py-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#690027] text-white shadow-xs'
                      : 'text-on-surface-variant/80 hover:text-primary'
                  }`}
                  id={`tab-pill-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Reset viewing trigger button */}
            {(selectedCategory !== 'all' || selectedPolish !== 'all' || selectedRecipient !== 'all' || selectedOccasion !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPolish('all');
                  setSelectedRecipient('all');
                  setSelectedOccasion('all');
                  showToast('Cleared all product filters.');
                }}
                className="text-[10px] uppercase font-bold text-[#690027] tracking-widest hover:underline px-2 flex items-center gap-1 cursor-pointer"
              >
                Clear Filters ({filteredHomeProducts.length} items)
              </button>
            )}
          </div>
        </div>

        {/* Curation Filters in Feed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 border border-outline-variant/35 rounded-xs shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Polish Segment */}
          <div className="flex flex-col gap-2">
            <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider font-sans text-[10px] text-on-surface-variant/90">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#690027]" /> Metal Trim Tone
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Polishes' },
                { id: 'Silver', label: 'Silver' },
                { id: 'Rose Gold', label: 'Rose Gold' },
                { id: 'Gold Plated', label: 'Gold Plated' }
              ].map((pol) => {
                const isSelected = selectedPolish === pol.id;
                return (
                  <button
                    key={pol.id}
                    type="button"
                    onClick={() => setSelectedPolish(pol.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-bold font-sans border transition-all cursor-pointer rounded-xs ${
                      isSelected
                        ? 'bg-[#690027] border-[#690027] text-white shadow-xs'
                        : 'bg-[#fbf9f7] hover:border-[#690027] text-on-surface-variant/80 border-outline-variant/60'
                    }`}
                    id={`polish-tone-filter-${pol.id.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {pol.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recipient Segment */}
          <div className="flex flex-col gap-2">
            <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider font-sans text-[10px] text-on-surface-variant/90">
              <Gift className="w-3.5 h-3.5 text-[#690027]" /> Recipient Curation
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Recipients' },
                { id: 'For Her', label: 'For Her' },
                { id: 'For Him', label: 'For Him' }
              ].map((rec) => {
                const isSelected = selectedRecipient === rec.id;
                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => setSelectedRecipient(rec.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-bold font-sans border transition-all cursor-pointer rounded-xs ${
                      isSelected
                        ? 'bg-[#690027] border-[#690027] text-white shadow-xs'
                        : 'bg-[#fbf9f7] hover:border-[#690027] text-on-surface-variant/80 border-outline-variant/60'
                    }`}
                    id={`recipient-filter-${rec.id.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {rec.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Occasion Segment */}
          <div className="flex flex-col gap-2">
            <span className="font-bold flex items-center gap-1.5 uppercase tracking-wider font-sans text-[10px] text-on-surface-variant/90">
              <Sparkles className="w-3.5 h-3.5 text-[#690027]" /> Curated Occasions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Occasions' },
                { id: 'Birthday', label: 'Birthday' },
                { id: 'Anniversary', label: 'Anniversary' },
                { id: 'Others', label: 'Others' }
              ].map((occ) => {
                const isSelected = selectedOccasion === occ.id;
                return (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setSelectedOccasion(occ.id as any)}
                    className={`px-2.5 py-1 text-[11px] font-bold font-sans border transition-all cursor-pointer rounded-xs ${
                      isSelected
                        ? 'bg-[#8c2a4e] border-[#8c2a4e] text-white shadow-xs'
                        : 'bg-[#fbf9f7] hover:border-[#690027] text-on-surface-variant/80 border-outline-variant/60'
                    }`}
                    id={`occasion-filter-${occ.id.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    {occ.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Dynamic Card Display */}
        {filteredHomeProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-outline-variant/30 rounded-xs">
            <span className="font-sans text-xs text-on-surface-variant/80">
              No matching jewelry pieces found. Expand filters to view others!
            </span>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedPolish('all');
                setSelectedRecipient('all');
                setSelectedOccasion('all');
              }}
              className="mt-3 bg-[#690027] hover:bg-[#8a1b3c] text-white py-2 px-5 text-xs font-sans font-bold uppercase tracking-wider"
            >
              Show All 925 Jewelry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fade-in">
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
      </section>

      {/* Promotion Code Banner Widget */}
      <section className="mt-16 bg-[#7e5446] text-white px-5 py-12 text-center relative overflow-hidden">
        {/* Ambient Background Circles */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 border border-white rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 border border-white rounded-full -ml-24 -mb-24" />
        </div>

        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <h3 className="font-serif text-[18px] sm:text-[22px] tracking-[0.2em] uppercase font-bold text-[#ffdbcf]">
            Exclusive Launch Offer
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

      {/* Shop By Polish Color Swatches */}
      <section className="mt-16 px-4 max-w-2xl mx-auto text-center">
        <h2 className="font-serif text-2.5xl font-bold text-on-surface">Shop by Polish Tone</h2>
        <p className="text-xs text-on-surface-variant font-sans mt-1">
          Filter boutique alloys dynamically with raw material polish swatches
        </p>
        <div className="w-10 h-0.5 bg-[#690027]/40 mx-auto mt-2" />

        <div className="flex justify-center gap-6 sm:gap-10 mt-8">
          {[
            { id: 'Silver', label: 'Silver Polish', color: 'from-[#bebebe] to-[#e4e2e0] border-slate-300' },
            { id: 'Rose Gold', label: 'Rose Gold Tone', color: 'from-[#e6be8a] to-[#f5d6c6] border-[#ddbfc3]' },
            { id: 'Gold Plated', label: 'Gold Plated', color: 'from-[#ffd700] to-[#fdf5e6] border-[#ffd700]' }
          ].map((swatch) => (
            <button
              key={swatch.id}
              onClick={() => {
                setSelectedPolish(swatch.id as any);
                showToast(`Filtered: Showing exclusive ${swatch.id} polish items.`);
                const element = document.getElementById('bestsellers-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="flex flex-col items-center gap-2 cursor-pointer group focus:outline-none"
              id={`polish-swatch-${swatch.id.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <div className={`w-18 h-18 rounded-full border-2 p-1.5 flex items-center justify-center bg-white shadow-md transition-all duration-300 ${
                selectedPolish === swatch.id ? 'border-[#690027] ring-4 ring-primary/10 scale-105' : 'border-outline-variant/60 group-hover:border-on-surface'
              }`}>
                <div className={`w-full h-full rounded-full bg-gradient-to-tr ${swatch.color} shadow-inner`} />
              </div>
              <span className="font-sans text-[11px] font-bold text-on-surface-variant group-hover:text-primary transition-colors">
                {swatch.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Solid 925 Promise Trust Section */}
      <section className="mt-16 px-4 mb-16 max-w-4xl mx-auto w-full select-none animate-fade-in">
        <div className="bg-surface-container p-6 sm:p-10 border border-outline-variant/60 relative rounded-sm">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#690027]/10 flex items-center justify-center text-[#690027]">
              <ShieldCheck className="w-8 h-8 stroke-[1.25]" />
            </div>
            <h3 className="font-serif text-2xl font-bold tracking-tight text-on-surface">The 925 Promise</h3>
            
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant max-w-xl leading-relaxed">
              Every piece of ZELVRA jewelry is meticulously crafted from 92.5% pure silver and hallmarked with the '925' stamp. We guarantee lasting high-mirror shine and hypoallergenic comfort for daily luxury.
            </p>

            <div className="w-12 h-[1px] bg-outline-variant/70" />

            <div className="flex justify-center flex-wrap gap-4 pt-1 text-[10px] font-sans font-bold tracking-widest text-[#690027] uppercase">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                <span>AUTHENTICITY CERTIFICATE INCLUDED</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-primary" />
                <span>100% SKIN FRIENDLY ALLOY</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
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
            <button className="w-9 h-9 rounded-full border border-[#690027]/10 flex items-center justify-center hover:text-[#690027] hover:border-[#690027] transition-all cursor-pointer">
              <Instagram className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="w-9 h-9 rounded-full border border-[#690027]/10 flex items-center justify-center hover:text-[#690027] hover:border-[#690027] transition-all cursor-pointer">
              <Facebook className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="w-9 h-9 rounded-full border border-[#690027]/10 flex items-center justify-center hover:text-[#690027] hover:border-[#690027] transition-all cursor-pointer">
              <Mail className="w-4 h-4 stroke-[1.5]" />
            </button>
            <button className="w-9 h-9 rounded-full border border-[#690027]/10 flex items-center justify-center hover:text-[#690027] hover:border-[#690027] transition-all cursor-pointer">
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
