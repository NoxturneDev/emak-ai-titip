import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, ArrowRight, Menu, X, ChevronRight, 
  MessageSquare, Zap, Truck, ShieldCheck, UserCheck, Heart, 
  Search, Bot, Plus, Minus, Trash2, MapPin, CreditCard, 
  Coins, Check, FileText, RefreshCw, Send, ArrowLeft, Phone, Home
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
  const [activeTab, setActiveTab] = useState('hub'); // 'hub' | 'chatbot' | 'beranda' | 'checkout' | 'history' | 'order_widget'
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
  const [selectedDetailOrder, setSelectedDetailOrder] = useState(null);

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
            text: `Pembayaran Berhasil! Dana sebesar Rp ${new Intl.NumberFormat('id-ID').format(newOrder.total)} telah kami amankan di rekening bersama (Escrow).\n\nBahan belanjaan sudah dibayar dan pesanan ${newOrderId} sedang diproses. Silakan ketuk tombol di bawah untuk melacak kurir belanja Anda!`,
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col font-sans selection:bg-[#00bfa5] selection:text-white">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-highlight {
          0%, 100% { border-color: #00bfa5; box-shadow: 0 0 0 2px #00bfa5, 0 0 15px 4px rgba(0, 191, 165, 0.5); }
          50% { border-color: #00e5c1; box-shadow: 0 0 0 6px #00e5c1, 0 0 25px 8px rgba(0, 191, 165, 0.8); }
        }
        .tour-highlight {
          animation: pulse-highlight 1.8s infinite !important;
          border: 2px solid #00bfa5 !important;
          border-radius: 8px !important;
          position: relative !important;
          z-index: 100 !important;
          pointer-events: auto !important;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      {/* Top Navbar */}
      <header className="h-16 bg-white/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-50 shadow-sm border-none">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <span 
            onClick={() => setActiveTab('hub')}
            className="font-display font-black text-xl tracking-wider cursor-pointer select-none text-slate-800"
          >
            EMAK<span className="text-[#00bfa5]">AI</span>
          </span>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none ${activeTab === 'chatbot' ? 'bg-[#00bfa5] text-white shadow' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat Bot</span>
            </button>
            <button
              onClick={() => setActiveTab('beranda')}
              className={`px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none ${activeTab === 'beranda' ? 'bg-[#00bfa5] text-white shadow' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Menu Belanja</span>
            </button>
            <button
              onClick={() => setActiveTab('order_widget')}
              className={`px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none ${activeTab === 'order_widget' ? 'bg-[#00bfa5] text-white shadow' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <Zap className="w-4 h-4" />
              <span>Widget Pesanan</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border-none ${activeTab === 'history' ? 'bg-[#00bfa5] text-white shadow' : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
            >
              <FileText className="w-4 h-4" />
              <span>Riwayat</span>
            </button>
          </div>
        </div>

        {/* Right Side: Back to Menu Hub and Dev Panel */}
        <div className="flex items-center gap-3">
          {activeTab !== 'hub' && (
            <button
              onClick={() => setActiveTab('hub')}
              className="px-5 py-2 bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black text-xs uppercase tracking-wider rounded-full flex items-center gap-1.5 transition-all cursor-pointer border-none shadow active:scale-95"
            >
              <Home className="w-4 h-4 text-white" />
              <span>Menu Utama</span>
            </button>
          )}

          {/* Dev Panel Switcher */}
          <button
            onClick={() => onToggleDevPanel()}
            className="p-2 text-amber-600 hover:bg-amber-500/10 transition-all cursor-pointer border-none rounded bg-slate-100"
            title="Developer Simulator"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Mobile Hamburger menu toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border-none bg-slate-100 text-slate-700 rounded-xl cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown List */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f8fafc] border-b border-slate-200 p-4 space-y-2.5 flex flex-col text-left shrink-0 z-40 relative animate-fade-in">
          <button
            onClick={() => { setActiveTab('hub'); setMobileMenuOpen(false); }}
            className={`w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-3 border-none ${activeTab === 'hub' ? 'bg-[#00bfa5] text-white font-black shadow' : 'bg-transparent text-slate-650 hover:bg-slate-200/50 text-slate-600'}`}
          >
            <Home className="w-4 h-4" />
            <span>Menu Utama</span>
          </button>
          <button
            onClick={() => { setActiveTab('chatbot'); setMobileMenuOpen(false); }}
            className={`w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-3 border-none ${activeTab === 'chatbot' ? 'bg-[#00bfa5] text-white font-black shadow' : 'bg-transparent text-slate-650 hover:bg-slate-200/50 text-slate-600'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Chat Bot</span>
          </button>
          <button
            onClick={() => { setActiveTab('beranda'); setMobileMenuOpen(false); }}
            className={`w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-3 border-none ${activeTab === 'beranda' ? 'bg-[#00bfa5] text-white font-black shadow' : 'bg-transparent text-slate-650 hover:bg-slate-200/50 text-slate-600'}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Menu Belanja</span>
          </button>
          <button
            onClick={() => { setActiveTab('order_widget'); setMobileMenuOpen(false); }}
            className={`w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-3 border-none ${activeTab === 'order_widget' ? 'bg-[#00bfa5] text-white font-black shadow' : 'bg-transparent text-slate-650 hover:bg-slate-200/50 text-slate-600'}`}
          >
            <Zap className="w-4 h-4" />
            <span>Widget Pesanan</span>
          </button>
          <button
            onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}
            className={`w-full py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-3 border-none ${activeTab === 'history' ? 'bg-[#00bfa5] text-white font-black shadow' : 'bg-transparent text-slate-650 hover:bg-slate-200/50 text-slate-600'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Riwayat Pesanan</span>
          </button>
        </div>
      )}

      {/* Content Container Panel */}
      <main className="flex-grow flex flex-col overflow-hidden bg-[#f1f5f9] h-[calc(100vh-64px)] relative">

        {/* VIEW 0: SIMPLE CARD HUB VIEW (for non-tech users) */}
        {activeTab === 'hub' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6 md:space-y-8 flex flex-col justify-center max-w-4xl mx-auto w-full text-center">
            <div className="space-y-2">
              <span className="text-[10px] text-[#00bfa5] bg-[#00bfa5]/8 border border-[#00bfa5]/15 font-black px-2.5 py-1 rounded-full uppercase tracking-widest block w-max mx-auto animate-pulse">
                Sistem Jastip Belanja Emak AI
              </span>
              <h2 className="font-display font-black text-3xl md:text-4xl text-slate-900 tracking-tight uppercase">
                Halo Ibu, Mau Belanja Apa?
              </h2>
              <p className="text-slate-600 text-xs md:text-sm font-semibold max-w-lg mx-auto leading-relaxed">
                Kami siap bantu Ibu belanja bahan segar dari pasar. Ketuk salah satu pilihan mudah di bawah untuk memulai!
              </p>
            </div>

            {/* Hub Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              
              {/* Card 1: Chatbot */}
              <div className="bg-white rounded-2xl p-6 text-center flex flex-col justify-between items-center transition-all group shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:shadow-[#00bfa5]/5 hover:scale-[1.02] duration-300 border-none">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5] group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-wide">
                      Tanya & Pesan Lewat Chat
                    </h3>
                    <p className="text-[11px] text-slate-550 font-semibold leading-relaxed max-w-xs text-slate-500">
                      Tanya resep, minta rekomendasi menu harian, atau ketik langsung bahan belanjaan Ibu ke AI.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className="bg-[#00bfa5] hover:bg-[#00e5c1] text-white text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-full border-none w-full transition-all cursor-pointer mt-6 active:scale-[0.98] shadow-md"
                >
                  Mulai Chat Tanya Emak
                </button>
              </div>

              {/* Card 2: Catalog Menu */}
              <div className="bg-white rounded-2xl p-6 text-center flex flex-col justify-between items-center transition-all group shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:shadow-[#00bfa5]/5 hover:scale-[1.02] duration-300 border-none">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5] group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-wide">
                      Pilih Menu Belanjaan
                    </h3>
                    <p className="text-[11px] text-slate-550 font-semibold leading-relaxed max-w-xs text-slate-500">
                      Lihat daftar sayur segar, daging segar, ayam, ikan, buah, dan bumbu dapur lengkap dari pasar.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('beranda')}
                  className="bg-[#00bfa5] hover:bg-[#00e5c1] text-white text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-full border-none w-full transition-all cursor-pointer mt-6 active:scale-[0.98] shadow-md"
                >
                  Lihat Menu & Catalog
                </button>
              </div>

              {/* Card 3: Order Widget */}
              <div className="bg-white rounded-2xl p-6 text-center flex flex-col justify-between items-center transition-all group shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:shadow-[#00bfa5]/5 hover:scale-[1.02] duration-300 border-none">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5] group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-wide">
                      Widget Monitor & Beli Cepat
                    </h3>
                    <p className="text-[11px] text-slate-550 font-semibold leading-relaxed max-w-xs text-slate-500">
                      Pantau proses belanja kurir di pasar, order instan resep masakan, dan bayar lewat widget ringkas.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('order_widget')}
                  className="bg-[#00bfa5] hover:bg-[#00e5c1] text-white text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-full border-none w-full transition-all cursor-pointer mt-6 active:scale-[0.98] shadow-md"
                >
                  Buka Widget Pesanan
                </button>
              </div>

              {/* Card 4: History */}
              <div className="bg-white rounded-2xl p-6 text-center flex flex-col justify-between items-center transition-all group shadow-[0_15px_30px_rgba(0,0,0,0.03)] hover:shadow-[#00bfa5]/5 hover:scale-[1.02] duration-300 border-none">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5] group-hover:scale-110 transition-transform">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-wide">
                      Riwayat Nota Belanjaan
                    </h3>
                    <p className="text-[11px] text-slate-550 font-semibold leading-relaxed max-w-xs text-slate-500">
                      Lihat rincian bon belanjaan Ibu terdahulu yang sudah selesai diantar atau dibatalkan.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('history')}
                  className="bg-[#00bfa5] hover:bg-[#00e5c1] text-white text-xs font-black uppercase tracking-wider py-3.5 px-6 rounded-full border-none w-full transition-all cursor-pointer mt-6 active:scale-[0.98] shadow-md"
                >
                  Lihat Riwayat & Bon
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 1: CATALOG MENU & CART */}
        {activeTab === 'beranda' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
            
            {/* Catalog (Left/Middle area) */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto space-y-6">
              
              {/* Navigation Back Triggers */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('hub')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#00e5c1] cursor-pointer transition-colors bg-[#00bfa5] border-none px-5 py-2 rounded-full shadow"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Kembali ke Menu Utama</span>
                </button>
                <button
                  onClick={() => setActiveTab('chatbot')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-200 hover:text-slate-900 cursor-pointer transition-colors bg-white border-none shadow-sm px-5 py-2 rounded-full"
                >
                  <span>Chatbot Tanya Emak</span>
                </button>
              </div>



              {/* Telusuri Produk Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="font-display font-black text-lg text-slate-800 uppercase tracking-wider">Telusuri Produk</h3>
                  
                  {/* Category Filter Buttons */}
                  <div className="flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-wider">
                    {['Semua', 'Sayuran', 'Daging', 'Bumbu'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4.5 py-1.5 transition-all cursor-pointer border-none rounded-full ${selectedCategory === cat ? 'bg-[#00bfa5] text-white font-black shadow-sm' : 'bg-white text-slate-650 hover:text-slate-850 hover:bg-slate-100 shadow-sm'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar Input */}
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari bahan masakan segar..."
                    className="w-full bg-white border-none rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold text-slate-800 outline-none shadow-sm focus:ring-2 focus:ring-[#00bfa5]/40"
                  />
                </div>

                {/* Catalog Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredProducts.map((prod) => (
                    <div key={prod.id} className="bg-white rounded-2xl overflow-hidden flex flex-col justify-between shadow-md relative group border-none hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                      
                      {/* Badge status */}
                      {prod.badge && (
                        <span className="absolute top-2.5 left-2.5 z-10 text-[8px] bg-[#00bfa5] text-white font-black px-1.5 py-0.5 rounded tracking-wide border-none">
                          {prod.badge}
                        </span>
                      )}

                      {/* Product Thumbnail */}
                      <div className="w-full h-32 bg-slate-100 overflow-hidden relative border-none rounded-t-2xl">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Metadata */}
                      <div className="p-3 text-left space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h5 className="font-extrabold text-xs text-slate-800 truncate uppercase tracking-wider">{prod.name}</h5>
                          <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{prod.unit}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xs font-black text-slate-800">
                            Rp {new Intl.NumberFormat('id-ID').format(prod.price)}
                          </span>
                          <button
                            id={prod.id === 'prod_1' ? 'tour-add-product' : undefined}
                            onClick={() => handleAddToCart(prod)}
                            className={`w-7 h-7 rounded-full bg-slate-100 hover:bg-[#00bfa5] hover:text-white flex items-center justify-center transition-all cursor-pointer font-black border-none shadow-sm text-slate-800 ${tourStep === 1 && prod.id === 'prod_1' ? 'tour-highlight' : ''}`}
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
            <aside className="w-full lg:w-80 bg-white rounded-2xl p-4 lg:m-4 flex flex-col justify-between shrink-0 border-none shadow-[0_15px_30px_rgba(0,0,0,0.05)]">
              
              {/* Cart Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800">Keranjang</h3>
                  <span className="bg-[#00bfa5]/8 border border-[#00bfa5]/20 text-[#00bfa5] text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {cart.reduce((acc, curr) => acc + curr.qty, 0)} Item
                  </span>
                </div>

                {/* Cart items list */}
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-xl border-none shadow-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-lg border-none shadow-sm" />
                          <div className="text-left truncate flex-1">
                            <span className="font-extrabold text-[11px] text-slate-800 block truncate uppercase tracking-wider leading-none">{item.name}</span>
                            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Rp {new Intl.NumberFormat('id-ID').format(item.price)}</span>
                          </div>
                        </div>
                        {/* Qty selectors */}
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleUpdateQty(item.id, -1)} className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black cursor-pointer hover:bg-slate-300 border-none">
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="text-[10px] font-black text-slate-800 w-4 text-center">{item.qty}</span>
                          <button onClick={() => handleUpdateQty(item.id, 1)} className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black cursor-pointer hover:bg-slate-300 border-none">
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                          <button onClick={() => handleRemoveFromCart(item.id)} className="text-slate-500 hover:text-red-600 pl-1 cursor-pointer">
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
                  <div className="bg-[#00bfa5]/5 border border-[#00bfa5]/15 p-3.5 rounded-xl text-left space-y-2">
                    <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">
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
              <div className="space-y-4 border-t border-slate-100 pt-4 mt-4">
                
                <div className="space-y-1.5 text-[10px] font-bold tracking-wide">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Produk:</span>
                    <span className="text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan:</span>
                    <span className="text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan AI:</span>
                    <span className="text-[#00bfa5] flex gap-1 items-center font-black">
                      <span className="line-through text-slate-400 font-bold">Rp 5.000</span> FREE
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-slate-700">Total Tagihan:</span>
                    <span className="text-[#00bfa5]">Rp {new Intl.NumberFormat('id-ID').format(totalBill)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border-none shadow-sm text-left flex items-start gap-2.5">
                  <Bot className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-slate-600 leading-normal font-semibold">
                    "Halo, apa Anda ingin saya mencarikan resep masakan untuk bahan Salmon segar ini?"
                  </p>
                </div>

                <button
                  id="tour-checkout"
                  onClick={handleProceedToChatConfirm}
                  disabled={cart.length === 0}
                  className={`w-full py-4 px-6 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer
                    ${cart.length > 0 ? 'bg-[#00bfa5] text-white hover:bg-[#00e5c1] hover:scale-[1.01] active:scale-[0.98]' : 'bg-slate-200 text-slate-400 border-none cursor-not-allowed'}
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
          <div className="flex-1 flex flex-col overflow-y-auto h-full p-4 md:p-6 gap-6 text-left">
            {/* Back to Menu trigger */}
            <div className="flex items-center justify-start shrink-0">
              <button
                onClick={() => setActiveTab('hub')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-[#00bfa5] hover:bg-[#00e5c1] cursor-pointer transition-all px-5 py-2 rounded-full shadow border-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Kembali ke Menu Utama</span>
              </button>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            {/* Left Block Details */}
            <div className="flex-1 space-y-6">
              
              {/* Alamat Pengiriman */}
              <div className="bg-white rounded-2xl p-5 text-left shadow-md border-none">
                <div className="flex items-center justify-between pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-5 h-5 text-[#00bfa5]" />
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800">Alamat Pengiriman</h3>
                  </div>
                  <button className="text-[10px] font-black text-[#00bfa5] uppercase hover:underline cursor-pointer">
                    Ubah Alamat
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-slate-50 p-4 rounded-xl border-none shadow-sm">
                  <div className="w-20 h-20 bg-slate-200 border-none shrink-0 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-350 text-slate-400">
                      <rect width="100" height="100" fill="currentColor"/>
                      <path stroke="#cbd5e1" strokeWidth="2" d="M10 50 Q 50 20 90 50" fill="none"/>
                      <circle cx="50" cy="40" r="4" fill="#ef4444" />
                    </svg>
                  </div>
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block">Rumah (Utama)</span>
                    <p className="text-[11px] text-slate-650 font-semibold leading-relaxed max-w-md text-slate-600">
                      Jl. Kemang Raya No. 12, Bangka, Mampang Prapatan, Jakarta Selatan, 12730
                    </p>
                    <span className="text-[10px] text-slate-500 block font-semibold">+62 812-3456-7890</span>
                  </div>
                </div>
              </div>

              {/* Metode Pembayaran */}
              <div className="bg-white rounded-2xl p-5 text-left shadow-md border-none">
                <div className="pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-[#00bfa5]" />
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800">Metode Pembayaran</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* GoPay */}
                  <button
                    onClick={() => setSelectedPayment('gopay')}
                    className={`p-4 rounded-xl border-none text-left flex justify-between items-center transition-all cursor-pointer shadow-sm bg-slate-50 hover:bg-slate-100
                      ${selectedPayment === 'gopay' 
                        ? 'bg-white text-[#00bfa5] ring-2 ring-[#00bfa5]/45 shadow-md' 
                        : 'text-slate-600 hover:text-slate-800'}`}
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
                    className={`p-4 rounded-xl border-none text-left flex justify-between items-center transition-all cursor-pointer shadow-sm bg-slate-50 hover:bg-slate-100
                      ${selectedPayment === 'ovo' 
                        ? 'bg-white text-[#00bfa5] ring-2 ring-[#00bfa5]/45 shadow-md' 
                        : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-purple-500" />
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
                    className={`p-4 rounded-xl border-none text-left flex justify-between items-center transition-all cursor-pointer shadow-sm bg-slate-50 hover:bg-slate-100
                      ${selectedPayment === 'va' 
                        ? 'bg-white text-[#00bfa5] ring-2 ring-[#00bfa5]/45 shadow-md' 
                        : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-5 h-5 text-blue-500" />
                      <span className="text-xs font-black uppercase tracking-wider">Transfer Bank (VA)</span>
                    </div>
                    {selectedPayment === 'va' && <Check className="w-4 h-4 text-[#00bfa5] shrink-0" />}
                  </button>

                  {/* Card */}
                  <button
                    onClick={() => setSelectedPayment('card')}
                    className={`p-4 rounded-xl border-none text-left flex justify-between items-center transition-all cursor-pointer shadow-sm bg-slate-50 hover:bg-slate-100
                      ${selectedPayment === 'card' 
                        ? 'bg-white text-[#00bfa5] ring-2 ring-[#00bfa5]/45 shadow-md' 
                        : 'text-slate-600 hover:text-slate-800'}`}
                  >
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-teal-500" />
                      <span className="text-xs font-black uppercase tracking-wider">Kartu Kredit/Debit</span>
                    </div>
                    {selectedPayment === 'card' && <Check className="w-4 h-4 text-[#00bfa5] shrink-0" />}
                  </button>

                </div>
              </div>
              {/* Ringkasan Pesanan */}
              <div className="bg-white rounded-2xl p-5 text-left shadow-md border-none">
                <div className="flex items-center justify-between pb-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag className="w-5 h-5 text-[#00bfa5]" />
                    <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800">Ringkasan Pesanan</h3>
                  </div>
                  <span className="bg-[#00bfa5]/8 border border-[#00bfa5]/15 text-[#00bfa5] text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                    {checkoutItems.length} Produk
                  </span>
                </div>

                <div className="space-y-3.5">
                  {checkoutItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border-none shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-slate-200 border-none flex items-center justify-center text-[10px] font-black text-[#00bfa5] shadow-inner">
                          {item.name[0].toUpperCase()}
                        </div>
                        <div className="text-left">
                          <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block leading-none">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-1">{item.unit || '1 unit'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-slate-800 block">Rp {new Intl.NumberFormat('id-ID').format(item.price)}</span>
                        <span className="text-[8px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded block mt-0.5 text-right w-max ml-auto">
                          {item.qty || 1} UNIT
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Block summary and Action payment */}
            <aside className="w-full lg:w-80 bg-white p-5 rounded-2xl text-left flex flex-col justify-between shrink-0 h-max shadow-md border-none">
              
              <div className="space-y-5">
                <div className="pb-3.5">
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-slate-800">Rincian Pembayaran</h3>
                </div>

                {/* Costs Detail */}
                <div className="space-y-3 text-[11px] font-bold tracking-wide">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal Produk:</span>
                    <span className="text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(checkoutTotal - 15000)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Ongkos Kirim:</span>
                    <span className="text-slate-800">Rp 15.000</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Biaya Layanan AI:</span>
                    <span className="text-[#00bfa5] flex gap-1 items-center font-black">
                      <span className="line-through text-slate-400 font-bold">Rp 5.000</span> FREE
                    </span>
                  </div>
                  <div className="h-px bg-slate-200 my-1" />
                  <div className="flex justify-between text-sm font-black">
                    <span className="text-slate-800">Total Tagihan:</span>
                    <span className="text-[#00bfa5]">Rp {new Intl.NumberFormat('id-ID').format(checkoutTotal)}</span>
                  </div>
                </div>

                {/* Voucher code Input */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Gunakan Kode Promo"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-[10px] text-slate-850 outline-none focus:ring-1 focus:ring-[#00bfa5]"
                  />
                  <button className="px-5 bg-slate-100 hover:bg-slate-200 text-[#00bfa5] border-none text-[10px] font-black uppercase rounded-full cursor-pointer transition-all">
                    Apply
                  </button>
                </div>

                {/* Submit trigger button */}
                <button
                  id="tour-pay"
                  onClick={handleExecutePayment}
                  className={`w-full py-4.5 bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black text-xs uppercase tracking-widest rounded-full transition-all active:scale-[0.98] shadow-lg cursor-pointer ${tourStep === 3 ? 'tour-highlight' : ''}`}
                >
                  BAYAR SEKARANG
                </button>

                <p className="text-[8px] text-slate-500 leading-normal text-center font-semibold">
                  Dengan membayar, Anda menyetujui Syarat & Ketentuan. Emak AI. Pembayaran dijamin aman dengan enkripsi AES-256.
                </p>
              </div>

              {/* Bot Pro Tip */}
              <div className="bg-[#00bfa5]/5 border border-[#00bfa5]/15 p-3.5 rounded-xl mt-6 space-y-1.5 flex flex-col justify-start">
                <div className="flex items-center gap-1.5 text-[9px] font-black text-[#00bfa5] uppercase tracking-wider">
                  <Bot className="w-3.5 h-3.5" />
                  <span>PRO TIP AI</span>
                </div>
                <p className="text-[9px] text-slate-600 leading-relaxed font-semibold">
                  Pesanan ini memenuhi syarat untuk <span className="text-slate-800">Cashback 5%</span> jika dibayar menggunakan GoPay. Ingin lanjut?
                </p>
              </div>

            </aside>
          </div>
        </div>
      )}

        {/* VIEW 3: RIWAYAT PESANAN */}
        {activeTab === 'history' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 text-left">
            {/* Back to Menu trigger */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setActiveTab('hub')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-[#00bfa5] hover:bg-[#00e5c1] cursor-pointer transition-all px-5 py-2 rounded-full shadow border-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Kembali ke Menu Utama</span>
              </button>
            </div>
            
            {/* Header section with Stats spent */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-200 pb-6">
              <div>
                <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 tracking-tight uppercase">Riwayat Pesanan</h2>
                <p className="text-slate-500 text-xs font-semibold mt-1 max-w-lg leading-relaxed">
                  Kelola logistik rumah tangga Anda dengan presisi. AI kami melacak setiap detail kebutuhan dapur Anda.
                </p>
              </div>

              {/* Stat spend total */}
              <div className="bg-white p-4 rounded-2xl flex items-center gap-3.5 shrink-0 shadow-md border-none">
                <div className="w-10 h-10 rounded-xl bg-[#00bfa5]/8 border border-[#00bfa5]/15 flex items-center justify-center text-[#00bfa5]">
                  <Coins className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 font-extrabold block uppercase tracking-wider">TOTAL PENGELUARAN</span>
                  <span className="font-display font-black text-slate-800 text-base block mt-0.5">
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
                      className="px-4 py-2 bg-white text-slate-650 border-none shadow-sm rounded-full hover:text-slate-850 hover:bg-slate-100 cursor-pointer transition-colors text-slate-600"
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
                        className={`bg-white rounded-2xl p-5 flex flex-col justify-between gap-5 relative transition-all shadow-md hover:shadow-lg border-none hover:scale-[1.01] duration-300 ${isActive ? 'shadow-lg bg-[#00bfa5]/5 ring-1 ring-[#00bfa5]/15' : ''}`}
                      >
                        
                        {/* Top Order details row */}
                        <div className="flex justify-between items-start gap-4 w-full">
                          
                          {/* Title & Details (Left side) */}
                          <div className="text-left space-y-1 min-w-0 flex-grow">
                            <h4 className="font-display font-black text-sm text-slate-800 uppercase tracking-wider truncate">{ord.title}</h4>
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
                                isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                'bg-red-50 text-red-600 border-red-200'}`}
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
                                className="bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95 animate-pulse"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                <span>Lacak</span>
                              </button>
                              <button 
                                onClick={() => setSelectedDetailOrder(ord)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-6 py-2.5 rounded-full border-none cursor-pointer transition-all"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => handleFinishOrder(ord.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest px-6 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Selesaikan</span>
                              </button>
                            </>
                          )}
                          {!isActive && !isCancelled && (
                            <>
                              <button 
                                onClick={() => setSelectedDetailOrder(ord)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-6 py-2.5 rounded-full border-none cursor-pointer transition-all"
                              >
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
                                className="bg-[#00bfa5]/10 hover:bg-[#00bfa5]/20 text-[#00bfa5] font-bold text-[10px] uppercase tracking-wider px-6 py-2.5 rounded-full border-none cursor-pointer transition-all"
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
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-6 py-2.5 rounded-full border-none cursor-pointer transition-all"
                            >
                              Lihat Riwayat Chat
                            </button>
                          )}
                        </div>

                        {/* Active Footer en-route update status */}
                        {isActive && (
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-slate-500 font-bold tracking-wide gap-2 border-t border-slate-200 pt-3">
                            <span className="flex items-center gap-1.5 text-slate-650">
                              <MapPin className="w-3.5 h-3.5 text-[#00bfa5] animate-bounce shrink-0" />
                              <span>{ord.courierStatus || 'Kurir sedang memproses belanjaan'}</span>
                            </span>
                            <span className="text-slate-550 shrink-0 font-mono">
                              ETA: {ord.eta || '15 Menit'}
                            </span>
                          </div>
                        )}

                        {isCancelled && (
                          <p className="text-[10px] text-red-650 italic font-semibold border-t border-slate-200 pt-3">{ord.cancelReason || 'Dibatalkan oleh sistem'}</p>
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

        {/* VIEW 5: ORDER DATA WIDGET PAGE */}
        {activeTab === 'order_widget' && (
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 text-left">
            {/* Back to Menu trigger */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setActiveTab('hub')}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-[#00bfa5] hover:bg-[#00e5c1] cursor-pointer transition-all px-5 py-2 rounded-full shadow border-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← Kembali ke Menu Utama</span>
              </button>
            </div>
            {/* Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="font-display font-black text-2xl text-slate-900 tracking-tight uppercase">Widget Data Pesanan</h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">
                Pantau pesanan aktif, buat pesanan baru secara instan, dan lihat daftar menu belanjaan Emak AI.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Orders List (7 cols on large screens) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Active and Recent Orders Section */}
                <div className="bg-white rounded-2xl p-5 space-y-4 shadow-md border-none">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#00bfa5]">
                      Daftar Transaksi / Pesanan Anda
                    </h3>
                    <button
                      onClick={() => setActiveTab('beranda')}
                      className="bg-[#00bfa5] text-white hover:bg-[#00e5c1] text-[9.5px] font-black uppercase tracking-wider px-5 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1 active:scale-95 border-none shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Pesanan Baru</span>
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4 text-center font-semibold">Tidak ada pesanan.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.map((ord) => {
                        const isActive = ord.status === 'IN PROGRESS';
                        const isCompleted = ord.status === 'COMPLETED';
                        const isCancelled = ord.status === 'CANCELLED';

                        return (
                          <div 
                            key={ord.id} 
                            className={`p-4 rounded-2xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-none shadow-sm ${isActive ? 'bg-[#00bfa5]/10 shadow-md ring-1 ring-[#00bfa5]/15' : 'bg-slate-50 hover:bg-slate-100'}`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                  #{ord.id}
                                </span>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-wide border select-none ${
                                  isActive ? 'bg-[#00bfa5]/10 text-[#00bfa5] border-[#00bfa5]/20' : 
                                  isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                  'bg-red-50 text-red-600 border-red-200'
                                }`}>
                                  {isActive ? 'PROSES' : isCompleted ? 'SELESAI' : 'BATAL'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-600 font-semibold">{ord.title} ({ord.itemCount} item)</p>
                              <p className="text-[9px] text-slate-550 font-bold font-mono text-slate-500">Rp {new Intl.NumberFormat('id-ID').format(ord.total)} • {ord.date}</p>
                            </div>

                            <div className="flex gap-2 shrink-0">
                              <button 
                                onClick={() => setSelectedDetailOrder(ord)}
                                className="bg-slate-200 text-slate-700 hover:bg-slate-300 text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-full transition-all cursor-pointer border-none shadow-sm"
                              >
                                Detail
                              </button>
                              {isActive && (
                                <button 
                                  onClick={() => handleTrackProgress(ord)}
                                  className="bg-[#00bfa5] text-white hover:bg-[#00e5c1] text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1 border-none shadow-sm"
                                >
                                  <Truck className="w-3 h-3" />
                                  <span>Lacak</span>
                                </button>
                              )}
                              {!isActive && !isCancelled && (
                                <button 
                                  onClick={() => {
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
                                  className="bg-[#00bfa5] text-white hover:bg-[#00e5c1] text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-full transition-all cursor-pointer border-none shadow-sm"
                                >
                                  Pesan Lagi
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Recipes Section inside the Widget */}
                <div className="bg-white rounded-2xl p-5 space-y-4 shadow-md border-none">
                  <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#00bfa5] pb-3">
                    Template Belanja Cepat (Resep Rekomendasi)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        name: "Salmon Panggang Asparagus",
                        label: "Salmon Panggang",
                        desc: "Salmon & Asparagus sehat",
                        items: [{ id: 'prod_2', qty: 2 }, { id: 'prod_4', qty: 1 }, { id: 'prod_7', qty: 1 }]
                      },
                      {
                        name: "Sop Bayam & Tomat Roma",
                        label: "Sop Bayam Segar",
                        desc: "Sayuran bergizi tinggi",
                        items: [{ id: 'prod_5', qty: 2 }, { id: 'prod_1', qty: 2 }, { id: 'prod_3', qty: 1 }]
                      },
                      {
                        name: "Salad Alpukat & Tomat Salad",
                        label: "Salad Alpukat Sehat",
                        desc: "Alpukat mentega & minyak zaitun",
                        items: [{ id: 'prod_6', qty: 1 }, { id: 'prod_1', qty: 1 }, { id: 'prod_7', qty: 1 }]
                      }
                    ].map((recipe, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => {
                          handleQuickOrder(recipe.name, recipe.items);
                          setActiveTab('chatbot'); // Redirect to general chat chatbot to confirm!
                        }}
                        className="bg-slate-50 border-none hover:bg-slate-100 p-3 rounded-xl text-left transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] duration-300 shadow-sm flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                            <Zap className="w-3.5 h-3.5 text-[#00bfa5] shrink-0" />
                            <span>{recipe.label}</span>
                          </span>
                          <span className="text-[9px] text-slate-500 font-semibold block mt-1.5 leading-normal">{recipe.desc}</span>
                        </div>
                        <span className="text-[8px] text-[#00bfa5] font-black uppercase tracking-widest block mt-3">ORDER INSTAN</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Catalog Menu Items (5 cols on large screens) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white rounded-2xl p-5 space-y-4 shadow-md border-none">
                  <div className="pb-3 flex justify-between items-center">
                    <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#00bfa5]">
                      Menu Belanja Emak AI
                    </h3>
                    <span className="text-[8.5px] bg-[#00bfa5]/8 border border-[#00bfa5]/15 text-[#00bfa5] font-black px-1.5 py-0.5 rounded uppercase">
                      CATALOG
                    </span>
                  </div>

                  {/* Menu catalog list */}
                  <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                    {CATALOG_PRODUCTS.map((prod) => {
                      const inCartQty = cart.find(c => c.id === prod.id)?.qty || 0;
                      return (
                        <div key={prod.id} className="bg-slate-50 border-none p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <img 
                              src={prod.image} 
                              alt={prod.name} 
                              className="w-10 h-10 object-cover rounded-lg shrink-0"
                            />
                            <div className="text-left min-w-0">
                              <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider block truncate">
                                {prod.name}
                              </span>
                              <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
                                Rp {new Intl.NumberFormat('id-ID').format(prod.price)} / {prod.unit.replace('Per ', '')}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5">
                            {inCartQty > 0 ? (
                              <div className="flex items-center bg-slate-200 rounded overflow-hidden">
                                <button 
                                  onClick={() => handleUpdateQty(prod.id, -1)}
                                  className="px-2 py-1 hover:bg-slate-300 text-[10px] font-black cursor-pointer text-slate-650 hover:text-slate-800 text-slate-650"
                                >
                                  -
                                </button>
                                <span className="px-2.5 text-[10px] font-black text-[#00bfa5]">{inCartQty}</span>
                                <button 
                                  onClick={() => handleUpdateQty(prod.id, 1)}
                                  className="px-2 py-1 hover:bg-slate-300 text-[10px] font-black cursor-pointer text-slate-650 hover:text-slate-800 text-slate-650"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(prod)}
                                className="bg-[#00bfa5] text-white hover:bg-[#00e5c1] text-[9px] font-black uppercase px-5 py-2 rounded-full cursor-pointer transition-all border-none"
                              >
                                Tambah
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cart Summary & Checkout button */}
                  {cart.length > 0 && (
                    <div className="bg-slate-50 border-none p-4 rounded-xl text-left space-y-3.5 pt-3 mt-4 shadow-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider">TOTAL KERANJANG</span>
                          <span className="text-xs font-black text-slate-850 block mt-0.5 text-slate-800">
                            {cart.reduce((a, b) => a + b.qty, 0)} Item • Rp {new Intl.NumberFormat('id-ID').format(subtotal)}
                          </span>
                        </div>
                        <button
                          onClick={handleProceedToChatConfirm}
                          className="bg-[#00bfa5] hover:bg-[#00e5c1] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-md active:scale-95"
                        >
                          Checkout
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: DEDICATED CHATBOT PAGE */}
        {activeTab === 'chatbot' && (
          <div className="flex-1 flex overflow-hidden h-full">
            {/* Left side: Chat channel selector list. Visible on desktop, or on mobile when activeChatId is null */}
            <div className={`w-full lg:w-[360px] flex flex-col bg-white border-r border-slate-100 h-full shrink-0 shadow-sm border-none ${activeChatId !== null ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-4 shrink-0 space-y-3">
                {/* Back to Menu trigger */}
                <button
                  onClick={() => setActiveTab('hub')}
                  className="w-full py-3 px-5 bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black rounded-full uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow border-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Kembali ke Menu Utama</span>
                </button>
                {/* Buat Pesanan CTA Button */}
                <button
                  onClick={() => setActiveTab('beranda')}
                  className="w-full py-3.5 px-6 bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black rounded-full uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md animate-pulse"
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
                  className={`w-full p-3.5 border-none rounded-2xl group text-left shadow-sm cursor-pointer transition-all flex items-center justify-between ${
                    activeChatId === 'general' ? 'bg-[#00bfa5]/10 text-[#00bfa5]' : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5]">
                      <Bot className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="font-extrabold text-[11px] text-slate-800 block uppercase tracking-wider">Asisten Belanja AI</span>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-0.5 truncate max-w-[170px]">
                        {generalMessages.length > 0 ? generalMessages[generalMessages.length - 1].text : "Mulai diskusi belanja baru..."}
                      </span>
                    </div>
                  </div>
                  <span className="text-[8px] bg-[#00bfa5]/15 text-[#00bfa5] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">
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
                      className={`w-full p-3.5 border-none rounded-2xl group text-left shadow-sm cursor-pointer transition-all flex items-center justify-between ${
                        isSelected ? 'bg-[#00bfa5]/10 text-[#00bfa5]' : 'bg-slate-50 hover:bg-slate-100/80 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black
                          ${isProgress ? 'bg-[#00bfa5]/15 text-[#00bfa5]' : 
                            isCompleted ? 'bg-emerald-50 text-emerald-600' : 
                            'bg-red-50 text-red-600'}`}
                        >
                           {isProgress ? <Truck className="w-4 h-4" /> : isCompleted ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 text-left">
                          <span className="font-extrabold text-[11px] text-slate-800 block uppercase tracking-wider truncate max-w-[170px]">{ord.title}</span>
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5 truncate max-w-[170px]">
                            {lastMsg}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0
                        ${isProgress ? 'bg-[#00bfa5]/10 text-[#00bfa5] border-[#00bfa5]/25' : 
                          isCompleted ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                          'bg-red-100 text-red-700 border-red-200'}`}
                      >
                        {isProgress ? 'PROSES' : isCompleted ? 'SELESAI' : 'BATAL'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Active Chat Thread Conversation. Visible on desktop, or on mobile when activeChatId is not null */}
            <div className={`flex-1 flex flex-col h-full bg-slate-50/50 ${activeChatId === null ? 'hidden lg:flex' : 'flex'}`}>
              {activeChatId === null ? (
                /* Empty state when no thread is selected on desktop */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
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
                  <div className="bg-white px-4 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                      {/* Back button on mobile to return to list */}
                      <button
                        onClick={() => { setActiveChatId(null); setTrackingOrderId(null); }}
                        className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors mr-1 cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      
                      {activeChatId === 'general' ? (
                        <>
                          <Bot className="w-4 h-4 text-[#00bfa5]" />
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Asisten Belanja AI</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-emerald-600" />
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">Order Chat #{activeChatId}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tracking info sub-header if en-route */}
                  {activeChatId && trackingOrderId && (
                    <div className="bg-white/95 p-3 border-b border-slate-100 shrink-0 flex items-center justify-between gap-3 text-[10px] font-bold shadow-sm">
                      <span className="text-slate-650 flex items-center gap-1.5 truncate">
                        <span className="w-2 h-2 rounded-full bg-[#00bfa5] animate-ping shrink-0" />
                        <span className="truncate">Kurir sedang mengemas barang di pasar</span>
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => setShowMapTrackerId(activeChatId)} 
                          className="bg-[#00bfa5] text-white hover:bg-[#00e5c1] px-4.5 py-1.5 rounded-full text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer border-none shadow"
                        >
                          Buka Peta
                        </button>
                        <span className="text-[#00bfa5] font-mono text-[9px] shrink-0 bg-[#00bfa5]/10 px-1.5 py-0.5 rounded uppercase font-black animate-pulse">
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
                        <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-semibold shadow-sm text-left
                          ${msg.sender === 'user' 
                            ? 'bg-slate-100 text-slate-800 border-none' 
                            : msg.sender === 'courier'
                              ? 'bg-slate-200 text-slate-900 border-none font-extrabold'
                              : 'bg-[#00bfa5] text-white border-none font-extrabold'}`}
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
                                className="bg-slate-900 text-white font-black uppercase text-[8px] tracking-widest px-5 py-2.5 rounded-full hover:bg-slate-950 flex items-center gap-1.5 transition-all shadow cursor-pointer border-none"
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
                                className="bg-slate-800 hover:bg-slate-900 text-white font-black uppercase text-[8px] tracking-widest px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow cursor-pointer border-none"
                              >
                                <span>Lacak Kurir Belanja</span>
                                <MapPin className="w-3.5 h-3.5 text-white" />
                              </button>
                            </div>
                          )}

                          {/* Redirect to Catalog / Order Menu button */}
                          {msg.showOrderMenuButton && (
                            <div className="mt-3.5 pt-2.5 border-t border-white/20 flex">
                              <button
                                onClick={() => {
                                  setActiveTab('beranda');
                                }}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-black uppercase text-[8px] tracking-widest px-5 py-2.5 rounded-full flex items-center gap-1.5 transition-all shadow cursor-pointer border-none animate-bounce"
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
                    <div className="bg-white px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between shrink-0">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        Pesanan sudah Ibu terima?
                      </span>
                      <button
                        id="tour-finish-order"
                        onClick={() => handleFinishOrder(activeChatId)}
                        className={`bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[9px] uppercase tracking-widest px-5 py-2 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 border-none ${tourStep === 6 ? 'tour-highlight' : ''}`}
                      >
                        Selesaikan Pesanan
                      </button>
                    </div>
                  )}

                  {/* Quick Order Recipes & Tracking Templates */}
                  {activeChatId === 'general' && (
                    <div className="px-3 pt-2 pb-1.5 bg-slate-50 border-t border-slate-100 shrink-0 flex flex-col space-y-1.5 text-left">
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
                              className="bg-emerald-600 text-white hover:bg-emerald-700 text-[9.5px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1 active:scale-95 border-none shadow-sm animate-pulse"
                            >
                              <MapPin className="w-3.5 h-3.5 text-white" />
                              <span>Lacak Kurir</span>
                            </button>
                          );
                        })()}

                        {[
                          {
                            name: "Salmon Panggang Asparagus",
                            label: "Salmon Panggang",
                            items: [{ id: 'prod_2', qty: 2 }, { id: 'prod_4', qty: 1 }, { id: 'prod_7', qty: 1 }]
                          },
                          {
                            name: "Sop Bayam & Tomat Roma",
                            label: "Sop Bayam Segar",
                            items: [{ id: 'prod_5', qty: 2 }, { id: 'prod_1', qty: 2 }, { id: 'prod_3', qty: 1 }]
                          },
                          {
                            name: "Salad Alpukat & Tomat Salad",
                            label: "Salad Alpukat Sehat",
                            items: [{ id: 'prod_6', qty: 1 }, { id: 'prod_1', qty: 1 }, { id: 'prod_7', qty: 1 }]
                          }
                        ].map((recipe, rIdx) => (
                          <button
                            key={rIdx}
                            onClick={() => handleQuickOrder(recipe.name, recipe.items)}
                            className="bg-white text-slate-700 hover:bg-slate-100 text-[9.5px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 flex items-center gap-1.5 active:scale-95 border border-slate-200/50 shadow-sm"
                          >
                            <Zap className="w-3 h-3 text-[#00bfa5]" />
                            <span>{recipe.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input box */}
                  <div className="p-3 bg-white border-t border-slate-100 shrink-0 flex items-center gap-2">
                    <input
                      id="tour-chat-input"
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      placeholder={activeChatId === 'general' ? "Tulis daftar belanjaan Ibu..." : "Kirim chat balasan ke Kurir..."}
                      className={`flex-grow bg-slate-50 border-none rounded-2xl py-2.5 px-4 text-[11px] font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#00bfa5] shadow-inner ${tourStep === 4 ? 'tour-highlight' : ''}`}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2.5 bg-[#00bfa5] text-white rounded-full hover:bg-[#00e5c1] transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95 border-none"
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
      <div id="payment_loading" className="hidden fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white border-none p-8 rounded-2xl text-center space-y-4 max-w-xs w-full shadow-2xl">
          <RefreshCw className="w-8 h-8 text-[#00bfa5] animate-spin mx-auto" />
          <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">Memproses Pembayaran</h4>
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

      {/* High-Fidelity Order Details Modal */}
      <AnimatePresence>
        {selectedDetailOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white border-none rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-left max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h3 className="font-display font-black text-xs uppercase tracking-wider text-slate-800">
                    Rincian Pesanan #{selectedDetailOrder.id}
                  </h3>
                  <span className="text-[9px] text-slate-500 font-semibold block mt-1">
                    Dipesan pada {selectedDetailOrder.date}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedDetailOrder(null)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 border-none rounded bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-white">
                
                {/* Status Card */}
                <div className="bg-slate-50 border-none p-4 rounded-xl flex items-center justify-between shadow-inner">
                  <div>
                    <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">STATUS TRANSAKSI</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide border inline-block mt-1 uppercase ${
                      selectedDetailOrder.status === 'IN PROGRESS' ? 'bg-[#00bfa5]/10 text-[#00bfa5] border-[#00bfa5]/20' : 
                      selectedDetailOrder.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      'bg-red-50 text-red-650 border-red-100'
                    }`}>
                      {selectedDetailOrder.status === 'IN PROGRESS' ? 'SEDANG DIPROSES' : selectedDetailOrder.status === 'COMPLETED' ? 'SELESAI' : 'DIBATALKAN'}
                    </span>
                  </div>

                  {selectedDetailOrder.status === 'IN PROGRESS' && (
                    <div className="text-right">
                      <span className="text-[8px] text-[#00bfa5] font-black uppercase tracking-wider block">ETA KIRIM</span>
                      <span className="text-xs font-mono font-black text-slate-800 mt-1 block">{selectedDetailOrder.eta || '15 Menit'}</span>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="space-y-1.5 text-xs font-semibold">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">ALAMAT PENGIRIMAN</span>
                  <p className="text-slate-700 text-[11px] leading-relaxed bg-slate-50 p-3 border-none rounded-xl">
                    Jl. Kemang Raya No. 12, Bangka, Mampang Prapatan, Jakarta Selatan, 12730
                  </p>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">BARANG BELANJAAN</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {selectedDetailOrder.items && selectedDetailOrder.items.length > 0 ? (
                      selectedDetailOrder.items.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-3.5 border-none rounded-xl flex justify-between items-center text-xs shadow-sm">
                          <div>
                            <span className="font-extrabold text-slate-800 uppercase tracking-wider block">{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">{item.quantity || 1} x {item.unit || 'unit'}</span>
                          </div>
                          <span className="font-black text-slate-800">
                            Rp {new Intl.NumberFormat('id-ID').format((item.price || 15000) * (item.quantity || 1))}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-xs italic">Tidak ada item belanjaan.</p>
                    )}
                  </div>
                </div>

                {/* Cost Summary */}
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs font-semibold">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-wider block">RINCIAN BIAYA</span>
                  <div className="space-y-1.5 font-bold bg-white">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal Belanja:</span>
                      <span className="text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(selectedDetailOrder.total - 15000)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Ongkos Kirim (Flat):</span>
                      <span className="text-slate-800">Rp 15.000</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Biaya Layanan AI:</span>
                      <span className="text-[#00bfa5] font-black">GRATIS</span>
                    </div>
                    <div className="h-px bg-slate-100 my-1" />
                    <div className="flex justify-between text-sm font-black">
                      <span className="text-slate-700">Total Pembayaran:</span>
                      <span className="text-[#00bfa5]">Rp {new Intl.NumberFormat('id-ID').format(selectedDetailOrder.total)}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
                <button 
                  onClick={() => setSelectedDetailOrder(null)}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer"
                >
                  Tutup
                </button>
                {selectedDetailOrder.status === 'IN PROGRESS' && (
                  <button 
                    onClick={() => {
                      handleTrackProgress(selectedDetailOrder);
                      setSelectedDetailOrder(null);
                    }}
                    className="px-6 py-2.5 bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black text-[10px] uppercase tracking-widest rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow border-none"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Lacak Kurir</span>
                  </button>
                )}
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOUR BACKDROP MASK */}
      {tourStep >= 0 && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-[90] pointer-events-auto transition-all duration-300 animate-fade-in" />
      )}

      {/* TOUR WALKTHROUGH POPUP CARD */}
      {tourStep >= 0 && (
        <div 
          className={`fixed bg-white border-2 border-[#00bfa5] p-5 rounded-2xl shadow-2xl max-w-sm w-11/12 text-left transition-all duration-300 z-[100] ${
            tourStep === 0 
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' 
              : 'top-24 left-3 lg:top-20 lg:left-[24px]'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5] shrink-0 animate-bounce">
              <Bot className="w-5.5 h-5.5" />
            </div>
            <div className="flex-grow min-w-0">
              <h4 className="font-display font-black text-xs text-slate-800 uppercase tracking-widest leading-none flex items-center justify-between">
                <span>Panduan Belanja Emak AI</span>
                <span className="text-[10px] text-slate-400 font-bold">Langkah {tourStep === 0 ? "Persiapan" : `${tourStep}/6`}</span>
              </h4>
              <p className="text-[11px] text-slate-650 font-semibold leading-relaxed mt-2.5">
                {tourStep === 0 && "Selamat datang di Emak AI! Mari kita coba simulasi jastip belanja pasar tradisional. Kami akan memandu Ibu langkah demi langkah agar tidak bingung."}
                {tourStep === 1 && "Langkah 1: Klik tombol '+ Keranjang' (atau icon keranjang) pada produk makanan (misal 'Salmon Fillet') untuk memasukkannya ke keranjang belanja."}
                {tourStep === 2 && "Langkah 2: Keranjang belanja terisi. Klik tombol 'Checkout' di bagian paling bawah untuk memproses pesanan."}
                {tourStep === 3 && "Langkah 3: Periksa total tagihan. Klik tombol 'BAYAR SEKARANG' untuk menyimpan deposit di rekening bersama (Escrow)."}
                {tourStep === 4 && "Langkah 4: Pembayaran sukses! Buka tab 'AI Chat Bot' pada navigasi di atas untuk mengobrol dengan Asisten AI."}
                {tourStep === 5 && "Langkah 5: Di sisi kanan Riwayat Pesanan, perhatikan widget 'Mini Lacak Map'. Kurir bergerak dari pasar tradisional menuju ke alamat Ibu secara real-time."}
                {tourStep === 6 && "Langkah 6 (Terakhir): Jika kurir telah mengantar belanjaan ke rumah Ibu, klik tombol 'Selesaikan Pesanan' pada chat untuk mencairkan dana Escrow."}
              </p>
              
              <div className="flex items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setTourStep(-1);
                    localStorage.setItem('emak_tour_completed', 'true');
                  }}
                  className="text-[9px] font-black uppercase text-slate-400 hover:text-slate-650 cursor-pointer border-none bg-transparent"
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
                      className="px-4.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 font-bold uppercase text-[9px] cursor-pointer bg-white transition-all"
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
                      className="px-5 py-2 bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black rounded-full uppercase text-[9px] cursor-pointer shadow-md border-none transition-all"
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
                      className="px-5 py-2 bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black rounded-full uppercase text-[9px] cursor-pointer shadow-md border-none transition-all"
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
                      className="px-5 py-2 bg-[#00bfa5] hover:bg-[#00e5c1] text-white font-black rounded-full uppercase text-[9px] cursor-pointer shadow-md animate-pulse border-none transition-all"
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
    
    // Premium light-styled tiles (CartoDB Voyager) matching the light theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 20
    }).addTo(map);
    
    // Add custom zoom control at top-right
    L.control.zoom({
      position: 'topright'
    }).addTo(map);
    
    // Custom DIV Icons matching light theme layout and replacing emojis with proper SVG icons
    const pickupIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-10 h-10 rounded-full bg-white border-2 border-[#00bfa5] flex items-center justify-center shadow-lg select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00bfa5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const deliveryIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-10 h-10 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center shadow-lg select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    const driverIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-12 h-12 rounded-full bg-[#00bfa5] border-2 border-white flex items-center justify-center shadow-xl animate-bounce select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10"/><polygon points="14 8 20 8 22 14 14 14"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></svg>
      </div>`,
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
    <div className="fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col font-sans">
      {/* Top Header Navbar */}
      <div className="h-16 bg-white/95 backdrop-blur border-b border-slate-100 px-4 flex items-center justify-between shrink-0 sticky top-0 z-[101] shadow-sm">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs font-black uppercase tracking-wider bg-transparent border-none"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
        <div className="text-center">
          <span className="text-xs text-[#00bfa5] font-black uppercase tracking-widest block">Live Tracking</span>
          <span className="text-[10px] text-slate-550 font-semibold">{orderId}</span>
        </div>
        <button
          onClick={onOpenChat}
          className="bg-[#00bfa5] hover:bg-[#00e5c1] text-white px-5 py-2 rounded-full text-[10px] uppercase font-black tracking-widest transition-all cursor-pointer flex items-center gap-1.5 shadow border-none"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chat Kurir</span>
        </button>
      </div>

      {/* Map Display area */}
      <div className="flex-1 relative bg-[#f1f5f9] overflow-hidden">
        <div ref={mapRef} className="absolute inset-0 z-0" />

        {/* Courier Details Floating Overlay Card */}
        <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-[360px] z-[1000] bg-white border-none rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-left">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/3d_driver_vecteezy.png" 
                alt="Driver Profile" 
                className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 object-contain p-1 shadow-inner" 
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop";
                }}
              />
              <div>
                <span className="font-extrabold text-xs text-slate-800 block uppercase tracking-wider">{driverName}</span>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{driverRating} • Mitra Kurir</span>
              </div>
            </div>
            
            <a 
              href={`tel:${driverPhone}`}
              className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[#00bfa5] hover:bg-[#00bfa5]/10 hover:border-[#00bfa5]/20 transition-all cursor-pointer shadow-sm"
              title="Hubungi via Telepon"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-1.5">
            <span className="text-[9px] text-[#00bfa5] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00bfa5] animate-ping" />
              Status Pengantaran
            </span>
            <p className="text-xs text-slate-850 font-extrabold leading-normal">{courierStatus}</p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-1 bg-slate-50 p-3.5 rounded-xl border-none shadow-inner">
            <div>
              <span className="text-[8px] text-slate-500 font-extrabold uppercase tracking-widest block">Estimasi Tiba</span>
              <span className="text-xs text-slate-800 font-black font-mono block mt-0.5 animate-pulse">{eta}</span>
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
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(map);
    
    const pickupIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-7 h-7 rounded-full bg-white border-2 border-[#00bfa5] flex items-center justify-center shadow select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00bfa5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const deliveryIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-7 h-7 rounded-full bg-white border-2 border-amber-500 flex items-center justify-center shadow select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const driverIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-8 h-8 rounded-full bg-[#00bfa5] border border-white flex items-center justify-center shadow-md animate-bounce select-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v10"/><polygon points="14 8 20 8 22 14 14 14"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></svg>
      </div>`,
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
      <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto text-slate-400 border-none">
          <Truck className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h4 className="font-extrabold text-xs text-slate-850 uppercase tracking-wider">Tidak Ada Pengiriman</h4>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
            Semua pesanan belanja telah selesai. Belanja sekarang di catalog untuk melacak kurir live di sini.
          </p>
        </div>
        <button 
          onClick={onStartShopping}
          className="w-full bg-white border border-[#00bfa5]/30 text-[#00bfa5] hover:bg-slate-50 font-black text-[9px] uppercase tracking-widest py-3 px-5 rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
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
    <div className="bg-white border border-[#00bfa5]/25 rounded-2xl overflow-hidden flex flex-col shadow-md text-left">
      
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-[9px] text-[#00bfa5] font-black uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00bfa5] animate-ping" />
          Pelacakan Aktif
        </span>
        <span className="text-[9px] text-slate-550 font-mono font-bold">{activeOrder.id}</span>
      </div>

      {/* Mini static map container */}
      <div className="h-56 relative bg-[#f1f5f9] border-b border-slate-100 overflow-hidden">
        <div ref={miniMapRef} className="absolute inset-0 z-0" />
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/3d_driver_vecteezy.png" 
              alt="Courier profile" 
              className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50 object-contain p-0.5"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop"; }}
            />
            <div>
              <span className="text-[10px] font-black text-slate-800 block uppercase tracking-wider">{driverName}</span>
              <span className="text-[8px] text-[#00bfa5] font-black block tracking-wider uppercase">Mitra Kurir</span>
            </div>
          </div>
          <span className="bg-[#00bfa5]/10 border border-[#00bfa5]/25 text-[#00bfa5] font-mono text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide animate-pulse">
            ETA: {eta}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border-none text-[10px] font-bold leading-normal text-slate-650 shadow-inner">
          <span className="text-slate-500 text-[8px] uppercase tracking-wider block mb-1">Status Terkini:</span>
          {courierStatus}
        </div>

        <div className="grid grid-cols-2 gap-2 text-[9px] font-black tracking-widest uppercase">
          <button
            onClick={() => onTrackProgress(activeOrder)}
            className="bg-[#00bfa5] hover:bg-[#00e5c1] text-white py-3 px-5 rounded-full text-center transition-all cursor-pointer shadow active:scale-95 border-none"
          >
            Lacak Detail
          </button>
          <button
            onClick={() => onFinishOrder(activeOrder.id)}
            className="border border-emerald-500 hover:bg-emerald-600 hover:text-white text-emerald-650 py-3 px-5 rounded-full text-center transition-all cursor-pointer active:scale-95 bg-white"
          >
            Selesaikan
          </button>
        </div>
      </div>

    </div>
  );
}
