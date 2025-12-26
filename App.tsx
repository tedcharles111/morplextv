import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, Phone, Mail, MapPin, Search, 
  Upload, CheckCircle, AlertCircle, PlayCircle, Monitor, Tv,
  Star, Shield, Clock, Users, Zap, Lock, User, LogOut, LayoutDashboard, History, Settings, CreditCard, FileText
} from 'lucide-react';
import { COMPANY_INFO, PRODUCTS, SUBSCRIPTION_PLANS, TERMS_TEXT, TESTIMONIALS, ADMIN_AUTH, INITIAL_USERS } from './constants';
import { Product, CartItem, Order, SubscriptionPlan, ReceiptData, User as UserType } from './types';
import { analyzeReceipt } from './services/geminiService';

// --- Global Context ---
interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  users: UserType[];
  currentUser: UserType | null;
  registerUser: (user: UserType) => boolean;
  loginUser: (email: string, pass: string) => boolean;
  logoutUser: () => void;
}

const AppContext = React.createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within App");
  return context;
};

// --- Constants ---
const JOLLY_FEATURES = [
  "DVB-S/S2/S2 AVS+, VCM/ACM (error protection)",
  "Supports BISS auto roll, Biss key",
  "Supports Unicable, DiSEqC1.0/1.1/1.2/USALS Motor",
  "Supports Full speed USB 3/4G dongle and USB wifi dongle",
  "Supports Cccam, Newcam",
  "Supports Online Movie (Youtube, Mytube, and other Apps)",
  "Universal LNB, NIT search supports",
  "EPG, PVR, Timeshift",
  "Supports YouTube, Mytube, and other Apps",
  "Lower power consumption 5W (typical), 0.12W (Standby)",
  "Up to 5000 IPTV/OTT channels",
  "HEVC, H.264/MPEG-4",
  "Video Resolution: 1080P/i, 720P, 576P, 480P, 576i, 480i",
  "PAL/NTSC: Automatic PAL/NTSC conversion",
  "Aspect Ratio: Auto, 16:9 Pillar box, 4:3 Pan & Scan, 4:3 Letter Box"
];

// --- Components ---

const Logo = ({ className }: { className?: string }) => (
  <div className={`bg-white rounded-lg p-1 inline-block ${className}`}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 220 60" 
      className="w-full h-full"
      role="img" 
      aria-label="Moreplex TV Logo"
    >
      <rect width="220" height="60" rx="8" fill="#dc2626" />
      {/* Abstract 'M' / Play Icon */}
      <path d="M20 15 H 30 L 40 30 L 50 15 H 60 V 45 H 50 V 25 L 40 40 L 30 25 V 45 H 20 Z" fill="white" />
      <text x="70" y="42" fontFamily="sans-serif" fontWeight="900" fontSize="32" fill="white" letterSpacing="-0.5">MOREPLEX</text>
      <text x="195" y="24" fontFamily="sans-serif" fontWeight="bold" fontSize="14" fill="white">TV</text>
    </svg>
  </div>
);

