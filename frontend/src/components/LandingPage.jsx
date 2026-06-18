import React, { useState } from 'react';
import { 
  ShoppingBag, ArrowRight, Menu, X, ChevronRight, 
  MessageSquare, Zap, Truck, ShieldCheck, UserCheck, Heart 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage({ onLaunchDemo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-white flex flex-col relative overflow-hidden bg-[#080b11] font-sans selection:bg-[#00bfa5] selection:text-slate-950">
      
      {/* Styles for float animation & font-outline effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}} />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-[#080b11] border-b border-slate-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl tracking-wider text-white">
              PASAR<span className="text-[#00bfa5]">AI</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-extrabold text-[11px] tracking-widest">
            <a href="#cara-kerja" className="text-slate-400 hover:text-white transition-colors uppercase">Cara Kerja</a>
            <a href="#fitur-ai" className="text-slate-400 hover:text-white transition-colors uppercase">Fitur AI</a>
            <a href="#manfaat" className="text-slate-400 hover:text-white transition-colors uppercase">Manfaat</a>
            <a href="#testimoni" className="text-slate-400 hover:text-white transition-colors uppercase">Testimoni</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={onLaunchDemo} 
              className="text-[11px] font-extrabold tracking-widest text-slate-400 hover:text-white uppercase transition-colors cursor-pointer"
            >
              Masuk
            </button>
            <button 
              onClick={onLaunchDemo}
              className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#00bfa5] text-slate-950 border border-transparent shadow-md hover:bg-[#00e5c1] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Mulai Belanja
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 border border-slate-800 bg-[#0c101a] text-white shadow-sm hover:bg-slate-900 transition-colors cursor-pointer"
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
              className="md:hidden border-t border-slate-900 bg-[#080b11] px-6 py-6"
            >
              <div className="flex flex-col gap-4 font-bold text-xs tracking-wider">
                <a 
                  href="#cara-kerja" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white py-1 uppercase"
                >
                  Cara Kerja
                </a>
                <a 
                  href="#fitur-ai" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white py-1 uppercase"
                >
                  Fitur AI
                </a>
                <a 
                  href="#manfaat" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white py-1 uppercase"
                >
                  Manfaat
                </a>
                <a 
                  href="#testimoni" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white py-1 uppercase"
                >
                  Testimoni
                </a>
                <div className="h-px bg-slate-950 my-2" />
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchDemo();
                  }}
                  className="w-full text-center text-slate-400 hover:text-white py-1 uppercase text-left"
                >
                  Masuk
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchDemo();
                  }}
                  className="w-full py-3 rounded-full text-center font-black uppercase tracking-wider bg-[#00bfa5] text-slate-950 hover:bg-[#00e5c1] text-xs"
                >
                  Mulai Belanja
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 border-b border-slate-900 bg-[#080b11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Copywriter content */}
            <div className="lg:col-span-6 flex flex-col text-center lg:text-left items-center lg:items-start space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00bfa5]/10 border border-[#00bfa5]/30 text-[#00bfa5] text-[10px] font-black uppercase tracking-widest shadow-sm">
                <span>ASISTEN AI MASA DEPAN</span>
              </div>

              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter text-white leading-none uppercase">
                REVOLUSI<br />
                BELANJA<br />
                PASAR<br />
                <span className="text-[#00bfa5] inline-block">DENGAN AI</span>
              </h1>

              <p className="text-slate-400 text-sm md:text-base font-semibold leading-relaxed max-w-xl">
                Solusi belanja praktis untuk Ibu Rumah Tangga. Hubungkan Anda dengan pedagang pasar dan driver terpercaya lewat satu percakapan cerdas.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                <button
                  onClick={onLaunchDemo}
                  className="px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#00bfa5] text-slate-950 hover:bg-[#00e5c1] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-[#00bfa5]/10"
                >
                  Mulai Chat Sekarang
                </button>
                
                <button
                  onClick={onLaunchDemo}
                  className="px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider bg-transparent border-2 border-slate-800 text-white hover:bg-slate-900/50 hover:border-slate-600 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  Lihat Demo
                </button>
              </div>

            </div>

            {/* Illustration */}
            <div className="lg:col-span-6 flex justify-center relative select-none">
              {/* Backlight glow behind driver */}
              <div className="absolute w-[300px] h-[300px] bg-[#00bfa5]/15 rounded-full blur-[100px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10" />
              
              <img 
                src="/3d_driver_vecteezy.png" 
                alt="3D Delivery Driver on Vespa Scooter" 
                className="w-[340px] sm:w-[420px] lg:w-[480px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,191,165,0.25)] animate-float"
              />
            </div>

          </div>
        </div>
      </section>

      {/* "BAGAIMANA KAMI BEKERJA" Section */}
      <section id="cara-kerja" className="py-20 border-b border-slate-900 bg-[#080b11]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Row */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-12 mb-8 gap-6">
            <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-none uppercase">
              BAGAIMANA<br />KAMI BEKERJA
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-sm md:text-right leading-relaxed">
              Proses cerdas yang menghubungkan kebutuhan dapur Anda langsung ke sumbernya dengan teknologi tawar otomatis.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-900/80">
            
            {/* Card 1 */}
            <div className="py-8 md:py-6 md:px-8 space-y-4 text-left">
              <div className="w-10 h-10 rounded-md bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Pilih Belanjaan</h4>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Sebutkan daftar belanjaan Anda dalam bahasa sehari-hari.
              </p>
            </div>

            {/* Card 2 */}
            <div className="py-8 md:py-6 md:px-8 space-y-4 text-left">
              <div className="w-10 h-10 rounded-md bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Chat Dengan AI</h4>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                AI kami yang canggih memproses dan mencari harga terbaik.
              </p>
            </div>

            {/* Card 3 */}
            <div className="py-8 md:py-6 md:px-8 space-y-4 text-left">
              <div className="w-10 h-10 rounded-md bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Koneksi Otomatis</h4>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Sistem mempertemukan Anda dengan Tenant & Driver yang tepat.
              </p>
            </div>

            {/* Card 4 */}
            <div className="py-8 md:py-6 md:px-8 space-y-4 text-left">
              <div className="w-10 h-10 rounded-md bg-[#00bfa5]/10 border border-[#00bfa5]/20 flex items-center justify-center text-[#00bfa5]">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Pengantaran Cepat</h4>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Belanjaan tiba di depan pintu rumah dalam waktu singkat.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* "PENGALAMAN BELANJA YANG PINTAR" Section */}
      <section id="fitur-ai" className="py-20 md:py-28 bg-white text-slate-900 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tighter leading-none uppercase">
                PENGALAMAN<br />
                BELANJA YANG<br />
                <span className="text-transparent font-black" style={{ WebkitTextStroke: '1.5px #0f172a' }}>PINTAR</span>
              </h2>

              <p className="text-slate-600 text-sm md:text-base font-semibold leading-relaxed max-w-xl">
                Tidak perlu lagi repot scroll ribuan produk. Cukup bicarakan kebutuhan Anda, AI kami akan mengurus segalanya mulai dari pemilihan daging sesuci hingga pencarian bumbu dapur yang paling otentik.
              </p>

              {/* Checklist Block */}
              <div className="space-y-4 pt-4">
                
                {/* Checklist Item 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-slate-900 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase">PEMROSESAN BAHASA ALAMI (NLP) LOGAT PASAR.</span>
                </div>

                {/* Checklist Item 2 */}
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-slate-900 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase">SARAN MENU MASAKAN HARIAN OTOMATIS.</span>
                </div>

                {/* Checklist Item 3 */}
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-slate-900 flex items-center justify-center shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase">OTOMASI TAWAR-MENAWAR HARGA TERBAIK.</span>
                </div>

              </div>

            </div>

            {/* Right Column Chat Mockup */}
            <div className="lg:col-span-5 relative w-full flex justify-center">
              
              {/* Phone Mockup Panel */}
              <div className="w-full max-w-[320px] bg-slate-950 p-2.5 rounded-3xl border-4 border-slate-950 shadow-2xl overflow-hidden aspect-[9/16] flex flex-col">
                
                {/* Mockup Header */}
                <div className="px-4 py-3.5 border-b border-slate-900 flex items-center gap-2.5 bg-slate-950">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00bfa5] animate-pulse" />
                  <div>
                    <h5 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">PASARAI CHAT</h5>
                  </div>
                </div>

                {/* Chat Mockup Messages */}
                <div className="flex-1 bg-slate-900 p-4 space-y-4 flex flex-col justify-start overflow-y-auto">
                  
                  {/* User bubble */}
                  <div className="self-end bg-slate-800 border border-slate-700/50 text-slate-200 p-3 rounded-lg max-w-[85%] text-[10px] sm:text-[11px] leading-relaxed font-semibold">
                    "Saya butuh bumbu rendang dan daging segar dari Pasar Minggu."
                  </div>

                  {/* AI bubble */}
                  <div className="self-start bg-[#00bfa5] text-slate-950 p-3 rounded-lg max-w-[85%] text-[10px] sm:text-[11px] leading-relaxed font-extrabold shadow-md">
                    "Tentu, saya sudah mencocokkan dengan Bpk. Ahmad untuk daging sapi pilihan dan Budi untuk pengiriman. Estimasi tiba dalam 45 menit."
                  </div>

                </div>

                {/* Input placeholder */}
                <div className="p-3 bg-slate-950 border-t border-slate-900">
                  <div className="w-full bg-slate-900 border border-slate-800 text-[9px] text-slate-500 font-bold px-3 py-2.5 rounded uppercase tracking-wider text-left">
                    KETIK KEBUTUHAN ANDA...
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* "3 COLUMN FEATURE CARDS" Section */}
      <section id="manfaat" className="py-20 md:py-28 bg-[#080b11] border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            
            {/* Feature 1: Keamanan Pembayaran */}
            <div className="flex flex-col text-left space-y-5">
              <div className="w-10 h-10 border border-slate-800 bg-slate-950 flex items-center justify-center text-[#00bfa5]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-3xl text-white tracking-tighter leading-none flex flex-col uppercase">
                <span>KEAMA</span>
                <span>NAN</span>
                <span>PEMBAY</span>
                <span>ARAN</span>
              </h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Sistem escrow menjamin dana Anda aman hingga barang diterima dengan baik.
              </p>
            </div>

            {/* Feature 2: Driver Terverifikasi */}
            <div className="flex flex-col text-left space-y-5">
              <div className="w-10 h-10 border border-slate-800 bg-slate-950 flex items-center justify-center text-[#00bfa5]">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-3xl text-white tracking-tighter leading-none flex flex-col uppercase">
                <span>DRIVER</span>
                <span>TERVERI</span>
                <span>FIKASI</span>
              </h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Seluruh mitra driver kami telah melewati seleksi ketat dan pelatihan profesional.
              </p>
            </div>

            {/* Feature 3: Kesegaran Terjamin */}
            <div className="flex flex-col text-left space-y-5">
              <div className="w-10 h-10 border border-slate-800 bg-slate-950 flex items-center justify-center text-[#00bfa5]">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-3xl text-white tracking-tighter leading-none flex flex-col uppercase">
                <span>KESEGA</span>
                <span>RAN</span>
                <span>TERJA</span>
                <span>MIN</span>
              </h3>
              <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                Kami bekerja sama langsung dengan tenant pasar untuk memastikan kualitas bahan terbaik.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="testimoni" className="py-20 md:py-24 bg-[#00bfa5] text-slate-950 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-slate-950 tracking-tight leading-none uppercase">
            SIAP MEMPERMUDAH<br />HIDUP ANDA?
          </h2>

          <p className="text-slate-900 text-xs sm:text-sm md:text-base font-extrabold max-w-xl mx-auto leading-relaxed">
            Gabung dengan ribuan Ibu Rumah Tangga cerdas lainnya yang telah beralih ke PasarAI.
          </p>

          <button
            onClick={onLaunchDemo}
            className="mx-auto px-10 py-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest border border-slate-950 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-slate-950/20"
          >
            DAFTAR SEKARANG GRATIS
          </button>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#080b11] text-slate-400 py-16 md:py-20 border-t border-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-900">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4 text-left">
              <span className="font-display font-black text-xl tracking-wider text-white">
                PASAR<span className="text-[#00bfa5]">AI</span>
              </span>
              <p className="text-slate-500 text-[9px] sm:text-[10px] font-bold tracking-wider leading-relaxed uppercase max-w-sm">
                SOLUSI BELANJA PINTAR UNTUK IBU RUMAH TANGGA INDONESIA. MENGHUBUNGKAN TRADISI PASAR DENGAN TEKNOLOGI MASA DEPAN.
              </p>
            </div>

            {/* Navigasi Links */}
            <div className="md:col-span-2 space-y-4 text-left">
              <h5 className="text-white text-[10px] font-black tracking-widest uppercase">Navigasi</h5>
              <div className="flex flex-col gap-2.5 text-[10px] font-bold tracking-wider">
                <a href="#cara-kerja" className="hover:text-white uppercase transition-colors">Tentang Kami</a>
                <a href="#fitur-ai" className="hover:text-white uppercase transition-colors">Fitur AI</a>
                <a href="#manfaat" className="hover:text-white uppercase transition-colors">Bantuan AI</a>
              </div>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-2 space-y-4 text-left">
              <h5 className="text-white text-[10px] font-black tracking-widest uppercase">Legal</h5>
              <div className="flex flex-col gap-2.5 text-[10px] font-bold tracking-wider">
                <a href="#" className="hover:text-white uppercase transition-colors">Kebijakan Privasi</a>
                <a href="#" className="hover:text-white uppercase transition-colors">Syarat & Ketentuan</a>
              </div>
            </div>

            {/* Hubungi Column */}
            <div className="md:col-span-3 space-y-4 text-left">
              <h5 className="text-white text-[10px] font-black tracking-widest uppercase">Hubungi</h5>
              <div className="text-[10px] font-bold tracking-wider text-slate-500 space-y-2">
                <span className="block text-slate-400">HALO@PASARAI.ID</span>
              </div>
            </div>

          </div>

          {/* Sub Footer Credits */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-[9px] text-slate-600 font-black tracking-widest gap-4 uppercase">
            <span>© 2024 PASARAI INDONESIA. ESTABLISHED FOR THE MODERN HOUSEWIFE.</span>
            <div className="flex items-center gap-6">
              <span>JAKARTA, INDONESIA</span>
              <span>EST. 2024</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
