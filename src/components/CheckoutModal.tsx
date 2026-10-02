import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Heart, CreditCard, Sparkles, CheckCircle, ShoppingBag, Smartphone, Banknote, AlertCircle } from 'lucide-react';
import { CartItem } from '../types';
import { addOrder } from '../lib/supabase';
import { openRazorpayCheckout, getRazorpayKeyId } from '../lib/razorpay';

interface CheckoutModalProps {
  cart: CartItem[];
  discountPercent: number;
  promoCode: string;
  onClose: () => void;
  onOrderSuccess: (orderData: {
    customerName: string;
    email: string;
    phone: string;
    items: string;
    totalAmount: number;
    paymentMethod: 'Google Pay' | 'PhonePe' | 'Paytm' | 'Credit Card' | 'COD';
    razorpayPaymentId?: string;
  }) => void;
}

export default function CheckoutModal({
  cart,
  discountPercent,
  promoCode,
  onClose,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2>(1); // 1: Info & Checkout, 2: Success invoice
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [useSimulator, setUseSimulator] = useState(true);
  
  // Track successful transaction info
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [confirmedPaymentId, setConfirmedPaymentId] = useState('');

  // Form Fields State
  const [fullName, setFullName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [cityPlace, setCityPlace] = useState('');
  const [zipcodeValue, setZipcodeValue] = useState('');

  // Payment Selection State
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('upi');
  const [upiProvider, setUpiProvider] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');
  const [upiId, setUpiId] = useState('');

  // Local card fields (as fallback/direct visual fields)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const subtotal = cart.reduce((accum, item) => accum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const shippingFee = (subtotal > 1000 || subtotal === 1) ? 0 : 150;
  const total = subtotal - discountAmount + shippingFee;

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auto-generate a custom UPI ID based on the user's name
  useEffect(() => {
    if (fullName) {
      const slug = fullName.toLowerCase().replace(/\s+/g, '');
      if (upiProvider === 'gpay') setUpiId(`${slug}@okaxis`);
      else if (upiProvider === 'phonepe') setUpiId(`${slug}@ybl`);
      else setUpiId(`${slug}@paytm`);
    }
  }, [fullName, upiProvider]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full Name is required';
    if (!emailAddress.includes('@')) errors.email = 'Valid Email is required';
    if (!/^\d{10}$/.test(phoneNumber.trim().replace(/\D/g, ''))) {
      errors.phone = '10-digit Phone number is required';
    }
    if (!streetAddress.trim()) errors.address = 'Street address is required';
    if (!cityPlace.trim()) errors.city = 'City/Town is required';
    if (!/^\d{6}$/.test(zipcodeValue.trim())) errors.zipcode = 'Zipcode must be exactly 6 digits';
    
    // UI field validation for card option if not using the official popup
    if (paymentMethod === 'card' && !window.hasOwnProperty('Razorpay')) {
      if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ''))) errors.card = 'Card number must be 16 digits';
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) errors.expiry = 'Expiry must be MM/YY';
      if (!/^\d{3}$/.test(cardCvv)) errors.cvv = 'CVV must be 3 digits';
    } else if (paymentMethod === 'upi' && !window.hasOwnProperty('Razorpay')) {
      if (!upiId.trim() || !upiId.includes('@')) {
        errors.upiId = 'Enter a valid UPI ID (e.g. name@okaxis)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    setPaymentError(null);

    const itemsStrList = cart.map(item => `${item.product.name} (${item.selectedPolish}, ${item.selectedSize}) x ${item.quantity}`).join(', ');
    const mappedItemsForDb = cart.map(item => ({
      id: item.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      selectedPolish: item.selectedPolish,
      selectedSize: item.selectedSize
    }));

    // Settle with Razorpay if choosing Card or UPI
    if (paymentMethod === 'card' || paymentMethod === 'upi') {
      try {
        let paymentRes;

        if (useSimulator) {
          // Play a visual delay to feel premium
          await new Promise(resolve => setTimeout(resolve, 1200));
          paymentRes = {
            razorpay_payment_id: `pay_sim_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
            razorpay_order_id: `rzp_sim_ord_${Math.random().toString(36).substring(2, 11).toUpperCase()}`
          };
        } else {
          const payload = {
            amount: total,
            currency: 'INR',
            description: `Zelvra Order checkout: ${cart.length} pcs`,
            prefill: {
              name: fullName,
              email: emailAddress,
              contact: phoneNumber
            },
            notes: {
              customer_address: `${streetAddress}, ${cityPlace} - ${zipcodeValue}`,
              items_summary: itemsStrList.substring(0, 200)
            }
          };

          // Open Razorpay portal gate
          paymentRes = await openRazorpayCheckout(payload);
        }
        
        // Succeeded! Now persist order payload directly in the Supabase database
        const orderPayload = {
          customerName: fullName,
          customerEmail: emailAddress,
          customerPhone: phoneNumber,
          shippingAddress: `${streetAddress}, ${cityPlace} - ${zipcodeValue}`,
          items: mappedItemsForDb,
          totalPrice: total,
          razorpayPaymentId: paymentRes.razorpay_payment_id,
          razorpayOrderId: paymentRes.razorpay_order_id || `rzp_ord_${Date.now()}`
        };

        const dbOrder = await addOrder(orderPayload);
        setGeneratedOrderId(dbOrder.id);
        setConfirmedPaymentId(paymentRes.razorpay_payment_id);
        setStep(2);
      } catch (err: any) {
        console.warn('Payment or DB submission cancelled/failed:', err);
        setPaymentError(err.message || 'Payment window was dismissed or transaction declined.');
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Cash on Delivery (COD) Settle directly to Database as pending order
      try {
        const codPayload = {
          customerName: fullName,
          customerEmail: emailAddress,
          customerPhone: phoneNumber,
          shippingAddress: `${streetAddress}, ${cityPlace} - ${zipcodeValue}`,
          items: mappedItemsForDb,
          totalPrice: total,
          razorpayPaymentId: 'CASH_ON_DELIVERY',
          razorpayOrderId: `cod_ord_${Math.floor(Math.random() * 100000)}`
        };

        const dbOrder = await addOrder(codPayload);
        setGeneratedOrderId(dbOrder.id);
        setConfirmedPaymentId('COD_PENDING');
        setStep(2);
      } catch (err: any) {
        setPaymentError('Failed to save COD Order in database.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleFinish = () => {
    let finalPayMethod: 'Google Pay' | 'PhonePe' | 'Paytm' | 'Credit Card' | 'COD' = 'Credit Card';
    if (paymentMethod === 'upi') {
      if (upiProvider === 'gpay') finalPayMethod = 'Google Pay';
      else if (upiProvider === 'phonepe') finalPayMethod = 'PhonePe';
      else finalPayMethod = 'Paytm';
    } else if (paymentMethod === 'cod') {
      finalPayMethod = 'COD';
    }

    const itemsStr = cart.map(item => `${item.product.name} (${item.selectedPolish}, ${item.selectedSize}) x ${item.quantity}`).join(', ');

    onOrderSuccess({
      customerName: fullName,
      email: emailAddress,
      phone: phoneNumber,
      items: itemsStr,
      totalAmount: total,
      paymentMethod: finalPayMethod,
      razorpayPaymentId: confirmedPaymentId
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fbf9f7] w-full max-w-2xl rounded-sm shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        {step === 1 && (
          <div className="h-16 flex justify-between items-center px-6 border-b border-neutral-200 bg-white sticky top-0 z-11">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#690027]" />
              <span className="font-serif text-[17px] font-bold text-stone-900 uppercase tracking-wider">
                Razorpay Checkout Portal
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:text-[#690027] transition-colors cursor-pointer"
              aria-label="Cancel checkout"
              id="cancel-checkout-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Form panel scroll area */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          {step === 1 ? (
            <form onSubmit={handlePay} className="space-y-6">
              
              {/* Order total header summary */}
              <div className="p-4 bg-white border border-stone-200 rounded-xs space-y-1.5 font-sans">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">Checkout Cart Recap</h4>
                  <span className="text-[10px] uppercase font-bold text-[#690027] bg-[#690027]/10 px-1.5 py-0.5 rounded-sm">Premium Packaging Included</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 divide-y divide-stone-100 pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs py-1">
                      <span className="text-stone-600 line-clamp-1 flex-1 pr-4">
                        {item.product.name} ({item.selectedPolish}, Size {item.selectedSize}) <span className="font-bold text-[#690027]">x{item.quantity}</span>
                      </span>
                      <span className="font-bold text-stone-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-stone-200 text-xs font-bold font-sans">
                  <span>Grand Total (Payable Now):</span>
                  <span className="text-[#690027] text-sm font-semibold">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Grid: Shipping and Payment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Shipping Form */}
                <div className="space-y-3.5">
                  <h3 className="font-serif text-base font-bold text-neutral-900 border-b pb-1.5 border-stone-200">
                    1. Shipping Information
                  </h3>

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Shivank Pandey"
                      required
                      className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs font-sans focus:outline-none focus:border-[#690027]"
                    />
                    {formErrors.fullName && <p className="text-[10px] font-sans font-bold text-red-700">{formErrors.fullName}</p>}
                  </div>

                  {/* Contact Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans">Email</label>
                      <input
                        type="email"
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="shivank@gmail.com"
                        required
                        className="w-full bg-white border border-neutral-300 rounded-xs px-2.5 py-2 text-xs font-sans focus:outline-none focus:border-[#690027]"
                      />
                      {formErrors.email && <p className="text-[10px] font-sans font-bold text-red-700">{formErrors.email}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans">Phone</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="9870421194"
                        required
                        className="w-full bg-white border border-neutral-300 rounded-xs px-2.5 py-2 text-xs font-sans focus:outline-none focus:border-[#690027]"
                      />
                      {formErrors.phone && <p className="text-[10px] font-sans font-bold text-red-700">{formErrors.phone}</p>}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans">Delivery Address</label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="Block C-4, Sector 15"
                      required
                      className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs font-sans focus:outline-none focus:border-[#690027]"
                    />
                    {formErrors.address && <p className="text-[10px] font-sans font-bold text-red-700">{formErrors.address}</p>}
                  </div>

                  {/* City & Zipcode Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans">City / State</label>
                      <input
                        type="text"
                        value={cityPlace}
                        onChange={(e) => setCityPlace(e.target.value)}
                        placeholder="Noida, UP"
                        required
                        className="w-full bg-white border border-neutral-300 rounded-xs px-2.5 py-2 text-xs font-sans focus:outline-none focus:border-[#690027]"
                      />
                      {formErrors.city && <p className="text-[10px] font-sans font-bold text-red-700">{formErrors.city}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 font-sans">Zipcode (6 digit)</label>
                      <input
                        type="text"
                        value={zipcodeValue}
                        onChange={(e) => setZipcodeValue(e.target.value.replace(/\D/g, ''))}
                        placeholder="201301"
                        maxLength={6}
                        required
                        className="w-full bg-white border border-neutral-300 rounded-xs px-2.5 py-2 text-xs font-sans focus:outline-none focus:border-[#690027]"
                      />
                      {formErrors.zipcode && <p className="text-[10px] font-sans font-bold text-red-700">{formErrors.zipcode}</p>}
                    </div>
                  </div>
                </div>

                {/* Gateway Selection Panel */}
                <div className="space-y-4">
                  <h3 className="font-serif text-base font-bold text-neutral-900 border-b pb-1.5 border-stone-200 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#690027]" />
                    2. Choose Payment Method
                  </h3>

                  {/* Payment option tabs */}
                  <div className="grid grid-cols-3 gap-2 font-sans text-[10px] font-bold tracking-wider uppercase">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`py-3 px-1 text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === 'upi'
                          ? 'border-[#690027] bg-[#690027]/5 text-[#690027]'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-500'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-green-600" />
                      UPI (GPay/UPI)
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-3 px-1 text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === 'card'
                          ? 'border-[#690027] bg-[#690027]/5 text-[#690027]'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-500'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Credit Card
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`py-3 px-1 text-center border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === 'cod'
                          ? 'border-[#690027] bg-[#690027]/5 text-[#690027]'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-500'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-600" />
                      Cash (COD)
                    </button>
                  </div>

                  {/* Sandbox environment simulator selection */}
                  {(paymentMethod === 'card' || paymentMethod === 'upi') && (
                    <div className="p-3 bg-stone-100 border border-stone-200 rounded-sm space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-sans font-bold text-[10.1px] uppercase tracking-wide text-stone-700">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Testing Sandbox Switch
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={useSimulator}
                            onChange={(e) => setUseSimulator(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4.5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#690027]"></div>
                        </label>
                      </div>
                      <p className="text-[9.5px] leading-relaxed text-stone-500">
                        {useSimulator 
                          ? "🎯 DEMO SIMULATOR ACTIVE: Bypasses live popups and saves transactions immediately into your Supabase database."
                          : "⚠️ LIVE DIALOGUE GATEWAY: Runs live checkout popups. Note that sandboxed dev previews may block popups."
                        }
                      </p>
                    </div>
                  )}

                  {/* Tab UI description: UPI */}
                  {paymentMethod === 'upi' && (
                    <div className="space-y-3 pt-1 text-xs">
                      <div className="p-3 bg-green-50 rounded-xs border border-green-200 text-[10.5px] text-green-800 leading-relaxed font-sans">
                        🇮🇳 <span className="font-bold">Lightning Indian UPI Checkout:</span> Prompts standard GPay, PhonePe, or Paytm checkout overlay for immediate transaction authorization.
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setUpiProvider('gpay')}
                          className={`p-2 text-center border text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                            upiProvider === 'gpay' ? 'border-green-600 bg-green-50 text-green-800' : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          GPay
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiProvider('phonepe')}
                          className={`p-2 text-center border text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                            upiProvider === 'phonepe' ? 'border-purple-600 bg-purple-50 text-purple-800' : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          PhonePe
                        </button>
                        <button
                          type="button"
                          onClick={() => setUpiProvider('paytm')}
                          className={`p-2 text-center border text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                            upiProvider === 'paytm' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-stone-200 bg-white hover:bg-stone-50'
                          }`}
                        >
                          Paytm
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Virtual UPI ID handle</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. shivank@okaxis"
                          className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#690027]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab UI description: CARD */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-3 pt-1 text-xs">
                      <div className="p-3 bg-blue-50 rounded-xs border border-blue-200 text-[10.5px] text-blue-800 leading-relaxed font-sans font-medium">
                        💳 <span className="font-bold">Official Razorpay Checkout:</span> Pay via Visa, MasterCard, RuPay, or AMEX. The secure Razorpay gateway dialogue handles formatting automatically.
                      </div>
                      
                      <div className="p-3.5 bg-stone-100 rounded-xs text-[10px] text-stone-500 space-y-1 font-mono">
                        <p className="font-bold text-stone-700">💡 Dynamic Integration Note:</p>
                        <p>No card numbers are stored. Everything compiles fully using the validated and tokenized Razorpay PCI-DSS certified environment.</p>
                      </div>
                    </div>
                  )}

                  {/* Tab UI description: COD */}
                  {paymentMethod === 'cod' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xs text-xs space-y-2 text-amber-800 font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-amber-900">
                        <Banknote className="w-4 h-4 text-amber-700" />
                        Cash on Delivery (COD) Selected
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Order now and pay the exact sum of <strong className="text-stone-900 font-bold">₹{total.toLocaleString('en-IN')}</strong> directly to your shipping courier agent when they drop off your parcel!
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Payment error banner if any */}
              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-red-700 text-xs font-sans flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Pay Button Trigger */}
              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full py-3.5 px-4 font-sans text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-md rounded-xs cursor-pointer text-white flex items-center justify-center gap-2 ${
                  isProcessing 
                    ? 'bg-amber-600 cursor-not-allowed'
                    : 'bg-[#690027] hover:bg-[#8A1B3C] active:scale-[0.98]'
                }`}
                id="submit-payment-action-btn"
              >
                {isProcessing ? (
                  <>🔑 Contacting Razorpay secure gateway...</>
                ) : (
                  <>Instant Secure Checkout: Pay ₹{total.toLocaleString('en-IN')} 🛡️</>
                )}
              </button>
            </form>
          ) : (
            /* Success screen invoice slip */
            <div className="flex flex-col items-center py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center animate-pulse border border-emerald-200">
                <CheckCircle className="w-10 h-10 stroke-[1.5]" />
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-2xl font-black text-stone-900 tracking-tight">Purchase Confirmed!</h2>
                <p className="text-xs text-stone-500 font-sans tracking-wide uppercase">
                  Thank you, <span className="text-stone-900 font-bold">{fullName}</span>. Your luxury parcel is being created!
                </p>
                <div className="font-mono text-[10.5px] bg-[#690027]/5 border border-[#690027]/20 text-[#690027] px-3 py-1.5 uppercase font-black inline-block mt-1">
                  Database Ticket: {generatedOrderId || 'ZLV-992019'}
                </div>
              </div>

              {/* Dynamic Invoice display */}
              <div className="w-full max-w-md bg-white border border-stone-200 p-5 rounded-sm space-y-4 text-left font-sans text-xs">
                <div className="flex justify-between items-center border-b pb-2.5 border-stone-100">
                  <span className="font-bold text-stone-900 tracking-wide uppercase text-[10px]">Client Transaction Receipt</span>
                  <span className="text-stone-500">{new Date().toLocaleDateString('en-IN')}</span>
                </div>

                <div className="space-y-2 py-1 select-none text-[11px] divide-y divide-stone-50">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start pt-1.5">
                      <span className="text-stone-600 flex-1 pr-6 leading-tight">
                        {item.product.name} ({item.selectedPolish}, Size {item.selectedSize}) <span className="font-bold text-[#690027]">x{item.quantity}</span>
                      </span>
                      <span className="font-bold text-stone-900">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals & gateway mapping */}
                <div className="space-y-2 pt-2.5 border-t border-dotted border-stone-200 text-[11px]">
                  <div className="flex justify-between text-stone-500">
                    <span>Cart Subtotal</span>
                    <span className="font-bold text-stone-900">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-green-700 bg-green-50/50 p-1 font-bold rounded-xs">
                      <span>Promo Discount Applied</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-500">
                    <span>Logistics Packaging &amp; Shipping</span>
                    <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                  </div>
                  <div className="flex justify-between text-[#690027] font-bold border-t border-stone-100 pt-2 text-sm">
                    <span>Amount Settle Completed</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Delivery particulars */}
                <div className="pt-3 border-t border-stone-100 text-[10px] text-stone-500 space-y-1">
                  <p className="font-bold text-stone-800 uppercase tracking-wide">Standard Courier Dispatched Code:</p>
                  <p className="font-semibold text-stone-900">{fullName}</p>
                  <p>{streetAddress}</p>
                  <p>{cityPlace} - {zipcodeValue}</p>
                  <p>Gateway Reference ID: {confirmedPaymentId}</p>
                </div>
              </div>

              <div className="flex justify-center items-center gap-2 p-3 bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-sans font-bold max-w-sm rounded-sm uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-green-700" />
                <span>925 Sterling standard with Certificate included</span>
              </div>

              <button
                onClick={handleFinish}
                className="w-full max-w-md bg-stone-900 hover:bg-black text-white py-3 px-6 text-xs font-sans font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                id="checkout-finalize-btn"
              >
                <Sparkles className="w-4 h-4 text-amber-400" /> Return to Catalog
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
