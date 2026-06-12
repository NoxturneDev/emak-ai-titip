import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Sparkles, ShieldCheck, ArrowRight, MessageSquare, 
  DollarSign, CheckCircle2, Truck, Menu, X, ChevronRight, 
  RefreshCw, TrendingUp, UserCheck, Coins, Database, Code, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage({ onLaunchDemo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDemoText, setSelectedDemoText] = useState(null);
  const [typingText, setTypingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Halo Ibu! Selamat datang di *Emak AI Titip*. \nTulis daftar belanjaan Ibu di sini ya, nanti AI kami akan bantu mengelompokkan barang dan menghitung perkiraan harganya. \n\n*Contoh:* \n_Beliin tempe 1 papan, bayam 2 ikat sama wortel setengah kg ya_",
      timestamp: '09:00'
    }
  ]);
  const [parsedData, setParsedData] = useState(null);

  // Predefined mockup queries and their corresponding AI parses
  const demoQueries = [
    {
      label: "Belanja Sayur Lodeh",
      input: "Beli tempe 1 papan, bayam 2 ikat, sama wortel 1/2 kg",
      reply: `Halo Ibu! Berikut daftar belanjaan yang berhasil dideteksi:

🟢 *Tempe Papan* - 1 Pcs (Rp 6.000)
🟢 *Bayam* - 2 Ikat (Rp 6.000)
🟢 *Wortel* - 0.5 Kg (Rp 9.000)

*Estimasi Belanja:* Rp 21.000
*Buffer Escrow (+15%):* Rp 3.150
*Ongkir Flat Kurir:* Rp 10.000

*Total Transfer:* *Rp 34.150*

Silakan klik link berikut untuk melanjutkan pembayaran Escrow: https://pay.emak-ai.id/checkout_demo`,
      json: {
        status: "success",
        parsed_items: [
          { name: "Tempe Papan", quantity: 1, unit: "Pcs", est_price: 6000 },
          { name: "Bayam", quantity: 2, unit: "Ikat", est_price: 6000 },
          { name: "Wortel", quantity: 0.5, unit: "Kg", est_price: 9000 }
        ],
        financials: {
          estimated_total: 21000,
          escrow_buffer: 3150,
          delivery_fee: 10000,
          total_transfer: 34150
        }
      }
    },
    {
      label: "Belanja Sup Ayam",
      input: "Tolong beliin ayam potong 1kg, bumbu racik sop 1, kentang 3 biji",
      reply: `Halo Ibu! Berikut daftar belanjaan yang berhasil dideteksi:

🟢 *Ayam Potong* - 1 Kg (Rp 38.000)
🟢 *Bumbu Sop Racik* - 1 Pcs (Rp 2.000)
🟢 *Kentang* - 3 Pcs (Rp 7.500)

*Estimasi Belanja:* Rp 47.500
*Buffer Escrow (+15%):* Rp 7.125
*Ongkir Flat Kurir:* Rp 10.000

*Total Transfer:* *Rp 64.625*

Silakan klik link berikut untuk melanjutkan pembayaran Escrow: https://pay.emak-ai.id/checkout_demo`,
      json: {
        status: "success",
        parsed_items: [
          { name: "Ayam Potong", quantity: 1, unit: "Kg", est_price: 38000 },
          { name: "Bumbu Sop Racik", quantity: 1, unit: "Pcs", est_price: 2000 },
          { name: "Kentang", quantity: 3, unit: "Pcs", est_price: 7500 }
        ],
        financials: {
          estimated_total: 47500,
          escrow_buffer: 7125,
          delivery_fee: 10000,
          total_transfer: 64625
        }
      }
    },
    {
      label: "Belanja Santan Gula Merah",
      input: "Minta tolong beliin kelapa parut 1 butir, gula merah 250gr",
      reply: `Halo Ibu! Berikut daftar belanjaan yang berhasil dideteksi:

🟢 *Kelapa Parut* - 1 Butir (Rp 10.000)
🟢 *Gula Merah* - 250 Gr (Rp 6.500)

*Estimasi Belanja:* Rp 16.500
*Buffer Escrow (+15%):* Rp 2.475
*Ongkir Flat Kurir:* Rp 10.000

*Total Transfer:* *Rp 28.975*

Silakan klik link berikut untuk melanjutkan pembayaran Escrow: https://pay.emak-ai.id/checkout_demo`,
      json: {
        status: "success",
        parsed_items: [
          { name: "Kelapa Parut", quantity: 1, unit: "Butir", est_price: 10000 },
          { name: "Gula Merah", quantity: 250, unit: "Gr", est_price: 6500 }
        ],
        financials: {
          estimated_total: 16500,
          escrow_buffer: 2475,
          delivery_fee: 10000,
          total_transfer: 28975
        }
      }
    }
  ];

  const triggerDemo = (demoItem) => {
    if (isTyping) return;
    setSelectedDemoText(demoItem);
    setTypingText('');
    setParsedData(null);
    setIsTyping(true);

    // Filter out previous mock user/bot messages so we keep the layout clean
    setChatHistory([chatHistory[0]]);

    // Simulate typing
    let index = 0;
    const interval = setInterval(() => {
      if (index < demoItem.input.length) {
        setTypingText(prev => prev + demoItem.input.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        
        // Add user message to history
        setTimeout(() => {
          setChatHistory(prev => [
            ...prev,
            {
              id: `user_${Date.now()}`,
              sender: 'user',
              text: demoItem.input,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
          setTypingText('');
          
          // Trigger Bot response simulation
          setTimeout(() => {
            setChatHistory(prev => [
              ...prev,
              {
                id: `bot_${Date.now()}`,
                sender: 'bot',
                text: demoItem.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setParsedData(demoItem.json);
            setIsTyping(false);
          }, 800);

        }, 300);
      }
    }, 30);
  };

  // Auto trigger the first demo on mount to show users how it works
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerDemo(demoQueries[0]);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden bg-[#0d0f14]">
      {/* Background Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full bg-violet-500/5 blur-[150px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                Emak AI Titip
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 rounded-full">
                MVP Demo
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#fitur" className="text-sm text-slate-400 hover:text-white transition-colors">Fitur Utama</a>
            <a href="#cara-kerja" className="text-sm text-slate-400 hover:text-white transition-colors">Cara Kerja</a>
            <a href="#escrow" className="text-sm text-slate-400 hover:text-white transition-colors">Keamanan Escrow</a>
            <a href="#arsitektur" className="text-sm text-slate-400 hover:text-white transition-colors">Arsitektur</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLaunchDemo}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Mulai Demo Interaktif
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-[#0d0f14]/95 backdrop-blur-xl px-4 py-6"
            >
              <div className="flex flex-col gap-4">
                <a 
                  href="#fitur" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-300 hover:text-white text-base py-2"
                >
                  Fitur Utama
                </a>
                <a 
                  href="#cara-kerja" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-300 hover:text-white text-base py-2"
                >
                  Cara Kerja
                </a>
                <a 
                  href="#escrow" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-300 hover:text-white text-base py-2"
                >
                  Keamanan Escrow
                </a>
                <a 
                  href="#arsitektur" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-300 hover:text-white text-base py-2"
                >
                  Arsitektur
                </a>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchDemo();
                  }}
                  className="w-full mt-4 py-3 rounded-xl text-center font-semibold bg-gradient-to-r from-emerald-600 to-sky-600 text-white flex items-center justify-center gap-2"
                >
                  Mulai Demo Interaktif
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Copywriter content */}
            <div className="lg:col-span-6 flex flex-col text-center lg:text-left items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Teknologi Jastip Tradisional Berbasis AI</span>
              </div>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight mb-6">
                Jastip Pasar Rakyat,<br />
                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-sky-400 bg-clip-text text-transparent">
                  Cukup Chat WhatsApp
                </span>
              </h1>
              <p className="text-slate-400 text-lg sm:text-xl font-normal leading-relaxed max-w-xl mb-8">
                Tulis atau kirim voice note daftar belanjaan secara bebas. AI kami mendeteksi item, mencocokkan harga pasar secara real-time, mengamankan dana dengan Escrow, dan memandu kurir memproses pesanan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={onLaunchDemo}
                  className="px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Coba Demo Simulator
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#cara-kerja"
                  className="px-8 py-4 rounded-2xl text-base font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  Bagaimana Ini Bekerja
                </a>
              </div>

              {/* Quick Tech Specs */}
              <div className="mt-12 pt-8 border-t border-white/5 w-full grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-bold font-display text-white">Go + SQLite</div>
                  <div className="text-xs text-slate-500">Backend Ultra Ringan</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-white">Natural NLP</div>
                  <div className="text-xs text-slate-500">Structured Parsing</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-white">&lt; 1 Detik</div>
                  <div className="text-xs text-slate-500">Sinkronisasi Keadaan</div>
                </div>
              </div>
            </div>

            {/* Interactive Visual Mockup Box */}
            <div className="lg:col-span-6 w-full max-w-2xl mx-auto lg:max-w-none">
              <div className="relative">
                {/* Visual Backdrop Decorative Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500 to-sky-500 opacity-20 blur-lg" />
                
                {/* Main Glass Box */}
                <div className="relative glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                  {/* Top Bar Control */}
                  <div className="bg-[#141722]/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                      <span className="text-xs text-slate-500 font-mono ml-2">SIMULATOR_BOT_PARSER.EXE</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">LIVE</span>
                    </div>
                  </div>

                  {/* Simulator Tabs/Controllers */}
                  <div className="bg-[#0f121d] border-b border-white/5 px-4 py-2.5 flex flex-wrap gap-2 items-center justify-between">
                    <span className="text-xs text-slate-400 font-semibold">Pilih Contoh Belanja:</span>
                    <div className="flex gap-1.5">
                      {demoQueries.map((item, idx) => (
                        <button
                          key={idx}
                          disabled={isTyping}
                          onClick={() => triggerDemo(item)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                            selectedDemoText?.label === item.label
                              ? 'bg-emerald-500/25 border-emerald-500 text-emerald-300'
                              : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dual Grid Layout: WhatsApp Chat (left) vs Parser JSON Output (right) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 min-h-[360px] md:h-[400px]">
                    
                    {/* Left: Chat Pane */}
                    <div className="md:col-span-7 bg-[#0b141a] flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
                      {/* Chat Messages */}
                      <div className="p-4 flex-1 overflow-y-auto space-y-3 flex flex-col justify-end text-xs max-h-[320px]">
                        {chatHistory.map((msg) => (
                          <div 
                            key={msg.id}
                            className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}
                          >
                            <div className={`p-2.5 rounded-lg whitespace-pre-line ${
                              msg.sender === 'user' 
                                ? 'wa-bubble-out text-slate-100 font-medium' 
                                : 'wa-bubble-in text-slate-200'
                            }`}>
                              {msg.text}
                            </div>
                            <span className={`text-[9px] text-slate-500 mt-1 ${msg.sender === 'user' ? 'self-end' : 'self-start'}`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        ))}

                        {/* Animated typing feedback */}
                        {isTyping && typingText && (
                          <div className="flex flex-col max-w-[85%] self-end">
                            <div className="p-2.5 rounded-lg wa-bubble-out text-slate-100 font-medium break-all">
                              {typingText}
                              <span className="w-1.5 h-3 bg-white inline-block animate-pulse-soft ml-0.5" />
                            </div>
                          </div>
                        )}

                        {isTyping && !typingText && (
                          <div className="flex flex-col max-w-[80%] self-start">
                            <div className="p-2.5 rounded-lg wa-bubble-in text-slate-400 italic flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                              AI sedang menganalisis teks...
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Fake Input */}
                      <div className="p-3 bg-[#1f2c34] flex items-center gap-2">
                        <div className="flex-1 bg-[#2a3942] rounded-lg px-3 py-1.5 text-xs text-slate-400 truncate">
                          {typingText || "Ketik daftar belanjaan di sini..."}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    {/* Right: JSON Parser Terminal */}
                    <div className="md:col-span-5 bg-[#0a0d13] p-4 flex flex-col text-xs font-mono relative overflow-hidden">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-semibold border-b border-white/5 pb-2 mb-3">
                        <Code className="w-3.5 h-3.5 text-sky-400" />
                        <span>Parser Structured JSON</span>
                      </div>
                      
                      <div className="flex-1 overflow-auto text-sky-300 scrollbar-thin">
                        {parsedData ? (
                          <pre className="leading-relaxed whitespace-pre-wrap select-all">
                            {JSON.stringify(parsedData, null, 2)}
                          </pre>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 px-4">
                            <Database className="w-8 h-8 mb-2 stroke-[1.5]" />
                            <p className="text-[11px] font-sans">
                              Silakan pilih salah satu contoh belanjaan di atas untuk melihat visualisasi data terstruktur.
                            </p>
                          </div>
                        )}
                      </div>

                      {parsedData && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-[10px] font-sans font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fuzzy-dictionary matched</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="py-20 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Fitur Utama Emak AI Titip
            </h2>
            <p className="text-slate-400 text-lg">
              Solusi modern berteknologi tinggi untuk merevolusi belanja harian di pasar tradisional Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature Card 1 */}
            <div className="glass-card p-8 rounded-2xl flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">AI NLP Parser</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                Deteksi item belanja, jumlah, dan satuan dari bahasa percakapan sehari-hari. Mendukung pencocokan otomatis dengan basis data pasar tradisional menggunakan algoritma fuzzy search.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="glass-card p-8 rounded-2xl flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Escrow Balance Secure</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                Dana ditampung sementara di rekening bersama (Escrow) beserta tambahan 15% buffer saldo belanja. Melindungi pembeli dari kecurangan dan memberikan jaminan dana untuk driver sebelum jalan.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="glass-card p-8 rounded-2xl flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Driver Check-off & Substitution</h3>
              <p className="text-slate-400 text-sm leading-relaxed flex-grow">
                Aplikasi driver menyediakan daftar centang belanja interaktif. Ketika barang kosong, sistem webhook secara otomatis menawarkan alternatif pengganti langsung ke WhatsApp pembeli secara instan.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive System Flow / Cara Kerja */}
      <section id="cara-kerja" className="py-20 border-t border-white/5 bg-[#090b0f]/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Bagaimana Alur Transaksi Bekerja?
            </h2>
            <p className="text-slate-400 text-lg">
              Siklus transaksi end-to-end yang menjamin transparansi finansial dan kemudahan komunikasi.
            </p>
          </div>

          {/* Chronological Step List */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch relative">
            
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col relative">
              <div className="absolute top-4 right-4 text-3xl font-display font-extrabold text-white/5">01</div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-white mb-2">Input Pesanan</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Pembeli mengirimkan chat WhatsApp berupa teks daftar belanjaan bebas tanpa format kaku.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col relative">
              <div className="absolute top-4 right-4 text-3xl font-display font-extrabold text-white/5">02</div>
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-white mb-2">Pembayaran Escrow</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Pembeli mentransfer estimasi total biaya ditambah 15% buffer untuk fluktuasi harga pasar ke Escrow.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col relative">
              <div className="absolute top-4 right-4 text-3xl font-display font-extrabold text-white/5">03</div>
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-white mb-2">Vendor & Driver</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Mitra menyiapkan barang dan Driver berbelanja dengan checklist digital real-time di pasar rakyat.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col relative">
              <div className="absolute top-4 right-4 text-3xl font-display font-extrabold text-white/5">04</div>
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center font-bold text-sm mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-white mb-2">Persetujuan Alternatif</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Jika barang habis, driver memicu usulan barang pengganti yang dikonfirmasi pembeli via WhatsApp.
              </p>
            </div>

            {/* Step 5 */}
            <div className="glass-card p-6 rounded-2xl flex flex-col relative">
              <div className="absolute top-4 right-4 text-3xl font-display font-extrabold text-white/5">05</div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm mb-4">
                5
              </div>
              <h4 className="text-base font-bold text-white mb-2">Pemberesan & Refund</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Driver mengunggah foto nota, dana dicairkan ke pedagang & driver, sisa saldo buffer direfund penuh.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Escrow System Security */}
      <section id="escrow" className="py-20 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Escrow Graphic */}
            <div className="lg:col-span-6 relative">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-sky-500 to-violet-500 opacity-20 blur-lg" />
              <div className="relative glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
                
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Dompet Escrow Bersama</h4>
                      <p className="text-[10px] text-slate-500">SYSTEM_ACCOUNT_SECURE</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    PROTECTED
                  </span>
                </div>

                {/* Secure Flow Simulation */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className="text-slate-400">Total Uang Ditransfer Pembeli (Termasuk Buffer 15%)</span>
                    <span className="font-mono font-bold text-white">Rp 115.000</span>
                  </div>
                  
                  <div className="flex items-center justify-center py-2">
                    <ChevronRight className="w-6 h-6 text-sky-400 rotate-90" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#141722]/60 p-3 rounded-lg border border-white/5 text-center">
                      <div className="text-[10px] text-slate-500 mb-1">Pencairan Realisasi Belanja</div>
                      <div className="font-mono font-bold text-emerald-400 text-xs">Rp 88.000</div>
                    </div>
                    <div className="bg-[#141722]/60 p-3 rounded-lg border border-white/5 text-center">
                      <div className="text-[10px] text-slate-500 mb-1">Ongkir Flat Driver</div>
                      <div className="font-mono font-bold text-sky-400 text-xs">Rp 10.000</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <ChevronRight className="w-6 h-6 text-sky-400 rotate-90" />
                  </div>

                  <div className="flex justify-between items-center text-xs bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
                    <span className="text-emerald-400 font-semibold">Otomatis Refund Sisa Uang Pembeli</span>
                    <span className="font-mono font-bold text-emerald-400">Rp 17.000</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Content info */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6 self-start">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Escrow Transaksi Transparan</span>
              </div>
              <h3 className="font-display font-bold text-3xl text-white mb-6">
                Bebas Khawatir Salah Harga & Penipuan
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-slate-200 mb-1">Deposit Aman</h5>
                    <p className="text-slate-400 text-sm">
                      Semua transaksi diawali dengan penguncian dana di Escrow Ledger. Driver tidak perlu menalangi belanjaan dengan uang pribadi, dan pembeli terbebas dari markup sepihak.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-slate-200 mb-1">Instant Refund System</h5>
                    <p className="text-slate-400 text-sm">
                      Sistem menghitung selisih realisasi belanja di pasar tradisional dengan deposit awal. Refund secara otomatis dikirim balik tanpa proses klaim manual yang melelahkan.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-base font-bold text-slate-200 mb-1">Jaminan Driver & Pedagang</h5>
                    <p className="text-slate-400 text-sm">
                      Mitra pasar tradisional mendapatkan kepastian pembayaran, sedangkan kurir mendapatkan garansi pembayaran jasa setelah mengunggah foto struk belanjaan asli.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* System Architecture Section */}
      <section id="arsitektur" className="py-20 border-t border-white/5 bg-[#090b0f]/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-4">
              Arsitektur Sistem Real-Time
            </h2>
            <p className="text-slate-400 text-lg">
              Dibangun dengan teknologi yang ringan, efisien, dan siap dikembangkan dalam skala besar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="glass-card p-6 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">SQLite Database</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Penyimpanan lokal relasional untuk menyimpan pesanan, item belanjaan detail, kamus harga pasar, dan ledger escrow secara transaksional.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Go (Golang) REST API</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Mekanisme server monolithic ultra cepat berkinerja tinggi untuk memproses payload webhook WhatsApp dan memanipulasi state machine pesanan.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">WhatsApp Webhook Mock</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Simulasi komunikasi timbal balik langsung antara backend NLP dengan dashboard simulator, menghindari latensi dan dependensi API WhatsApp eksternal.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl border border-white/5">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">React Multi-Role View</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Panel kendali terpadu yang menyajikan simulator chat, panel pedagang, centang driver, dan pembukuan escrow secara sinkron dan real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-white/5 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900/40 to-sky-950/40 border border-white/10 p-8 sm:p-12 text-center">
            
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-6">
              Siap Menjelajahi Sistem Secara Live?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Buka panel simulator untuk menyaksikan interaksi chatbot WhatsApp AI, memproses belanjaan di dashboard pedagang pasar tradisional, mencentang barang di sisi driver, hingga memantau catatan escrow.
            </p>

            <button
              onClick={onLaunchDemo}
              className="mx-auto px-8 py-4 rounded-2xl text-base font-bold bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-white/5"
            >
              Luncurkan Demo Interaktif Sekarang
              <ArrowRight className="w-5 h-5" />
            </button>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-white/5 bg-[#090b0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-base text-white">
              Emak AI Titip
            </span>
          </div>

          <div className="flex flex-wrap gap-4 justify-center text-xs text-slate-500">
            <span className="px-2 py-1 bg-white/5 rounded border border-white/5">Go 1.25</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/5">SQLite</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/5">React 19</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/5">Vite 8</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/5">Tailwind v4</span>
          </div>

          <p className="text-xs text-slate-600 font-sans">
            &copy; 2026 Emak AI Titip. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
