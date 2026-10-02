import React, { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, Tag, Ticket, Check, Sparkles } from 'lucide-react';
import { CartItem, Promotion } from '../types';
import { PROMOTIONS } from '../data';
import { resolveJewelryImage } from '../lib/imageResolver';

interface CartTabProps {
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onExploreCollections: () => void;
  onProceedToCheckout: (appliedDiscountPercent: number, appliedCode: string) => void;
}

export default function CartTab({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onExploreCollections,
  onProceedToCheckout,
}: CartTabProps) {
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState('');

  // Cart financial summary calculations
  const subtotal = cart.reduce((accum, item) => accum + item.product.price * item.quantity, 0);
  const discountAmount = appliedPromo ? Math.round((subtotal * appliedPromo.discountPercent) / 100) : 0;
  const shippingFee = subtotal > 1000 ? 0 : subtotal > 0 ? 150 : 0; // FREE over 1,000 INR
  const total = subtotal - discountAmount + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();

    if (!code) return;

    const matchedPromo = PROMOTIONS.find((p) => p.code === code);
    if (matchedPromo) {
      setAppliedPromo(matchedPromo);
      setPromoError('');
    } else {
      setPromoError('Invalid coupon code. Try code "SILVER25" for 25% off');
      setAppliedPromo(null);
    }
  };

  const removeAppliedPromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Editorial Title */}
      <div className="mb-8 text-center sm:text-left">
        <h2 className="font-serif text-3xl font-bold text-on-surface">Your Shopping Bag</h2>
        <p className="text-xs text-on-surface-variant font-sans mt-1 tracking-wide uppercase">
          {cart.reduce((s, i) => s + i.quantity, 0)} Elegant Items — Shipments insured
        </p>
        <div className="w-12 h-1 bg-primary mt-2 mx-auto sm:mx-0" />
      </div>

      {cart.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-outline-variant/40 p-8 rounded-sm shadow-xs max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
            <ShoppingBag className="w-7 h-7 stroke-[1.25]" />
          </div>
          <h3 className="font-serif text-xl font-bold text-on-surface">Your Bag is Empty</h3>
          <p className="text-xs text-on-surface-variant/80 font-sans mt-2 max-w-xs leading-relaxed">
            Ready to experience silver affair? Browse the Zelvra collections of 925 fine silver pieces now.
          </p>
          <button
            onClick={onExploreCollections}
            className="mt-6 bg-[#690027] hover:bg-[#8a1b3c] text-white py-3 px-6 text-xs font-sans font-bold uppercase tracking-widest flex items-center gap-2 transition-transform active:scale-[0.97] cursor-pointer shadow-md"
            id="cart-explore-btn"
          >
            Explore Jewelry Collections
          </button>
        </div>
      ) : (
        /* Two Column Layout: Items left, Summary right */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="flex gap-4 p-4 bg-white border border-outline-variant/35 rounded-xs shadow-xs relative"
              >
                {/* Product thumbnail */}
                <div className="w-20 sm:w-24 aspect-square bg-surface-container rounded-xs overflow-hidden flex-shrink-0">
                  <img 
                    src={resolveJewelryImage(item.product.image, item.product.category, item.product.name)} 
                    alt={item.product.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>

                {/* Mid-Information Column */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-serif text-sm sm:text-base font-bold text-on-surface leading-tight">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 hover:text-red-700 text-on-surface-variant/70 transition-colors cursor-pointer"
                        title="Remove item"
                        id={`remove-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Metadata tags */}
                    <div className="flex flex-wrap gap-2 mt-1 px-0.5">
                      <span className="text-[10px] sm:text-[11px] font-sans font-semibold bg-surface-container text-on-surface px-2 py-0.5 rounded-sm">
                        Polish: {item.selectedPolish}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-sans font-semibold bg-surface-container text-on-surface px-2 py-0.5 rounded-sm">
                        {item.product.category === 'rings' ? 'Size' : 'Length'}: {item.selectedSize}
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Price Row */}
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-dotted border-outline-variant/40">
                    {/* Quantity selectors */}
                    <div className="flex items-center border border-outline-variant/50">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 px-2 hover:bg-surface-container text-on-surface-variant cursor-pointer"
                        aria-label="Decrease quantity"
                        id={`dec-${item.id}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 font-sans text-xs font-bold text-on-surface">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 px-2 hover:bg-surface-container text-on-surface-variant cursor-pointer"
                        aria-label="Increase quantity"
                        id={`inc-${item.id}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Unit & Total Pricing */}
                    <div className="text-right">
                      <div className="font-sans font-bold text-sm text-primary">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-on-surface-variant/70 font-sans">
                          (₹{item.product.price.toLocaleString('en-IN')} each)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Quality badge inside Cart */}
            <div className="p-4 bg-primary/5 border border-[#ddbfc3]/50 text-center rounded-xs">
              <span className="font-sans text-[11px] font-bold text-[#690027] uppercase tracking-widest block">
                ⭐ Verified Code Promotion Hint ⭐
              </span>
              <p className="font-sans text-[11px] text-on-surface-variant/90 mt-1">
                Apply coupon code <span className="font-bold underline text-primary">SILVER25</span> at checkout to automatically claim your <span className="font-bold">25% store-wide discount</span>!
              </p>
            </div>
          </div>

          {/* Right Column: Calculations and checkout CTA */}
          <div className="p-6 bg-white border border-outline-variant/45 rounded-xs shadow-md h-fit space-y-6">
            <h3 className="font-serif text-lg font-bold text-on-surface pb-3 border-b border-outline-variant/40">
              Order Summary
            </h3>

            {/* Calculations block */}
            <div className="space-y-3.5 pb-4 border-b border-outline-variant/40">
              <div className="flex justify-between text-xs font-sans text-on-surface-variant">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-on-surface">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedPromo && (
                <div className="flex justify-between text-xs font-sans text-green-700 bg-green-50 p-2 rounded-xs">
                  <div className="flex items-center gap-1">
                    <Ticket className="w-4 h-4 text-green-700" />
                    <span>Promo Discount ({appliedPromo.code})</span>
                  </div>
                  <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-xs font-sans text-on-surface-variant">
                <span>Insured Smart Shipping</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-green-700 uppercase tracking-wider text-[10px]">FREE</span>
                ) : (
                  <span className="font-bold text-on-surface font-sans">₹{shippingFee}</span>
                )}
              </div>

              {shippingFee > 0 && (
                <p className="text-[10px] text-on-surface-variant/65 text-left -mt-1 font-sans">
                  *Add ₹{(1001 - subtotal).toLocaleString('en-IN')} more to unlock FREE Shipping
                </p>
              )}
            </div>

            {/* Promotional Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label htmlFor="promoInput" className="text-[10.5px] font-bold uppercase tracking-wider text-on-surface-variant font-sans block">
                Have a Promotion / Voucher?
              </label>

              {appliedPromo ? (
                <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-300 rounded-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-700" />
                    <span className="font-sans text-xs font-black text-green-800 uppercase">
                      {appliedPromo.code} Applied
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeAppliedPromo}
                    className="text-xs text-red-600 hover:underline font-bold uppercase font-sans tracking-wide cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="promoInput"
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="e.g. SILVER25"
                    className="flex-1 bg-[#fbf9f7] border border-outline-variant/60 rounded-sm px-3 py-2 text-xs font-sans focus:outline-none focus:border-primary uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-[#8a1b3c] text-white px-4 py-2 text-xs font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer rounded-sm"
                    id="coupon-apply-btn"
                  >
                    Apply
                  </button>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-red-700 font-bold font-sans mt-1">{promoError}</p>
              )}
            </form>

            {/* Final checkout breakdown */}
            <div className="pt-4 border-t border-outline-variant/35 space-y-4">
              <div className="flex justify-between items-end">
                <span className="font-serif text-base font-bold text-on-surface">Estimated Total</span>
                <span className="font-sans text-xl font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[9.5px] text-on-surface-variant/60 text-right font-sans">
                Inclusive of all taxes and 925 authenticity guarantees
              </p>

              <button
                onClick={() => onProceedToCheckout(appliedPromo ? appliedPromo.discountPercent : 0, appliedPromo ? appliedPromo.code : '')}
                className="w-full bg-[#690027] hover:bg-[#8a1b3c] text-white py-3 px-4 font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer h-12"
                id="cart-checkout-proceed-btn"
              >
                <Sparkles className="w-4.5 h-4.5 animate-pulse" /> Proceed To Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
