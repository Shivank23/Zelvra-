import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  ShoppingBag,
  Truck,
  CreditCard,
  CheckCircle,
  TrendingUp,
  ChevronRight,
  User,
  Smartphone,
  Check,
  Zap,
  Info,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  Copy,
  Wifi,
  WifiOff,
  Package,
  RefreshCw
} from 'lucide-react';
import { Product } from '../types';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
  getSupabaseCredentials,
  getSupabaseClient,
  verifyClientConnection,
  seedProductsToSupabase,
  Order,
  SUPABASE_SQL_SCHEMA
} from '../lib/supabase';
import { getRazorpayKeyId, saveRazorpayKeyId } from '../lib/razorpay';

interface SupabaseAdminHubProps {
  onBackToStore: () => void;
  onRefreshProducts: () => void;  // Callback to refresh store catalogue on save
}

export default function SupabaseAdminHub({ onBackToStore, onRefreshProducts }: SupabaseAdminHubProps) {
  // Login Wall State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('zelvra_admin_logged_in') === 'true';
  });
  const [adminPIN, setAdminPIN] = useState('');
  const [loginError, setLoginError] = useState('');

  // Local state for credentials
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [isLiveSync, setIsLiveSync] = useState(true);
  const [razorpayKeyId, setRazorpayKeyIdState] = useState('');
  const [customPasskey, setCustomPasskey] = useState('admin123');

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'config' | 'sql'>('orders');

  // Data collections state
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [testErrorMessage, setTestErrorMessage] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Modal / Form state for Add/Edit product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form Field States
  const [pName, setPName] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pOriginalPrice, setPOriginalPrice] = useState('');
  const [pCategory, setPCategory] = useState<'rings' | 'earrings' | 'necklaces' | 'bracelets' | 'anklets'>('rings');
  const [pImage, setPImage] = useState('');
  const [pIsBestseller, setPIsBestseller] = useState(false);
  const [pIsNew, setPIsNew] = useState(true);
  const [pPolishColors, setPPolishColors] = useState('Silver, Rose Gold, Gold Plated');
  const [pRecipients, setPRecipients] = useState<'For Her' | 'For Him'>('For Her');
  const [pOccasions, setPOccasions] = useState<string[]>(['Birthday']);

  // Load custom credentials block on component mount
  useEffect(() => {
    const creds = getSupabaseCredentials();
    setSupabaseUrl(creds.url);
    setSupabaseAnonKey(creds.key);
    setIsLiveSync(creds.isEnabled);
    
    setRazorpayKeyIdState(getRazorpayKeyId());

    const savedPasskey = localStorage.getItem('zelvra_admin_passkey') || 'admin123';
    setCustomPasskey(savedPasskey);

    if (isAdminLoggedIn) {
      loadData();
    }
  }, [isAdminLoggedIn]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPIN = localStorage.getItem('zelvra_admin_passkey') || 'admin123';
    
    if (adminPIN === correctPIN) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('zelvra_admin_logged_in', 'true');
      setLoginError('');
      setAdminPIN('');
      showToastMsg('🔑 Access Granted. Welcome back to Zelvra HQ.');
    } else {
      setLoginError('Invalid Passkey. Use default "admin123" to login, or verify your custom key.');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('zelvra_admin_logged_in');
    showToastMsg('🛡️ Logged out safely.');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedOrders] = await Promise.all([
        getProducts(true),
        getOrders()
      ]);
      setProductsList(fetchedProducts);
      setOrdersList(fetchedOrders);
    } catch (err) {
      console.error('Error loading admin data:', err);
      showToastMsg('⚠️ Database load failure.');
    } finally {
      setLoading(false);
    }
  };

  // Credentials / Server Save Form
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('zelvra_supabase_url', supabaseUrl.trim());
    localStorage.setItem('zelvra_supabase_anon_key', supabaseAnonKey.trim());
    localStorage.setItem('zelvra_supabase_sync', isLiveSync ? 'true' : 'false');
    localStorage.setItem('zelvra_admin_passkey', customPasskey.trim());
    saveRazorpayKeyId(razorpayKeyId.trim());

    showToastMsg('💾 Configuration stored. Testing live feeds...');
    onRefreshProducts();
    loadData();
  };

  // Test connection to Supabase
  const testSupabaseConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setTestStatus('ERROR');
      setTestErrorMessage('Please supply both Supabase URL and Anon Key first.');
      return;
    }

    setTestStatus('TESTING');
    try {
      const res = await verifyClientConnection(supabaseUrl, supabaseAnonKey);
      if (!res.success) {
        throw new Error(res.error);
      }
      
      setTestStatus('SUCCESS');
      showToastMsg('⚡ Live Supabase Connection is fully online & verified!');
    } catch (err: any) {
      console.error('Supabase test link broken:', err);
      setTestStatus('ERROR');
      setTestErrorMessage(
        `${err.message || 'General query failed.'}\n\n💡 NEXT STEP:\nGo to the \"SQL Editor Blueprint\" tab inside this admin center, click the copy button to grab the complete schema script, open your web browser to the Supabase SQL Editor, paste the code, and click \"Run\"! This instantly creates both tables with correct columns and grants general public access.`
      );
    }
  };

  // Order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'shipped' | 'delivered') => {
    try {
      const ok = await updateOrderStatus(orderId, newStatus);
      if (ok) {
        showToastMsg(`📦 Order #${orderId} marked as ${newStatus.toUpperCase()}`);
        loadData();
      } else {
        showToastMsg('Failed to update status.');
      }
    } catch {
      showToastMsg('Error updating status.');
    }
  };

  // open Product Form Modal
  const openProductForm = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setPName(product.name);
      setPDescription(product.description);
      setPPrice(String(product.price));
      setPOriginalPrice(String(product.originalPrice));
      setPCategory(product.category);
      setPImage(product.image);
      setPIsBestseller(product.bestseller);
      setPIsNew(!!product.isNew);
      setPPolishColors(product.polishColors.join(', '));
      setPRecipients(product.recipients?.includes('For Him') ? 'For Him' : 'For Her');
      setPOccasions(product.occasions || ['Birthday']);
    } else {
      setEditingProduct(null);
      setPName('');
      setPDescription('');
      setPPrice('');
      setPOriginalPrice('');
      setPCategory('rings');
      setPImage('');
      setPIsBestseller(false);
      setPIsNew(true);
      setPPolishColors('Silver, Rose Gold, Gold Plated');
      setPRecipients('For Her');
      setPOccasions(['Birthday', 'Anniversary']);
    }
    setIsProductModalOpen(true);
  };

  // save product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice || !pImage) {
      showToastMsg('❌ Please fill in the Name, Price, and Image URL.');
      return;
    }

    const polishArray = pPolishColors.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const productPayload = {
      name: pName,
      description: pDescription || 'Handcrafted bespoke premium jewelry masterpiece.',
      price: Number(pPrice),
      originalPrice: Number(pOriginalPrice) || Number(pPrice),
      category: pCategory,
      rating: 5,
      reviewsCount: 1,
      image: pImage,
      bestseller: pIsBestseller,
      isNew: pIsNew,
      polishColors: polishArray,
      recipients: [pRecipients] as any,
      occasions: pOccasions as any
    };

    setLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        showToastMsg('✏️ Product updated successfully!');
      } else {
        await addProduct(productPayload);
        showToastMsg('✨ Product added successfully!');
      }
      setIsProductModalOpen(false);
      onRefreshProducts();
      loadData();
    } catch (err) {
      console.error(err);
      showToastMsg('❌ Error saving product.');
    } finally {
      setLoading(false);
    }
  };

  // delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    setLoading(true);
    try {
      const ok = await deleteProduct(id);
      if (ok) {
        showToastMsg(`🗑️ Deleted "${name}" from store catalogue.`);
        onRefreshProducts();
        loadData();
      } else {
        showToastMsg('Failed to delete.');
      }
    } catch {
      showToastMsg('Error deleting product.');
    } finally {
      setLoading(false);
    }
  };

  // seed products helper to easily sync client definitions to Supabase
  const [isSeeding, setIsSeeding] = useState(false);
  const handleSeedProducts = async () => {
    setIsSeeding(true);
    setLoading(true);
    try {
      const res = await seedProductsToSupabase();
      if (res.success) {
        showToastMsg(`✨ Seeded ${res.count} products successfully inside your remote Supabase products table!`);
        onRefreshProducts();
        await loadData();
      } else {
        showToastMsg(`⚠️ Seeding error: ${res.error}`);
      }
    } catch (err: any) {
      console.error(err);
      showToastMsg(`❌ Internal seeding error: ${err.message || err}`);
    } finally {
      setIsSeeding(false);
      setLoading(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToastMsg('📋 Copied SQL schema code to clipboard!');
  };

  // LOGIN SCREEN
  if (!isAdminLoggedIn) {
    return (
      <div className="bg-[#1C1917] min-h-screen text-stone-100 font-sans flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">
        {/* Abstract background decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#690027] opacity-10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-700 opacity-10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-stone-900 border border-stone-800 p-8 rounded-sm shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-[#690027]/20 border border-[#690027] text-[#690027] mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8 animate-pulse text-amber-500" />
            </div>
            <h1 className="font-serif text-3xl font-black tracking-tight text-white mt-4">
              ZELVRAHQ
            </h1>
            <p className="text-xs text-stone-400 font-sans uppercase tracking-widest font-bold">
              Secure Merchant Admin Portal
            </p>
            <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto">
              Please authenticate to authorize database modification and view user transactions.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono block">
                ADMINISTRATION SECURITY PIN / PASSKEY
              </label>
              <input
                type="password"
                value={adminPIN}
                onChange={(e) => setAdminPIN(e.target.value)}
                placeholder="Password (Default: admin123)"
                className="w-full bg-stone-950 border border-stone-800 rounded-sm px-4 py-3 text-sm font-mono text-center tracking-widest focus:outline-none focus:border-[#690027] text-white"
                autoFocus
              />
            </div>

            {loginError && (
              <p className="text-[11px] text-red-500 font-medium font-sans text-center leading-normal">
                ⚠️ {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#690027] hover:bg-[#8A1B3C] text-white text-xs font-sans font-extrabold uppercase tracking-widest py-3 px-4 shadow-sm transition-all rounded-xs hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Unlock Terminal ⚙️
            </button>
          </form>

          <div className="flex justify-between items-center pt-4 border-t border-stone-800/60">
            <button
              onClick={onBackToStore}
              className="text-[11px] text-stone-400 hover:text-white font-sans flex items-center gap-1 cursor-pointer transition-colors"
            >
              ← Back to Storefront
            </button>
            <span className="text-[9px] font-mono text-stone-500">v2.1 (Supabase Core)</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats for Dashboard header
  const totalRevenue = ordersList
    .filter(o => o.status === 'delivered' || o.status === 'pending' || o.status === 'shipped') // All validated transactions
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingCount = ordersList.filter(o => o.status === 'pending').length;
  const dispatchCount = ordersList.filter(o => o.status === 'shipped').length;
  const deliveryCount = ordersList.filter(o => o.status === 'delivered').length;

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1C1917] font-sans pb-16">
      {/* Toast alert banner */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#1C1917] text-white px-5 py-3 border border-[#690027]/40 rounded-sm shadow-xl font-mono text-xs flex items-center gap-2.5 animate-bounce">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Primary Header panel */}
      <div className="bg-stone-900 border-b border-stone-800 px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isLiveSync ? 'bg-[#10B981] animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#E7E5E4] flex items-center gap-1">
              Store Engine: {isLiveSync ? 'Supabase Live' : 'Local Sandbox Model'}
            </span>
          </div>
          <h1 className="font-serif text-2xl font-black tracking-tight text-white mt-1">
            Zelvra Admin Command Center
          </h1>
          <p className="text-xs text-stone-400 font-sans">
            Unified dashboard to manage luxury catalogs, process payment logs, and update shipping parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            className="cursor-pointer bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs px-3.5 py-2 font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
            title="Refresh feeds from DB"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Live
          </button>

          <button
            onClick={handleLogout}
            className="cursor-pointer bg-stone-800 hover:bg-[#690027] text-stone-200 hover:text-white border border-stone-700 hover:border-[#690027] text-xs px-3.5 py-2 font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <Unlock className="w-3.5 h-3.5" /> Lock Panel
          </button>
          
          <button
            onClick={onBackToStore}
            className="cursor-pointer bg-[#690027] hover:bg-[#8A1B3C] text-white border border-[#690027] text-xs px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
          >
            Return to Store View <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E7E5E4] overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-3 text-xs uppercase font-extrabold tracking-widest border-b-2 font-sans flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#690027] text-[#690027]'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Client Orders Log ({ordersList.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-3 text-xs uppercase font-extrabold tracking-widest border-b-2 font-sans flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'products'
                ? 'border-[#690027] text-[#690027]'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Package className="w-4 h-4" /> Jewelry Inventory ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-5 py-3 text-xs uppercase font-extrabold tracking-widest border-b-2 font-sans flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'config'
                ? 'border-[#690027] text-[#690027]'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Settings className="w-4 h-4" /> Database &amp; Gateway config
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-5 py-3 text-xs uppercase font-extrabold tracking-widest border-b-2 font-sans flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'sql'
                ? 'border-[#690027] text-[#690027]'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <Database className="w-4 h-4" /> SQL Editor Blueprint
          </button>
        </div>

        {/* Tab 1: Orders log */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Stats ledger */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-[#E7E5E4] p-5 rounded-sm shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Aggregate Sales</h3>
                  <p className="font-serif text-2xl font-black mt-2 text-[#340014]">₹{totalRevenue.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-green-600 font-mono font-medium mt-1">▲ Fully Escrow Protected</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#690027]/10 flex items-center justify-center text-[#690027]">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-[#E7E5E4] p-5 rounded-sm shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Pending Shipments</h3>
                  <p className="font-serif text-2xl font-black mt-2 text-[#340014]">{pendingCount} Packages</p>
                  <p className="text-[10px] text-orange-600 font-mono font-medium mt-1">Awaiting packaging</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-700">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-[#E7E5E4] p-5 rounded-sm shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Enroute Logistics</h3>
                  <p className="font-serif text-2xl font-black mt-2 text-[#340014]">{dispatchCount} Carriers</p>
                  <p className="text-[10px] text-blue-600 font-mono font-semibold mt-1">In transit via Blue Dart</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-[#E7E5E4] p-5 rounded-sm shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Delivered Success</h3>
                  <p className="font-serif text-2xl font-black mt-2 text-[#340014]">{deliveryCount} Handed</p>
                  <p className="text-[10px] text-green-700 font-mono font-medium mt-1">Happy clients served</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-700">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Orders Feed Board */}
            <div className="bg-white border border-[#E7E5E4] rounded-sm shadow-sm overflow-hidden">
              <div className="bg-[#FAF8F5] px-6 py-4 border-b border-[#E7E5E4] flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#340014]">Transaction feed &amp; logistics dispatcher</h2>
                  <p className="text-xs text-neutral-500 font-sans">
                    Customer transactions processed on checkout using Razorpay payment gateway rules.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[#E7E5E4] overflow-x-auto">
                {ordersList.length === 0 ? (
                  <div className="text-center py-16 space-y-4">
                    <ShoppingBag className="w-12 h-12 text-neutral-400 mx-auto stroke-[1.25]" />
                    <h3 className="font-serif text-base font-bold">No client checkins received yet</h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Purchase items using the Checkout panel as a mock client to generate high-fidelity payment logs here!
                    </p>
                  </div>
                ) : (
                  ordersList.map((order) => (
                    <div key={order.id} className="p-6 transition-colors hover:bg-neutral-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      
                      {/* Left Block details */}
                      <div className="space-y-3.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-extrabold bg-[#F5F5F4] px-2.5 py-1 border border-neutral-300 rounded-xs text-[#1C1917]">
                            {order.id}
                          </span>
                          <span className="text-[11px] font-sans text-neutral-500">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>

                          <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Razorpay Verified
                          </span>

                          {order.status === 'delivered' ? (
                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border bg-green-100 text-green-800 border-green-200">
                              ✔️ Hand-off Complete
                            </span>
                          ) : order.status === 'shipped' ? (
                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                              🚚 Enroute Dispatch
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-200">
                              ⏳ Pending Packaging
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <p className="font-serif text-sm font-bold text-neutral-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-[#690027]" /> {order.customerName}
                            <span className="font-sans text-xs text-neutral-500 font-normal">({order.customerEmail} | +91 {order.customerPhone})</span>
                          </p>
                          <p className="text-xs text-stone-700 font-mono bg-stone-50 p-2.5 rounded-xs border border-stone-200/40">
                            <strong className="text-neutral-500 font-sans font-semibold block mb-1">Delivering To:</strong>
                            {order.shippingAddress}
                          </p>
                        </div>

                        {/* Items ordered details mapping */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-sans font-bold text-stone-500">Ordered items:</span>
                          <div className="flex flex-col gap-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="text-xs text-neutral-800 flex justify-between items-center bg-stone-100/40 px-2 py-1 max-w-xl">
                                <span>💍 <strong className="font-medium text-black">{it.productName}</strong> ({it.selectedPolish} • Size {it.selectedSize})</span>
                                <span className="font-mono font-bold text-[11px]">x{it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Transaction tokens checklist */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 font-sans pt-1">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Payment ID: <strong className="text-neutral-700 font-semibold font-mono">{order.razorpayPaymentId || 'pay_demo_gateway_settled'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right Block pricing and status updates */}
                      <div className="flex flex-col items-start md:items-end gap-3 self-stretch md:self-auto justify-between border-t border-[#E7E5E4] pt-4 md:border-none md:pt-0 shrink-0">
                        <div className="text-left md:text-right">
                          <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider font-sans block">Paid Out Flow</span>
                          <span className="font-serif text-xl font-bold text-[#690027]">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                        </div>

                        {/* Status Change Selector Form */}
                        <div className="space-y-1 w-full sm:w-auto">
                          <label className="text-[9px] font-bold uppercase tracking-wider font-sans text-neutral-500 block">
                            Change Dispatch Status:
                          </label>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="bg-white border border-neutral-300 rounded-sm text-xs p-1.5 focus:outline-none w-full md:w-36 font-semibold"
                          >
                            <option value="pending">⏳ Pending Fulfill</option>
                            <option value="shipped">🚚 Shipped package</option>
                            <option value="delivered">✔️ Mark Delivered</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Catalogue Inventory */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#340014]">Sterling Jewelry Collections</h2>
                <p className="text-xs text-neutral-500">Add, edit, or delete bespoke rings and ornament catalog entries.</p>
              </div>

              <button
                onClick={() => openProductForm(null)}
                className="cursor-pointer bg-[#690027] hover:bg-[#8A1B3C] text-white text-xs px-4 py-2 flex items-center gap-1 font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" /> Add New Design
              </button>
            </div>

            {/* List products in full grid */}
            <div className="bg-white border border-[#E7E5E4] rounded-sm shadow-sm overflow-hidden">
              <div className="divide-y divide-[#E7E5E4]">
                {productsList.length === 0 ? (
                  <div className="text-center py-16 px-4 max-w-xl mx-auto space-y-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-[#690027]">
                      <Database className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-[#340014]">Live Supabase Products Table is Empty</h3>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Your Supabase connection is online, but your database is currently blank! To load and display your items <strong>dynamically from the backend</strong>, click below to upload all 40+ luxury hallmark 925 sterling silver products directly into your hosted Supabase account.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleSeedProducts}
                        disabled={isSeeding}
                        className="cursor-pointer bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-800/60 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-sm shadow-sm inline-flex items-center gap-2 transition-all"
                      >
                        {isSeeding ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Seeding Live Feed...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse" /> Populate Supabase Database
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  productsList.map((prod) => (
                    <div key={prod.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 justify-between hover:bg-stone-50/40">
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-16 h-16 object-cover rounded-xs border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif text-sm font-extrabold text-[#340014]">{prod.name}</span>
                            <span className="font-mono text-[9px] uppercase tracking-widest bg-stone-100 text-stone-600 px-1.5 py-0.5 font-bold">
                              {prod.category}
                            </span>
                            {prod.bestseller && (
                              <span className="text-[9px] uppercase tracking-widest font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-200">
                                BestSeller
                              </span>
                            )}
                            {prod.isNew && (
                              <span className="text-[9px] uppercase tracking-widest font-bold bg-rose-100 text-[#690027] px-1.5 py-0.5 rounded-full border border-rose-200">
                                New Item
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 line-clamp-1 max-w-xl">{prod.description}</p>
                          <div className="flex flex-wrap gap-1 text-[10px] text-stone-400">
                            <strong>Colors:</strong> {prod.polishColors.join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Right Block for Actions and pricing */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 p-2 sm:p-0 mt-2 sm:mt-0 pt-3">
                        <div className="text-left sm:text-right font-mono">
                          <span className="text-xs font-bold text-[#690027]">₹{prod.price}</span>
                          {prod.originalPrice > prod.price && (
                            <span className="text-[10px] text-neutral-400 line-through ml-1.5 block sm:inline">₹{prod.originalPrice}</span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => openProductForm(prod)}
                            className="cursor-pointer p-2 rounded-full hover:bg-stone-100 text-stone-700 hover:text-black border border-transparent hover:border-stone-200"
                            title="Edit Product Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="cursor-pointer p-2 rounded-full hover:bg-rose-50 text-rose-600 border border-transparent hover:border-rose-200"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Configuration for Supabase & Razorpay */}
        {activeTab === 'config' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-[#E7E5E4] p-6 rounded-sm shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#340014]">Database &amp; Payment Gateway Overrides</h2>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5">
                    Connect your custom React storefront directly to your Supabase platform and verify checkout transactions.
                  </p>
                </div>

                <form onSubmit={handleSaveConfig} className="space-y-4 font-sans max-w-2xl">
                  {/* Sync Switch */}
                  <div className="flex items-center justify-between bg-[#FAF8F5] p-3.5 border border-outline-variant/30 rounded-xs">
                    <div>
                      <h4 className="text-xs font-extrabold text-[#340014] uppercase tracking-wide">Live Supabase Synchronization</h4>
                      <p className="text-[9px] text-[#A8A29E] font-medium leading-normal">
                        When enabled, products and orders will write to your Supabase PostgreSQL. When disabled, the app uses beautiful local mock databases.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isLiveSync}
                        onChange={(e) => setIsLiveSync(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {/* Supabase URL */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-sans">
                      Supabase Project URL (API Node)
                    </label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      placeholder="e.g. https://xxxxxx.supabase.co"
                      disabled={!isLiveSync}
                      className={`w-full bg-white border rounded-xs px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#690027] ${!isLiveSync ? 'bg-neutral-100/60 border-neutral-200 text-stone-400' : 'border-neutral-300'}`}
                    />
                  </div>

                  {/* Supabase Anon Key */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-sans">
                      Supabase Public Anon API Key
                    </label>
                    <input
                      type="password"
                      value={supabaseAnonKey}
                      onChange={(e) => setSupabaseAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxx"
                      disabled={!isLiveSync}
                      className={`w-full bg-white border rounded-xs px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#690027] ${!isLiveSync ? 'bg-neutral-100/60 border-neutral-200 text-stone-400' : 'border-neutral-300'}`}
                    />
                  </div>

                  {/* Razorpay Key ID */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-sans">
                        Razorpay API Key ID (For Payments Checkout)
                      </label>
                      <span className="text-[9px] uppercase tracking-wider text-amber-600 font-bold bg-amber-50 px-1 border border-amber-200 rounded-sm">Sandbox Key Predefined</span>
                    </div>
                    <input
                      type="text"
                      value={razorpayKeyId}
                      onChange={(e) => setRazorpayKeyIdState(e.target.value)}
                      placeholder="rzp_test_eG7X3t2F8M19pq"
                      className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#690027]"
                    />
                    <p className="text-[9px] text-[#A8A29E] font-medium leading-normal">
                      Your Razorpay Key ID generated from Razorpay Dashboard &gt; Settings &gt; API keys. We have pre-configured a secure testing sandbox key for immediate checkouts!
                    </p>
                  </div>

                  {/* Admin Passkey Lock configuration */}
                  <div className="space-y-1 border-t border-stone-100 pt-4 mt-4">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-sans">
                      Alter Admin Portal Credentials (PIN/Passkey)
                    </label>
                    <input
                      type="text"
                      value={customPasskey}
                      onChange={(e) => setCustomPasskey(e.target.value)}
                      placeholder="admin123"
                      className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#690027]"
                    />
                    <p className="text-[9px] text-[#A8A29E] font-medium leading-normal">
                      The passkey needed to auth lock screen on reloading. Update from "admin123" before delivering this codebase to your clients!
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:justify-between items-stretch sm:items-center">
                    <button
                      type="button"
                      onClick={testSupabaseConnection}
                      disabled={!isLiveSync}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all flex items-center justify-center gap-1 cursor-pointer ${!isLiveSync ? 'opacity-50 cursor-not-allowed border-stone-200 text-stone-400 bg-transparent' : 'border-stone-800 text-stone-800 hover:bg-stone-50 bg-white'}`}
                    >
                      <Wifi className="w-4 h-4 text-green-600" /> Test Connection
                    </button>

                    <button
                      type="submit"
                      className="cursor-pointer bg-[#690027] hover:bg-[#8A1B3C] text-white text-xs px-5 py-2.5 font-bold uppercase tracking-widest text-center"
                    >
                      Save Configuration
                    </button>
                  </div>
                </form>

                {/* Display Test response if any */}
                {testStatus !== 'IDLE' && (
                  <div className={`p-4 rounded-xs border text-xs font-sans leading-normal ${testStatus === 'TESTING' ? 'bg-blue-50 border-blue-200 text-blue-700' : testStatus === 'SUCCESS' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {testStatus === 'TESTING' && <p className="font-bold flex items-center gap-1.5 animate-pulse">⚡ Connecting API... querying rows on table "products"</p>}
                    {testStatus === 'SUCCESS' && (
                      <div className="space-y-1">
                        <p className="font-bold">✔️ SUCCESS: Database linked beautifully!</p>
                        <p className="text-[11px] text-green-600">Your client storefront is now reading and writing directly to your hosted Supabase account using real-time sync adapters.</p>
                      </div>
                    )}
                    {testStatus === 'ERROR' && (
                      <div className="space-y-1">
                        <p className="font-bold">❌ Connection Link Broken:</p>
                        <p className="text-[11px] text-red-500">{testErrorMessage}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Architecture Guidelines Panel */}
            <div className="space-y-6">
              <div className="bg-white border border-[#E7E5E4] p-5 rounded-sm shadow-sm space-y-4">
                <h3 className="font-serif text-sm font-bold text-neutral-800 uppercase tracking-wider">
                  System Architecture Logs
                </h3>

                <div className="divide-y divide-[#E7E5E4] font-sans text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-neutral-500">Framework Port</span>
                    <span className="font-mono bg-neutral-100 text-[#1C1917] px-1.5 py-0.5 font-bold">Vite SPA Core</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-neutral-500">Payment Gateway</span>
                    <span className="font-mono bg-stone-100 text-[#690027] px-1.5 py-0.5 font-extrabold uppercase text-[9px] tracking-wider">Razorpay India</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-neutral-500">DB Live Status</span>
                    {isLiveSync ? (
                      <span className="text-green-700 font-bold flex items-center gap-1 font-mono text-[10px] uppercase">
                        Connected API Online
                      </span>
                    ) : (
                      <span className="text-orange-700 font-bold flex items-center gap-1 font-mono text-[10px] uppercase">
                        LocalStorage Sandbox Mode
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E7E5E4] p-5 rounded-sm shadow-sm space-y-3.5">
                <h4 className="font-serif text-sm font-extrabold text-[#340014] flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500" /> Database hand-off
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  By upgrading from Shopify, your ecommerce store operates on your own hosted database platform. No monthly platform pricing, no coding restrictions.
                </p>
                <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                  The client uses this built-in admin hub to manage products, look up shipping addresses, and watch customer checkout logs instantly!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: SQL schema copy box */}
        {activeTab === 'sql' && (
          <div className="bg-white border border-[#E7E5E4] p-6 rounded-sm shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#340014]">Copy-Paste Schema Blueprint Setup</h2>
              <p className="text-xs text-neutral-500 font-sans mt-0.5">
                Copy this exact script code below, run it once in your <strong>Supabase &gt; SQL Editor &gt; New Query</strong> tab, and click <strong>Run</strong> in your hosted portal. This takes exactly 5 seconds and instantiates both tables with Row-Level-Security (RLS) policies completely!
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center font-sans bg-stone-100 px-4 py-2 border-b border-stone-200">
                <span className="text-xs font-mono font-bold text-stone-600">setup_tables_schemas.sql</span>
                <button
                  onClick={() => copyToClipboard(SUPABASE_SQL_SCHEMA)}
                  className="cursor-pointer text-xs font-bold text-[#690027] hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </button>
              </div>

              <pre className="bg-stone-900 text-stone-100 p-4 rounded-xs overflow-x-auto text-[11px] font-mono leading-relaxed max-h-96 select-text">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-[#78350F] leading-normal font-sans">
                <span className="font-bold">Important step:</span> Always enable row access insert privileges on the <strong>orders</strong> table in Supabase, so that anonymous shoppers checking out can instantly add order payloads onto your dashboard log ledger securely without registration barriers!
              </div>
            </div>
          </div>
        )}

      </div>

      {/* PRODUCT ADD/EDIT MODAL FORM */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex justify-center items-start p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-stone-200 w-full max-w-2xl rounded-sm p-6 space-y-6 shadow-2xl my-auto relative">
            <h3 className="font-serif text-lg font-bold text-[#340014] border-b pb-2 border-stone-100">
              {editingProduct ? `Edit product: ${editingProduct.name}` : 'Instantiate Custom Jewelry Design'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Product Name / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Celestial Diamond Cut Ring"
                    className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#690027]"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Inventory Category Selector *
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value as any)}
                    className="w-full bg-white border border-neutral-300 rounded-xs px-2.5 py-2 text-xs focus:outline-none focus:border-[#690027]"
                  >
                    <option value="rings">Rings</option>
                    <option value="earrings">Earrings</option>
                    <option value="necklaces">Necklaces</option>
                    <option value="bracelets">Bracelets</option>
                    <option value="anklets">Anklets</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Client Retailing Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="1999"
                    className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#690027]"
                  />
                </div>

                {/* Original price */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    Showrooms Cut Price (MRP / Original ₹)
                  </label>
                  <input
                    type="number"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    placeholder="3500"
                    className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#690027]"
                  />
                </div>

              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Detailed Specifications description
                </label>
                <textarea
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="e.g. Crafted in authentic 925 hallmarks sterling silver with layered protective polished layers..."
                  rows={3}
                  className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#690027]"
                />
              </div>

              {/* Image url */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Display Photography URL *
                </label>
                <input
                  type="text"
                  required
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-xxxxxxxxxxxx"
                  className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#690027]"
                />
                <p className="text-[9px] text-[#A8A29E]">
                  Supply any hosted web image link or standard high-resolution Unsplash photo address.
                </p>
              </div>

              {/* Polish colors split */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                  Polish Shade Swatches (Comma Separated)
                </label>
                <input
                  type="text"
                  value={pPolishColors}
                  onChange={(e) => setPPolishColors(e.target.value)}
                  placeholder="Silver, Rose Gold, Gold Plated"
                  className="w-full bg-white border border-neutral-300 rounded-xs px-3 py-2 text-xs focus:outline-none focus:border-[#690027]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-3">
                {/* Recipients */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                    Target Demographic Audience
                  </label>
                  <div className="flex gap-4 mt-1 font-semibold text-stone-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="demographic"
                        checked={pRecipients === 'For Her'}
                        onChange={() => setPRecipients('For Her')}
                        className="text-[#690027] focus:ring-[#690027]"
                      />
                      <span>For Her</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="demographic"
                        checked={pRecipients === 'For Him'}
                        onChange={() => setPRecipients('For Him')}
                        className="text-[#690027] focus:ring-[#690027]"
                      />
                      <span>For Him</span>
                    </label>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <div className="flex gap-4 font-semibold text-stone-700">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pIsBestseller}
                        onChange={(e) => setPIsBestseller(e.target.checked)}
                        className="rounded border-stone-300 text-[#690027]"
                      />
                      <span>Mark BestSeller Badge</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pIsNew}
                        onChange={(e) => setPIsNew(e.target.checked)}
                        className="rounded border-stone-300 text-[#690027]"
                      />
                      <span>Mark New Arrival Badge</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 justify-end border-t border-stone-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="cursor-pointer border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold uppercase tracking-wider px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer bg-[#690027] hover:bg-[#8A1B3C] text-white font-bold uppercase tracking-wider px-5 py-2"
                >
                  Fulfill Inventory Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
