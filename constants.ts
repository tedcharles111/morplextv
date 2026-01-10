import { Product, SubscriptionPlan, User } from './types';

export const COMPANY_INFO = {
  name: "Moreplex TV",
  address: "15B Kudirat Abiola Way, Oregun, Ikeja 101233, Lagos",
  phone: "+234 703 618 6874",
  whatsapp: "+234 906 000 3647",
  whatsappUrl: "https://wa.me/2349060003647",
  email: "info@moreplex.com",
  tagline: "Entertain Viewers With Sheer Delight!",
  about: "Moreplex TV is a Direct To Home (DTH) TV platform which is the new dawn of Pay TV Services that is redefining the entertainment television for the one billion people in Africa. We are providing a multipurpose Free To Air (FTA), Free To View (FTV) and Pay TV services that comprise DTH, Digital Terrestrial TV (DTT) and Video On Demand (VOD).",
  bankDetails: {
    bankName: "Zenith Bank",
    accountNumber: "1010101010",
    accountName: "Moreplex TV Limited"
  }
};

export const ADMIN_AUTH = {
  username: "admin",
  password: "moreplex2025"
};

// Mock Initial Users
export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '08012345678',
    decoderCode: 'MPX-882910',
    password: 'password123',
    role: 'customer',
    joinedDate: new Date('2024-01-15')
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'MPX-DEC-HERO',
    name: 'MOREPLEXTV HERO DECODER- HD Quality (DTH satellite only)',
    description: 'On Sales for N7,500 while N5,000 for Activation with Active subscription',
    price: 12500,
    customPriceDisplay: '30,000.00 N12,500.00',
    installationFee: 5000,
    category: 'decoder',
    stock: 50,
    image: 'https://freepressnews.com.ng/wp-content/uploads/2026/01/decoder-dth_1-removebg-preview.png'
  },
  {
    id: 'p2',
    sku: 'MPX-DEC-JOLLY',
    name: 'MOREPLEX TV JOLLY DECODER - HD Quality (DTH satellite + IPTV Internet TV) Read more',
    description: 'On Sales for N15,000 while N5,000 for Activation with Active subscription',
    price: 20000,
    customPriceDisplay: '50,000.00 N20,000.00',
    category: 'decoder',
    stock: 100,
    image: 'https://freepressnews.com.ng/wp-content/uploads/2026/01/jolly_2-removebg-preview.png'
  },
  {
    id: 'p3',
    sku: 'MPX-LNB-MULTI',
    name: 'Multi Satellite TV Dish Antenna Multi LNB Bracket Holder',
    description: 'Multi Satellite TV Dish Antenna Multi LNB  Read more',
    price: 8000,
    customPriceDisplay: '11,000.00 N8,000.00',
    category: 'accessory',
    stock: 200,
    image: 'https://freepressnews.com.ng/wp-content/uploads/2026/01/multi-4.png'
  },
  {
    id: 'p4',
    sku: 'MPX-WIFI-ANT',
    name: 'USB WiFi Antenna',
    description: 'Long-range USB WiFi adapter for Moreplex decoders. Enable online features like YouTube.',
    price: 3500,
    category: 'accessory',
    stock: 150,
    image: 'https://freepressnews.com.ng/wp-content/uploads/2026/01/wifi-modem-antenna-3.png'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'sub-1', name: 'Moreplex Starter', price: 1500, duration: '1 Month', channels: 25, type: 'PayTV' },
  { id: 'sub-2', name: 'Moreplex Family', price: 3500, duration: '1 Month', channels: 55, type: 'PayTV' },
  { id: 'sub-3', name: 'Moreplex Premium', price: 6000, duration: '1 Month', channels: 120, type: 'PayTV' },
  { id: 'sub-fta', name: 'Free To Air Access', price: 0, duration: 'Lifetime', channels: 15, type: 'FTA' },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Chinedu O.",
    location: "Lagos",
    text: "The picture quality is amazing! I switched from another provider and Moreplex offers way more value for the price. The sports channels are crisp.",
    rating: 5
  },
  {
    id: 2,
    name: "Amina Y.",
    location: "Abuja",
    text: "Installation was fast. I ordered the Full Kit online and the technician arrived the next day. Customer service on WhatsApp is very responsive.",
    rating: 5
  },
  {
    id: 3,
    name: "David K.",
    location: "Port Harcourt",
    text: "I love the Pay-As-You-Go flexibility. The Family plan is perfect for my kids with all the cartoon channels available.",
    rating: 4
  }
];

export const TERMS_TEXT = `
1. Introduction
These Terms and Conditions govern your use of the Moreplex TV website and services. By accessing our platform, you agree to these terms.

2. Services
Moreplex TV provides DTH, DTT, and VOD services. Service availability is subject to network coverage and technical feasibility.

3. Payments & Refunds
All payments for decoders and subscriptions are final unless the product is defective. Refunds are processed within 7 working days upon verification of defect.

4. User Obligations
Users must provide accurate information during registration and purchase. The "Decoder Code" is unique to your device and required for activation.

5. Subscription & Renewal
Subscriptions are prepaid. Service is suspended immediately upon expiration if not renewed.

6. Privacy Policy
We collect personal data (name, address, phone) solely for service delivery and regulatory compliance. We do not share data with third parties without consent, except for legal compliance.
`;