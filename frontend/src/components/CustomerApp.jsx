import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, ArrowRight, Menu, X, ChevronRight, 
  MessageSquare, Zap, Truck, ShieldCheck, UserCheck, Heart, 
  Search, Bot, Plus, Minus, Trash2, MapPin, CreditCard, 
  Coins, Check, FileText, RefreshCw, Send, ArrowLeft, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Mock Product Data
const CATALOG_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Tomat Roma Organik',
    price: 12500,
    unit: 'Per 500gr',
    image: 'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=200&auto=format&fit=crop',
    category: 'Sayuran',
    badge: 'STOK MENIPIS'
  },
  {
    id: 'prod_2',
    name: 'Salmon Fillet Premium',
    price: 85000,
    unit: 'Per 200gr',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=200&auto=format&fit=crop',
    category: 'Daging',
    badge: 'REKOMENDASI AI'
  },
  {
    id: 'prod_3',
    name: 'Bawang Putih Kating',
    price: 15000,
    unit: 'Per 250gr',
    image: 'https://images.unsplash.com/photo-1560717789-0ac7c58ac90a?q=80&w=200&auto=format&fit=crop',
    category: 'Bumbu'
  },
  {
    id: 'prod_4',
    name: 'Asparagus Hijau',
    price: 28000,
    unit: 'Per Ikat',
    image: 'https://images.unsplash.com/photo-1515471209610-dae1c92d8777?q=80&w=200&auto=format&fit=crop',
    category: 'Sayuran'
  },
  {
    id: 'prod_5',
    name: 'Bayam Jepang Horenso',
    price: 16000,
    unit: 'Per 250gr',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=200&auto=format&fit=crop',
    category: 'Sayuran'
  },
  {
    id: 'prod_6',
    name: 'Alpukat Mentega',
    price: 25000,
    unit: 'Per kg',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?q=80&w=200&auto=format&fit=crop',
    category: 'Sayuran'
  },
  {
    id: 'prod_7',
    name: 'Minyak Zaitun Extra Virgin',
    price: 55000,
    unit: 'Per Botol',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=200&auto=format&fit=crop',
    category: 'Bumbu'
  }
];

// Initial mock orders to seed LocalStorage if empty
const INITIAL_ORDERS = [
  {
    id: 'ORD-99201',
    date: '24 Okt 2023, 09:41',
    status: 'IN PROGRESS',
    title: 'Bahan Mingguan: Healthy Green',
    itemCount: 11,
    details: '11 items • AI Optimized',
    total: 842000,
    courierStatus: 'Kurir sedang menuju lokasi Anda dari Pasar Modern BSD',
    eta: '12 Menit',
    items: [
      { name: 'Tomat Roma Organik', quantity: 2, unit: 'Per 500gr', price: 12500 },
      { name: 'Salmon Fillet Premium', quantity: 2, unit: 'Per 200gr', price: 85000 },
      { name: 'Asparagus Hijau', quantity: 1, unit: 'Per Ikat', price: 28000 },
      { name: 'Minyak Zaitun Extra Virgin', quantity: 1, unit: 'Per Botol', price: 55000 }
    ],
    chatLog: [
      { sender: 'bot', text: 'Halo Ibu! Pesanan #ORD-99201 sedang kami proses.', timestamp: '09:42' },
      { sender: 'bot', text: 'Status Pesanan: Kurir sudah sampai di Pasar Modern BSD dan mulai belanja.', timestamp: '09:45' },
      { sender: 'courier', text: 'Pagi Bu, untuk Tomat Roma-nya segar sekali, saya ambil ya.', timestamp: '09:47' },
      { sender: 'bot', text: 'Status Pesanan: Belanjaan selesai dikemas. Kurir sedang jalan mengantar ke alamat Ibu.', timestamp: '09:55' },
      { sender: 'courier', text: 'Saya sudah jalan Bu, ETA sekitar 12 menit ya. Sampai bertemu.', timestamp: '09:56' }
    ]
  },
  {
    id: 'ORD-88102',
    date: '18 Okt 2023, 11:30',
    status: 'COMPLETED',
    title: 'Stock Bulanan',
    itemCount: 5,
    details: '5 items • Selesai Belanja',
    total: 1250000,
    items: [{ name: 'Ayam Potong', quantity: 3, unit: 'ekor', price: 40000 }],
    chatLog: [
      { sender: 'bot', text: 'Status Pesanan #ORD-88102: Selesai. Terima kasih telah berbelanja!', timestamp: '12:00' }
    ]
  },
  {
    id: 'ORD-77192',
    date: '12 Okt 2023, 14:15',
    status: 'COMPLETED',
    title: 'Persiapan Dinner Party',
    itemCount: 8,
    details: '8 items • Selesai Belanja',
    total: 620000,
    items: [],
    chatLog: [
      { sender: 'bot', text: 'Status Pesanan #ORD-77192: Selesai. Terima kasih telah berbelanja!', timestamp: '15:10' }
    ]
  },
  {
    id: 'ORD-66281',
    date: '05 Okt 2023, 16:00',
    status: 'CANCELLED',
    title: 'Snack & Drinks',
    itemCount: 2,
    details: '2 items • Dibatalkan',
    total: 120000,
    cancelReason: 'Dibatalkan oleh pengguna: Perubahan rencana',
    chatLog: [
      { sender: 'bot', text: 'Status Pesanan #ORD-66281: Dibatalkan oleh pengguna.', timestamp: '16:05' }
    ]
  }
];

const DEFAULT_GENERAL_CHAT = [
  {
    id: 'init_welcome',
    sender: 'bot',
    text: 'Butuh bahan belanjaan? yuk langsung cobain order di Emak AI!',
    showOrderMenuButton: true,
    timestamp: 'Baru Saja'
  }
];

