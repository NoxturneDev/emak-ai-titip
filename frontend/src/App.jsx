import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Phone, Video, MoreVertical, CheckCircle2, ShoppingBag, 
  Truck, DollarSign, RefreshCw, PlusCircle, AlertCircle, 
  Check, X, FileText, ArrowRight, User, ShieldAlert, Award,
  Edit2, Store, Lock, ChevronRight, MessageSquare, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';

// Mock receipt image path
const MOCK_RECEIPT = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop";

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'demo'
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'vendor' | 'driver' | 'escrow' | 'admin'
  const [isMobile, setIsMobile] = useState(false);
  
  // Inline Price Editing State for Driver
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile && activeTab === 'chat') {
        setActiveTab('vendor');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);
  
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
      messageText = `*Pembayaran Berhasil!* \n\nDana sebesar *Rp ${formatMoney(order.total_estimated + order.buffer_amount)}* (Estimasi + 15% Buffer) telah kami amankan di rekening bersama (Escrow).\n\nMitra Pasar kami sedang menyiapkan belanjaan Anda. Kurir driver akan segera menuju toko Mitra.`;
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
    <div className="h-screen bg-background text-gray-100 flex flex-col font-sans overflow-hidden select-none">
      
      {/* Top Header */}
      <header className="glass-panel border-b border-border py-3 px-6 shrink-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center glow-green shrink-0">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold font-display tracking-tight text-white flex items-center gap-2">
              Emak AI Titip <span className="text-[10px] bg-primary/20 text-primary-light px-2 py-0.5 rounded-full font-sans border border-primary/30">MVP Control Center</span>
            </h1>
            <p className="text-[10px] text-gray-400 hidden sm:block">Conversational Webhook & Escrow Ledger Simulation</p>
          </div>
        </div>

        {/* Header Navigation & Global Stats */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('landing')}
            className="text-[11px] bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-1.5 px-3 rounded-lg border border-white/10 transition-all cursor-pointer"
          >
            ← Kembali ke Beranda
          </button>
          
          <div className="hidden md:flex items-center gap-5 text-[11px] border-l border-border pl-5">
            <div className="text-left">
              <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Total Orders</span>
              <span className="font-bold text-white">{orders.length}</span>
            </div>
            <div className="text-left">
              <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Active Status</span>
              <span className="font-bold text-primary-light flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {activeOrder ? activeOrder.status : 'None'}
              </span>
            </div>
            <div className="text-left">
              <span className="text-gray-400 block text-[9px] uppercase tracking-wider">Escrow Vault</span>
              <span className="font-bold text-accent-light">
                Rp {activeOrder && activeOrder.ledger 
                  ? formatMoney(activeOrder.ledger.reduce((acc, curr) => curr.type === 'CREDIT_PAYMENT' ? acc + curr.amount : acc - curr.amount, 0))
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Unified Global Active Order & Control Bar */}
      <div className="bg-[#11131d] border-b border-border px-6 py-2 flex items-center justify-between gap-4 shrink-0 z-40 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-medium">Order Aktif:</span>
          {orders.length > 0 ? (
            <select
              value={activeOrderId || ''}
              onChange={(e) => {
                setActiveOrderId(e.target.value);
                setEditingItemId(null);
              }}
              className="bg-[#171a26] border border-border text-white text-[11px] font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary cursor-pointer"
            >
              {orders.map((ord) => (
                <option key={ord.id} value={ord.id}>
                  ID: {ord.id.substring(4)} — {ord.status}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-gray-500 italic text-[11px]">Belum ada order. Silakan kirim pesan chat di simulator.</span>
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
            className="text-[10px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-1 px-2.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Reset Data & Chat
          </button>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative pb-[64px] lg:pb-0">
        
        {/* Left Side: WhatsApp Simulator */}
        <section className={`
          ${activeTab === 'chat' ? 'flex w-full' : 'hidden lg:flex lg:w-[40%]'} 
          border-r border-border flex flex-col bg-whatsapp-bg h-full overflow-hidden shrink-0
        `}>
          {/* WA Contact Header */}
          <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2e3b43] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-whatsapp-green to-whatsapp-dark flex items-center justify-center text-white font-bold text-sm shadow-md">
                E
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Emak AI Bot (Jastip)</h3>
                <span className="text-[11px] text-whatsapp-green flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-whatsapp-green rounded-full animate-pulse"></span>
                  online (System Simulator)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-xs">
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Quick Script Tag Carousel */}
          <div className="bg-[#182229] border-b border-[#222d34] px-4 py-2.5 shrink-0">
            <p className="text-[10px] text-slate-400 mb-2 font-medium tracking-wide">📋 KIRIM DRAFT BELANJA CEPAT:</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button 
                onClick={() => runPresetScript("Beliin bumbu lodeh 2 porsi sama tempe papan satu ya")}
                className="text-[11px] bg-primary/10 border border-primary/20 text-primary-light py-1.5 px-3 rounded-lg hover:bg-primary/20 shrink-0 transition-all cursor-pointer"
              >
                🥕 Lodeh & Tempe
              </button>
              <button 
                onClick={() => runPresetScript("Beli wortel 1 kg, kentang 2 kg, sama ayam potong 1 ekor ya")}
                className="text-[11px] bg-secondary/10 border border-secondary/20 text-secondary-light py-1.5 px-3 rounded-lg hover:bg-secondary/20 shrink-0 transition-all cursor-pointer"
              >
                🍗 Sayuran & Ayam
              </button>
              <button 
                onClick={() => runPresetScript("Tolong beliin kelapa parut 1 butir sama gula merah 250gr")}
                className="text-[11px] bg-accent/10 border border-accent/20 text-accent-light py-1.5 px-3 rounded-lg hover:bg-accent/20 shrink-0 transition-all cursor-pointer"
              >
                🥥 Kelapa & Gula Merah
              </button>
            </div>
          </div>

          {/* WA Chat Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
              >
                <div className={`p-2.5 rounded-lg text-xs whitespace-pre-line shadow-sm relative ${
                  msg.sender === 'user' 
                    ? 'wa-bubble-out text-slate-100 font-medium' 
                    : 'wa-bubble-in text-slate-200'
                }`}>
                  {msg.text}
                  
                  {/* WhatsApp Custom Interactive Buttons for Substitution */}
                  {msg.text.includes("BARANG KOSONG!") && activeOrder && activeOrder.status === 'AWAITING_SUBSTITUTION' && (
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex gap-2">
                      <button
                        onClick={() => handleChatSubstitutionChoice(activeOrder.id, true)}
                        className="flex-1 bg-whatsapp-green hover:bg-[#20ba5a] text-white font-bold py-1.5 rounded text-[10px] text-center shadow-md cursor-pointer"
                      >
                        SETUJU
                      </button>
                      <button
                        onClick={() => handleChatSubstitutionChoice(activeOrder.id, false)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 rounded text-[10px] text-center shadow-md cursor-pointer"
                      >
                        BATAL
                      </button>
                    </div>
                  )}

                  {/* Payment Button Simulation inside Chat */}
                  {msg.text.includes("Silakan klik link berikut untuk melanjutkan pembayaran") && activeOrder && activeOrder.status === 'AWAITING_PAYMENT' && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleSimulatePayment(activeOrder.id)}
                        className="w-full bg-[#3b82f6] hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-[10px] text-center shadow flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Bayar Deposit Escrow
                      </button>
                    </div>
                  )}
                </div>
                <span className={`text-[9px] text-slate-500 mt-1 flex items-center gap-1 ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                  {msg.timestamp}
                  {msg.sender === 'bot' && <span className="text-sky-400 font-bold">✓✓</span>}
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
            className="p-3 bg-[#1f2c34] flex items-center gap-2 shrink-0 border-t border-[#2e3b43]"
          >
            <input 
              type="text" 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tulis pesan belanjaan..."
              className="flex-1 bg-[#2a3942] text-slate-200 rounded-lg px-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-whatsapp-green"
            />
            <button 
              type="submit" 
              className="w-8 h-8 rounded-full bg-whatsapp-green hover:bg-[#20ba5a] text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* Right Side: Actuator Dashboards */}
        <section className={`
          ${activeTab === 'chat' ? 'hidden' : 'flex w-full'} 
          lg:flex lg:w-[60%] flex-col h-full bg-background overflow-hidden
        `}>
          
          {/* Desktop Dashboard Navigation Menu */}
          <nav className="hidden lg:flex glass-panel border-b border-border p-2 gap-1 bg-[#10131e]/50 shrink-0">
            <button
              onClick={() => setActiveTab('vendor')}
              className={`flex-1 py-2 rounded-lg font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'vendor' ? 'bg-primary text-white shadow-lg glow-green' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'
              }`}
            >
              <Store className="w-4 h-4" />
              MITRA (SELLER)
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`flex-1 py-2 rounded-lg font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'driver' ? 'bg-secondary text-white shadow-lg glow-blue' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'
              }`}
            >
              <Truck className="w-4 h-4" />
              KURIR (DRIVER)
            </button>
            <button
              onClick={() => setActiveTab('escrow')}
              className={`flex-1 py-2 rounded-lg font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'escrow' ? 'bg-accent text-white shadow-lg glow-violet' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              ESCROW (LEDGER)
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg font-semibold text-xs flex items-center justify-center transition-all cursor-pointer ${
                activeTab === 'admin' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'
              }`}
              title="Kamus & Debug"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </nav>

          {/* Active View Content Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            
            {/* Fallback when no order is selected */}
            {!activeOrder && activeTab !== 'admin' && (
              <div className="h-64 flex flex-col items-center justify-center text-center gap-3">
                <AlertCircle className="w-10 h-10 text-slate-500 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-gray-400">Tidak Ada Order Aktif</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">Gunakan Chat Simulator di sebelah kiri untuk memasukkan daftar belanjaan pertama Ibu.</p>
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
                <div className="glass-card rounded-2xl p-5 border border-border">
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary-light flex items-center justify-center">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] text-primary-light font-bold uppercase tracking-wider">Dashboard Toko Mitra</span>
                        <h3 className="text-base font-bold font-display text-white mt-0.5">Stall Sayur Segar - Ibu Aminah</h3>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                      Stall Buka
                    </span>
                  </div>

                  {/* Packing Progress Bar */}
                  {activeOrder.status === 'MITRA_PREPPING' && (
                    <div className="mb-5 bg-[#151824] p-3.5 rounded-xl border border-border/80">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-gray-400 font-medium">Progress Pengemasan Barang</span>
                        <span className="text-primary-light font-bold">100% Ready</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-full transition-all duration-500"></div>
                      </div>
                    </div>
                  )}

                  {/* Order Item Tickets */}
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Daftar Barang Belanjaan:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeOrder.items && activeOrder.items.map((item) => (
                        <div key={item.id} className="bg-[#151824] border border-border p-3.5 rounded-xl flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              item.category === 'Bumbu' ? 'bg-amber-500/10 text-amber-400' :
                              item.category === 'Sayuran' ? 'bg-emerald-500/10 text-emerald-400' :
                              item.category === 'Daging' ? 'bg-red-500/10 text-red-400' :
                              'bg-blue-500/10 text-sky-400'
                            }`}>
                              {item.name[0].toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-white text-xs block">{item.name}</span>
                              <span className="text-[10px] text-gray-400">{item.quantity} {item.unit} • {item.category}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-slate-300">
                            Rp {formatMoney(item.estimated_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase">Status Pemesanan</span>
                      <span className="text-xs font-bold text-slate-200 mt-0.5 inline-block bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
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
                        className="bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg glow-green cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Selesai Packing & Panggil Kurir
                      </button>
                    ) : (
                      <div className="text-[10px] text-gray-400 italic bg-[#151824] p-3 rounded-lg border border-border">
                        {activeOrder.status === 'AWAITING_PAYMENT' 
                          ? '⏳ Menunggu deposit dana escrow dibayarkan oleh Pengguna.' 
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
                <div className="w-full max-w-[440px] mx-auto bg-[#07090f] rounded-[40px] border-4 border-slate-800 shadow-2xl relative overflow-hidden">
                  
                  {/* Phone Screen body */}
                  <div className="bg-[#0e111a] p-4 flex flex-col justify-between text-xs min-h-[520px]">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-border/80">
                      <div>
                        <span className="text-[10px] text-secondary-light font-bold uppercase tracking-wider block">Emak Kurir App</span>
                        <h4 className="font-bold text-white text-sm">Order ID: {activeOrder.id.substring(4)}</h4>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-secondary/15 text-secondary-light border border-secondary/20">
                          DRIVER ACTIVE
                        </span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-[#151824] p-3 rounded-xl border border-border/60 my-3 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="text-gray-400 block text-[9px]">Tujuan Pengiriman</span>
                        <span className="font-bold text-white">Perumahan Indah Asri Blok C/15</span>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-400 block text-[9px]">Ongkos Kirim</span>
                        <span className="font-bold text-secondary-light">Rp 10.000 (Flat)</span>
                      </div>
                    </div>

                    {/* Main phone content scroll area */}
                    <div className="flex-1 py-2 space-y-4">
                      
                      {/* Driver checklist items */}
                      {activeOrder.status === 'MITRA_PREPPING' || activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'AWAITING_SUBSTITUTION' ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wide">Checklist Pembelian Barang:</span>
                            <span className="text-[10px] text-gray-500 italic">(Ketuk checklist/pencil untuk input harga)</span>
                          </div>
                          
                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {activeOrder.items && activeOrder.items.map((item) => {
                              const isFulfilled = item.status === 'FULFILLED' || item.status === 'SUBSTITUTED';
                              const isOOS = item.status === 'OUT_OF_STOCK';
                              const isEditing = editingItemId === item.id;
                              
                              return (
                                <div 
                                  key={item.id} 
                                  className={`p-2.5 rounded-xl border flex flex-col gap-2 transition-all ${
                                    isFulfilled ? 'bg-primary/5 border-primary/20 opacity-90' :
                                    isOOS ? 'bg-red-500/5 border-red-500/20 opacity-70' :
                                    'bg-[#161a26] border-border'
                                  }`}
                                >
                                  {isEditing ? (
                                    /* Inline Price Input mode */
                                    <div className="flex items-center justify-between gap-2 py-1">
                                      <div className="flex-1">
                                        <span className="text-[10px] text-gray-400 block mb-1">Actual Harga: {item.name}</span>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-semibold text-slate-300">Rp</span>
                                          <input 
                                            type="number"
                                            value={editingPrice}
                                            onChange={(e) => setEditingPrice(e.target.value)}
                                            className="bg-[#1e2333] border border-border rounded px-2 py-1 text-white text-xs w-24 outline-none focus:border-primary"
                                            placeholder="Tulis harga..."
                                            autoFocus
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-1 shrink-0 mt-3">
                                        <button 
                                          onClick={() => handleSaveItemPrice(item.id)}
                                          className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary-light cursor-pointer"
                                          title="Simpan"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => setEditingItemId(null)}
                                          className="p-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 cursor-pointer"
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
                                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                                            isFulfilled ? 'bg-primary border-primary text-white' : 'border-gray-500 hover:border-primary-light'
                                          }`}
                                        >
                                          {isFulfilled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </button>

                                        <div>
                                          <span className={`font-semibold text-white block ${isFulfilled ? 'line-through text-gray-500' : ''}`}>
                                            {item.name}
                                          </span>
                                          <span className="text-[10px] text-gray-400">{item.quantity} {item.unit}</span>
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
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold px-2 py-1 rounded text-[9px] cursor-pointer"
                                          >
                                            Habis
                                          </button>
                                        )}

                                        {/* Price indicator & edit trigger */}
                                        <div className="flex items-center gap-1.5">
                                          <div className="text-right">
                                            <span className="text-[10px] font-bold block text-gray-200">
                                              Rp {isFulfilled ? formatMoney(item.actual_price) : formatMoney(item.estimated_price)}
                                            </span>
                                            <span className="text-[8px] text-gray-400 uppercase tracking-wide block">
                                              {isFulfilled ? 'Aktual' : 'Estimasi'}
                                            </span>
                                          </div>
                                          
                                          {/* Price Edit Icon */}
                                          <button 
                                            onClick={() => handleStartEditing(item)}
                                            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 cursor-pointer"
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
                          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-7 h-7" />
                          </div>
                          <div>
                            <h5 className="font-bold text-white text-sm">Delivery Sukses!</h5>
                            <p className="text-gray-400 text-[11px] mt-1 max-w-[240px] mx-auto">
                              Pesanan telah diterima dan dana escrow berhasil dicairkan secara transaksional.
                            </p>
                          </div>
                          
                          <div className="bg-[#151824] border border-border p-3.5 rounded-xl text-left text-[11px] space-y-1.5 mt-4 max-w-[280px] mx-auto">
                            <p className="text-gray-400 font-bold uppercase text-[9px] border-b border-border pb-1 mb-1.5">Rincian Settlement:</p>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Merchant Payout:</span>
                              <span className="font-bold text-white">Rp {formatMoney(activeOrder.total_actual)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Driver Delivery Fee:</span>
                              <span className="font-bold text-white">Rp 10.000</span>
                            </div>
                            <div className="flex justify-between border-t border-border/40 pt-1.5 mt-1.5">
                              <span className="text-primary-light font-semibold">Uang Kembali (User):</span>
                              <span className="font-bold text-primary-light">Rp {formatMoney(activeOrder.refund_amount)}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-16 text-gray-500 italic text-[11px]">
                          Menunggu pembayaran deposit order dilepaskan oleh pembeli sebelum merilis checklist belanja.
                        </div>
                      )}

                      {/* Mock Receipt scanning display */}
                      {(activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'MITRA_PREPPING') && 
                       activeOrder.items && activeOrder.items.length > 0 && activeOrder.items.every(item => item.status !== 'PENDING') && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#10141f] border border-border p-3 rounded-xl space-y-2 mt-4"
                        >
                          <span className="text-[9px] font-bold text-secondary-light block uppercase tracking-wide">📄 NOTA BELANJA GENERATED:</span>
                          <div className="border border-dashed border-border/80 rounded-lg p-3 flex flex-col items-center justify-center text-center gap-1.5 bg-[#161a26]/40">
                            <FileText className="w-6 h-6 text-gray-400" />
                            <span className="text-[10px] text-gray-200 font-bold">Mock_Invoice_Pasar.pdf</span>
                            <div className="text-[8px] text-slate-500">
                              Realisasi Belanja: Rp {formatMoney(activeOrder.items.reduce((acc, curr) => curr.status === 'FULFILLED' || curr.status === 'SUBSTITUTED' ? acc + curr.actual_price : acc, 0))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="pt-3 border-t border-border/80 mt-3">
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
                          className="w-full bg-secondary hover:bg-sky-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg glow-blue cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          Kurir Mulai Belanja di Pasar
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
                          className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg glow-green cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Selesai & Settle Ledger Escrow
                        </button>
                      )}

                      {activeOrder.status === 'AWAITING_SUBSTITUTION' && (
                        <div className="bg-amber-500/10 text-amber-400 p-2.5 rounded-xl border border-amber-500/20 text-center animate-pulse-soft font-semibold text-[10px]">
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
                  <div className="bg-[#151824] border border-border p-4 rounded-2xl flex flex-col justify-between min-h-[90px]">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Escrow Balance</span>
                    <div>
                      <h4 className="text-xl font-bold font-display text-white mt-1">
                        Rp {activeOrder.ledger 
                          ? formatMoney(activeOrder.ledger.reduce((acc, curr) => curr.type === 'CREDIT_PAYMENT' ? acc + curr.amount : acc - curr.amount, 0))
                          : 0}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1">Held securely in ledger</p>
                    </div>
                  </div>

                  {/* Ledger metric 2 */}
                  <div className="bg-[#151824] border border-border p-4 rounded-2xl flex flex-col justify-between min-h-[90px]">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Belanja Real</span>
                    <div>
                      <h4 className="text-xl font-bold font-display text-primary-light mt-1">
                        Rp {formatMoney(activeOrder.total_actual || activeOrder.items.reduce((acc, curr) => curr.status === 'FULFILLED' || curr.status === 'SUBSTITUTED' ? acc + curr.actual_price : acc, 0))}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1">Est: Rp {formatMoney(activeOrder.total_estimated)}</p>
                    </div>
                  </div>

                  {/* Ledger metric 3 */}
                  <div className="bg-[#151824] border border-border p-4 rounded-2xl flex flex-col justify-between min-h-[90px]">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Refund Pembeli</span>
                    <div>
                      <h4 className="text-xl font-bold font-display text-accent-light mt-1">
                        Rp {formatMoney(activeOrder.refund_amount)}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1">Buffer 15%: Rp {formatMoney(activeOrder.buffer_amount)}</p>
                    </div>
                  </div>

                  {/* Ledger metric 4 */}
                  <div className="bg-[#151824] border border-border p-4 rounded-2xl flex flex-col justify-between min-h-[90px]">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Biaya Jasa</span>
                    <div>
                      <h4 className="text-xl font-bold font-display text-secondary-light mt-1">
                        Rp {activeOrder.status === 'COMPLETED' ? '10.000' : '0'}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1">Flat driver shipping</p>
                    </div>
                  </div>
                </div>

                {/* Audit Ledger List */}
                <div className="glass-card rounded-2xl p-5 border border-border">
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                    <div>
                      <h3 className="text-base font-bold font-display text-white">Mutasi Escrow Ledger</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Audit log dari ledger relasional SQLite</p>
                    </div>
                    <Shield className="w-5 h-5 text-accent-light opacity-50 shrink-0" />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/60 text-slate-400 uppercase tracking-wider text-[9px] font-bold">
                          <th className="py-2 pb-3">Tipe</th>
                          <th className="py-2 pb-3">Deskripsi Transaksi</th>
                          <th className="py-2 pb-3 text-right">Nilai Rupiah</th>
                          <th className="py-2 pb-3 text-right">Waktu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                        {activeOrder.ledger && activeOrder.ledger.length > 0 ? (
                          activeOrder.ledger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                  entry.type === 'CREDIT_PAYMENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  entry.type === 'DEBIT_REFUND' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                  entry.type === 'DEBIT_DRIVER_FEE' ? 'bg-blue-500/10 text-sky-400 border-blue-500/20' :
                                  'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {entry.type}
                                </span>
                              </td>
                              <td className="py-3 text-slate-300 font-sans">{entry.description}</td>
                              <td className={`py-3 text-right font-bold font-mono ${entry.type === 'CREDIT_PAYMENT' ? 'text-emerald-400' : 'text-slate-300'}`}>
                                {entry.type === 'CREDIT_PAYMENT' ? '+' : '-'} Rp {formatMoney(entry.amount)}
                              </td>
                              <td className="py-3 text-right text-gray-500 font-sans">{formatDate(entry.created_at)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="py-8 text-center text-gray-500 italic font-sans">
                              Belum ada catatan transaksi terekam pada database escrow.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Saga Flow visualization */}
                <div className="bg-[#151824] p-4 rounded-xl border border-border/80 space-y-3">
                  <h4 className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 text-accent-light" />
                    Distributed Saga Transaction Pipeline
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-[10px] text-gray-400 leading-relaxed font-sans">
                    <div className="bg-card border border-border p-2.5 rounded-xl">
                      <span className="block font-bold text-white mb-1">1. Deposit Locked</span>
                      Estimasi + 15% buffer saldo diamankan di escrow
                    </div>
                    <div className="hidden sm:flex items-center justify-center"><ArrowRight className="w-4 h-4 text-gray-600" /></div>
                    <div className="bg-card border border-border p-2.5 rounded-xl">
                      <span className="block font-bold text-white mb-1">2. Price Checklist</span>
                      Driver mencocokkan harga riil pasar dan nota belanja
                    </div>
                    <div className="hidden sm:flex items-center justify-center"><ArrowRight className="w-4 h-4 text-gray-600" /></div>
                    <div className="bg-card border border-border p-2.5 rounded-xl">
                      <span className="block font-bold text-white mb-1">3. Atomic Payout</span>
                      Pecahan dana dilepaskan: Kurir, Pedagang, sisa ditransfer balik
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
                <div className="glass-card rounded-2xl p-5 border border-border">
                  <div className="border-b border-border pb-3 mb-4">
                    <h3 className="text-base font-bold font-display text-white">Presenter Admin Control</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Daftar harga kamus referensi database pasar tradisional</p>
                  </div>

                  {/* Seed Price dictionary listing */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">📚 Target Fuzzy Matching Referensi Barang & Harga:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {dictionary.map(dict => (
                        <div key={dict.id} className="bg-[#151824] border border-border p-2 rounded-xl text-[10px]">
                          <span className="font-bold text-white block truncate">{dict.name}</span>
                          <span className="text-gray-400 block text-[9px] mt-0.5">{dict.category}</span>
                          <span className="text-primary-light font-bold mt-1 block">Rp {formatMoney(dict.estimated_price)} / {dict.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin State controller shortcuts */}
                  <div className="pt-5 border-t border-border mt-5 space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">⚙️ Shortcut State Control:</h4>
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
                        className="bg-secondary/10 hover:bg-secondary/25 text-secondary-light border border-secondary/25 font-bold py-2 px-3.5 rounded-xl text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
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

      </main>

      {/* Mobile Floating Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0e111a]/95 backdrop-blur-xl border-t border-border py-2 px-4 flex items-center justify-around z-50 shadow-2xl h-[64px]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'chat' ? 'text-whatsapp-green bg-whatsapp-green/10 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-sans">Chat Simulator</span>
        </button>
        <button
          onClick={() => setActiveTab('vendor')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'vendor' ? 'text-primary-light bg-primary/10 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[9px] font-sans">Toko Mitra</span>
        </button>
        <button
          onClick={() => setActiveTab('driver')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'driver' ? 'text-secondary-light bg-secondary/10 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[9px] font-sans">Kurir Driver</span>
        </button>
        <button
          onClick={() => setActiveTab('escrow')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'escrow' ? 'text-accent-light bg-accent/10 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[9px] font-sans">Escrow Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'admin' ? 'text-slate-300 bg-white/5 font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-[9px] font-sans">Admin Control</span>
        </button>
      </nav>

    </div>
  );
}

export default App;
