import { createClient } from '@supabase/supabase-js';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data';

// Configuration keys for local storage overrides
const URL_KEY = 'zelvra_supabase_url';
const ANON_KEY = 'zelvra_supabase_anon_key';
const SYNC_KEY = 'zelvra_supabase_sync';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    id: string;
    productName: string;
    price: number;
    quantity: number;
    selectedPolish: string;
    selectedSize: string;
  }>;
  totalPrice: number;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: string;
}

function isValidSupabaseUrl(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

function isValidSupabaseKey(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  // Valid Supabase anon keys are JWTs (or valid publishable keys), not placeholders or CLI secret tokens
  if (
    trimmed.length < 20 ||
    trimmed.startsWith('sb_secret_') ||
    trimmed.startsWith('MY_') ||
    trimmed.startsWith('YOUR_')
  ) {
    return false;
  }
  return true;
}

// Check if credentials exist
export function getSupabaseCredentials() {
  const storedUrl = localStorage.getItem(URL_KEY)?.trim() || '';
  const envUrl = (((import.meta as any).env?.VITE_SUPABASE_URL as string) || '').trim();
  const url = isValidSupabaseUrl(storedUrl)
    ? storedUrl
    : isValidSupabaseUrl(envUrl)
    ? envUrl
    : '';

  const storedKey = localStorage.getItem(ANON_KEY)?.trim() || '';
  const envKey = (((import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string) || '').trim();
  const key = isValidSupabaseKey(storedKey)
    ? storedKey
    : isValidSupabaseKey(envKey)
    ? envKey
    : '';

  const isEnabled = localStorage.getItem(SYNC_KEY) !== 'false';
  return { url, key, isEnabled: isEnabled && isValidSupabaseUrl(url) && isValidSupabaseKey(key) };
}

// Initialize Supabase Client dynamically
let supabaseClient: any = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseClient() {
  const { url, key, isEnabled } = getSupabaseCredentials();
  if (isEnabled && isValidSupabaseUrl(url) && isValidSupabaseKey(key)) {
    // If credentials changed or client is not yet instantiated, rebuild it
    if (!supabaseClient || lastUsedUrl !== url || lastUsedKey !== key) {
      try {
        supabaseClient = createClient(url, key);
        lastUsedUrl = url;
        lastUsedKey = key;
      } catch {
        supabaseClient = null;
        lastUsedUrl = '';
        lastUsedKey = '';
      }
    }
    return supabaseClient;
  }
  return null;
}

// Local Storage Fallback Engine (for smooth zero-setup sandbox experience)
const LOCAL_PRODUCTS_KEY = 'zelvra_local_products';
const LOCAL_ORDERS_KEY = 'zelvra_local_orders';

function getLocalProducts(): Product[] {
  const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // JSON issues
    }
  }
  // Initialize with fallback catalog data
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
}

function saveLocalProducts(products: Product[]) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function getLocalOrders(): Order[] {
  const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // JSON issues
    }
  }
  return [];
}

function saveLocalOrders(orders: Order[]) {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

// Database Actions: PRODUCTS
let lastProductsSource: 'supabase' | 'local' = 'local';

export function getLastProductsSource(): 'supabase' | 'local' {
  return lastProductsSource;
}

export async function getProducts(bypassFallback = false): Promise<Product[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      if (data) {
        if (data.length > 0) {
          lastProductsSource = 'supabase';
          // Map database fields to application types
          return data.map((item: any) => ({
            id: String(item.id),
            name: item.name || '',
            description: item.description || '',
            price: Number(item.price),
            originalPrice: Number(item.original_price || item.price),
            rating: Number(item.rating || 5.0),
            reviewsCount: Number(item.reviews_count || 0),
            image: item.image || '',
            category: item.category || 'rings',
            bestseller: !!item.bestseller,
            isNew: !!item.is_new,
            polishColors: Array.isArray(item.polish_colors)
              ? item.polish_colors
              : JSON.parse(item.polish_colors || '["Silver", "Rose Gold", "Gold Plated"]'),
            recipients: Array.isArray(item.recipients)
              ? item.recipients
              : JSON.parse(item.recipients || '["For Her"]'),
            occasions: Array.isArray(item.occasions)
              ? item.occasions
              : JSON.parse(item.occasions || '["Birthday", "Anniversary", "Others"]'),
          }));
        } else if (bypassFallback) {
          lastProductsSource = 'local';
          return [];
        }
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local database. Error:', err);
      lastProductsSource = 'local';
      if (bypassFallback) {
        throw err;
      }
    }
  }
  lastProductsSource = 'local';
  return getLocalProducts();
}

