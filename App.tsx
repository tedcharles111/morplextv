
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, Phone, Mail, MapPin, Search, 
  Upload, CheckCircle, AlertCircle, PlayCircle, Monitor, Tv,
  Star, Shield, Clock, Users, Zap, Lock, User, LogOut, LayoutDashboard, History, Settings, CreditCard, FileText,
  MessageCircle, Send, Bot, Trash2, Truck, Check, Package, Inbox, Eye, ExternalLink
} from 'lucide-react';
import { COMPANY_INFO, PRODUCTS, SUBSCRIPTION_PLANS, TERMS_TEXT, TESTIMONIALS, ADMIN_AUTH, INITIAL_USERS, INITIAL_ORDERS } from './constants';
import { Product, CartItem, Order, SubscriptionPlan, ReceiptData, User as UserType } from './types';
import { sendChatMessage } from './services/geminiService';

// --- Global Context ---
interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
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

const CHANNEL_LOGOS = [
  "https://unificationprod.azurewebsites.net/media/ghrfqv5t/artiicle-zee-world-unveils-enhanced-channel-offering-on-dstv_1920x1080.jpg",
  "https://archive.org/download/supersport-tennis/supersport-tennis.png",
  "https://ng.moreplextv.com/wp-content/uploads/2025/09/black-Diamond.png",
  "https://ng.moreplextv.com/wp-content/uploads/2025/09/disney-jr.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/10/cinemachi-max.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/10/moreplex-music1.png",
  "https://ng.moreplextv.com/wp-content/uploads/2025/09/fix-foxi.png",
  "https://ng.moreplextv.com/wp-content/uploads/2025/09/fix-foxi.png",
  "https://ng.moreplextv.com/wp-content/uploads/2023/06/S-Premier-League-768x432.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/10/Sunna-tv.jpg",
  "https://ng.moreplextv.com/wp-content/uploads/2022/10/lollykids.jpg",
  "https://ng.moreplextv.com/wp-content/uploads/2022/10/Pentecost.jpg",
  "https://ng.moreplextv.com/wp-content/uploads/2022/12/mbc-2.png",
  "https://ng.moreplextv.com/wp-content/uploads/2025/09/starLife.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/10/Arirang-1.jpg",
  "https://ng.moreplextv.com/wp-content/uploads/2022/12/christainment-tv.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/10/KBS-KOREA.jpg",
  "https://ng.moreplextv.com/wp-content/uploads/2022/12/foodies.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/12/MTV-BASE.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/12/top-sports.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/12/top-sports.png",
  "https://ng.moreplextv.com/wp-content/uploads/2022/10/fitness.jpg"
];

