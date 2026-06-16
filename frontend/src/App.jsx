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
      <header className="bg-white border-b-4 border-slate-900 py-3 px-6 shrink-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none border-2 border-slate-900 bg-[#fbbf24] flex items-center justify-center shadow-[2px_2px_0px_0px_#111827] shrink-0">
            <ShoppingBag className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-slate-900 flex items-center gap-2">
              Emak AI Titip <span className="text-[9px] bg-emerald-400 text-slate-900 px-2 py-0.5 rounded-none font-bold border-2 border-slate-900 shadow-[1px_1px_0px_0px_#111827]">PANEL KENDALI MVP</span>
            </h1>
            <p className="text-[10px] text-slate-600 hidden sm:block font-bold">Simulasi Integrasi Chatbot & Buku Kas Rekber</p>
          </div>
        </div>

        {/* Header Navigation & Global Stats */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('landing')}
            className="text-[11px] bg-white hover:bg-slate-50 text-slate-900 font-extrabold py-1.5 px-3 rounded-none border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#111827] transition-all cursor-pointer"
          >
            ← Kembali ke Beranda
          </button>
          
          <div className="hidden md:flex items-center gap-5 text-[11px] border-l-2 border-slate-900 pl-5 font-bold">
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
      <div className="bg-white border-b-3 border-slate-900 px-6 py-2 flex items-center justify-between gap-4 shrink-0 z-40 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-700 font-bold uppercase text-[10px]">Order Aktif:</span>
          {orders.length > 0 ? (
            <select
              value={activeOrderId || ''}
              onChange={(e) => {
                setActiveOrderId(e.target.value);
                setEditingItemId(null);
              }}
              className="bg-white border-2 border-slate-900 text-slate-900 text-[11px] font-black rounded-none px-2.5 py-1 focus:outline-none cursor-pointer shadow-[2px_2px_0px_0px_#111827]"
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
            className="text-[10px] bg-white hover:bg-slate-50 text-red-500 border-2 border-slate-900 font-black py-1 px-2.5 rounded-none flex items-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#111827]"
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
          border-r-3 border-slate-900 flex flex-col bg-[#efeae2] h-full overflow-hidden shrink-0
        `}>
          {/* WA Contact Header */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-b-3 border-slate-900 shrink-0 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none border-2 border-slate-900 bg-emerald-400 flex items-center justify-center text-slate-900 font-black text-sm shadow-[2px_2px_0px_0px_#111827]">
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
          <div className="bg-[#f3f4f6] border-b-2 border-slate-900/60 px-4 py-2.5 shrink-0">
            <p className="text-[9px] text-slate-600 mb-2 font-bold uppercase tracking-wide">📋 KIRIM DRAFT BELANJA CEPAT:</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
              <button 
                onClick={() => runPresetScript("Beliin bumbu lodeh 2 porsi sama tempe papan satu ya")}
                className="text-[11px] bg-white border-2 border-slate-900 text-slate-900 font-extrabold py-1.5 px-3 rounded-none hover:bg-slate-50 shrink-0 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827]"
              >
                🥕 Lodeh & Tempe
              </button>
              <button 
                onClick={() => runPresetScript("Beli wortel 1 kg, kentang 2 kg, sama ayam potong 1 ekor ya")}
                className="text-[11px] bg-white border-2 border-slate-900 text-slate-900 font-extrabold py-1.5 px-3 rounded-none hover:bg-slate-50 shrink-0 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827]"
              >
                🍗 Sayuran & Ayam
              </button>
              <button 
                onClick={() => runPresetScript("Tolong beliin kelapa parut 1 butir sama gula merah 250gr")}
                className="text-[11px] bg-white border-2 border-slate-900 text-slate-900 font-extrabold py-1.5 px-3 rounded-none hover:bg-slate-50 shrink-0 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827]"
              >
                🥥 Kelapa & Gula Merah
              </button>
            </div>
          </div>

          {/* WA Chat Feed */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {chatMessages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
              >
                <div className={`p-3 rounded-none text-xs whitespace-pre-line relative ${
                  msg.sender === 'user' 
                    ? 'wa-bubble-out text-slate-900 font-bold' 
                    : 'wa-bubble-in text-slate-900 font-medium'
                }`}>
                  {msg.text}
                  
                  {/* WhatsApp Custom Interactive Buttons for Substitution */}
                  {msg.text.includes("BARANG KOSONG!") && activeOrder && activeOrder.status === 'AWAITING_SUBSTITUTION' && (
                    <div className="mt-3 pt-2.5 border-t-2 border-slate-900/40 flex gap-2">
                      <button
                        onClick={() => handleChatSubstitutionChoice(activeOrder.id, true)}
                        className="flex-1 bg-emerald-400 border-2 border-slate-900 hover:bg-emerald-500 text-slate-900 font-black py-1.5 rounded-none text-[10px] text-center shadow-[2px_2px_0px_0px_#111827] cursor-pointer"
                      >
                        SETUJU
                      </button>
                      <button
                        onClick={() => handleChatSubstitutionChoice(activeOrder.id, false)}
                        className="flex-1 bg-red-400 border-2 border-slate-900 hover:bg-red-500 text-slate-900 font-black py-1.5 rounded-none text-[10px] text-center shadow-[2px_2px_0px_0px_#111827] cursor-pointer"
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
                        className="w-full bg-sky-400 hover:bg-sky-500 border-2 border-slate-900 text-slate-900 font-black py-2 px-3 rounded-none text-[10px] text-center shadow-[2px_2px_0px_0px_#111827] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
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
            className="p-3 bg-white flex items-center gap-2 shrink-0 border-t-3 border-slate-900"
          >
            <input 
              type="text" 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Tulis pesan belanjaan..."
              className="flex-1 bg-slate-50 border-2 border-slate-900 rounded-none px-4 py-2 text-xs text-slate-900 focus:outline-none"
            />
            <button 
              type="submit" 
              className="w-8 h-8 border-2 border-slate-900 bg-emerald-400 hover:bg-emerald-500 text-slate-900 flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827]"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* Right Side: Actuator Dashboards */}
        <section className={`
          ${activeTab === 'chat' ? 'hidden' : 'flex w-full'} 
          lg:flex lg:w-[60%] flex-col h-full bg-[#f3f4f6] overflow-hidden
        `}>
          
          {/* Desktop Dashboard Navigation Menu */}
          <nav className="hidden lg:flex border-b-3 border-slate-900 p-2 gap-2 bg-white shrink-0">
            <button
              onClick={() => setActiveTab('vendor')}
              className={`flex-grow py-2.5 border-2 border-slate-900 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827] hover:translate-y-[-1px] active:translate-y-[1px] ${
                activeTab === 'vendor' ? 'bg-emerald-400 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Store className="w-4 h-4" />
              MITRA (SELLER)
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`flex-grow py-2.5 border-2 border-slate-900 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827] hover:translate-y-[-1px] active:translate-y-[1px] ${
                activeTab === 'driver' ? 'bg-[#3b82f6] text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4" />
              KURIR (DRIVER)
            </button>
            <button
              onClick={() => setActiveTab('escrow')}
              className={`flex-grow py-2.5 border-2 border-slate-900 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827] hover:translate-y-[-1px] active:translate-y-[1px] ${
                activeTab === 'escrow' ? 'bg-amber-400 text-slate-900' : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              REKENING BERSAMA / REKBER
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-4.5 py-2.5 border-2 border-slate-900 font-black text-xs flex items-center justify-center transition-all cursor-pointer shadow-[2px_2px_0px_0px_#111827] hover:translate-y-[-1px] active:translate-y-[1px] ${
                activeTab === 'admin' ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-50'
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
                <div className="glass-card rounded-none p-5 bg-white">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-2 border-slate-900 bg-emerald-100 flex items-center justify-center shadow-[1px_1px_0px_0px_#111827]">
                        <Store className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Dashboard Toko Mitra</span>
                        <h3 className="text-base font-extrabold font-display text-slate-900 mt-0.5">Stall Sayur Segar - Ibu Aminah</h3>
                      </div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-900 bg-emerald-400 border-2 border-slate-900 shadow-[1px_1px_0px_0px_#111827] px-2.5 py-0.5">
                      <span className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-ping"></span>
                      Stall Buka
                    </span>
                  </div>

                  {/* Packing Progress Bar */}
                  {activeOrder.status === 'MITRA_PREPPING' && (
                    <div className="mb-5 bg-slate-50 p-3.5 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-slate-700">Progress Pengemasan Barang</span>
                        <span className="text-emerald-600">100% Ready</span>
                      </div>
                      <div className="w-full h-3 bg-slate-200 border-2 border-slate-900 rounded-none overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-none w-full transition-all duration-500"></div>
                      </div>
                    </div>
                  )}

                  {/* Order Item Tickets */}
                  <div className="space-y-2.5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Daftar Barang Belanjaan:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeOrder.items && activeOrder.items.map((item) => (
                        <div key={item.id} className="bg-slate-50 border-2 border-slate-900 p-3.5 rounded-none flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#111827]">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 border-2 border-slate-900 flex items-center justify-center text-xs font-black shadow-[1px_1px_0px_0px_#111827] ${
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
                  <div className="mt-6 pt-5 border-t-2 border-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Status Pemesanan</span>
                      <span className="text-xs font-black text-slate-900 mt-0.5 inline-block bg-amber-300 border-2 border-slate-900 px-2 py-0.5 uppercase shadow-[1px_1px_0px_0px_#111827]">
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
                        className="bg-emerald-400 border-2 border-slate-900 text-slate-900 font-black py-2.5 px-5 rounded-none text-xs flex items-center justify-center gap-1.5 transition-all shadow-[3px_3px_0px_0px_#111827] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#111827] cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Selesai Packing & Serahkan Kurir
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-600 font-bold bg-slate-50 p-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827]">
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
                <div className="w-full max-w-[420px] mx-auto bg-slate-100 border-4 border-slate-900 rounded-none shadow-[4px_4px_0px_0px_#111827] p-4">
                  
                  {/* Phone Screen body */}
                  <div className="bg-[#f3f4f6] p-4 flex flex-col justify-between text-xs min-h-[500px]">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center pb-3 border-b-2 border-slate-900">
                      <div>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider block">Emak Kurir App</span>
                        <h4 className="font-extrabold text-slate-900 text-sm">Order ID: {activeOrder.id.substring(4)}</h4>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-[#3b82f6] text-white border-2 border-slate-900 shadow-[1px_1px_0px_0px_#111827]">
                          DRIVER ACTIVE
                        </span>
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="bg-white p-3 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#111827] my-3 flex items-center justify-between text-[11px] font-semibold">
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
                                  className={`p-2.5 border-2 border-slate-900 flex flex-col gap-2 transition-all shadow-[2px_2px_0px_0px_#111827] ${
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
                                            className="bg-slate-50 border-2 border-slate-900 rounded-none px-2 py-1 text-slate-900 text-xs w-24 outline-none"
                                            placeholder="Harga..."
                                            autoFocus
                                          />
                                        </div>
                                      </div>
                                      <div className="flex gap-1 shrink-0 mt-3">
                                        <button 
                                          onClick={() => handleSaveItemPrice(item.id)}
                                          className="p-1.5 bg-emerald-400 border-2 border-slate-900 text-slate-900 rounded-none hover:bg-emerald-500 cursor-pointer shadow-[1px_1px_0px_0px_#111827]"
                                          title="Simpan"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          onClick={() => setEditingItemId(null)}
                                          className="p-1.5 bg-slate-200 border-2 border-slate-900 text-slate-900 rounded-none hover:bg-slate-350 cursor-pointer shadow-[1px_1px_0px_0px_#111827]"
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
                                          className={`w-5 h-5 border-2 border-slate-900 flex items-center justify-center transition-all cursor-pointer ${
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
                                            className="bg-red-100 hover:bg-red-200 text-red-600 border-2 border-slate-900 font-bold px-2 py-0.5 rounded-none text-[9px] cursor-pointer shadow-[1px_1px_0px_0px_#111827]"
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
                                            className="text-slate-600 hover:text-slate-900 p-1 border-2 border-transparent hover:border-slate-900 rounded-none cursor-pointer"
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
                          <div className="w-12 h-12 border-2 border-slate-900 bg-emerald-400 flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#111827]">
                            <CheckCircle2 className="w-7 h-7 text-slate-900" />
                          </div>
                          <div>
                            <h5 className="font-black text-slate-900 text-sm">Delivery Sukses!</h5>
                            <p className="text-slate-600 text-[11px] mt-1 max-w-[240px] mx-auto font-semibold">
                              Pesanan telah diterima dan dana Rekber berhasil dicairkan secara transaksional.
                            </p>
                          </div>
                          
                          <div className="bg-white border-2 border-slate-900 p-3.5 rounded-none text-left text-[11px] space-y-1.5 mt-4 max-w-[280px] mx-auto shadow-[3px_3px_0px_0px_#111827]">
                            <p className="text-slate-600 font-extrabold uppercase text-[9px] border-b-2 border-slate-900 pb-1 mb-1.5">Rincian Pencairan Dana:</p>
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-500">Pembayaran ke Mitra Pasar:</span>
                              <span className="text-slate-900 font-black">Rp {formatMoney(activeOrder.total_actual)}</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span className="text-slate-500">Biaya Antar Kurir:</span>
                              <span className="text-slate-900 font-black">Rp 10.000</span>
                            </div>
                            <div className="flex justify-between border-t-2 border-slate-900/60 pt-1.5 mt-1.5 font-bold">
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
                          className="bg-white border-2 border-slate-900 p-3 rounded-none shadow-[2px_2px_0px_0px_#111827] mt-4"
                        >
                          <span className="text-[9px] font-bold text-slate-600 block uppercase tracking-wide">📄 NOTA BELANJA GENERATED:</span>
                          <div className="border-2 border-dashed border-slate-900 rounded-none p-3 flex flex-col items-center justify-center text-center gap-1.5 bg-slate-50">
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
                    <div className="pt-3 border-t-2 border-slate-900 mt-3">
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
                          className="w-full bg-[#3b82f6] border-2 border-slate-900 text-white font-black py-3 rounded-none flex items-center justify-center gap-1.5 transition-all shadow-[3px_3px_0px_0px_#111827] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#111827] cursor-pointer"
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
                          className="w-full bg-emerald-400 border-2 border-slate-900 text-slate-900 font-black py-3 rounded-none flex items-center justify-center gap-1.5 transition-all shadow-[3px_3px_0px_0px_#111827] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_#111827] cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Selesai & Selesaikan Transaksi Rekber
                        </button>
                      )}

                      {activeOrder.status === 'AWAITING_SUBSTITUTION' && (
                        <div className="bg-amber-100 text-amber-700 p-2.5 rounded-none border-2 border-slate-900 text-center animate-pulse-soft font-extrabold text-[10px] shadow-[2px_2px_0px_0px_#111827]">
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
                  <div className="bg-white border-2 border-slate-900 p-4 rounded-none flex flex-col justify-between min-h-[90px] shadow-[3px_3px_0px_0px_#111827] text-slate-900">
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
                  <div className="bg-white border-2 border-slate-900 p-4 rounded-none flex flex-col justify-between min-h-[90px] shadow-[3px_3px_0px_0px_#111827] text-slate-900">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Belanja Real</span>
                    <div>
                      <h4 className="text-xl font-black font-display text-emerald-600 mt-1">
                        Rp {formatMoney(activeOrder.total_actual || activeOrder.items.reduce((acc, curr) => curr.status === 'FULFILLED' || curr.status === 'SUBSTITUTED' ? acc + curr.actual_price : acc, 0))}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1 font-bold">Est: Rp {formatMoney(activeOrder.total_estimated)}</p>
                    </div>
                  </div>

                  {/* Ledger metric 3 */}
                  <div className="bg-white border-2 border-slate-900 p-4 rounded-none flex flex-col justify-between min-h-[90px] shadow-[3px_3px_0px_0px_#111827] text-slate-900">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Refund Pembeli</span>
                    <div>
                      <h4 className="text-xl font-black font-display text-amber-500 mt-1">
                        Rp {formatMoney(activeOrder.refund_amount)}
                      </h4>
                      <p className="text-[9px] text-slate-500 mt-1 font-bold">Buffer 15%: Rp {formatMoney(activeOrder.buffer_amount)}</p>
                    </div>
                  </div>

                  {/* Ledger metric 4 */}
                  <div className="bg-white border-2 border-slate-900 p-4 rounded-none flex flex-col justify-between min-h-[90px] shadow-[3px_3px_0px_0px_#111827] text-slate-900">
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
                <div className="glass-card rounded-none p-5 bg-white">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4">
                    <div>
                      <h3 className="text-base font-black font-display text-slate-900">Riwayat Mutasi Rekber</h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-semibold">Riwayat audit dari pembukuan relasional SQLite</p>
                    </div>
                    <Shield className="w-5 h-5 text-slate-800 opacity-70 shrink-0" />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-900 bg-slate-50 text-slate-700 uppercase tracking-wider text-[9px] font-bold">
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
                                <span className={`px-2 py-0.5 rounded-none text-[9px] font-extrabold border-2 border-slate-900 shadow-[1px_1px_0px_0px_#111827] ${
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
                <div className="bg-white border-2 border-slate-900 p-4 rounded-none shadow-[3px_3px_0px_0px_#111827] space-y-3">
                  <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4 text-slate-800" />
                    Alur Transaksi Saga Terdistribusi
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-[10px] text-slate-700 leading-relaxed font-semibold">
                    <div className="bg-white border-2 border-slate-900 p-2.5 shadow-[2px_2px_0px_0px_#111827]">
                      <span className="block font-black text-slate-900 mb-1">1. Deposit Dikunci</span>
                      Estimasi + 15% buffer saldo diamankan di Rekber
                    </div>
                    <div className="hidden sm:flex items-center justify-center"><ChevronRight className="w-4 h-4 text-slate-900" /></div>
                    <div className="bg-white border-2 border-slate-900 p-2.5 shadow-[2px_2px_0px_0px_#111827]">
                      <span className="block font-black text-slate-900 mb-1">2. Cek Harga</span>
                      Kurir mencocokkan harga asli pasar dan nota belanja
                    </div>
                    <div className="hidden sm:flex items-center justify-center"><ChevronRight className="w-4 h-4 text-slate-900" /></div>
                    <div className="bg-white border-2 border-slate-900 p-2.5 shadow-[2px_2px_0px_0px_#111827]">
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
                <div className="glass-card rounded-none p-5 bg-white">
                  <div className="border-b-2 border-slate-900 pb-3 mb-4">
                    <h3 className="text-base font-black text-slate-900">Presenter Admin Control</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Daftar harga kamus referensi database pasar tradisional</p>
                  </div>

                  {/* Seed Price dictionary listing */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-wide">📚 Target Fuzzy Matching Referensi Barang & Harga:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {dictionary.map(dict => (
                        <div key={dict.id} className="bg-slate-50 border-2 border-slate-900 p-2 rounded-none text-[10px] font-bold shadow-[1px_1px_0px_0px_#111827]">
                          <span className="font-extrabold text-slate-950 block truncate">{dict.name}</span>
                          <span className="text-slate-500 block text-[9px] mt-0.5 font-semibold">{dict.category}</span>
                          <span className="text-emerald-600 font-extrabold mt-1 block">Rp {formatMoney(dict.estimated_price)} / {dict.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin State controller shortcuts */}
                  <div className="pt-5 border-t-2 border-slate-900/60 mt-5 space-y-3">
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
                        className="bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 font-black py-2 px-3.5 rounded-none text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#111827] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#111827]"
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-4 border-slate-900 py-2 px-4 flex items-center justify-around z-50 shadow-none h-[64px]">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-none transition-all cursor-pointer ${
            activeTab === 'chat' ? 'text-slate-900 bg-emerald-400 border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_#111827]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[9px] font-sans font-bold">Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('vendor')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-none transition-all cursor-pointer ${
            activeTab === 'vendor' ? 'text-slate-900 bg-emerald-400 border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_#111827]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[9px] font-sans font-bold">Mitra</span>
        </button>
        <button
          onClick={() => setActiveTab('driver')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-none transition-all cursor-pointer ${
            activeTab === 'driver' ? 'text-slate-900 bg-[#3b82f6] border-2 border-slate-900 text-white font-bold shadow-[2px_2px_0px_0px_#111827]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[9px] font-sans font-bold">Kurir</span>
        </button>
        <button
          onClick={() => setActiveTab('escrow')}
          className={`flex flex-col items-center gap-1 py-1 px-3.5 rounded-none transition-all cursor-pointer ${
            activeTab === 'escrow' ? 'text-slate-900 bg-amber-400 border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_#111827]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span className="text-[9px] font-sans font-bold">Rekber</span>
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-none transition-all cursor-pointer ${
            activeTab === 'admin' ? 'text-white bg-slate-800 border-2 border-slate-900 font-bold shadow-[2px_2px_0px_0px_#111827]' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-[9px] font-sans font-bold">Admin</span>
        </button>
      </nav>

    </div>
  );
}

export default App;
