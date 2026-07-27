export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  cover_image_url: string | null;
  file_path: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  buyer_email: string;
  status: 'pending' | 'approved' | 'rejected';
  mp_payment_id: string | null;
  total: number;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  price: number;
  quantity: number;
}
