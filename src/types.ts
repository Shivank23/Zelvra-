export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: 'rings' | 'earrings' | 'necklaces' | 'bracelets' | 'anklets';
  bestseller: boolean;
  isNew?: boolean;
  polishColors: string[];
  recipients?: ('For Her' | 'For Him')[];
  occasions?: ('Birthday' | 'Anniversary' | 'Others')[];
}

export interface CartItem {
  id: string; // Unique Cartesian key: `${productId}-${selectedPolish}-${selectedSize}`
  product: Product;
  quantity: number;
  selectedPolish: string;
  selectedSize: string;
}

export type ActiveTab = 'home' | 'search' | 'gifts' | 'wishlist' | 'account' | 'cart';

export interface Promotion {
  code: string;
  discountPercent: number;
  description: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}