// Bulk seed local file products into the live Supabase products table
export async function seedProductsToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, count: 0, error: 'Database is not connected.' };
  }

  try {
    // Check if there are already products in Supabase
    const { data: existing, error: checkError } = await client
      .from('products')
      .select('id')
      .limit(1);

    if (checkError) throw checkError;
    
    if (existing && existing.length > 0) {
      return { 
        success: false, 
        count: 0, 
        error: 'The database products table already has items! To avoid duplicates, draft seeding is locked. Please delete the rows in Supabase if you want clean state.' 
      };
    }

    // Format for insertion
    const dbItems = INITIAL_PRODUCTS.map((prod) => ({
      name: prod.name,
      description: prod.description,
      price: Number(prod.price),
      original_price: Number(prod.originalPrice),
      rating: Number(prod.rating || 5.0),
      reviews_count: Number(prod.reviewsCount || 0),
      image: prod.image,
      category: prod.category,
      bestseller: !!prod.bestseller,
      is_new: !!prod.isNew,
      polish_colors: prod.polishColors,
      recipients: prod.recipients,
      occasions: prod.occasions,
    }));

    // Chunk insert if list is long (Supabase supports bulk inserts easily)
    const { data, error } = await client
      .from('products')
      .insert(dbItems)
      .select('id');

    if (error) throw error;
    return { success: true, count: data ? data.length : dbItems.length };
  } catch (err: any) {
    console.error('Failed to seed products into live Supabase:', err);
    return { success: false, count: 0, error: err.message || 'Seeding mutation operation failed.' };
  }
}

export async function addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const newProduct: Product = {
    ...product,
    id: product.id || `product_${Date.now()}`,
    rating: product.rating || 5.0,
    reviewsCount: product.reviewsCount || 1,
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const dbItem = {
        name: newProduct.name,
        description: newProduct.description,
        price: Number(newProduct.price),
        original_price: Number(newProduct.originalPrice),
        rating: Number(newProduct.rating),
        reviews_count: Number(newProduct.reviewsCount),
        image: newProduct.image,
        category: newProduct.category,
        bestseller: newProduct.bestseller,
        is_new: newProduct.isNew,
        polish_colors: newProduct.polishColors,
        recipients: newProduct.recipients,
        occasions: newProduct.occasions,
      };

      const { data, error } = await client
        .from('products')
        .insert([dbItem])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        return {
          ...newProduct,
          id: String(data[0].id),
        };
      }
    } catch (err) {
      console.error('Supabase add product failed, saving to local database:', err);
    }
  }

  // Fallback to local
  const currentProducts = getLocalProducts();
  currentProducts.unshift(newProduct);
  saveLocalProducts(currentProducts);
  return newProduct;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product | null> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const dbItem: any = {};
      if (product.name !== undefined) dbItem.name = product.name;
      if (product.description !== undefined) dbItem.description = product.description;
      if (product.price !== undefined) dbItem.price = Number(product.price);
      if (product.originalPrice !== undefined) dbItem.original_price = Number(product.originalPrice);
      if (product.image !== undefined) dbItem.image = product.image;
      if (product.category !== undefined) dbItem.category = product.category;
      if (product.bestseller !== undefined) dbItem.bestseller = product.bestseller;
      if (product.isNew !== undefined) dbItem.is_new = product.isNew;
      if (product.polishColors !== undefined) dbItem.polish_colors = product.polishColors;
      if (product.recipients !== undefined) dbItem.recipients = product.recipients;
      if (product.occasions !== undefined) dbItem.occasions = product.occasions;

      // Check if id is a uuid/number for Database query or matching string
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !isNaN(Number(id));
      if (isUUID) {
        const { data, error } = await client
          .from('products')
          .update(dbItem)
          .eq('id', isUUID ? (isNaN(Number(id)) ? id : Number(id)) : id)
          .select();

        if (error) throw error;
        if (data && data[0]) {
          return {
            ...product,
            id: String(data[0].id),
          } as Product;
        }
      }
    } catch (err) {
      console.error('Supabase update product failed, using local database:', err);
    }
  }

  // Fallback to local
  const currentProducts = getLocalProducts();
  const idx = currentProducts.findIndex(p => p.id === id);
  if (idx !== -1) {
    const updated = { ...currentProducts[idx], ...product };
    currentProducts[idx] = updated;
    saveLocalProducts(currentProducts);
    return updated;
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !isNaN(Number(id));
      if (isUUID) {
        const { error } = await client
          .from('products')
          .delete()
          .eq('id', isUUID ? (isNaN(Number(id)) ? id : Number(id)) : id);

        if (error) throw error;
        return true;
      }
    } catch (err) {
      console.error('Supabase delete product failed, using local database:', err);
    }
  }

  // Fallback to local
  const currentProducts = getLocalProducts();
  const filtered = currentProducts.filter(p => p.id !== id);
  if (filtered.length !== currentProducts.length) {
    saveLocalProducts(filtered);
    return true;
  }
  return false;
}