export default function CustomerApp({ onToggleDevPanel }) {
  const [activeTab, setActiveTab] = useState('chatbot'); // 'chatbot' | 'beranda' | 'checkout' | 'history'
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('gopay'); // 'gopay' | 'ovo' | 'va' | 'card'
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [checkoutTotal, setCheckoutTotal] = useState(0);
  
  // Floating Chat Widget state
  const [activeChatId, setActiveChatId] = useState('general'); // null = List, 'general' = General AI assistant, orderId = Order chat
  const [generalMessages, setGeneralMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  
  // Mobile UI navigation sidebar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showMapTrackerId, setShowMapTrackerId] = useState(null);

  const [tourStep, setTourStep] = useState(0); // Onboarding Tour Step State (starts at 0)

  const chatEndRef = useRef(null);

  // Onboarding Tour Step reactive transitions
  useEffect(() => {
    if (activeTab === 'checkout' && tourStep === 2) {
      setTourStep(3);
    }
  }, [activeTab, tourStep]);

  useEffect(() => {
    if (activeTab === 'history' && tourStep === 3) {
      setTourStep(4);
    }
  }, [activeTab, tourStep]);





  // Get current active messages thread
  const chatMessages = activeChatId === 'general' 
    ? generalMessages 
    : (orders.find(ord => ord.id === activeChatId)?.chatLog || []);

  // Initialize data from LocalStorage
  useEffect(() => {
    const storedOrders = localStorage.getItem('emak_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      localStorage.setItem('emak_orders', JSON.stringify(INITIAL_ORDERS));
      setOrders(INITIAL_ORDERS);
    }

    const storedCart = localStorage.getItem('emak_cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }

    const storedGeneralChat = localStorage.getItem('emak_general_chat');
    if (storedGeneralChat) {
      setGeneralMessages(JSON.parse(storedGeneralChat));
    } else {
      localStorage.setItem('emak_general_chat', JSON.stringify(DEFAULT_GENERAL_CHAT));
      setGeneralMessages(DEFAULT_GENERAL_CHAT);
    }
  }, []);

  // Save cart changes
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('emak_cart', JSON.stringify(newCart));
  };

  // Chat message scroller
  useEffect(() => {
    if (activeTab === 'chatbot' && activeChatId) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab, activeChatId]);

  // Handle Add to Cart
  const handleAddToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
    } else {
      newCart = [...cart, { ...product, qty: 1 }];
    }
    saveCart(newCart);
    if (tourStep === 1) {
      setTourStep(2);
    }
  };

  // Adjust Qty in Cart
  const handleUpdateQty = (productId, amount) => {
    const updated = cart.map(item => {
      if (item.id === productId) {
        const nextQty = item.qty + amount;
        return nextQty > 0 ? { ...item, qty: nextQty } : null;
      }
      return item;
    }).filter(Boolean);
    saveCart(updated);
  };

  const handleRemoveFromCart = (productId) => {
    const updated = cart.filter(item => item.id !== productId);
    saveCart(updated);
  };

  // Smart AI suggestion adding
  const handleAddSmartSuggestion = () => {
    const suggestion = CATALOG_PRODUCTS.find(p => p.id === 'prod_7'); // Minyak Zaitun
    if (suggestion) {
      handleAddToCart(suggestion);
    }
  };

  // Calculate Cart Metrics
  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
  const serviceFee = subtotal > 0 ? 5000 : 0;
  const totalBill = subtotal + serviceFee;

  // Process Catalog Checkout -> Direct to Chatbot first to confirm order details
  const handleProceedToChatConfirm = () => {
    if (cart.length === 0) return;
    
    // Copy cart to state for checkout stage later
    setCheckoutItems([...cart]);
    setCheckoutTotal(subtotal + 15000);

    // Build chat confirmation message
    const itemSummaryStr = cart.map(item => `- ${item.qty}x ${item.name} (${item.unit})`).join('\n');
    const checkoutMessage = {
      id: 'system_init_' + Date.now(),
      sender: 'bot',
      text: `Halo Ibu! Saya melihat Anda telah memilih barang belanjaan di keranjang. Berikut ringkasannya:\n\n${itemSummaryStr}\n\n*Rincian Biaya:*\n- Subtotal: Rp ${new Intl.NumberFormat('id-ID').format(subtotal)}\n- Biaya Antar: Rp 15.000 (Flat)\n- Biaya Layanan AI: Rp 5.000 ~*GRATIS*~\n\n*Total Estimasi: Rp ${new Intl.NumberFormat('id-ID').format(subtotal + 15000)}*\n\nSemua transaksi kami amankan di rekening bersama (Escrow). Silakan ketuk tombol di bawah untuk melanjutkan ke pembayaran.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      showPayButton: true
    };

    const updatedGeneralChat = [...generalMessages, checkoutMessage];
    setGeneralMessages(updatedGeneralChat);
    localStorage.setItem('emak_general_chat', JSON.stringify(updatedGeneralChat));

    setTrackingOrderId(null); // Clear tracking mode
    setActiveChatId('general'); // Go directly to general chat channel
    setActiveTab('checkout'); // Redirect directly to the checkout page!
  };

  // Handle direct AI search/ask inside chat threads
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (activeChatId === 'general') {
      // General chat interaction
      const updatedMessages = [...generalMessages, userMsg];
      setGeneralMessages(updatedMessages);
      localStorage.setItem('emak_general_chat', JSON.stringify(updatedMessages));
      setChatInput('');

      setTimeout(() => {
        let botResponseText = "";
        let simulatedCart = [];
        let detectedTotal = 0;

        const lowerText = chatInput.toLowerCase();
        if (lowerText.includes("rendang") || lowerText.includes("daging") || lowerText.includes("bumbu")) {
          simulatedCart = [
            { name: 'Premium Salmon Fillet', qty: 1, unit: '500g', price: 145000 },
            { name: 'Organic Baby Spinach', qty: 2, unit: '250g', price: 16000 },
            { name: 'Avocado Hass', qty: 1, unit: 'Pack of 3', price: 58500 }
          ];
          detectedTotal = 145000 + (16000 * 2) + 58500;
          botResponseText = `Tentu Ibu! AI kami mendeteksi Ibu membutuhkan bahan segar berikut:\n\n- 1x Premium Salmon Fillet (500g) ~ Rp 145.000\n- 2x Organic Baby Spinach (250g) ~ Rp 32.000\n- 1x Avocado Hass (Pack of 3) ~ Rp 58.500\n\n*Total Estimasi: Rp ${new Intl.NumberFormat('id-ID').format(detectedTotal)}*\n\nSemua pembayaran dijamin aman di Escrow. Klik tombol di bawah ini untuk lanjut ke pembayaran.`;
        } else {
          simulatedCart = [
            { name: 'Salmon Fillet Premium', qty: 1, unit: 'Per 200gr', price: 85000 },
            { name: 'Tomat Roma Organik', qty: 1, unit: 'Per 500gr', price: 12500 }
          ];
          detectedTotal = 85000 + 12500;
          botResponseText = `Tentu Ibu! AI mendeteksi daftar belanjaan Ibu:\n\n- 1x Salmon Fillet Premium (Per 200gr) ~ Rp 85.000\n- 1x Tomat Roma Organik (Per 500gr) ~ Rp 12.500\n\n*Total Estimasi: Rp ${new Intl.NumberFormat('id-ID').format(detectedTotal)}*\n\nDana akan dikunci di Escrow sebelum kurir jalan. Silakan ketuk tombol di bawah untuk bayar.`;
        }

        setCheckoutItems(simulatedCart);
        setCheckoutTotal(detectedTotal + 15000); // 15k delivery fee

        const botReply = {
          id: 'bot_' + Date.now(),
          sender: 'bot',
          text: botResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          showPayButton: true
        };

        setGeneralMessages(prev => {
          const res = [...prev, botReply];
          localStorage.setItem('emak_general_chat', JSON.stringify(res));
          return res;
        });
      }, 1000);

    } else if (activeChatId) {
      // Order-specific chat interaction
      const updatedOrders = orders.map(ord => {
        if (ord.id === activeChatId) {
          const newLogs = [...(ord.chatLog || []), userMsg];
          
          // Trigger courier reply mock
          setTimeout(() => {
            const courierReply = {
              id: 'courier_reply_' + Date.now(),
              sender: ord.status === 'IN PROGRESS' ? 'courier' : 'bot',
              text: ord.status === 'IN PROGRESS' 
                ? 'Baik Bu, pesan diterima. Saya sedang merapikan belanjaan Ibu di motor.' 
                : 'Pesanan ini sudah selesai. Jika ada keluhan silakan hubungi CS Emak AI.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            const reUpdatedOrders = JSON.parse(localStorage.getItem('emak_orders')).map(o => {
              if (o.id === activeChatId) {
                return { ...o, chatLog: [...o.chatLog, courierReply] };
              }
              return o;
            });
            setOrders(reUpdatedOrders);
            localStorage.setItem('emak_orders', JSON.stringify(reUpdatedOrders));
          }, 1000);

          return { ...ord, chatLog: newLogs };
        }
        return ord;
      });

      setOrders(updatedOrders);
      localStorage.setItem('emak_orders', JSON.stringify(updatedOrders));
      setChatInput('');
    }
  };

  // Handle conversational commerce quick order via templates/recipes
  const handleQuickOrder = (recipeName, recipeItems) => {
    const newCart = [...cart];
    recipeItems.forEach(item => {
      const product = CATALOG_PRODUCTS.find(p => p.id === item.id);
      if (product) {
        const existing = newCart.find(c => c.id === product.id);
        if (existing) {
          existing.qty += item.qty;
        } else {
          newCart.push({ ...product, qty: item.qty });
        }
      }
    });
    saveCart(newCart);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      text: `Saya mau pesan bahan resep: "${recipeName}"`,
      timestamp
    };

    const botText = `Baik Ibu! Emak sudah siapkan bahan-bahan segar untuk resep "${recipeName}":\n` + 
      recipeItems.map(item => {
        const product = CATALOG_PRODUCTS.find(p => p.id === item.id);
        return `• ${product.name} (${item.qty} ${product.unit.split(' ')[0]})`;
      }).join('\n') + 
      `\n\nSemua bahan resep sudah dimasukkan ke keranjang belanja Ibu. Silakan klik tombol di bawah untuk langsung bayar!`;

    const botMsg = {
      id: 'msg_bot_' + Date.now(),
      sender: 'bot',
      text: botText,
      showPayButton: true,
      timestamp
    };

    if (activeChatId === 'general') {
      const updated = [...generalMessages, userMsg, botMsg];
      setGeneralMessages(updated);
      localStorage.setItem('emak_general_chat', JSON.stringify(updated));
    } else {
      const updatedOrders = orders.map(ord => {
        if (ord.id === activeChatId) {
          return {
            ...ord,
            chatLog: [...(ord.chatLog || []), userMsg, botMsg]
          };
        }
        return ord;
      });
      setOrders(updatedOrders);
      localStorage.setItem('emak_orders', JSON.stringify(updatedOrders));
    }
  };

  // Navigate from Chatbot payload button to Checkout Page
  const handleProceedToPayment = () => {
    const currentSubtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    setCheckoutItems([...cart]);
    setCheckoutTotal(currentSubtotal + 15000);
    setActiveTab('checkout');
    if (tourStep === 2) {
      setTourStep(3);
    }
  };

  // Complete checkout payment and create order
  const handleExecutePayment = () => {
    // Show paying loader
    const paymentLoadingModal = document.getElementById('payment_loading');
    if (paymentLoadingModal) {
      paymentLoadingModal.classList.remove('hidden');
    }

    setTimeout(() => {
      if (paymentLoadingModal) {
        paymentLoadingModal.classList.add('hidden');
      }

      // Generate mock Order ID
      const newOrderId = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
      const newOrder = {
        id: newOrderId,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) + `, ${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`,
        status: 'IN PROGRESS',
        title: checkoutItems.length > 0 ? `Belanjaan ${checkoutItems[0].name}` : 'Belanjaan Sayur Segar',
        itemCount: checkoutItems.reduce((acc, curr) => acc + curr.qty, 0),
        details: `${checkoutItems.length} items • AI Optimized`,
        total: checkoutTotal,
        courierStatus: 'Kurir sedang memverifikasi nota belanja di pasar',
        eta: '15 Menit',
        items: checkoutItems.map(item => ({ name: item.name, quantity: item.qty || 1, unit: item.unit, price: item.price })),
        chatLog: [
          { sender: 'bot', text: `Pembayaran Berhasil! Dana sebesar Rp ${new Intl.NumberFormat('id-ID').format(checkoutTotal)} telah kami amankan di rekening bersama (Escrow).`, timestamp: 'Baru Saja' },
          { sender: 'bot', text: `Status Pesanan ${newOrderId}: Kurir sedang menuju ke toko Mitra Pasar untuk mengemas belanjaan Anda.`, timestamp: 'Baru Saja' }
        ]
      };

      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('emak_orders', JSON.stringify(updatedOrders));

      // Morph pay buttons inside general chat to track buttons
      const updatedGeneralChat = generalMessages.map(msg => {
        if (msg.showPayButton) {
          return {
            ...msg,
            text: `✅ Pembayaran Berhasil! Dana sebesar Rp ${new Intl.NumberFormat('id-ID').format(newOrder.total)} telah kami amankan di rekening bersama (Escrow).\n\nBahan belanjaan sudah dibayar dan pesanan ${newOrderId} sedang diproses. Silakan ketuk tombol di bawah untuk melacak kurir belanja Anda!`,
            showPayButton: false,
            showTrackButton: true,
            associatedOrderId: newOrderId
          };
        }
        return msg;
      });
      setGeneralMessages(updatedGeneralChat);
      localStorage.setItem('emak_general_chat', JSON.stringify(updatedGeneralChat));

      // Reset cart and checkout items
      saveCart([]);
      setCheckoutItems([]);
      setCheckoutTotal(0);

      // Redirect to Chatbot page to see the newly created order thread tracking
      setActiveTab('chatbot');
      setActiveChatId(newOrderId);
      setTrackingOrderId(newOrderId);

      if (tourStep === 3) {
        setTourStep(4);
      }
    }, 1500);
  };

  // Track Progress of an order (Loads chatbot tracking view & full screen map)
  const handleTrackProgress = (order) => {
    setTrackingOrderId(order.id);
    setActiveChatId(order.id); // Open this specific order chat channel!
    setActiveTab('chatbot'); // Redirect to chatbot page view!
    setShowMapTrackerId(order.id); // Also trigger full screen map tracker!
  };

  // Selesaikan Pesanan / Finish Order
  const handleFinishOrder = (orderId) => {
    const updatedOrders = orders.map(ord => {
      if (ord.id === orderId) {
        const finishTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...ord,
          status: 'COMPLETED',
          courierStatus: 'Pesanan telah selesai. Terima kasih!',
          details: 'Selesai Belanja',
          chatLog: [
            ...ord.chatLog,
            { sender: 'bot', text: 'Status Pesanan: Selesai. Terima kasih telah menyelesaikan pesanan dan melepaskan dana Escrow Anda ke pedagang dan kurir!', timestamp: finishTimestamp }
          ]
        };
      }
      return ord;
    });
    setOrders(updatedOrders);
    localStorage.setItem('emak_orders', JSON.stringify(updatedOrders));
    
    // Auto close map if open for this order
    if (showMapTrackerId === orderId) {
      setShowMapTrackerId(null);
    }

    if (tourStep === 6) {
      setTourStep(-1);
      localStorage.setItem('emak_tour_completed', 'true');
    }
  };

  // Filter products by search and category
  const filteredProducts = CATALOG_PRODUCTS.filter(prod => {
    const matchCat = selectedCategory === 'Semua' || prod.category === selectedCategory;
    const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#080b11] text-white flex flex-col lg:flex-row font-sans selection:bg-[#00bfa5] selection:text-slate-950">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-highlight {
          0%, 100% { border-color: #00bfa5; box-shadow: 0 0 0 2px #00bfa5, 0 0 15px 4px rgba(0, 191, 165, 0.5); }
          50% { border-color: #00e5c1; box-shadow: 0 0 0 6px #00e5c1, 0 0 25px 8px rgba(0, 191, 165, 0.8); }
        }
        .tour-highlight {
          animation: pulse-highlight 1.8s infinite !important;
          border: 2px solid #00e5c1 !important;
          border-radius: 8px !important;
          position: relative !important;
          z-index: 100 !important;
          pointer-events: auto !important;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      {/* Mobile Top Navbar */}
      <header className="lg:hidden h-16 bg-[#080b11] border-b border-slate-900 px-4 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <span className="font-display font-black text-lg tracking-wider">
          EMAK<span className="text-[#00bfa5]">AI</span>
        </span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 border border-slate-800 bg-[#0c101a] text-white rounded shadow-sm cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Left Navigation Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#080b11] border-r border-slate-900 flex flex-col transform transition-transform duration-300 ease-in-out shrink-0 h-full
        lg:static lg:translate-x-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between">
          <div>
            <h1 className="font-display font-black text-xl tracking-wider text-white">
              EMAK<span className="text-[#00bfa5]">AI</span>
            </h1>
            <span className="text-[9px] text-[#00bfa5] uppercase tracking-widest font-black block mt-0.5 animate-pulse">
              ● SYSTEM ACTIVE
            </span>
          </div>
          {mobileMenuOpen && (
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1 border border-slate-800 rounded">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-3.5">
          <button
            onClick={() => { setActiveTab('chatbot'); setMobileMenuOpen(false); }}
            className={`w-full py-3 px-4 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'chatbot' ? 'bg-[#00bfa5]/10 text-[#00bfa5] border border-[#00bfa5]/30 shadow-sm' : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Chat Bot</span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
            className={`w-full py-3 px-4 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'history' ? 'bg-[#00bfa5]/10 text-[#00bfa5] border border-[#00bfa5]/30 shadow-sm' : 'bg-transparent text-slate-400 hover:text-white hover:bg-slate-900/30'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Riwayat Pesanan</span>
          </button>

          {/* Dev Panel Switcher */}
          <div className="h-px bg-slate-900 my-4" />
          <button
            onClick={() => { onToggleDevPanel(); setMobileMenuOpen(false); }}
            className="w-full py-3 px-4 rounded-md font-bold text-xs uppercase tracking-wider flex items-center gap-3 text-amber-500 bg-amber-500/5 border border-amber-500/10 hover:bg-amber-500/10 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Developer Simulator</span>
          </button>
        </nav>
      </aside>

      {/* Content Container Panel */}
      <main className="flex-grow flex flex-col overflow-hidden bg-[#0c101a] h-[calc(100vh-64px)] lg:h-screen relative">
        
        {/* VIEW 1: CATALOG MENU & CART */}
        {activeTab === 'beranda' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
            
            {/* Catalog (Left/Middle area) */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-6">
              
              {/* Back to Chatbot trigger */}
              <div className="flex items-center">
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#00bfa5] hover:text-[#00e5c1] cursor-pointer transition-colors bg-[#00bfa5]/5 border border-[#00bfa5]/15 px-3 py-1.5 rounded"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Chatbot</span>
                </button>
              </div>

              {/* Promo recommendation banner */}
              <div className="flex items-center gap-3 bg-slate-950 p-4 border border-slate-900 shadow-sm">
                <div className="w-10 h-10 rounded-md bg-[#00bfa5]/15 border border-[#00bfa5]/30 flex items-center justify-center text-[#00bfa5] shrink-0">
                  <Bot className="w-5.5 h-5.5" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider leading-none">Rekomendasi AI Untuk Anda</h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">Berdasarkan rencana makan "Sehat Seminggu" Anda.</p>
                </div>
              </div>

              {/* Recommendation row cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recom Card 1 */}
                <div className="bg-[#080b11] border border-slate-900 p-4 rounded-md flex justify-between items-center shadow-sm">
                  <div className="text-left">
                    <span className="text-[8px] bg-[#00bfa5]/10 border border-[#00bfa5]/30 text-[#00bfa5] font-black tracking-widest px-1.5 py-0.5 rounded block w-max mb-1 uppercase">TRENDING CHOICE</span>
                    <h5 className="text-xs font-black text-white uppercase tracking-wide">Paket Sayur Organik Fresh</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Hemat 15% dengan langganan mingguan.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const item = CATALOG_PRODUCTS.find(p => p.id === 'prod_1') || CATALOG_PRODUCTS[0];
                      handleAddToCart({ ...item, name: "Paket Sayur Organik Fresh", price: 45000 });
                    }}
                    className="px-4 py-2 bg-[#00bfa5] text-slate-950 text-[10px] font-black uppercase tracking-wider rounded-md hover:bg-[#00e5c1] transition-all cursor-pointer shadow-sm"
                  >
                    Tambah Rp 45k
                  </button>
                </div>

                {/* Recom Card 2 */}
                <div className="bg-[#080b11] border border-slate-900 p-4 rounded-md flex justify-between items-center shadow-sm">
                  <div className="text-left">
                    <span className="text-[8px] bg-sky-500/10 border border-sky-500/30 text-sky-400 font-black tracking-widest px-1.5 py-0.5 rounded block w-max mb-1 uppercase">QUICK FILL</span>
                    <h5 className="text-xs font-black text-white uppercase tracking-wide">Selesaikan belanjaan Anda</h5>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Sisa 8 Item. Est. Rp 124.000</p>
                  </div>
                  <button 
                    onClick={() => {
                      saveCart([
                        { ...CATALOG_PRODUCTS[0], qty: 1 },
                        { ...CATALOG_PRODUCTS[2], qty: 2 },
                        { ...CATALOG_PRODUCTS[3], qty: 1 }
                      ]);
                    }}
                    className="px-4 py-2 border border-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-md hover:bg-slate-900 transition-all cursor-pointer shadow-sm"
                  >
                    Auto-Fill All
                  </button>
                </div>
              </div>

              {/* Telusuri Produk Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">Telusuri Produk</h3>
                  
                  {/* Category Filter Buttons */}
                  <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-wider">
                    {['Semua', 'Sayuran', 'Daging', 'Bumbu'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 border transition-all cursor-pointer ${selectedCategory === cat ? 'bg-[#00bfa5]/10 text-[#00bfa5] border-[#00bfa5]/30' : 'bg-transparent border-slate-800 text-slate-400 hover:text-white'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar Input */}
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari bahan masakan segar..."
                    className="w-full bg-[#080b11] border border-slate-900 rounded-md py-3 pl-10 pr-4 text-xs font-semibold text-white outline-none focus:border-[#00bfa5]"
                  />
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredProducts.map((prod) => (
                    <div key={prod.id} className="bg-[#080b11] border border-slate-900 rounded-md overflow-hidden flex flex-col justify-between shadow-sm relative group">
                      
                      {/* Badge status */}
                      {prod.badge && (
                        <span className="absolute top-2.5 left-2.5 z-10 text-[8px] bg-slate-950/90 border border-slate-800 text-white font-black px-1.5 py-0.5 rounded tracking-wide">
                          {prod.badge}
                        </span>
                      )}

                      {/* Product Thumbnail */}
                      <div className="w-full h-32 bg-slate-950 overflow-hidden relative border-b border-slate-950">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Metadata */}
                      <div className="p-3 text-left space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="font-extrabold text-xs text-white truncate uppercase tracking-wider">{prod.name}</h5>
                          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{prod.unit}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs font-black text-white">
                            Rp {new Intl.NumberFormat('id-ID').format(prod.price)}
                          </span>
                          <button
                            id={prod.id === 'prod_1' ? 'tour-add-product' : undefined}
                            onClick={() => handleAddToCart(prod)}
                            className={`w-7 h-7 rounded-md border border-slate-800 bg-[#0c101a] hover:bg-[#00bfa5] hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer font-black shadow-sm ${tourStep === 1 && prod.id === 'prod_1' ? 'tour-highlight' : ''}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Cart Right Panel */}
            <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-900 bg-[#080b11] p-4 flex flex-col justify-between shrink-0">
              
              {/* Cart Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider">Keranjang</h3>
                  <span className="bg-[#00bfa5]/10 border border-[#00bfa5]/30 text-[#00bfa5] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                    {cart.reduce((acc, curr) => acc + curr.qty, 0)} Item
                  </span>
                </div>

                {/* Cart items list */}
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 bg-[#0c101a] p-2.5 border border-slate-900 rounded-md shadow-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded border border-slate-900" />
                          <div className="text-left truncate flex-1">
                            <span className="font-extrabold text-[11px] text-white block truncate uppercase tracking-wider leading-none">{item.name}</span>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Rp {new Intl.NumberFormat('id-ID').format(item.price)}</span>
                          </div>
                        </div>
                        {/* Qty selectors */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleUpdateQty(item.id, -1)} className="w-5 h-5 rounded border border-slate-800 bg-[#080b11] flex items-center justify-center text-xs font-black cursor-pointer hover:bg-slate-900">
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-[10px] font-black text-white w-4 text-center">{item.qty}</span>
                          <button onClick={() => handleUpdateQty(item.id, 1)} className="w-5 h-5 rounded border border-slate-800 bg-[#080b11] flex items-center justify-center text-xs font-black cursor-pointer hover:bg-slate-900">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-500 hover:text-red-400 pl-1 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[11px] text-slate-500 italic font-semibold text-center">Keranjang kosong. Tambah produk segar dari catalog.</p>
                    </div>
                  )}
                </div>

                {/* AI Smart Suggestion */}
                {cart.length > 0 && !cart.find(item => item.id === 'prod_7') && (
                  <div className="bg-[#00bfa5]/5 border border-[#00bfa5]/15 p-3 rounded-md text-left space-y-2">
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      <span className="text-[#00bfa5] font-black">✦ SARAN CERDAS:</span> Lupa beli Minyak Zaitun? AI mendeteksi ini sering dipasangkan dengan Salmon.
                    </p>
                    <button 
                      onClick={handleAddSmartSuggestion}
                      className="text-[9px] font-black uppercase text-[#00bfa5] hover:underline cursor-pointer block"
                    >
                      + Tambah Minyak Zaitun (Rp 55k)
                    </button>
                  </div>
                )}
              </div>

              {/* Checkout Calculation and Trigger */}
              <div className="space-y-4 border-t border-slate-900 pt-4 mt-4">
                
                <div className="space-y-1.5 text-[10px] font-bold tracking-wide">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Produk:</span>
                    <span className="text-white">Rp {new Intl.NumberFormat('id-ID').format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan:</span>
                    <span className="text-white">Rp {new Intl.NumberFormat('id-ID').format(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan AI:</span>
                    <span className="text-[#00bfa5] flex gap-1 items-center font-black">
                      <span className="line-through text-slate-600 font-bold">Rp 5.000</span> FREE
                    </span>
                  </div>
                  <div className="h-px bg-slate-900/60 my-1" />
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-300">Total Tagihan:</span>
                    <span className="text-[#00bfa5]">Rp {new Intl.NumberFormat('id-ID').format(totalBill)}</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-2.5 border border-slate-900 text-left flex items-start gap-2.5">
                  <Bot className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-slate-500 leading-normal font-semibold">
                    "Halo, apa Anda ingin saya mencarikan resep masakan untuk bahan Salmon segar ini?"
                  </p>
                </div>

                <button
                  id="tour-checkout"
                  onClick={handleProceedToChatConfirm}
                  disabled={cart.length === 0}
                  className={`w-full py-3.5 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer
                    ${cart.length > 0 ? 'bg-[#00bfa5] text-slate-950 hover:bg-[#00e5c1] hover:scale-[1.01] active:scale-[0.98]' : 'bg-slate-900 text-slate-600 border border-slate-950 cursor-not-allowed'}
                    ${tourStep === 2 ? 'tour-highlight' : ''}
                  `}
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </aside>
          </div>
        )}

        {/* VIEW 2: CHECKOUT PAGE */}
        {activeTab === 'checkout' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full p-4 md:p-6 gap-6 overflow-y-auto">
            
            {/* Left Block Details */}
            <div className="flex-1 space-y-6">
              
              {/* Alamat Pengiriman */}
              <div className="bg-[#080b11] border border-slate-900 rounded-md p-5 text-left">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-[#00bfa5]" />
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Alamat Pengiriman</h3>
                  </div>
                  <button className="text-[10px] font-black text-[#00bfa5] uppercase hover:underline cursor-pointer">
                    Ubah Alamat
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-[#0c101a] p-4 border border-slate-900/60 rounded">
                  <div className="w-20 h-20 bg-slate-950 border border-slate-900 shrink-0 rounded overflow-hidden flex items-center justify-center relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-800">
                      <rect width="100" height="100" fill="currentColor"/>
                      <path stroke="#1e293b" strokeWidth="2" d="M10 50 Q 50 20 90 50" fill="none"/>
                      <circle cx="50" cy="40" r="4" fill="#ef4444" />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-xs text-white uppercase tracking-wider block">Rumah (Utama)</span>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-md">
                      Jl. Kemang Raya No. 12, Bangka, Mampang Prapatan, Jakarta Selatan, 12730
                    </p>
                    <span className="text-[10px] text-slate-500 block font-semibold">+62 812-3456-7890</span>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="bg-[#080b11] border border-slate-900 rounded-md p-5 text-left">
                <div className="border-b border-slate-900 pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-[#00bfa5]" />
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Metode Pembayaran</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* GoPay */}
                  <button
                    onClick={() => setSelectedPayment('gopay')}
                    className={`p-4 border text-left flex justify-between items-center transition-all cursor-pointer shadow-sm
                      ${selectedPayment === 'gopay' 
                        ? 'bg-[#0c101a] border-[#00bfa5] text-[#00bfa5]' 
                        : 'bg-[#0c101a] border-slate-900 text-slate-400 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Coins className="w-5 h-5 text-[#00bfa5]" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">GoPay</span>
                        <span className="text-[9px] text-slate-500 block font-semibold mt-0.5">SALDO: RP 450.000</span>
                      </div>
                    </div>
                    {selectedPayment === 'gopay' && <Check className="w-4 h-4 text-[#00bfa5] shrink-0" />}
                  </button>

                  {/* OVO */}
                  <button
                    onClick={() => setSelectedPayment('ovo')}
                    className={`p-4 border text-left flex justify-between items-center transition-all cursor-pointer shadow-sm
                      ${selectedPayment === 'ovo' 
                        ? 'bg-[#0c101a] border-[#00bfa5] text-[#00bfa5]' 
                        : 'bg-[#0c101a] border-slate-900 text-slate-400 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-purple-400" />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider block">OVO</span>
                        <span className="text-[9px] text-slate-500 block font-semibold mt-0.5">SALDO: RP 125.500</span>
                      </div>
                    </div>
                    {selectedPayment === 'ovo' && <Check className="w-4 h-4 text-[#00bfa5] shrink-0" />}
                  </button>

                  {/* VA */}
                  <button
                    onClick={() => setSelectedPayment('va')}
                    className={`p-4 border text-left flex justify-between items-center transition-all cursor-pointer shadow-sm
                      ${selectedPayment === 'va' 
                        ? 'bg-[#0c101a] border-[#00bfa5] text-[#00bfa5]' 
                        : 'bg-[#0c101a] border-slate-900 text-slate-400 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5 text-blue-400" />
                      <span className="text-xs font-black uppercase tracking-wider">Transfer Bank (VA)</span>
                    </div>
                    {selectedPayment === 'va' && <Check className="w-4 h-4 text-[#00bfa5] shrink-0" />}
                  </button>

                  {/* Card */}
                  <button
                    onClick={() => setSelectedPayment('card')}
                    className={`p-4 border text-left flex justify-between items-center transition-all cursor-pointer shadow-sm
                      ${selectedPayment === 'card' 
                        ? 'bg-[#0c101a] border-[#00bfa5] text-[#00bfa5]' 
                        : 'bg-[#0c101a] border-slate-900 text-slate-400 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-teal-400" />
                      <span className="text-xs font-black uppercase tracking-wider">Kartu Kredit/Debit</span>
                    </div>
                    {selectedPayment === 'card' && <Check className="w-4 h-4 text-[#00bfa5] shrink-0" />}
                  </button>

                </div>
              </div>

              {/* Ringkasan Pesanan */}
              <div className="bg-[#080b11] border border-slate-900 rounded-md p-5 text-left">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-[#00bfa5]" />
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Ringkasan Pesanan</h3>
                  </div>
                  <span className="bg-[#00bfa5]/10 border border-[#00bfa5]/30 text-[#00bfa5] text-[9px] font-black px-2 py-0.5 rounded tracking-wide uppercase">
                    {checkoutItems.length} Produk
                  </span>
                </div>

                <div className="space-y-3.5">
                  {checkoutItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 bg-[#0c101a] p-3 border border-slate-900/60 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-950 border border-slate-900 flex items-center justify-center text-[10px] font-black text-[#00bfa5]">
                          {item.name[0].toUpperCase()}
                        </div>
                        <div className="text-left">
                          <span className="font-extrabold text-xs text-white uppercase tracking-wider block leading-none">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-1">{item.unit || '1 unit'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-white block">Rp {new Intl.NumberFormat('id-ID').format(item.price)}</span>
                        <span className="text-[8px] bg-slate-900 text-slate-400 font-bold px-1.5 py-0.5 rounded block mt-0.5 text-right w-max ml-auto">
                          {item.qty || 1} UNIT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Block summary and Action payment */}
            <aside className="w-full lg:w-80 bg-[#080b11] border border-slate-900 p-5 rounded-md text-left flex flex-col justify-between shrink-0 h-max">
              
              <div className="space-y-5">
                <div className="border-b border-slate-900 pb-3.5">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-white">Rincian Pembayaran</h3>
                </div>

                {/* Costs Detail */}
                <div className="space-y-3 text-[11px] font-bold tracking-wide">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Produk:</span>
                    <span className="text-white">Rp {new Intl.NumberFormat('id-ID').format(checkoutTotal - 15000)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Ongkos Kirim:</span>
                    <span className="text-white">Rp 15.000</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan AI:</span>
                    <span className="text-[#00bfa5] flex gap-1 items-center font-black">
                      <span className="line-through text-slate-600 font-bold">Rp 5.000</span> FREE
                    </span>
                  </div>
                  <div className="h-px bg-slate-900 my-1" />
                  <div className="flex justify-between text-sm font-black">
                    <span className="text-slate-300">Total Tagihan:</span>
                    <span className="text-[#00bfa5]">Rp {new Intl.NumberFormat('id-ID').format(checkoutTotal)}</span>
                  </div>
                </div>

                {/* Voucher code Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Gunakan Kode Promo"
                    className="flex-1 bg-[#0c101a] border border-slate-900 rounded py-2 px-3 text-[10px] text-white outline-none focus:border-[#00bfa5]"
                  />
                  <button className="px-3 bg-slate-950 hover:bg-slate-900 text-[#00bfa5] border border-slate-900 text-[10px] font-black uppercase rounded cursor-pointer transition-all">
                    Apply
                  </button>
                </div>

                {/* Submit trigger button */}
                <button
                  id="tour-pay"
                  onClick={handleExecutePayment}
                  className={`w-full py-4 bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 font-black text-xs uppercase tracking-widest rounded transition-all active:scale-[0.98] shadow-lg cursor-pointer ${tourStep === 3 ? 'tour-highlight' : ''}`}
                >
                  BAYAR SEKARANG
                </button>

                <p className="text-[8px] text-slate-500 leading-normal text-center font-semibold">
                  Dengan membayar, Anda menyetujui Syarat & Ketentuan. Emak AI. Pembayaran dijamin aman dengan enkripsi AES-256.
                </p>
              </div>

              {/* Bot Pro Tip */}
              <div className="bg-[#00bfa5]/5 border border-[#00bfa5]/15 p-3 rounded-md mt-6 space-y-1.5 flex flex-col justify-start">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-[#00bfa5] uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5" />
                  <span>PRO TIP AI</span>
                </div>
                <p className="text-[9px] text-slate-400 leading-relaxed font-semibold">
                  Pesanan ini memenuhi syarat untuk <span className="text-white">Cashback 5%</span> jika dibayar menggunakan GoPay. Ingin lanjut?
                </p>
              </div>

            </aside>

          </div>
        )}

        {/* VIEW 3: RIWAYAT PESANAN */}
        {activeTab === 'history' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 text-left">
            
            {/* Header section with Stats spent */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-900 pb-6">
              <div>
                <h2 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight uppercase">Riwayat Pesanan</h2>
                <p className="text-slate-500 text-xs font-semibold mt-1 max-w-lg leading-relaxed">
                  Kelola logistik rumah tangga Anda dengan presisi. AI kami melacak setiap detail kebutuhan dapur Anda.
                </p>
              </div>

              {/* Stat spend total */}
              <div className="bg-[#080b11] border border-slate-900 p-4 rounded-md flex items-center gap-3.5 shrink-0 shadow-sm">
                <div className="w-10 h-10 rounded-md bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5]">
                  <Coins className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold block uppercase tracking-wider">TOTAL PENGELUARAN</span>
                  <span className="font-display font-black text-white text-base block mt-0.5">
                    Rp {new Intl.NumberFormat('id-ID').format(orders.reduce((acc, curr) => curr.status === 'COMPLETED' ? acc + curr.total : acc, 0) + 2450000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Split layout for Order List and Right Map Widget */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              
              {/* Left Side: Filter and Cards list */}
              <div className="flex-grow space-y-6 w-full lg:max-w-4xl">
                
                {/* Order filter selectors */}
                <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest">
                  {['Semua', 'Sedang Berjalan', 'Selesai', 'Dibatalkan'].map((pill) => (
                    <button
                      key={pill}
                      className="px-4 py-2 bg-[#080b11] text-slate-400 border border-slate-900 rounded-full hover:text-white cursor-pointer hover:bg-slate-900/30 transition-all"
                    >
                      {pill}
                    </button>
                  ))}
                </div>

                {/* List Order Cards */}
                <div className="space-y-4">
                  {orders.map((ord) => {
                    const isActive = ord.status === 'IN PROGRESS';
                    const isCompleted = ord.status === 'COMPLETED';
                    const isCancelled = ord.status === 'CANCELLED';

                    return (
                      <div 
                        key={ord.id} 
                        className={`bg-[#080b11] border rounded-md p-5 flex flex-col justify-between gap-5 relative transition-all shadow-sm
                          ${isActive ? 'border-[#00bfa5] shadow-lg shadow-[#00bfa5]/5' : 'border-slate-900'}`}
                      >
                        
                        {/* Top Order details row */}
                        <div className="flex justify-between items-start gap-4 w-full">
                          
                          {/* Title & Details (Left side) */}
                          <div className="text-left space-y-1 min-w-0 flex-grow">
                            <h4 className="font-display font-black text-sm text-white uppercase tracking-wider truncate">{ord.title}</h4>
                            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wide">
                              <span>ID: #{ord.id}</span>
                              <span>•</span>
                              <span>{ord.date}</span>
                              <span>•</span>
                              <span>{ord.details}</span>
                            </div>
                          </div>

                          {/* Status Badge (Right side) */}
                          <div className="shrink-0 pt-0.5">
                            <span className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded uppercase border select-none
                              ${isActive ? 'bg-[#00bfa5]/10 text-[#00bfa5] border-[#00bfa5]/20' : 
                                isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                'bg-red-500/10 text-red-400 border-red-500/20'}`}
                            >
                              {isActive ? 'PROSES' : isCompleted ? 'SELESAI' : 'BATAL'}
                            </span>
                          </div>

                        </div>

                        {/* Action triggers */}
                        <div className="shrink-0 flex gap-2.5">
                          {isActive && (
                            <>
                              <button
                                onClick={() => handleTrackProgress(ord)}
                                className="bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95 animate-pulse"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Lacak</span>
                              </button>
                              <button
                                onClick={() => handleFinishOrder(ord.id)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-widest px-4 py-2.5 rounded flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Selesaikan</span>
                              </button>
                            </>
                          )}
                          {!isActive && !isCancelled && (
                            <>
                              <button className="border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded cursor-pointer transition-all">
                                Detail
                              </button>
                              <button 
                                onClick={() => {
                                  // Add items back to cart
                                  if (ord.items && ord.items.length > 0) {
                                    saveCart(ord.items.map((it, idx) => ({
                                      id: `reorder_${idx}_${Date.now()}`,
                                      name: it.name,
                                      price: it.price || 15000,
                                      unit: it.unit || 'unit',
                                      qty: it.quantity || 1,
                                      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&auto=format&fit=crop'
                                    })));
                                    setActiveTab('beranda');
                                  }
                                }}
                                className="border border-slate-800 hover:bg-slate-900 text-[#00bfa5] font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded cursor-pointer transition-all"
                              >
                                Pesan Lagi
                              </button>
                            </>
                          )}
                          {isCancelled && (
                            <button 
                              onClick={() => {
                                handleTrackProgress(ord);
                              }}
                              className="border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded cursor-pointer transition-all"
                            >
                              Lihat Riwayat Chat
                            </button>
                          )}
                        </div>

                        {/* Active Footer en-route update status */}
                        {isActive && (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-slate-500 font-bold tracking-wide gap-2 border-t border-slate-900/60 pt-3">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-[#00bfa5] animate-bounce shrink-0" />
                              <span>{ord.courierStatus || 'Kurir sedang memproses belanjaan'}</span>
                            </span>
                            <span className="text-slate-400 shrink-0 font-mono">
                              ETA: {ord.eta || '15 Menit'}
                            </span>
                          </div>
                        )}

                        {isCancelled && (
                          <p className="text-[10px] text-red-400 italic font-semibold border-t border-slate-900/60 pt-3">{ord.cancelReason || 'Dibatalkan oleh sistem'}</p>
                        )}

                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Right Side: Mini Tracking Map Widget */}
              <div id="tour-map-tracker" className={`w-full lg:w-[350px] shrink-0 ${tourStep === 5 ? 'tour-highlight' : ''}`}>
                <MiniTrackerWidget 
                  orders={orders} 
                  onTrackProgress={handleTrackProgress} 
                  onFinishOrder={handleFinishOrder} 
                  onStartShopping={() => setActiveTab('beranda')}
                />
              </div>

            </div>

          </div>
        )}

        {/* VIEW 4: DEDICATED CHATBOT PAGE */}
        {activeTab === 'chatbot' && (
          <div className="flex-1 flex overflow-hidden h-full">
            {/* Left side: Chat channel selector list. Visible on desktop, or on mobile when activeChatId is null */}
            <div className={`w-full lg:w-80 border-r border-slate-900 flex flex-col bg-[#080b11] h-full shrink-0 ${activeChatId !== null ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-4 border-b border-slate-900 shrink-0">
                {/* Buat Pesanan CTA Button */}
                <button
                  onClick={() => setActiveTab('beranda')}
                  className="w-full py-3 px-4 bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 font-black rounded uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg animate-pulse"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Buat Pesanan Baru</span>
                </button>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                <p className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mb-1 text-left">Pilih Saluran Percakapan:</p>

                {/* Primary General Chat Channel */}
                <button
                  onClick={() => setActiveChatId('general')}
                  className={`w-full p-3.5 border border-slate-900 rounded-lg group text-left shadow-sm cursor-pointer transition-all flex items-center justify-between ${
                    activeChatId === 'general' ? 'bg-[#00bfa5]/10 border-[#00bfa5]/35' : 'bg-[#0c101a] hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5]">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-[11px] text-white block uppercase tracking-wider">Asisten Belanja AI</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 truncate max-w-[155px]">
                        {generalMessages.length > 0 ? generalMessages[generalMessages.length - 1].text : "Mulai diskusi belanja baru..."}
                      </span>
                    </div>
                  </div>
                  <span className="text-[8px] bg-[#00bfa5]/10 border border-[#00bfa5]/20 text-[#00bfa5] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">
                    AI BOT
                  </span>
                </button>

                {/* Orders Specific Chat Channels */}
                {orders.map((ord) => {
                  const lastMsg = ord.chatLog && ord.chatLog.length > 0 ? ord.chatLog[ord.chatLog.length - 1].text : "Status transaksi diperbarui.";
                  const isProgress = ord.status === 'IN PROGRESS';
                  const isCompleted = ord.status === 'COMPLETED';
                  const isCancelled = ord.status === 'CANCELLED';
                  const isSelected = activeChatId === ord.id;

                  return (
                    <button
                      key={ord.id}
                      onClick={() => {
                        setActiveChatId(ord.id);
                        if (isProgress) {
                          setTrackingOrderId(ord.id);
                        }
                      }}
                      className={`w-full p-3.5 border border-slate-900 rounded-lg group text-left shadow-sm cursor-pointer transition-all flex items-center justify-between ${
                        isSelected ? 'bg-[#00bfa5]/10 border-[#00bfa5]/35' : 'bg-[#0c101a] hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black
                          ${isProgress ? 'bg-[#00bfa5]/10 text-[#00bfa5] border border-[#00bfa5]/20' : 
                            isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            'bg-red-500/10 text-red-400 border-red-500/20'}`}
                        >
                          {isProgress ? <Truck className="w-4 h-4" /> : '📦'}
                        </div>
                        <div>
                          <span className="font-extrabold text-[11px] text-white block uppercase tracking-wider">{ord.title}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 truncate max-w-[155px]">
                            {lastMsg}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider
                        ${isProgress ? 'bg-[#00bfa5]/10 text-[#00bfa5] border-[#00bfa5]/20' : 
                          isCompleted ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                          'bg-red-500/10 text-red-400 border-red-500/20'}`}
                      >
                        {isProgress ? 'PROSES' : isCompleted ? 'SELESAI' : 'BATAL'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Active Chat Thread Conversation. Visible on desktop, or on mobile when activeChatId is not null */}
            <div className={`flex-1 flex flex-col h-full bg-[#0c101a]/20 ${activeChatId === null ? 'hidden lg:flex' : 'flex'}`}>
              {activeChatId === null ? (
                /* Empty state when no thread is selected on desktop */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-slate-500">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-black text-sm uppercase text-slate-500 tracking-wider">Belum Ada Chat Terpilih</h3>
                  <p className="text-xs text-slate-500 font-semibold max-w-xs leading-relaxed">
                    Silakan pilih salah satu saluran chat di sebelah kiri untuk berdiskusi dengan AI Asisten atau memantau kurir belanja.
                  </p>
                </div>
              ) : (
                /* Active thread conversation screen */
                <>
                  {/* Active Thread Header */}
                  <div className="bg-[#0c101a] px-4 py-3.5 border-b border-slate-900 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                      {/* Back button on mobile to return to list */}
                      <button
                        onClick={() => { setActiveChatId(null); setTrackingOrderId(null); }}
                        className="lg:hidden text-slate-400 hover:text-white transition-colors mr-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      {activeChatId === 'general' ? (
                        <>
                          <Bot className="w-4 h-4 text-[#00bfa5]" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Asisten Belanja AI</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Order Chat #{activeChatId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tracking info sub-header if en-route */}
                  {activeChatId && trackingOrderId && (
                    <div className="bg-[#0c101a]/85 p-3 border-b border-slate-900 shrink-0 flex items-center justify-between gap-3 text-[10px] font-bold">
                      <span className="text-slate-400 flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-[#00bfa5] animate-ping shrink-0" />
                        <span className="truncate">Kurir sedang mengemas barang di pasar</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setShowMapTrackerId(activeChatId)} 
                          className="bg-[#00bfa5]/10 border border-[#00bfa5]/30 hover:bg-[#00bfa5] hover:text-slate-950 text-[#00bfa5] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Buka Peta
                        </button>
                        <span className="text-[#00bfa5] font-mono text-[9px] shrink-0 bg-[#00bfa5]/10 border border-[#00bfa5]/20 px-1.5 py-0.5 rounded uppercase font-black animate-pulse">
                          ETA: 12m
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Messages list */}
                  <div className="flex-grow overflow-y-auto p-4 space-y-4 flex flex-col">
                    {chatMessages.map((msg, index) => (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end ml-auto' : 'self-start mr-auto'}`}
                      >
                        <div className={`p-3 rounded-lg text-[11px] leading-relaxed font-semibold shadow-sm text-left
                          ${msg.sender === 'user' 
                            ? 'bg-slate-800 border border-slate-700/50 text-slate-200' 
                            : msg.sender === 'courier'
                              ? 'bg-slate-900 border border-slate-800 text-white font-extrabold'
                              : 'bg-[#00bfa5] text-slate-950 font-extrabold'}`}
                        >
                          {msg.sender === 'courier' && (
                            <span className="block text-[8px] text-[#00bfa5] uppercase font-black tracking-widest mb-1">
                              KURIR ANTAR
                            </span>
                          )}
                          <p className="whitespace-pre-line">{msg.text}</p>

                          {/* Pay Button inside widget */}
                          {msg.showPayButton && (
                            <div className="mt-3.5 pt-2.5 border-t border-slate-950/10 flex">
                              <button
                                onClick={handleProceedToPayment}
                                className="bg-slate-950 text-white font-black uppercase text-[8px] tracking-widest px-3.5 py-2 rounded hover:bg-slate-900 flex items-center gap-1.5 transition-all shadow cursor-pointer"
                              >
                                <span>Lanjut Ke Pembayaran</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          {/* Track Button inside widget */}
                          {msg.showTrackButton && (
                            <div className="mt-3.5 pt-2.5 border-t border-slate-950/10 flex">
                              <button
                                onClick={() => {
                                  const targetOrd = (msg.associatedOrderId && orders.find(o => o.id === msg.associatedOrderId)) || 
                                                    orders.find(o => o.status === 'IN PROGRESS') || 
                                                    orders[0];
                                  if (targetOrd) {
                                    handleTrackProgress(targetOrd);
                                  }
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-[8px] tracking-widest px-3.5 py-2 rounded transition-all flex items-center gap-1.5 transition-all shadow cursor-pointer"
                              >
                                <span>Lacak Kurir Belanja</span>
                                <MapPin className="w-3.5 h-3.5 text-slate-950" />
                              </button>
                            </div>
                          )}

                          {/* Redirect to Catalog / Order Menu button */}
                          {msg.showOrderMenuButton && (
                            <div className="mt-3.5 pt-2.5 border-t border-[#00bfa5]/25 flex">
                              <button
                                onClick={() => {
                                  setActiveTab('beranda');
                                }}
                                className="bg-slate-950 text-white border border-[#00bfa5]/35 font-black uppercase text-[8px] tracking-widest px-3.5 py-2 rounded hover:bg-slate-900 flex items-center gap-1.5 transition-all shadow cursor-pointer animate-bounce"
                                style={{ animationDuration: '2s' }}
                              >
                                <span>Mulai Order Baru</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-[7.5px] text-slate-500 mt-1 font-black uppercase pl-1 text-left">
                          {msg.timestamp || 'Baru Saja'}
                        </span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Active Order Quick Action Bar */}
                  {activeChatId !== 'general' && orders.find(o => o.id === activeChatId)?.status === 'IN PROGRESS' && (
                    <div className="bg-[#0c101a] px-3.5 py-2.5 border-t border-slate-900 flex items-center justify-between shrink-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        Pesanan sudah Ibu terima?
                      </span>
                      <button
                        id="tour-finish-order"
                        onClick={() => handleFinishOrder(activeChatId)}
                        className={`bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded transition-all cursor-pointer shadow-sm active:scale-95 ${tourStep === 6 ? 'tour-highlight' : ''}`}
                      >
                        Selesaikan Pesanan
                      </button>
                    </div>
                  )}

                  {/* Quick Order Recipes & Tracking Templates */}
                  {activeChatId === 'general' && (
                    <div className="px-3 pt-2 pb-1.5 bg-[#080b11] border-t border-slate-900 shrink-0 flex flex-col space-y-1.5 text-left">
                      <span className="text-[8.5px] text-slate-500 font-extrabold uppercase tracking-widest">
                        Pesan Cepat & Akses Lacak:
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
                        {/* Lacak Kurir Shortcut */}
                        {(() => {
                          const currentActiveOrder = orders.find(o => o.status === 'IN PROGRESS');
                          if (!currentActiveOrder) return null;
                          return (
                            <button
                              onClick={() => handleTrackProgress(currentActiveOrder)}
                              className="bg-emerald-500/10 border border-emerald-500/35 hover:bg-emerald-500/20 hover:border-emerald-500/60 text-emerald-400 text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded transition-all cursor-pointer shrink-0 flex items-center gap-1 active:scale-95 shadow-sm animate-pulse"
                            >
                              <span>📍 Lacak Kurir</span>
                            </button>
                          );
                        })()}

                        {[
                          {
                            name: "Salmon Panggang Asparagus",
                            label: "🍣 Salmon Panggang",
                            items: [{ id: 'prod_2', qty: 2 }, { id: 'prod_4', qty: 1 }, { id: 'prod_7', qty: 1 }]
                          },
                          {
                            name: "Sop Bayam & Tomat Roma",
                            label: "🥬 Sop Bayam Segar",
                            items: [{ id: 'prod_5', qty: 2 }, { id: 'prod_1', qty: 2 }, { id: 'prod_3', qty: 1 }]
                          },
                          {
                            name: "Salad Alpukat & Tomat Salad",
                            label: "🥑 Salad Alpukat Sehat",
                            items: [{ id: 'prod_6', qty: 1 }, { id: 'prod_1', qty: 1 }, { id: 'prod_7', qty: 1 }]
                          }
                        ].map((recipe, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => handleQuickOrder(recipe.name, recipe.items)}
                            className="bg-[#00bfa5]/5 border border-[#00bfa5]/20 hover:bg-[#00bfa5]/15 hover:border-[#00bfa5]/40 text-[#00bfa5] text-[9.5px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded transition-all cursor-pointer shrink-0 flex items-center gap-1 active:scale-95 shadow-sm"
                          >
                            <span>{recipe.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input box */}
                  <div className="p-3 bg-[#080b11] border-t border-slate-900 shrink-0 flex items-center gap-2">
                    <input
                      id="tour-chat-input"
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      placeholder={activeChatId === 'general' ? "Tulis daftar belanjaan Ibu..." : "Kirim chat balasan ke Kurir..."}
                      className={`flex-grow bg-[#0c101a] border border-slate-900 rounded py-2 px-3 text-[11px] font-semibold text-white outline-none focus:border-[#00bfa5] ${tourStep === 4 ? 'tour-highlight' : ''}`}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 bg-[#00bfa5] text-slate-950 rounded hover:bg-[#00e5c1] transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Payment processing loader modal */}
      <div id="payment_loading" className="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-[#080b11] border border-slate-900 p-8 rounded-md text-center space-y-4 max-w-xs w-full shadow-2xl">
          <RefreshCw className="w-8 h-8 text-[#00bfa5] animate-spin mx-auto" />
          <h4 className="text-sm font-black uppercase tracking-wider text-white">Memproses Pembayaran</h4>
          <p className="text-[10px] text-slate-500 font-bold">Mengamankan deposit saldo Anda di Escrow...</p>
        </div>
      </div>

      {/* Fullscreen Map Tracker Overlay */}
      {showMapTrackerId && (
        <MapTracker 
          orderId={showMapTrackerId} 
          onClose={() => setShowMapTrackerId(null)}
          onOpenChat={() => {
            setActiveTab('chatbot');
            setActiveChatId(showMapTrackerId);
            setShowMapTrackerId(null);
          }}
          orders={orders}
        />
      )}

      {/* TOUR BACKDROP MASK */}
      {tourStep >= 0 && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-[1px] z-[90] pointer-events-auto transition-all duration-300 animate-fade-in" />
      )}

      {/* TOUR WALKTHROUGH POPUP CARD */}
      {tourStep >= 0 && (
        <div 
          className={`fixed bg-slate-950/95 border-2 border-[#00bfa5] p-5 rounded-xl shadow-2xl max-w-sm w-11/12 text-left backdrop-blur-md transition-all duration-300 z-[100] ${
            tourStep === 0 
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
              : 'top-24 left-3 lg:top-16 lg:left-[268px]'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#00bfa5]/15 border border-[#00bfa5]/35 flex items-center justify-center text-[#00bfa5] shrink-0 animate-bounce">
              <Bot className="w-5.5 h-5.5" />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-display font-black text-xs text-white uppercase tracking-widest leading-none flex items-center justify-between">
                <span>Panduan Belanja Emak AI</span>
                <span className="text-[10px] text-slate-500 font-bold">Langkah {tourStep === 0 ? "Persiapan" : `${tourStep}/6`}</span>
              </h4>
              <p className="text-[11px] text-slate-300 font-semibold leading-relaxed mt-2.5">
                {tourStep === 0 && "Selamat datang di Emak AI! Mari kita coba simulasi jastip belanja pasar tradisional. Kami akan memandu Ibu langkah demi langkah agar tidak bingung."}
                {tourStep === 1 && "Langkah 1: Klik tombol '+ Keranjang' (atau icon keranjang) pada produk makanan (misal 'Salmon Fillet') untuk memasukkannya ke keranjang belanja."}
                {tourStep === 2 && "Langkah 2: Keranjang belanja terisi. Klik tombol 'Checkout' di bagian paling bawah untuk memproses pesanan."}
                {tourStep === 3 && "Langkah 3: Periksa total tagihan. Klik tombol hijau 'BAYAR SEKARANG' untuk menyimpan deposit di rekening bersama (Escrow)."}
                {tourStep === 4 && "Langkah 4: Pembayaran sukses! Buka Asisten AI / Obrolan Kurir di pojok kanan bawah untuk mengobrol dengan AI atau melacak kurir."}
                {tourStep === 5 && "Langkah 5: Di sisi kanan Riwayat Pesanan, perhatikan widget 'Mini Lacak Map'. Kurir bergerak dari pasar tradisional menuju ke alamat Ibu secara real-time."}
                {tourStep === 6 && "Langkah 6 (Terakhir): Jika kurir telah mengantar belanjaan ke rumah Ibu, klik tombol 'Selesaikan Pesanan' pada chat untuk mencairkan dana Escrow."}
              </p>
              
              <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-900">
                <button
                  onClick={() => {
                    setTourStep(-1);
                    localStorage.setItem('emak_tour_completed', 'true');
                  }}
                  className="text-[9px] font-black uppercase text-slate-500 hover:text-slate-400 cursor-pointer"
                >
                  Lewati Tur
                </button>
                
                <div className="flex items-center gap-2">
                  {tourStep > 0 && tourStep !== 4 && tourStep !== 6 && (
                    <button
                      onClick={() => {
                        if (tourStep === 1) setTourStep(0);
                        else if (tourStep === 2) setTourStep(1);
                        else if (tourStep === 3) {
                          setActiveTab('beranda');
                          setTourStep(2);
                        }
                        else if (tourStep === 5) {
                          setActiveTab('chatbot');
                          setActiveChatId('general');
                          setTourStep(4);
                        }
                      }}
                      className="px-3 py-1.5 border border-slate-850 hover:bg-slate-900 rounded text-slate-400 hover:text-white font-bold uppercase text-[9px] cursor-pointer"
                    >
                      Kembali
                    </button>
                  )}
                  
                  {tourStep === 0 && (
                    <button
                      onClick={() => {
                        setActiveTab('beranda');
                        setTourStep(1);
                      }}
                      className="px-4.5 py-1.5 bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 font-black rounded uppercase text-[9px] cursor-pointer shadow-md"
                    >
                      Mulai Sekarang
                    </button>
                  )}

                  {(tourStep === 4 || tourStep === 5) && (
                    <button
                      onClick={() => {
                        if (tourStep === 4) {
                          setActiveTab('history');
                          setTourStep(5);
                        } else if (tourStep === 5) {
                          // Open active order chat
                          const activeOrd = orders.find(o => o.status === 'IN PROGRESS') || orders[0];
                          if (activeOrd) {
                            setActiveChatId(activeOrd.id);
                          } else {
                            setActiveChatId('general');
                          }
                          setActiveTab('chatbot');
                          setTourStep(6);
                        }
                      }}
                      className="px-4.5 py-1.5 bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 font-black rounded uppercase text-[9px] cursor-pointer shadow-md"
                    >
                      Lanjut
                    </button>
                  )}

                  {tourStep === 6 && (
                    <button
                      onClick={() => {
                        setTourStep(-1);
                        localStorage.setItem('emak_tour_completed', 'true');
                      }}
                      className="px-4.5 py-1.5 bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 font-black rounded uppercase text-[9px] cursor-pointer shadow-md animate-pulse"
                    >
                      Selesai Tur
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Fullscreen Map Tracker using Leaflet
function MapTracker({ orderId, onClose, onOpenChat, orders }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  const order = orders.find(ord => ord.id === orderId);
  const driverName = "Budi Santoso";
  const driverRating = "4.9 ★";
  const driverPhone = "+62 812-3456-7890";
  const courierStatus = order?.courierStatus || "Kurir sedang mengantar pesanan Anda";
  const eta = order?.eta || "12 Menit";

  useEffect(() => {
    if (!mapRef.current) return;
    
    // Coordinates (Pasar Modern BSD as Pickup point A, and target as Delivery point B)
    const pickupCoords = [-6.3023, 106.6874]; 
    const deliveryCoords = [-6.3115, 106.6782]; 
    
    // Initialize Leaflet Map
    const map = L.map(mapRef.current, {
      zoomControl: false
    }).setView(pickupCoords, 14);
    
    mapInstanceRef.current = map;
    
    // Premium dark-styled tiles (CartoDB Dark Matter) matching the Obsidian Black theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20
    }).addTo(map);
    
    // Add custom zoom control at top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);
    
    // Custom DIV Icons matching obsidian/emerald/amber color scheme
    const pickupIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-10 h-10 rounded-full bg-[#080b11] border-2 border-[#00bfa5] flex items-center justify-center text-lg shadow-lg shadow-emerald-950/20 select-none">🛒</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const deliveryIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-10 h-10 rounded-full bg-[#080b11] border-2 border-amber-500 flex items-center justify-center text-lg shadow-lg shadow-amber-950/20 select-none">🏠</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const driverIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-12 h-12 rounded-full bg-[#00bfa5] border-2 border-slate-950 flex items-center justify-center text-xl shadow-xl shadow-emerald-500/20 animate-bounce select-none">🛵</div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
    
    // Render markers on the map
    L.marker(pickupCoords, { icon: pickupIcon }).addTo(map)
      .bindPopup('<b class="text-slate-900">Pasar Modern BSD</b><br/><span class="text-slate-600">Lokasi mitra toko tempat kurir mengambil belanjaan Anda.</span>');
    
    L.marker(deliveryCoords, { icon: deliveryIcon }).addTo(map)
      .bindPopup('<b class="text-slate-900">Alamat Pengantaran</b><br/><span class="text-slate-600">Alamat tujuan pengantaran Anda.</span>');
      
    // Draw route line
    const routeLine = L.polyline([pickupCoords, deliveryCoords], {
      color: '#00bfa5',
      weight: 4,
      opacity: 0.8,
      dashArray: '8, 8'
    }).addTo(map);
    
    // Fit map bounds to show complete path
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    
    // Initialize driver marker along path
    let fraction = 0.25;
    const initialLat = pickupCoords[0] + (deliveryCoords[0] - pickupCoords[0]) * fraction;
    const initialLng = pickupCoords[1] + (deliveryCoords[1] - pickupCoords[1]) * fraction;
    
    const driverMarker = L.marker([initialLat, initialLng], { icon: driverIcon }).addTo(map)
      .bindPopup('<b class="text-slate-900">Kurir: Budi Santoso</b><br/><span class="text-slate-600">Sedang mengantarkan pesanan belanjaan Ibu.</span>');
      
    // Animate driver moving along path
    const interval = setInterval(() => {
      fraction += 0.015;
      if (fraction > 0.95) fraction = 0.25; // Loop back coordinates for prototype demonstration
      
      const nextLat = pickupCoords[0] + (deliveryCoords[0] - pickupCoords[0]) * fraction;
      const nextLng = pickupCoords[1] + (deliveryCoords[1] - pickupCoords[1]) * fraction;
      
      driverMarker.setLatLng([nextLat, nextLng]);
    }, 4000);
    
    return () => {
      clearInterval(interval);
      map.remove();
    };
  }, [orderId]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#080b11] flex flex-col font-sans">
      {/* Top Header Navbar */}
      <div className="h-16 bg-[#080b11]/90 backdrop-blur border-b border-slate-900 px-4 flex items-center justify-between shrink-0 sticky top-0 z-[101]">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-black uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="text-center">
          <span className="text-xs text-[#00bfa5] font-black uppercase tracking-widest block">Live Tracking</span>
          <span className="text-[10px] text-slate-400 font-semibold">{orderId}</span>
        </div>
        <button
          onClick={onOpenChat}
          className="bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 px-3.5 py-1.5 rounded text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat Kurir</span>
        </button>
      </div>

      {/* Map Display area */}
      <div className="flex-1 relative bg-[#0c101a] overflow-hidden">
        <div ref={mapRef} className="absolute inset-0 z-0" />

        {/* Courier Details Floating Overlay Card */}
        <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-[360px] z-[1000] bg-[#0c101a]/95 border border-slate-900 backdrop-blur-md rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-left">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/3d_driver_vecteezy.png" 
                alt="Driver Profile" 
                className="w-12 h-12 rounded-full border border-slate-800 bg-[#080b11] object-contain p-1 shadow-inner" 
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop";
                }}
              />
              <div>
                <span className="font-extrabold text-xs text-white block uppercase tracking-wider">{driverName}</span>
                <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{driverRating} • Mitra Kurir</span>
              </div>
            </div>
            
            <a 
              href={`tel:${driverPhone}`}
              className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-[#00bfa5] hover:bg-[#00bfa5]/10 hover:border-[#00bfa5]/20 transition-all cursor-pointer shadow-sm"
              title="Hubungi via Telepon"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          <hr className="border-slate-900" />

          <div className="space-y-1.5">
            <span className="text-[9px] text-[#00bfa5] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00bfa5] animate-ping" />
              Status Pengantaran
            </span>
            <p className="text-xs text-white font-extrabold leading-normal">{courierStatus}</p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-1 bg-[#080b11]/60 p-3 rounded-lg border border-slate-950">
            <div>
              <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest block">Estimasi Tiba</span>
              <span className="text-xs text-white font-black font-mono block mt-0.5 animate-pulse">{eta}</span>
            </div>
            <div>
              <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest block">Metode Pembayaran</span>
              <span className="text-xs text-[#00bfa5] font-black block mt-0.5 uppercase tracking-wide">Escrow Secured</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Mini Order Tracking Widget inside History Page
function MiniTrackerWidget({ orders, onTrackProgress, onFinishOrder, onStartShopping }) {
  const miniMapRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  
  // Find the latest order that is active
  const activeOrder = orders.find(o => o.status === 'IN PROGRESS');

  useEffect(() => {
    if (!activeOrder || !miniMapRef.current) return;
    
    // Cleanup previous map instance if any
    if (miniMapInstanceRef.current) {
      miniMapInstanceRef.current.remove();
      miniMapInstanceRef.current = null;
    }
    
    const pickupCoords = [-6.3023, 106.6874]; 
    const deliveryCoords = [-6.3115, 106.6782]; 
    
    // Initialize mini Leaflet Map
    const map = L.map(miniMapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false, // make it static preview style
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false
    }).setView(pickupCoords, 14);
    
    miniMapInstanceRef.current = map;
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);
    
    const pickupIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-7 h-7 rounded-full bg-[#080b11] border-2 border-[#00bfa5] flex items-center justify-center text-xs select-none">🛒</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const deliveryIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-7 h-7 rounded-full bg-[#080b11] border-2 border-amber-500 flex items-center justify-center text-xs select-none">🏠</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const driverIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-8 h-8 rounded-full bg-[#00bfa5] border border-slate-950 flex items-center justify-center text-xs shadow-md animate-bounce select-none">🛵</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    
    L.marker(pickupCoords, { icon: pickupIcon }).addTo(map);
    L.marker(deliveryCoords, { icon: deliveryIcon }).addTo(map);
    
    const routeLine = L.polyline([pickupCoords, deliveryCoords], {
      color: '#00bfa5',
      weight: 3,
      opacity: 0.7,
      dashArray: '5, 5'
    }).addTo(map);
    
    map.fitBounds(routeLine.getBounds(), { padding: [15, 15] });
    
    let fraction = 0.35;
    const initialLat = pickupCoords[0] + (deliveryCoords[0] - pickupCoords[0]) * fraction;
    const initialLng = pickupCoords[1] + (deliveryCoords[1] - pickupCoords[1]) * fraction;
    
    const driverMarker = L.marker([initialLat, initialLng], { icon: driverIcon }).addTo(map);
    
    // Simulate slow marker movement on dashboard
    const interval = setInterval(() => {
      fraction += 0.01;
      if (fraction > 0.9) fraction = 0.3;
      
      const nextLat = pickupCoords[0] + (deliveryCoords[0] - pickupCoords[0]) * fraction;
      const nextLng = pickupCoords[1] + (deliveryCoords[1] - pickupCoords[1]) * fraction;
      driverMarker.setLatLng([nextLat, nextLng]);
    }, 5000);
    
    return () => {
      clearInterval(interval);
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [activeOrder?.id]);

  if (!activeOrder) {
    return (
      <div className="bg-[#080b11] border border-slate-900 rounded-md p-6 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
          <Truck className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">Tidak Ada Pengiriman</h4>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
            Semua pesanan belanja telah selesai. Belanja sekarang di catalog untuk melacak kurir live di sini.
          </p>
        </div>
        <button 
          onClick={onStartShopping}
          className="w-full bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 font-black text-[9px] uppercase tracking-widest py-2.5 rounded transition-all cursor-pointer shadow active:scale-95"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  const driverName = "Budi Santoso";
  const courierStatus = activeOrder.courierStatus || "Kurir sedang mengemas barang di pasar";
  const eta = activeOrder.eta || "15 Menit";

  return (
    <div className="bg-[#080b11] border border-[#00bfa5] rounded-md overflow-hidden flex flex-col shadow-lg shadow-[#00bfa5]/5 text-left">
      
      <div className="bg-[#0c101a] px-4 py-3 border-b border-slate-900 flex items-center justify-between">
        <span className="text-[9px] text-[#00bfa5] font-black uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00bfa5] animate-ping" />
          Pelacakan Aktif
        </span>
        <span className="text-[9px] text-slate-500 font-mono font-bold">{activeOrder.id}</span>
      </div>

      {/* Mini static map container */}
      <div className="h-56 relative bg-[#0c101a] border-b border-slate-900 overflow-hidden">
        <div ref={miniMapRef} className="absolute inset-0 z-0" />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/3d_driver_vecteezy.png" 
              alt="Courier profile" 
              className="w-9 h-9 rounded-full border border-slate-800 bg-[#080b11] object-contain p-0.5"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"; }}
            />
            <div>
              <span className="text-[10px] font-black text-white block uppercase tracking-wider">{driverName}</span>
              <span className="text-[8px] text-[#00bfa5] font-black block tracking-wider uppercase">Mitra Kurir</span>
            </div>
          </div>
          <span className="bg-[#00bfa5]/10 border border-[#00bfa5]/20 text-[#00bfa5] font-mono text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide animate-pulse">
            ETA: {eta}
          </span>
        </div>

        <div className="bg-[#0c101a] p-3 rounded border border-slate-950 text-[10px] font-bold leading-normal text-slate-400">
          <span className="text-slate-500 text-[8px] uppercase tracking-wider block mb-1">Status Terkini:</span>
          {courierStatus}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[9px] font-black tracking-widest uppercase">
          <button
            onClick={() => onTrackProgress(activeOrder)}
            className="bg-[#00bfa5] hover:bg-[#00e5c1] text-slate-950 py-2.5 rounded text-center transition-all cursor-pointer shadow active:scale-95"
          >
            Lacak Detail
          </button>
          <button
            onClick={() => onFinishOrder(activeOrder.id)}
            className="border border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 py-2.5 rounded text-center transition-all cursor-pointer active:scale-95"
          >
            Selesaikan
          </button>
        </div>
      </div>

    </div>
  );
}