const Navbar = () => {
  const { cart, currentUser, logoutUser } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path ? "text-brand" : "text-white hover:text-brand-light";

  const handleLogout = () => {
      logoutUser();
      navigate('/');
      setIsOpen(false);
  }

  return (
    <nav className="bg-charcoal text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo className="h-12 w-auto" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center font-medium">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/shop" className={isActive('/shop')}>Shop</Link>
            <Link to="/subscribe" className={isActive('/subscribe')}>Subscription</Link>
            <Link to="/support" className={isActive('/support')}>Support</Link>
            <Link to="/admin" className={isActive('/admin')}>Admin</Link> 
          </div>

          {/* Auth & Cart */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
                 <div className="hidden md:flex items-center space-x-4">
                     <Link to="/portal" className="flex items-center hover:text-brand">
                        <User className="h-5 w-5 mr-1" />
                        <span className="text-sm font-semibold truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                     </Link>
                     <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Logout">
                        <LogOut className="h-5 w-5" />
                     </button>
                 </div>
            ) : (
                <div className="hidden md:flex items-center space-x-2 text-sm">
                    <Link to="/login" className="hover:text-brand">Login</Link>
                    <span className="text-gray-600">|</span>
                    <Link to="/signup" className="bg-brand hover:bg-brand-dark text-white px-3 py-1.5 rounded-full transition">Join</Link>
                </div>
            )}

            <Link to="/cart" className="relative group">
              <ShoppingCart className="h-6 w-6 text-white group-hover:text-brand transition" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 pb-4 px-4">
          <div className="flex flex-col space-y-4 pt-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300 hover:text-white">Home</Link>
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300 hover:text-white">Shop</Link>
            <Link to="/subscribe" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300 hover:text-white">Subscription</Link>
            
            <div className="border-t border-gray-700 pt-4">
                 {currentUser ? (
                     <>
                        <div className="text-brand font-bold mb-2">Hello, {currentUser.name}</div>
                        <Link to="/portal" onClick={() => setIsOpen(false)} className="block py-2 text-white">My Portal</Link>
                        <button onClick={handleLogout} className="block py-2 text-gray-400 w-full text-left">Logout</button>
                     </>
                 ) : (
                     <>
                        <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2 text-white">Login</Link>
                        <Link to="/signup" onClick={() => setIsOpen(false)} className="block py-2 text-brand">Create Account</Link>
                     </>
                 )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-charcoal text-gray-400 py-12">
    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
      <div>
        <Logo className="h-10 w-auto mb-4" />
        <p className="text-sm leading-relaxed mb-4">{COMPANY_INFO.tagline}</p>
        <div className="flex space-x-2">
           <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand">F</div>
           <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand">T</div>
           <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand">I</div>
        </div>
      </div>
      <div>
        <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="/shop" className="hover:text-brand">Buy Decoder</Link></li>
          <li><Link to="/subscribe" className="hover:text-brand">Pay Subscription</Link></li>
          <li><Link to="/terms" className="hover:text-brand">Terms & Conditions</Link></li>
          <li><Link to="/contact" className="hover:text-brand">Privacy Policy</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white text-lg font-bold mb-4">Contact Us</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start">
            <MapPin className="h-5 w-5 mr-2 shrink-0 text-brand" />
            <span>{COMPANY_INFO.address}</span>
          </li>
          <li className="flex items-center">
            <Phone className="h-5 w-5 mr-2 shrink-0 text-brand" />
            <a href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`}>{COMPANY_INFO.phone}</a>
          </li>
          <li className="flex items-center">
             <div className="w-5 h-5 mr-2 flex items-center justify-center bg-green-500 rounded-full text-black font-bold text-xs">W</div>
            <a href={COMPANY_INFO.whatsappUrl} target="_blank" rel="noreferrer">WhatsApp Us</a>
          </li>
          <li className="flex items-center">
            <Mail className="h-5 w-5 mr-2 shrink-0 text-brand" />
            <a href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>
          </li>
        </ul>
      </div>
      <div>
        <h3 className="text-white text-lg font-bold mb-4">Newsletter</h3>
        <p className="text-sm mb-4">Subscribe for latest channels and offers.</p>
        <div className="flex">
          <input type="email" placeholder="Email" className="bg-gray-800 text-white px-3 py-2 rounded-l-md w-full focus:outline-none" />
          <button className="bg-brand text-white px-4 py-2 rounded-r-md font-bold hover:bg-brand-dark">Go</button>
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-xs">
      &copy; {new Date().getFullYear()} Moreplex TV. All Rights Reserved.
    </div>
  </footer>
);

const ChatWidget = () => {
    const [open, setOpen] = useState(false);
    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
            {open && (
                <div className="mb-4 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
                    <div className="bg-charcoal text-white p-3 flex justify-between items-center">
                        <span className="font-bold">Admin Support</span>
                        <button onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
                    </div>
                    <div className="p-4 h-64 overflow-y-auto bg-gray-50 text-sm">
                        <div className="mb-2 text-center text-gray-500 text-xs">Today</div>
                        <div className="bg-gray-200 p-2 rounded-lg inline-block max-w-[80%] mb-2">
                            Hello! How can we help you today with your Moreplex Decoder?
                        </div>
                    </div>
                    <div className="p-3 border-t bg-white">
                        <input type="text" placeholder="Type a message..." className="w-full border rounded px-2 py-1 text-sm focus:border-brand outline-none" />
                         <a href={COMPANY_INFO.whatsappUrl} target="_blank" rel="noreferrer" className="block text-center mt-2 text-xs text-brand hover:underline">
                            Or chat on WhatsApp for faster response
                        </a>
                    </div>
                </div>
            )}
            <button 
                onClick={() => setOpen(!open)}
                className="bg-brand hover:bg-brand-dark text-white rounded-full p-4 shadow-lg transition-transform hover:scale-105 flex items-center justify-center"
            >
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                <span className="sr-only">Chat</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </button>
        </div>
    )
}

// --- Auth Components ---

const SignupPage = () => {
    const { registerUser } = useAppContext();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', decoderCode: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = registerUser({
            id: `user-${Date.now()}`,
            role: 'customer',
            joinedDate: new Date(),
            ...formData
        });
        
        if (success) {
            navigate('/portal');
        } else {
            setError('Email already exists. Please login.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-center mb-6 text-charcoal">Create Account</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input required type="text" className="w-full border p-2 rounded focus:ring-brand focus:border-brand" 
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input required type="email" className="w-full border p-2 rounded focus:ring-brand focus:border-brand" 
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input required type="tel" className="w-full border p-2 rounded focus:ring-brand focus:border-brand" 
                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <label className="block text-sm font-bold text-gray-800 mb-1">Decoder Number</label>
                        <p className="text-xs text-gray-500 mb-2">Found on the bottom of your device (e.g., MPX-12345). Leave blank if you don't have one yet.</p>
                        <input type="text" className="w-full border p-2 rounded focus:ring-brand focus:border-brand uppercase placeholder-gray-400" 
                            placeholder="MPX-XXXXXX"
                            value={formData.decoderCode} onChange={e => setFormData({...formData, decoderCode: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input required type="password" className="w-full border p-2 rounded focus:ring-brand focus:border-brand" 
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded transition shadow-lg mt-2">
                        Sign Up
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    Already have an account? <Link to="/login" className="text-brand font-bold hover:underline">Login here</Link>
                </div>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const { loginUser } = useAppContext();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = loginUser(email, password);
        if (success) {
            navigate('/portal');
        } else {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 flex justify-center">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold text-center mb-6 text-charcoal">Login to Your Portal</h2>
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input required type="email" className="w-full border p-2 rounded focus:ring-brand focus:border-brand" 
                            value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input required type="password" className="w-full border p-2 rounded focus:ring-brand focus:border-brand" 
                            value={password} onChange={e => setPassword(e.target.value)} />
                    </div>
                    <button type="submit" className="w-full bg-charcoal hover:bg-gray-900 text-white font-bold py-3 rounded transition shadow-lg mt-2">
                        Login
                    </button>
                </form>
                <div className="mt-6 text-center text-sm">
                    Don't have an account? <Link to="/signup" className="text-brand font-bold hover:underline">Join Moreplex</Link>
                </div>
            </div>
        </div>
    );
};

const UserPortal = () => {
    const { currentUser, orders, addOrder } = useAppContext();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'support' | 'payments'>('dashboard');
    const userOrders = orders.filter(o => o.userId === currentUser?.id);
    
    // Payment Proof State
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [ocrData, setOcrData] = useState<ReceiptData | null>(null);
    const [paymentType, setPaymentType] = useState<'subscription' | 'existing_order'>('subscription');
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [manualDecoderCode, setManualDecoderCode] = useState('');

    useEffect(() => {
        if(currentUser?.decoderCode) setManualDecoderCode(currentUser.decoderCode);
    }, [currentUser]);

    const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReceiptFile(file);
            setIsAnalyzing(true);
            try {
                const data = await analyzeReceipt(file);
                if (data) {
                    setOcrData(data);
                    if(data.decoderCode) setManualDecoderCode(data.decoderCode);
                }
            } catch (err) {
                console.error(err);
                alert("OCR Analysis failed. Please enter details manually.");
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const submitPaymentProof = () => {
        if (!currentUser) return;
        
        let orderPayload: Order;
        const timestamp = new Date();

        if (paymentType === 'existing_order' && selectedOrderId) {
            const existing = orders.find(o => o.id === selectedOrderId);
            orderPayload = {
                id: `VERIFY-${Date.now()}`,
                userId: currentUser.id,
                items: existing ? existing.items : [{ id: 're-verify', name: 'Payment Verification', price: 0, quantity: 1, sku: 'VERIFY', category: 'service', description: `Verification for Order #${selectedOrderId}`, stock: 0, image: '' }],
                total: existing ? existing.total : (ocrData?.amount || 0),
                customerName: currentUser.name,
                customerEmail: currentUser.email,
                status: 'awaiting_ocr',
                extractedDecoderCode: manualDecoderCode,
                timestamp
            };
        } else {
            orderPayload = {
                id: `SUB-PAY-${Date.now()}`,
                userId: currentUser.id,
                items: [{
                    id: 'sub-renewal',
                    name: 'Subscription Payment',
                    sku: 'SUB-RENEWAL',
                    price: ocrData?.amount || 0,
                    category: 'service',
                    description: 'Manual subscription renewal payment',
                    quantity: 1,
                    image: 'https://picsum.photos/200',
                    stock: 999
                }],
                total: ocrData?.amount || 0,
                customerName: currentUser.name,
                customerEmail: currentUser.email,
                status: 'awaiting_ocr',
                extractedDecoderCode: manualDecoderCode,
                timestamp
            };
        }

        addOrder(orderPayload);
        alert("Payment proof uploaded successfully! Admin will verify shortly.");
        setActiveTab('orders');
        setReceiptFile(null);
        setOcrData(null);
    };

    if (!currentUser) return <Navigate to="/login" />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-20 h-20 bg-brand text-white rounded-full flex items-center justify-center text-3xl font-bold mb-2">
                                {currentUser.name.charAt(0)}
                            </div>
                            <h2 className="font-bold text-lg">{currentUser.name}</h2>
                            <p className="text-sm text-gray-500">{currentUser.email}</p>
                        </div>
                        <nav className="space-y-2">
                            <button onClick={() => setActiveTab('dashboard')} className={`w-full text-left px-4 py-2 rounded flex items-center ${activeTab === 'dashboard' ? 'bg-gray-100 text-brand font-bold' : 'hover:bg-gray-50'}`}>
                                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                            </button>
                            <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-2 rounded flex items-center ${activeTab === 'orders' ? 'bg-gray-100 text-brand font-bold' : 'hover:bg-gray-50'}`}>
                                <History className="w-4 h-4 mr-2" /> Order History
                            </button>
                            <button onClick={() => setActiveTab('payments')} className={`w-full text-left px-4 py-2 rounded flex items-center ${activeTab === 'payments' ? 'bg-gray-100 text-brand font-bold' : 'hover:bg-gray-50'}`}>
                                <CreditCard className="w-4 h-4 mr-2" /> Payment Proofs
                            </button>
                            <button onClick={() => setActiveTab('support')} className={`w-full text-left px-4 py-2 rounded flex items-center ${activeTab === 'support' ? 'bg-gray-100 text-brand font-bold' : 'hover:bg-gray-50'}`}>
                                <Phone className="w-4 h-4 mr-2" /> Support
                            </button>
                        </nav>
                    </div>
                </div>

                <div className="flex-grow">
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">
                            <h1 className="text-2xl font-bold">Welcome back, {currentUser.name.split(' ')[0]}</h1>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-charcoal to-gray-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                                    <h3 className="text-gray-400 text-sm font-medium mb-1">My Decoder</h3>
                                    <div className="text-3xl font-mono tracking-wider mb-4">
                                        {currentUser.decoderCode || 'NO DECODER LINKED'}
                                    </div>
                                    {currentUser.decoderCode ? (
                                        <div className="flex space-x-2">
                                            <span className="bg-green-500 text-xs px-2 py-1 rounded">Active</span>
                                            <Link to="/subscribe" className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1 rounded transition">Renew Sub</Link>
                                        </div>
                                    ) : (
                                        <Link to="/shop" className="bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded text-sm inline-block">Buy Decoder</Link>
                                    )}
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-bold mb-4">Quick Actions</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link to="/subscribe" className="p-3 border rounded hover:border-brand hover:text-brand text-center text-sm transition">
                                            Pay Subscription
                                        </Link>
                                        <button onClick={() => setActiveTab('payments')} className="p-3 border rounded hover:border-brand hover:text-brand text-center text-sm transition">
                                            Upload Receipt
                                        </button>
                                        <Link to="/shop" className="p-3 border rounded hover:border-brand hover:text-brand text-center text-sm transition">
                                            Buy Accessories
                                        </Link>
                                        <button onClick={() => setActiveTab('support')} className="p-3 border rounded hover:border-brand hover:text-brand text-center text-sm transition">
                                            Contact Support
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                <h3 className="font-bold mb-4">Recent Orders</h3>
                                {userOrders.length > 0 ? (
                                    <ul className="space-y-3">
                                        {userOrders.slice(0, 3).map(order => (
                                            <li key={order.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                                                <div>
                                                    <span className="font-medium">#{order.id}</span>
                                                    <span className="text-xs text-gray-500 block">{new Date(order.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs ${order.status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No recent activity.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Upload Payment Proof</h2>
                            <p className="text-gray-600 mb-6 text-sm">
                                Upload a screenshot or photo of your bank transfer receipt (JPG, PNG or PDF). 
                                We use AI to verify the transaction details automatically.
                            </p>

                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Upload File</label>
                                    {!receiptFile ? (
                                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                                <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> payment proof</p>
                                                <p className="text-xs text-gray-500 mt-1">MAX 10MB</p>
                                            </div>
                                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleReceiptUpload} />
                                        </label>
                                    ) : (
                                        <div className="border rounded-lg p-4 bg-gray-50 relative">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <FileText className="w-8 h-8 text-brand" />
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold truncate">{receiptFile.name}</p>
                                                    <p className="text-xs text-gray-500">{(receiptFile.size / 1024).toFixed(0)} KB</p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => { setReceiptFile(null); setOcrData(null); }}
                                                className="text-xs text-red-500 hover:text-red-700 underline"
                                            >
                                                Remove File
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    {isAnalyzing && (
                                        <div className="flex items-center text-brand animate-pulse">
                                            <Zap className="w-5 h-5 mr-2" />
                                            <span>Analyzing receipt with AI...</span>
                                        </div>
                                    )}

                                    {receiptFile && !isAnalyzing && (
                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                            <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                                                <CheckCircle className="w-4 h-4 mr-2" /> Extracted Details
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div><span className="text-gray-500">Amount:</span> <span className="font-mono font-bold">₦{ocrData?.amount || '---'}</span></div>
                                                <div><span className="text-gray-500">Date:</span> <span>{ocrData?.date || '---'}</span></div>
                                                <div className="col-span-2"><span className="text-gray-500">Ref:</span> <span className="font-mono text-xs">{ocrData?.transactionRef || '---'}</span></div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1">What is this payment for?</label>
                                        <select 
                                            value={paymentType} 
                                            onChange={(e) => setPaymentType(e.target.value as any)}
                                            className="w-full border p-2 rounded"
                                        >
                                            <option value="subscription">Subscription Renewal</option>
                                            <option value="existing_order">Existing Pending Order</option>
                                        </select>
                                    </div>

                                    {paymentType === 'existing_order' && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Select Pending Order</label>
                                            <select 
                                                value={selectedOrderId} 
                                                onChange={(e) => setSelectedOrderId(e.target.value)}
                                                className="w-full border p-2 rounded"
                                            >
                                                <option value="">-- Select Order --</option>
                                                {userOrders.filter(o => o.status !== 'verified' && o.status !== 'shipped').map(o => (
                                                    <option key={o.id} value={o.id}>Order #{o.id} - ₦{o.total.toLocaleString()}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium mb-1">Decoder / Smart Card Number</label>
                                        <input 
                                            type="text" 
                                            value={manualDecoderCode}
                                            onChange={(e) => setManualDecoderCode(e.target.value)}
                                            placeholder="MPX-..."
                                            className="w-full border p-2 rounded uppercase"
                                        />
                                        {ocrData?.decoderCode && <p className="text-xs text-green-600 mt-1">Detected from receipt</p>}
                                    </div>

                                    <button 
                                        onClick={submitPaymentProof}
                                        disabled={!receiptFile || isAnalyzing || (paymentType === 'existing_order' && !selectedOrderId)}
                                        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded disabled:opacity-50 transition"
                                    >
                                        Submit for Verification
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm min-h-[400px]">
                            <h2 className="text-xl font-bold mb-6">Order History</h2>
                            {userOrders.length === 0 ? (
                                <div className="text-center py-10">
                                    <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">You haven't placed any orders yet.</p>
                                    <Link to="/shop" className="text-brand font-bold hover:underline mt-2 inline-block">Start Shopping</Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userOrders.map(order => (
                                        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="font-bold">Order #{order.id}</div>
                                                    <div className="text-sm text-gray-500">{new Date(order.timestamp).toDateString()}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-brand">₦{order.total.toLocaleString()}</div>
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 capitalize ${
                                                        order.status === 'verified' ? 'bg-green-100 text-green-800' : 
                                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {order.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 border-t pt-2 mt-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between">
                                                        <span>{item.quantity}x {item.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Support Center</h2>
                            <p className="mb-6 text-gray-600">Need help with your decoder or account? Upload a screenshot or describe your issue.</p>
                            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Support ticket created!"); }}>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subject</label>
                                    <select className="w-full border p-2 rounded">
                                        <option>Payment Issue</option>
                                        <option>No Signal</option>
                                        <option>Activation Delay</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Message</label>
                                    <textarea rows={4} className="w-full border p-2 rounded" placeholder="Describe the problem..."></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Attach Image (Optional)</label>
                                    <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-dark hover:file:bg-brand-light/50"/>
                                </div>
                                <button className="bg-charcoal text-white px-6 py-2 rounded font-bold hover:bg-gray-800">Submit Ticket</button>
                            </form>
                            <div className="mt-8 border-t pt-6">
                                <h3 className="font-bold mb-4">Direct Contacts</h3>
                                <div className="flex gap-4">
                                    <a href={COMPANY_INFO.whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center text-green-600 font-bold border border-green-600 px-4 py-2 rounded hover:bg-green-50">
                                        Chat on WhatsApp
                                    </a>
                                    <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center text-charcoal font-bold border border-charcoal px-4 py-2 rounded hover:bg-gray-50">
                                        Call Us
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Pages ---

const HomePage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-black text-white py-24 md:py-48 min-h-[750px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
            {/* VIBRANT MOVIE POSTER WALL BACKGROUND */}
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear animate-ken-burns" 
                 style={{ 
                   backgroundImage: "url('https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop')",
                   filter: "brightness(0.7) contrast(1.1)"
                 }}>
            </div>
            {/* Multi-layered Premium Gradients */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
          <div className="max-w-4xl">
              <span className="inline-block bg-brand text-white text-sm font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest animate-pulse shadow-2xl">
                  DTH • DTT • Video On Demand
              </span>
              <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.05] drop-shadow-[0_8px_30px_rgb(0,0,0,0.8)] animate-slide-in-left opacity-0">
                Redefining <br className="hidden md:block" />
                Entertainment <br className="hidden md:block" />
                with <span className="text-brand inline-block transform hover:scale-105 transition duration-300">Sheer Delight</span>
              </h1>
              <p className="text-xl md:text-3xl text-gray-100 mb-12 max-w-2xl font-semibold drop-shadow-xl leading-relaxed">
                Experience the new dawn of Pay TV in Africa. Premium sports, local blockbusters, and 120+ channels for the whole family.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link to="/shop" className="group bg-brand hover:bg-brand-dark text-white font-black py-5 px-14 rounded-full transition transform hover:scale-105 shadow-2xl flex items-center justify-center text-xl">
                  Get Decoder <Tv className="ml-2 w-7 h-7 group-hover:rotate-12 transition" />
                </Link>
                <Link to="/subscribe" className="bg-white/10 backdrop-blur-xl border-2 border-white/40 hover:bg-white hover:text-charcoal text-white font-bold py-5 px-14 rounded-full transition transform hover:scale-105 shadow-2xl flex items-center justify-center text-xl">
                  Renew Subscription <Zap className="ml-2 w-6 h-6" />
                </Link>
              </div>
          </div>
        </div>
      </section>

      {/* JOLLY DECODER FEATURE SECTION */}
      <section className="bg-gradient-to-b from-red-600 to-red-800 text-white py-16 overflow-hidden relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-10">
              <div className="inline-block bg-white px-4 py-2 rounded-lg mb-6 transform -rotate-2">
                <span className="text-red-600 font-black text-xl tracking-tighter">m MOREPLEX TV</span>
                <span className="block text-gray-500 text-xs font-serif italic">...for us, by us</span>
              </div>
              <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 drop-shadow-2xl animate-swing" 
                  style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.3)' }}>
                JOLLY DECODER
              </h2>
            </div>

            <div className="flex flex-col items-center mb-12">
                <div className="relative w-full max-w-4xl mx-auto">
                     <div className="aspect-video bg-black/20 rounded-xl flex items-center justify-center backdrop-blur-sm border-2 border-white/20 p-8">
                        <div className="text-center">
                            <Tv className="w-24 h-24 mx-auto mb-4 text-white/80" />
                            <p className="text-xl font-bold">New Jolly Decoder</p>
                            <p className="text-sm opacity-75">High Definition Satellite Receiver</p>
                        </div>
                     </div>
                     <div className="absolute -bottom-10 -right-10 md:right-0 w-32 md:w-48 h-auto bg-gray-900 rounded-lg p-2 transform rotate-12 shadow-2xl border border-gray-700 hidden md:block">
                        <div className="grid grid-cols-3 gap-1">
                            {[...Array(12)].map((_,i) => <div key={i} className="h-2 bg-gray-700 rounded-full"></div>)}
                        </div>
                     </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <h3 className="text-center text-2xl font-black uppercase mb-6 bg-red-900/50 py-2 rounded-lg backdrop-blur-sm border border-red-500/30">
                    Jolly Decoder Features
                </h3>
                <div className="grid md:grid-cols-2 gap-px bg-red-500/30 border-2 border-white/20 rounded-xl overflow-hidden shadow-2xl">
                    {JOLLY_FEATURES.map((feature, i) => (
                        <div key={i} className="bg-white/95 text-red-900 px-6 py-4 font-bold text-sm md:text-base flex items-center hover:bg-white transition duration-300">
                            <CheckCircle className="w-5 h-5 mr-3 text-red-600 shrink-0" />
                            {feature}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="text-center mt-12">
                <Link to="/shop" className="inline-block bg-white text-red-700 font-black text-xl py-4 px-12 rounded-full shadow-2xl hover:scale-105 hover:bg-gray-100 transition transform duration-300 uppercase tracking-wide">
                    Buy Now
                </Link>
            </div>
          </div>
          
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
               <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
               <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
          </div>
      </section>

      {/* Services Highlights */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-xl transition border border-gray-100">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Tv className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Direct To Home (DTH)</h3>
              <p className="text-gray-600">Crystal clear satellite TV with coverage across Africa. Enjoy 100+ channels.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-xl transition border border-gray-100">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Digital Terrestrial (DTT)</h3>
              <p className="text-gray-600">Local channels in high definition without a satellite dish using our smart antenna.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-xl text-center hover:shadow-xl transition border border-gray-100">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Video On Demand</h3>
              <p className="text-gray-600">Watch your favorite movies and shows anytime, anywhere with our VOD service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-charcoal mb-12">Why Choose Moreplex?</h2>
            <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center p-4">
                    <Shield className="w-12 h-12 text-brand mx-auto mb-4" />
                    <h4 className="font-bold text-lg mb-2">Reliable Signal</h4>
                    <p className="text-sm text-gray-600">99.9% uptime guaranteed with our advanced Ku-Band satellites.</p>
                </div>
                <div className="text-center p-4">
                    <Zap className="w-12 h-12 text-brand mx-auto mb-4" />
                    <h4 className="font-bold text-lg mb-2">Instant Activation</h4>
                    <p className="text-sm text-gray-600">Automatic activation within minutes of verified payment.</p>
                </div>
                <div className="text-center p-4">
                    <Users className="w-12 h-12 text-brand mx-auto mb-4" />
                    <h4 className="font-bold text-lg mb-2">Family Friendly</h4>
                    <p className="text-sm text-gray-600">Parental controls and dedicated kids channels available.</p>
                </div>
                <div className="text-center p-4">
                    <Clock className="w-12 h-12 text-brand mx-auto mb-4" />
                    <h4 className="font-bold text-lg mb-2">24/7 Support</h4>
                    <p className="text-sm text-gray-600">Our dedicated support team is always ready to assist you.</p>
                </div>
            </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold text-charcoal">Best Sellers</h2>
            <Link to="/shop" className="text-brand font-semibold hover:underline">View All Products &rarr;</Link>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {PRODUCTS.slice(0, 4).map(product => (
              <Link to="/shop" key={product.id} className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="relative h-48 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                </div>
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-brand font-bold">₦{product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Dealer */}
      <section className="py-20 bg-brand">
          <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Become a Moreplex Dealer</h2>
              <p className="text-white/90 text-xl max-w-2xl mx-auto mb-8">Join our growing network of distributors across Nigeria. High commissions and technical training provided.</p>
              <Link to="/contact" className="bg-white text-brand font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition">
                  Apply Now
              </Link>
          </div>
      </section>
    </div>
  );
};

const ShopPage = () => {
    const { addToCart } = useAppContext();
    const [filter, setFilter] = useState('all');

    const filteredProducts = filter === 'all' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === filter);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8 mb-10 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-6 md:mb-0">
                    <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Limited Offer</span>
                    <h2 className="text-3xl font-bold mt-3 mb-2">Get the Full Moreplex Experience</h2>
                    <p className="text-gray-300">Purchase a decoder combo and get 1 month Premium subscription FREE.</p>
                </div>
                <button 
                    onClick={() => {
                         const combo = PRODUCTS.find(p => p.sku === 'MPX-COMBO-01');
                         if(combo) addToCart(combo);
                    }}
                    className="bg-white text-charcoal font-bold py-3 px-6 rounded-lg hover:bg-brand hover:text-white transition"
                >
                    Add Combo to Cart - ₦22,000
                </button>
            </div>

            <h1 className="text-3xl font-bold mb-8 text-charcoal">Moreplex Store</h1>
            
            <div className="flex flex-wrap gap-4 mb-8">
                {['all', 'decoder', 'dish', 'accessory', 'service'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full capitalize ${filter === cat ? 'bg-brand text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="h-48 overflow-hidden relative">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-charcoal mb-1">{product.name}</h3>
                            <p className="text-gray-500 text-xs mb-3">SKU: {product.sku}</p>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                            
                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold text-brand">₦{product.price.toLocaleString()}</span>
                                </div>
                                <button 
                                    onClick={() => addToCart(product)}
                                    className="w-full bg-charcoal hover:bg-gray-800 text-white font-medium py-2 rounded-lg transition flex items-center justify-center"
                                >
                                    <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const CartPage = () => {
    const { cart, removeFromCart, clearCart, addOrder, currentUser } = useAppContext();
    const navigate = useNavigate();
    const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart');
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '', city: '' });
    const [needInstall, setNeedInstall] = useState(true);
    const [receipt, setReceipt] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [ocrData, setOcrData] = useState<ReceiptData | null>(null);
    const [decoderCode, setDecoderCode] = useState('');

    useEffect(() => {
        if (currentUser) {
            setCustomer(prev => ({
                ...prev,
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone,
            }));
            if (currentUser.decoderCode) setDecoderCode(currentUser.decoderCode);
        }
    }, [currentUser]);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const installTotal = needInstall ? cart.reduce((sum, item) => sum + ((item.installationFee || 0) * item.quantity), 0) : 0;
    const total = subtotal + installTotal;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReceipt(file);
            setIsAnalyzing(true);
            try {
                const data = await analyzeReceipt(file);
                if (data) {
                    setOcrData(data);
                    if (data.decoderCode && !decoderCode) setDecoderCode(data.decoderCode);
                }
            } catch (err) {
                console.error(err);
                alert("Could not analyze receipt automatically. Please enter details manually.");
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const handlePlaceOrder = () => {
        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            userId: currentUser?.id,
            items: cart,
            total,
            customerName: customer.name,
            customerEmail: customer.email,
            status: 'awaiting_ocr',
            extractedDecoderCode: decoderCode,
            timestamp: new Date()
        };
        addOrder(newOrder);
        clearCart();
        alert("Order placed successfully! We have received your payment proof.");
        navigate(currentUser ? '/portal' : '/');
    };

    if (cart.length === 0 && step === 'cart') {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
                <Link to="/shop" className="text-brand font-bold hover:underline">Go to Shop</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="flex justify-center mb-8">
                <div className={`w-3 h-3 rounded-full mx-1 ${step === 'cart' ? 'bg-brand' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full mx-1 ${step === 'details' ? 'bg-brand' : 'bg-gray-300'}`}></div>
                <div className={`w-3 h-3 rounded-full mx-1 ${step === 'payment' ? 'bg-brand' : 'bg-gray-300'}`}></div>
            </div>

            {step === 'cart' && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>
                    <div className="space-y-4 mb-6">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded mr-4" />
                                    <div>
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-sm text-gray-500">₦{item.price.toLocaleString()} x {item.quantity}</p>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><X className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setStep('details')} className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-lg mt-6">Checkout</button>
                </div>
            )}

            {step === 'details' && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Delivery Details</h2>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="Full Name" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="border p-3 rounded" />
                        <input type="email" placeholder="Email" value={customer.email} onChange={e => setCustomer({...customer, email: e.target.value})} className="border p-3 rounded" />
                        <input type="tel" placeholder="Phone" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="border p-3 rounded" />
                        <input type="text" placeholder="City" value={customer.city} onChange={e => setCustomer({...customer, city: e.target.value})} className="border p-3 rounded" />
                    </div>
                    <input type="text" placeholder="Full Address" value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full border p-3 rounded mb-6" />
                    <button onClick={() => setStep('payment')} className="bg-brand hover:bg-brand-dark text-white font-bold py-2 px-8 rounded">Proceed to Payment</button>
                </div>
            )}

            {step === 'payment' && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Payment & Verification</h2>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
                        <h3 className="font-bold text-blue-900 mb-2">Bank Transfer Details</h3>
                        <p className="text-sm">Bank: <span className="font-bold">{COMPANY_INFO.bankDetails.bankName}</span></p>
                        <p className="text-sm">Account: <span className="font-bold">{COMPANY_INFO.bankDetails.accountNumber}</span></p>
                        <p className="text-lg font-bold text-brand mt-2">Amount to Pay: ₦{total.toLocaleString()}</p>
                    </div>
                    <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="w-full border p-2 rounded mb-6" />
                    <button disabled={!receipt} onClick={handlePlaceOrder} className="bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded disabled:opacity-50">Confirm Order</button>
                </div>
            )}
        </div>
    );
};

const SubscriptionPage = () => {
    const { currentUser } = useAppContext();
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [decoderCode, setDecoderCode] = useState('');
    const [step, setStep] = useState(1);
    const [receipt, setReceipt] = useState<File | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser?.decoderCode) setDecoderCode(currentUser.decoderCode);
    }, [currentUser]);

    const handleSubscribe = () => {
        alert("Subscription request submitted! Admin will verify payment and activate.");
        navigate(currentUser ? '/portal' : '/');
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-12">Subscribe to Moreplex</h1>
            {step === 1 && (
                <div className="grid md:grid-cols-3 gap-8">
                    {SUBSCRIPTION_PLANS.filter(p => p.type !== 'FTA').map(plan => (
                        <div key={plan.id} className={`border rounded-xl p-8 cursor-pointer ${selectedPlan === plan.id ? 'border-brand ring-2 ring-brand' : 'border-gray-200'}`} onClick={() => setSelectedPlan(plan.id)}>
                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <div className="text-3xl font-bold text-brand my-4">₦{plan.price.toLocaleString()}</div>
                            <button className="w-full py-2 rounded-lg font-bold bg-gray-100">Select Plan</button>
                        </div>
                    ))}
                </div>
            )}
            {step === 1 && selectedPlan && <button onClick={() => setStep(2)} className="mt-8 bg-charcoal text-white px-8 py-3 rounded-lg block mx-auto font-bold">Next Step</button>}
            {step === 2 && (
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border">
                    <input type="text" value={decoderCode} onChange={e => setDecoderCode(e.target.value)} placeholder="Decoder Number (MPX-...)" className="w-full border p-3 rounded mb-4" />
                    <input type="file" onChange={e => setReceipt(e.target.files?.[0] || null)} className="w-full border p-2 rounded mb-6" />
                    <button onClick={handleSubscribe} disabled={!decoderCode || !receipt} className="w-full bg-brand text-white font-bold py-3 rounded">Subscribe</button>
                </div>
            )}
        </div>
    );
};

const AdminPage = () => {
    const { orders, users } = useAppContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    if (!isAuthenticated) return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="bg-white rounded shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left">Order ID</th>
                            <th className="px-6 py-3 text-left">Customer</th>
                            <th className="px-6 py-3 text-left">Total</th>
                            <th className="px-6 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-t">
                                <td className="px-6 py-4">{order.id}</td>
                                <td className="px-6 py-4">{order.customerName}</td>
                                <td className="px-6 py-4">₦{order.total.toLocaleString()}</td>
                                <td className="px-6 py-4 capitalize">{order.status.replace('_', ' ')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <form className="bg-white p-8 rounded shadow-md w-96" onSubmit={e => { e.preventDefault(); if(user === ADMIN_AUTH.username && pass === ADMIN_AUTH.password) onLogin(); }}>
                <h2 className="text-xl font-bold mb-4">Admin Login</h2>
                <input type="text" placeholder="Username" value={user} onChange={e => setUser(e.target.value)} className="w-full border p-2 rounded mb-4" />
                <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} className="w-full border p-2 rounded mb-4" />
                <button className="w-full bg-charcoal text-white py-2 rounded">Login</button>
            </form>
        </div>
    );
};

const App = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => setCart(prev => prev.filter(p => p.id !== id));
    const clearCart = () => setCart([]);
    const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);

    const registerUser = (user: UserType) => {
        if (users.find(u => u.email === user.email)) return false;
        setUsers([...users, user]);
        setCurrentUser(user);
        return true;
    };

    const loginUser = (email: string, pass: string) => {
        const user = users.find(u => u.email === email && u.password === pass);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    return (
        <AppContext.Provider value={{ 
            cart, addToCart, removeFromCart, clearCart, orders, addOrder,
            users, currentUser, registerUser, loginUser, logoutUser: () => setCurrentUser(null) 
        }}>
            <Router>
                <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/shop" element={<ShopPage />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/subscribe" element={<SubscriptionPage />} />
                            <Route path="/admin" element={<AdminPage />} />
                            <Route path="/signup" element={<SignupPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/portal" element={<UserPortal />} />
                            <Route path="/support" element={<ContactPage />} />
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/terms" element={<TermsPage />} />
                        </Routes>
                    </main>
                    <Footer />
                    <ChatWidget />
                </div>
            </Router>
        </AppContext.Provider>
    );
};

const ContactPage = () => (
    <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
        <div className="bg-white p-8 rounded shadow-sm">
            <p><strong>Address:</strong> {COMPANY_INFO.address}</p>
            <p><strong>Phone:</strong> {COMPANY_INFO.phone}</p>
            <p><strong>Email:</strong> {COMPANY_INFO.email}</p>
        </div>
    </div>
);

const TermsPage = () => (
    <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Terms and Conditions</h1>
        <div className="bg-white p-8 rounded shadow-sm whitespace-pre-wrap">{TERMS_TEXT}</div>
    </div>
);

export default App;