export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  product_type?: 'digital' | 'service';
  subtitle?: string | null;
  features?: string[] | null;
  is_popular?: boolean;
  whatsapp_text?: string | null;
  cal_link?: string | null;
  payment_provider?: 'mercadopago' | 'hotmart';
  hotmart_url?: string | null;
  cover_image_url: string | null;
  file_path: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  read_minutes: number;
  is_published: boolean;
  published_at: string;
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
