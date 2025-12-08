import { Product, SubscriptionPlan } from './types';

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

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'MPX-DEC-001',
    name: 'Moreplex HD Decoder',
    description: 'High Definition DTH Decoder with PVR functionality. Includes HDMI cable and Remote.',
    price: 15000,
    installationFee: 5000,
    category: 'decoder',
    stock: 50,
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'p2',
    sku: 'MPX-DISH-60',
    name: '60cm Satellite Dish',
    description: 'Ku-Band High Gain Satellite Dish. Weather resistant coating.',
    price: 8000,
    installationFee: 3000,
    category: 'dish',
    stock: 100,
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 'p3',
    sku: 'MPX-COMBO-01',
    name: 'Full Kit (Decoder + Dish)',
    description: 'Complete setup including HD Decoder, 60cm Dish, LNB, and 20m Cable.',
    price: 22000,
    installationFee: 7000,
    category: 'decoder',
    stock: 30,
    image: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: 'p4',
    sku: 'MPX-LNB-QUAD',
    name: 'Quad LNB',
    description: 'High performance Quad LNB for multiple signal distribution.',
    price: 4500,
    category: 'accessory',
    stock: 200,
    image: 'https://picsum.photos/400/300?random=4'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  { id: 'sub-1', name: 'Moreplex Starter', price: 1500, duration: '1 Month', channels: 25, type: 'PayTV' },
  { id: 'sub-2', name: 'Moreplex Family', price: 3500, duration: '1 Month', channels: 55, type: 'PayTV' },
  { id: 'sub-3', name: 'Moreplex Premium', price: 6000, duration: '1 Month', channels: 120, type: 'PayTV' },
  { id: 'sub-fta', name: 'Free To Air Access', price: 0, duration: 'Lifetime', channels: 15, type: 'FTA' },
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
