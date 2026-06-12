import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Phone, Video, MoreVertical, CheckCircle2, ShoppingBag, 
  Truck, DollarSign, RefreshCw, PlusCircle, AlertCircle, 
  Check, X, FileText, ArrowRight, User, ShieldAlert, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from './components/LandingPage';

// Mock receipt image path
const MOCK_RECEIPT = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=400&auto=format&fit=crop";

function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'demo'
  // Navigation tabs for the right panel
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'vendor' | 'driver' | 'escrow' | 'admin'
  const [isMobile, setIsMobile] = useState(false);

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
        // Handled individually, bypass here
        return;
      }
      messageText = `*Kurir Sedang Belanja!* \n\nDriver kami sudah tiba di pasar tradisional dan sedang memilih bahan segar terbaik sesuai daftar pesanan Ibu.`;
    } else if (current === 'AWAITING_SUBSTITUTION') {
      // Find the out of stock item
      const outOfStockItem = order.items.find(item => item.status === 'OUT_OF_STOCK' && item.custom_note.startsWith('SUB_REQ:'));
      if (outOfStockItem) {
        // Extract alternative name and price
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

    // 1. Add user message to UI
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setTextInput('');

    // 2. Fire simulated webhook call
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
        
        // Add bot reply to UI
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
        // Append user response to chat
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

  // Driver actions
  const handleClaimOrder = async (orderId) => {
    // Put driver on duty (transition order from MITRA_PREPPING to ON_DELIVERY)
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'POST', // Temporary check or complete. Actually we just PATCH status of order directly.
        headers: { 'Content-Type': 'application/json' },
        // Instead of complete, we can update order status. Let's write a simple status updater inside admin or patch item.
      });
      // In main.go, we can transition from MITRA_PREPPING to ON_DELIVERY by updating item or completing.
      // Wait, let's look at how backend handles order. We can trigger driver setup or updates.
      // Let's create an admin/driver shortcut in our frontend that updates order status via custom endpoint, or let the driver claim it.
    } catch (e) {}
  };

  // Driver transitions order status directly for demo convenience
  const updateOrderStatusDirectly = async (orderId, newStatus) => {
    // We can simulate driver assigning or packing ready
    try {
      // In main.go we didn't specify a generic patch order status endpoint except via completion/payment.
      // Let's check how we can transition. In main.go:
      // - payment -> transitions from AWAITING_PAYMENT to MITRA_PREPPING
      // - items patch OUT_OF_STOCK -> transitions to AWAITING_SUBSTITUTION
      // - substitution confirm -> transitions back to ON_DELIVERY
      // - complete -> transitions to COMPLETED.
      // Wait! How does an order go from MITRA_PREPPING to ON_DELIVERY (driver starts shopping)?
      // Let's check if the driver checklist updates automatically transition it, or if we can make a direct update.
      // Actually, when the driver PATCHES an item checklist state (e.g. FULFILLED), we can check if it transitions.
      // Wait, let's look at `updateChecklistItem` in `main.go`. It checks if status is `MITRA_PREPPING` or `ON_DELIVERY` or `AWAITING_SUBSTITUTION`.
      // It allows patching checklist in those states. Let's make sure the status changes to `ON_DELIVERY` when the driver starts checking off items, or let's create a custom quick-trigger in our admin page if we need!
      // In our `main.go`, `processSubstitutionConfirm` resets order status to `ON_DELIVERY`.
      // Let's check if we can make a direct PATCH for the order. We didn't build `PATCH /api/orders/:id` for order status, but we can easily add it or simulate it!
      // Let's see if we need a custom transition. We can just run a fetch patch or write a simple handler if needed, but we can also do it via database or standard API.
      // Let's check if we can just update database via backend. Yes, we can patch order status in backend!
      // Wait, we can implement a status transition easily.
      // Let's add a helper function in our frontend that runs a PATCH to `/api/orders/{id}`. Wait! Does `main.go` support `PATCH /api/orders/{id}`?
      // In `main.go`, `handleSingleOrder` checks:
      // - GET `/api/orders/{id}`
      // - PATCH `/api/orders/{id}/items/{item_id}`
      // - POST `/api/orders/{id}/pay`
      // - POST `/api/orders/{id}/substitute/confirm`
      // - POST `/api/orders/{id}/complete`
      // Wait! It does not have a status updater. Let's write a quick endpoint to let us update the order status directly, OR we can just let it update during checklist changes!
      // Actually, when the vendor finishes packing, they can toggle status to `ON_DELIVERY` (representing driver pick up).
      // Let's check if we want to modify `main.go` to add a transition endpoint. Yes! Let's edit `main.go` to support:
      // `POST /api/orders/{id}/status` to change order status (e.g. `MITRA_PREPPING` -> `ON_DELIVERY`).
      // That would be extremely elegant and robust! Let's check how we can do this.
      // Wait, let's check `main.go` structure.
    } catch (err) {}
  };

  // Helper formatting money
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
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="glass-panel border-b border-border py-4 px-6 sticky top-0 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center glow-green">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              Emak AI Titip <span className="text-xs bg-primary/20 text-primary-light px-2.5 py-0.5 rounded-full font-sans border border-primary/30">MVP Control Center</span>
            </h1>
            <p className="text-xs text-gray-400">Conversational Webhook & Escrow Ledger Simulation</p>
          </div>
        </div>

        {/* Navigation & Global Stats bar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView('landing')}
            className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 font-semibold py-1.5 px-3 rounded-lg border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
          >
            ← Kembali ke Beranda
          </button>
          
          <div className="hidden md:flex items-center gap-6 text-xs border-l border-border pl-6">
            <div className="text-left">
              <span className="text-gray-400 block">Total Orders</span>
              <span className="font-bold text-white text-sm">{orders.length}</span>
            </div>
            <div className="text-left">
              <span className="text-gray-400 block">Active Status</span>
              <span className="font-bold text-primary-light text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                {activeOrder ? activeOrder.status : 'None'}
              </span>
            </div>
            <div className="text-left">
              <span className="text-gray-400 block">Escrow Vault</span>
              <span className="font-bold text-accent-light text-sm">
                Rp {activeOrder && activeOrder.ledger 
                  ? formatMoney(activeOrder.ledger.reduce((acc, curr) => curr.type === 'CREDIT_PAYMENT' ? acc + curr.amount : acc - curr.amount, 0))
                  : 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto lg:overflow-hidden lg:max-h-[calc(100vh-73px)]">
        
        {/* Left Side: WhatsApp Chat Simulator (5 cols) */}
        <section className={`${activeTab === 'chat' ? 'flex' : 'hidden lg:flex'} lg:col-span-5 border-r border-border flex flex-col bg-whatsapp-bg h-[calc(100vh-73px)] w-full`}>
          {/* WA Header */}
          <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2e3b43]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-whatsapp-green to-whatsapp-dark flex items-center justify-center text-white font-bold">
                  E
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Emak AI Titip Chatbot</h3>
                <span className="text-xs text-whatsapp-green flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-whatsapp-green rounded-full animate-pulse"></span>
                  online (System Simulator)
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
              <Video className="w-4 h-4 cursor-pointer hover:text-white" />
              <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
            </div>
          </div>

          {/* Preset Script Helper Panel */}
          <div className="bg-[#182229] border-b border-[#222d34] px-4 py-3">
            <p className="text-xs text-gray-400 mb-2 font-medium">📋 Uji Coba Demo (Klik untuk Kirim Chat):</p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => runPresetScript("Beliin bumbu lodeh 2 porsi sama tempe papan satu ya")}
                className="text-xs bg-primary/15 border border-primary/30 text-primary-light py-1.5 px-3 rounded-lg hover:bg-primary/25 transition-all text-left truncate max-w-full"
              >
                🥕 Script 1: Lodeh & Tempe
              </button>
              <button 
                onClick={() => runPresetScript("Beli wortel 1 kg, kentang 2 kg, sama ayam potong 1 ekor jangan terlalu matang")}
                className="text-xs bg-secondary/15 border border-secondary/30 text-secondary-light py-1.5 px-3 rounded-lg hover:bg-secondary/25 transition-all text-left truncate max-w-full"
              >
                🍗 Script 2: Sayur & Ayam Note
              </button>
            </div>
          </div>

          {/* WA Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-95">
            <AnimatePresence initial={false}>
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] px-3.5 py-2.5 shadow-md ${msg.sender === 'user' ? 'wa-bubble-out' : 'wa-bubble-in'}`}>
                    {/* Render message with linebreaks and formatting */}
                    <div className="text-sm leading-relaxed whitespace-pre-line break-words">
                      {msg.text.split('\n').map((line, i) => {
                        let formattedLine = line;
                        // Replace markdown bold *text* with JSX <strong>text</strong>
                        const boldRegex = /\*(.*?)\*/g;
                        const italicRegex = /_(.*?)_/g;
                        
                        let elements = [];
                        let lastIdx = 0;
                        let match;
                        
                        // We do a simple replacement mapping
                        // In structured demo, formatting lines is enough:
                        // Let's do simple innerHTML or a simple text formatting for demo
                        return <p key={i} className={line === "" ? "h-2" : ""}>{line}</p>;
                      })}
                    </div>

                    {/* Simulation Interactivity links inside the Chat (e.g. checkout link) */}
                    {msg.text.includes("http://localhost:5173/checkout/") && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-2">
                        <span className="text-xs text-primary-light font-bold">💳 LINK PEMBAYARAN MOCKUP:</span>
                        {activeOrder && activeOrder.status === 'AWAITING_PAYMENT' ? (
                          <button
                            onClick={() => handleSimulatePayment(activeOrder.id)}
                            className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors shadow-md"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                            Bayar Sekarang (Rp {formatMoney(activeOrder.total_estimated + activeOrder.buffer_amount)})
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-whatsapp-green font-bold bg-[#1d352c] p-2 rounded-lg border border-whatsapp-green/20">
                            <Check className="w-4 h-4" />
                            Pesanan Telah Dibayar
                          </div>
                        )}
                      </div>
                    )}

                    {/* Interactivity for substitutions directly inside the WhatsApp Chat */}
                    {msg.text.includes("BARANG KOSONG!") && activeOrder && activeOrder.status === 'AWAITING_SUBSTITUTION' && (
                      <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-3">
                        <button
                          onClick={() => handleChatSubstitutionChoice(activeOrder.id, true)}
                          className="flex-1 bg-whatsapp-green hover:bg-emerald-400 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Setuju
                        </button>
                        <button
                          onClick={() => handleChatSubstitutionChoice(activeOrder.id, false)}
                          className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          Batal
                        </button>
                      </div>
                    )}

                    <span className="block text-[10px] text-right text-gray-400 mt-1.5">
                      {msg.timestamp}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* WA Footer Chat input */}
          <div className="bg-[#202c33] px-4 py-3 flex items-center gap-3 border-t border-[#2e3b43]">
            <input
              type="text"
              placeholder="Ketik daftar belanjaan Ibu..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="flex-1 bg-[#2a3942] border-none outline-none rounded-lg py-2.5 px-4 text-sm text-gray-200 placeholder-gray-400 focus:ring-1 focus:ring-whatsapp-green"
            />
            <button 
              onClick={() => handleSendMessage()}
              disabled={!textInput.trim()}
              className="w-10 h-10 rounded-full bg-whatsapp-green hover:bg-emerald-500 disabled:bg-[#2a3942] disabled:text-gray-500 text-white flex items-center justify-center transition-all shadow-md cursor-pointer"
            >
              <Send className="w-4 h-4 pl-0.5" />
            </button>
          </div>
        </section>

        {/* Right Side: Actuator Dashboards (7 cols) */}
        <section className={`${activeTab === 'chat' ? 'hidden' : 'flex'} lg:flex lg:col-span-7 flex flex-col h-[calc(100vh-73px)] bg-background w-full`}>
          
          {/* Tabs Navigation bar */}
          <nav className="glass-panel border-b border-border p-2 flex gap-1 bg-[#10131e]/50 overflow-x-auto">
            {/* Chat tab visible only on mobile */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`lg:hidden flex-1 py-3 px-2 sm:px-4 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'chat' ? 'bg-whatsapp-green/20 text-whatsapp-green border border-whatsapp-green/30' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'}`}
            >
              <Send className="w-4 h-4 text-whatsapp-green" />
              <span className="hidden sm:inline">CHAT</span>
            </button>
            <button
              onClick={() => setActiveTab('vendor')}
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'vendor' ? 'bg-primary text-white glow-green' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'}`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">VENDOR</span>
            </button>
            <button
              onClick={() => setActiveTab('driver')}
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'driver' ? 'bg-secondary text-white glow-blue' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'}`}
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">DRIVER</span>
            </button>
            <button
              onClick={() => setActiveTab('escrow')}
              className={`flex-1 py-3 px-2 sm:px-4 rounded-xl font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'escrow' ? 'bg-accent text-white glow-violet' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'}`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">LEDGER</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-3 rounded-xl font-semibold text-xs flex items-center justify-center transition-all ${activeTab === 'admin' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2e]/40'}`}
              title="Admin & Debug panel"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </nav>

          {/* Active Order Selector Dropdown */}
          <div className="bg-[#121520] border-b border-border px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Order Terpilih:</span>
              <select
                value={activeOrderId || ''}
                onChange={(e) => setActiveOrderId(e.target.value)}
                className="bg-[#1a1e2e] border border-border text-white rounded-lg py-1 px-3.5 focus:outline-none focus:border-primary font-bold text-xs"
              >
                {orders.length === 0 ? (
                  <option value="">-- Belum ada order --</option>
                ) : (
                  orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} ({o.status})</option>
                  ))
                )}
              </select>
            </div>
            
            {activeOrder && (
              <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border ${
                activeOrder.status === 'AWAITING_PAYMENT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' :
                activeOrder.status === 'MITRA_PREPPING' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                activeOrder.status === 'ON_DELIVERY' ? 'bg-blue-500/10 text-sky-400 border-blue-500/20' :
                activeOrder.status === 'AWAITING_SUBSTITUTION' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                activeOrder.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                'bg-gray-500/10 text-gray-400 border-gray-500/20'
              }`}>
                {activeOrder.status}
              </span>
            )}
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* NO ACTIVE ORDER FALLBACK */}
            {!activeOrder && activeTab !== 'admin' && (
              <div className="h-64 flex flex-col items-center justify-center text-center gap-3">
                <AlertCircle className="w-12 h-12 text-gray-500 animate-bounce" />
                <div>
                  <h4 className="text-gray-400 font-semibold">Tidak Ada Order Aktif</h4>
                  <p className="text-xs text-gray-500 mt-1">Gunakan WhatsApp Simulator di kiri untuk membuat pesanan baru terlebih dahulu.</p>
                </div>
              </div>
            )}

            {/* TAB 1: MITRA PASAR (VENDOR) */}
            {activeTab === 'vendor' && activeOrder && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Vendor Card Detail */}
                <div className="glass-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-xs text-primary-light font-bold uppercase tracking-wider">Order Packing Checklist</span>
                      <h3 className="text-lg font-bold font-display text-white mt-1">Stall Mitra Pasar: Pasar Traditional Jaya</h3>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-primary/30" />
                  </div>
                  
                  {/* Order items lists */}
                  <div className="divide-y divide-border/60">
                    {activeOrder.items && activeOrder.items.map((item) => (
                      <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            item.category === 'Bumbu' ? 'bg-amber-500/10 text-amber-400' :
                            item.category === 'Sayuran' ? 'bg-emerald-500/10 text-emerald-400' :
                            item.category === 'Daging' ? 'bg-red-500/10 text-red-400' :
                            'bg-blue-500/10 text-sky-400'
                          }`}>
                            {item.name[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white text-sm block">{item.name}</span>
                            <span className="text-[11px] text-gray-400">{item.category} • {item.quantity} {item.unit}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {item.custom_note && (
                            <span className="text-[10px] bg-[#1d1b26] text-accent-light px-2 py-1 rounded border border-accent/20 max-w-[150px] truncate">
                              Note: {item.custom_note}
                            </span>
                          )}
                          <span className="text-xs font-bold text-gray-300">Est. Rp {formatMoney(item.estimated_price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vendor Action Buttons */}
                  <div className="mt-6 pt-6 border-t border-border flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Status Orderan Saat Ini:</p>
                      <p className="text-sm font-semibold text-white uppercase mt-0.5">{activeOrder.status}</p>
                    </div>

                    {activeOrder.status === 'MITRA_PREPPING' ? (
                      <button
                        onClick={async () => {
                          // Vendor marks packing done, transitions to ON_DELIVERY (driver starts picking up)
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
                        className="bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg glow-green"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Selesai Packing & Serahkan Kurir
                      </button>
                    ) : (
                      <div className="text-xs text-gray-500 bg-[#141722] p-2.5 rounded-lg border border-border">
                        {activeOrder.status === 'AWAITING_PAYMENT' 
                          ? 'Menunggu pembayaran belanjaan dari Pengguna...' 
                          : 'Orderan telah diteruskan ke Driver untuk proses belanja & pengiriman.'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 2: DRIVER CONCIERGE */}
            {activeTab === 'driver' && activeOrder && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* Smartphone Device Frame Mockup (Render natively on mobile screens) */}
                <div className="w-full lg:max-w-[420px] lg:mx-auto lg:bg-[#07090e] lg:rounded-[40px] lg:border-8 lg:border-gray-800 lg:p-4 lg:shadow-2xl lg:relative lg:overflow-hidden">
                  {/* Notch */}
                  <div className="hidden lg:block absolute top-4 left-1/2 -translate-x-1/2 w-32 h-5 bg-gray-800 rounded-full z-20"></div>

                  <div className="bg-card min-h-[500px] lg:rounded-[30px] p-4 flex flex-col justify-between text-xs overflow-y-auto">
                    
                    {/* Phone Header */}
                    <div className="flex justify-between items-center pb-3 border-b border-border/60 pt-4">
                      <div>
                        <span className="text-[10px] text-secondary-light font-bold">DRIVER APP</span>
                        <h4 className="font-bold text-white text-sm">Delivery ID: {activeOrder.id.substring(4)}</h4>
                      </div>
                      <Truck className="w-5 h-5 text-secondary-light" />
                    </div>

                    {/* Phone Body */}
                    <div className="flex-1 py-4 space-y-4">
                      
                      {/* Driver Checklist Container */}
                      {activeOrder.status === 'MITRA_PREPPING' || activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'AWAITING_SUBSTITUTION' ? (
                        <div className="space-y-3">
                          <p className="text-gray-400 font-semibold mb-1">📋 Checklist Belanja Pasar:</p>
                          
                          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                            {activeOrder.items && activeOrder.items.map((item) => {
                              const isFulfilled = item.status === 'FULFILLED' || item.status === 'SUBSTITUTED';
                              const isOOS = item.status === 'OUT_OF_STOCK';
                              
                              return (
                                <div key={item.id} className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                                  isFulfilled ? 'bg-primary/5 border-primary/20 opacity-80' :
                                  isOOS ? 'bg-red-500/5 border-red-500/20 opacity-60' :
                                  'bg-[#191d2c] border-border'
                                }`}>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={async () => {
                                        // Toggle item checked (FULFILLED)
                                        try {
                                          const nextStatus = item.status === 'FULFILLED' ? 'PENDING' : 'FULFILLED';
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
                                    {/* Price and Out of Stock actuators */}
                                    {!isFulfilled && !isOOS && (
                                      <div className="flex gap-1">
                                        {/* Trigger Out of Stock substitution flow */}
                                        <button
                                          onClick={async () => {
                                            // Suggest substitution (e.g. Tempe Papan -> Tempe Daun)
                                            let altName = "";
                                            let altPrice = 0;
                                            
                                            if (item.name.toLowerCase().includes("tempe")) {
                                              altName = "tempe daun";
                                              altPrice = 5000;
                                            } else {
                                              altName = `${item.name} premium`;
                                              altPrice = Math.round(item.estimated_price * 1.25);
                                            }

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
                                      </div>
                                    )}

                                    {/* Display Price Info */}
                                    <div className="text-right">
                                      <span className="text-[10px] font-bold block text-gray-200">
                                        Rp {isFulfilled ? formatMoney(item.actual_price) : formatMoney(item.estimated_price)}
                                      </span>
                                      <span className="text-[8px] text-gray-400 uppercase">
                                        {isFulfilled ? 'Aktual' : 'Estimasi'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : activeOrder.status === 'COMPLETED' ? (
                        <div className="text-center py-8 space-y-3">
                          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
                          <div>
                            <h5 className="font-bold text-white text-sm">Pengiriman Selesai!</h5>
                            <p className="text-xs text-gray-400 mt-1">Uang belanja telah diselesaikan melalui escrow ledger.</p>
                          </div>
                          <div className="bg-[#191d2c] border border-border p-3 rounded-2xl max-w-[280px] mx-auto text-left space-y-1 mt-4">
                            <span className="text-[10px] text-gray-400 block">Daftar Payout Ledger:</span>
                            <p className="text-white">Vendor: <span className="font-semibold text-primary-light">Rp {formatMoney(activeOrder.total_actual)}</span></p>
                            <p className="text-white">Driver Fee: <span className="font-semibold text-secondary-light">Rp 10.000</span></p>
                            <p className="text-white">Refund User: <span className="font-semibold text-accent-light">Rp {formatMoney(activeOrder.refund_amount)}</span></p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          Menunggu order dibayar oleh pengguna sebelum daftar belanja dirilis ke driver.
                        </div>
                      )}

                      {/* Receipt upload placeholder when active shopping is done */}
                      {(activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'MITRA_PREPPING') && 
                       activeOrder.items && activeOrder.items.every(item => item.status !== 'PENDING') && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#10141f] border border-border p-3 rounded-2xl space-y-2"
                        >
                          <span className="text-[10px] font-bold text-secondary-light block">📄 UPLOAD NOTA PASAR:</span>
                          <div className="border border-dashed border-border/80 rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 bg-[#191d2c]/40 hover:bg-[#191d2c]/80 transition-colors cursor-pointer">
                            <FileText className="w-6 h-6 text-gray-500" />
                            <span className="text-[10px] text-gray-400">Nota_Belanja_Pasar.jpg</span>
                            <span className="text-[8px] text-gray-500">(Disimulasikan otomatis dengan URL mockup)</span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Phone Footer Action Buttons */}
                    <div className="pt-3 border-t border-border/60">
                      {activeOrder.status === 'MITRA_PREPPING' && (
                        <button
                          onClick={async () => {
                            // Driver claims order and departs (changes status to ON_DELIVERY)
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
                          className="w-full bg-secondary hover:bg-sky-400 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg glow-blue"
                        >
                          <Truck className="w-4 h-4" />
                          Mulai Belanja (Kurir Berangkat)
                        </button>
                      )}

                      {(activeOrder.status === 'ON_DELIVERY' || activeOrder.status === 'MITRA_PREPPING') && 
                       activeOrder.items && activeOrder.items.every(item => item.status !== 'PENDING') && (
                        <button
                          onClick={async () => {
                            // Complete order and settle Escrow
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
                          className="w-full bg-primary hover:bg-primary-light text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg glow-green"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Selesai & Settle Escrow Payout
                        </button>
                      )}

                      {activeOrder.status === 'AWAITING_SUBSTITUTION' && (
                        <div className="bg-amber-500/10 text-amber-400 p-2.5 rounded-xl border border-amber-500/20 text-center animate-pulse-soft">
                          ⏳ Menunggu persetujuan substitusi barang dari Pengguna (WhatsApp)...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 3: ESCROW & SETTLEMENT LEDGER */}
            {activeTab === 'escrow' && activeOrder && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 animate-fade-in"
              >
                {/* Financial Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Escrow Balance */}
                  <div className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between h-28">
                    <span className="text-xs text-gray-400 font-medium">Escrow Balance (Held)</span>
                    <div>
                      <h4 className="text-2xl font-bold font-display text-white mt-1">
                        Rp {activeOrder.ledger 
                          ? formatMoney(activeOrder.ledger.reduce((acc, curr) => curr.type === 'CREDIT_PAYMENT' ? acc + curr.amount : acc - curr.amount, 0))
                          : 0}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1">Held in multi-sig custody</p>
                    </div>
                  </div>

                  {/* Estimated Cost vs Actual Cost */}
                  <div className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between h-28">
                    <span className="text-xs text-gray-400 font-medium">Belanja Real-time</span>
                    <div>
                      <h4 className="text-2xl font-bold font-display text-primary-light mt-1">
                        Rp {formatMoney(activeOrder.total_actual || activeOrder.items.reduce((acc, curr) => curr.status === 'FULFILLED' ? acc + curr.actual_price : acc, 0))}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1">Original Est: Rp {formatMoney(activeOrder.total_estimated)}</p>
                    </div>
                  </div>

                  {/* Calculated Refund */}
                  <div className="glass-card rounded-2xl p-5 border border-border flex flex-col justify-between h-28">
                    <span className="text-xs text-gray-400 font-medium">Refund Ke Ibu (Kembalian)</span>
                    <div>
                      <h4 className="text-2xl font-bold font-display text-accent-light mt-1">
                        Rp {formatMoney(activeOrder.refund_amount)}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-1">Buffer 15%: Rp {formatMoney(activeOrder.buffer_amount)}</p>
                    </div>
                  </div>
                </div>

                {/* SAGA Ledger Transaction Log */}
                <div className="glass-card rounded-2xl p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-md font-bold font-display text-white">Distributed Escrow Mutasi Ledger</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Simulasi pencatatan pembukuan blockchain/Saga Ledger</p>
                    </div>
                    <Award className="w-5 h-5 text-accent-light opacity-55" />
                  </div>

                  {/* Ledger entries list */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border/80 text-gray-400 uppercase tracking-wider text-[9px] font-bold">
                          <th className="py-2.5">Ledger ID</th>
                          <th className="py-2.5">Tipe Transaksi</th>
                          <th className="py-2.5">Deskripsi Mutasi</th>
                          <th className="py-2.5 text-right">Nilai Rupiah</th>
                          <th className="py-2.5 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {activeOrder.ledger && activeOrder.ledger.length > 0 ? (
                          activeOrder.ledger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-[#1a1e2e]/20 transition-colors">
                              <td className="py-3.5 font-mono text-gray-400">{entry.id}</td>
                              <td className="py-3.5">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                                  entry.type === 'CREDIT_PAYMENT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  entry.type === 'DEBIT_REFUND' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                  entry.type === 'DEBIT_DRIVER_FEE' ? 'bg-blue-500/10 text-sky-400 border-blue-500/20' :
                                  'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                  {entry.type}
                                </span>
                              </td>
                              <td className="py-3.5 text-gray-300">{entry.description}</td>
                              <td className={`py-3.5 text-right font-bold ${entry.type === 'CREDIT_PAYMENT' ? 'text-emerald-400' : 'text-gray-300'}`}>
                                {entry.type === 'CREDIT_PAYMENT' ? '+' : '-'} Rp {formatMoney(entry.amount)}
                              </td>
                              <td className="py-3.5 text-right text-gray-500">{formatDate(entry.created_at)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="py-8 text-center text-gray-500">
                              Belum ada transaksi terekam di ledger untuk order ini. Lakukan pembayaran atau selesaikan belanja.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SAGA Architecture Flow visualization */}
                <div className="glass-card rounded-2xl p-5 border border-border space-y-3 bg-[#10131e]/50">
                  <h4 className="text-xs font-bold text-gray-400 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-accent-light" />
                    PRAGMATIC SAGAS & SETTLEMENT PIPELINE:
                  </h4>
                  <div className="grid grid-cols-5 gap-2 text-center text-[10px] text-gray-400">
                    <div className="bg-card border border-border p-2 rounded-xl">
                      <span className="block font-bold text-white mb-1">1. Escrow Lock</span>
                      Customer pays Est + 15% Buffer
                    </div>
                    <div className="flex items-center justify-center"><ArrowRight className="w-4 h-4 text-gray-600" /></div>
                    <div className="bg-card border border-border p-2 rounded-xl">
                      <span className="block font-bold text-white mb-1">2. Audit Items</span>
                      Driver checks off final prices & upload receipt
                    </div>
                    <div className="flex items-center justify-center"><ArrowRight className="w-4 h-4 text-gray-600" /></div>
                    <div className="bg-card border border-border p-2 rounded-xl">
                      <span className="block font-bold text-white mb-1">3. Split Payout</span>
                      Atomic debit ledger write: Refund + Courier + Vendor
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 4: ADMIN & DEBUG PANEL */}
            {activeTab === 'admin' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="glass-card rounded-2xl p-6 border border-border space-y-6">
                  <div>
                    <h3 className="text-md font-bold font-display text-white">Presenter Admin Control</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Gunakan panel ini untuk mengelola state demonstrasi secara cepat.</p>
                  </div>

                  {/* Seed Price dictionary listing */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-200">📚 Kamus Harga & Kamus Barang (Fuzzy Match Target):</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {dictionary.map(dict => (
                        <div key={dict.id} className="bg-[#191d2c] border border-border p-2 rounded-xl text-[10px]">
                          <span className="font-bold text-white block truncate">{dict.name}</span>
                          <span className="text-gray-400 block">{dict.category}</span>
                          <span className="text-primary-light font-bold mt-1 block">Rp {formatMoney(dict.estimated_price)} / {dict.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Order controls */}
                  <div className="pt-4 border-t border-border space-y-4">
                    <h4 className="text-xs font-bold text-gray-200">⚙️ Aksi Cepat Database & State:</h4>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={async () => {
                          // Trigger custom mock order transition to ON_DELIVERY (driver depart)
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
                        className="bg-secondary/25 hover:bg-secondary/40 text-secondary-light border border-secondary/30 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Ubah Status Terpilih Jadi: ON_DELIVERY
                      </button>

                      <button
                        onClick={async () => {
                          // Clear all orders in sqlite and reset WA chat simulator
                          if (!confirm("Reset database order?")) return;
                          
                          // We will add a /api/debug/reset endpoint to main.go next, 
                          // which deletes orders and logs from sqlite database.
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
                            }
                          } catch (e) {
                            alert("Reset failed: write endpoint first");
                          }
                        }}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset Database & Chat
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Bottom helper footer */}
          <footer className="glass-panel border-t border-border py-3 px-6 text-center text-[10px] text-gray-500 bg-[#0e111a]/80">
            Emak AI Jastip MVP Prototype • Built with Go, SQLite, React, Tailwind & Framer Motion
          </footer>
        </section>

      </main>
    </div>
  );
}

export default App;
