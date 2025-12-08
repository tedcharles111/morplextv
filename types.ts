export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  installationFee?: number;
  image: string;
  category: 'decoder' | 'dish' | 'accessory' | 'service';
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string; // e.g., "1 Month"
  channels: number;
  type: 'FTA' | 'FTV' | 'PayTV';
}

export interface ReceiptData {
  transactionRef?: string;
  amount?: number;
  date?: string;
  decoderCode?: string;
  senderName?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  decoderCode?: string;
  password?: string; // In a real app, this would be hashed
  role: 'customer';
  joinedDate: Date;
}

export interface Order {
  id: string;
  userId?: string; // Link to registered user
  items: CartItem[];
  total: number;
  customerName: string;
  customerEmail: string;
  status: 'pending_payment' | 'awaiting_ocr' | 'verified' | 'shipped';
  receiptUrl?: string;
  extractedDecoderCode?: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: Date;
}