import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Phone, Video, MoreVertical, CheckCircle2, ShoppingBag, 
  Truck, DollarSign, RefreshCw, PlusCircle, AlertCircle, 
  Check, X, FileText, ArrowRight, User, ShieldAlert, Award,
  Edit2, Store, Lock, ChevronRight, MessageSquare, Shield, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';

// Mock receipt image path
const MOCK_RECEIPT = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop";

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'demo'
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'vendor' | 'driver' | 'escrow' | 'admin'
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userSubTab, setUserSubTab] = useState('chat'); // 'chat' | 'dashboard'
  
  // Inline Price Editing State for Driver
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [dictionary, setDictionary] = useState([]);
  const [phoneInput, setPhoneInput] = useState('08123456789');
  const [textInput, setTextInput] = useState('');
  
  // WhatsApp Simulator state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Halo Ibu! Selamat datang di *Emak AI Titip* (Platform Jastip Pasar Tradisional). \n\nTulis daftar belanjaan Ibu di sini ya, nanti AI kami akan bantu mengelompokkan barang dan menghitung perkiraan harganya. \n\n*Contoh:* \n_Beliin bumbu lodeh 2 porsi sama tempe papan satu ya_",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const chatEndRef = useRef(null);

  // Keep track of the last seen order status to trigger chat notifications
  const lastStatuses = useRef({});

  // Poll orders list
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        
        // If there is no active order ID, pick the most recent one
        if (data.length > 0 && !activeOrderId) {
          setActiveOrderId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  // Poll active order details
  const fetchActiveOrderDetails = async () => {
    if (!activeOrderId) return;
    try {
      const res = await fetch(`/api/orders/${activeOrderId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data);
        
        // Check for state transitions to automatically post in WhatsApp simulator
        const prevStatus = lastStatuses.current[activeOrderId];
        const currentStatus = data.status;
        
        if (prevStatus !== currentStatus && prevStatus !== undefined) {
          handleStatusTransitionChat(data, prevStatus, currentStatus);
        }
        lastStatuses.current[activeOrderId] = currentStatus;
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  // Fetch dictionary
  const fetchDictionary = async () => {
    try {
      const res = await fetch('/api/dictionary');
      if (res.ok) {
        const data = await res.json();
        setDictionary(data);
      }
    } catch (err) {
      console.error("Error fetching dictionary:", err);
    }
  };

  // Run on mount
  useEffect(() => {
    fetchOrders();
    fetchDictionary();
  }, []);

  // Poll every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
      fetchActiveOrderDetails();
    }, 2000);
    return () => clearInterval(interval);
  }, [activeOrderId]);

  // Sync active order details when ID changes
  useEffect(() => {
    if (activeOrderId) {
      fetchActiveOrderDetails();
    } else {
      setActiveOrder(null);
    }
  }, [activeOrderId]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Handle automatic messages on order state changes
  const handleStatusTransitionChat = (order, prev, current) => {
    let messageText = "";
    
    if (current === 'MITRA_PREPPING') {
      messageText = `*Pembayaran Berhasil!* \n\nDana sebesar *Rp ${formatMoney(order.total_estimated + order.buffer_amount)}* (Estimasi + 15% Buffer) telah kami amankan di rekening bersama (Rekber).\n\nMitra Pasar kami sedang menyiapkan belanjaan Anda. Kurir akan segera menuju toko Mitra.`;
    } else if (current === 'ON_DELIVERY') {
      if (prev === 'AWAITING_SUBSTITUTION') {
        return; // Handled individually
      }
      messageText = `*Kurir Sedang Belanja!* \n\nDriver kami sudah tiba di pasar tradisional dan sedang memilih bahan segar terbaik sesuai daftar pesanan Ibu.`;
    } else if (current === 'AWAITING_SUBSTITUTION') {
      // Find the out of stock item
      const outOfStockItem = order.items.find(item => item.status === 'OUT_OF_STOCK' && item.custom_note.startsWith('SUB_REQ:'));
      if (outOfStockItem) {
        const note = outOfStockItem.custom_note;
        let altName = "alternatif";
        let altPrice = 0;
        const parts = note.split('|');
        if (parts.length === 2) {
          altName = parts[0].replace('SUB_REQ:', '').trim();
          altPrice = parseInt(parts[1].replace(/[^0-9]/g, ''), 10);
        }
        
        messageText = `⚠️ *BARANG KOSONG!* \n\nIbu, untuk barang *"${outOfStockItem.name}"* di pasar sedang kosong.\n\nDriver kami menyarankan pengganti: *${altName}* seharga *Rp ${formatMoney(altPrice)}*.\n\nApakah Ibu setuju? \n\n_(Balas *SETUJU* atau *BATAL*)_`;
      } else {
        messageText = `⚠️ *Ada barang kosong!* \n\nDriver menyarankan penggantian barang. Apakah Ibu setuju? (Balas YA/SETUJU atau TIDAK/BATAL)`;
      }
    } else if (current === 'COMPLETED') {
      const driverFee = 10000;
      messageText = `🎉 *Belanjaan Selesai diAntar!* \n\nDriver telah mengunggah nota pasar dan menyerahkan pesanan di rumah Ibu.\n\n*Rincian Finansial Akhir:*\n- Total Belanja Riil: *Rp ${formatMoney(order.total_actual)}*\n- Ongkos Kirim: *Rp ${formatMoney(driverFee)}*\n- Total Biaya: *Rp ${formatMoney(order.total_actual + driverFee)}*\n\n💰 *Uang Kembalian (Refund):* Rp ${formatMoney(order.refund_amount)} telah ditransfer kembali ke rekening Ibu.\n\nTerima kasih sudah menitip belanja di *Emak AI Titip*!`;
    }

    if (messageText) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `trans_${order.id}_${current}`,
          sender: 'bot',
          text: messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Send message from Simulator
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || textInput;
    if (!text.trim()) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setTextInput('');

    try {
      const res = await fetch('/api/webhooks/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneInput,
          message: text
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        setTimeout(() => {
          setChatMessages(prev => [
            ...prev,
            {
              id: `bot_${Date.now()}`,
              sender: 'bot',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          
          if (data.order_id) {
            setActiveOrderId(data.order_id);
            fetchOrders();
          }
        }, 800);
      } else {
        const errorData = await res.json();
        alert(`API Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Webhook error:", err);
    }
  };

  // Quick script runner
  const runPresetScript = (scriptText) => {
    handleSendMessage(scriptText);
  };

  // Mock Payment Gateway Checkout
  const handleSimulatePayment = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchOrders();
        fetchActiveOrderDetails();
      } else {
        alert("Gagal melakukan pembayaran.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm substitution from chat buttons
  const handleChatSubstitutionChoice = async (orderId, confirmed) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/substitute/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: confirmed })
      });
      
      if (res.ok) {
        const text = confirmed ? "YA" : "TIDAK";
        setChatMessages(prev => [
          ...prev,
          {
            id: `sub_choice_user_${Date.now()}`,
            sender: 'user',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: `sub_choice_bot_${Date.now()}`,
            sender: 'bot',
            text: confirmed 
              ? "Baik Ibu, penggantian barang telah disetujui. Kurir akan melanjutkan belanja."
              : "Siap Ibu, barang tersebut dibatalkan dari daftar belanja. Kurir akan melanjutkan belanja barang lainnya.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        fetchOrders();
        fetchActiveOrderDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Driver updates item price inline
  const handleSaveItemPrice = async (itemId) => {
    if (!activeOrderId) return;
    const priceNum = parseInt(editingPrice, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      alert("Harga tidak valid.");
      return;
    }

    try {
      const res = await fetch(`/api/orders/${activeOrderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'FULFILLED',
          actual_price: priceNum
        })
      });
      if (res.ok) {
        setEditingItemId(null);
        fetchActiveOrderDetails();
      } else {
        alert("Gagal menyimpan harga barang.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEditing = (item) => {
    setEditingItemId(item.id);
    setEditingPrice(item.actual_price || item.estimated_price);
  };

  // Formatting Money helper
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  // Formats date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - " + date.toLocaleDateString([], { day: 'numeric', month: 'short' });
  };

  if (view === 'landing') {
    return <LandingPage onLaunchDemo={() => setView('demo')} />;
  }

  return (
    <div className="h-screen bg-[#f3f4f6] text-slate-900 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-3 px-6 shrink-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-full shadow-sm active:scale-[0.98] active:shadow-sm transition-all cursor-pointer mr-1 flex items-center justify-center animate-pulse"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full border border-slate-200 bg-[#fbbf24] flex items-center justify-center shadow-sm shrink-0">
            <ShoppingBag className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-2">
              Emak AI Titip <span className="text-[9px] bg-emerald-400 text-slate-900 px-2 py-0.5 rounded-full font-bold border border-slate-200 shadow-sm">PANEL KENDALI MVP</span>
            </h1>
            <p className="text-[10px] text-slate-600 hidden sm:block font-bold">Simulasi Integrasi Chatbot & Buku Kas Rekber</p>
          </div>
        </div>

        {/* Header Navigation & Global Stats */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('landing')}
            className="text-[11px] bg-white hover:bg-slate-50 text-slate-900 font-extrabold py-1.5 px-3 rounded-full border border-slate-200 shadow-sm active:scale-[0.98] active:shadow-sm transition-all cursor-pointer"
          >
            ← Kembali ke Beranda
          </button>
          
          <div className="hidden md:flex items-center gap-5 text-[11px] border-l border-slate-200 pl-5 font-bold">
            <div className="text-left">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Total Pesanan</span>
              <span className="font-black text-slate-900">{orders.length}</span>
            </div>
            <div className="text-left">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Status Aktif</span>
              <span className="font-black text-emerald-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                {activeOrder ? activeOrder.status : 'Kosong'}
              </span>
            </div>
            <div className="text-left">
              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Saldo Rekber</span>
              <span className="font-black text-secondary">
                Rp {activeOrder && activeOrder.ledger 
                  ? formatMoney(activeOrder.ledger.reduce((acc, curr) => curr.type === 'CREDIT_PAYMENT' ? acc + curr.amount : acc - curr.amount, 0))
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Unified Global Active Order & Control Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-4 shrink-0 z-40 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-bold uppercase text-[10px]">Order Aktif:</span>
          {orders.length > 0 ? (
            <select
              value={activeOrderId || ''}
              onChange={(e) => {
                setActiveOrderId(e.target.value);
                setEditingItemId(null);
              }}
              className="bg-white border border-slate-200 text-slate-900 text-[11px] font-black rounded-full px-2.5 py-1 focus:outline-none cursor-pointer shadow-sm"
            >
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  ID: {ord.id.substring(4)} — {ord.status}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-slate-500 italic text-[11px] font-semibold">Belum ada order. Silakan kirim pesan chat di simulator.</span>
          )}
        </div>

        {/* Global Reset */}
        <div>
          <button
            onClick={async () => {
              if (!confirm("Apakah Anda yakin ingin me-reset database order dan riwayat chat?")) return;
              try {
                const res = await fetch('/api/debug/reset', { method: 'POST' });
                if (res.ok) {
                  setOrders([]);
                  setActiveOrderId(null);
                  setActiveOrder(null);
                  setChatMessages([
                    {
                      id: 'welcome',
                      sender: 'bot',
                      text: "Database telah di-reset! \n\nHalo Ibu! Silakan masukkan daftar belanja baru Ibu untuk memulai demo.",
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  ]);
                  fetchOrders();
                  setEditingItemId(null);
                }
              } catch (e) {
                alert("Reset gagal.");
              }
            }}
            className="text-[10px] bg-white hover:bg-slate-50 text-red-500 border border-slate-200 font-black py-1 px-2.5 rounded-full flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-[0.98] active:shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Data & Chat
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative pb-0">
        
        {/* Sidebar Component */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200 w-64 transform transition-transform duration-300 ease-in-out shrink-0 h-full
          lg:static lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Sidebar content: Branding / Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
            <span className="font-black text-sm tracking-tight text-slate-900">MENU UTAMA</span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-full shadow-sm active:scale-[0.98] active:shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* User (Chat) */}
            <button
              onClick={() => {
                setActiveTab('chat');
                setIsSidebarOpen(false);
              }}
              className={`w-full py-3 px-4 border border-slate-200 font-extrabold text-xs flex items-center gap-3 transition-all cursor-pointer shadow-sm active:scale-[0.98] active:shadow-sm ${
                activeTab === 'chat' ? 'bg-emerald-400 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>PELANGGAN (USER)</span>
            </button>

            {/* Seller */}
            <button
              onClick={() => {
                setActiveTab('vendor');
                setIsSidebarOpen(false);
              }}
              className={`w-full py-3 px-4 border border-slate-200 font-extrabold text-xs flex items-center gap-3 transition-all cursor-pointer shadow-sm active:scale-[0.98] active:shadow-sm ${
                activeTab === 'vendor' ? 'bg-emerald-400 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>MITRA (SELLER)</span>
            </button>

            {/* Driver */}
            <button
              onClick={() => {
                setActiveTab('driver');
                setIsSidebarOpen(false);
              }}
              className={`w-full py-3 px-4 border border-slate-200 font-extrabold text-xs flex items-center gap-3 transition-all cursor-pointer shadow-sm active:scale-[0.98] active:shadow-sm ${
                activeTab === 'driver' ? 'bg-[#3b82f6] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>KURIR (DRIVER)</span>
            </button>

            {/* Escrow */}
            <button
              onClick={() => {
                setActiveTab('escrow');
                setIsSidebarOpen(false);
              }}
              className={`w-full py-3 px-4 border border-slate-200 font-extrabold text-xs flex items-center gap-3 transition-all cursor-pointer shadow-sm active:scale-[0.98] active:shadow-sm ${
                activeTab === 'escrow' ? 'bg-amber-400 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>BUKU REKBER (ESCROW)</span>
            </button>

            {/* Admin */}
            <button
              onClick={() => {
                setActiveTab('admin');
                setIsSidebarOpen(false);
              }}
              className={`w-full py-3 px-4 border border-slate-200 font-extrabold text-xs flex items-center gap-3 transition-all cursor-pointer shadow-sm active:scale-[0.98] active:shadow-sm ${
                activeTab === 'admin' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>KAMUS & ADMIN</span>
            </button>
          </nav>
        </aside>

        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Content Pane */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f4f6]">
          {activeTab === 'chat' ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f3f4f6]">
              {/* Mobile subtabs switcher inside User view */}
              <div className="lg:hidden flex border-b border-slate-200 bg-white p-2 gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setUserSubTab('chat')}
                  className={`flex-grow py-2 rounded-full font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    userSubTab === 'chat' ? 'bg-emerald-400 text-slate-900 border border-slate-200' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat Simulator
                </button>
                <button
                  type="button"
                  onClick={() => setUserSubTab('dashboard')}
                  className={`flex-grow py-2 rounded-full font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    userSubTab === 'dashboard' ? 'bg-emerald-400 text-slate-900 border border-slate-200' : 'bg-slate-50 text-slate-600'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Dashboard Pelanggan
                </button>
              </div>

              {/* Main content split view */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Side: WhatsApp Simulator */}
                <section className={`
                  flex-1 flex flex-col bg-[#efeae2] h-full overflow-hidden shrink-0
                  ${userSubTab === 'chat' ? 'flex' : 'hidden lg:flex lg:w-[60%]'}
                `}>
                  {/* WA Contact Header */}
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-200 shrink-0 text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-200 bg-emerald-400 flex items-center justify-center text-slate-900 font-black text-sm shadow-sm">
                        E
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">Emak AI Bot (Jastip)</h3>
                        <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-bold">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                          online (System Simulator)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-slate-700 text-xs">
                      <Phone className="w-4 h-4 cursor-pointer hover:text-slate-900" />
                      <Video className="w-4 h-4 cursor-pointer hover:text-slate-900" />
                      <MoreVertical className="w-4 h-4 cursor-pointer hover:text-slate-900" />
                    </div>
                  </div>

                  {/* Quick Script Tag Carousel */}
                  <div className="bg-[#f3f4f6] border-b border-slate-200 px-4 py-2.5 shrink-0">
                    <p className="text-[9px] text-slate-600 mb-2 font-bold uppercase tracking-wide">📋 KIRIM DRAFT BELANJA CEPAT:</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      <button 
                        type="button"
                        onClick={() => runPresetScript("Beliin bumbu lodeh 2 porsi sama tempe papan satu ya")}
                        className="text-[11px] bg-white border border-slate-200 text-slate-900 font-extrabold py-1.5 px-3 rounded-full hover:bg-slate-50 shrink-0 transition-all cursor-pointer shadow-sm"
                      >
                        🥕 Lodeh & Tempe
                      </button>
                      <button 
                        type="button"
                        onClick={() => runPresetScript("Beli wortel 1 kg, kentang 2 kg, sama ayam potong 1 ekor ya")}
                        className="text-[11px] bg-white border border-slate-200 text-slate-900 font-extrabold py-1.5 px-3 rounded-full hover:bg-slate-50 shrink-0 transition-all cursor-pointer shadow-sm"
                      >
                        🍗 Sayuran & Ayam
                      </button>
                      <button 
                        type="button"
                        onClick={() => runPresetScript("Beli bawang merah 1/2 kg, bawang putih 1/4 kg, cabai rawit 100gr")}
                        className="text-[11px] bg-white border border-slate-200 text-slate-900 font-extrabold py-1.5 px-3 rounded-full hover:bg-slate-50 shrink-0 transition-all cursor-pointer shadow-sm"
                      >
                        🌶️ Bawang & Cabai
                      </button>
                    </div>
                  </div>

                  {/* WA Messages History Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          msg.sender === 'user' ? 'self-end ml-auto' : 'self-start mr-auto'
                        }`}
                      >
                        <div className={`p-3 text-xs leading-relaxed ${
                          msg.sender === 'user' ? 'wa-bubble-out' : 'wa-bubble-in'
                        }`}>
                          <p className="whitespace-pre-line font-medium text-slate-800">{msg.text}</p>
                          
                          {/* Payment Button Simulation inside Chat */}
                          {msg.text.includes("Silakan klik link berikut untuk melanjutkan pembayaran") && activeOrder && activeOrder.status === 'AWAITING_PAYMENT' && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() => handleSimulatePayment(activeOrder.id)}
                                className="w-full bg-sky-400 hover:bg-sky-500 border border-slate-200 text-slate-900 font-black py-2 px-3 rounded-full text-[10px] text-center shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Lock className="w-3.5 h-3.5 text-slate-900" />
                                Bayar Deposit Rekber
                              </button>
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] text-slate-500 mt-1 flex items-center gap-1 font-bold ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                          {msg.timestamp}
                          {msg.sender === 'bot' && <span className="text-emerald-600 font-black">✓✓</span>}
                        </span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* WA Message Input */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="p-3 bg-white flex items-center gap-2 shrink-0 border-t border-slate-200"
                  >
                    <input 
                      type="text" 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Tulis pesan belanjaan..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                    <button 
                      type="submit" 
                      className="w-8 h-8 border border-slate-200 bg-emerald-400 hover:bg-emerald-500 text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </section>

                {/* Right Side: User Dashboard (Delivery Tracking & Order History) */}
                <section className={`
                  flex-col h-full bg-[#f8fafc] overflow-y-auto p-4 md:p-6 space-y-6 shrink-0
                  ${userSubTab === 'dashboard' ? 'flex w-full' : 'hidden lg:flex lg:w-[40%] border-l border-slate-200'}
                `}>
                  {/* Section 1: Lacak Kiriman (Delivery Tracking) */}
                  <div className="glass-card rounded-xl p-5 bg-white shadow-sm">
                    <h3 className="text-sm font-extrabold font-display text-slate-900 mb-4 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      Lacak Kiriman
                    </h3>
                    
                    {activeOrder ? (
                      <div className="space-y-4">
                        {/* Order info */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold">
                          <div>
                            <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Order Terpilih</span>
                            <span className="font-extrabold text-slate-800">ID: {activeOrder.id.substring(4)}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold text-slate-900 border border-slate-200 shadow-sm ${
                            activeOrder.status === 'DONE' ? 'bg-emerald-400' :
                            activeOrder.status === 'ON_DELIVERY' ? 'bg-blue-400 text-white border-blue-500' :
                            'bg-amber-400'
                          }`}>
                            {activeOrder.status}
                          </span>
                        </div>

                        {/* Mock Payment Simulation Alert Card */}
                        {activeOrder.status === 'AWAITING_PAYMENT' && (
                          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3">
                            <div className="flex items-start gap-2.5">
                              <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-amber-800">Menunggu Pembayaran</h4>
                                <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                                  Pesanan belanja telah dianalisis. Silakan lakukan pembayaran deposit untuk melanjutkan proses belanja oleh Mitra Pasar.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSimulatePayment(activeOrder.id)}
                              className="w-full bg-amber-400 hover:bg-amber-500 border border-amber-500 text-slate-900 font-extrabold py-2 px-3 rounded-full text-[10px] text-center shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              Bayar Deposit Rekber (Simulasi)
                            </button>
                          </div>
                        )}

                        {/* Timeline */}
                        <div className="relative pl-6 border-l border-slate-200 space-y-5 py-2">
                          {/* Step 1: Diterima */}
                          <div className="relative">
                            <span className={`absolute -left-[28px] top-0 w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] font-black ${
                              ['DRAFT', 'AWAITING_PAYMENT', 'MITRA_PREPPING', 'ON_DELIVERY', 'DONE'].includes(activeOrder.status)
                                ? 'bg-emerald-400 border-emerald-500 text-slate-900'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                              ✓
                            </span>
                            <h4 className="text-xs font-bold text-slate-800">Order Diterima</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">Belanjaan telah diterima dan dianalisis AI.</p>
                          </div>

                          {/* Step 2: Pengemasan */}
                          <div className="relative">
                            <span className={`absolute -left-[28px] top-0 w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] font-black ${
                              ['MITRA_PREPPING', 'ON_DELIVERY', 'DONE'].includes(activeOrder.status)
                                ? 'bg-emerald-400 border-emerald-500 text-slate-900'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                              {['MITRA_PREPPING', 'ON_DELIVERY', 'DONE'].includes(activeOrder.status) ? '✓' : '2'}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800">Pengemasan oleh Mitra</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">Toko mitra sedang menyiapkan dan mengemas pesanan belanja.</p>
                          </div>

                          {/* Step 3: Pengiriman */}
                          <div className="relative">
                            <span className={`absolute -left-[28px] top-0 w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] font-black ${
                              ['ON_DELIVERY', 'DONE'].includes(activeOrder.status)
                                ? 'bg-emerald-400 border-emerald-500 text-slate-900'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                              {['ON_DELIVERY', 'DONE'].includes(activeOrder.status) ? '✓' : '3'}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800">Dalam Pengiriman</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">Pesanan sedang diantar oleh kurir ke alamat tujuan.</p>
                          </div>

                          {/* Step 4: Selesai */}
                          <div className="relative">
                            <span className={`absolute -left-[28px] top-0 w-4.5 h-4.5 rounded-full flex items-center justify-center border text-[9px] font-black ${
                              activeOrder.status === 'DONE'
                                ? 'bg-emerald-400 border-emerald-500 text-slate-900'
                                : 'bg-white border-slate-300 text-slate-400'
                            }`}>
                              {activeOrder.status === 'DONE' ? '✓' : '4'}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800">Selesai</h4>
                            <p className="text-[10px] text-slate-500 font-semibold">Order selesai dan dana escrow diteruskan ke mitra.</p>
                          </div>
                        </div>

                        {/* Courier Details */}
                        {activeOrder.driver && (
                          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100 flex items-center gap-3 text-xs font-semibold">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                              K
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Kurir Pengirim</span>
                              <span className="font-extrabold text-slate-800">{activeOrder.driver.name || 'Pak Budi (Kurir)'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2 animate-pulse-soft" />
                        <p className="text-xs text-slate-500 font-semibold">Tidak ada order aktif untuk dilacak.</p>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Riwayat Belanja (Order History) */}
                  <div className="glass-card rounded-xl p-5 bg-white shadow-sm flex-1 flex flex-col min-h-0">
                    <h3 className="text-sm font-extrabold font-display text-slate-900 mb-4 flex items-center gap-2 shrink-0">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      Riwayat Belanja
                    </h3>

                    <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                      {orders.length > 0 ? (
                        orders.map((ord) => {
                          const isSelected = activeOrderId === ord.id;
                          const totalAmt = ord.items 
                            ? ord.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
                            : 0;

                          return (
                            <button
                              type="button"
                              key={ord.id}
                              onClick={() => {
                                setActiveOrderId(ord.id);
                                setEditingItemId(null);
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected 
                                  ? 'bg-emerald-50/60 border-emerald-400 shadow-sm' 
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div>
                                <span className="text-[10px] text-slate-500 font-bold block">{formatDate(ord.createdAt)}</span>
                                <span className="text-xs font-black text-slate-800">ID: {ord.id.substring(4)}</span>
                                <span className="text-[10px] text-slate-500 font-bold block mt-1">
                                  {ord.items ? ord.items.length : 0} item • Rp {formatMoney(totalAmt)}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold text-slate-900 border border-slate-200 ${
                                ord.status === 'DONE' ? 'bg-emerald-300' :
                                ord.status === 'ON_DELIVERY' ? 'bg-blue-300' :
                                'bg-amber-300'
                              }`}>
                                {ord.status}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-xs text-slate-500 font-semibold italic">Belum ada transaksi.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : (
        /* Right Side: Actuator Dashboards */
        <section className="flex-grow flex flex-col h-full bg-[#f3f4f6] overflow-hidden">
          {/* Active View Content Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            
            {/* Fallback when no order is selected */}
            {!activeOrder && activeTab !== 'admin' && (
              <div className="h-64 flex flex-col items-center justify-center text-center gap-3">
                <AlertCircle className="w-10 h-10 text-slate-500 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Tidak Ada Order Aktif</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-semibold">Gunakan Chat Simulator di sebelah kiri untuk memasukkan daftar belanjaan pertama Ibu.</p>
                </div>
              </div>
            )}

            {/* TAB 1: MITRA PASAR (VENDOR / SELLER) */}
            {activeTab === 'vendor' && activeOrder && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Store Header */}
                <div className="glass-card rounded-xl p-5 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border border-slate-200 bg-emerald-100 flex items-center justify-center shadow-sm">
                        <Store className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Dashboard Toko Mitra</span>
                        <h3 className="text-base font-extrabold font-display text-slate-900 mt-0.5">Stall Sayur Segar - Ibu Aminah</h3>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-900 bg-emerald-400 border border-slate-200 shadow-sm px-2.5 py-0.5">
                      <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-ping"></span>
                      Stall Buka
                    </span>
                  </div>

                  {/* Packing Progress Bar */}
                  {activeOrder.status === 'MITRA_PREPPING' && (
                    <div className="mb-5 bg-slate-50 p-3.5 border border-slate-200 shadow-sm">
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-slate-700">Progress Pengemasan Barang</span>
                        <span className="text-emerald-600">100% Ready</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-xl w-full transition-all duration-500"></div>
                      </div>
                    </div>
                  )}

                  {/* Order Item Tickets */}
                  <div className="space-y-2.5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Daftar Barang Belanjaan:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeOrder.items && activeOrder.items.map((item) => (
                        <div key={item.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 border border-slate-200 flex items-center justify-center text-xs font-black shadow-sm ${
                              item.category === 'Bumbu' ? 'bg-amber-100 text-amber-600' :
                              item.category === 'Sayuran' ? 'bg-emerald-100 text-emerald-600' :
                              item.category === 'Daging' ? 'bg-red-100 text-red-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {item.name[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="font-extrabold text-slate-900 text-xs block">{item.name}</span>
                              <span className="text-[10px] text-slate-600 font-semibold">{item.quantity} {item.unit} • {item.category}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-slate-700">
                            Rp {formatMoney(item.estimated_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="mt-6 pt-5 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Status Pemesanan</span>
                      <span className="text-xs font-black text-slate-900 mt-0.5 inline-block bg-amber-300 border border-slate-200 px-2 py-0.5 uppercase shadow-sm">
                        {activeOrder.status}
                      </span>
                    </div>

                    {activeOrder.status === 'MITRA_PREPPING' ? (
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/orders/${activeOrder.id}/transition`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'ON_DELIVERY' })
                            });
                            if (res.ok) {
                              fetchOrders();
                              fetchActiveOrderDetails();
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="bg-emerald-400 border border-slate-200 text-slate-900 font-black py-2.5 px-5 rounded-full text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-sm active:scale-[0.98] active:shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Selesai Packing & Serahkan Kurir
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-600 font-bold bg-slate-50 p-3 border border-slate-200 shadow-sm">
                        {activeOrder.status === 'AWAITING_PAYMENT' 
                          ? '⏳ Menunggu deposit dana Rekber dibayarkan oleh Pengguna.' 
                          : '🚀 Pesanan sudah diserahkan ke Kurir untuk belanja dan pengantaran.'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: DRIVER CONCIERGE (COURIER APP) */}
            {activeTab === 'driver' && activeOrder && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Mobile Smartphone Frame Wrapper */}
                <div className="w-full max-w-[420px] mx-auto bg-slate-100 border border-slate-200 rounded-xl shadow-sm p-4">
                  
                  {/* Phone Screen body */}
                  <div className="bg-[#f3f4f6] p-4 flex flex-col justify-between text-xs min-h-[500px]">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Emak Kurir App</span>
                        <h4 className="font-extrabold text-slate-900 text-sm">Order ID: {activeOrder.id.substring(4)}</h4>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-[#3b82f6] text-white border border-slate-200 shadow-sm">
                          DRIVER ACTIVE
                        </span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white p-3 border border-slate-200 shadow-sm my-3 flex items-center justify-between text-[11px] font-semibold">
                      <div>
                        <span className="text-slate-500 block text-[9px] font-bold uppercase">Tujuan Pengiriman</span>
                        <span className="font-extrabold text-slate-900">Perumahan Indah Asri Blok C/15</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[9px] font-bold uppercase">Ongkos Kirim</span>
                        <span className="font-extrabold text-blue-600">Rp 10.000 (Flat)</span>
                      </div>
                    </div>

                    {/* Main phone content scroll area */}
                    <div className="flex-1 py-2 space-y-4">
                      
                      {/* Driver checklist items */}
                      {activeOrder.status === 'MITRA_PREPPING' || activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'AWAITING_SUBSTITUTION' ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 font-bold uppercase text-[9px] tracking-wide">Checklist Pembelian Barang:</span>
                            <span className="text-[9px] text-slate-500 italic font-semibold">(Ketuk checklist/pencil untuk input harga)</span>
                          </div>
                          
                          <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                            {activeOrder.items && activeOrder.items.map((item) => {
                              const isFulfilled = item.status === 'FULFILLED' || item.status === 'SUBSTITUTED';
                              const isOOS = item.status === 'OUT_OF_STOCK';
                              const isEditing = editingItemId === item.id;
                              
                              return (
                                <div 
                                  key={item.id} 
                                  className={`p-2.5 border border-slate-200 flex flex-col gap-2 transition-all shadow-sm ${
                                    isFulfilled ? 'bg-emerald-50 opacity-90' :
                                    isOOS ? 'bg-red-50 opacity-70' :
                                    'bg-white'
                                  }`}
                                >
                                  {isEditing ? (
                                    /* Inline Price Input mode */
                                    <div className="flex items-center justify-between gap-2 py-1">
                                      <div className="flex-1">
                                        <span className="text-[9px] text-slate-600 font-bold block mb-1">Actual Harga: {item.name}</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-bold text-slate-700">Rp</span>
                                          <input 
                                            type="number"
                                            value={editingPrice}
                                            onChange={(e) => setEditingPrice(e.target.value)}
                                            className="bg-slate-50 border border-slate-200 rounded-full px-2 py-1 text-slate-900 text-xs w-24 outline-none"
                                            placeholder="Harga..."
                                            autoFocus
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-1 shrink-0 mt-3">
                                        <button 
                                          onClick={() => handleSaveItemPrice(item.id)}
                                          className="p-1.5 bg-emerald-400 border border-slate-200 text-slate-900 rounded-full hover:bg-emerald-500 cursor-pointer shadow-sm"
                                          title="Simpan"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => setEditingItemId(null)}
                                          className="p-1.5 bg-slate-200 border border-slate-200 text-slate-900 rounded-full hover:bg-slate-350 cursor-pointer shadow-sm"
                                          title="Batal"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Display checklist item mode */
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2.5">
                                        {/* Fulfill checkbox */}
                                        <button
                                          onClick={async () => {
                                            try {
                                              const nextStatus = isFulfilled ? 'PENDING' : 'FULFILLED';
                                              const nextPrice = nextStatus === 'FULFILLED' ? item.estimated_price : 0;
                                              
                                              await fetch(`/api/orders/${activeOrder.id}/items/${item.id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                  status: nextStatus,
                                                  actual_price: nextPrice
                                                })
                                              });
                                              fetchActiveOrderDetails();
                                            } catch (e) {}
                                          }}
                                          className={`w-5 h-5 border border-slate-200 flex items-center justify-center transition-all cursor-pointer ${
                                            isFulfilled ? 'bg-emerald-400 text-slate-900' : 'bg-white hover:bg-slate-50'
                                          }`}
                                        >
                                          {isFulfilled && <Check className="w-3.5 h-3.5 stroke-[3] text-slate-900" />}
                                        </button>

                                        <div>
                                          <span className={`font-extrabold text-slate-900 block ${isFulfilled ? 'line-through text-slate-400 font-medium' : ''}`}>
                                            {item.name}
                                          </span>
                                          <span className="text-[10px] text-slate-500 font-semibold">{item.quantity} {item.unit}</span>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        {/* Alt substitution proposal button */}
                                        {!isFulfilled && !isOOS && (
                                          <button
                                            onClick={async () => {
                                              let altName = item.name.toLowerCase().includes("tempe") ? "tempe daun" : `${item.name} premium`;
                                              let altPrice = Math.round(item.estimated_price * 1.25);
                                              try {
                                                await fetch(`/api/orders/${activeOrder.id}/items/${item.id}`, {
                                                  method: 'PATCH',
                                                  headers: { 'Content-Type': 'application/json' },
                                                  body: JSON.stringify({
                                                    status: 'OUT_OF_STOCK',
                                                    actual_price: 0,
                                                    alt_name: altName,
                                                    alt_price: altPrice
                                                  })
                                                });
                                                fetchActiveOrderDetails();
                                              } catch (e) {}
                                            }}
                                            className="bg-red-100 hover:bg-red-200 text-red-600 border border-slate-200 font-bold px-2 py-0.5 rounded-full text-[9px] cursor-pointer shadow-sm"
                                          >
                                            Habis
                                          </button>
                                        )}

                                        {/* Price indicator & edit trigger */}
                                        <div className="flex items-center gap-1.5">
                                          <div className="text-right">
                                            <span className="text-[10px] font-black block text-slate-900">
                                              Rp {isFulfilled ? formatMoney(item.actual_price) : formatMoney(item.estimated_price)}
                                            </span>
                                            <span className="text-[8px] text-slate-500 uppercase tracking-wide block font-bold">
                                              {isFulfilled ? 'Aktual' : 'Estimasi'}
                                            </span>
                                          </div>
                                          
                                          {/* Price Edit Icon */}
                                          <button 
                                            onClick={() => handleStartEditing(item)}
                                            className="text-slate-600 hover:text-slate-900 p-1 border-2 border-transparent hover:border-slate-900 rounded-full cursor-pointer"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : activeOrder.status === 'COMPLETED' ? (
                        /* Delivery Complete phone state */
                        <div className="text-center py-6 space-y-3">
                          <div className="w-12 h-12 border border-slate-200 bg-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-7 h-7 text-slate-900" />
                          </div>
                          <div>
                            <h5 className="font-black text-slate-900 text-sm">Delivery Sukses!</h5>
                            <p className="text-slate-600 text-[11px] mt-1 max-w-[240px] mx-auto font-semibold">
                              Pesanan telah diterima dan dana Rekber berhasil dicairkan secara transaksional.
                            </p>
                          </div>
                          
                          <div className="bg-white border border-slate-200 p-3.5 rounded-xl text-left text-[11px] space-y-1.5 mt-4 max-w-[280px] mx-auto shadow-sm">
                            <p className="text-slate-600 font-extrabold uppercase text-[9px] border-b border-slate-200 pb-1 mb-1.5">Rincian Pencairan Dana:</p>
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-500">Pembayaran ke Mitra Pasar:</span>
                              <span className="text-slate-900 font-black">Rp {formatMoney(activeOrder.total_actual)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-500">Biaya Antar Kurir:</span>
                              <span className="text-slate-900 font-black">Rp 10.000</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200/60 pt-1.5 mt-1.5 font-bold">
                              <span className="text-emerald-600">Uang Kembalian (Pengguna):</span>
                              <span className="text-emerald-600 font-black">Rp {formatMoney(activeOrder.refund_amount)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-500 italic text-[11px] font-bold">
                          Menunggu pembayaran deposit order dilepaskan oleh pembeli sebelum merilis checklist belanja.
                        </div>
                      )}

                      {/* Mock Receipt scanning display */}
                      {(activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'MITRA_PREPPING') && 
                       activeOrder.items && activeOrder.items.length > 0 && activeOrder.items.every(item => item.status !== 'PENDING') && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white border border-slate-200 p-3 rounded-full shadow-sm mt-4"
                        >
                          <span className="text-[9px] font-bold text-slate-600 block uppercase tracking-wide">📄 NOTA BELANJA GENERATED:</span>
                          <div className="border-2 border-dashed border-slate-900 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 bg-slate-50">
                            <FileText className="w-6 h-6 text-slate-700" />
                            <span className="text-[10px] text-slate-900 font-bold">Mock_Invoice_Pasar.pdf</span>
                            <div className="text-[9px] text-slate-600 font-bold">
                              Realisasi Belanja: Rp {formatMoney(activeOrder.items.reduce((acc, curr) => curr.status === 'FULFILLED' || curr.status === 'SUBSTITUTED' ? acc + curr.actual_price : acc, 0))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-3 border-t border-slate-200 mt-3">
                      {activeOrder.status === 'MITRA_PREPPING' && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/orders/${activeOrder.id}/transition`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'ON_DELIVERY' })
                              });
                              if (res.ok) {
                                fetchOrders();
                                fetchActiveOrderDetails();
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          className="w-full bg-[#3b82f6] border border-slate-200 text-white font-black py-3 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-sm active:scale-[0.98] active:shadow-sm cursor-pointer"
                        >
                          <Truck className="w-4 h-4 text-white" />
                          Mulai Belanja (Kurir Jalan)
                        </button>
                      )}

                      {(activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'MITRA_PREPPING') && 
                       activeOrder.items && activeOrder.items.length > 0 && activeOrder.items.every(item => item.status !== 'PENDING') && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/orders/${activeOrder.id}/complete`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ receipt_url: MOCK_RECEIPT })
                              });
                              if (res.ok) {
                                fetchOrders();
                                fetchActiveOrderDetails();
                              }
                            } catch (e) {}
                          }}
                          className="w-full bg-emerald-400 border border-slate-200 text-slate-900 font-black py-3 rounded-full flex items-center justify-center gap-1.5 transition-all shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-sm active:scale-[0.98] active:shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Selesai & Selesaikan Transaksi Rekber
                        </button>
                      )}

                      {activeOrder.status === 'AWAITING_SUBSTITUTION' && (
                        <div className="bg-amber-100 text-amber-700 p-2.5 rounded-xl border border-slate-200 text-center animate-pulse-soft font-extrabold text-[10px] shadow-sm">
                          ⏳ Menunggu tanggapan alternatif barang dari WhatsApp Ibu...
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: ESCROW LEDGER (FINANCIAL BOARD) */}
            {activeTab === 'escrow' && activeOrder && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Financial Wallet cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Ledger metric 1 */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between min-h-[90px] shadow-sm text-slate-900">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Saldo Rekber</span>
                    <div>
                      <h4 className="text-xl font-black font-display text-slate-900 mt-1">
                        Rp {activeOrder.ledger 
                          ? formatMoney(activeOrder.ledger.reduce((acc, curr) => curr.type === 'CREDIT_PAYMENT' ? acc + curr.amount : acc - curr.amount, 0))
                          : 0}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1 font-bold">Tersimpan aman di Rekber</p>
                    </div>
                  </div>

                  {/* Ledger metric 2 */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between min-h-[90px] shadow-sm text-slate-900">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Belanja Real</span>
                    <div>
                      <h4 className="text-xl font-black font-display text-emerald-600 mt-1">
                        Rp {formatMoney(activeOrder.total_actual || activeOrder.items.reduce((acc, curr) => curr.status === 'FULFILLED' || curr.status === 'SUBSTITUTED' ? acc + curr.actual_price : acc, 0))}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1 font-bold">Est: Rp {formatMoney(activeOrder.total_estimated)}</p>
                    </div>
                  </div>

                  {/* Ledger metric 3 */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between min-h-[90px] shadow-sm text-slate-900">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Refund Pembeli</span>
                    <div>
                      <h4 className="text-xl font-black font-display text-amber-500 mt-1">
                        Rp {formatMoney(activeOrder.refund_amount)}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1 font-bold">Buffer 15%: Rp {formatMoney(activeOrder.buffer_amount)}</p>
                    </div>
                  </div>

                  {/* Ledger metric 4 */}
                  <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col justify-between min-h-[90px] shadow-sm text-slate-900">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Biaya Jasa</span>
                    <div>
                      <h4 className="text-xl font-black font-display text-blue-600 mt-1">
                        Rp {activeOrder.status === 'COMPLETED' ? '10.000' : '0'}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1 font-bold">Tarif kurir flat</p>
                    </div>
                  </div>
                </div>

                {/* Audit Ledger List */}
                <div className="glass-card rounded-xl p-5 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
                    <div>
                      <h3 className="text-base font-black font-display text-slate-900">Riwayat Mutasi Rekber</h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-semibold">Riwayat audit dari pembukuan relasional SQLite</p>
                    </div>
                    <Shield className="w-5 h-5 text-slate-800 opacity-70 shrink-0" />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase tracking-wider text-[9px] font-bold">
                          <th className="py-2 pb-3">Tipe</th>
                          <th className="py-2 pb-3">Deskripsi Transaksi</th>
                          <th className="py-2 pb-3 text-right">Nilai Rupiah</th>
                          <th className="py-2 pb-3 text-right">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 font-mono text-[11px] font-bold">
                        {activeOrder.ledger && activeOrder.ledger.length > 0 ? (
                          activeOrder.ledger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-50 transition-colors text-slate-900">
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border border-slate-200 shadow-sm ${
                                  entry.type === 'CREDIT_PAYMENT' ? 'bg-emerald-400 text-slate-900' :
                                  entry.type === 'DEBIT_REFUND' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' :
                                  entry.type === 'DEBIT_DRIVER_FEE' ? 'bg-blue-100 text-blue-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {entry.type}
                                </span>
                              </td>
                              <td className="py-3 text-slate-800 font-sans">{entry.description}</td>
                              <td className={`py-3 text-right font-black ${entry.type === 'CREDIT_PAYMENT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                {entry.type === 'CREDIT_PAYMENT' ? '+' : '-'} Rp {formatMoney(entry.amount)}
                              </td>
                              <td className="py-3 text-right text-slate-500 font-sans">{formatDate(entry.created_at)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-slate-500 italic font-sans font-bold">
                              Belum ada catatan transaksi terekam pada database Rekber.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Saga Flow visualization */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3">
                  <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 text-slate-800" />
                    Alur Transaksi Saga Terdistribusi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-[10px] text-slate-700 leading-relaxed font-semibold">
                    <div className="bg-white border border-slate-200 p-2.5 shadow-sm">
                      <span className="block font-black text-slate-900 mb-1">1. Deposit Dikunci</span>
                      Estimasi + 15% buffer saldo diamankan di Rekber
                    </div>
                    <div className="hidden sm:flex items-center justify-center"><ChevronRight className="w-4 h-4 text-slate-900" /></div>
                    <div className="bg-white border border-slate-200 p-2.5 shadow-sm">
                      <span className="block font-black text-slate-900 mb-1">2. Cek Harga</span>
                      Kurir mencocokkan harga asli pasar dan nota belanja
                    </div>
                    <div className="hidden sm:flex items-center justify-center"><ChevronRight className="w-4 h-4 text-slate-900" /></div>
                    <div className="bg-white border border-slate-200 p-2.5 shadow-sm">
                      <span className="block font-black text-slate-900 mb-1">3. Pembayaran Otomatis</span>
                      Pencairan dana: Kurir, Pedagang, sisa ditransfer balik ke Pengguna
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: ADMIN / DICTIONARY VIEW */}
            {activeTab === 'admin' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-xl p-5 bg-white">
                  <div className="border-b border-slate-200 pb-3 mb-4">
                    <h3 className="text-base font-black text-slate-900">Presenter Admin Control</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Daftar harga kamus referensi database pasar tradisional</p>
                  </div>

                  {/* Seed Price dictionary listing */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wide">📚 Target Fuzzy Matching Referensi Barang & Harga:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {dictionary.map(dict => (
                        <div key={dict.id} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px] font-bold shadow-sm">
                          <span className="font-extrabold text-slate-950 block truncate">{dict.name}</span>
                          <span className="text-slate-500 block text-[9px] mt-0.5 font-semibold">{dict.category}</span>
                          <span className="text-emerald-600 font-extrabold mt-1 block">Rp {formatMoney(dict.estimated_price)} / {dict.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin State controller shortcuts */}
                  <div className="pt-5 border-t border-slate-200/60 mt-5 space-y-3">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wide">⚙️ Shortcut State Control:</h4>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={async () => {
                          if (!activeOrderId) return;
                          try {
                            const res = await fetch(`/api/orders/${activeOrderId}/transition`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'ON_DELIVERY' })
                            });
                            if (res.ok) {
                              fetchOrders();
                              fetchActiveOrderDetails();
                            }
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-black py-2 px-3.5 rounded-full text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-[0.98] active:shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Posisikan Order Terpilih: ON_DELIVERY
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </section>
      )}
        </div>
      </main>

    </div>
  );
}

export default App;
