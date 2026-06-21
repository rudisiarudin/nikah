import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import {
  Heart,
  Calendar,
  MapPin,
  Send,
  Copy,
  MessageSquare,
  Camera,
  Gift,
  ChevronDown,
  X,
  VolumeX,
  Home,
  BookOpen,
  Lock,
  Instagram,
  Check,
  User,
  Sparkles,
  Mail
} from 'lucide-react';
import { Player } from '@lottiefiles/react-lottie-player';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from './lib/utils';
import { WEDDING_CONFIG } from './config';
import { Reveal } from './components/Reveal';
import Lottie from 'lottie-react';
import { supabase } from './lib/supabase';

// --- Types ---
interface Wish {
  id: string;
  name: string;
  message: string;
  status: 'Hadir' | 'Tidak Hadir' | 'Masih Ragu';
  timestamp: Date;
  reply?: string;
}

// --- Components ---

const FloatingNav = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const navItems = [
    { icon: <Home size={18} />, label: 'Home', id: 'hero' },
    { icon: <Heart size={18} />, label: 'Couple', id: 'profile' },
    { icon: <Calendar size={18} />, label: 'Event', id: 'event' },
    { icon: <Camera size={18} />, label: 'Gallery', id: 'gallery' },
    { icon: <MessageSquare size={18} />, label: 'Wish', id: 'wishes' },
  ];

  useEffect(() => {
    const sectionIds = navItems.map(item => item.id);

    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight * 0.35;
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollY) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 lg:hidden z-[120] w-[min(94%,520px)] -translate-x-1/2"
    >
      <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 px-2 py-2">
        <div className="flex items-center justify-between gap-1">
          {navItems.map((item, idx) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={idx}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center min-w-[65px] py-2 transition-all duration-300 rounded-full",
                  isActive ? "text-[#b89e6a]" : "text-[#7C7567]"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-[#fdf8ed] border border-[#f2e8d0] rounded-full z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center gap-1">
                  {item.icon}
                  <span className="text-[10px] font-medium tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

const GiftModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50px] relative">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="btn"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => setIsOpen(true)}
            className="px-8 py-3.5 bg-transparent text-white border border-white/40 rounded-full font-serif text-[12px] tracking-widest uppercase transition-colors hover:bg-white/10 relative z-10"
          >
            SEND GIFT
          </motion.button>
        ) : (
          <motion.div
            key="card"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full max-w-[400px] bg-black/30 backdrop-blur-md rounded-[16px] border border-white/10 overflow-hidden relative z-20"
          >
            {/* CLOSE button row */}
            <div className="flex justify-end p-4 pb-0 relative z-30">
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors group"
                aria-label="Close"
              >
                <X size={16} className="text-white/60 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex flex-col px-6 pb-6 mt-2">
              
              {/* Row 1: BCA */}
              <div className="flex items-center justify-between py-5 border-b border-white/10">
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 bg-white rounded-[10px] flex items-center justify-center p-2 shadow-sm shrink-0 border border-white/5">
                    <img src="/images/bca.webp" alt="BCA" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-white font-bold text-[13px] tracking-wide mb-0.5">{WEDDING_CONFIG.bankAccountName}</p>
                    <p className="text-white/70 text-[12px] font-mono tracking-wider">{WEDDING_CONFIG.bankAccount} - BCA</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(WEDDING_CONFIG.bankAccountToCopy)}
                  className="w-9 h-9 border border-white/10 rounded-[10px] flex items-center justify-center shrink-0 ml-2"
                  title="Salin Rekening"
                >
                  {copiedText === WEDDING_CONFIG.bankAccountToCopy ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-white/70" />}
                </button>
              </div>

              {/* Row 2: SeaBank */}
              <div className="flex items-center justify-between py-5 border-b border-white/10">
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 bg-white rounded-[10px] flex items-center justify-center p-2 shadow-sm shrink-0 border border-white/5">
                    <img src="https://assets.zonalogo.com/finance/seabank.co.id/logo-1772115609286-848.svg" alt="SeaBank" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-white font-bold text-[13px] tracking-wide mb-0.5">Ayu Dewi Saputri</p>
                    <p className="text-white/70 text-[12px] font-mono tracking-wider">901364511113 - SeaBank</p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard('901364511113')}
                  className="w-9 h-9 border border-white/10 rounded-[10px] flex items-center justify-center shrink-0 ml-2"
                  title="Salin Rekening"
                >
                  {copiedText === '901364511113' ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-white/70" />}
                </button>
              </div>

              {/* Row 3: Physical Gift */}
              <div className="flex items-center justify-between py-5">
                <div className="flex items-center gap-5">
                  <div className="w-11 h-11 border border-white/10 rounded-[10px] flex items-center justify-center shrink-0">
                    <Gift size={18} className="text-white/70" />
                  </div>
                  <div className="flex flex-col text-left">
                    <p className="text-white font-bold text-[13px] tracking-wide mb-1">Send Gift</p>
                    <p className="text-white/70 text-[11px] leading-relaxed max-w-[190px]">
                      Ayu & Rudi<br/>
                      {WEDDING_CONFIG.physicalGiftAddress}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(WEDDING_CONFIG.physicalGiftAddress)}
                  className="w-9 h-9 border border-white/10 rounded-[10px] flex items-center justify-center shrink-0 ml-2"
                  title="Salin Alamat"
                >
                  {copiedText === WEDDING_CONFIG.physicalGiftAddress ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-white/70" />}
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WISHES_PER_PAGE = 5;

const Guestbook = ({ guestName }: { guestName: string }) => {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'Hadir' | 'Tidak Hadir' | 'Masih Ragu'>('Hadir');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const displayName = guestName !== 'Tamu Undangan' ? guestName : '';

  useEffect(() => {
    fetchWishes();
  }, []);

  const fetchWishes = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedWishes: Wish[] = data.map(item => ({
          id: item.id,
          name: item.name,
          message: item.message,
          status: item.status,
          timestamp: new Date(item.created_at),
          reply: item.reply
        }));
        setWishes(mappedWishes);
      }
    } catch (err) {
      console.error('Error fetching wishes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName || !message || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('wishes')
        .insert([
          {
            name: displayName,
            message,
            status,
            created_at: new Date().toISOString()
          }
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        const newWish: Wish = {
          id: data[0].id,
          name: data[0].name,
          message: data[0].message,
          status: data[0].status,
          timestamp: new Date(data[0].created_at),
          reply: data[0].reply
        };
        setWishes(prev => [newWish, ...prev]);
        setMessage('');
        setCurrentPage(1);
      }
    } catch (err) {
      console.error('Error submitting wish:', err);
      alert(`Gagal mengirim ucapan. Silakan coba lagi. Detail Error: ${(err as Error).message || 'Koneksi gagal/Database tidak ditemukan.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(wishes.length / WISHES_PER_PAGE);
  const paginatedWishes = wishes.slice(
    (currentPage - 1) * WISHES_PER_PAGE,
    currentPage * WISHES_PER_PAGE
  );

  return (
    <div className="space-y-0">
      {/* Vintage Letter Form */}
      {!displayName ? (
        <div className="max-w-md mx-auto py-8 px-4">
          <div className="vintage-card-inset p-8 text-center space-y-4">
             <div className="flex justify-center opacity-25 text-[#7c6a50]"><Lock size={28} /></div>
             <p className="serif-font italic text-[13px] text-[#7c6a50]/50">Halaman ini tertutup untuk umum.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto pb-8 px-2">
          <Reveal y={20} duration={1.2}>
          <div className="vintage-form-card relative">
            {/* Corner ornaments */}
            <div className="vintage-corner vintage-corner-tl" />
            <div className="vintage-corner vintage-corner-tr" />
            <div className="vintage-corner vintage-corner-bl" />
            <div className="vintage-corner vintage-corner-br" />

            {/* Inner header */}
            <div className="text-center mb-7">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-6 h-[0.5px] bg-[#7c6a50]/20" />
                <Mail size={16} className="text-[#9b8a6e]/50" />
                <div className="w-6 h-[0.5px] bg-[#7c6a50]/20" />
              </div>
              <p className="cinzel-font text-[10px] uppercase tracking-[0.4em] text-[#7c6a50]/45 font-semibold">Tulis Pesan Anda</p>
            </div>

            <div className="space-y-5">
              {/* Name field */}
              <div className="space-y-2">
                <label className="cinzel-font text-[9px] uppercase tracking-[0.3em] text-[#7c6a50]/50 font-semibold flex items-center gap-2">
                  <User size={12} />
                  Nama Tamu
                </label>
                <input
                  type="text"
                  value={displayName}
                  readOnly
                  className="vintage-input cursor-not-allowed opacity-70"
                />
              </div>

              {/* Message field */}
              <div className="space-y-2">
                <label className="cinzel-font text-[9px] uppercase tracking-[0.3em] text-[#7c6a50]/50 font-semibold flex items-center gap-2">
                  <BookOpen size={12} />
                  Wedding Wishes
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="vintage-input resize-none min-h-[110px]"
                  placeholder="Tulis doa dan harapan terbaik..."
                  required
                />
              </div>

              {/* Attendance field */}
              <div className="space-y-2">
                <label className="cinzel-font text-[9px] uppercase tracking-[0.3em] text-[#7c6a50]/50 font-semibold flex items-center gap-2">
                  <Heart size={12} />
                  RSVP Confirmation
                </label>
                <div className="flex gap-2">
                  {(['Hadir', 'Tidak Hadir', 'Masih Ragu'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStatus(opt)}
                      className={cn(
                        "flex-1 py-2.5 rounded-full cinzel-font text-[9px] tracking-wider uppercase border transition-all duration-300",
                        status === opt
                          ? "bg-[#50593f] text-[#f5ece0] border-[#50593f] shadow-md"
                          : "bg-transparent text-[#7c6a50]/50 border-[#7c6a50]/15 hover:border-[#7c6a50]/30"
                      )}
                    >
                      {opt === 'Tidak Hadir' ? 'Absen' : opt === 'Masih Ragu' ? 'Ragu' : opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-7">
              <motion.button
                disabled={isSubmitting || !displayName}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "w-full py-3.5 bg-[#50593f] text-[#f5ece0] rounded-full cinzel-font text-[10px] tracking-[0.3em] uppercase shadow-lg shadow-[#50593f]/20 hover:shadow-[#50593f]/30 transition-all flex items-center justify-center gap-2.5 border border-[#3D4238]",
                  (isSubmitting || !displayName) && "opacity-40 cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-[#f5ece0]/30 border-t-[#f5ece0] rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={12} className="-rotate-12" />
                    <span>Send Wish</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
          </Reveal>
        </form>
      )}

      {/* Vintage Feed Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <Reveal>
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-[0.5px] bg-[#7c6a50]/20" />
            <p className="cinzel-font text-[9px] uppercase tracking-[0.4em] text-[#7c6a50]/45 font-semibold">Messages from Guests</p>
            <div className="w-8 h-[0.5px] bg-[#7c6a50]/20" />
          </div>
        </Reveal>
      </div>

      {/* Wishes Count */}
      {!isLoading && wishes.length > 0 && (
        <Reveal y={5}>
          <div className="text-center pb-4">
            <p className="cinzel-font text-[9px] uppercase tracking-[0.3em] text-[#7c6a50]/35 font-medium">
              {wishes.length} Wedding Wishes
            </p>
          </div>
        </Reveal>
      )}

      {/* Vintage Wishes Feed */}
      <div className="px-2 md:px-4">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#7c6a50]/15 border-t-[#7c6a50]/50 rounded-full animate-spin mx-auto" />
            <p className="cinzel-font text-[9px] uppercase tracking-[0.3em] text-[#7c6a50]/35">Memuat...</p>
          </div>
        ) : wishes.length === 0 ? (
          <div className="py-16 text-center opacity-35">
            <BookOpen className="mx-auto mb-3 text-[#7c6a50]" size={24} />
            <p className="serif-font italic text-[13px] text-[#7c6a50]">Jadilah yang pertama memberikan doa.</p>
          </div>
        ) : (
          <>
            <div className="max-w-md mx-auto space-y-3">
              <AnimatePresence mode="popLayout">
                {paginatedWishes.map((wish, idx) => (
                  <motion.div
                    key={wish.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="vintage-wish-card">
                      {/* Left vintage initial */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-[#ebe1cf] border border-[#7c6a50]/10 flex items-center justify-center">
                          <span className="italiana-font text-lg text-[#7c6a50]/70">{wish.name.charAt(0).toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="cinzel-font text-[12px] font-semibold text-[#5b4636] truncate">{wish.name}</h4>
                          <span className="cinzel-font text-[8px] text-[#7c6a50]/30 tracking-wider whitespace-nowrap flex-shrink-0">
                            {wish.timestamp.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className="serif-font text-[#5b4636]/70 text-[13px] leading-relaxed mt-1.5 italic">
                          "{wish.message}"
                        </p>

                        {wish.reply && (
                          <div className="mt-3 pt-3 border-t border-dashed border-[#7c6a50]/10 pl-3 border-l border-l-[#9b8a6e]/20">
                            <p className="cinzel-font text-[8px] uppercase tracking-[0.25em] text-[#9b8a6e]/60 mb-0.5">Couple's Reply</p>
                            <p className="serif-font text-[#5b4636]/55 italic text-[12px] leading-relaxed">{wish.reply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Vintage Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-6 pb-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center cinzel-font text-[10px] transition-all",
                    currentPage === 1 ? "opacity-20 cursor-not-allowed border-[#7c6a50]/10" : "border-[#7c6a50]/20 text-[#7c6a50] hover:bg-[#7c6a50]/10"
                  )}
                >‹</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center cinzel-font text-[10px] transition-all",
                      currentPage === page
                        ? "bg-[#50593f] text-[#f5ece0] shadow-md"
                        : "border border-[#7c6a50]/10 text-[#7c6a50]/40 hover:border-[#7c6a50]/25"
                    )}
                  >{page}</button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center cinzel-font text-[10px] transition-all",
                    currentPage === totalPages ? "opacity-20 cursor-not-allowed border-[#7c6a50]/10" : "border-[#7c6a50]/20 text-[#7c6a50] hover:bg-[#7c6a50]/10"
                  )}
                >›</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const GalleryItem = ({ index, className, onClick }: { index: number; className?: string; onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden cursor-pointer group border border-white/10",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
      />
      <img
        src={WEDDING_CONFIG.galleryImages[index]}
        alt={`Gallery ${index + 1}`}
        className="h-full w-auto max-w-none object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        loading="lazy"
      />

      {/* Subtle Overlay Label */}
      <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
        <p className="outfit-font text-[8px] uppercase tracking-[0.3em] text-white font-bold bg-black/60 px-3 py-1 rounded-full">
          Moment {index + 1}
        </p>
      </div>
    </div>
  );
};

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const isMobileDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(isMobileDevice);
    if (isMobileDevice) return;

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      setIsHovering(!!target.closest('button, a, input, select, textarea, .cursor-pointer'));
    };

    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);

  if (isMobile) return null;

  return (
    <>
      <motion.div
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: isHovering ? 1.5 : 1,
          opacity: 1
        }}
        transition={{ type: "spring", damping: 30, stiffness: 200, mass: 0.5 }}
        className="fixed top-0 left-0 w-10 h-10 border border-primary/20 rounded-full z-[9999] pointer-events-none mix-blend-difference"
      />
      <motion.div
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          scale: isHovering ? 0 : 1
        }}
        transition={{ type: "spring", damping: 40, stiffness: 350 }}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full z-[10000] pointer-events-none"
      />
    </>
  );
};

// --- Main App ---


const Countdown = ({ targetDate, className }: { targetDate: string; className?: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const items = [
    { label: 'HARI', value: timeLeft.days },
    { label: 'JAM', value: timeLeft.hours },
    { label: 'MENIT', value: timeLeft.minutes },
    { label: 'DETIK', value: timeLeft.seconds }
  ];

  return (
    <div className={cn("flex items-center justify-center gap-4 md:gap-8 py-4", className)}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[55px]">
            <motion.div
              key={item.value}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="cinzel-font text-[24px] sm:text-[28px] font-bold text-[#7c6d52] leading-none drop-shadow-sm"
            >
              {String(item.value).padStart(2, '0')}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="outfit-font text-[7.5px] md:text-[9px] lg:text-[7.5px] font-bold tracking-[0.25em] text-[#7c6d52]/60 mt-1.5 uppercase"
            >
              {item.label}
            </motion.div>
          </div>
          {i < items.length - 1 && (
            <div className="h-8 md:h-10 w-[0.5px] bg-[#7c6d52]/20 mt-[-10px]" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};


const LeafOrnament = ({ className, rotate = 0, delay = 0, parallaxSpeed = 0 }: { className?: string; rotate?: number; delay?: number; parallaxSpeed?: number }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 5000], [0, parallaxSpeed * 400]);

  return (
    <motion.div
      initial={{ opacity: 0, rotate: rotate - 20 }}
      whileInView={{ opacity: 0.2, rotate }}
      viewport={{ once: true }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
      style={{ y }}
      className={cn("pointer-events-none select-none", className)}
    >
      <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
        <path d="M100,0 C120,40 180,60 200,100 C180,140 120,160 100,200 C80,160 20,140 0,100 C20,60 80,40 100,0" />
      </svg>
    </motion.div>
  );
};

const DesktopSidebar = ({ guestName, isOpen, onOpen }: { guestName: string; isOpen: boolean; onOpen: () => void }) => {
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center text-center p-8 md:p-16 text-white overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          src={WEDDING_CONFIG.coverImageLeft}
          alt="Sidebar Background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        
        {/* Lottie Bird Animation */}
        <div className="absolute top-[15%] left-[5%] w-[300px] pointer-events-none opacity-70 z-[5]">
          <Player
            autoplay
            loop
            src="/lottie_birds.json"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        <div className="flex items-center justify-center gap-4 mb-8 w-full overflow-hidden">
          <motion.p 
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.5, delay: 4.2, ease: "easeOut" }}
            className="outfit-font text-[10px] md:text-sm lg:text-[10px] uppercase font-semibold whitespace-nowrap"
          >
            THE WEDDING OF
          </motion.p>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 4.5, ease: "easeInOut" }}
            className="w-16 md:w-32 h-[1px] bg-white/40 origin-left" 
          />
        </div>
        
        <h1 className="italiana-font text-[5rem] md:text-[7rem] lg:text-[5rem] leading-[0.85] text-white drop-shadow-2xl flex flex-col items-center text-center w-full">
          <motion.span 
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.5, delay: 4.8, ease: [0.16, 1, 0.3, 1] }}
            className="pr-12 md:pr-24"
          >
            Ayu
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 1.5, delay: 5.2, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-4xl font-light italic my-2 md:my-4"
          >
            &
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.5, delay: 5.5, ease: [0.16, 1, 0.3, 1] }}
            className="pl-12 md:pl-24"
          >
            Rudi
          </motion.span>
        </h1>

        <div className="flex items-center justify-center gap-4 mt-12 w-full overflow-hidden">
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 5.8, ease: "easeInOut" }}
            className="w-16 md:w-32 h-[1px] bg-white/40 origin-right" 
          />
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 6.1, ease: "easeOut" }}
            className="outfit-font text-[9px] md:text-xs lg:text-[9px] uppercase tracking-[0.3em] font-medium whitespace-nowrap"
          >
            02 AGUSTUS 2026
          </motion.p>
        </div>
      </div>

      <div className="relative z-10 w-full pt-16 mt-8">
        <AnimatePresence mode="wait">
          {!isOpen && (
            <motion.div
              key="opening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center space-y-6"
            >
              <div className="space-y-2">
                <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 6.4, duration: 1 }} className="serif-font text-sm md:text-base lg:text-sm italic">Dear,</motion.p>
                <motion.p initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ delay: 6.6, duration: 1, ease: "easeOut" }} className="outfit-font text-2xl md:text-3xl lg:text-2xl font-bold">{guestName}</motion.p>
              </div>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 6.8, duration: 1 }} className="w-full max-w-[250px] h-[1px] bg-white/30 origin-center" />
              <div className="mt-[-10px]">
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 7.0, duration: 1 }} className="outfit-font text-[9px] md:text-[10px] lg:text-[9px] italic opacity-80">
                  Tanpa mengurangi rasa hormat, mohon maaf bila ada kesalahan penulisan nama/gelar.
                </motion.p>
              </div>
              <motion.button
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0, boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.4)", "0 0 0px rgba(255,255,255,0)"] }}
                transition={{ opacity: { duration: 0.8, delay: 7.2 }, y: { duration: 0.8, delay: 7.2 }, boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 7.2 } }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpen}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 rounded-full text-white inline-flex items-center justify-center gap-3 px-6 py-3 mt-4 transition-colors w-fit"
              >
                <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                  <Mail size={16} />
                </motion.div>
                <span className="tracking-widest text-xs font-bold uppercase">OPEN INVITATION</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const App = () => {
  const [isPreloading, setIsPreloading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const halfGalleryLength = Math.ceil(WEDDING_CONFIG.galleryImages.length / 2);
  const galleryRow1 = WEDDING_CONFIG.galleryImages.slice(0, halfGalleryLength);
  const galleryRow2 = WEDDING_CONFIG.galleryImages.slice(halfGalleryLength);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const to = params.get('to');
    if (to) {
      // Decode potential double encoding (e.g. %2520) and character '+'
      try {
        const decodedOnce = decodeURIComponent(to.replace(/\+/g, ' '));
        const finalName = decodedOnce.includes('%') ? decodeURIComponent(decodedOnce) : decodedOnce;
        setGuestName(finalName);
      } catch (e) {
        setGuestName(to.replace(/\+/g, ' '));
      }
    }
  }, []);

  // State previously declared above

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloading(false);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const storyInterval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % (WEDDING_CONFIG.storyImages?.length || 1));
    }, 5000);
    const galleryInterval = setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % WEDDING_CONFIG.galleryImages.length);
    }, 4000);
    return () => {
      clearInterval(storyInterval);
      clearInterval(galleryInterval);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOpenInvitation = () => {
    setIsOpen(true);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return;
      if (document.hidden) {
        audioRef.current.pause();
      } else if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio resume failed:", e));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isPlaying]);

  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative w-full min-h-screen font-sans text-primary selection:bg-tertiary/30">
      {/* Black Preloader */}
      <AnimatePresence>
        {isPreloading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999] bg-[#111111] flex flex-col items-center justify-center text-white pointer-events-none"
          >
            {/* "THE WEDDING OF" Phase */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.5, times: [0, 0.2, 0.66, 1], ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <p className="outfit-font text-[10px] md:text-xs lg:text-[10px] uppercase tracking-[0.4em] text-white/60">
                THE WEDDING OF
              </p>
            </motion.div>

            {/* "AR" and Names Phase */}
            <div className="flex flex-col items-center relative top-[-10px]">
              <div className="flex items-center justify-center mb-6 overflow-visible">
                <motion.span
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
                  className="italiana-font text-6xl md:text-7xl lg:text-6xl text-white inline-block"
                >
                  A
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, x: -25 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2, duration: 1.5, ease: [0.25, 1, 0.5, 1] }}
                  className="italiana-font text-6xl md:text-7xl lg:text-6xl text-white inline-block"
                >
                  R
                </motion.span>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
                className="outfit-font text-[10px] md:text-xs lg:text-[10px] uppercase tracking-[0.4em] text-white/80"
              >
                AYU & RUDI
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Progress Bar */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-1 z-[110] pointer-events-none">
          <motion.div
            className="h-full bg-secondary shadow-[0_0_10px_rgba(160,82,45,0.5)]"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
      )}
      {/* Background Music */}
      <audio
        ref={audioRef}
        src={WEDDING_CONFIG.musicUrl}
        loop
      />

      {/* Music Toggle Button */}
      {isOpen && (
        <motion.button
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          className="fixed bottom-32 right-6 md:right-8 z-[100] w-14 h-14 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/20 group"
        >
          {/* Pulsing effect when playing */}
          {isPlaying && (
            <motion.div
              animate={{
                scale: [1, 1.5],
                opacity: [0.5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute inset-0 rounded-full border border-white/30"
            />
          )}

          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {isPlaying ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 rounded-full border-[1.5px] border-white/30 flex items-center justify-center relative bg-gradient-to-br from-black/60 to-black/20 shadow-inner"
              >
                {/* Vinyl Grooves */}
                <div className="absolute inset-[3px] rounded-full border border-white/5" />
                <div className="absolute inset-[6px] rounded-full border border-white/5" />
                {/* Center dot */}
                <div className="w-1.5 h-1.5 rounded-full bg-white/60" />

                {/* Floating Note Ornaments */}
                {[...Array(2)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      y: [-10, -30],
                      x: [i === 0 ? -10 : 10, i === 0 ? -20 : 20],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 1,
                      ease: "easeOut"
                    }}
                    className="absolute text-[10px] text-white/40"
                  >
                    ♪
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="relative">
                <VolumeX size={20} className="text-white/80" />
              </div>
            )}
          </div>
        </motion.button>
      )}

      {/* Custom Desktop Cursor */}
      <CustomCursor />

      {/* Main Content Wrapper */}
      <div className="relative w-full min-h-screen bg-[#F9F8F4] flex flex-col overflow-x-hidden">
        {/* Desktop Sidebar (Cover) */}
        <aside className={cn(
          "hidden lg:block lg:fixed lg:right-0 lg:top-0 lg:h-screen overflow-hidden bg-primary transition-all duration-[1200ms] ease-[cubic-bezier(0.77,0,0.175,1)] z-0",
          !isOpen ? "lg:w-full" : "lg:w-[calc(100vw-500px)] lg:flex-none"
        )}>
          <DesktopSidebar guestName={guestName} isOpen={isOpen} onOpen={handleOpenInvitation} />
        </aside>

        {/* Main Content (Scrollable) */}
        <main className={cn(
          "relative shadow-2xl min-h-screen border-r border-black/5 bg-[#e8e3d8] transition-all duration-[1200ms] ease-[cubic-bezier(0.77,0,0.175,1)] origin-left z-10",
          !isOpen ? "w-full lg:w-0 lg:opacity-0 lg:overflow-hidden lg:pointer-events-none" : "w-full lg:w-[500px] lg:flex-none lg:opacity-100"
        )}>
          <div className="absolute inset-0 bg-texture opacity-20 pointer-events-none" />

          {/* Hero Section */}
          <section id="hero" className="relative h-screen flex items-center justify-center px-4 overflow-hidden bg-[#F9F8F4] lg:hidden">
            <AnimatePresence>
              {!isOpen && (
                <motion.div
                  key="hero-photo"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 z-[5] overflow-hidden"
                >
                  <motion.img
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
                    src={WEDDING_CONFIG.coverImageLeft}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute inset-0 bg-texture opacity-[0.15] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-[28%] max-w-[220px] pointer-events-none opacity-90">
              <img src={WEDDING_CONFIG.daunAtas} alt="Botanical Top Left" className="w-full h-full object-contain" />
            </div>

            <div className="absolute left-0 bottom-0 w-[28%] max-w-[220px] pointer-events-none opacity-85">
              <img src={WEDDING_CONFIG.profileBg} alt="Botanical Bottom Left" className="w-full h-full object-contain rotate-[-10deg]" />
            </div>

            <div className="absolute -right-24 top-0 h-full w-[80%] min-w-[420px] pointer-events-none opacity-72 overflow-visible">
              <img
                src={WEDDING_CONFIG.floralBg}
                alt="Floral Ornament"
                className="h-full w-full object-cover"
                style={{ objectPosition: '100% 40%' }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Lottie Bird Animation */}
            <div className="absolute top-[8%] right-[-5%] md:right-[2%] w-[250px] md:w-[380px] pointer-events-none opacity-80 z-[6]" style={{ transform: 'scaleX(-1)' }}>
              <Player
                autoplay
                loop
                src="/lottie_birds.json"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            <div className="relative z-10 flex flex-col items-start justify-center w-full h-full max-w-5xl mx-auto px-6 md:px-16 pt-16 pb-28 md:py-24 text-left">
              <div className="w-full mt-4 md:mt-12">
                <div className="flex items-center gap-4 mb-3 overflow-hidden">
                  <motion.p 
                    initial={{ opacity: 0, letterSpacing: "0.1em" }}
                    animate={{ opacity: 1, letterSpacing: "0.4em" }}
                    transition={{ duration: 1.5, delay: 4.2, ease: "easeOut" }}
                    className={cn("outfit-font text-[10px] md:text-sm lg:text-[10px] uppercase font-semibold transition-colors duration-1000 whitespace-nowrap", !isOpen ? "text-white/90" : "text-[#50593f]")}
                  >
                    THE WEDDING OF
                  </motion.p>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 4.5, ease: "easeInOut" }}
                    className={cn("flex-1 h-[1px] origin-left transition-colors duration-1000", !isOpen ? "bg-white/40" : "bg-[#50593f]/30")} 
                  />
                </div>
                
                <h1 className={cn("italiana-font leading-[0.85] transition-colors duration-1000 flex flex-col w-full", !isOpen ? "text-white drop-shadow-2xl" : "text-[#3D4238] drop-shadow-md")}>
                  <motion.span 
                    initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 1.5, delay: 4.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[5.5rem] md:text-[7rem] lg:text-[5.5rem]"
                  >
                    Ayu
                  </motion.span>
                  <div className="flex items-center ml-[3.5rem] md:ml-[6rem] -mt-1 md:-mt-2">
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.6, scale: 1 }}
                      transition={{ duration: 1.5, delay: 5.2, ease: "easeOut" }}
                      className="text-[3.5rem] md:text-[5rem] lg:text-[3.5rem] font-light italic mr-4 md:mr-6"
                    >
                      &
                    </motion.span>
                    <motion.span 
                      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 1.5, delay: 5.5, ease: [0.16, 1, 0.3, 1] }}
                      className="text-[5.5rem] md:text-[7rem] lg:text-[5.5rem]"
                    >
                      Rudi
                    </motion.span>
                  </div>
                </h1>

                <div className="flex items-center gap-4 mt-6 md:mt-10 w-full overflow-hidden">
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, delay: 5.8, ease: "easeInOut" }}
                    className={cn("flex-1 h-[1px] origin-right transition-colors duration-1000", !isOpen ? "bg-white/40" : "bg-[#50593f]/30")} 
                  />
                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, delay: 6.1, ease: "easeOut" }}
                    className={cn("outfit-font text-[9px] md:text-[11px] lg:text-[9px] uppercase tracking-[0.3em] font-medium transition-colors duration-1000 whitespace-nowrap", !isOpen ? "text-white/90" : "text-[#50593f]")}
                  >
                    02 AGUSTUS 2026
                  </motion.p>
                </div>
              </div>

              <div className="w-full relative mt-8 flex-1 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {!isOpen ? (
                    <motion.div
                      key="opening"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 flex flex-col justify-end pb-8 w-full lg:hidden items-center text-center"
                    >
                      <div className="space-y-1 mb-3">
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 6.4, duration: 1 }} className="serif-font text-[15px] md:text-lg lg:text-[15px] italic text-white/90">Dear,</motion.p>
                        <motion.p initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ delay: 6.6, duration: 1, ease: "easeOut" }} className="outfit-font text-[28px] md:text-[32px] lg:text-[28px] font-bold text-white drop-shadow-md tracking-tight">{guestName}</motion.p>
                      </div>
                      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 6.8, duration: 1 }} className="w-full max-w-[280px] h-[1px] bg-white/40 mb-3 origin-center" />
                      <div className="mb-6 pt-3">
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 7.0, duration: 1 }} className="outfit-font text-[9px] md:text-[10px] lg:text-[9px] font-semibold italic opacity-90 text-white max-w-[280px] tracking-wide">
                          Tanpa mengurangi rasa hormat, mohon maaf bila ada kesalahan penulisan nama/gelar.
                        </motion.p>
                      </div>
                      <motion.button
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0, boxShadow: ["0 0 0px rgba(255,255,255,0)", "0 0 25px rgba(255,255,255,0.5)", "0 0 0px rgba(255,255,255,0)"] }}
                        transition={{ opacity: { duration: 0.8, delay: 7.2 }, y: { duration: 0.8, delay: 7.2 }, boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 7.2 } }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOpenInvitation}
                        className="bg-white/30 hover:bg-white/40 backdrop-blur-md border border-white/50 rounded-full text-white inline-flex items-center justify-center gap-3 px-8 py-3.5 transition-colors w-fit"
                      >
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                          <Mail size={16} />
                        </motion.div>
                        <span className="tracking-[0.2em] text-[10px] md:text-xs lg:text-[10px] font-bold uppercase">OPEN INVITATION</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="absolute inset-0 flex flex-col justify-start pb-8 w-full items-start"
                    >
                      <Reveal delay={0.2} y={20} duration={1.5}>
                        <div className="w-full pr-4 mt-8 md:mt-12">
                          <Countdown targetDate="2026-08-02T08:00:00" className="justify-start gap-3 md:gap-6" />
                        </div>
                      </Reveal>

                      <div className="mt-8 max-w-xl">
                        <Reveal delay={0.5} x={-20} duration={1.5}>
                          <div className="pl-4 md:pl-5 border-l-[3px] border-[#A68A4D]/60 py-1">
                            <p className="serif-font text-[12.5px] md:text-lg lg:text-[12.5px] italic leading-[1.8] text-[#4B4A42] drop-shadow-sm">
                              "Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat (kebesaran Allah)."
                            </p>
                            <p className="outfit-font text-[9.5px] md:text-[12px] lg:text-[9.5px] tracking-[0.2em] uppercase text-[#A68A4D] font-semibold mt-3">
                              QS. Adz Zariyat : 49
                            </p>
                          </div>
                        </Reveal>
                      </div>

                      <div className="mt-8 space-y-6 flex flex-col items-start mb-auto">
                        <Reveal delay={1.0} y={20} duration={1.5}>
                          <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(80,89,63,0.2)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const event = {
                                title: "Pernikahan Ayu & Rudi",
                                start: "20260802T080000",
                                end: "20260802T210000",
                                location: "Jakarta",
                                description: "Mohon doa restu atas pernikahan kami."
                              };
                              window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`, '_blank');
                            }}
                            className="bg-[#50593f] text-white hover:bg-[#3D4238] backdrop-blur-md border border-[#50593f]/40 rounded-full inline-flex items-center justify-center gap-2 px-5 py-3 shadow-md"
                          >
                            <Calendar size={14} />
                            <span className="tracking-widest text-[10px] sm:text-[11px] font-bold">SAVE TO CALENDAR</span>
                          </motion.button>
                        </Reveal>
                      </div>

                      <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col items-center gap-2 text-[#50593f]/80 w-full mt-auto pt-10"
                      >
                        <span className="outfit-font text-[10px] tracking-[0.4em] font-semibold uppercase">Scroll</span>
                        <ChevronDown size={16} />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* ↓ Portrait column starts here (all content below hero) */}
          <div className="w-full">
          
          {/* Welcome Info Section (Desktop Only) */}
          <section className="relative min-h-screen hidden lg:flex flex-col justify-center px-6 py-20 bg-[#F9F8F4] overflow-hidden">
            <div className="absolute inset-0 bg-texture opacity-[0.15] pointer-events-none z-0" />
            <div className="absolute top-0 left-0 w-[28%] max-w-[220px] pointer-events-none opacity-90 z-0">
              <img src={WEDDING_CONFIG.daunAtas} alt="Botanical Top Left" className="w-full h-full object-contain" />
            </div>
            <div className="absolute left-0 bottom-0 w-[28%] max-w-[220px] pointer-events-none opacity-85 z-0">
              <img src={WEDDING_CONFIG.profileBg} alt="Botanical Bottom Left" className="w-full h-full object-contain rotate-[-10deg]" />
            </div>
            <div className="absolute -right-24 top-0 h-full w-[80%] min-w-[420px] pointer-events-none opacity-72 overflow-visible z-0">
              <img
                src={WEDDING_CONFIG.floralBg}
                alt="Floral Ornament"
                className="h-full w-full object-cover"
                style={{ objectPosition: '100% 40%' }}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="relative z-10 w-full mb-auto mt-10">
              {/* Couple Names for Desktop */}
              <div className="w-full mb-16">
                <Reveal delay={0.2} x={-20}>
                  <div className="flex items-center gap-4 mb-4">
                    <p className="outfit-font text-[10px] md:text-sm lg:text-[10px] uppercase tracking-[0.4em] font-semibold text-[#50593f]">THE WEDDING OF</p>
                    <div className="flex-1 h-[1px] bg-[#50593f]/30" />
                  </div>
                </Reveal>
                <Reveal delay={0.4} y={30} duration={1.2}>
                  <h1 className="italiana-font leading-[0.85] text-[#3D4238] drop-shadow-md flex flex-col w-full">
                    <span className="text-[3.5rem]">Ayu</span>
                    <div className="flex items-center ml-[2.5rem] -mt-1">
                      <span className="text-[2.5rem] opacity-60 font-light italic mr-4">&</span>
                      <span className="text-[3.5rem]">Rudi</span>
                    </div>
                  </h1>
                </Reveal>
              </div>

              <Reveal delay={0.2} y={20} duration={1.5}>
                <div className="w-full pr-4">
                  <Countdown targetDate="2026-08-02T08:00:00" className="justify-start gap-3 md:gap-6" />
                </div>
              </Reveal>

              <div className="mt-10 max-w-xl">
                <Reveal delay={0.5} x={-20} duration={1.5}>
                  <div className="pl-4 md:pl-5 border-l-[3px] border-[#A68A4D]/60 py-1">
                    <p className="serif-font text-[12.5px] md:text-lg lg:text-[12.5px] italic leading-[1.8] text-[#4B4A42] drop-shadow-sm">
                      "Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat (kebesaran Allah)."
                    </p>
                    <p className="outfit-font text-[9.5px] md:text-[12px] lg:text-[9.5px] tracking-[0.2em] uppercase text-[#A68A4D] font-semibold mt-3">
                      QS. Adz Zariyat : 49
                    </p>
                  </div>
                </Reveal>
              </div>

              <div className="mt-10 space-y-6 flex flex-col items-start">
                <Reveal delay={0.8} y={20} duration={1.5}>
                  <div className="flex flex-col items-start gap-2">
                    <p className="outfit-font text-[9.5px] md:text-[13px] lg:text-[9.5px] uppercase tracking-[0.25em] text-[#50593f] font-bold drop-shadow-sm flex items-center gap-2 md:gap-3 flex-wrap">
                      <span>SUNDAY</span>
                      <span className="w-1 h-1 rounded-full bg-[#BDA76E]/60" />
                      <span className="cinzel-font text-[12px] md:text-[16px] lg:text-[12px] text-[#BDA76E]">02</span>
                      <span className="w-1 h-1 rounded-full bg-[#BDA76E]/60" />
                      <span>AUGUST 2026</span>
                    </p>
                    <div className="w-10 md:w-12 h-[2px] bg-[#BDA76E]/80" />
                  </div>
                </Reveal>

                <Reveal delay={1.0} y={20} duration={1.5}>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(80,89,63,0.2)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const event = {
                        title: "Pernikahan Ayu & Rudi",
                        start: "20260802T080000",
                        end: "20260802T210000",
                        location: "Jakarta",
                        description: "Mohon doa restu atas pernikahan kami."
                      };
                      window.open(`https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start}/${event.end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}`, '_blank');
                    }}
                    className="btn-primary rounded-full inline-flex items-center justify-center gap-2 px-5 py-3"
                  >
                    <Calendar size={14} />
                    <span className="tracking-widest text-[10px] sm:text-[11px] font-bold">SAVE TO CALENDAR</span>
                  </motion.button>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Quote Section with Cinematic Background */}
          <section className="relative min-h-[45vh] md:min-h-[55vh] flex items-center justify-center py-20 px-8 overflow-hidden bg-black">
            {/* Animated Background Image - Smooth Looping Zoom */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 z-0"
            >
              <div className="absolute inset-0 bg-black/40 z-10" />
              <img
                src="/images/couple-hand.webp"
                alt="Background"
                className="w-full h-full object-cover object-bottom"
              />
            </motion.div>

            <div className="relative z-20 w-full max-w-5xl mx-auto space-y-6 md:space-y-8 text-white text-center px-4">
              <Reveal delay={0.2} scale={0.8} duration={1.5}>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="mx-auto text-[#c6b793] drop-shadow-md" size={24} />
                </motion.div>
              </Reveal>

              <Reveal delay={0.5} y={20} duration={2}>
                <p className="serif-font text-[11.5px] sm:text-[14px] italic leading-[1.9] sm:leading-[1.8] text-white/95 drop-shadow-[0_2px_3px_rgba(0,0,0,0.5)] max-w-3xl mx-auto px-2">
                  "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir"
                </p>
              </Reveal>

              <Reveal delay={1.2} y={10} duration={1.5}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-[1px] bg-[#c6b793]/40 shadow-sm" />
                  <p className="outfit-font text-[9px] md:text-xs lg:text-[9px] uppercase tracking-[0.4em] font-bold text-[#c6b793] drop-shadow-md">
                    QS. AR-RUM : 21
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Greeting + Couple Profile Section */}
          <section id="profile" className="pt-8 md:pt-16 pb-0 relative overflow-hidden bg-[#F9F8F4]">
            {/* Texture Overlay */}
            <div className="absolute inset-0 bg-texture opacity-[0.15] pointer-events-none z-0" />

            {/* Top Left Botanical Watercolor Ornament */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: -20 }}
              whileInView={{ opacity: 0.6, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute top-0 left-0 w-[45%] max-w-[240px] pointer-events-none z-10"
            >
              <img src={WEDDING_CONFIG.daunAtas} alt="" className="w-full h-auto object-contain" />
            </motion.div>

            <div className="max-w-md mx-auto relative z-30 px-6">
              {/* Bismillah Section */}
              <div className="flex flex-col items-center mb-8">
                <Reveal y={10} duration={1.5}>
                  <div className="px-10 mb-2">
                    <img
                      src={WEDDING_CONFIG.bismillahImage}
                      alt="Bismillah"
                      className="w-full max-w-[180px] h-auto object-contain opacity-80"
                      style={{ filter: 'invert(45%) sepia(12%) saturate(757%) hue-rotate(5deg) brightness(95%) contrast(87%)' }}
                    />
                  </div>
                </Reveal>

                <Reveal delay={0.4} y={10} duration={1.2}>
                  <h2 className="italiana-font text-[20px] md:text-2xl lg:text-[20px] font-bold text-center text-[#3D4238] tracking-widest mb-3">Assalamu'alaikum Wr. Wb.</h2>
                </Reveal>

                <Reveal delay={0.6} y={10} duration={1.5}>
                  <p className="serif-font text-[12.5px] md:text-[16px] lg:text-[12.5px] leading-[1.8] text-primary/70 italic text-center max-w-[340px] mx-auto">
                    Dengan memohon rahmat dan ridho Allah SWT. Kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.
                  </p>
                </Reveal>
              </div>
              {/* Photo Section - Responsive sizes */}
              <div className="relative mx-auto max-w-[240px] md:max-w-[320px] mt-6 md:mt-10 mb-0 px-4 z-30">

                {/* Botanical Ornaments - Now behind the photo frame */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [-15, -12, -15] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-[15%] -left-14 md:-left-20 w-36 md:w-52 h-auto pointer-events-none z-10 opacity-60 mix-blend-multiply"
                >
                  <img src={WEDDING_CONFIG.ornamenKiri} alt="" className="w-full h-auto object-contain" />
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [10, 13, 10] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-[0%] -right-14 md:-right-20 w-40 md:w-56 h-auto pointer-events-none z-10 opacity-60 mix-blend-multiply"
                >
                  <img src={WEDDING_CONFIG.ornamenKanan} alt="" className="w-full h-auto object-contain" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2 }}
                  className="relative z-20"
                >
                  <div className="relative overflow-hidden shadow-2xl">
                    <img
                      src={WEDDING_CONFIG.couplePhoto}
                      alt="Ayu & Rudi"
                      className="w-full h-auto object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Wedding Rings Overlayed on Photo Bottom */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    animate={{ y: [0, -6, 0] }}
                    viewport={{ once: true }}
                    transition={{
                      scale: { delay: 0.8, duration: 1, type: "spring" },
                      opacity: { delay: 0.8, duration: 1 },
                      y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute -bottom-16 md:-bottom-20 left-[48%] -translate-x-1/2 w-32 md:w-40 h-auto z-40 pointer-events-none"
                  >
                    <img src={WEDDING_CONFIG.ringsImage} alt="" className="w-full h-auto object-contain drop-shadow-2xl" />
                  </motion.div>
                </motion.div>
              </div>

            </div>

            {/* Names Section with Concave "Smile" Curve */}
            <div className="relative mt-[-50px] md:mt-[-70px] z-20">
              {/* The Curve Transition */}
              <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] translate-y-[-99%]">
                <svg viewBox="0 0 1440 120" className="relative block w-full h-auto" preserveAspectRatio="none">
                  <defs>
                    <pattern id="curve-texture" patternUnits="userSpaceOnUse" width="400" height="400">
                      <image href="/images/paper-fibers.webp" width="400" height="400" preserveAspectRatio="none" />
                    </pattern>
                  </defs>
                  <path
                    d="M0,0 Q720,120 1440,0 L1440,120 L0,120 Z"
                    fill="#50593f"
                  />
                  <path
                    d="M0,0 Q720,120 1440,0 L1440,120 L0,120 Z"
                    fill="url(#curve-texture)"
                    opacity="0.4"
                    style={{ mixBlendMode: 'overlay' }}
                  />
                </svg>
              </div>

              {/* Names Content Area */}
              <div className="bg-[#50593f] text-[#f7f1e6] pt-24 md:pt-32 pb-20 md:pb-24 px-4 relative z-20">
                {/* Paper Texture Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-overlay"
                  style={{ backgroundImage: "url('/images/paper-fibers.webp')", backgroundRepeat: 'repeat' }}
                />

                <div className="max-w-md mx-auto relative z-10">
                  <div className="flex items-start justify-center gap-1 md:gap-3">
                    {/* Groom Column */}
                    <div className="flex-1 text-center">
                      <Reveal delay={0.2} y={20}>
                        <div className="space-y-0 flex flex-col items-center justify-end min-h-[75px] md:min-h-[100px]">
                          <h3 className="italiana-font text-[24px] md:text-[34px] lg:text-[24px] text-white tracking-wide font-normal leading-tight">
                            {WEDDING_CONFIG.groomNickname}
                          </h3>
                          <p className="script-font text-[28px] md:text-[40px] lg:text-[28px] text-[#c6b793] leading-none mt-[-2px] md:mt-[-6px]">
                            {WEDDING_CONFIG.groomName.split(WEDDING_CONFIG.groomNickname)[1]?.trim() || "Siarudin"}
                          </p>
                        </div>

                        <div className="mt-6 md:mt-8 flex flex-col gap-1 md:gap-2">
                          <p className="outfit-font text-[9px] md:text-[12px] lg:text-[9px] text-white/50 tracking-[0.2em] font-bold uppercase">Putra Terakhir</p>
                          <p className="serif-font text-[11.5px] md:text-[15px] lg:text-[11.5px] text-white italic leading-[1.8] px-1">
                            {WEDDING_CONFIG.groomParents}
                          </p>
                        </div>
                      </Reveal>
                    </div>

                    {/* Vertical Divider */}
                    <div className="flex flex-col items-center px-1 md:px-3 shrink-0 pt-3 md:pt-5 opacity-40">
                      <div className="w-[1px] h-14 md:h-20 bg-[#c6b793]" />
                      <div className="py-1.5 md:py-2.5">
                        <Heart size={10} fill="#c6b793" className="text-[#c6b793]" />
                      </div>
                      <div className="w-[1px] h-14 md:h-20 bg-[#c6b793]" />
                    </div>

                    {/* Bride Column */}
                    <div className="flex-1 text-center">
                      <Reveal delay={0.4} y={20}>
                        <div className="space-y-0 flex flex-col items-center justify-end min-h-[75px] md:min-h-[100px]">
                          <h3 className="italiana-font text-[20px] md:text-[34px] lg:text-[20px] text-white tracking-wide font-normal leading-tight">
                            {WEDDING_CONFIG.brideNickname}
                          </h3>
                          <p className="script-font text-[28px] md:text-[40px] lg:text-[28px] text-[#c6b793] leading-none mt-[-2px] md:mt-[-6px]">
                            {WEDDING_CONFIG.brideName.split(WEDDING_CONFIG.brideNickname)[1]?.trim() || "Saputri"}
                          </p>
                        </div>

                        <div className="mt-6 md:mt-8 flex flex-col gap-1 md:gap-2">
                          <p className="outfit-font text-[9px] md:text-[12px] lg:text-[9px] text-white/50 tracking-[0.2em] font-bold uppercase">Putri Pertama</p>
                          <p className="serif-font text-[11.5px] md:text-[15px] lg:text-[11.5px] text-white italic leading-[1.8] px-1">
                            {WEDDING_CONFIG.brideParents}
                          </p>
                        </div>
                      </Reveal>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Transition Curve */}
              <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] translate-y-[99%]">
                <svg viewBox="0 0 1440 120" className="relative block w-full h-auto rotate-180" preserveAspectRatio="none">
                  <path
                    d="M0,0 Q720,120 1440,0 L1440,120 L0,120 Z"
                    fill="#50593f"
                  />
                </svg>
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section id="event" className="py-24 px-6 space-y-16 relative overflow-hidden bg-[#F9F8F4]">
            {/* Background Ornaments */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
              <LeafOrnament className="absolute -top-20 -right-20 w-80 h-80 rotate-90" parallaxSpeed={0.3} />
              <LeafOrnament className="absolute -bottom-20 -left-20 w-80 h-80 -rotate-90" parallaxSpeed={-0.2} />
            </div>

            <Reveal y={30}>
              <div className="text-center space-y-4 mb-16 relative z-10">
                <p className="outfit-font text-[9px] uppercase tracking-[0.5em] text-[#c6b793] font-bold">Save The Date</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent to-[#c6b793]/30" />
                  <Calendar size={14} className="text-[#c6b793]/60" />
                  <div className="flex-1 h-[0.5px] bg-gradient-to-l from-transparent to-[#c6b793]/30" />
                </div>
                <h2 className="italiana-font text-4xl md:text-5xl lg:text-4xl text-[#3D4238]">Time & Location</h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-8 bg-[#c6b793]/40" />
                  <div className="w-1.5 h-1.5 rotate-45 border border-[#c6b793]/40" />
                  <div className="h-[1px] w-8 bg-[#c6b793]/40" />
                </div>
              </div>
            </Reveal>

            <div className="max-w-3xl mx-auto relative z-10">
              <Reveal y={50}>
                <div className="relative rounded-[5px] overflow-hidden shadow-2xl border border-white/10 min-h-[600px] flex flex-col justify-center text-white py-16 px-8">
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 z-0">
                    <motion.video
                      autoPlay
                      loop
                      muted
                      playsInline
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                      src="/video/0621.mp4"
                      className="w-full h-full object-cover brightness-[0.4] contrast-[1.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                  </div>

                  <div className="relative z-10 space-y-16 text-center">
                    {/* Akad Nikah Section */}
                    <div className="space-y-8">
                      <Reveal delay={0.2} y={20}>
                        <h3 className="italiana-font text-4xl font-normal tracking-wide">Akad Nikah</h3>
                      </Reveal>

                      <Reveal delay={0.4} scale={0.9} duration={1.5}>
                        <div className="flex items-center justify-center gap-6">
                          <p className="cinzel-font text-sm tracking-[0.3em] font-bold opacity-80 uppercase">August</p>
                          <div className="flex flex-col items-center border-x border-white/20 px-6">
                            <p className="outfit-font text-[10px] tracking-[0.3em] opacity-60 uppercase mb-1">Sunday</p>
                            <p className="cinzel-font text-3xl font-bold border-b-2 border-gold/60 pb-1">02</p>
                          </div>
                          <p className="cinzel-font text-sm tracking-[0.3em] font-bold opacity-80 uppercase">2026</p>
                        </div>
                      </Reveal>

                      <Reveal delay={0.6} y={15}>
                        <div className="space-y-3">
                          <p className="outfit-font text-sm font-bold tracking-[0.1em]">{WEDDING_CONFIG.akadTime}</p>
                          <div className="space-y-1 opacity-90">
                            <p className="italiana-font text-lg font-bold tracking-wide">{WEDDING_CONFIG.akadLocationName}</p>
                            <p className="serif-font text-[11px] italic max-w-[280px] sm:max-w-md mx-auto leading-relaxed opacity-70">
                              {WEDDING_CONFIG.akadLocationAddress}
                            </p>
                          </div>
                        </div>
                      </Reveal>
                    </div>

                    {/* Resepsi Section */}
                    <div className="space-y-8">
                      <Reveal delay={0.3} y={20}>
                        <h3 className="italiana-font text-4xl font-normal tracking-wide">Resepsi</h3>
                      </Reveal>

                      <Reveal delay={0.5} scale={0.9} duration={1.5}>
                        <div className="flex items-center justify-center gap-6">
                          <p className="cinzel-font text-sm tracking-[0.3em] font-bold opacity-80 uppercase">August</p>
                          <div className="flex flex-col items-center border-x border-white/20 px-6">
                            <p className="outfit-font text-[10px] tracking-[0.3em] opacity-60 uppercase mb-1">Sunday</p>
                            <p className="cinzel-font text-3xl font-bold border-b-2 border-gold/60 pb-1">02</p>
                          </div>
                          <p className="cinzel-font text-sm tracking-[0.3em] font-bold opacity-80 uppercase">2026</p>
                        </div>
                      </Reveal>

                      <Reveal delay={0.7} y={15}>
                        <div className="space-y-3">
                          <p className="outfit-font text-sm font-bold tracking-[0.1em]">{WEDDING_CONFIG.resepsiTime}</p>
                          <div className="space-y-1 opacity-90">
                            <p className="italiana-font text-lg font-bold tracking-wide">{WEDDING_CONFIG.resepsiLocationName}</p>
                            <p className="serif-font text-[11px] italic max-w-[280px] sm:max-w-md mx-auto leading-relaxed opacity-70">
                              {WEDDING_CONFIG.resepsiLocationAddress}
                            </p>
                          </div>
                        </div>
                      </Reveal>
                    </div>

                    {/* Single Action Buttons */}
                    <Reveal delay={0.9} y={20}>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                        <motion.a
                          href={WEDDING_CONFIG.akadGoogleMapsLink}
                          target="_blank"
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-3 px-10 py-4 border border-white/40 rounded-full backdrop-blur-md text-[9.5px] font-bold tracking-[0.3em] uppercase transition-all duration-300 w-full sm:w-auto text-center justify-center font-outfit"
                        >
                          <MapPin size={14} className="opacity-60" />
                          Location Map
                        </motion.a>
                        <motion.a
                          href={WEDDING_CONFIG.liveStreamingLink}
                          target="_blank"
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,0,0,0.1)" }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-3 px-10 py-4 border border-white/40 rounded-full backdrop-blur-md text-[9.5px] font-bold tracking-[0.3em] uppercase transition-all duration-300 w-full sm:w-auto text-center justify-center font-outfit"
                        >
                          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                          Live Streaming
                        </motion.a>
                      </div>
                    </Reveal>
                  </div>
                </div>
              </Reveal>
            </div>

          </section>

          {/* Dresscode Section */}
          <section className="py-20 px-8 text-center bg-primary relative overflow-hidden">
            {/* Elegant Textures */}
            <div className="absolute inset-0 bg-texture opacity-[0.15] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none" />

            <Reveal y={30}>
              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <div className="space-y-4">
                  <Reveal y={20}>
                    <h2 className="italiana-font text-4xl text-neutral drop-shadow-sm">Dresscode</h2>
                  </Reveal>
                  <Reveal delay={0.2} y={15}>
                    <div className="flex items-center justify-center gap-4 opacity-40">
                      <div className="h-[0.5px] w-8 bg-neutral" />
                      <p className="outfit-font text-[9px] uppercase tracking-[0.4em] text-neutral/90 whitespace-nowrap">
                        Palet Warna yang Disarankan
                      </p>
                      <div className="h-[0.5px] w-8 bg-neutral" />
                    </div>
                  </Reveal>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-10 gap-x-6 sm:gap-x-12 max-w-[280px] sm:max-w-2xl mx-auto place-items-center">
                  {[
                    { color: '#422B1E', name: 'DEEP EARTH' },
                    { color: '#8A5A2E', name: 'TERRACOTTA' },
                    { color: '#968D60', name: 'SAGE LEAF' },
                    { color: '#E3BE8D', name: 'WARM SAND' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.15, duration: 0.8, ease: "easeOut" }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center gap-4 group"
                    >
                      {/* Premium Ring Container */}
                      <div className="relative p-[5px] rounded-full border-[0.5px] border-neutral/20 group-hover:border-[#c6b793] transition-all duration-700">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/20 shadow-inner relative z-10"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 4px 15px -3px ${item.color}88, inset 0 2px 4px rgba(255,255,255,0.15)`
                          }}
                        />
                      </div>
                      <span className="outfit-font text-[8px] md:text-[9px] lg:text-[8px] font-bold uppercase tracking-[0.3em] text-neutral/60 transition-colors duration-500 group-hover:text-[#c6b793] text-center w-[120px]">
                        {item.name}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <Reveal delay={0.6} y={10}>
                  <p className="serif-font text-sm italic text-neutral/60 pt-4 leading-relaxed max-w-sm mx-auto">
                    "Khadirannya akan sangat melengkapi keindahan momen bahagia kami."
                  </p>
                </Reveal>
              </div>
            </Reveal>
          </section>


          {/* Love Story Section */}
          <section id="story" className="py-24 px-6 md:px-12 relative overflow-hidden bg-black">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentStoryIndex}
                  src={WEDDING_CONFIG.storyImages[currentStoryIndex]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover brightness-75 contrast-125"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/90 backdrop-blur-[2px]" />

              {/* Lottie Birds Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-30 mix-blend-screen filter invert">
                <Player
                  autoplay
                  loop
                  src="/lottie_birds.json"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <Reveal>
                <div className="text-center space-y-4 mb-16">
                  <p className="outfit-font text-[9px] uppercase tracking-[0.5em] text-[#c6b793] font-bold">Our Journey</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent to-[#c6b793]/30" />
                    <Sparkles size={14} className="text-[#c6b793]/60" />
                    <div className="flex-1 h-[0.5px] bg-gradient-to-l from-transparent to-[#c6b793]/30" />
                  </div>
                  <h2 className="italiana-font text-4xl md:text-5xl lg:text-4xl text-white drop-shadow-md">Love Story</h2>
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-[1px] w-8 bg-[#c6b793]/40" />
                    <Heart size={10} className="text-[#c6b793]" />
                    <div className="h-[1px] w-8 bg-[#c6b793]/40" />
                  </div>
                </div>
              </Reveal>

              <div className="space-y-12 md:space-y-16 relative">
                {/* Elegant Connecting Line */}
                <div className="absolute left-[20px] md:left-[28px] top-4 bottom-4 w-[1px] bg-gradient-to-b from-transparent via-[#c6b793]/40 to-transparent" />

                {[
                  {
                    chapter: 'CHAPTER I',
                    title: 'Awal Bertemu',
                    desc: 'Di penghujung tahun 2022, kisah ini bermula. Jarak Jakarta dan Lampung menjadi saksi perjalanan kami. Meski terpisah oleh ruang, langkah tak pernah ragu—Rudi beberapa kali menempuh perjalanan menuju Lampung hanya untuk bertemu Ayu. Dari pertemuan sederhana, tumbuh rasa yang perlahan menjadi istimewa.'
                  },
                  {
                    chapter: 'CHAPTER II',
                    title: 'Tunangan',
                    desc: 'Waktu menguatkan keyakinan kami. Tepat H+3 Lebaran tahun 2026, Rudi bersama keluarga datang ke Sragen, Jawa Tengah, untuk bertemu keluarga besar Ayu. Dalam suasana hangat dan penuh kebersamaan, kami mengikat janji dalam sebuah pertunangan—sebuah langkah pasti menuju masa depan bersama.'
                  },
                  {
                    chapter: 'CHAPTER III',
                    title: 'Pernikahan',
                    desc: 'Di tahun yang sama, pada bulan Agustus 2026, dengan hati yang mantap dan doa yang mengiringi, kami memutuskan untuk melangkah ke jenjang pernikahan. Semoga perjalanan ini menjadi awal dari kebahagiaan yang tak berujung, serta senantiasa dilimpahi rahmat dan karunia Allah SWT.'
                  }
                ].map((story, idx) => (
                  <Reveal key={idx} delay={idx * 0.2} y={30}>
                    <div className="relative pl-12 md:pl-16">
                      {/* Timeline Dot */}
                      <div className="absolute left-[18px] md:left-[26px] top-6 w-[5px] h-[5px] rounded-full bg-[#c6b793] shadow-[0_0_10px_rgba(198,183,147,0.8)]" />

                      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 md:p-8 relative overflow-hidden group hover:bg-white/10 transition-colors duration-500 shadow-2xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c6b793]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

                        <p className="outfit-font text-[8px] text-[#c6b793] font-bold tracking-[0.4em] uppercase mb-2">
                          {story.chapter}
                        </p>
                        <h3 className="italiana-font text-[22px] md:text-3xl lg:text-[22px] text-white mb-4 drop-shadow-sm">{story.title}</h3>
                        <p className="text-[11px] md:text-[13px] lg:text-[11px] text-white/80 leading-[2.2] serif-font font-light italic">
                          "{story.desc}"
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <section id="gallery" className="py-24 px-4 space-y-12 bg-[#F9F8F4] relative overflow-hidden">
            <div className="absolute inset-0 bg-texture opacity-[0.15] pointer-events-none" />
            <LeafOrnament className="absolute -top-20 -right-20 w-64 h-64 text-[#50593f] opacity-5" rotate={120} parallaxSpeed={0.4} />
            <LeafOrnament className="absolute -bottom-20 -left-20 w-80 h-80 text-[#50593f] opacity-5" rotate={-45} parallaxSpeed={0.3} />

            <Reveal y={30}>
              <div className="text-center space-y-4 mb-16 relative z-10">
                <p className="outfit-font text-[9px] uppercase tracking-[0.6em] text-[#c6b793] font-bold">Capturing</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent to-[#c6b793]/30" />
                  <Camera size={14} className="text-[#c6b793]/60" />
                  <div className="flex-1 h-[0.5px] bg-gradient-to-l from-transparent to-[#c6b793]/30" />
                </div>
                <h2 className="italiana-font text-4xl md:text-5xl lg:text-4xl text-[#3D4238]">Our Moments</h2>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-[1px] w-8 bg-[#c6b793]/40" />
                  <div className="w-1.5 h-1.5 rotate-45 border border-[#c6b793]/40" />
                  <div className="h-[1px] w-8 bg-[#c6b793]/40" />
                </div>
              </div>
            </Reveal>

            {/* Gallery Layout - Horizontal Scrolling Rows */}
            <Reveal y={30} delay={0.2}>
              <div className="w-full relative z-10 pt-8 pb-16 space-y-4 md:space-y-6 overflow-hidden pl-4 md:pl-8">
                
                {/* Row 1: Images */}
                <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 md:gap-4 w-full pr-4 md:pr-8 h-[200px] md:h-[260px] items-stretch">
                  {galleryRow1.map((_, idx) => (
                    <div key={`row1-${idx}`} className="shrink-0 h-full snap-center rounded-sm overflow-hidden">
                      <GalleryItem
                        index={idx}
                        onClick={() => setSelectedGalleryImage(idx)}
                        className="h-full w-auto transition-all duration-700 shadow-sm hover:shadow-lg"
                      />
                    </div>
                  ))}
                </div>

                {/* Row 2: Video + Images */}
                <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-3 md:gap-4 w-full pr-4 md:pr-8 h-[200px] md:h-[260px] items-stretch">
                  {/* Video Card */}
                  <div className="shrink-0 h-full snap-center rounded-sm overflow-hidden">
                    <div className="relative h-full w-auto shadow-sm hover:shadow-lg transition-all duration-700 bg-black group cursor-pointer">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        poster={galleryRow1[0]}
                        className="w-auto h-full max-w-none object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700"
                      >
                        <source src="/video/video-gallery.mp4" type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                    </div>
                  </div>

                  {galleryRow2.map((_, idx) => {
                    const originalIndex = halfGalleryLength + idx;
                    return (
                      <div key={`row2-${idx}`} className="shrink-0 h-full snap-center rounded-sm overflow-hidden">
                        <GalleryItem
                          index={originalIndex}
                          onClick={() => setSelectedGalleryImage(originalIndex)}
                          className="h-full w-auto transition-all duration-700 shadow-sm hover:shadow-lg"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </section>

          {/* Wedding Gift Section */}
          <section className="py-20 px-8 text-center bg-[#50593f] relative overflow-hidden">
            {/* Texture and Pattern Ornaments */}
            <div className="absolute inset-0 bg-texture opacity-[0.2] pointer-events-none z-0" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-screen z-[1]">
              <img src="/images/paper-fibers.webp" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-overlay z-[2]">
              <img src={WEDDING_CONFIG.floralBg} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">


              <Reveal delay={0.4} y={20} duration={1.5}>
                <div className="text-center space-y-4 mb-10 relative z-10">
                  <p className="outfit-font text-[9px] uppercase tracking-[0.6em] text-[#c6b793] font-bold">Share The Joy</p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent to-[#c6b793]/30" />
                    <Gift size={16} className="text-[#c6b793]/60" />
                    <div className="flex-1 h-[0.5px] bg-gradient-to-l from-transparent to-[#c6b793]/30" />
                  </div>
                  <h2 className="italiana-font text-4xl text-[#f7f1e6] drop-shadow-sm">Wedding Gift</h2>
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-[1px] w-8 bg-[#c6b793]/40" />
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#c6b793]/40" />
                    <div className="h-[1px] w-8 bg-[#c6b793]/40" />
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.6} y={15} duration={1.5}>
                <p className="sans-font text-[11px] text-white/70 mb-10 md:mb-12 leading-relaxed italic px-2 max-w-lg mx-auto">
                  Apabila Bapak/Ibu/Saudara/i ingin mengirimkan hadiah tanda kasih, dapat melalui tautan di bawah ini.
                </p>
              </Reveal>

              <Reveal delay={0.8} scale={0.95} duration={1.2}>
                <GiftModal />
              </Reveal>
            </div>
          </section>

          {/* Guestbook Section — Vintage Parchment */}
          <section id="wishes" className="relative overflow-hidden">
            {/* Aged parchment background */}
            <div className="absolute inset-0 bg-[#f7f6f3] z-0" />
            <div className="absolute inset-0 pointer-events-none z-[1] opacity-15 overflow-hidden scale-110">
              <img src="/images/flower-tema-31.webp" alt="" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-texture opacity-[0.15] pointer-events-none z-[2]" />
            <div className="absolute inset-0 pointer-events-none z-[3]" style={{ boxShadow: 'inset 0 0 80px rgba(91,70,54,0.05)' }} />

            {/* Section Header */}
            <div className="relative z-10 pt-20 pb-8 px-6">
              <Reveal y={20} duration={1.5}>
                <div className="text-center space-y-6 max-w-sm mx-auto">
                  <p className="outfit-font text-[9px] lg:text-[9px] uppercase tracking-[0.5em] text-[#50593f]/50 font-bold">Guest Book</p>

                  <div className="flex items-center justify-center gap-4">
                    <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent to-[#50593f]/15" />
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <Heart size={12} className="text-[#94a27c]/40" />
                    </motion.div>
                    <div className="flex-1 h-[0.5px] bg-gradient-to-l from-transparent to-[#50593f]/15" />
                  </div>

                  <h2 className="italiana-font text-4xl md:text-5xl lg:text-4xl text-[#3D4238] leading-tight">
                    Wedding Wishes
                  </h2>

                  <div className="flex items-center justify-center gap-4">
                    <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent to-[#50593f]/15" />
                    <div className="w-1.5 h-1.5 rotate-45 border border-[#94a27c]/30" />
                    <div className="flex-1 h-[0.5px] bg-gradient-to-l from-transparent to-[#50593f]/15" />
                  </div>

                  <p className="serif-font italic text-[13px] text-[#50593f]/45 leading-relaxed">
                    Berikan doa dan harapan terbaik untuk kami berdua
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="relative z-10 px-3 md:px-6 pb-20">
              <Guestbook guestName={guestName} />
            </div>
          </section>

          {/* Prayer Section */}
          <section className="py-24 px-8 relative overflow-hidden flex items-center justify-center min-h-[600px]">
            {/* Gallery Slideshow Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentGalleryIndex}
                  src={WEDDING_CONFIG.galleryImages[currentGalleryIndex % WEDDING_CONFIG.galleryImages.length]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              {/* Dark Overlay for Readability */}
              <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <Reveal delay={0.2} y={30} duration={1.5}>
                  <h3 className="italiana-font text-4xl text-white drop-shadow-md">Do'a Untuk Pengantin</h3>
                </Reveal>
                <Reveal delay={0.4} scale={0.5} duration={1}>
                  <div className="w-16 h-[1px] bg-secondary/50 mx-auto" />
                </Reveal>
              </div>

              <div className="space-y-8 px-4">
                <Reveal delay={0.6} y={20} duration={2}>
                  <p className="serif-font text-sm text-white/90 italic leading-relaxed md:leading-loose">
                    "Semoga Allah memberkahimu dan memberkahi apa yang menjadi tanggung jawabmu, serta menyatukan kalian berdua dalam kebaikan."
                  </p>
                </Reveal>
                <Reveal delay={1} y={10} duration={1.5}>
                  <p className="outfit-font text-[10px] text-secondary tracking-widest uppercase opacity-80">
                    (HR. Ahmad, at-Tirmidzi, an-Nasa'i, Abu Dawud, dan Ibnu Majah)
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Closing Section */}
          <section className="py-28 px-8 text-center bg-[#fdfbf7] relative overflow-hidden">
            {/* Elegant Background Elements */}
            <div className="absolute inset-0 bg-texture opacity-[0.12] pointer-events-none z-0" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-[1]">
              <img src={WEDDING_CONFIG.floralBg} alt="" className="w-full h-full object-cover" />
            </div>

            {/* Premium Botanical Ornaments */}
            <div className="absolute -top-10 -left-10 w-64 h-64 opacity-[0.08] pointer-events-none z-[1] rotate-[-15deg]">
              <img src="/images/flower-tema-31.webp" alt="" className="w-full h-full object-contain" />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 opacity-[0.08] pointer-events-none z-[1] rotate-[165deg]">
              <img src="/images/flower-tema-31.webp" alt="" className="w-full h-full object-contain" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-16">
              {/* Closing Message */}
              <Reveal delay={0.2} y={30} duration={1.5}>
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-[0.5px] bg-[#c6b793]/40" />
                    <Heart size={14} className="text-[#c6b793]/60" />
                    <div className="w-12 h-[0.5px] bg-[#c6b793]/40" />
                  </div>
                  <p className="serif-font text-[14px] md:text-base lg:text-[14px] italic leading-[2] text-[#50593f]/80 px-4 max-w-lg mx-auto">
                    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu."
                  </p>
                  <p className="serif-font text-base font-bold italic text-[#50593f]/90 pt-4">
                    Wassalamu'alaikum Wr. Wb.
                  </p>
                </div>
              </Reveal>

              {/* Circle Couple Photo */}
              <Reveal delay={0.6} y={30} duration={1.8}>
                <div className="flex justify-center -mt-4 mb-4">
                  <div className="relative w-[clamp(240px,70vw,350px)] h-[clamp(240px,70vw,350px)] bg-white/20 backdrop-blur-sm rounded-full shadow-2xl group overflow-visible">
                    <div className="w-full h-full rounded-full overflow-hidden shadow-inner">
                      <img
                        src="/images/galeri7.webp"
                        alt="Ayu & Rudi"
                        className="w-full h-full object-cover scale-[1.7] group-hover:scale-[1.8] transition-transform duration-[4s] ease-out"
                        style={{ objectPosition: 'center 85%', transformOrigin: 'center 85%' }}
                      />
                    </div>
                    {/* Elegant Floating Ornament */}
                    <motion.div 
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-2 -right-2 w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-xl z-20"
                    >
                      <Heart size={20} className="text-[#c6b793]" fill="#c6b793" fillOpacity={0.2} />
                    </motion.div>
                  </div>
                </div>
              </Reveal>

              {/* Thank You Section / Signature */}
              <div className="space-y-8">
                <Reveal delay={1} y={15} duration={1.5}>
                  <div className="flex flex-col items-center gap-3">
                    <p className="outfit-font text-[10px] uppercase tracking-[0.6em] text-[#A68A4D] font-bold">Kami Yang Berbahagia</p>
                    <div className="w-8 h-[0.5px] bg-[#c6b793]/30" />
                  </div>
                </Reveal>
                
                <Reveal delay={1.3} scale={0.98} duration={2}>
                  <div className="relative inline-block px-4">
                    <h2 className="italiana-font text-[2.8rem] md:text-[3.5rem] lg:text-[2.8rem] text-[#3D4238] drop-shadow-sm">Ayu & Rudi</h2>
                    {/* Delicate under-text ornament */}
                    <div className="flex items-center justify-center gap-4 mt-4 opacity-40">
                      <div className="h-[0.5px] flex-1 bg-gradient-to-r from-transparent to-[#c6b793]" />
                      <div className="w-1 h-1 rounded-full bg-[#c6b793]" />
                      <div className="h-[0.5px] flex-1 bg-gradient-to-l from-transparent to-[#c6b793]" />
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-16 px-8 text-center bg-[#4A4E3F] text-neutral/40 space-y-6">
            <Reveal delay={0.2} y={15} duration={1.5}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Dibuat dengan Cinta oleh</p>
                  <p className="italiana-font text-xl text-secondary mt-2">IT Palugada</p>
                  <motion.a
                    href={`https://wa.me/${WEDDING_CONFIG.whatsappContact}`}
                    target="_blank"
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 text-[10px] hover:text-neutral transition-colors"
                  >
                    <MessageSquare size={12} />
                    {WEDDING_CONFIG.whatsappContactDisplay}
                  </motion.a>
                </div>
                <Reveal delay={0.4} y={10}>
                  <p className="text-[8px] uppercase tracking-widest pt-4">© 2026 IT PALUGADA. All rights reserved.</p>
                </Reveal>
              </div>
            </Reveal>
          </footer>
          </div>{/* /portrait-column-inner */}
        </main>
      </div>

      {/* Floating Nav */}
      {isOpen && <FloatingNav />}

      {/* Global Gallery Lightbox */}
      <AnimatePresence>
        {selectedGalleryImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedGalleryImage(null)}
            className="fixed inset-0 z-[3000] bg-primary/95 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.button
              className="absolute top-10 right-10 text-neutral hover:scale-110 transition-transform"
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedGalleryImage(null)}
            >
              <X size={32} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={WEDDING_CONFIG.galleryImages[selectedGalleryImage]}
              className="max-w-full max-h-[85vh] rounded-[10px] shadow-2xl object-contain border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
              <p className="outfit-font text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold bg-black/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/5">
                Moment {selectedGalleryImage + 1}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};






export default App;