// --- Helper Functions ---
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Components ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Logo = ({ className }: { className?: string }) => (
  <div className={`bg-white rounded-lg p-1 inline-block ${className}`}>
    <img 
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPzhubhA7zHDKi6p3ZPfVKXRngf1upUQkL7A&s" 
      alt="Moreplex TV Logo" 
      className="h-full w-auto object-contain"
    />
  </div>
);

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{sender: 'user' | 'bot', text: string}>>([
        { sender: 'bot', text: "Hello! I'm Plexy. How can I assist you with your Moreplex TV experience today?" }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
        setIsTyping(true);

        const response = await sendChatMessage(userMsg);
        
        setMessages(prev => [...prev, { sender: 'bot', text: response }]);
        setIsTyping(false);
    };

    return (
        <>
            <div className={`fixed bottom-24 right-6 z-50 w-80 md:w-96 bg-white rounded-3xl shadow-2xl flex flex-col transition-all duration-300 transform origin-bottom-right border border-gray-100 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ maxHeight: '600px' }}>
                <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-3xl flex justify-between items-center text-white">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white/20 p-2 rounded-full"><Bot className="h-6 w-6" /></div>
                        <div>
                            <h3 className="font-black text-lg">Live Support</h3>
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-xs opacity-80">Online</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition"><X className="h-5 w-5" /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50 h-[350px]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2 text-red-600 flex-shrink-0"><Bot className="h-4 w-4" /></div>}
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-gray-900 text-white rounded-br-none' : 'bg-white text-gray-700 shadow-sm rounded-bl-none border border-gray-100'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                             <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2 text-red-600 flex-shrink-0"><Bot className="h-4 w-4" /></div>
                             <div className="bg-white text-gray-500 p-4 rounded-2xl rounded-bl-none shadow-sm border border-gray-100">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="p-4 bg-white rounded-b-3xl border-t border-gray-100">
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full bg-gray-100 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 transition" 
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </form>
            </div>

            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="fixed bottom-6 right-6 z-50 bg-red-600 text-white p-4 rounded-full shadow-[0_8px_30px_rgb(220,38,38,0.4)] hover:bg-red-700 transition transform hover:scale-110 active:scale-95 group"
            >
                {isOpen ? <X className="h-8 w-8" /> : <MessageCircle className="h-8 w-8" />}
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                </span>
            </button>
        </>
    );
};

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

    {/* SHOWCASE SECTION: JOLLY DECODER PROMOTIONAL FLYER */}
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
            <h2 className="text-5xl font-black tracking-tighter mb-4">THE JOLLY DECODER</h2>
            <p className="text-xl font-bold text-red-600 uppercase tracking-widest">Built for performance. Designed for delight.</p>
        </div>
        <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-gray-100 group bg-gray-900">
          {/* USER SPECIFIED JOLLY DECODER PROMO IMAGE */}
          <img 
            src="https://ng.moreplextv.com/wp-content/uploads/2024/12/5.png" 
            alt="Moreplex Jolly Decoder Full Promotional Flyer" 
            className="w-full h-auto object-cover transform transition duration-[1.5s] group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>

    <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-12 md:mb-0">
                <h2 className="text-4xl font-black mb-8 uppercase tracking-tighter">Premium Hardware Standards</h2>
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
                    <img src="https://freepressnews.com.ng/wp-content/uploads/2026/01/morree.jpg" alt="Decoder Detail" className="relative z-10 rounded-3xl shadow-2xl" />
                </div>
            </div>
        </div>
    </section>

    {/* FAMILY FRIENDLY SECTION */}
    <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 relative">
                <div className="absolute -inset-4 bg-red-100 rounded-[3.5rem] transform -rotate-2 scale-105 z-0"></div>
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                     <img 
                        src="https://dano.com.ng/wp-content/uploads/2019/09/family-watching-tv-together.jpg" 
                        alt="Family watching TV" 
                        className="w-full h-auto object-cover hover:scale-105 transition duration-700" 
                    />
                </div>
            </div>
            <div className="md:w-1/2">
                <span className="text-red-600 font-black tracking-widest uppercase text-xs mb-2 block">Wholesome Entertainment</span>
                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight text-gray-900">Content the Whole Family Will Love</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Create lasting memories with entertainment that brings everyone together. Our channels are carefully selected to ensure safe, educational, and exciting viewing for all ages.
                </p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-10">
                    {['Parental Controls', 'Kid-Friendly Zone', 'Educational Series', 'Family Movies'].map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                             <CheckCircle className="h-5 w-5 text-red-600" />
                             <span className="font-bold text-gray-800">{feature}</span>
                        </div>
                    ))}
                </div>
                <Link to="/subscribe" className="inline-flex items-center bg-red-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-red-700 transition shadow-xl shadow-red-600/20">
                    Explore Channels
                </Link>
            </div>
        </div>
    </section>

    {/* OUR CHANNELS SECTION */}
    <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Our Channels</h2>
            <div className="w-16 h-1.5 bg-red-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="relative w-full">
            <div className="flex space-x-12 animate-marquee whitespace-nowrap hover:pause">
                {/* Render logos twice for seamless loop */}
                {[...CHANNEL_LOGOS, ...CHANNEL_LOGOS].map((logo, index) => (
                    <div key={index} className="w-48 h-32 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-4 hover:shadow-lg transition-shadow duration-300">
                         <img src={logo} alt={`Channel ${index}`} className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition duration-300" />
                    </div>
                ))}
            </div>
        </div>
        
        <style>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-marquee {
                animation: marquee 40s linear infinite;
            }
            .hover\\:pause:hover {
                animation-play-state: paused;
            }
        `}</style>
    </section>

    <section className="py-24 bg-white">
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

    {/* Immersive Movie Wallpaper Section */}
    <section className="relative w-full h-[600px] overflow-hidden bg-black">
        <div className="absolute inset-0">
             <img 
                src="https://www.cockroachlabs.com/_next/image/?url=https%3A%2F%2Fimages.ctfassets.net%2F00voh0j35590%2F2hcGftfw67krNyVIpkxAHn%2F34541f4c44d866214e3176d94a46a77a%2Fnetflix-banner-with-crl-overlay.png&w=2048&q=75" 
                alt="Moreplex Entertainment Content" 
                className="w-full h-full object-cover animate-ken-burns opacity-60"
             />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-black/20"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-10">
             <h2 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-tight">Endless Entertainment</h2>
             <p className="text-2xl text-white/90 font-medium drop-shadow-md max-w-3xl">Get ready to immerse yourself in a vast library of movies, series, and exclusive shows.</p>
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
                        {product.customPriceDisplay ? (
                          <span className="text-xl font-black text-gray-900">{product.customPriceDisplay}</span>
                        ) : (
                          <span className="text-3xl font-black text-gray-900">₦{product.price.toLocaleString()}</span>
                        )}
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
                        <div 
                          key={plan.id} 
                          className={`rounded-[3rem] p-10 border-2 transition-all duration-500 flex flex-col transform hover:-translate-y-4 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.2)] animate-slide-in-up ${i === 2 ? 'bg-gray-900 text-white border-gray-900 shadow-2xl scale-105 hover:scale-[1.08]' : 'bg-white text-gray-900 border-gray-100 hover:border-red-600 shadow-sm'}`}
                          style={{ animationDelay: `${i * 150}ms` }}
                        >
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
                        {/* Fixed missing opening tag for h3 here */}
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

    const handleComplete = async () => {
        let receiptUrl = undefined;
        if (receiptFile) {
            // Convert file to base64 to store in the order for admin viewing
            try {
                const base64 = await fileToBase64(receiptFile);
                receiptUrl = `data:${receiptFile.type || 'image/jpeg'};base64,${base64}`;
            } catch (err) {
                console.error("Failed to read receipt file", err);
            }
        }

        const order: Order = {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            items: cart,
            total,
            customerName: customerInfo.name,
            customerEmail: customerInfo.email,
            status: 'pending_verification',
            timestamp: new Date(),
            receiptUrl,
            extractedDecoderCode: undefined // No manual entry provided in form, could add one if desired
        };
        addOrder(order);
        clearCart();
        setStep(3);
    };

    if (cart.length === 0 && step !== 3) {
        return <Navigate to="/shop" replace />;
    }

    return (
        <div className="bg-white min-h-screen py-20">
            <div className="container mx-auto px-4 max-w-2xl">
                <div className="flex justify-between items-center mb-16 relative">
                    <div className="absolute h-1 bg-gray-100 top-1/2 left-0 right-0 -z-10"></div>
                    {[1, 2, 3].map(s => (
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
                            disabled={!receiptFile}
                            onClick={handleComplete}
                            className="w-full bg-red-600 text-white py-5 rounded-2xl mt-10 font-black text-xl disabled:bg-gray-200 disabled:text-gray-400 shadow-2xl shadow-red-600/20 flex items-center justify-center space-x-3"
                        >
                             <span>Complete Order</span>
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/30">
                            <CheckCircle className="h-12 w-12" />
                        </div>
                        <h2 className="text-4xl font-black mb-6">Order Placed!</h2>
                        <p className="text-gray-500 mb-12 text-lg leading-relaxed">Your entertainment is on the way. We've received your payment details. Please allow 1-2 hours for manual verification.</p>
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
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'verified' || order.status === 'shipped' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{order.status.replace('_', ' ')}</span>
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
    const { orders, users, updateOrderStatus } = useAppContext();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginData, setLoginData] = useState({ user: '', pass: '' });
    const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');

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
                        { label: "Pending", value: orders.filter(o => o.status === 'pending_verification').length, icon: <Clock className="h-6 w-6" />, color: "yellow" }
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

                <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm min-h-[400px]">
                    <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex bg-gray-50 p-1.5 rounded-2xl inline-flex">
                            <button onClick={() => setActiveTab('orders')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition ${activeTab === 'orders' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Orders</button>
                            <button onClick={() => setActiveTab('users')} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition ${activeTab === 'users' ? 'bg-white shadow-md text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>Users</button>
                        </div>
                        <div className="flex space-x-2">
                             <button className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-xl transition"><Search className="h-5 w-5" /></button>
                             <button className="bg-gray-50 hover:bg-gray-100 text-gray-600 p-2 rounded-xl transition"><Settings className="h-5 w-5" /></button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        {activeTab === 'orders' ? (
                            orders.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-50">
                                        <tr>
                                            <th className="px-10 py-6">Reference</th>
                                            <th className="px-10 py-6">Client</th>
                                            <th className="px-10 py-6">Value</th>
                                            <th className="px-10 py-6">Status</th>
                                            <th className="px-10 py-6">Receipt</th>
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
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${o.status === 'verified' || o.status === 'shipped' ? 'bg-green-100 text-green-600 border border-green-100' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>{o.status.replace('_', ' ')}</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                   {o.receiptUrl ? (
                                                       <a href={o.receiptUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 font-bold text-sm">
                                                           <Eye className="h-4 w-4 mr-1" /> View Receipt
                                                       </a>
                                                   ) : (
                                                       <span className="text-xs text-gray-400 font-medium">No Receipt</span>
                                                   )}
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {(o.status === 'pending_verification' || o.status === 'pending_payment') && (
                                                            <button 
                                                                onClick={() => updateOrderStatus(o.id, 'verified')}
                                                                className="p-3 text-green-500 hover:bg-green-100 hover:text-green-700 rounded-xl transition" 
                                                                title="Verify Order"
                                                            >
                                                                <CheckCircle className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        {o.status === 'verified' && (
                                                            <button 
                                                                onClick={() => updateOrderStatus(o.id, 'shipped')}
                                                                className="p-3 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition" 
                                                                title="Ship Order"
                                                            >
                                                                <Truck className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        <button className="p-3 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition"><FileText className="h-5 w-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-24">
                                    <Inbox className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-gray-900 font-black text-xl mb-2">No Orders Yet</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">Orders placed by customers will appear here in real-time. Wait for the magic to happen!</p>
                                </div>
                            )
                        ) : (
                            users.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] tracking-[0.2em] font-black border-b border-gray-50">
                                        <tr>
                                            <th className="px-10 py-6">User ID</th>
                                            <th className="px-10 py-6">Identity</th>
                                            <th className="px-10 py-6">Contact</th>
                                            <th className="px-10 py-6">Role</th>
                                            <th className="px-10 py-6">Joined Date</th>
                                            <th className="px-10 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {users.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50/50 transition duration-300">
                                                <td className="px-10 py-8">
                                                    <span className="font-mono text-sm font-black text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg">#{u.id}</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center">
                                                        <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-black mr-3">{u.name[0]}</div>
                                                        <div>
                                                            <p className="font-black text-gray-900 leading-none mb-1">{u.name}</p>
                                                            <p className="text-xs text-gray-400 font-medium">{u.decoderCode || 'No Decoder Linked'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <p className="text-sm font-bold text-gray-900">{u.email}</p>
                                                    <p className="text-xs text-gray-400">{u.phone}</p>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">{u.role}</span>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <span className="text-sm font-medium text-gray-600">{new Date(u.joinedDate).toLocaleDateString()}</span>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition" title="Delete User"><Trash2 className="h-5 w-5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-24">
                                    <Users className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-gray-900 font-black text-xl mb-2">No Users Yet</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto">Registered users will appear here. No one has joined the party just yet.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Support = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="bg-gray-900 text-white py-24 pb-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-red-600/10 blur-3xl rounded-full scale-150 opacity-20 animate-pulse"></div>
        <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">We're Here To Help</h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Need assistance with your decoder, subscription, or installation? Our support team is available to ensure your entertainment never stops.
            </p>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="container mx-auto px-4 -mt-20 relative z-20 mb-24">
        <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center hover:-translate-y-2 transition duration-500 group">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-red-600 group-hover:text-white transition duration-500 shadow-lg shadow-red-100">
                    <Phone className="h-8 w-8" />
                </div>
                <h3 className="font-black text-2xl mb-3 text-gray-900">Call Support</h3>
                <p className="text-gray-500 mb-6 px-4">Speak directly to a customer care agent for immediate assistance.</p>
                <a href={`tel:${COMPANY_INFO.phone}`} className="inline-block bg-gray-50 text-gray-900 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-gray-900 hover:text-white transition">{COMPANY_INFO.phone}</a>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center hover:-translate-y-2 transition duration-500 group">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-green-600 group-hover:text-white transition duration-500 shadow-lg shadow-green-100">
                    <MessageCircle className="h-8 w-8" />
                </div>
                <h3 className="font-black text-2xl mb-3 text-gray-900">WhatsApp Chat</h3>
                <p className="text-gray-500 mb-6 px-4">Fast responses via chat for troubleshooting and account renewal.</p>
                <a href={COMPANY_INFO.whatsappUrl} target="_blank" rel="noreferrer" className="inline-block bg-green-50 text-green-700 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-green-600 hover:text-white transition">Start Chat</a>
            </div>

             <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-gray-100 text-center hover:-translate-y-2 transition duration-500 group">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-blue-600 group-hover:text-white transition duration-500 shadow-lg shadow-blue-100">
                    <Mail className="h-8 w-8" />
                </div>
                <h3 className="font-black text-2xl mb-3 text-gray-900">Email Us</h3>
                <p className="text-gray-500 mb-6 px-4">Send us a detailed message for complex inquiries or business proposals.</p>
                <a href={`mailto:${COMPANY_INFO.email}`} className="inline-block bg-blue-50 text-blue-700 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition">Send Email</a>
            </div>
        </div>
      </section>

      {/* FAQ & Form Split */}
      <section className="container mx-auto px-4 pb-24">
         <div className="flex flex-col lg:flex-row gap-16">
            <div className="lg:w-1/2">
                <h2 className="text-4xl font-black mb-8 text-gray-900">Common Questions</h2>
                <div className="space-y-6">
                    {[
                        { q: "How do I activate my decoder?", a: "After installation, keep your decoder on channel 1. Send your IUC number (found on the smart card) to our activation line via SMS or WhatsApp." },
                        { q: "Why is my signal scrambling?", a: "Scrambled channels usually mean your subscription has expired. If you just paid, please wait 5-10 minutes on an active channel for the signal to refresh." },
                        { q: "Can I install the dish myself?", a: "While possible, we strongly recommend using a certified Moreplex installer to ensure optimal signal quality (minimum 70%) and prevent weather disruptions." },
                        { q: "Where can I renew my subscription?", a: "You can renew right here on the website under the 'Subscription' tab, via our mobile app, or through authorized dealers nationwide." }
                    ].map((faq, i) => (
                        <div key={i} className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 hover:border-gray-200 transition">
                            <h4 className="font-black text-xl mb-3 text-gray-900 flex items-start">
                                <span className="text-red-600 mr-3 text-2xl leading-none">•</span>
                                {faq.q}
                            </h4>
                            <p className="text-gray-600 leading-relaxed pl-6">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="lg:w-1/2">
                <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full filter blur-[100px] opacity-20 -mr-20 -mt-20"></div>
                    <h2 className="text-3xl font-black mb-2 relative z-10">Send a Message</h2>
                    <p className="text-gray-400 mb-8 relative z-10">We usually respond within 24 hours.</p>
                    <form className="space-y-4 relative z-10" onSubmit={(e) => { e.preventDefault(); alert("Message sent! We will contact you shortly."); }}>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Your Name</label>
                            <input type="text" className="w-full bg-gray-800 border-none rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-red-600 transition" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Email Address</label>
                            <input type="email" className="w-full bg-gray-800 border-none rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-red-600 transition" placeholder="john@example.com" />
                        </div>
                         <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Topic</label>
                            <select className="w-full bg-gray-800 border-none rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-red-600 transition">
                                <option>General Inquiry</option>
                                <option>Technical Support</option>
                                <option>Billing Issue</option>
                                <option>Dealer Partnership</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Message</label>
                            <textarea className="w-full bg-gray-800 border-none rounded-xl p-4 text-white placeholder-gray-600 h-32 focus:ring-2 focus:ring-red-600 transition" placeholder="How can we help?"></textarea>
                        </div>
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black text-lg transition shadow-xl shadow-red-600/20 mt-4">Send Message</button>
                    </form>
                </div>
            </div>
         </div>
      </section>

      {/* Office Map Placeholder */}
      <section className="h-96 w-full relative bg-gray-200">
         <img src="https://static.giga.de/wp-content/uploads/2017/08/google-maps-logo-rcm1200x627u.jpg" alt="Map Location" className="w-full h-full object-cover filter grayscale opacity-60" />
         <div className="absolute inset-0 flex items-center justify-center">
             <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center space-x-4">
                 <div className="bg-red-600 p-3 rounded-full text-white"><MapPin className="h-6 w-6" /></div>
                 <div>
                     <p className="font-black text-gray-900">Head Office</p>
                     <p className="text-sm text-gray-500">{COMPANY_INFO.address}</p>
                 </div>
             </div>
         </div>
      </section>
    </div>
  );
};

const App = () => {
  // State initialization
  const [cart, setCart] = useState<CartItem[]>([]);
  // Use INITIAL_ORDERS for demo purposes if needed, or empty
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  // Context methods
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

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const registerUser = (user: UserType) => {
    if (users.some(u => u.email === user.email)) return false;
    setUsers(prev => [...prev, user]);
    setCurrentUser(user);
    return true;
  };

  const loginUser = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass); 
    // In real app, password hashing comparison. 
    // Allowing loose check for demo if needed, but strict is better given code.
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
      orders, addOrder, updateOrderStatus,
      users, currentUser, registerUser, loginUser, logoutUser
    }}>
      <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen font-sans text-gray-900">
           <Navbar />
           <div className="flex-grow">
             <Routes>
               <Route path="/" element={<Home />} />
               <Route path="/shop" element={<Shop />} />
               <Route path="/subscribe" element={<Subscribe />} />
               <Route path="/cart" element={<Cart />} />
               <Route path="/checkout" element={<Checkout />} />
               <Route path="/login" element={<Login />} />
               <Route path="/signup" element={<SignUp />} />
               <Route path="/support" element={<Support />} />
               <Route path="/portal" element={currentUser ? <UserPortal /> : <Navigate to="/login" replace />} />
               <Route path="/admin" element={<AdminDashboard />} />
               {/* Redirect unknown routes to home */}
               <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
           </div>
           <Footer />
           <ChatWidget />
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
