import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Star, 
  Award, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  X, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  MapPin, 
  Compass, 
  Briefcase, 
  Clock,
  ArrowRight,
  ThumbsUp,
  SlidersHorizontal,
  Gift,
  Instagram,
  Facebook,
  ArrowUpDown,
  Mail,
  Globe
} from 'lucide-react';
import { ActiveTab, Product, CartItem } from './types';
import { PRODUCTS, REVIEWS } from './data';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import GiftsTab from './components/GiftsTab';
import CartTab from './components/CartTab';
import CheckoutModal from './components/CheckoutModal';
import SupabaseAdminHub from './components/SupabaseAdminHub';
import { getProducts, getLastProductsSource } from './lib/supabase';
import OrderSuccessScreen from './components/OrderSuccessScreen';
import ForHerView from './components/ForHerView';
import DefaultHomeView from './components/DefaultHomeView';
import WishlistTab from './components/WishlistTab';

export default function App() {
  // Navigation & States
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Supabase Database Products
  const [allProducts, setAllProducts] = useState<Product[]>(PRODUCTS);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [productSource, setProductSource] = useState<'supabase' | 'local'>('local');
  
  // Cart state persisted in localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('zelvra_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('zelvra_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Search input and suggestions
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<'All' | 'rings' | 'earrings' | 'necklaces' | 'bracelets' | 'anklets'>('All');

  // Filtering category and polish on home catalog
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'rings' | 'earrings' | 'necklaces' | 'bracelets' | 'anklets'>('all');
  const [selectedPolish, setSelectedPolish] = useState<'all' | 'Silver' | 'Rose Gold' | 'Gold Plated'>('all');

  // New gifting filters (recipients and occasions)
  const [selectedRecipient, setSelectedRecipient] = useState<'all' | 'For Her' | 'For Him'>('all');
  const [selectedOccasion, setSelectedOccasion] = useState<'all' | 'Birthday' | 'Anniversary' | 'Others'>('all');

  // UI state for menus/notifiers
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCodeBanner, setCopiedCodeBanner] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Checkout overlay triggers
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState('');
  const [isAdminView, setIsAdminView] = useState(false);
  const [currentSessionOrder, setCurrentSessionOrder] = useState<any>(null);

  // Sorting and Interactive Curation menu states on homepage
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'bestsellers' | 'newest'>('default');

  // Local Sync
  useEffect(() => {
    localStorage.setItem('zelvra_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('zelvra_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Supabase/Local Catalog Loader
  const loadCatalogProducts = async (forceToast = false) => {
    setIsCatalogLoading(true);
    try {
      const items = await getProducts();
      setAllProducts(items);
      setProductSource(getLastProductsSource());
      if (forceToast) {
        showToast('✨ Catalog refreshed successfully from database!');
      }
    } catch (err: any) {
      console.warn("Supabase load failed:", err);
      setProductSource('local');
      if (forceToast) {
        showToast('⚠️ Database sync issue. Displaying standard backups.');
      }
    } finally {
      setIsCatalogLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    loadCatalogProducts();
  }, []);

  // Helper Toast
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Cart operations
  const handleAddToCart = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    const id = `${item.product.id}-${item.selectedPolish.replace(/\s+/g, '')}-${item.selectedSize.replace(/\s+/g, '')}`;
    
    setCart((prevCart) => {
      const exists = prevCart.find((i) => i.id === id);
      if (exists) {
        showToast(`Incremented "${item.product.name}" quantity inside your shopping bag.`);
        return prevCart.map((i) => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      showToast(`Added 1x "${item.product.name}" (${item.selectedPolish}) to your shopping bag.`);
      return [...prevCart, { ...item, id, quantity: 1 }];
    });
  };

  const handleAddToCartDirect = (product: Product) => {
    // Default config
    const defaultPolish = product.polishColors[0] || 'Silver';
    const defaultSize = product.category === 'rings' ? '7' : product.category === 'necklaces' ? '18 in' : 'Standard';
    
    handleAddToCart({
      product,
      selectedPolish: defaultPolish,
      selectedSize: defaultSize
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCart((prev) => prev.map((item) => item.id === cartItemId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    const matched = cart.find(i => i.id === cartItemId);
    if (matched) {
      showToast(`Removed "${matched.product.name}" from shopping bag.`);
    }
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    const isSaved = wishlist.some((item) => item.id === product.id);
    if (isSaved) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      showToast(`Removed "${product.name}" from your wishlist.`);
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`Saved "${product.name}" into your wishlist.`);
    }
  };

  // Filter and sort products for homepage catalog
  const filteredHomeProducts = useMemo(() => {
    let result = allProducts.filter((p) => {
      const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
      const polishMatch = selectedPolish === 'all' || p.polishColors.includes(selectedPolish);
      const recipientMatch = selectedRecipient === 'all' || (p.recipients && p.recipients.includes(selectedRecipient));
      const occasionMatch = selectedOccasion === 'all' || (p.occasions && p.occasions.includes(selectedOccasion));
      return categoryMatch && polishMatch && recipientMatch && occasionMatch;
    });

    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'bestsellers') {
      result = [...result].sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    return result;
  }, [allProducts, selectedCategory, selectedPolish, selectedRecipient, selectedOccasion, sortBy]);

  // Filter products for Search panel
  const searchedProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (p.recipients && p.recipients.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                           (p.occasions && p.occasions.some(o => o.toLowerCase().includes(searchQuery.toLowerCase())));
      const matchesCategory = searchCategory === 'All' || p.category === searchCategory;
      return matchesQuery && matchesCategory;
    });
  }, [allProducts, searchQuery, searchCategory]);

  const copyPromoToClipboard = (code: string, isBanner: boolean) => {
    navigator.clipboard.writeText(code);
    if (isBanner) {
      setCopiedCodeBanner(true);
      setTimeout(() => setCopiedCodeBanner(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
    showToast(`Promo code "${code}" copied! Input it inside your cart page.`);
  };

  // Checkout process trigger
  const handleCheckoutProceed = (discountPercent: number, code: string) => {
    setAppliedDiscountPercent(discountPercent);
    setAppliedPromoCode(code);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderData: {
    customerName: string;
    email: string;
    phone: string;
    items: string;
    totalAmount: number;
    paymentMethod: 'Google Pay' | 'PhonePe' | 'Paytm' | 'Credit Card' | 'COD';
  }) => {
    // Map items list before clearing the cart
    const itemsListMapped = cart.map(item => ({
      product: {
        name: item.product.name,
        image: item.product.image,
        price: item.product.price,
        description: item.product.description
      },
      quantity: item.quantity,
      selectedPolish: item.selectedPolish,
      selectedSize: item.selectedSize
    }));

    // Empty the cart
    setCart([]);
    setIsCheckoutOpen(false);

    let loggedOrder: any = null;

    // Sync to Shopify Simulated order feed in localStorage
    try {
      const savedOrders = localStorage.getItem('zelvra_shopify_orders');
      let currentOrders = savedOrders ? JSON.parse(savedOrders) : [];
      
      const newOrder = {
        id: `ZLV-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: orderData.customerName || 'Walk-in Patron',
        email: orderData.email || 'client@zelvra.com',
        phone: orderData.phone || '9988776655',
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        paymentGateway: 'Razorpay',
        paymentMethod: orderData.paymentMethod,
        paymentStatus: orderData.paymentMethod === 'COD' ? 'Pending' : 'Paid',
        shippingCarrier: 'None',
        shippingStatus: 'Processing',
        createdAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) + ' ' + new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        itemsList: itemsListMapped
      };

      loggedOrder = newOrder;
      currentOrders = [newOrder, ...currentOrders];
      localStorage.setItem('zelvra_shopify_orders', JSON.stringify(currentOrders));
    } catch (e) {
      console.error('Local order logging failure:', e);
    }

    if (loggedOrder) {
      setCurrentSessionOrder(loggedOrder);
    }

    // Direct path view to gorgeous custom OrderSuccessScreen Customer View
    setActiveTab('account');
    setIsAdminView(false);
    showToast('🎉 Order checkout complete! Instant webhook routed to Shopify database.');
  };

  return (
    <div className="min-h-screen bg-[#fbf9f7] text-[#1b1c1b] font-sans pb-20 relative selection:bg-primary/20 selection:text-primary">
      {/* Dynamic Toast feedback */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-tertiary text-white font-sans text-xs font-bold py-3 px-5 shadow-2.5xl flex items-center gap-2 tracking-wide rounded-sm border border-outline-variant animate-fade-in border-white/20 select-none">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Slide out navigation drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex" id="menu-drawer-wrapper">
          {/* Backdrop screen */}
          <div onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          
          {/* Content panel */}
          <div className="relative w-80 max-w-full bg-[#fbf9f7] h-full flex flex-col justify-between p-6 shadow-2xl animate-slide-right">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-outline-variant/40">
                <div className="flex flex-col">
                  <span className="font-serif text-xl tracking-[0.2em] font-bold text-on-surface">ZELVRA</span>
                  <span className="text-[7.5px] tracking-[0.4em] text-secondary -mt-1 uppercase font-bold">L u x u r y</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 hover:text-primary transition-colors cursor-pointer"
                  aria-label="Close menu drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation lists */}
              <nav className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant/70">Shop Collections</p>
                <div className="space-y-2.5">
                  {[
                    { id: 'all', label: 'All Jewelry Catalog' },
                    { id: 'rings', label: 'Rings & Bands' },
                    { id: 'earrings', label: 'Classic Studs & Loops' },
                    { id: 'necklaces', label: 'Artisan Necklaces' },
                    { id: 'bracelets', label: 'Dainty Chain Bracelets' },
                    { id: 'anklets', label: 'Royal Anklets' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id as any);
                        setActiveTab('home');
                        setIsMenuOpen(false);
                        const element = document.getElementById('bestsellers-section');
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="w-full text-left font-serif text-sm font-semibold hover:text-primary py-1.5 transition-colors flex justify-between items-center cursor-pointer"
                    >
                      <span>{cat.label}</span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  ))}
                </div>
              </nav>

              {/* Quality Standards */}
              <div className="pt-4 border-t border-outline-variant/40 space-y-3 font-sans">
                <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant/70">Authenticity Guarantee</p>
                <div className="space-y-2 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="font-semibold">925 Pure Hallmark Silver</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span className="font-semibold">6-Month Comprehensive Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="font-semibold">Lifetime Plating Assurance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar bottom signature */}
            <div className="space-y-2.5 pt-4 border-t border-outline-variant/40 font-sans text-xs">
              <div className="p-3 bg-primary/5 rounded-xs border border-primary/10">
                <span className="font-bold text-[#690027] text-[10.5px]">Claim Flat 25% Off !</span>
                <p className="text-[10px] mt-1 text-on-surface-variant leading-relaxed">
                  Apply promotion code <span className="font-bold underline text-primary">SILVER25</span> during checkout inside your shopping bag.
                </p>
              </div>
              <p className="text-[9.5px] text-on-surface-variant/60 text-center">
                © 2206-2026 ZELVRA Limited Corp. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header 
        productSource={productSource}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} 
        wishlistCount={wishlist.length}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        openMenu={() => setIsMenuOpen(true)}
        onSearchClick={() => {
          setActiveTab('search');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Tab Switcher Frame */}
      {activeTab === 'home' && (
        selectedRecipient === 'For Her' ? (
          <ForHerView
            filteredHomeProducts={filteredHomeProducts}
            wishlist={wishlist}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPolish={selectedPolish}
            setSelectedPolish={setSelectedPolish}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            selectedOccasion={selectedOccasion}
            setSelectedOccasion={setSelectedOccasion}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
            isSortOpen={isSortOpen}
            setIsSortOpen={setIsSortOpen}
            sortBy={sortBy}
            setSortBy={setSortBy}
            copiedCodeBanner={copiedCodeBanner}
            copyPromoToClipboard={copyPromoToClipboard}
            setSelectedProduct={setSelectedProduct}
            handleToggleWishlist={handleToggleWishlist}
            handleAddToCartDirect={handleAddToCartDirect}
            showToast={showToast}
          />
        ) : (
          <DefaultHomeView
            filteredHomeProducts={filteredHomeProducts}
            wishlist={wishlist}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPolish={selectedPolish}
            setSelectedPolish={setSelectedPolish}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            selectedOccasion={selectedOccasion}
            setSelectedOccasion={setSelectedOccasion}
            copiedCodeBanner={copiedCodeBanner}
            copyPromoToClipboard={copyPromoToClipboard}
            setSelectedProduct={setSelectedProduct}
            handleToggleWishlist={handleToggleWishlist}
            handleAddToCartDirect={handleAddToCartDirect}
            showToast={showToast}
          />
        )
      )}

      {/* SEARCH SYSTEM WITH LIVE RECOMMENDATIONS */}
      {activeTab === 'search' && (
        <div className="max-w-6xl mx-auto px-4 py-8 pb-24 animate-fade-in font-sans">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="font-serif text-3xl font-bold text-on-surface">Search Catalog</h2>
            <p className="text-xs text-on-surface-variant mt-1 tracking-wide uppercase">
              Explore 10 Handcrafted Masterpieces — 0% Making charges
            </p>
            <div className="w-12 h-1 bg-primary mt-2 mx-auto sm:mx-0" />
          </div>

          {/* Search form controls */}
          <div className="max-w-xl mx-auto mb-10 space-y-3 bg-white p-5 border border-outline-variant/40 rounded-sm shadow-sm">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-on-surface-variant/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rings, studs, solitaire, necklaces..."
                className="w-full bg-[#fbf9f7] border border-outline-variant/60 rounded-xs pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-primary font-medium"
                id="search-input-field"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant/80 hover:text-primary font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter suggestion chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-on-surface-variant/80 font-bold uppercase text-[10px] tracking-wide mr-1 select-none">Group:</span>
              {(['All', 'rings', 'earrings', 'necklaces', 'bracelets', 'anklets'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSearchCategory(cat);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1 rounded-sm border transition-all text-[11px] cursor-pointer ${
                    searchCategory === cat
                      ? 'bg-primary border-primary text-white font-bold'
                      : 'border-outline-variant/50 hover:border-on-surface-variant text-on-surface-variant bg-[#fbf9f7]'
                  }`}
                  id={`search-chip-${cat}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Live Helper text suggestions */}
            {searchQuery === '' && (
              <div className="text-[10px] text-on-surface-variant/70 pt-1 text-left">
                💡 <span className="font-bold">Trending terms:</span> <button onClick={() => setSearchQuery('Diamond')} className="underline hover:text-primary font-bold">Diamond</button>, <button onClick={() => setSearchQuery('Studs')} className="underline hover:text-primary font-bold">Studs</button>, <button onClick={() => setSearchQuery('Cuff')} className="underline hover:text-primary font-bold">Cuff</button>, <button onClick={() => setSearchQuery('Verdant')} className="underline hover:text-primary font-bold">Verdant</button>
              </div>
            )}
          </div>

          {/* Searched Results Display Grid */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-on-surface-variant border-b pb-2">
              Catalog Search results ({searchedProducts.length} matching)
            </h3>

            {searchedProducts.length === 0 ? (
              <div className="text-center py-12 bg-white border border-dashed border-outline-variant/50 rounded-sm">
                <p className="text-xs text-on-surface-variant">We couldn't locate any ZELVRA jewelry piece matching your query.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSearchCategory('All');
                  }}
                  className="mt-3 text-xs text-primary font-black uppercase tracking-wider underline hover:text-[#8a1b3c]"
                >
                  Reset parameters &amp; view all
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {searchedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelect={(prod) => setSelectedProduct(prod)}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlist.some((item) => item.id === p.id)}
                    onAddToCartDirect={handleAddToCartDirect}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* GIFTS PORTAL VIEW */}
      {activeTab === 'gifts' && (
        <GiftsTab
          wishlist={wishlist}
          allProducts={allProducts}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCartDirect={handleAddToCartDirect}
          onExploreCollections={() => {
            setActiveTab('home');
            window.scrollTo({ top: 300, behavior: 'smooth' });
          }}
          onSelectRecipient={(recipient) => {
            if (recipient === 'For Her') {
              setSelectedRecipient('For Her');
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* WISHLIST VIEW */}
      {activeTab === 'wishlist' && (
        <WishlistTab
          wishlist={wishlist}
          onSelectProduct={(prod) => setSelectedProduct(prod)}
          onToggleWishlist={handleToggleWishlist}
          onAddToCartDirect={handleAddToCartDirect}
          onExploreCollections={() => {
            setActiveTab('home');
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
        />
      )}

      {/* SHOPPING BAG / CART VIEW */}
      {activeTab === 'cart' && (
        <CartTab
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveItem={handleRemoveCartItem}
          onExploreCollections={() => {
            setActiveTab('home');
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
          onProceedToCheckout={handleCheckoutProceed}
        />
      )}

      {/* ACCOUNT & FIDELITY TAB */}
      {activeTab === 'account' && (
        isAdminView ? (
          <SupabaseAdminHub 
            onBackToStore={() => {
              setIsAdminView(false);
              loadCatalogProducts(true);
            }}
            onRefreshProducts={() => {
              loadCatalogProducts(false);
            }}
          />
        ) : currentSessionOrder ? (
          <OrderSuccessScreen
            order={currentSessionOrder}
            onContinueShopping={() => {
              setCurrentSessionOrder(null);
              setActiveTab('home');
              window.scrollTo({ top: 300, behavior: 'smooth' });
            }}
            onTrackOrder={() => {
              setIsAdminView(true);
              showToast('🔍 Switched to Database Admin Portal. Checking your order logs.');
            }}
            onViewInvoice={() => {
              alert(`📄 INSTANT DIGITAL INVOICE RECEIPT\n--------------------------------\nOrder: ${currentSessionOrder.id || 'N/A'}\nCustomer: ${currentSessionOrder.customerName}\nContact: ${currentSessionOrder.phone} | ${currentSessionOrder.email}\nDate: ${currentSessionOrder.createdAt || new Date().toLocaleDateString()}\nGateway: Razorpay (Simulated)\nStatus: Paid\nTotal Amount: ₹${currentSessionOrder.totalAmount.toLocaleString('en-IN')}\n\nAn e-invoice receipt has been dispatched to ${currentSessionOrder.email}. Thank you for choosing ZELVRA!`);
            }}
          />
        ) : (
          <div className="max-w-4xl mx-auto px-4 py-8 pb-24 animate-fade-in font-sans">
            <div className="mb-8 text-center sm:text-left">
              <h2 className="font-serif text-3xl font-bold text-on-surface">Your Account Index</h2>
              <p className="text-xs text-on-surface-variant mt-1 tracking-wide uppercase">
                Authenticated Member Portal — ZELVRA Gold &amp; Silver Network
              </p>
              <div className="w-12 h-1 bg-primary mt-2 mx-auto sm:mx-0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* User Profile Summary */}
              <div className="bg-white border border-outline-variant/40 p-6 rounded-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold font-serif select-none">
                  Z
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">Honorary Member</h3>
                  <p className="text-xs text-on-surface-variant">Membership level: VIP Platinum Card</p>
                </div>
                <div className="p-3 bg-[#fdfbf9] rounded-xs text-[10px] text-stone-600 border border-stone-200/50 leading-relaxed">
                  🎟️ Enjoy <span className="font-bold text-[#690027]">0% making charges</span> plus secure insured delivery for all fine products.
                </div>

                {/* Supabase Dynamic Admin Hub Direct Trigger */}
                <div className="pt-3 border-t border-outline-variant/30 space-y-2">
                  <div className="text-[10px] font-sans font-black text-amber-600 uppercase tracking-widest flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Supabase Database Panel
                  </div>
                  <button
                    onClick={() => {
                      setIsAdminView(true);
                      showToast('📂 Switched to Supabase Admin Hub & Razorpay Gateway Controls');
                    }}
                    className="w-full cursor-pointer bg-stone-950 hover:bg-black text-white text-[10.5px] font-sans font-extrabold uppercase tracking-widest py-3 px-3 shadow-sm transition-all rounded-xs hover:shadow-md active:scale-95 border border-stone-800"
                    id="supabase-hub-btn"
                  >
                    Supabase Admin Portal ⚙️
                  </button>
                  <p className="text-[8px] text-neutral-400 font-medium font-mono">Manage products catalog, view incoming transaction logs &amp; setup key credentials.</p>
                </div>

                {/* Personal Concierge Services */}
                <div className="pt-4 border-t border-outline-variant/30 space-y-3.5 text-center">
                  <p className="text-[10px] font-sans font-extrabold text-[#690027] uppercase tracking-widest">
                    Signature Concierge
                  </p>
                  <div className="text-[11px] text-stone-600 space-y-2 leading-relaxed">
                    <p>Have questions about your pure 925 silver jewelry or want a custom design?</p>
                    <div className="text-stone-800 font-semibold">💎 Email: concierge@zelvra.com</div>
                    <div className="text-[#690027] font-semibold">📞 VIP Line: +91 98704 21194</div>
                  </div>
                  <button
                    onClick={() => {
                      showToast('✨ Connected to Zelvra Customization Suite. Setting up design session...');
                    }}
                    className="w-full cursor-pointer bg-[#690027] hover:bg-[#830a38] text-white text-[10.5px] font-sans font-bold uppercase tracking-wider py-2.5 px-3 transition-all rounded-md"
                  >
                    Custom Care Service
                  </button>
                  <p className="text-[8px] text-neutral-400 font-medium">Bespoke laser engraving, ring sizing, and purity certificate verification request.</p>
                </div>

                {/* VIP Order History Simulator */}
                <div className="pt-4 border-t border-outline-variant/30 space-y-2 text-center">
                  <p className="text-[9px] font-sans font-extrabold text-neutral-400 uppercase tracking-widest">
                    Active Curation Review
                  </p>
                  <button
                    onClick={() => {
                      const demoOrder = {
                        id: 'ZLV-82910',
                        customerName: 'Shivank Pandey',
                        email: 'shivankpandey23@gmail.com',
                        phone: '9870421194',
                        items: 'Solitaire Silver Ring (Size: 12) x 1',
                        totalAmount: 4499,
                        createdAt: new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) + ' 12:35 PM',
                        itemsList: [
                          {
                            product: {
                              name: 'Solitaire Silver Ring',
                              image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
                              price: 4499,
                              description: 'Solitaire Sterling Silver 925 Fine Ring'
                            },
                            quantity: 1,
                            selectedPolish: 'Rose Gold',
                            selectedSize: '12'
                          }
                        ]
                      };
                      setCurrentSessionOrder(demoOrder);
                      showToast('📂 Loaded recent VIP order receipt details.');
                    }}
                    className="w-full cursor-pointer bg-white hover:bg-neutral-50 text-[#690027] text-[10.5px] font-sans font-bold uppercase tracking-wider py-2.5 px-3 transition-all rounded-md border border-[#ddbfc3]"
                  >
                    View Mock Purchase Receipt 📑
                  </button>
                  <p className="text-[8px] text-neutral-400 font-medium">Review your custom silver order breakdown and download invoice receipt drafts.</p>
                </div>
              </div>

              {/* Order status tracking indices */}
              <div className="md:col-span-2 space-y-6">
                {/* Order Lists simulation */}
                <div className="bg-white border border-outline-variant/40 p-5 rounded-sm space-y-4 text-left">
                  <h3 className="font-serif text-base font-bold text-on-surface border-b pb-1.5 border-outline-variant/30">
                    Recent Packages &amp; Transactions
                  </h3>
                  
                  {/* Empty trace index */}
                  <div className="py-6 text-center space-y-1">
                    <Compass className="w-8 h-8 text-outline-variant/80 mx-auto stroke-[1.25]" />
                    <p className="text-xs text-on-surface-variant font-medium pt-1">No active jewelry shipments inside current tracking stream.</p>
                    <p className="text-[10px] text-on-surface-variant/70">Ensure valid checkout procedures are fulfilled prior to lookup.</p>
                  </div>
                </div>

                {/* VIP membership promos code console */}
                <div className="bg-white border border-outline-variant/40 p-5 rounded-sm space-y-3.5">
                  <h3 className="font-serif text-base font-bold text-on-surface border-b pb-1.5 border-outline-variant/30 flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-primary" /> Active Promotional Codes Vault
                  </h3>

                  <div className="space-y-2 text-xs">
                    {[
                      { code: 'SILVER25', percent: 25, label: 'FLAT 25% OFF Silver Affair Collection' },
                      { code: 'GOLDY10', percent: 10, label: 'FLAT 10% OFF Special Gold-Tone Polishes' }
                    ].map((prm) => (
                      <div key={prm.code} className="flex justify-between items-center p-3 bg-[#fbf9f7] border border-[#E7E5E4]">
                        <div>
                          <span className="font-sans font-extrabold text-on-surface text-xs bg-neutral-100 px-2 py-0.5 rounded-sm border border-neutral-300 mr-2 uppercase">
                            {prm.code}
                          </span>
                          <span className="text-on-surface font-semibold">{prm.label}</span>
                        </div>
                        <button
                          onClick={() => {
                            copyPromoToClipboard(prm.code, false);
                          }}
                          className="text-xs text-[#690027] hover:underline uppercase tracking-wider font-extrabold font-sans cursor-pointer"
                          id={`vault-copy-${prm.code}`}
                        >
                          Copy Code
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* GLOBAL FOOTER */}
      <footer className="bg-surface-container-highest flex flex-col items-center text-center p-8 space-y-6 pb-28 pt-10 select-none">
        {/* Grayscale signature Logo */}
        <div className="flex flex-col items-center opacity-70">
          <span className="font-serif text-2xl tracking-[0.25em] font-bold text-[#1b1c1b]">ZELVRA</span>
          <span className="text-[7.5px] tracking-[0.4em] text-[#7e5446] -mt-1 font-sans font-black">L U X U R Y</span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2.5 max-w-lg text-[11px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/80">
          <a href="#" onClick={(e) => {e.preventDefault(); alert("Shipping is FREE on orders above ₹1,000. Under ₹1,000, flat ₹150 delivery fee is applied. Ships in 2-3 business days.");}} className="hover:text-primary transition-colors">Shipping &amp; Returns</a>
          <a href="#" onClick={(e) => {e.preventDefault(); alert("We respect personal privacy strictly. Secure transactions processed with zero external card persistence.");}} className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" onClick={(e) => {e.preventDefault(); alert("Zelvra Corporation, Support: care@zelvra.com, Mobile: +91 1800-419-2100 (toll free).");}} className="hover:text-primary transition-colors">Contact Support</a>
          <a href="#" onClick={(e) => {e.preventDefault(); alert("Our components carry standard 6-Month comprehensive protective warranty covering plating fading.");}} className="hover:text-primary transition-colors">Lifetime Plating Warranty</a>
          <a href="#" onClick={(e) => {e.preventDefault(); alert("Corporate Head: 102 First Floor, Beverly Boulevard, Gurgaon, Haryana, India.");}} className="hover:text-primary transition-colors">Store Locator</a>
        </div>

        <div className="w-full max-w-sm h-[1px] bg-outline-variant/50 my-2" />

        {/* Brand visual coordinates */}
        <p className="text-[11.5px] font-serif text-on-surface-variant/85 italic max-w-md leading-relaxed">
          "The Silver Affair: masterfully constructed geometric structures designed to reflect stellar beauty."
        </p>

        <p className="text-[10px] text-on-surface-variant/60 font-sans tracking-wide">
          © 2026 ZELVRA Luxury Jewelry Ltd. All Rights Reserved. Accredited 925 Hallmark certification.
        </p>
      </footer>

      {/* Floating Bottom Navigator */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
      />

      {/* Global Product Detail Sheet Overlay */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.some(item => item.id === selectedProduct.id)}
        />
      )}

      {/* Secure Checkout Wizard Overlay */}
      {isCheckoutOpen && (
        <CheckoutModal
          cart={cart}
          discountPercent={appliedDiscountPercent}
          promoCode={appliedPromoCode}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}
    </div>
  );
}
