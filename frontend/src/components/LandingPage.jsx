import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, ArrowRight, Menu, X, ChevronRight, 
  MessageSquare, Zap, Truck, ShieldCheck, UserCheck, Heart 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.7, ease: "easeOut" }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.12 } }
};

function Typewriter({ text = "Emak AI", speed = 150, delay = 2500 }) {
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText((prev) => prev.substring(0, prev.length - 1));
      }, speed / 2);
    } else {
      timer = setTimeout(() => {
        setCurrentText((prev) => text.substring(0, prev.length + 1));
      }, speed);
    }

    if (!isDeleting && currentText === text) {
      timer = setTimeout(() => setIsDeleting(true), delay);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, text, speed, delay]);

  return (
    <span className="relative inline-block text-[#00bfa5] font-black">
      {currentText}
      <span className="w-[2px] h-[1.1em] bg-[#00bfa5] ml-1 inline-block align-middle animate-cursor" />
    </span>
  );
}

export default function LandingPage({ onLaunchDemo }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-slate-800 flex flex-col relative overflow-hidden bg-[#f8fafc] font-sans selection:bg-[#00bfa5] selection:text-slate-950">
      
      {/* Styles for float animation & font-outline effect */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .animate-cursor {
          animation: blink 0.8s step-end infinite;
        }
      `}} />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-xl tracking-wider text-slate-800">
              EMAK<span className="text-[#00bfa5]">AI</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 font-extrabold text-[11px] tracking-widest">
            <a href="#cara-kerja" className="text-slate-500 hover:text-slate-800 transition-colors uppercase">Cara Kerja</a>
            <a href="#fitur-ai" className="text-slate-500 hover:text-slate-800 transition-colors uppercase">Fitur AI</a>
            <a href="#manfaat" className="text-slate-500 hover:text-slate-800 transition-colors uppercase">Manfaat</a>
            <a href="#testimoni" className="text-slate-500 hover:text-slate-800 transition-colors uppercase">Testimoni</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={onLaunchDemo} 
              className="text-[11px] font-extrabold tracking-widest text-slate-500 hover:text-slate-800 uppercase transition-colors cursor-pointer bg-transparent border-none"
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
              className="p-2 border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
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
              className="md:hidden border-t border-slate-100 bg-white px-6 py-6"
            >
              <div className="flex flex-col gap-4 font-bold text-xs tracking-wider">
                <a 
                  href="#cara-kerja" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-550 hover:text-slate-800 py-1 uppercase"
                >
                  Cara Kerja
                </a>
                <a 
                  href="#fitur-ai" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-550 hover:text-slate-800 py-1 uppercase"
                >
                  Fitur AI
                </a>
                <a 
                  href="#manfaat" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-550 hover:text-slate-800 py-1 uppercase"
                >
                  Manfaat
                </a>
                <a 
                  href="#testimoni" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-555 hover:text-slate-800 py-1 uppercase"
                >
                  Testimoni
                </a>
                <div className="h-px bg-slate-100 my-2" />
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchDemo();
                  }}
                  className="w-full text-center text-slate-550 hover:text-slate-800 py-1 uppercase text-left bg-transparent border-none cursor-pointer"
                >
                  Masuk
                </button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLaunchDemo();
                  }}
                  className="w-full py-3 rounded-full text-center font-black uppercase tracking-wider bg-[#00bfa5] text-slate-950 hover:bg-[#00e5c1] text-xs border-none cursor-pointer"
                >
                  Mulai Belanja
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 border-b border-slate-100 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Copywriter content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="lg:col-span-6 flex flex-col text-center lg:text-left items-center lg:items-start space-y-6"
            >
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#00bfa5]/10 border border-[#00bfa5]/30 text-[#00bfa5] text-[10px] font-black uppercase tracking-widest shadow-sm">
                <span>ASISTEN AI MASA DEPAN</span>
              </div>

              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-850 leading-tight">
                Butuh belanja tapi gamau ribet?<br />
                titip aja ke <Typewriter text="Emak AI" />
              </h1>

              <p className="text-slate-600 text-sm md:text-base font-semibold leading-relaxed max-w-xl">
                Solusi jastip pintar belanja pasar tradisional terpilih secara real-time. Biarkan AI kami yang mengelompokkan belanjaan, menawar harga terbaik, dan mengirim kurir langsung ke depan pintu rumah Anda.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
                <button
                  onClick={onLaunchDemo}
                  className="px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#00bfa5] text-slate-950 hover:bg-[#00e5c1] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg shadow-[#00bfa5]/10 border-none"
                >
                  Mulai Chat Sekarang
                </button>
                
                <button
                  onClick={onLaunchDemo}
                  className="px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider bg-transparent border-2 border-slate-200 text-slate-800 hover:bg-slate-100/50 hover:border-slate-400 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  Lihat Demo
                </button>
              </div>

            </motion.div>

            {/* Illustration */}
            <motion.div 
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              className="lg:col-span-6 flex justify-center relative select-none"
            >
              {/* Backlight glow behind driver */}
              <div className="absolute w-[300px] h-[300px] bg-[#00bfa5]/10 rounded-full blur-[100px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10" />
              
              <img 
                src="/3d_driver_vecteezy.png" 
                alt="3D Delivery Driver on Vespa Scooter" 
                className="w-[340px] sm:w-[420px] lg:w-[480px] h-auto object-contain drop-shadow-[0_20px_35px_rgba(0,191,165,0.18)] animate-float"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* "BAGAIMANA KAMI BEKERJA" Section */}
      <section id="cara-kerja" className="py-20 border-b border-slate-100 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Row */}
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-12 mb-8 gap-6"
          >
            <h2 className="font-display font-black text-3xl sm:text-5xl text-slate-800 tracking-tight leading-none uppercase">
              BAGAIMANA<br />KAMI BEKERJA
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-sm md:text-right leading-relaxed">
              Proses cerdas yang menghubungkan kebutuhan dapur Anda langsung ke sumbernya dengan teknologi tawar otomatis.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100"
          >
            
            {/* Card 1 */}
            <motion.div variants={fadeInUp} className="py-8 md:py-6 md:px-8 space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Pilih Belanjaan</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Sebutkan daftar belanjaan Anda dalam bahasa sehari-hari.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div variants={fadeInUp} className="py-8 md:py-6 md:px-8 space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Chat Dengan AI</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                AI kami yang canggih memproses dan mencari harga terbaik.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div variants={fadeInUp} className="py-8 md:py-6 md:px-8 space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Koneksi Otomatis</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Sistem mempertemukan Anda dengan Tenant & Driver yang tepat.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div variants={fadeInUp} className="py-8 md:py-6 md:px-8 space-y-4 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5]">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Pengantaran Cepat</h4>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Belanjaan tiba di depan pintu rumah dalam waktu singkat.
              </p>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* "PENGALAMAN BELANJA YANG PINTAR" Section */}
      <section id="fitur-ai" className="py-20 md:py-28 bg-white text-slate-900 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column Copy */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-7 space-y-6 text-left"
            >
              
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
                <motion.div variants={fadeInUp} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-[#00bfa5]/10 flex items-center justify-center shrink-0 rounded text-[#00bfa5]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase">PEMROSESAN BAHASA ALAMI (NLP) LOGAT PASAR.</span>
                </motion.div>

                {/* Checklist Item 2 */}
                <motion.div variants={fadeInUp} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-[#00bfa5]/10 flex items-center justify-center shrink-0 rounded text-[#00bfa5]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase">SARAN MENU MASAKAN HARIAN OTOMATIS.</span>
                </motion.div>

                {/* Checklist Item 3 */}
                <motion.div variants={fadeInUp} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-[#00bfa5]/10 flex items-center justify-center shrink-0 rounded text-[#00bfa5]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-900 tracking-wider uppercase">OTOMASI TAWAR-MENAWAR HARGA TERBAIK.</span>
                </motion.div>

              </div>

            </motion.div>

            {/* Right Column Chat Mockup */}
            <motion.div 
              variants={fadeInRight}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-100px" }}
              className="lg:col-span-5 relative w-full flex justify-center"
            >
              
              {/* Phone Mockup Panel */}
              <div className="w-full max-w-[320px] bg-slate-100 p-2.5 rounded-3xl border-4 border-slate-200 shadow-2xl overflow-hidden aspect-[9/16] flex flex-col">
                
                {/* Mockup Header */}
                <div className="px-4 py-3.5 border-b border-slate-150 flex items-center gap-2.5 bg-white">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00bfa5] animate-pulse" />
                  <div>
                    <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">EMAKAI CHAT</h5>
                  </div>
                </div>

                {/* Chat Mockup Messages */}
                <div className="flex-1 bg-slate-50 p-4 space-y-4 flex flex-col justify-start overflow-y-auto">
                  
                  {/* User bubble */}
                  <div className="self-end bg-white text-slate-800 shadow-sm p-3 rounded-xl max-w-[85%] text-[10px] sm:text-[11px] leading-relaxed font-semibold border border-slate-100/50">
                    "Saya butuh bumbu rendang dan daging segar dari Pasar Minggu."
                  </div>

                  {/* AI bubble */}
                  <div className="self-start bg-[#00bfa5] text-slate-950 p-3 rounded-xl max-w-[85%] text-[10px] sm:text-[11px] leading-relaxed font-extrabold shadow-md border-none">
                    "Tentu, saya sudah mencocokkan dengan Bpk. Ahmad untuk daging sapi pilihan dan Budi untuk pengiriman. Estimasi tiba dalam 45 menit."
                  </div>

                </div>

                {/* Input placeholder */}
                <div className="p-3 bg-white border-t border-slate-100">
                  <div className="w-full bg-slate-50 border-none text-[9px] text-slate-450 font-bold px-3 py-2.5 rounded-xl uppercase tracking-wider text-left shadow-inner">
                    KETIK KEBUTUHAN ANDA...
                  </div>
                </div>

              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* "3 COLUMN FEATURE CARDS" Section */}
      <section id="manfaat" className="py-20 md:py-28 bg-[#f8fafc] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12"
          >
            
            {/* Feature 1: Keamanan Pembayaran */}
            <motion.div variants={fadeInUp} className="flex flex-col text-left space-y-5">
              <div className="w-10 h-10 bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5] rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-3xl text-slate-800 tracking-tighter leading-none flex flex-col uppercase">
                <span>KEAMA</span>
                <span>NAN</span>
                <span>PEMBAY</span>
                <span>ARAN</span>
              </h3>
              <p className="text-slate-555 text-xs font-semibold leading-relaxed">
                Sistem escrow menjamin dana Anda aman hingga barang diterima dengan baik.
              </p>
            </motion.div>

            {/* Feature 2: Driver Terverifikasi */}
            <motion.div variants={fadeInUp} className="flex flex-col text-left space-y-5">
              <div className="w-10 h-10 bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5] rounded-xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-3xl text-slate-800 tracking-tighter leading-none flex flex-col uppercase">
                <span>DRIVER</span>
                <span>TERVERI</span>
                <span>FIKASI</span>
              </h3>
              <p className="text-slate-555 text-xs font-semibold leading-relaxed">
                Seluruh mitra driver kami telah melewati seleksi ketat dan pelatihan profesional.
              </p>
            </motion.div>

            {/* Feature 3: Kesegaran Terjamin */}
            <motion.div variants={fadeInUp} className="flex flex-col text-left space-y-5">
              <div className="w-10 h-10 bg-[#00bfa5]/10 flex items-center justify-center text-[#00bfa5] rounded-xl">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-display font-black text-3xl text-slate-800 tracking-tighter leading-none flex flex-col uppercase">
                <span>KESEGA</span>
                <span>RAN</span>
                <span>TERJA</span>
                <span>MIN</span>
              </h3>
              <p className="text-slate-555 text-xs font-semibold leading-relaxed">
                Kami bekerja sama langsung dengan tenant pasar untuk memastikan kualitas bahan terbaik.
              </p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="testimoni" className="py-20 md:py-24 bg-[#00bfa5] text-slate-950 relative">
        <motion.div 
          variants={scaleIn}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8"
        >
          
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-slate-950 tracking-tight leading-none uppercase">
            SIAP MEMPERMUDAH<br />HIDUP ANDA?
          </h2>

          <p className="text-slate-900 text-xs sm:text-sm md:text-base font-extrabold max-w-xl mx-auto leading-relaxed">
            Gabung dengan ribuan Ibu Rumah Tangga cerdas lainnya yang telah beralih ke Emak AI.
          </p>

          <button
            onClick={onLaunchDemo}
            className="mx-auto px-10 py-4 bg-slate-950 hover:bg-slate-900 text-white font-black text-[10px] sm:text-xs uppercase tracking-widest border border-slate-950 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-slate-950/20"
          >
            DAFTAR SEKARANG GRATIS
          </button>

        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-slate-600 py-16 md:py-20 border-t border-slate-100 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-100">
            
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-4 text-left">
              <span className="font-display font-black text-xl tracking-wider text-slate-800">
                EMAK<span className="text-[#00bfa5]">AI</span>
              </span>
              <p className="text-slate-500 text-[9px] sm:text-[10px] font-bold tracking-wider leading-relaxed uppercase max-w-sm">
                SOLUSI BELANJA PINTAR UNTUK IBU RUMAH TANGGA INDONESIA. MENGHUBUNGKAN TRADISI PASAR DENGAN TEKNOLOGI MASA DEPAN.
              </p>
            </div>

            {/* Navigasi Links */}
            <div className="md:col-span-2 space-y-4 text-left">
              <h5 className="text-slate-800 text-[10px] font-black tracking-widest uppercase">Navigasi</h5>
              <div className="flex flex-col gap-2.5 text-[10px] font-bold tracking-wider">
                <a href="#cara-kerja" className="text-slate-550 hover:text-slate-800 uppercase transition-colors">Tentang Kami</a>
                <a href="#fitur-ai" className="text-slate-550 hover:text-slate-800 uppercase transition-colors">Fitur AI</a>
                <a href="#manfaat" className="text-slate-550 hover:text-slate-800 uppercase transition-colors">Bantuan AI</a>
              </div>
            </div>

            {/* Legal Links */}
            <div className="md:col-span-2 space-y-4 text-left">
              <h5 className="text-slate-800 text-[10px] font-black tracking-widest uppercase">Legal</h5>
              <div className="flex flex-col gap-2.5 text-[10px] font-bold tracking-wider">
                <a href="#" className="text-slate-550 hover:text-slate-800 uppercase transition-colors">Kebijakan Privasi</a>
                <a href="#" className="text-slate-550 hover:text-slate-800 uppercase transition-colors">Syarat & Ketentuan</a>
              </div>
            </div>

            {/* Hubungi Column */}
            <div className="md:col-span-3 space-y-4 text-left">
              <h5 className="text-slate-800 text-[10px] font-black tracking-widest uppercase">Hubungi</h5>
              <div className="text-[10px] font-bold tracking-wider text-slate-500 space-y-2">
                <span className="block text-slate-400">HALO@EMAKAI.ID</span>
              </div>
            </div>

          </div>

          {/* Sub Footer Credits */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-[9px] text-slate-500 font-black tracking-widest gap-4 uppercase">
            <span>© 2024 EMAK AI INDONESIA. ESTABLISHED FOR THE MODERN HOUSEWIFE.</span>
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
