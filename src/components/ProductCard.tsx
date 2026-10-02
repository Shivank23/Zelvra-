import { useState, useEffect } from 'react';
import { Heart, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { resolveJewelryImage } from '../lib/imageResolver';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onSelect: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onAddToCartDirect: (product: Product) => void;
}

export default function ProductCard({ 
  product, 
  onSelect, 
  onToggleWishlist, 
  isWishlisted,
  onAddToCartDirect 
}: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(() => 
    resolveJewelryImage(product.image, product.category, product.name)
  );

  useEffect(() => {
    setImgSrc(resolveJewelryImage(product.image, product.category, product.name));
  }, [product.image, product.category, product.name]);

  const handleImageError = () => {
    // If even the resolved image fails, fallback to standard elegant ring
    const ultimateFallback = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80';
    if (imgSrc !== ultimateFallback) {
      setImgSrc(ultimateFallback);
    }
  };
  return (
    <div className="flex flex-col bg-white relative overflow-hidden transition-all duration-300 hover:shadow-md group rounded-xl border border-stone-100/40">
      {/* Dynamic Badge Tag */}
      {product.bestseller && (
        <div className="absolute top-3 left-3 z-10 bg-[#690027] text-white font-sans text-[9px] font-semibold px-2 py-0.5 tracking-wider uppercase select-none">
          BESTSELLER
        </div>
      )}
      {!product.bestseller && product.isNew && (
        <div className="absolute top-3 left-3 z-10 bg-[#1c1917] text-white font-sans text-[9px] font-semibold px-2 py-0.5 tracking-wider uppercase select-none">
          NEW
        </div>
      )}

      {/* Wishlist Button inside circle with light blur */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(product);
        }}
        className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center hover:bg-white hover:text-[#690027] transition-all cursor-pointer"
        aria-label="Toggle Wishlist"
        id={`wish-btn-${product.id}`}
      >
        <Heart 
          className={`w-4 h-4 transition-all ${
            isWishlisted 
              ? 'fill-[#690027] text-[#690027] scale-105' 
              : 'text-stone-700 hover:scale-105'
          }`} 
        />
      </button>

      {/* Image click triggers selection */}
      <div 
        onClick={() => onSelect(product)}
        className="aspect-square bg-stone-50 overflow-hidden cursor-pointer relative"
      >
        <img 
          alt={product.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          src={imgSrc}
          onError={handleImageError}
        />
        {/* Subtle hover overlay */}
        <div className="absolute inset-0 bg-black/2 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Details info - Sleek, Minimalist, Luxury */}
      <div className="p-3 pb-4 flex flex-col justify-between flex-grow space-y-1.5 mt-1">
        <div className="space-y-1">
          {/* Title */}
          <h4 
            onClick={() => onSelect(product)}
            className="font-serif text-[13.5px] sm:text-[14.5px] font-semibold text-stone-900 line-clamp-1 cursor-pointer hover:text-[#690027] transition-colors"
          >
            {product.name}
          </h4>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-medium text-[13.5px] text-[#690027]">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="font-sans text-[11px] text-stone-400 line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Cohesive Luxury Add to Cart action button */}
        <button 
          id={`add-cart-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCartDirect(product);
          }}
          className="w-full mt-1.5 bg-[#690027] hover:bg-[#54001f] text-white font-sans text-[11.5px] font-semibold py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98] group/btn hover:shadow-md"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#ffccd9] group-hover/btn:text-white transition-all group-hover/btn:scale-110" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
