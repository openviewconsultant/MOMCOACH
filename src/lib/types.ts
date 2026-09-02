export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory?: string | null;
  product_type?: 'digital' | 'service' | 'gift_card';
  gift_card_program?: 'sueno' | 'alimentacion' | null;
  subtitle?: string | null;
  features?: string[] | null;
  price_note?: string | null;
  details?: { heading: string; items: string[] } | null;
  is_popular?: boolean;
  whatsapp_text?: string | null;
  cal_link?: string | null;
  payment_provider?: 'mercadopago' | 'hotmart' | 'calendar';
  hotmart_url?: string | null;
  booking_calendar_id?: string | null;
  video_url?: string | null;
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
  status_detail: string | null;
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

export interface Booking {
  id: string;
  product_id: string | null;
  order_id: string | null;
  calendar_id: string | null;
  buyer_name: string;
  buyer_email: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  calendar_event_id: string | null;
  meet_link: string | null;
  notified_at: string | null;
  created_at: string;
  updated_at: string;
}

export type GiftCardProgram = 'sueno' | 'alimentacion';

export interface GiftCard {
  id: string;
  code: string;
  program: GiftCardProgram;
  initial_amount: number;
  balance: number;
  currency: string;
  purchaser_email: string;
  recipient_name: string | null;
  recipient_email: string;
  message: string | null;
  order_id: string | null;
  status: 'pending' | 'active' | 'depleted' | 'cancelled';
  created_at: string;
  updated_at: string;
}
