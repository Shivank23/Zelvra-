import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  Heart, 
  Share2, 
  User, 
  CheckCircle,
  Clock,
  Compass,
  FileText,
  MapPin,
  Truck,
  Package
} from 'lucide-react';

interface OrderSuccessScreenProps {
  order: {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    items: string;
    totalAmount: number;
    paymentMethod: string;
    createdAt: string;
    itemsList?: Array<{
      product: {
        name: string;
        image: string;
        price: number;
        description: string;
      };
      quantity: number;
      selectedPolish: string;
      selectedSize: string;
    }>;
  };
  onContinueShopping: () => void;
  onTrackOrder: () => void;
  onViewInvoice: () => void;
}

export default function OrderSuccessScreen({
  order,
  onContinueShopping,
  onTrackOrder,
  onViewInvoice,
}: OrderSuccessScreenProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentBoutique, setAppointmentBoutique] = useState('Delhi Greater Kailash Boutique');
  const [appointmentBooked, setAppointmentBooked] = useState(false);

  // Parse items from receipt listing (using the raw string, or fallback if none is provided)
  const fallbackProduct = {
    name: order.items || 'Solitaire Silver Ring',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
    price: order.totalAmount,
    description: 'Selected fine luxurious jewelry'
  };

  const hasStructuredItems = order.itemsList && order.itemsList.length > 0;
  const itemCount = hasStructuredItems ? order.itemsList!.reduce((sum, item) => sum + item.quantity, 0) : 1;

  const handleShareInvite = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ZELVRA Fine Silver Jewelry',
        text: `Hey! Recommend you check out ZELVRA. Use my promo code to get credits!`,
        url: window.location.origin
      }).catch(console.error);
    } else {
      setShowShareModal(true);
    }
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentDate) return;
    setAppointmentBooked(true);
    setTimeout(() => {
      setAppointmentBooked(false);
      setShowAppointmentModal(false);
      alert(`✨ Appointment securely booked at our ${appointmentBoutique} for ${appointmentDate}! Confirmation sent to your phone ${order.phone}.`);
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-32 animate-fade-in font-sans selection:bg-[#690027]/10 selection:text-[#690027]">
      
      {/* 1. ROUNDED CHECKMARK BOX & MAIN HEADING */}
      <div className="flex flex-col items-center text-center mt-2 mb-8">
        <div className="w-16 h-16 bg-[#f4ecea] rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 shadow-xs">
          <div className="bg-[#690027] w-8 h-8 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white stroke-[3.5]" />
          </div>
        </div>

        <h2 className="font-serif text-3xl font-bold text-[#690027] leading-tight tracking-tight max-w-sm">
          Thank You for Choosing ZELVRA
        </h2>
        <p className="text-sm text-[#564144] mt-2 font-medium">
          Your order <span className="font-bold font-mono tracking-wider">{order.id}</span> has been placed successfully.
        </p>
      </div>

      {/* 2. TIMELINE TRACKER MATCHING SCREENSHOT EXACTLY */}
      <div className="relative py-4 mb-8 max-w-md mx-auto">
        {/* Horizontal Background Line */}
        <div className="absolute top-[21px] left-[12%] right-[12%] h-[1.5px] bg-[#ebd5d8] z-0" />
        
        {/* Tracker Progress Line */}
        <div className="absolute top-[21px] left-[12%] w-[25%] h-[1.5px] bg-[#690027] z-0" />

        <div className="grid grid-cols-4 gap-1 relative z-10">
          {/* Step 1: Order Placed (Solid Maroon Dot) */}
          <div className="flex flex-col items-center text-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#690027] border border-white shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#690027] mt-3.5 leading-tight font-sans">
              Order<br/>Placed
            </span>
          </div>

          {/* Step 2: Quality Check (Solid light pinkish beige Dot) */}
          <div className="flex flex-col items-center text-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ebd5d8] border border-white shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 mt-3.5 leading-tight font-sans">
              Quality<br/>Check
            </span>
          </div>

          {/* Step 3: Handcrafted Packaging (Solid light pinkish beige Dot) */}
          <div className="flex flex-col items-center text-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#ebd5d8] border border-white shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 mt-3.5 leading-tight font-sans">
              Handcrafted<br/>Packaging
            </span>
          </div>

          {/* Step 4: Estimated Delivery (Empty circular dot) */}
          <div className="flex flex-col items-center text-center">
            <div className="w-3.5 h-3.5 rounded-full bg-white border border-[#ebd5d8] shadow-xs" />
            <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 mt-3.5 leading-tight font-sans">
              Estimated<br/>Delivery
            </span>
          </div>
        </div>
      </div>

      {/* 3. ORDER SUMMARY Box with customized ring image and total font */}
      <div className="bg-white rounded-2xl border border-[#faf3f4] p-6 mb-6">
        <div className="flex justify-between items-center border-b border-[#fbf9f7] pb-3 mb-4">
          <span className="font-sans font-extrabold text-[12px] uppercase tracking-wider text-[#1b1c1b]">
            Order Summary
          </span>
          <span className="text-xs text-stone-500 font-sans font-medium">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {/* List of items */}
        <div className="space-y-4">
          {hasStructuredItems ? (
            order.itemsList!.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <img 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLsixPqwJ0PFZDZxtfEkzjYpY4DE6WNixF00WIOhL41_llqlB7_nnE0wutKBlfpntk0clXPBF3zc0FocCMoam2ro3mccS25Hf3s3550JUBioDA5achsbC3QOfCscucJ5vpvfu4LAyrUUZ2LGxtRbaXasR3Nis4t998BSmRijoRQ1QTGJ5DrzJnnSrcj8vE9HzhPi9gd_IFb_z_iqkH0UTHKP8jwkDtQ6kgQMqKtS2XDy5XXdfJB_OpCPYb6A" 
                  alt={item.product.name} 
                  className="w-16 h-16 object-cover bg-white rounded-lg border border-[#faf3f4]"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-[15px] font-bold text-[#690027] leading-tight truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-[12px] text-stone-500 mt-1">
                    Size: {item.selectedSize} | 925 Sterling Silver
                  </p>
                  <p className="text-[13px] text-[#1b1c1b] font-bold mt-1">
                    ₹{item.product.price.toLocaleString('en-IN')}.00
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex gap-4 items-center">
              <img 
                src="https://lh3.googleusercontent.com/aida/AP1WRLsixPqwJ0PFZDZxtfEkzjYpY4DE6WNixF00WIOhL41_llqlB7_nnE0wutKBlfpntk0clXPBF3zc0FocCMoam2ro3mccS25Hf3s3550JUBioDA5achsbC3QOfCscucJ5vpvfu4LAyrUUZ2LGxtRbaXasR3Nis4t998BSmRijoRQ1QTGJ5DrzJnnSrcj8vE9HzhPi9gd_IFb_z_iqkH0UTHKP8jwkDtQ6kgQMqKtS2XDy5XXdfJB_OpCPYb6A" 
                alt={fallbackProduct.name} 
                className="w-16 h-16 object-cover bg-white rounded-lg border border-[#faf3f4]"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-[15px] font-bold text-[#690027] leading-tight truncate">
                  {fallbackProduct.name}
                </h4>
                <p className="text-[12px] text-stone-500 mt-1">
                  Size: 12 | 925 Sterling Silver
                </p>
                <p className="text-[13px] text-[#1b1c1b] font-bold mt-1">
                  ₹{order.totalAmount.toLocaleString('en-IN')}.00
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Total Amount in dynamic serif font */}
        <div className="border-t border-[#faf3f4] mt-5 pt-4 flex justify-between items-center">
          <span className="text-[13px] font-sans font-medium text-[#1b1c1b]">
            Total Amount
          </span>
          <span className="text-[#690027]">
            <span className="font-serif font-extrabold text-[#690027] text-3xl">
              ₹{order.totalAmount.toLocaleString('en-IN')}.00
            </span>
          </span>
        </div>
      </div>

      {/* 4. SHARE THE SPARKLE promo box */}
      <div className="bg-[#690027] text-white p-6 rounded-2xl mb-6 text-left relative overflow-hidden group">
        <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
          <Sparkles className="w-32 h-32 text-white" />
        </div>
        <h3 className="font-serif italic text-2xl font-medium tracking-wide">
          Share the Sparkle
        </h3>
        <p className="text-[12px] text-stone-200 mt-2 leading-relaxed max-w-sm mb-5">
          Invite your friends to ZELVRA and earn 500 'ZELVRA Credits' on their first purchase. Use credits for buybacks or exclusive upgrades.
        </p>
        <div className="space-y-2 max-w-sm">
          <button 
            onClick={handleShareInvite}
            className="w-full cursor-pointer bg-white hover:bg-neutral-100 text-[#690027] text-[11px] font-bold tracking-widest uppercase py-3 transition-colors text-center font-sans"
          >
            Invite Friends
          </button>
          <button 
            onClick={() => alert('🌟 Your active wallet balance: 1,500 VIP Credits. Next reward milestone unlocks at 2,000.')}
            className="w-full cursor-pointer bg-transparent hover:bg-white/10 text-white text-[11px] font-bold tracking-widest uppercase py-3 transition-colors text-center font-sans border border-white"
          >
            View My Rewards
          </button>
        </div>
      </div>

      {/* 5. ZELVRA CARE Box */}
      <div className="bg-[#fcf8f6] border border-[#f2edeb] rounded-xl p-5 mb-4 text-left">
        <div className="flex gap-3 items-center mb-2">
          <span className="p-1 rounded-sm text-[#690027]">
            {/* Custom comb SVG icon exactly representing clean combs */}
            <svg className="w-5 h-5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16m4-16v16M12 4v16m4-16v16m4-16v16M4 12h16" />
            </svg>
          </span>
          <h4 className="font-sans font-bold text-[12px] uppercase tracking-wider text-[#1b1c1b]">
            Zelvra Care
          </h4>
        </div>
        <p className="text-[12.5px] text-[#564144] leading-relaxed mb-3">
          Keep your piece timeless. Book a complimentary ultrasonic cleaning appointment at your nearest ZELVRA boutique.
        </p>
        <button 
          onClick={() => setShowAppointmentModal(true)}
          className="text-[11px] font-bold uppercase tracking-wider text-[#690027] hover:underline font-sans cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1"
        >
          Book Appointment <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 6. AUTHENTICITY CERTIFICATE box */}
      <div className="bg-[#fbfbfb] border border-[#ebd5d8] rounded-xl p-5 mb-8 text-left">
        <div className="flex gap-3 items-center mb-2">
          <ShieldCheck className="w-5 h-5 text-[#a83351]" />
          <h4 className="font-sans font-bold text-[12px] uppercase tracking-wider text-[#1b1c1b]">
            Authenticity Certificate
          </h4>
        </div>
        <p className="text-[12px] text-[#564144] leading-relaxed">
          Rest assured, your 925 silver authenticity certificate is being prepared and will be shipped along with your order.
        </p>
      </div>

      {/* 7. ACTION BUTTONS */}
      <div className="space-y-3">
        <button
          onClick={onContinueShopping}
          className="bg-[#690027] hover:bg-[#8a1b3c] text-[#FAF8F5] text-xs font-bold uppercase tracking-widest py-3 h-12 w-full border border-[#690027] transition-all rounded-xs cursor-pointer text-center font-sans shadow-md"
        >
          Continue Shopping
        </button>

        <div className="grid grid-cols-2 gap-3.5">
          <button
            onClick={() => setShowTrackingModal(true)}
            className="w-full cursor-pointer bg-white hover:bg-neutral-50 border border-[#ddbfc3] text-[#1b1c1b] text-[11px] font-bold uppercase tracking-wider py-2.5 transition-all rounded-xs text-center font-sans h-11"
          >
            Track Order
          </button>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="w-full cursor-pointer bg-white hover:bg-neutral-50 border border-[#ddbfc3] text-[#1b1c1b] text-[11px] font-bold uppercase tracking-wider py-2.5 transition-all rounded-xs text-center font-sans h-11"
          >
            View Invoice
          </button>
        </div>
      </div>

      {/* 8. MINI FOOTER EMBODYING LUSTROUS MODERNITY */}
      <div className="mt-16 pt-8 border-t border-[#f2edeb] text-center space-y-4">
        <p className="font-serif text-sm tracking-widest text-[#1b1c1b] font-bold select-none">
          ZELVRA
        </p>
        <div className="grid grid-cols-3 max-w-sm mx-auto gap-4 py-1 text-[10px] text-gray-500 font-medium font-sans">
          <span>Shipping &amp; Returns</span>
          <span>Privacy Policy</span>
          <span>Contact Us</span>
        </div>
        <div className="flex justify-center gap-6 text-[10px] text-gray-500 font-medium font-sans max-w-sm mx-auto">
          <span>Lifetime Warranty</span>
          <span>•</span>
          <span>Store Locator</span>
        </div>
        
        {/* Foot Buttons */}
        <div className="flex justify-center gap-6 py-2 text-stone-500">
          <Share2 className="w-4 h-4 cursor-pointer hover:text-[#690027]" onClick={handleShareInvite} />
          <User className="w-4 h-4 cursor-pointer hover:text-[#690027]" onClick={() => setShowTrackingModal(true)} />
          <Heart className="w-4 h-4 cursor-pointer hover:text-[#690027]" onClick={onContinueShopping} />
        </div>

        <p className="text-[9.5px] text-[#8c8a87] font-medium tracking-wide">
          © 2024 ZELVRA Luxury Jewelry. All Rights Reserved.
        </p>
      </div>

      {/* COMPLIMENTARY DIALOGS/MODALS FOR FLUID USER EXPERIENCE */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 max-w-sm w-full text-center space-y-4 rounded-none border border-neutral-300">
            <h4 className="font-serif text-lg font-bold text-on-surface">Share ZELVRA Love</h4>
            <p className="text-xs text-stone-500 leading-relaxed">
              We generated a custom social invite link for your account profile:
            </p>
            <div className="p-3 bg-neutral-100 font-mono text-[11px] text-primary break-all select-all border select-none">
              {window.location.origin}/invite?ref=ZLV_{order.id}
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/invite?ref=ZLV_${order.id}`);
                alert('Copied link to clipboard!');
                setShowShareModal(false);
              }}
              className="bg-[#690027] text-white font-sans text-xs uppercase font-extrabold px-4 py-2 w-full cursor-pointer"
            >
              Copy Invitation Link
            </button>
            <button 
              onClick={() => setShowShareModal(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-semibold underline block mx-auto cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Appointment booking Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-start p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white p-6 max-w-md w-full text-left space-y-4 rounded-none border border-neutral-300 my-auto relative">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-serif text-lg font-bold text-on-surface">Book Complimentary Care</h4>
              <button onClick={() => setShowAppointmentModal(false)} className="text-gray-400 hover:text-gray-600 font-bold font-sans text-sm">✕</button>
            </div>
            
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Select Boutique Outlet</label>
                <select 
                  value={appointmentBoutique}
                  onChange={(e) => setAppointmentBoutique(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2 text-xs focus:outline-none focus:border-primary"
                >
                  <option value="Delhi Greater Kailash Boutique">Delhi Greater Kailash Boutique (Zelvia Flagship)</option>
                  <option value="Mumbai Colaba Heritage Boutique">Mumbai Colaba Heritage Boutique</option>
                  <option value="Bangalore Indiranagar Lounge">Bangalore Indiranagar Lounge</option>
                  <option value="Digital Care Valet (Direct Home Pick-up)">Digital Care Valet (Direct Home Pick-up)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Preferred Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={appointmentDate}
                  required
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full bg-white border border-stone-300 p-2 text-xs focus:outline-none focus:border-primary"
                />
              </div>

              <div className="p-3 bg-neutral-50 border border-dotted border-stone-300 rounded-sm text-[10px] text-stone-500 leading-tight">
                ℹ️ Complimentary cleaning services include professional ultrasonic dirt clearing, prong-firmness auditing, and buff-polishing. Available completely free once per quarter for VIP Gold members.
              </div>

              <button 
                type="submit"
                className="bg-[#690027] text-white font-sans text-xs uppercase font-extrabold py-2.5 w-full cursor-pointer tracking-wider"
              >
                Confirm Appointment Slot
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER ORDER TRACKING MODAL */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-start p-4 z-50 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-[#fbf9f7] p-6 max-w-md w-full text-left space-y-4 rounded-none border border-[#ddbfc3] shadow-md my-auto relative">
            <div className="flex justify-between items-center border-b border-[#eae5e2] pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#690027]" />
                <h4 className="font-serif text-lg font-bold text-[#690027]">Track Your Sparkle</h4>
              </div>
              <button 
                onClick={() => setShowTrackingModal(false)} 
                className="text-stone-400 hover:text-stone-700 font-bold font-sans text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AWB Tracking Header */}
            <div className="bg-white p-4 border border-[#eae5e2] rounded-xs space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-500 font-medium">Carrier Partner:</span>
                <span className="font-bold text-[#1b1c1b]">Bluedart Luxury Express 🇮🇳</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-500 font-medium">Air Waybill (AWB):</span>
                <span className="font-mono font-bold text-[#1b1c1b] tracking-wider select-all">
                  AWB-{order.id.replace('ZLV-', 'ZLVBD')}-IN
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-stone-500 font-medium">Status:</span>
                <span className="font-bold text-[#a83351] flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#a83351] animate-pulse" />
                  Hallmark Quality Polish
                </span>
              </div>
            </div>

            {/* Vertical Flow Timeline */}
            <div className="pl-2 space-y-6 relative before:absolute before:bottom-2 before:top-2 before:left-[17px] before:w-[1.5px] before:bg-stone-200">
              {/* Step 1: Paid */}
              <div className="flex gap-4 items-start relative">
                <div className="w-9 h-9 rounded-full bg-[#690027] text-white flex items-center justify-center z-10 shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h5 className="text-[12.5px] font-bold text-[#1b1c1b]">Payment Secured &amp; Verified</h5>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                    Order successfully routed via Razorpay safe gateway. Receipt generated.
                  </p>
                  <span className="text-[9px] font-mono font-medium text-stone-400 block mt-1">{order.createdAt}</span>
                </div>
              </div>

              {/* Step 2: Quality */}
              <div className="flex gap-4 items-start relative">
                <div className="w-9 h-9 rounded-full bg-[#690027] text-white flex items-center justify-center z-10 shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <h5 className="text-[12.5px] font-bold text-[#1b1c1b]">Zelvia Artisan Quality Check</h5>
                  <p className="text-[11px] text-stone-500 leading-tight mt-0.5">
                    Approved. Authenticity 925 certification laser engraving complete.
                  </p>
                  <span className="text-[9px] font-mono font-medium text-stone-400 block mt-1">Pending batch sorting</span>
                </div>
              </div>

              {/* Step 3: Polish / Packing */}
              <div className="flex gap-4 items-start relative">
                <div className="w-9 h-9 rounded-full bg-[#ffeaee] border border-[#ff9aac] text-[#690027] flex items-center justify-center z-10 shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-[12.5px] font-bold text-[#690027]">Handcrafted Polish &amp; Gift Wrap</h5>
                  <p className="text-[11px] text-stone-600 leading-tight mt-0.5 font-medium">
                    Our master craftsman is currently completing your mirror polishing batch for hand-plating.
                  </p>
                  <span className="text-[9px] font-medium text-[#a83351] block mt-1">Current Active Phase</span>
                </div>
              </div>

              {/* Step 4: Dispatched */}
              <div className="flex gap-4 items-start relative">
                <div className="w-9 h-9 rounded-full bg-white border border-stone-200 text-stone-400 flex items-center justify-center z-10 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="text-[12.5px] font-bold text-stone-400">Insured Overnight Express Dispatch</h5>
                  <p className="text-[11px] text-stone-400 leading-tight mt-0.5">
                    Handoff to Bluedart Courier and delivery airway bill activation.
                  </p>
                </div>
              </div>
            </div>

            {/* Address summary */}
            <div className="border-t border-[#eae5e2] pt-3.5 text-xs text-[#564144] space-y-1">
              <div className="flex gap-1.5 items-start">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1b1c1b]">Shipping To:</p>
                  <p className="font-normal mt-0.5">
                    {order.customerName} | Phone: {order.phone}<br />
                    Secure Courier Vault, Central Hub Metro Outpost
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Customer Support Line */}
            <div className="p-3 bg-[#f3edf0] border-l-4 border-[#690027] text-[11px] text-[#564144] leading-relaxed">
              📞 <strong>Need Help?</strong> Instant tracking assistance query is live. Feel free to contact our concierge service directly at <strong>shivankpandey23@gmail.com</strong>.
            </div>
          </div>
        </div>
      )}

      {/* E-INVOICE RECEIPT MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-start p-4 z-50 overflow-y-auto animate-fade-in font-sans">
          <div className="bg-white p-6 max-w-lg w-full text-left space-y-4 rounded-none border border-stone-300 shadow-xl my-auto relative">
            {/* Header / Invoice Metadata */}
            <div className="flex justify-between items-start border-b border-[#eae5e2] pb-4">
              <div>
                <h4 className="font-serif text-2xl font-bold tracking-widest text-[#690027]">ZELVRA</h4>
                <p className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold mt-1">Lustrous Modernity Fine Jewelry</p>
                <p className="text-[9px] text-stone-400 mt-1">GSTIN: 07AAACZ1194P1Z3</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-[#f3edf0] text-[#690027] text-[10px] font-bold uppercase py-0.5 px-2 mb-2">TAX INVOICE</span>
                <p className="text-[11px] font-bold text-stone-700">Invoice: <span className="font-mono">{order.id.replace('ZLV-', 'ZLV-INV-')}</span></p>
                <p className="text-[11px] text-stone-500 mt-0.5 font-medium">Date: {order.createdAt}</p>
              </div>
            </div>

            {/* Address & Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-xs py-2 border-b border-stone-100">
              <div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Billed To</p>
                <p className="font-bold text-[#1b1c1b]">{order.customerName}</p>
                <p className="text-stone-600 mt-0.5">{order.email}</p>
                <p className="text-stone-600">Ph: {order.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-1">Company Headquarters</p>
                <p className="font-bold text-[#1b1c1b]">Zelvia Luxury Boutique Retail</p>
                <p className="text-stone-600 mt-0.5">DLF Emporio Mall, Vasant Kunj</p>
                <p className="text-stone-600">New Delhi - 110070, India</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-3 py-2">
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Itemized Breakdown</p>
              <div className="border border-stone-100 rounded-xs overflow-hidden">
                <div className="grid grid-cols-12 bg-stone-50 text-[10px] font-bold uppercase p-2 border-b border-stone-100 text-stone-600">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-right">Amount</div>
                </div>

                {hasStructuredItems ? (
                  order.itemsList!.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-xs p-2.5 border-b border-stone-50 items-center last:border-b-0">
                      <div className="col-span-6 pr-2">
                        <p className="font-bold text-stone-800 leading-tight truncate">{item.product.name}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">Size: {item.selectedSize} | Polish: {item.selectedPolish}</p>
                      </div>
                      <div className="col-span-2 text-center font-semibold text-stone-600">{item.quantity}</div>
                      <div className="col-span-2 text-right text-stone-600">₹{item.product.price.toLocaleString('en-IN')}</div>
                      <div className="col-span-2 text-right font-bold text-stone-800">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</div>
                    </div>
                  ))
                ) : (
                  <div className="grid grid-cols-12 text-xs p-2.5 items-center">
                    <div className="col-span-6 pr-2">
                      <p className="font-bold text-stone-800 leading-tight truncate">{fallbackProduct.name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">Size/Polish: Handcrafted Custom Order</p>
                    </div>
                    <div className="col-span-2 text-center font-semibold text-stone-600">1</div>
                    <div className="col-span-2 text-right text-stone-600">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                    <div className="col-span-2 text-right font-bold text-stone-800">₹{order.totalAmount.toLocaleString('en-IN')}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="flex justify-end pt-2 border-t border-stone-100">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>Taxable Value (Subtotal):</span>
                  <span>₹{Math.round(order.totalAmount * 0.97).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-500 text-[11px] font-medium">
                  <span>Integrated GST (IGST @ 3%):</span>
                  <span>₹{Math.round(order.totalAmount * 0.03).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600 font-medium">
                  <span>Shipping &amp; Delivery Fee:</span>
                  <span className="text-[#690027] font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-[14px] font-bold text-[#1b1c1b] border-t border-stone-100 pt-2">
                  <span>Grand Total Paid:</span>
                  <span className="text-[#690027] font-extrabold font-serif text-base">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Declarations and Footer Check */}
            <div className="bg-stone-50 p-3 rounded-xs text-[9px] text-stone-500 leading-normal space-y-1 border border-stone-200/50">
              <p>📍 <strong>Disclaimer:</strong> This is a digitally signed computer-generated tax e-invoice receipt registered in the Zelvia Luxury Cloud Inventory Database. No physical signature is required under section 65 of VAT regulations.</p>
              <p>🔒 Secured with industry-grade 256-bit TLS Gateway authorization. All jewelry guarantees lifetime metal fidelity &amp; authentic hallmark guarantees.</p>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-[#690027] hover:bg-[#850a36] text-white py-2.5 text-xs uppercase font-extrabold tracking-wider text-center cursor-pointer transition-colors"
              >
                Print Invoice 🖨 &nbsp;
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-5 bg-white hover:bg-stone-50 text-stone-700 py-2.5 text-xs uppercase font-bold tracking-wider text-center cursor-pointer border border-stone-300 transition-colors"
              >
                Close ✕
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
