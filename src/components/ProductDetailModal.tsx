import React, { useState, useEffect } from 'react';
import { X, Heart, Star, ShieldCheck, RefreshCw, Sparkles, Check } from 'lucide-react';
import { Product, CartItem } from '../types';
import { resolveJewelryImage } from '../lib/imageResolver';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}: ProductDetailModalProps) {
  const [selectedPolish, setSelectedPolish] = useState(product.polishColors[0] || 'Silver');
  const [selectedSize, setSelectedSize] = useState(
    product.category === 'rings' ? '7' : product.category === 'necklaces' ? '18 in' : 'Standard'
  );
  const [justAdded, setJustAdded] = useState(false);

  const [imgSrc, setImgSrc] = useState(() => 
    resolveJewelryImage(product.image, product.category, product.name)
  );

  useEffect(() => {
    setSelectedPolish(product.polishColors[0] || 'Silver');
    setSelectedSize(product.category === 'rings' ? '7' : product.category === 'necklaces' ? '18 in' : 'Standard');
    setImgSrc(resolveJewelryImage(product.image, product.category, product.name));
  }, [product]);

  const handleImageError = () => {
    const ultimateFallback = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80';
    if (imgSrc !== ultimateFallback) {
      setImgSrc(ultimateFallback);
    }
  };

  // Available options
  const ringSizes = ['6', '7', '8', '9', '10'];
  const chainSizes = ['16 in', '18 in', '20 in'];

  const getPolishColorBlob = (polish: string) => {
    switch (polish) {
      case 'Rose Gold':
        return 'bg-gradient-to-tr from-[#e6be8a] to-[#f5d6c6] border-[#ddbfc3]';
      case 'Gold Plated':
        return 'bg-gradient-to-tr from-[#ffd700] to-[#fdf5e6] border-[#ffd700]';
      default: // Silver
        return 'bg-gradient-to-tr from-[#999] via-[#ccc] to-[#e5e4e2] border-slate-300';
    }
  };

  const handleAddAction = () => {
    onAddToCart({
      product,
      selectedPolish,
      selectedSize,
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose(); // auto close or keep open, closing is elegant
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Background Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" 
      />

      <div className="flex min-h-screen items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Modal Container */}
        <div className="relative transform overflow-hidden bg-[#fbf9f7] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl rounded-sm">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            aria-label="Close modal"
            id="close-detail-modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Image Section */}
            <div className="relative aspect-square md:aspect-auto md:h-full bg-surface-container flex items-center justify-center">
              <img
                src={imgSrc}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              {product.bestseller && (
                <span className="absolute top-4 left-4 bg-primary text-white text-[9.5px] font-sans font-bold px-2.5 py-1 tracking-widest uppercase">
                  BESTSELLER
                </span>
              )}
            </div>

            {/* Right Details Form */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                {/* Brand */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] tracking-[0.25em] text-secondary font-bold uppercase font-sans">
                    ZELVRA SILVER
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-sans">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 stroke-none" />
                    <span className="font-bold">{product.rating}</span>
                    <span className="text-on-surface-variant/70">({product.reviewsCount})</span>
                  </div>
                </div>

                {/* Name */}
                <h2 className="font-serif text-2xl font-bold text-on-surface mt-2 tracking-tight leading-tight">
                  {product.name}
                </h2>

                {/* Price Tag */}
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-sans text-xl font-bold text-primary">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="font-sans text-sm text-outline-custom line-through text-on-surface-variant/65">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-xs font-sans">
                    Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-on-surface-variant/90 leading-relaxed mt-4 font-sans max-h-32 overflow-y-auto">
                  {product.description}
                </p>

                {/* Gifting Curation Badges */}
                {(product.recipients || product.occasions) && (
                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {product.recipients?.map((r) => (
                      <span key={r} className="inline-flex items-center gap-1 text-[9.5px] font-sans font-bold tracking-wider uppercase bg-primary/10 text-primary px-2.5 py-1 border border-primary/15 rounded-xs select-none">
                        ♀ {r}
                      </span>
                    ))}
                    {product.occasions?.map((o) => (
                      <span key={o} className="inline-flex items-center gap-1 text-[9.5px] font-sans font-bold tracking-wider uppercase bg-amber-50 text-amber-800 px-2.5 py-1 border border-amber-200/60 rounded-xs select-none">
                        🎁 {o}
                      </span>
                    ))}
                  </div>
                )}

                {/* Polish Selector */}
                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-bold tracking-wider uppercase font-sans text-on-surface-variant block">
                    Polish Tone: <span className="text-primary normal-case font-medium">{selectedPolish}</span>
                  </span>
                  <div className="flex gap-3">
                    {product.polishColors.map((polish) => (
                      <button
                        key={polish}
                        onClick={() => setSelectedPolish(polish)}
                        className={`flex items-center gap-1.5 p-1 px-2.5 rounded-full border text-xs font-sans font-bold transition-all cursor-pointer ${
                          selectedPolish === polish
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-outline-variant/60 hover:border-on-surface-variant bg-white text-on-surface-variant'
                        }`}
                        id={`polish-${polish.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border ${getPolishColorBlob(polish)}`} />
                        {polish}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizing Section */}
                {product.category === 'rings' && (
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold tracking-wider uppercase font-sans text-on-surface-variant block">
                        Ring Size: <span className="text-primary italic normal-case font-medium">US Size {selectedSize}</span>
                      </span>
                      <a href="#" onClick={(e) => {e.preventDefault(); alert("Measure inner diameter of your ring in mm: Size 6 (16.5mm), Size 7 (17.3mm), Size 8 (18.2mm)");}} className="text-[10px] uppercase font-bold text-secondary tracking-widest hover:underline">Sizing Guide</a>
                    </div>
                    <div className="flex gap-2">
                      {ringSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-9 h-9 rounded-md border text-xs font-sans font-bold flex items-center justify-center transition-all cursor-pointer ${
                            selectedSize === size
                              ? 'bg-primary border-primary text-white font-black'
                              : 'border-outline-variant/50 hover:border-on-surface-variant bg-white text-on-surface-variant'
                          }`}
                          id={`ring-size-${size}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.category === 'necklaces' && (
                  <div className="mt-5 space-y-2">
                    <span className="text-[11px] font-bold tracking-wider uppercase font-sans text-on-surface-variant block">
                      Chain length: <span className="text-primary font-medium">{selectedSize}</span>
                    </span>
                    <div className="flex gap-2">
                      {chainSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-2 rounded-md border text-xs font-sans font-bold flex items-center justify-center transition-all cursor-pointer ${
                            selectedSize === size
                              ? 'bg-primary border-primary text-white'
                              : 'border-outline-variant/50 hover:border-on-surface-variant bg-white text-on-surface-variant'
                          }`}
                          id={`chain-size-${size.replace(/\s+/g, '-')}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quality Guarantees */}
                <div className="mt-5 p-3.5 bg-surface-container rounded-sm border border-outline-variant/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-[10.5px] font-sans font-bold tracking-wide text-on-surface-variant">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>925 SOLID SILVER AUTHENTICITY CERTIFIED</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10.5px] font-sans font-bold tracking-wide text-on-surface-variant">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span>6-MONTH COMPREHENSIVE PLATING WARRANTY</span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleAddAction}
                  disabled={justAdded}
                  className={`flex-1 button text-center py-3 px-6 uppercase font-sans font-bold text-xs tracking-widest transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    justAdded 
                      ? 'bg-green-700 text-white'
                      : 'bg-[#690027] hover:bg-[#8a1b3c] text-white active:scale-[0.98]'
                  }`}
                  id="modal-add-to-cart-btn"
                >
                  {justAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added successfully
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 animate-pulse" /> Add to Cart
                    </>
                  )}
                </button>

                {/* Wishlist Icon Action */}
                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 border rounded-md flex items-center justify-center transition-all cursor-pointer ${
                    isWishlisted 
                      ? 'border-[#690027] bg-[#690027]/5 text-[#690027]' 
                      : 'border-outline-variant hover:border-on-surface-variant text-on-surface-variant bg-white'
                  }`}
                  title="Toggle Wishlist"
                  aria-label="Wishlist Item"
                  id="modal-wishlist-toggle"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
