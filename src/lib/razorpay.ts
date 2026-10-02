// Razorpay dynamic loader and checkout initiator

// Get configuration overrides from local storage or environment
const KEY_ID_STORE_KEY = 'zelvra_razorpay_key_id';

export function getRazorpayKeyId(): string {
  // Read either custom user-supplied key or use standard sandbox test key
  return localStorage.getItem(KEY_ID_STORE_KEY) || ((import.meta as any).env.VITE_RAZORPAY_KEY_ID as string) || 'rzp_test_eG7X3t2F8M19pq';
}

export function saveRazorpayKeyId(keyId: string) {
  if (keyId) {
    localStorage.setItem(KEY_ID_STORE_KEY, keyId);
  } else {
    localStorage.removeItem(KEY_ID_STORE_KEY);
  }
}

// Dynamically inject Razorpay's Official Checkout Script
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

export interface RazorpayCheckoutOptions {
  amount: number; // in standard units, e.g. 1999 INR (will be converted to paise: 199900)
  currency?: string;
  description?: string;
  prefill?: RazorpayPrefill;
  notes?: Record<string, string>;
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<RazorpayResponse> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
  }

  const keyId = getRazorpayKeyId();
  const themeColor = '#690027'; // Brand's custom fine burgundy accent tint

  return new Promise((resolve, reject) => {
    const rzpOptions = {
      key: keyId,
      amount: Math.round(options.amount * 100), // Converted to Paise
      currency: options.currency || 'INR',
      name: 'Zelvra Storefront',
      description: options.description || 'Secure Luxury Purchase',
      image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=100&auto=format&fit=crop&q=80',
      handler: function (response: RazorpayResponse) {
        if (response.razorpay_payment_id) {
          resolve(response);
        } else {
          reject(new Error('Payment was authorized but payment transaction ID is missing.'));
        }
      },
      prefill: {
        name: options.prefill?.name || '',
        email: options.prefill?.email || '',
        contact: options.prefill?.contact || '',
      },
      notes: options.notes || {},
      theme: {
        color: themeColor,
      },
      modal: {
        ondismiss: function () {
          reject(new Error('Payment window closed by user.'));
        },
      },
    };

    try {
      const rzp = new (window as any).Razorpay(rzpOptions);
      rzp.open();
    } catch (err: any) {
      reject(new Error(`Failed to open Razorpay modal: ${err.message}`));
    }
  });
}
