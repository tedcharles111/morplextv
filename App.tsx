import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, Phone, Mail, MapPin, Search, 
  Upload, CheckCircle, AlertCircle, PlayCircle, Monitor, Tv 
} from 'lucide-react';
import { COMPANY_INFO, PRODUCTS, SUBSCRIPTION_PLANS, TERMS_TEXT } from './constants';
import { Product, CartItem, Order, SubscriptionPlan, ReceiptData } from './types';
import { analyzeReceipt } from './services/geminiService';

// --- Global Context for Cart ---
interface AppContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  addOrder: (order: Order) => void;
}

const AppContext = React.createContext<AppContextType | null>(null);

const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within App");
  return context;
};

// --- Components ---

const Navbar = () => {
  const { cart } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? "text-brand" : "text-white hover:text-brand-light";

  return (
    <nav className="bg-charcoal text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Tv className="h-8 w-8 text-brand" />
            <span className="text-2xl font-bold tracking-tight">MOREPLEX<span className="text-brand">TV</span></span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center font-medium">
            <Link to="/" className={isActive('/')}>Home</Link>
            <Link to="/shop" className={isActive('/shop')}>Shop</Link>
            <Link to="/subscribe" className={isActive('/subscribe')}>Subscription</Link>
            <Link to="/support" className={isActive('/support')}>Support</Link>
            <Link to="/contact" className={isActive('/contact')}>Contact</Link>
            <Link to="/admin" className={isActive('/admin')}>Admin</Link> {/* Visible for demo */}
          </div>

          {/* Cart & Mobile Toggle */}
          <div className="flex items-center space-x-4">
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
            <Link to="/support" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300 hover:text-white">Support</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2 text-gray-300 hover:text-white">Contact</Link>
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
        <h3 className="text-white text-lg font-bold mb-4">Moreplex TV</h3>
        <p className="text-sm leading-relaxed mb-4">{COMPANY_INFO.tagline}</p>
        <div className="flex space-x-2">
           {/* Socials placeholders */}
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

// --- Pages ---

const HomePage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-charcoal text-white py-20 md:py-32">
        <div className="absolute inset-0 overflow-hidden">
            <img src="https://picsum.photos/1920/1080?blur=4" alt="Background" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Redefining Entertainment <br /> with <span className="text-brand">Sheer Delight</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the new dawn of Pay TV in Africa. DTH, DTT, and VOD all in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/shop" className="bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-full transition transform hover:-translate-y-1 shadow-lg">
              Buy Decoder
            </Link>
            <Link to="/subscribe" className="bg-transparent border-2 border-white hover:bg-white hover:text-charcoal text-white font-bold py-3 px-8 rounded-full transition">
              Subscribe Now
            </Link>
          </div>
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
            <h1 className="text-3xl font-bold mb-8 text-charcoal">Moreplex Store</h1>
            
            <div className="flex flex-wrap gap-4 mb-8">
                {['all', 'decoder', 'dish', 'accessory'].map(cat => (
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
                            {product.stock < 10 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Low Stock</span>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-charcoal mb-1">{product.name}</h3>
                            <p className="text-gray-500 text-xs mb-3">SKU: {product.sku}</p>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
                            
                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-bold text-brand">₦{product.price.toLocaleString()}</span>
                                    {product.installationFee && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            +Install: ₦{product.installationFee.toLocaleString()}
                                        </span>
                                    )}
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
    const { cart, removeFromCart, clearCart, addOrder } = useAppContext();
    const navigate = useNavigate();
    const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart');
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '', city: '' });
    const [needInstall, setNeedInstall] = useState(true);
    const [receipt, setReceipt] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [ocrData, setOcrData] = useState<ReceiptData | null>(null);
    const [decoderCode, setDecoderCode] = useState('');

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
                    if (data.decoderCode) setDecoderCode(data.decoderCode);
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
            items: cart,
            total,
            customerName: customer.name,
            customerEmail: customer.email,
            status: 'awaiting_ocr', // Since they uploaded a receipt
            extractedDecoderCode: decoderCode,
            timestamp: new Date()
        };
        addOrder(newOrder);
        clearCart();
        alert("Order placed successfully! We have received your payment proof.");
        navigate('/');
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
            {/* Steps Indicator */}
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
                                        {item.installationFee && (
                                            <p className="text-xs text-blue-600">+ Install: ₦{item.installationFee.toLocaleString()}</p>
                                        )}
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><X className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex items-center mb-6">
                        <input 
                            type="checkbox" 
                            id="install" 
                            checked={needInstall} 
                            onChange={(e) => setNeedInstall(e.target.checked)} 
                            className="mr-2 h-5 w-5 text-brand focus:ring-brand"
                        />
                        <label htmlFor="install" className="font-medium">Include Professional Installation</label>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between mb-2">
                            <span>Subtotal</span>
                            <span>₦{subtotal.toLocaleString()}</span>
                        </div>
                        {needInstall && (
                            <div className="flex justify-between mb-2 text-blue-600">
                                <span>Installation Fees</span>
                                <span>₦{installTotal.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xl font-bold mt-4">
                            <span>Total</span>
                            <span>₦{total.toLocaleString()}</span>
                        </div>
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
                    
                    <div className="flex justify-between">
                        <button onClick={() => setStep('cart')} className="text-gray-500 hover:underline">Back</button>
                        <button 
                            disabled={!customer.name || !customer.phone || !customer.address}
                            onClick={() => setStep('payment')} 
                            className="bg-brand hover:bg-brand-dark text-white font-bold py-2 px-8 rounded disabled:opacity-50"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            )}

            {step === 'payment' && (
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-bold mb-6">Payment & Verification</h2>
                    
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
                        <h3 className="font-bold text-blue-900 mb-2">Bank Transfer Details</h3>
                        <p className="text-sm">Bank: <span className="font-bold">{COMPANY_INFO.bankDetails.bankName}</span></p>
                        <p className="text-sm">Account: <span className="font-bold">{COMPANY_INFO.bankDetails.accountNumber}</span></p>
                        <p className="text-sm">Name: <span className="font-bold">{COMPANY_INFO.bankDetails.accountName}</span></p>
                        <p className="text-lg font-bold text-brand mt-2">Amount to Pay: ₦{total.toLocaleString()}</p>
                    </div>

                    <div className="border-t border-b py-6 mb-6">
                        <label className="block font-bold mb-2">Upload Payment Receipt</label>
                        <p className="text-sm text-gray-500 mb-2">We will scan this to verify your payment and identify your decoder code if applicable.</p>
                        
                        {!receipt ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                    <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> payment proof</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                            </label>
                        ) : (
                            <div className="bg-green-50 border border-green-200 p-4 rounded">
                                <div className="flex items-center mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    <span className="font-bold text-green-700">File Uploaded</span>
                                </div>
                                {isAnalyzing ? (
                                    <div className="text-sm text-gray-500 animate-pulse">Analyzing receipt with AI...</div>
                                ) : (
                                    <div className="space-y-2 mt-2">
                                        <p className="text-xs text-gray-600 uppercase font-bold">Extracted Data:</p>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500">Amount:</span> {ocrData?.amount ? `₦${ocrData.amount}` : 'Not detected'}
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Date:</span> {ocrData?.date || 'Not detected'}
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-gray-500">Ref:</span> {ocrData?.transactionRef || 'Not detected'}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2">
                                            <label className="block text-xs font-bold text-gray-700">Decoder Code (Verified via OCR)</label>
                                            <input 
                                                type="text" 
                                                value={decoderCode} 
                                                onChange={(e) => setDecoderCode(e.target.value)}
                                                placeholder="Enter Decoder Code if not detected"
                                                className="w-full border p-2 rounded mt-1 bg-white"
                                            />
                                            {ocrData?.decoderCode && <span className="text-xs text-green-600">Auto-detected from receipt!</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center mb-6">
                        <input type="checkbox" id="terms" className="mr-2 h-5 w-5 text-brand focus:ring-brand" />
                        <label htmlFor="terms" className="text-sm">I agree to the <Link to="/terms" className="text-brand underline">Terms & Conditions</Link></label>
                    </div>

                    <div className="flex justify-between">
                         <button onClick={() => setStep('details')} className="text-gray-500 hover:underline">Back</button>
                        <button 
                            disabled={!receipt}
                            onClick={handlePlaceOrder}
                            className="bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm Payment & Order
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const SubscriptionPage = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [decoderCode, setDecoderCode] = useState('');
    const [step, setStep] = useState(1);
    const [receipt, setReceipt] = useState<File | null>(null);
    const navigate = useNavigate();

    const handleSubscribe = () => {
        alert("Subscription request submitted! Admin will verify payment and activate.");
        navigate('/');
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-center mb-2">Subscribe to Moreplex</h1>
            <p className="text-center text-gray-600 mb-12">Choose a plan that fits your entertainment needs.</p>

            {step === 1 && (
                <div className="grid md:grid-cols-3 gap-8">
                    {SUBSCRIPTION_PLANS.filter(p => p.type !== 'FTA').map(plan => (
                        <div key={plan.id} className={`border rounded-xl p-8 hover:shadow-lg transition cursor-pointer ${selectedPlan === plan.id ? 'border-brand ring-2 ring-brand ring-opacity-50' : 'border-gray-200'}`}
                             onClick={() => setSelectedPlan(plan.id)}>
                            <h3 className="text-xl font-bold text-charcoal">{plan.name}</h3>
                            <div className="text-3xl font-bold text-brand my-4">₦{plan.price.toLocaleString()}</div>
                            <ul className="space-y-2 text-gray-600 mb-8">
                                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> {plan.channels}+ Channels</li>
                                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> {plan.duration} Validity</li>
                                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> HD Quality</li>
                            </ul>
                            <button className={`w-full py-2 rounded-lg font-bold ${selectedPlan === plan.id ? 'bg-brand text-white' : 'bg-gray-100 text-gray-800'}`}>
                                Select Plan
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {step === 1 && selectedPlan && (
                <div className="mt-8 text-center">
                    <button onClick={() => setStep(2)} className="bg-charcoal text-white px-8 py-3 rounded-lg font-bold">Next: Enter Decoder Details</button>
                </div>
            )}

            {step === 2 && (
                <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border">
                    <h3 className="text-xl font-bold mb-4">Account Details</h3>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Decoder / Smart Card Number</label>
                    <input 
                        type="text" 
                        value={decoderCode} 
                        onChange={e => setDecoderCode(e.target.value)}
                        placeholder="MPX-..."
                        className="w-full border p-3 rounded mb-4 focus:border-brand outline-none" 
                    />
                    <div className="bg-blue-50 p-4 rounded mb-4 text-sm">
                        Please pay <strong>₦{SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.price.toLocaleString()}</strong> to <br/>
                        <strong>{COMPANY_INFO.bankDetails.bankName} - {COMPANY_INFO.bankDetails.accountNumber}</strong>
                    </div>
                    
                    <label className="block text-sm font-bold text-gray-700 mb-2">Upload Payment Proof</label>
                    <input type="file" onChange={e => setReceipt(e.target.files?.[0] || null)} className="w-full border p-2 rounded mb-6" />

                    <button 
                        onClick={handleSubscribe} 
                        disabled={!decoderCode || !receipt}
                        className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded disabled:opacity-50"
                    >
                        Complete Subscription
                    </button>
                </div>
            )}
        </div>
    );
};

const AdminPage = () => {
    const { orders } = useAppContext();
    const [activeTab, setActiveTab] = useState<'orders' | 'verification'>('orders');

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            <div className="flex space-x-4 mb-6">
                <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 rounded ${activeTab === 'orders' ? 'bg-charcoal text-white' : 'bg-gray-200'}`}>Orders</button>
                <button onClick={() => setActiveTab('verification')} className={`px-4 py-2 rounded ${activeTab === 'verification' ? 'bg-charcoal text-white' : 'bg-gray-200'}`}>Receipt Verification</button>
            </div>

            {activeTab === 'orders' && (
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No orders found</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{order.total.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                {order.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.timestamp).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

             {activeTab === 'verification' && (
                 <div className="grid gap-4">
                     {orders.filter(o => o.status === 'awaiting_ocr').map(order => (
                         <div key={order.id} className="bg-white p-4 rounded shadow border border-yellow-200">
                             <div className="flex justify-between items-start">
                                 <div>
                                     <h3 className="font-bold">Order #{order.id}</h3>
                                     <p className="text-sm">User: {order.customerName}</p>
                                     <p className="text-sm">Amount: ₦{order.total.toLocaleString()}</p>
                                     <div className="mt-2 bg-gray-100 p-2 rounded text-xs">
                                         <p className="font-bold">OCR Analysis:</p>
                                         <p>Extracted Code: {order.extractedDecoderCode || 'None'}</p>
                                         <p>Matches Inventory: <span className="text-green-600">Pending Check</span></p>
                                     </div>
                                 </div>
                                 <div className="flex flex-col space-y-2">
                                     <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">Approve</button>
                                     <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">Reject</button>
                                 </div>
                             </div>
                         </div>
                     ))}
                     {orders.filter(o => o.status === 'awaiting_ocr').length === 0 && <p>No receipts pending verification.</p>}
                 </div>
             )}
        </div>
    );
};

const TermsPage = () => (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <div className="prose prose-sm md:prose-base bg-white p-8 rounded shadow">
            <pre className="whitespace-pre-wrap font-sans">{TERMS_TEXT}</pre>
        </div>
        <div className="mt-6 text-center">
            <button onClick={() => window.print()} className="bg-charcoal text-white px-6 py-2 rounded">Print / Save as PDF</button>
        </div>
    </div>
);

const ContactPage = () => (
  <div className="container mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
    <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-6">Get in Touch</h2>
        <div className="space-y-6">
          <div className="flex items-start">
            <MapPin className="h-6 w-6 text-brand mr-4 mt-1" />
            <div>
              <h4 className="font-bold">Visit Us</h4>
              <p className="text-gray-600">{COMPANY_INFO.address}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Phone className="h-6 w-6 text-brand mr-4" />
            <div>
              <h4 className="font-bold">Call Us</h4>
              <a href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`} className="text-gray-600 hover:text-brand">{COMPANY_INFO.phone}</a>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 mr-4 flex items-center justify-center bg-green-500 rounded-full text-black font-bold text-xs">W</div>
            <div>
              <h4 className="font-bold">WhatsApp</h4>
              <a href={COMPANY_INFO.whatsappUrl} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-brand">{COMPANY_INFO.whatsapp}</a>
            </div>
          </div>
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-brand mr-4" />
            <div>
              <h4 className="font-bold">Email Us</h4>
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-gray-600 hover:text-brand">{COMPANY_INFO.email}</a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-6">Send a Message</h2>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Message sent!"); }}>
          <input type="text" placeholder="Your Name" className="w-full border p-3 rounded focus:outline-none focus:border-brand" required />
          <input type="email" placeholder="Your Email" className="w-full border p-3 rounded focus:outline-none focus:border-brand" required />
          <select className="w-full border p-3 rounded focus:outline-none focus:border-brand">
             <option>General Inquiry</option>
             <option>Maintenance Request</option>
             <option>Dealer Application</option>
          </select>
          <textarea rows={4} placeholder="Your Message" className="w-full border p-3 rounded focus:outline-none focus:border-brand" required></textarea>
          <button type="submit" className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded transition">Send Message</button>
        </form>
      </div>
    </div>
  </div>
);

// --- Main App Logic ---

const App = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(p => p.id === product.id);
            if (existing) {
                return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(p => p.id !== id));
    };

    const clearCart = () => setCart([]);

    const addOrder = (order: Order) => {
        setOrders(prev => [order, ...prev]);
    };

    return (
        <AppContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, orders, addOrder }}>
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
                            <Route path="/contact" element={<ContactPage />} />
                            <Route path="/support" element={<ContactPage />} /> {/* Reusing contact for support request */}
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

export default App;
