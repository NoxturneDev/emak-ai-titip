import React, { useState } from 'react';
import { 
  ShoppingBag, Sparkles, ShieldCheck, ArrowRight, MessageSquare, 
  DollarSign, CheckCircle2, Truck, Menu, X, ChevronRight, 
  RefreshCw, TrendingUp, UserCheck, Coins, Database, Code, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage({ onLaunchDemo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-900 flex flex-col relative overflow-hidden bg-[#f3f4f6]">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md border border-slate-200 bg-emerald-400 flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight text-slate-900">
                Emak AI Titip
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold bg-amber-300 text-slate-900 border border-slate-200 shadow-sm">
                MVP Demo
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-semibold">
            <a href="#fitur" className="text-sm text-slate-700 hover:text-slate-950 hover:underline transition-all">Fitur Utama</a>
            <a href="#cara-kerja" className="text-sm text-slate-700 hover:text-slate-950 hover:underline transition-all">Cara Kerja</a>
            <a href="#escrow" className="text-sm text-slate-700 hover:text-slate-950 hover:underline transition-all">Keamanan Rekber</a>
            <a href="#arsitektur" className="text-sm text-slate-700 hover:text-slate-950 hover:underline transition-all">Arsitektur</a>
            <button onClick={onLaunchDemo} className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline transition-all cursor-pointer">Demo Interaktif</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLaunchDemo}
              className="px-5 py-2 rounded-md text-sm font-bold bg-emerald-400 border border-slate-200 text-slate-900 shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-sm active:scale-[0.98] active:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              Mulai Demo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              className="md:hidden border-t border-slate-200 bg-white px-4 py-6"
            >
              <div className="flex flex-col gap-4 font-bold">
                <a 
                  href="#fitur" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-700 hover:text-slate-950 py-1"
                >
                  Fitur Utama
                </a>
                <a 
                  href="#cara-kerja" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-700 hover:text-slate-950 py-1"
                >
                  Cara Kerja
                </a>
                <a 
                  href="#escrow" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-700 hover:text-slate-950 py-1"
                >
                  Keamanan Rekber
                </a>
                <a 
                  href="#arsitektur" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-700 hover:text-slate-950 py-1"
                >
                  Arsitektur
                </a>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchDemo();
                  }}
                  className="w-full mt-4 py-3 rounded-md font-bold bg-emerald-400 border border-slate-200 text-slate-900 shadow-sm flex items-center justify-center gap-2"
                >
                  Mulai Demo
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-300 border border-slate-200 text-slate-900 text-xs font-extrabold mb-6 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>TEKNOLOGI JASTIP PASAR TRADISIONAL BERBASIS AI</span>
              </div>
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 leading-none mb-6">
                Jastip Pasar Rakyat,<br />
                <span className="bg-emerald-400 px-3 py-1 inline-block border border-slate-200 shadow-sm mt-2">
                  Cukup Chat WhatsApp
                </span>
              </h1>
              <p className="text-slate-700 text-base sm:text-lg font-semibold leading-relaxed max-w-xl mb-8">
                Tulis atau kirim voice note daftar belanjaan secara bebas. AI kami mendeteksi item, mencocokkan harga pasar secara real-time, mengamankan dana dengan Rekber, dan memandu kurir memproses pesanan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={onLaunchDemo}
                  className="px-8 py-4 rounded-md text-base font-black bg-emerald-400 border border-slate-200 text-slate-900 shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-sm active:scale-[0.98] active:shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  Buka Simulator Demo
                  <ArrowRight className="w-5 h-5" />
                </button>
                <a
                  href="#cara-kerja"
                  className="px-8 py-4 rounded-md text-base font-bold bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-sm active:scale-[0.98] active:shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  Bagaimana Ini Bekerja
                </a>
              </div>

              {/* Quick Tech Specs */}
              <div className="mt-12 pt-8 border-t border-slate-200 w-full grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-xl font-black font-display text-slate-900">Go + SQLite</div>
                  <div className="text-xs text-slate-600 font-bold uppercase mt-1">Backend Ringan</div>
                </div>
                <div>
                  <div className="text-xl font-black font-display text-slate-900">Natural NLP</div>
                  <div className="text-xs text-slate-600 font-bold uppercase mt-1">Structured Parse</div>
                </div>
                <div>
                  <div className="text-xl font-black font-display text-slate-900">&lt; 1 Detik</div>
                  <div className="text-xs text-slate-600 font-bold uppercase mt-1">Sinkronisasi</div>
                </div>
              </div>
            </div>

            {/* Flat Design System Flow Diagram (Replacing the old tabbed chatbot simulator) */}
            <div className="lg:col-span-6 w-full max-w-2xl mx-auto lg:max-w-none">
              <div className="glass-panel p-6 rounded-md bg-white">
                <div className="flex items-center gap-2 text-xs font-mono font-bold border-b border-slate-200 pb-3 mb-5 text-slate-700">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>EMAK_AI_ARCH_DIAGRAM.EXE</span>
                </div>
                
                {/* Visual Architecture flowchart in brutalist flat style */}
                <div className="space-y-4">
                  {/* Row 1: WhatsApp Input */}
                  <div className="border border-slate-200 p-3 bg-emerald-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span className="font-extrabold text-xs">Customer (WhatsApp Chat)</span>
                    </div>
                    <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 font-bold">1. INPUT</span>
                  </div>

                  <div className="flex justify-center py-1">
                    <ChevronRight className="w-5 h-5 text-slate-900 rotate-90" />
                  </div>

                  {/* Row 2: Go Backend NLP */}
                  <div className="border border-slate-200 p-3 bg-sky-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-sky-600" />
                      <span className="font-extrabold text-xs">Go Server & Fuzzy NLP Engine</span>
                    </div>
                    <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 font-bold">2. PROCESS</span>
                  </div>

                  <div className="flex justify-center py-1">
                    <ChevronRight className="w-5 h-5 text-slate-900 rotate-90" />
                  </div>

                  {/* Row 3: Escrow / SQLite */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-slate-200 p-3 bg-amber-100 flex flex-col justify-between shadow-sm">
                      <span className="font-extrabold text-xs block mb-1">SQLite DB</span>
                      <span className="text-[9px] text-slate-700 font-semibold font-mono">Mengunci Daftar Belanja</span>
                    </div>
                    <div className="border border-slate-200 p-3 bg-violet-100 flex flex-col justify-between shadow-sm">
                      <span className="font-extrabold text-xs block mb-1">Dompet Rekber</span>
                      <span className="text-[9px] text-slate-700 font-semibold font-mono">Mengamankan Dana Pembeli</span>
                    </div>
                  </div>

                  <div className="flex justify-center py-1">
                    <ChevronRight className="w-5 h-5 text-slate-900 rotate-90" />
                  </div>

                  {/* Row 4: Courier / Vendor Dispatch */}
                  <div className="border border-slate-200 p-3 bg-rose-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-rose-600" />
                      <span className="font-extrabold text-xs">Aplikasi Kurir (Daftar Belanja)</span>
                    </div>
                    <span className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 font-bold">3. DISPATCH</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Unified transactional pipeline</span>
                  <button onClick={onLaunchDemo} className="text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1">
                    Coba Demo
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="fitur" className="py-20 border-t border-slate-200 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 mb-4">
              Fitur Utama Emak AI Titip
            </h2>
            <p className="text-slate-600 text-base font-semibold">
              Solusi modern berteknologi tinggi untuk merevolusi belanja harian di pasar tradisional Indonesia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature Card 1 */}
            <div className="glass-card p-8 rounded-md flex flex-col h-full bg-white">
              <div className="w-12 h-12 rounded-md bg-emerald-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-6 shadow-sm">
                <Sparkles className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">AI NLP Parser</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed flex-grow">
                Deteksi item belanja, jumlah, dan satuan dari bahasa percakapan sehari-hari. Mendukung pencocokan otomatis dengan basis data pasar tradisional menggunakan algoritma fuzzy search.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="glass-card p-8 rounded-md flex flex-col h-full bg-white">
              <div className="w-12 h-12 rounded-md bg-sky-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-6 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">Keamanan Saldo Rekber</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed flex-grow">
                Dana ditampung sementara di rekening bersama (Rekber) beserta tambahan 15% buffer saldo belanja. Melindungi pembeli dari kecurangan dan memberikan jaminan dana untuk kurir sebelum jalan.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="glass-card p-8 rounded-md flex flex-col h-full bg-white">
              <div className="w-12 h-12 rounded-md bg-rose-100 border border-slate-200 flex items-center justify-center text-slate-900 mb-6 shadow-sm">
                <Truck className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-3">Daftar Centang & Penggantian Barang Kurir</h3>
              <p className="text-slate-600 text-sm font-semibold leading-relaxed flex-grow">
                Aplikasi driver menyediakan daftar centang belanja interaktif. Ketika barang kosong, sistem webhook secara otomatis menawarkan alternatif pengganti langsung ke WhatsApp pembeli secara instan.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive System Flow / Cara Kerja */}
      <section id="cara-kerja" className="py-20 border-t border-slate-200 bg-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 mb-4">
              Bagaimana Alur Transaksi Bekerja?
            </h2>
            <p className="text-slate-600 text-base font-semibold">
              Siklus transaksi end-to-end yang menjamin transparansi finansial dan kemudahan komunikasi.
            </p>
          </div>

          {/* Chronological Step List */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch relative">
            
            {/* Step 1 */}
            <div className="glass-card p-6 rounded-md flex flex-col relative bg-white">
              <div className="absolute top-4 right-4 text-3xl font-display font-black text-slate-200">01</div>
              <div className="w-10 h-10 rounded-md bg-emerald-100 border border-slate-200 text-slate-900 flex items-center justify-center font-black text-sm mb-4 shadow-sm">
                1
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">Input Pesanan</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Pembeli mengirimkan chat WhatsApp berupa teks daftar belanjaan bebas tanpa format kaku.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-md flex flex-col relative bg-white">
              <div className="absolute top-4 right-4 text-3xl font-display font-black text-slate-200">02</div>
              <div className="w-10 h-10 rounded-md bg-sky-100 border border-slate-200 text-slate-900 flex items-center justify-center font-black text-sm mb-4 shadow-sm">
                2
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">Pembayaran Rekber</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Pembeli mentransfer estimasi total biaya ditambah 15% buffer untuk fluktuasi harga pasar ke Rekber.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-md flex flex-col relative bg-white">
              <div className="absolute top-4 right-4 text-3xl font-display font-black text-slate-200">03</div>
              <div className="w-10 h-10 rounded-md bg-amber-100 border border-slate-200 text-slate-900 flex items-center justify-center font-black text-sm mb-4 shadow-sm">
                3
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">Mitra & Kurir</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Mitra menyiapkan barang dan Kurir berbelanja dengan daftar belanja digital real-time di pasar rakyat.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card p-6 rounded-md flex flex-col relative bg-white">
              <div className="absolute top-4 right-4 text-3xl font-display font-black text-slate-200">04</div>
              <div className="w-10 h-10 rounded-md bg-violet-100 border border-slate-200 text-slate-900 flex items-center justify-center font-black text-sm mb-4 shadow-sm">
                4
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">Persetujuan</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Jika barang habis, driver memicu usulan barang pengganti yang dikonfirmasi pembeli via WhatsApp.
              </p>
            </div>

            {/* Step 5 */}
            <div className="glass-card p-6 rounded-md flex flex-col relative bg-white">
              <div className="absolute top-4 right-4 text-3xl font-display font-black text-slate-200">05</div>
              <div className="w-10 h-10 rounded-md bg-emerald-100 border border-slate-200 text-slate-900 flex items-center justify-center font-black text-sm mb-4 shadow-sm">
                5
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">Pemberesan</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Driver mengunggah foto nota, dana dicairkan ke pedagang & driver, sisa saldo buffer direfund penuh.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Escrow System Security */}
      <section id="escrow" className="py-20 border-t border-slate-200 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Visual Escrow Graphic */}
            <div className="lg:col-span-6 relative">
              <div className="relative glass-panel rounded-md p-6 bg-white">
                
                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-sky-100 border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm">
                      <Coins className="w-5 h-5 text-sky-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">Dompet Rekber Bersama</h4>
                      <p className="text-[10px] text-slate-500 font-mono font-bold">SYSTEM_ACCOUNT_SECURE</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-400 border border-slate-200 shadow-sm">
                    TERLINDUNGI
                  </span>
                </div>

                {/* Secure Flow Simulation */}
                <div className="space-y-4 font-semibold text-xs">
                  <div className="flex justify-between items-center bg-slate-100 p-3 rounded-md border border-slate-200 shadow-sm">
                    <span className="text-slate-700">Total Uang Pembeli (Termasuk Buffer 15%)</span>
                    <span className="font-mono font-black text-slate-900">Rp 115.000</span>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-slate-900 rotate-90" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-md border border-slate-200 text-center shadow-sm">
                      <div className="text-[10px] text-slate-500 mb-1">Realisasi Belanja</div>
                      <div className="font-mono font-black text-emerald-600 text-xs">Rp 88.000</div>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-slate-200 text-center shadow-sm">
                      <div className="text-[10px] text-slate-500 mb-1">Ongkir Flat Driver</div>
                      <div className="font-mono font-black text-sky-600 text-xs">Rp 10.000</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 text-slate-900 rotate-90" />
                  </div>

                  <div className="flex justify-between items-center bg-emerald-100 p-3 rounded-md border border-slate-200 shadow-sm">
                    <span className="text-emerald-700 font-bold">Otomatis Refund Sisa Uang Pembeli</span>
                    <span className="font-mono font-black text-emerald-700">Rp 17.000</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Content info */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-100 border border-slate-200 text-slate-900 text-xs font-extrabold mb-6 self-start shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>REKBER TRANSAKSI TRANSPARAN</span>
              </div>
              <h3 className="font-display font-black text-3xl text-slate-900 mb-6">
                Bebas Khawatir Salah Harga & Penipuan
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-md bg-sky-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0 shadow-sm">
                    <DollarSign className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900 mb-1">Deposit Aman</h5>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                      Semua transaksi diawali dengan penguncian dana di Rekber. Kurir tidak perlu menalangi belanjaan dengan uang pribadi, dan pembeli terbebas dari markup sepihak.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-md bg-sky-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0 shadow-sm">
                    <RefreshCw className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900 mb-1">Sistem Pengembalian Dana Instan</h5>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                      Sistem menghitung selisih realisasi belanja di pasar tradisional dengan deposit awal. Refund secara otomatis dikirim balik tanpa proses klaim manual yang melelahkan.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-md bg-sky-100 border border-slate-200 flex items-center justify-center text-slate-900 shrink-0 shadow-sm">
                    <TrendingUp className="w-4 h-4 text-sky-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-slate-900 mb-1">Jaminan Driver & Pedagang</h5>
                    <p className="text-slate-600 text-xs font-semibold leading-relaxed">
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
      <section id="arsitektur" className="py-20 border-t border-slate-200 bg-slate-100 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 mb-4">
              Arsitektur Sistem Real-Time
            </h2>
            <p className="text-slate-600 text-base font-semibold">
              Dibangun dengan teknologi yang ringan, efisien, dan siap dikembangkan dalam skala besar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="glass-card p-6 rounded-md bg-white">
              <div className="w-10 h-10 rounded-md bg-emerald-100 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">SQLite Database</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Penyimpanan lokal relasional untuk menyimpan pesanan, item belanjaan detail, kamus harga pasar, dan buku kas Rekber secara transaksional.
              </p>
            </div>

            <div className="glass-card p-6 rounded-md bg-white">
              <div className="w-10 h-10 rounded-md bg-sky-100 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <Zap className="w-5 h-5 text-sky-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">Go (Golang) REST API</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Mekanisme server monolithic ultra cepat berkinerja tinggi untuk memproses payload webhook WhatsApp dan memanipulasi state machine pesanan.
              </p>
            </div>

            <div className="glass-card p-6 rounded-md bg-white">
              <div className="w-10 h-10 rounded-md bg-violet-100 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare className="w-5 h-5 text-violet-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">WhatsApp Webhook Mock</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Simulasi komunikasi timbal balik langsung antara backend NLP dengan dashboard simulator, menghindari latensi dan dependensi API WhatsApp eksternal.
              </p>
            </div>

            <div className="glass-card p-6 rounded-md bg-white">
              <div className="w-10 h-10 rounded-md bg-emerald-100 border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h4 className="text-sm font-black text-slate-900 mb-2">Tampilan Multi-Peran React</h4>
              <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                Panel kendali terpadu yang menyajikan simulator chat, panel pedagang, centang kurir, dan pembukuan Rekber secara sinkron dan real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-slate-200 relative bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-md bg-amber-300 border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 mb-6">
              Siap Menjelajahi Sistem Secara Live?
            </h2>
            <p className="text-slate-800 text-sm sm:text-base font-bold max-w-2xl mx-auto mb-8 leading-relaxed">
              Buka panel simulator untuk menyaksikan interaksi chatbot WhatsApp AI, memproses belanjaan di dashboard pedagang pasar tradisional, mencentang barang di sisi kurir, hingga memantau catatan Rekber.
            </p>

            <button
              onClick={onLaunchDemo}
              className="mx-auto px-8 py-4 rounded-md text-base font-black bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] hover:shadow-sm active:scale-[0.98] active:shadow-sm cursor-pointer shadow-sm"
            >
              Luncurkan Demo Interaktif Sekarang
              <ArrowRight className="w-5 h-5" />
            </button>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md border border-slate-200 bg-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-slate-900" />
            </div>
            <span className="font-display font-black text-base text-slate-900">
              Emak AI Titip
            </span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center text-xs font-bold">
            <span className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm">Go 1.25</span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm">SQLite</span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm">React 19</span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm">Vite 8</span>
            <span className="px-2.5 py-1 bg-white border border-slate-200 shadow-sm">Tailwind v4</span>
          </div>

          <p className="text-xs text-slate-500 font-semibold font-mono">
            &copy; 2026 Emak AI Titip. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
