import React from 'react';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface WishlistTabProps {
  wishlist: Product[];
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
  onExploreCollections: () => void;
}

export default function WishlistTab({
  wishlist,
  onSelectProduct,
  onToggleWishlist,
  onAddToCartDirect,
  onExploreCollections,
}: WishlistTabProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28 animate-fade-in">
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-serif text-3xl font-extrabold text-[#340014] tracking-wide uppercase">
          Your Wishlist
        </h2>
        <p className="text-xs text-stone-500 font-sans mt-1 tracking-widest uppercase">
          {wishlist.length} {wishlist.length === 1 ? 'Masterpiece' : 'Masterpieces'} Saved
        </p>
        <div className="w-12 h-1 bg-[#690027] mt-3 mx-auto sm:ml-0" />
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#fdfbf9] border border-stone-200/50 p-8 rounded-xl max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-[#690027] mb-5 animate-pulse">
            <Heart className="w-7 h-7 stroke-[1.25]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-stone-900">Your Wishlist is Empty</h3>
          <p className="text-xs text-stone-500 font-sans mt-2 max-w-xs leading-relaxed">
            Save masterfully polished silverware, custom-engraved tags, and stunning modern bands to plan your jewelry collection perfectly.
          </p>
          <button
            onClick={onExploreCollections}
            className="mt-6 bg-[#690027] hover:bg-[#830a38] text-white py-3.5 px-8 text-xs font-sans font-bold uppercase tracking-widest flex items-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md rounded-lg"
          >
            <Sparkles className="w-4 h-4" /> Start Browsing <ArrowRight className="w-4 h-4" />
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
  );
}
