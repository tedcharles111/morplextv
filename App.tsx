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

  const isActive = (path: string) => location.pathname === path ? "text-red-600 font-bold" : "text-white hover:text-red-400";

  const handleLogout = () => {
      logoutUser();
      navigate('/');
      setIsOpen(false);
  }

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <Logo className="h-12 w-auto" />
          </Link>

          <div className="hidden md:flex space-x-8 items-center font-medium">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/shop" className={isActive('/shop')}>Shop</Link>
            <Link to="/subscribe" className={isActive('/subscribe')}>Subscription</Link>
            <Link to="/support" className={isActive('/support')}>Support</Link>
            <Link to="/admin" className={isActive('/admin')}>Admin</Link> 
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
                 <div className="hidden md:flex items-center space-x-4">
                     <Link to="/portal" className="flex items-center hover:text-red-600 transition">
                        <User className="h-5 w-5 mr-1 text-red-600" />
                        <span className="text-sm font-semibold truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
                     </Link>
                     <button onClick={handleLogout} className="text-gray-400 hover:text-white transition" title="Logout">
                        <LogOut className="h-5 w-5" />
                     </button>
                 </div>
            ) : (
                <div className="hidden md:flex items-center space-x-2 text-sm">
                    <Link to="/login" className="hover:text-red-600 transition">Login</Link>
                    <span className="text-gray-600">|</span>
                    <Link to="/signup" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full transition font-bold">Join</Link>
                </div>
            )}

            <Link to="/cart" className="relative group">
              <ShoppingCart className="h-6 w-6 text-white group-hover:text-red-600 transition" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
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

      {isOpen && (
        <div className="md:hidden bg-gray-900 pb-4 px-4">
          <div className="flex flex-col space-y-4 pt-2">
            <Link to="/" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300 hover:text-white">Home</Link>
            <Link to="/shop" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300 hover:text-white">Shop</Link>
            <Link to="/subscribe" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300 hover:text-white">Subscription</Link>
            <div className="border-t border-gray-700 pt-4">
                 {currentUser ? (
                     <>
                        <div className="text-red-600 font-bold mb-2">Hello, {currentUser.name}</div>
                        <Link to="/portal" onClick={() => setIsOpen(false)} className="block py-2 text-white">My Portal</Link>
                        <button onClick={handleLogout} className="block py-2 text-gray-400 w-full text-left">Logout</button>
                     </>
                 ) : (
                     <>
                        <Link to="/login" onClick={() => setIsOpen(false)} className="block py-2 text-white">Login</Link>
                        <Link to="/signup" onClick={() => setIsOpen(false)} className="block py-2 text-red-600 font-bold">Create Account</Link>
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
  <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
      <div>
        <Logo className="h-10 w-auto mb-4" />
        <p className="text-sm leading-relaxed mb-4">{COMPANY_INFO.tagline}</p>
        <div className="flex space-x-2">
           <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white transition">f</div>
           <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white transition">t</div>
           <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white transition">i</div>
        </div>
      </div>
      <div>
        <h3 className="text-white text-lg font-bold mb-4 font-display">Quick Links</h3>
        <ul className="space-y-2 text-sm">
          <li><Link to="/shop" className="hover:text-red-600 transition">Buy Decoder</Link></li>
          <li><Link to="/subscribe" className="hover:text-red-600 transition">Subscription</Link></li>
          <li><Link to="/support" className="hover:text-red-600 transition">Support</Link></li>
          <li><Link to="/terms" className="hover:text-red-600 transition">Terms & Conditions</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white text-lg font-bold mb-4 font-display">Contact Us</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start"><MapPin className="h-4 w-4 mr-2 text-red-600 mt-0.5" /> <span className="flex-1">{COMPANY_INFO.address}</span></li>
          <li className="flex items-center"><Phone className="h-4 w-4 mr-2 text-red-600" /> <span>{COMPANY_INFO.phone}</span></li>
          <li className="flex items-center"><Mail className="h-4 w-4 mr-2 text-red-600" /> <span>{COMPANY_INFO.email}</span></li>
        </ul>
      </div>
      <div>
        <h3 className="text-white text-lg font-bold mb-4 font-display">Payment Info</h3>
        <div className="bg-gray-800 p-4 rounded-xl text-xs space-y-1 border border-gray-700">
            <p className="text-red-500 font-bold uppercase tracking-widest text-[10px] mb-1">Bank Details</p>
            <p className="font-bold text-gray-200">{COMPANY_INFO.bankDetails.bankName}</p>
            <p className="text-gray-300 font-mono">{COMPANY_INFO.bankDetails.accountNumber}</p>
            <p className="text-gray-400">{COMPANY_INFO.bankDetails.accountName}</p>
        </div>
      </div>
    </div>
    <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-600">
      <p>&copy; {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved. Powered by Moreplex Group.</p>
    </div>
  </footer>
);

// --- Pages ---

const Home = () => (
  <div className="bg-white">
    {/* Hero Section with Fixed Background and Animated Headline */}
    <section className="relative bg-black text-white py-24 md:py-48 min-h-[750px] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
          {/* USER SPECIFIED CENTRAL CINEMA POSTER WALL BACKGROUND */}
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear animate-ken-burns scale-110" 
               style={{ 
                 backgroundImage: "url('https://ofstartups.com/wp-content/uploads/2024/01/movies-edited-1536x864.jpg')",
                 filter: "brightness(0.75) contrast(1.1) saturate(1.15)"
               }}>
          </div>
          {/* Dynamic Gradient Overlays for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 text-center md:text-left">
        <div className="max-w-4xl">
            <span className="inline-block bg-red-600 text-white text-sm font-black px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest animate-pulse shadow-2xl">
                DTH • DTT • Video On Demand
            </span>
            {/* HEADLINE WITH SLIDE-IN ANIMATION */}
            <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.05] drop-shadow-[0_8px_30px_rgb(0,0,0,0.9)] animate-slide-in-left">
              Redefining <br className="hidden md:block" />
              Entertainment <br className="hidden md:block" />
              with <span className="text-red-600 inline-block transform hover:scale-110 transition duration-300">Sheer Delight</span>
            </h1>
            <p className="text-xl md:text-3xl text-gray-100 mb-12 max-w-2xl font-semibold drop-shadow-xl leading-relaxed">
              Experience the new dawn of Pay TV in Africa. Premium sports, local blockbusters, and 120+ channels for the whole family.
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Link to="/shop" className="group bg-red-600 hover:bg-red-700 text-white font-black py-5 px-14 rounded-full transition transform hover:scale-105 shadow-2xl flex items-center justify-center text-xl">
                Get Decoder <Tv className="ml-2 w-7 h-7 group-hover:rotate-12 transition" />
              </Link>
              <Link to="/subscribe" className="bg-white/10 backdrop-blur-xl border-2 border-white/40 hover:bg-white hover:text-gray-900 text-white font-bold py-5 px-14 rounded-full transition transform hover:scale-105 shadow-2xl flex items-center justify-center text-xl">
                Renew Subscription <Zap className="ml-2 w-6 h-6" />
              </Link>
            </div>
        </div>
      </div>
    </section>

    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black mb-4">Unmatched Features</h2>
          <div className="w-16 h-1.5 bg-red-600 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: <Monitor className="h-10 w-10" />, title: "Crystal HD Picture", desc: "Experience your favorite shows and sports in stunning 1080p high definition quality." },
            { icon: <Zap className="h-10 w-10" />, title: "Fast Activation", desc: "Auto-activation system ensures your service is restored within seconds of payment." },
            { icon: <Shield className="h-10 w-10" />, title: "Durable Hardware", desc: "Our decoders and dishes are built to withstand tropical weather and low signal areas." }
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 p-10 rounded-[2rem] hover:bg-white hover:shadow-2xl transition-all duration-300 border border-gray-100 group">
              <div className="text-red-600 mb-8 bg-white w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition duration-300">{item.icon}</div>
              <h3 className="text-2xl font-black mb-4">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-12 md:mb-0">
                <h2 className="text-4xl font-black mb-8">JOLLY HD DECODER FEATURES</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {JOLLY_FEATURES.slice(0, 10).map((f, i) => (
                        <div key={i} className="flex items-center space-x-3 text-sm text-gray-400">
                            <CheckCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            <span>{f}</span>
                        </div>
                    ))}
                </div>
                <Link to="/shop" className="mt-12 inline-block bg-white text-gray-900 px-10 py-4 rounded-2xl font-black hover:bg-red-600 hover:text-white transition">Buy Decoder Now</Link>
            </div>
            <div className="md:w-1/3">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-red-600 opacity-20 blur-3xl group-hover:opacity-40 transition"></div>
                    <img src="https://picsum.photos/400/500?random=11" alt="Decoder" className="relative z-10 rounded-3xl shadow-2xl" />
                </div>
            </div>
        </div>
    </section>

    <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Join 1 Million+ Happy Viewers</h2>
            <p className="text-gray-500">Moreplex TV is redefining African entertainment.</p>
        </div>
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(t => (
                <div key={t.id} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex text-yellow-400 mb-6 space-x-1">
                        {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="text-gray-700 mb-8 italic text-lg leading-relaxed flex-grow">"{t.text}"</p>
                    <div className="flex items-center space-x-4 pt-6 border-t border-gray-50">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center font-black text-xl">{t.name[0]}</div>
                        <div className="text-left">
                            <h4 className="font-bold text-gray-900">{t.name}</h4>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">{t.location}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </section>
  </div>
);

const Shop = () => {
  const { addToCart } = useAppContext();
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h1 className="text-5xl font-black mb-4">Equipment Store</h1>
            <p className="text-gray-600 text-lg">Official Moreplex TV hardware. Professional installation available nationwide.</p>
          </div>
          <div className="flex flex-wrap gap-2">
              {['All Products', 'Decoders', 'Antennas', 'Accessories', 'Services'].map((tag, i) => (
                  <button key={i} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${i === 0 ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-600 border border-gray-200 hover:border-red-600'}`}>{tag}</button>
              ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map(product => (
            <div key={product.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 group flex flex-col h-full">
              <div className="relative h-64 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute top-6 left-6">
                    <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">{product.category}</span>
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="font-bold text-xl mb-3 leading-tight group-hover:text-red-600 transition h-14 overflow-hidden">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description}</p>
                <div className="mt-auto">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-3xl font-black text-gray-900">₦{product.price.toLocaleString()}</span>
                        {product.installationFee && <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Install Fee: ₦{product.installationFee}</span>}
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center space-x-3"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Subscribe = () => {
    return (
        <div className="bg-white min-h-screen py-24">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-20">
                    <h1 className="text-5xl font-black mb-6">Crystal Clear Entertainment</h1>
                    <p className="text-lg text-gray-600 leading-relaxed">Choose a subscription plan that fits your lifestyle. Flexible payments, premium content, and sheer delight!</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {SUBSCRIPTION_PLANS.filter(p => p.type === 'PayTV').map((plan, i) => (
                        <div key={plan.id} className={`rounded-[3rem] p-10 border-2 transition-all duration-300 flex flex-col ${i === 2 ? 'bg-gray-900 text-white border-gray-900 shadow-2xl scale-105' : 'bg-white text-gray-900 border-gray-100 hover:border-red-600 shadow-sm'}`}>
                            {i === 2 && <div className="bg-red-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] mb-6 self-start">Most Popular</div>}
                            <div className="mb-10">
                                <h3 className={`text-2xl font-black mb-2 ${i === 2 ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                                <div className="flex items-baseline">
                                    <span className="text-5xl font-black tracking-tighter">₦{plan.price.toLocaleString()}</span>
                                    <span className={`ml-2 font-bold ${i === 2 ? 'text-gray-400' : 'text-gray-400'}`}>/{plan.duration}</span>
                                </div>
                            </div>
                            <ul className="space-y-6 mb-12 flex-grow">
                                <li className="flex items-center space-x-4">
                                    <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                                    <span className="font-bold">{plan.channels} HD Channels</span>
                                </li>
                                <li className="flex items-center space-x-4 opacity-80">
                                    <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                                    <span>24/7 Premium Support</span>
                                </li>
                                <li className="flex items-center space-x-4 opacity-80">
                                    <div className="bg-green-500/20 p-1 rounded-full"><CheckCircle className="h-4 w-4 text-green-500" /></div>
                                    <span>Free Mobile App Access</span>
                                </li>
                            </ul>
                            <button className={`w-full py-5 rounded-[1.5rem] font-black text-lg shadow-xl transition-all ${i === 2 ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-900 text-white hover:bg-red-600'}`}>Select {plan.name.split(' ')[1]}</button>
                        </div>
                    ))}
                </div>

                <div className="mt-24 max-w-5xl mx-auto bg-gradient-to-r from-red-600 to-red-800 rounded-[3rem] p-12 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-red-600/30">
                    <div className="mb-8 md:mb-0 max-w-md">
                        <h3 className="text-3xl font-black mb-4">Moreplex FTA Mode</h3>
                        <p className="text-red-100 text-lg">Don't want to subscribe this month? Our decoder automatically switches to FTA mode with 15+ free local channels. Always connected.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-red-200 font-black text-[12px] uppercase tracking-[0.3em] mb-4">Always Free • No Expiry</span>
                        <Link to="/shop" className="bg-white text-red-700 px-12 py-5 rounded-2xl font-black text-xl hover:bg-gray-100 transition shadow-xl">Get Your Decoder</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Cart = () => {
    const { cart, removeFromCart, clearCart } = useAppContext();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center">
                <div className="bg-gray-50 w-32 h-32 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <ShoppingCart className="h-12 w-12 text-gray-300" />
                </div>
                <h2 className="text-4xl font-black mb-4">Your bag is empty</h2>
                <p className="text-gray-500 mb-10 text-lg">Seems like you haven't added any Moreplex magic to your cart yet.</p>
                <Link to="/shop" className="bg-red-600 text-white px-12 py-4 rounded-2xl font-black text-lg hover:bg-red-700 transition shadow-xl shadow-red-600/20">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex items-center justify-between mb-12">
                    <h1 className="text-4xl font-black">Your Shopping Bag</h1>
                    <button onClick={clearCart} className="text-gray-400 hover:text-red-600 font-bold transition flex items-center"><X className="h-4 w-4 mr-1" /> Clear Bag</button>
                </div>
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white p-6 rounded-[2rem] flex items-center border border-gray-100 shadow-sm hover:shadow-md transition">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden mr-8 flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-black text-xl mb-1">{item.name}</h3>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{item.category}</p>
                                    <div className="flex items-center mt-3 text-sm text-gray-500 font-bold">
                                        Qty: {item.quantity}
                                    </div>
                                </div>
                                <div className="text-right ml-4">
                                    <p className="font-black text-2xl mb-4 text-gray-900">₦{(item.price * item.quantity).toLocaleString()}</p>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs font-black uppercase hover:underline">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-6">
                        <div className="bg-gray-900 text-white p-10 rounded-[2.5rem] shadow-2xl sticky top-28">
                            <h3 className="text-2xl font-black mb-8">Summary</h3>
                            <div className="space-y-5 mb-10">
                                <div className="flex justify-between text-gray-400 font-bold">
                                    <span>Subtotal</span>
                                    <span>₦{total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 font-bold">
                                    <span>Shipping</span>
                                    <span className="text-red-500">Free</span>
                                </div>
                                <div className="border-t border-gray-800 pt-6 flex justify-between text-3xl font-black">
                                    <span>Total</span>
                                    <span className="text-white font-display tracking-tighter">₦{total.toLocaleString()}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-red-700 transition-all shadow-xl shadow-red-600/30"
                            >
                                Checkout
                            </button>
                            <p className="text-center mt-6 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Secure SSL Encrypted Checkout</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Checkout = () => {
    const { cart, addOrder, clearCart, currentUser } = useAppContext();
    const [step, setStep] = useState(1);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractedData, setExtractedData] = useState<ReceiptData | null>(null);
    const [customerInfo, setCustomerInfo] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        address: ''
    });
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceiptFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!receiptFile) return;
        setIsAnalyzing(true);
        const data = await analyzeReceipt(receiptFile);
        setExtractedData(data);
        setIsAnalyzing(false);
        if (data) setStep(3);
        else alert("Failed to analyze receipt. Please try again or fill manually.");
    };

    const handleComplete = () => {
        const order: Order = {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            items: cart,
            total,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            status: 'awaiting_ocr',
            timestamp: new Date(),
            extractedDecoderCode: extractedData?.decoderCode
        };
        addOrder(order);
        clearCart();
        setStep(4);
    };

    return (
        <div className="bg-white min-h-screen py-20">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="flex justify-between items-center mb-16 relative">
                    <div className="absolute h-1 bg-gray-100 top-1/2 left-0 right-0 -z-10"></div>
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all ${step >= s ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>{s}</div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                        <h2 className="text-3xl font-black mb-8 text-gray-900">Delivery Details</h2>
                        <div className="space-y-5">
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    type="text" className="w-full p-5 rounded-2xl border-none shadow-inner bg-white" 
                                    value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <input 
                                        type="email" className="w-full p-5 rounded-2xl border-none shadow-inner bg-white" 
                                        value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                                    <input 
                                        type="tel" className="w-full p-5 rounded-2xl border-none shadow-inner bg-white" 
                                        value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Address</label>
                                <textarea 
                                    className="w-full p-5 rounded-2xl border-none shadow-inner bg-white h-32"
                                    value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                                ></textarea>
                            </div>
                        </div>
                        <button onClick={() => setStep(2)} className="w-full bg-gray-900 text-white py-5 rounded-2xl mt-10 font-black text-lg hover:bg-red-600 transition shadow-xl">Proceed to Payment</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center">
                        <h2 className="text-3xl font-black mb-4">Complete Payment</h2>
                        <p className="text-gray-500 mb-10 text-lg">Transfer <span className="text-red-600 font-black">₦{total.toLocaleString()}</span> to the following account:</p>
                        
                        <div className="bg-white p-8 rounded-[2rem] mb-10 text-left border border-gray-100 shadow-sm space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Bank Name</p>
                                <p className="font-black text-lg text-gray-900">{COMPANY_INFO.bankDetails.bankName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Account Number</p>
                                <p className="font-black text-2xl text-red-600 font-mono tracking-tighter">{COMPANY_INFO.bankDetails.accountNumber}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Account Name</p>
                                <p className="font-black text-lg text-gray-900">{COMPANY_INFO.bankDetails.accountName}</p>
                            </div>
                        </div>

                        <div className={`border-4 border-dashed rounded-[2.5rem] p-12 transition-all ${receiptFile ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-red-400'}`}>
                            <input type="file" id="receipt" className="hidden" onChange={handleFileChange} accept="image/*" />
                            <label htmlFor="receipt" className="cursor-pointer flex flex-col items-center">
                                {receiptFile ? <CheckCircle className="h-16 w-16 text-green-500 mb-4" /> : <Upload className="h-16 w-16 text-red-600 mb-4" />}
                                <p className="font-black text-xl text-gray-900">{receiptFile ? 'Receipt Selected' : 'Upload Receipt'}</p>
                                <p className="text-sm text-gray-400 mt-2 font-medium">{receiptFile ? receiptFile.name : 'Screenshot or photo of transfer'}</p>
                            </label>
                        </div>

                        <button 
                            disabled={!receiptFile || isAnalyzing}
                            onClick={handleAnalyze}
                            className="w-full bg-red-600 text-white py-5 rounded-2xl mt-10 font-black text-xl disabled:bg-gray-200 disabled:text-gray-400 shadow-2xl shadow-red-600/20 flex items-center justify-center space-x-3"
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>AI Verification...</span>
                                </>
                            ) : (
                                <span>Verify & Continue</span>
                            )}
                        </button>
                    </div>
                )}

                {step === 3 && extractedData && (
                    <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                        <div className="flex items-center space-x-4 mb-10">
                            <div className="bg-green-500 p-3 rounded-2xl"><CheckCircle className="h-8 w-8 text-white" /></div>
                            <h2 className="text-3xl font-black">AI Verification Success</h2>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 mb-10 space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Detected Amount</span>
                                <span className="font-black text-xl text-green-600">₦{extractedData.amount?.toLocaleString() || '---'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Transaction Ref</span>
                                <span className="font-mono text-sm font-black">{extractedData.transactionRef || '---'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-xs uppercase tracking-widest">Decoder IUC</span>
                                <span className="font-black text-red-600">{extractedData.decoderCode || 'Pending Sync'}</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mb-10 px-4">Our AI has successfully extracted these details from your receipt. If anything looks wrong, you can contact support after placing the order.</p>
                        <button onClick={handleComplete} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-red-600 transition-all">Confirm & Place Order</button>
                    </div>
                )}

                {step === 4 && (
                    <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/30">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <h2 className="text-4xl font-black mb-6">Order Placed!</h2>
                        <p className="text-gray-500 mb-12 text-lg leading-relaxed">Your entertainment is on the way. We've received your payment and will dispatch your order immediately. A confirmation has been sent to your email.</p>
                        <Link to="/" className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-red-600 transition shadow-xl">Return to Home</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

const Login = () => {
    const { loginUser } = useAppContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginUser(email, password)) {
            navigate('/portal');
        } else {
            setError('Invalid credentials. Please try again.');
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-24 flex items-center justify-center px-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-red-600"></div>
                <div className="text-center mb-10">
                    <Logo className="h-12 w-auto mb-8" />
                    <h1 className="text-3xl font-black mb-2">Welcome Back</h1>
                    <p className="text-gray-400 font-medium">Log in to manage your subscription</p>
                </div>
                {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-sm font-bold flex items-center border border-red-100"><AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" /> {error}</div>}
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                            type="email" placeholder="name@example.com" required className="w-full p-5 rounded-2xl bg-gray-50 border-none shadow-inner"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <input 
                            type="password" placeholder="••••••••" required className="w-full p-5 rounded-2xl bg-gray-50 border-none shadow-inner"
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-red-700 transition shadow-xl shadow-red-600/20">Login</button>
                </form>
                <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                    <p className="text-gray-400 font-medium">New to Moreplex? <Link to="/signup" className="text-red-600 font-black hover:underline ml-1">Create Account</Link></p>
                </div>
            </div>
        </div>
    );
};

const SignUp = () => {
    const { registerUser } = useAppContext();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
    const navigate = useNavigate();

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: UserType = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
            role: 'customer',
            joinedDate: new Date()
        };
        if (registerUser(newUser)) {
            navigate('/portal');
        } else {
            alert("Email is already registered. Please login.");
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen py-24 flex items-center justify-center px-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 w-full max-w-md relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-red-600"></div>
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black mb-2">Create Account</h1>
                    <p className="text-gray-400 font-medium">Join Africa's premium DTH platform</p>
                </div>
                <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                            type="text" placeholder="John Doe" required className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
                        <input 
                            type="email" placeholder="john@example.com" required className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone</label>
                        <input 
                            type="tel" placeholder="08012345678" required className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner"
                            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                        <input 
                            type="password" placeholder="••••••••" required className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner"
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-red-600 transition shadow-xl mt-4">Sign Up</button>
                </form>
                <div className="mt-10 pt-8 border-t border-gray-50 text-center">
                    <p className="text-gray-400 font-medium">Already have an account? <Link to="/login" className="text-red-600 font-black hover:underline ml-1">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

const UserPortal = () => {
    const { currentUser, orders } = useAppContext();
    const userOrders = orders.filter(o => o.customerEmail === currentUser?.email);

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col lg:flex-row gap-10">
                    <aside className="lg:w-1/4">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 mb-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600"></div>
                            <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-3xl font-black shadow-inner">
                                {currentUser?.name[0]}
                            </div>
                            <h3 className="font-black text-xl mb-1">{currentUser?.name}</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{currentUser?.phone}</p>
                        </div>
                        <nav className="space-y-3">
                            {[
                                { icon: <LayoutDashboard />, label: "Dashboard", active: true },
                                { icon: <History />, label: "My Orders" },
                                { icon: <Monitor />, label: "Channels" },
                                { icon: <History />, label: "Recharge History" },
                                { icon: <Settings />, label: "Security" }
                            ].map((item, i) => (
                                <button key={i} className={`w-full flex items-center space-x-4 p-5 rounded-2xl font-black transition-all ${item.active ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}>
                                    <span className="flex-shrink-0">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>
                    <main className="lg:w-3/4">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[3rem] p-12 text-white mb-10 flex flex-col md:flex-row justify-between items-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full -mr-32 -mt-32 transition group-hover:bg-red-600/20"></div>
                            <div className="relative z-10">
                                <p className="text-red-500 text-[10px] uppercase tracking-[0.4em] font-black mb-4">Active Subscription</p>
                                <h2 className="text-5xl font-black tracking-tighter mb-4">Family Package</h2>
                                <div className="flex items-center space-x-4 text-gray-400 font-bold">
                                    <Clock className="h-4 w-4 text-red-600" />
                                    <span>Expires in 22 Days (Oct 28)</span>
                                </div>
                            </div>
                            <div className="relative z-10 mt-10 md:mt-0">
                                <button className="bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-2xl font-black text-lg transition shadow-xl shadow-red-600/30">Quick Renew</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-black">Recent Orders</h3>
                            <button className="text-red-600 font-black text-sm uppercase tracking-widest hover:underline">View All</button>
                        </div>

                        {userOrders.length > 0 ? (
                            <div className="space-y-6">
                                {userOrders.map(order => (
                                    <div key={order.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center group hover:border-red-600 transition duration-300">
                                        <div className="flex items-center space-x-6 mb-6 sm:mb-0">
                                            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-red-50 group-hover:text-red-600 transition"><ShoppingCart className="h-6 w-6" /></div>
                                            <div>
                                                <p className="font-black text-lg">Order #{order.id}</p>
                                                <p className="text-xs text-gray-400 font-bold">{new Date(order.timestamp).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                            </div>
                                        </div>
                                        <div className="text-center sm:text-right">
                                            <p className="font-black text-2xl text-gray-900 mb-2">₦{order.total.toLocaleString()}</p>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'verified' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{order.status.replace('_', ' ')}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-gray-200 p-24 rounded-[3rem] text-center">
                                <History className="h-16 w-16 text-gray-100 mx-auto mb-6" />
                                <p className="text-gray-400 font-black text-xl uppercase tracking-widest">No orders yet</p>
                                <Link to="/shop" className="text-red-600 font-black mt-4 inline-block hover:underline">Start Shopping</Link>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { orders, users } = useAppContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginData, setLoginData] = useState({ user: '', pass: '' });

    if (!isAuthenticated) {
        return (
            <div className="bg-gray-900 min-h-screen py-24 flex items-center justify-center px-4">
                <div className="bg-white p-12 rounded-[3rem] shadow-2xl w-full max-w-sm relative">
                    <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-600/30">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black mb-8 text-center text-gray-900">Admin Control</h2>
                    <div className="space-y-4">
                        <input 
                            type="text" placeholder="Username" className="w-full p-5 bg-gray-50 border-none rounded-2xl shadow-inner"
                            onChange={e => setLoginData({...loginData, user: e.target.value})}
                        />
                        <input 
                            type="password" placeholder="Password" className="w-full p-5 bg-gray-50 border-none rounded-2xl shadow-inner"
                            onChange={e => setLoginData({...loginData, pass: e.target.value})}
                        />
                        <button 
                            onClick={() => {
                                if (loginData.user === ADMIN_AUTH.username && loginData.pass === ADMIN_AUTH.password) setIsAuthenticated(true);
                                else alert("Access Denied: Invalid Admin Credentials");
                            }}
                            className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-red-700 transition"
                        >
                            Authorize Access
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-16">
                    <h1 className="text-4xl font-black flex items-center"><Shield className="h-10 w-10 mr-4 text-red-600" /> Command Center</h1>
                    <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">Live Server Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    {[
                        { label: "Volume", value: orders.length, icon: <ShoppingCart className="h-6 w-6" />, color: "red" },
                        { label: "Revenue", value: `₦${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}`, icon: <CreditCard className="h-6 w-6" />, color: "blue" },
                        { label: "Members", value: users.length, icon: <Users className="h-6 w-6" />, color: "green" },
                        { label: "Verification", value: orders.filter(o => o.status === 'awaiting_ocr').length, icon: <Clock className="h-6 w-6" />, color: "yellow" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-xl transition duration-500">
                            <div>
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                                <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                            </div>
                            <div className="text-gray-200 group-hover:text-red-600 transition-colors duration-500">{stat.icon}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <h2 className="font-black text-2xl">Order Management</h2>
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                            {['All', 'Pending', 'Verified'].map((f, i) => <button key={i} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${i === 0 ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>{f}</button>)}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-50">
                                <tr>
                                    <th className="px-10 py-6">Reference</th>
                                    <th className="px-10 py-6">Client</th>
                                    <th className="px-10 py-6">Value</th>
                                    <th className="px-10 py-6">Status</th>
                                    <th className="px-10 py-6">IUC Sync</th>
                                    <th className="px-10 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.map(o => (
                                    <tr key={o.id} className="hover:bg-gray-50/50 transition duration-300">
                                        <td className="px-10 py-8">
                                            <span className="font-mono text-sm font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">#{o.id}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="font-black text-gray-900 leading-none mb-1">{o.customerName}</p>
                                            <p className="text-xs text-gray-400 font-medium">{o.customerEmail}</p>
                                        </td>
                                        <td className="px-10 py-8 font-black text-gray-900">₦{o.total.toLocaleString()}</td>
                                        <td className="px-10 py-8">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${o.status === 'awaiting_ocr' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>{o.status.replace('_', ' ')}</span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="font-mono text-xs font-black text-red-600">{o.extractedDecoderCode || 'MANUAL REQ'}</span>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><FileText className="h-5 w-5" /></button>
                                                <button className="p-3 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition"><Settings className="h-5 w-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Support = () => (
    <div className="bg-white min-h-screen py-24">
        <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-6xl font-black mb-6 tracking-tighter">How can we help?</h1>
            <p className="text-xl text-gray-500 mb-20 leading-relaxed">Our support heroes are available 24/7 to ensure your entertainment never stops. Reach out via your preferred channel.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <a href={COMPANY_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-green-50/50 p-12 rounded-[3rem] border border-green-100 hover:shadow-2xl transition duration-500 group">
                    <div className="w-20 h-20 bg-green-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20 group-hover:scale-110 transition duration-500"><Phone className="h-10 w-10" /></div>
                    <h3 className="font-black text-2xl mb-2">WhatsApp</h3>
                    <p className="text-gray-500 text-sm font-medium">Instant chat with an agent</p>
                    <p className="text-green-600 font-black mt-6 uppercase tracking-widest text-xs">Start Conversation</p>
                </a>
                <div className="bg-blue-50/50 p-12 rounded-[3rem] border border-blue-100 hover:shadow-2xl transition duration-500 group">
                    <div className="w-20 h-20 bg-blue-500 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20 group-hover:scale-110 transition duration-500"><Mail className="h-10 w-10" /></div>
                    <h3 className="font-black text-2xl mb-2">Email Desk</h3>
                    <p className="text-gray-500 text-sm font-medium">Technical & billing queries</p>
                    <p className="text-blue-600 font-black mt-6 text-xs">{COMPANY_INFO.email}</p>
                </div>
                <div className="bg-red-50/50 p-12 rounded-[3rem] border border-red-100 hover:shadow-2xl transition duration-500 group">
                    <div className="w-20 h-20 bg-red-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-600/20 group-hover:scale-110 transition duration-500"><MapPin className="h-10 w-10" /></div>
                    <h3 className="font-black text-2xl mb-2">Office</h3>
                    <p className="text-gray-500 text-sm font-medium">Visit our experience center</p>
                    <p className="text-red-600 font-black mt-6 text-[10px] uppercase leading-tight tracking-widest">Ikeja, Lagos</p>
                </div>
            </div>

            <div className="mt-24 p-12 bg-gray-50 rounded-[3rem] border border-gray-100 flex flex-col items-center">
                <Monitor className="h-16 w-16 text-red-200 mb-6" />
                <h3 className="text-2xl font-black mb-4">Self-Help Installation Guide</h3>
                <p className="text-gray-500 mb-10 max-w-lg">Can't wait for a technician? Our step-by-step video guide shows you how to set up your Moreplex TV dish and decoder in 15 minutes.</p>
                <button className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-lg hover:bg-red-600 transition flex items-center shadow-xl">
                    <PlayCircle className="h-6 w-6 mr-3" /> Watch Guide
                </button>
            </div>
        </div>
    </div>
);

const Terms = () => (
    <div className="bg-gray-50 min-h-screen py-24">
        <div className="container mx-auto px-4 max-w-4xl">
            <h1 className="text-5xl font-black mb-4 tracking-tighter">Terms of Service</h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-12 ml-1">Last Updated: January 2025</p>
            <div className="bg-white p-12 md:p-20 rounded-[4rem] shadow-sm border border-gray-100 prose prose-red max-w-none prose-headings:font-black prose-p:text-gray-600 prose-p:leading-relaxed">
                <div className="whitespace-pre-wrap font-medium">
                    {TERMS_TEXT}
                </div>
            </div>
        </div>
    </div>
);

// --- Main App Component ---

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => setCart([]);

  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);

  const registerUser = (user: UserType) => {
    if (users.find(u => u.email === user.email)) return false;
    setUsers(prev => [...prev, user]);
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

  const logoutUser = () => setCurrentUser(null);

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, clearCart,
      orders, addOrder, users, currentUser, registerUser, loginUser, logoutUser
    }}>
      <Router>
        <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans antialiased">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/support" element={<Support />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/portal" element={currentUser ? <UserPortal /> : <Navigate to="/login" />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;