// Database Actions: ORDERS
export async function getOrders(): Promise<Order[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((item: any) => ({
          id: String(item.id),
          customerName: item.customer_name || '',
          customerEmail: item.customer_email || '',
          customerPhone: item.customer_phone || '',
          shippingAddress: item.shipping_address || '',
          items: Array.isArray(item.items) ? item.items : JSON.parse(item.items || '[]'),
          totalPrice: Number(item.total_price),
          razorpayPaymentId: item.razorpay_payment_id || '',
          razorpayOrderId: item.razorpay_order_id || '',
          status: item.status || 'pending',
          createdAt: item.created_at || item.inserted_at || new Date().toISOString(),
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch orders failed, falling back to local database. Error:', err);
    }
  }
  return getLocalOrders();
}

export async function addOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `order_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const dbItem = {
        customer_name: newOrder.customerName,
        customer_email: newOrder.customerEmail,
        customer_phone: newOrder.customerPhone,
        shipping_address: newOrder.shippingAddress,
        items: newOrder.items,
        total_price: Number(newOrder.totalPrice),
        razorpay_payment_id: newOrder.razorpayPaymentId || null,
        razorpay_order_id: newOrder.razorpayOrderId || null,
        status: newOrder.status,
      };

      const { data, error } = await client
        .from('orders')
        .insert([dbItem])
        .select();

      if (error) throw error;
      if (data && data[0]) {
        return {
          ...newOrder,
          id: String(data[0].id),
          createdAt: data[0].created_at || newOrder.createdAt,
        };
      }
    } catch (err) {
      console.error('Supabase add order failed, saving locally:', err);
    }
  }

  // Fallback to local
  const currentOrders = getLocalOrders();
  currentOrders.unshift(newOrder);
  saveLocalOrders(currentOrders);
  return newOrder;
}

export async function updateOrderStatus(id: string, status: 'pending' | 'shipped' | 'delivered'): Promise<boolean> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) || !isNaN(Number(id));
      const { error } = await client
        .from('orders')
        .update({ status })
        .eq('id', isUUID ? (isNaN(Number(id)) ? id : Number(id)) : id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Supabase update order status failed, using local database:', err);
    }
  }

  // Fallback to local
  const currentOrders = getLocalOrders();
  const idx = currentOrders.findIndex(o => o.id === id);
  if (idx !== -1) {
    currentOrders[idx].status = status;
    saveLocalOrders(currentOrders);
    return true;
  }
  return false;
}

// Dynamically verify a Supabase connection using custom inputs before saving them
export async function verifyClientConnection(url: string, key: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!url || !key) {
      return { success: false, error: 'Both Supabase URL and API Key must be supplied.' };
    }
    
    // Check if URL looks like a valid URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return { success: false, error: 'Invalid URL format. The endpoint must start with http:// or https://' };
    }

    // Check if the key provided is a Personal Access Token (sb_secret_...)
    if (key.trim().startsWith('sb_secret_')) {
      return { 
        success: false, 
        error: '⚠️ DETECTED PERSONAL ACCESS TOKEN (sb_secret_...) INSTEAD OF PUBLIC ANON KEY!\n\nYour key starts with "sb_secret_", which is a Supabase "Management API Key / Personal Access Token". This is for the Supabase CLI, not for the frontend application.\n\n💡 HOW TO FIX IT:\n1. Open your Supabase Dashboard.\n2. Go to Project Settings -> API.\n3. Scroll down to "Project API keys".\n4. Copy the "anon" (public) key (which is a long JWT string starting with eyJhbGci...).\n5. Paste that "anon" key into this field instead!'
      };
    }

    const testClient = createClient(url.trim(), key.trim());
    if (!testClient) {
      return { success: false, error: 'Could not create Supabase Client instance.' };
    }

    // Let's check both products and orders tables
    const prodCheck = await testClient.from('products').select('id').limit(1);
    if (prodCheck.error) {
      return { success: false, error: `Products Table Check Failed: ${prodCheck.error.message}. Please verify the table "products" exists and RLS allows reading.` };
    }

    const orderCheck = await testClient.from('orders').select('id').limit(1);
    if (orderCheck.error) {
      return { success: false, error: `Orders Table Check Failed: ${orderCheck.error.message}. Please verify the table "orders" exists and allows inserting.` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error occurred during client instantiation check.' };
  }
}

// SQL helper for copy-pasting into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- 1. CREATE PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  image TEXT,
  category TEXT NOT NULL CHECK (category IN ('rings', 'earrings', 'necklaces', 'bracelets', 'anklets')),
  bestseller BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT true,
  polish_colors JSONB DEFAULT '["Silver", "Rose Gold", "Gold Plated"]'::jsonb,
  recipients JSONB DEFAULT '["For Her"]'::jsonb,
  occasions JSONB DEFAULT '["Birthday", "Anniversary", "Others"]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_price NUMERIC NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS) and grant general public access for demo purposes, 
-- or restrict depending on your client requirements.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (adjust for production)
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert/update/delete on products" ON products FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insert on orders for checkouts" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow access to orders for admin" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
`;
