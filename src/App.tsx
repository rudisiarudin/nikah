import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Heart,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Instagram,
  Send,
  Copy,
  MessageSquare,
  Camera,
  Youtube,
  Gift,
  ChevronDown,
  X,
  Volume2,
  VolumeX,
  Ticket,
  Navigation,
  Users,
  Home,
  BookOpen
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from './lib/utils';
import { WEDDING_CONFIG } from './config';
import { Reveal } from './components/Reveal';
import { OpeningUI } from './components/OpeningUI';
import Lottie from 'lottie-react';
import birdsData from '../public/lottie_birds.json';
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
    <div className={cn("flex gap-4 md:gap-6", className || "justify-start")}>
      {items.map((item, i) => (
        <div key={i} className="text-center">
          <div className="cinzel-font text-2xl md:text-3xl font-bold text-gold leading-none">
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="outfit-font text-[8px] md:text-[9px] font-bold tracking-widest text-primary/60 mt-1.5 md:mt-2">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
};


const LeafOrnament = ({ className, rotate = 0, delay = 0 }: { className?: string; rotate?: number; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, rotate: rotate - 20 }}
    whileInView={{ opacity: 0.2, rotate }}
    viewport={{ once: true }}
    transition={{ duration: 1.5, delay, ease: "easeOut" }}
    className={cn("pointer-events-none select-none", className)}
  >
    <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
      <path d="M100,0 C120,40 180,60 200,100 C180,140 120,160 100,200 C80,160 20,140 0,100 C20,60 80,40 100,0" />
    </svg>
  </motion.div>
);

const DesktopSidebar = ({ guestName }: { guestName: string }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center text-center p-12 text-white">
      <div className="absolute inset-0 z-0">
        <img
          src={WEDDING_CONFIG.coverImageLeft}
          alt="Sidebar Background"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 space-y-8">
        <Reveal delay={0.2} y={20}>
          <p className="outfit-font text-xs uppercase tracking-[0.8em] opacity-80">The Wedding of</p>
        </Reveal>
        <Reveal delay={0.4} scale={0.9} y={30} duration={1}>
          <h1 className="italiana-font text-6xl lg:text-8xl text-white drop-shadow-2xl">
            Ayu <span className="text-4xl lg:text-5xl opacity-40 font-light italic align-middle mx-4">&</span> Rudi
          </h1>
        </Reveal>
        <Reveal delay={0.6} y={10}>
          <p className="serif-font text-lg lg:text-2xl tracking-[0.5em] font-light opacity-90">02 . 08 . 2026</p>
        </Reveal>

        <div className="pt-12">
          <Reveal delay={0.8} y={20}>
            <div className="w-24 h-[1px] bg-white/30 mx-auto mb-8" />
            <p className="serif-font text-lg italic opacity-80">Hello, {guestName}</p>
            <p className="outfit-font text-[10px] uppercase tracking-[0.3em] opacity-60 mt-4">
              Scroll to explore our invitation
            </p>
          </Reveal>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  useEffect(() => {
    const storyInterval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % (WEDDING_CONFIG.storyImages?.length || 1));
    }, 5000);
    const galleryInterval = setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % 6); // galeri1-6
    }, 4000);
    return () => {
      clearInterval(storyInterval);
      clearInterval(galleryInterval);
    };
  }, []);

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
          onClick={toggleMusic}
          className="fixed bottom-24 right-6 md:right-[2%] z-[100] w-14 h-14 bg-primary/90 backdrop-blur-xl text-neutral rounded-full flex items-center justify-center shadow-2xl border border-neutral/20 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isPlaying ? (
            <div className="relative flex items-end gap-[2px] h-4">
              {[0.6, 1, 0.4, 0.8, 0.5].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["20%", "100%", "20%"] }}
                  transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[2px] bg-neutral rounded-full"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
          ) : (
            <VolumeX size={20} className="relative z-10" />
          )}
        </motion.button>
      )}

      {/* Opening UI (Sampul) */}
      <AnimatePresence>
        {!isOpen && (
          <OpeningUI onOpen={handleOpenInvitation} guestName={guestName} />
        )}
      </AnimatePresence>

      {/* Main Content Wrapper */}
      <div className="relative w-full h-screen bg-[#F9F8F4] flex flex-col lg:flex-row overflow-hidden">
        {/* Desktop Left Side (Fixed) */}
        {isOpen && (
          <aside className="hidden lg:block lg:flex-1 h-full overflow-hidden bg-primary relative">
            <DesktopSidebar guestName={guestName} />
          </aside>
        )}

        {/* Main Content (Scrollable) */}
        <main className={cn(
          "relative bg-neutral shadow-2xl h-full overflow-y-auto overflow-x-hidden custom-scrollbar transition-all",
          isOpen ? "w-full lg:flex-none border-l border-black/5" : "w-full max-w-[500px] mx-auto"
        )}>
          <div className="absolute inset-0 bg-texture opacity-20 pointer-events-none" />

          {/* Hero Section */}
          <section id="hero" className="relative h-screen flex flex-col justify-center px-10 overflow-hidden bg-[#fcfcfc]">
            {/* Floral Background Ornament */}
            <div className="absolute top-0 right-[-20%] w-[100%] h-full pointer-events-none z-0 opacity-40 mix-blend-multiply">
              <img
                src={WEDDING_CONFIG.floralBg}
                alt="Floral Ornament"
                className="w-full h-full object-cover object-left scale-110 origin-right"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#fcfcfc] via-[#fcfcfc]/80 to-transparent" />
            </div>

            {/* Lottie Birds for Premium Feel */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30 z-0">
              <Lottie animationData={birdsData} loop={true} className="w-full h-full object-cover scale-[1.5]" />
            </div>

            <div className="relative z-10 space-y-6 max-w-[340px] mx-auto">
              <div className="space-y-3 text-center">
                <Reveal delay={0.2} y={15} duration={1.5}>
                  <p className="cinzel-font text-[11px] uppercase tracking-[0.5em] text-primary/60 font-bold mb-1">
                    The Wedding of
                  </p>
                </Reveal>
                <Reveal delay={0.5} scale={1} y={30} duration={1.8}>
                  <h1 className="italiana-font text-[52px] leading-none text-[#2D2D2D] flex items-center justify-center gap-3">
                    <span>Ayu</span>
                    <span className="text-3xl text-primary/20 font-light italic">&</span>
                    <span>Rudi</span>
                  </h1>
                </Reveal>
              </div>

              <Reveal delay={0.8} y={20} duration={1.5}>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Countdown targetDate="2026-08-02T08:00:00" className="gap-4 justify-center" />
                </motion.div>
              </Reveal>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Reveal delay={1.2} x={-20} duration={1.5}>
                    <p className="serif-font text-[12px] leading-relaxed italic text-primary font-medium border-l-2 border-primary/20 pl-4 py-1">
                      "Dan segala sesuatu Kami ciptakan berpasang-pasangan agar kamu mengingat (kebesaran Allah)."
                    </p>
                  </Reveal>
                  <Reveal delay={1.4} x={-20} duration={1.5}>
                    <p className="serif-font text-[10px] text-primary/80 font-medium pl-4">
                      (QS. Adz Zariyat : 49)
                    </p>
                  </Reveal>
                </div>

                <div className="space-y-4">
                  <Reveal delay={1.6} y={15} duration={1.5}>
                    <h3 className="cinzel-font text-base font-bold text-primary tracking-[0.2em] uppercase whitespace-nowrap text-center">
                      Minggu, 02 Agustus 2026
                    </h3>
                  </Reveal>
                  <Reveal delay={1.8} y={20} duration={1.5}>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 10px 20px -10px rgba(0,0,0,0.1)" }}
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
                      className="mx-auto flex items-center gap-2 px-6 py-3 border-2 border-primary/80 text-primary rounded-md outfit-font text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      <CalendarIcon size={14} />
                      Simpan Ke Kalender
                    </motion.button>
                  </Reveal>
                </div>
              </div>
            </div>

            {/* Scroll Down Indicator */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-10 right-10 flex flex-col items-center gap-1 opacity-30"
            >
              <p className="outfit-font text-[8px] uppercase tracking-[0.3em] font-bold">Scroll</p>
              <ChevronDown size={14} />
            </motion.div>
          </section>

          {/* Quote Section */}
          <section className="py-24 px-8 bg-primary text-neutral text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-texture opacity-10 pointer-events-none" />
            
            <div className="max-w-4xl mx-auto space-y-8">
              <Reveal delay={0.2} scale={0.8} duration={1.5}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Heart className="mx-auto text-neutral/40" size={32} />
                </motion.div>
              </Reveal>

              <Reveal delay={0.5} y={30} duration={2}>
                <p className="serif-font text-lg italic leading-relaxed md:leading-[1.8]">
                  "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir"
                </p>
              </Reveal>

              <Reveal delay={1.2} y={15} duration={1.5}>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-[1px] bg-neutral/20" />
                  <p className="outfit-font text-[10px] uppercase tracking-[0.4em] font-bold opacity-50">
                    QS. AR-RUM : 21
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Greeting Section */}
          <section className="pt-16 pb-8 px-8 text-center space-y-6">
            <Reveal y={20} duration={1.5}>
              <p className="lateef-font text-3xl mb-4 text-gold font-medium">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيْمِ</p>
            </Reveal>
            <Reveal delay={0.3} y={15} duration={1.2}>
              <h2 className="serif-font text-lg font-bold italic">Assalamu'alaikum Wr. Wb.</h2>
            </Reveal>
            <Reveal delay={0.6} y={15} duration={1.5}>
              <p className="sans-font text-xs leading-relaxed text-primary/70 italic max-w-2xl mx-auto">
                Dengan memohon rahmat dan ridho Allah SWT. Kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.
              </p>
            </Reveal>
          </section>

          {/* Profile Section */}
          <section id="profile" className="pt-8 pb-20 px-4 space-y-16 relative overflow-hidden bg-neutral">
            {/* Background Ornaments */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img
                src={WEDDING_CONFIG.profileBg}
                alt="Background"
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-neutral via-transparent to-neutral opacity-60" />
            </div>

            <div className="max-w-5xl mx-auto flex flex-col items-center relative z-10">
              {/* Bride Card: Image Left, Text Right (Flipped as per request) */}
              <Reveal y={40} className="w-full">
                <div className="flex flex-row-reverse bg-[#2D2D2D] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 w-full min-h-[220px]">
                  {/* Text Side (Right Aligned for Bride) */}
                  <div className="w-[52%] p-6 flex flex-col justify-center items-end relative h-full text-right">
                    <div className="space-y-4 text-right flex flex-col items-end w-full">
                      <Reveal delay={0.1} x={20}>
                        <div className="relative flex items-center justify-end w-full min-h-[50px] mb-2">
                          <p className="cinzel-font text-2xl text-white/10 uppercase tracking-normal font-bold absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none select-none whitespace-nowrap">The Bride</p>
                          <p className="charlotte-font text-5xl text-white leading-none italic relative z-10 pr-2">Ayu</p>
                        </div>
                      </Reveal>

                      <Reveal delay={0.2} x={20}>
                        <h3 className="italiana-font text-2xl text-white font-medium leading-[1.1] tracking-wide">
                          Ayu Dewi Saputri
                        </h3>
                      </Reveal>

                      <Reveal delay={0.3} x={20}>
                        <div className="space-y-1 text-right opacity-80 mt-1">
                          <p className="outfit-font text-[8px] text-white/40 uppercase tracking-widest font-bold italic">Putri tercinta dari</p>
                          <p className="outfit-font text-[10px] text-white font-bold leading-tight">
                            Bapak Murdiono & Ibu Kriswati
                          </p>
                        </div>
                      </Reveal>
                    </div>
                  </div>

                  {/* Image Side (48%) */}
                  <div className="w-[48%] relative overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.5 }}
                      src={WEDDING_CONFIG.bridePhoto}
                      alt="Ayu"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {/* Correct Gradient to Fade into the Text Side (Right) */}
                    <div className="absolute inset-0 bg-gradient-to-l from-[#2D2D2D] via-[#2D2D2D]/40 to-transparent pointer-events-none" />
                  </div>
                </div>
              </Reveal>

              {/* Separator */}
              <div className="flex justify-center my-6 relative z-20">
                <div className="relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-20 -z-10">
                    <img src={WEDDING_CONFIG.floralBg} alt="Floral" className="w-full h-full object-contain brightness-0 invert" />
                  </div>
                  <Reveal scale={0.8}>
                    <p className="cinzel-font text-4xl text-primary/80 italic select-none">&</p>
                  </Reveal>
                </div>
              </div>

              {/* Groom Card: Text Left, Image Right (Flipped as per request) */}
              <Reveal y={40} className="w-full">
                <div className="flex flex-row bg-[#2D2D2D] rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 w-full min-h-[220px]">
                  {/* Text Side (Left Aligned for Groom) */}
                  <div className="w-[52%] p-6 flex flex-col justify-center items-start relative h-full text-left">
                    <div className="space-y-4 text-left flex flex-col items-start w-full">
                      <Reveal delay={0.1} x={-20}>
                        <div className="relative flex items-center justify-start w-full min-h-[50px] mb-2">
                          <p className="cinzel-font text-2xl text-white/10 uppercase tracking-normal font-bold absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none select-none whitespace-nowrap">The Groom</p>
                          <p className="charlotte-font text-5xl text-white leading-none italic relative z-10 pl-2">Rudi</p>
                        </div>
                      </Reveal>

                      <Reveal delay={0.2} x={-20}>
                        <h3 className="italiana-font text-2xl text-white font-medium leading-[1.1] tracking-wide">
                          Rudi Si'arudin
                        </h3>
                      </Reveal>

                      <Reveal delay={0.3} x={-20}>
                        <div className="space-y-1 text-left opacity-80 mt-1">
                          <p className="outfit-font text-[8px] text-white/40 uppercase tracking-widest font-bold italic">Putra tercinta dari</p>
                          <p className="outfit-font text-[10px] text-white font-bold leading-tight">
                            Bapak Ohan (Alm.) & Ibu Onih (Alm.)
                          </p>
                        </div>
                      </Reveal>
                    </div>
                  </div>

                  {/* Image Side (48%) */}
                  <div className="w-[48%] relative overflow-hidden">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 1.5 }}
                      src={WEDDING_CONFIG.groomPhoto}
                      alt="Rudi"
                      className="w-full h-full object-cover relative z-0"
                      referrerPolicy="no-referrer"
                    />
                    {/* Correct Gradient to Fade into the Text Side (Left) */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#2D2D2D] via-[#2D2D2D]/40 to-transparent pointer-events-none" />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Event Details */}
          <section id="event" className="py-24 px-6 space-y-16 relative overflow-hidden bg-[#F9F8F4]">
            {/* Background Ornaments */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
              <LeafOrnament className="absolute -top-20 -right-20 w-80 h-80 rotate-90" />
              <LeafOrnament className="absolute -bottom-20 -left-20 w-80 h-80 -rotate-90" />
            </div>

            <Reveal y={30}>
              <div className="text-center space-y-4 mb-16 relative z-10">
                <p className="outfit-font text-[10px] uppercase tracking-[0.6em] text-primary/40 font-bold">Save the Date</p>
                <h2 className="display-font text-4xl text-primary italic">Waktu & Tempat</h2>
                <div className="h-[1px] w-12 bg-primary/20 mx-auto mt-4" />
              </div>
            </Reveal>

            <div className="max-w-3xl mx-auto relative z-10">
              <Reveal y={50}>
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 min-h-[600px] flex flex-col justify-center text-white py-16 px-8">
                  {/* Background Image with Overlay */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={WEDDING_CONFIG.eventBg}
                      alt="Event Background"
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
                            <p className="outfit-font text-[10px] tracking-[0.3em] opacity-60 uppercase mb-1">Sun</p>
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
                            <p className="serif-font text-[11px] italic max-w-[280px] mx-auto leading-relaxed opacity-70">
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
                            <p className="outfit-font text-[10px] tracking-[0.3em] opacity-60 uppercase mb-1">Sun</p>
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
                            <p className="serif-font text-[11px] italic max-w-[280px] mx-auto leading-relaxed opacity-70">
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
                          className="inline-flex items-center gap-3 px-10 py-4 border border-white/40 rounded-xl backdrop-blur-md text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 w-full sm:w-auto text-center justify-center"
                        >
                          <MapPin size={14} className="opacity-60" />
                          Peta Lokasi
                        </motion.a>
                        <motion.a
                          href={WEDDING_CONFIG.liveStreamingLink}
                          target="_blank"
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,0,0,0.1)" }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-3 px-10 py-4 border border-white/40 rounded-xl backdrop-blur-md text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 w-full sm:w-auto text-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
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
                  <h2 className="italiana-font text-4xl text-neutral drop-shadow-sm">Dresscode</h2>
                  <div className="flex items-center justify-center gap-4 opacity-40">
                    <div className="h-[0.5px] w-8 bg-neutral" />
                    <p className="outfit-font text-[9px] uppercase tracking-[0.4em] text-neutral/90 whitespace-nowrap">
                      Suggested Color Palette
                    </p>
                    <div className="h-[0.5px] w-8 bg-neutral" />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-5">
                  {[
                    { color: '#422B1E', name: 'Deep Earth' },
                    { color: '#722B14', name: 'Burnt Sienna' },
                    { color: '#8A5A2E', name: 'Terracotta' },
                    { color: '#968D60', name: 'Sage Leaf' },
                    { color: '#E3BE8D', name: 'Warm Sand' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center gap-4 group"
                    >
                      <div className="relative">
                        {/* Designer Ring Effect */}
                        <div className="absolute -inset-1.5 rounded-full border border-neutral/20 group-hover:border-neutral/40 transition-colors duration-500" />
                        
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 rounded-full border-[2.5px] border-white shadow-2xl relative z-10 cursor-help"
                          style={{ 
                            backgroundColor: item.color,
                            boxShadow: `0 10px 25px -5px ${item.color}66`
                          }}
                        />
                      </div>
                      <span className="outfit-font text-[8px] uppercase tracking-[0.2em] text-neutral/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {item.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
                
                <p className="serif-font text-sm italic text-neutral/60 pt-4 leading-relaxed max-w-sm mx-auto">
                  "Khadirannya akan sangat melengkapi keindahan momen bahagia kami."
                </p>
              </div>
            </Reveal>
          </section>


          {/* Love Story Section */}
          <section id="story" className="py-16 px-8 relative overflow-hidden">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentStoryIndex}
                  src={WEDDING_CONFIG.storyImages[currentStoryIndex]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-neutral/70 backdrop-blur-[3px]" />
              {/* Lottie Birds Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none opacity-40">
                <Lottie animationData={birdsData} loop={true} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="relative z-10">
              <Reveal>
                <div className="text-center space-y-3 mb-12 md:mb-16">
                  <h2 className="italiana-font text-3xl text-[#2D2D2D]">Our Love Story</h2>
                  <div className="h-[1.5px] w-10 bg-secondary mx-auto" />
                </div>
              </Reveal>

              <div className="space-y-10 relative">
                <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-primary/10" />

                {[
                  {
                    title: 'Awal Bertemu',
                    desc: 'Di penghujung tahun 2022, kisah ini bermula. Jarak Jakarta dan Lampung menjadi saksi perjalanan kami. Meski terpisah oleh ruang, langkah tak pernah ragu—Rudi beberapa kali menempuh perjalanan menuju Lampung hanya untuk bertemu Ayu. Dari pertemuan sederhana, tumbuh rasa yang perlahan menjadi istimewa.'
                  },
                  {
                    title: 'Tunangan',
                    desc: 'Waktu menguatkan keyakinan kami. Tepat H+3 Lebaran tahun 2026, Rudi bersama keluarga datang ke Sragen, Jawa Tengah, untuk bertemu keluarga besar Ayu. Dalam suasana hangat dan penuh kebersamaan, kami mengikat janji dalam sebuah pertunangan—sebuah langkah pasti menuju masa depan bersama.'
                  },
                  {
                    title: 'Pernikahan',
                    desc: 'Di tahun yang sama, pada bulan Agustus 2026, dengan hati yang mantap dan doa yang mengiringi, kami memutuskan untuk melangkah ke jenjang pernikahan. Semoga perjalanan ini menjadi awal dari kebahagiaan yang tak berujung, serta senantiasa dilimpahi rahmat dan karunia Allah SWT.'
                  }
                ].map((story, idx) => (
                  <Reveal key={idx} delay={idx * 0.2} y={30}>
                    <div className="relative pl-12">
                      <div className="absolute left-0 top-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-neutral text-[10px] font-bold">
                        0{idx + 1}
                      </div>
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-primary/10 shadow-lg p-5 space-y-3">
                        <h3 className="serif-font text-xl italic font-bold text-[#2D2D2D]">{story.title}</h3>
                        <p className="text-[12px] text-primary/80 leading-[1.8] italic serif-font">
                          {story.desc}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery Section */}
          <section id="gallery" className="py-20 px-4 space-y-10 bg-primary/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-texture opacity-10 pointer-events-none" />
            <LeafOrnament className="absolute -top-20 -right-20 w-64 h-64 text-primary opacity-5" rotate={120} />

            <Reveal y={30}>
              <div className="text-center space-y-3 mb-12 md:mb-16">
                <p className="outfit-font text-[9px] uppercase tracking-[0.8em] opacity-40">Our Moments</p>
                <h2 className="italiana-font text-4xl text-primary">Our Gallery</h2>
                <div className="h-[1px] w-10 bg-secondary/30 mx-auto" />
              </div>
            </Reveal>

            {/* Cinematic Video */}
            <Reveal y={30} delay={0.2}>
              <div className="relative rounded-2xl overflow-hidden border border-primary/10 shadow-lg mb-6">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover"
                >
                  <source src="/video/video.mp4" type="video/mp4" />
                </video>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Reveal key={i} delay={i * 0.1} y={20}>
                  <GalleryItem index={i} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* Wedding Gift Section */}
          <section className="py-20 px-8 text-center bg-neutral relative overflow-hidden">
            {/* Floral Background Ornaments */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-multiply">
              <img src={WEDDING_CONFIG.floralBg} alt="" className="w-full h-full object-cover" />
            </div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
              <Reveal delay={0.2} scale={0.8} duration={1.5}>
                <Gift className="mx-auto mb-2 text-gold/60" size={40} md:size={48} />
              </Reveal>
              
              <Reveal delay={0.4} y={20} duration={1.5}>
                <h2 className="italiana-font text-4xl mb-4 md:mb-6 text-primary">Wedding Gift</h2>
              </Reveal>
              
              <Reveal delay={0.6} y={15} duration={1.5}>
                <p className="sans-font text-[11px] text-primary/60 mb-10 md:mb-12 leading-relaxed italic px-2 max-w-lg mx-auto">
                  Apabila Bapak/Ibu/Saudara/i ingin mengirimkan hadiah tanda kasih, dapat melalui tautan di bawah ini.
                </p>
              </Reveal>

              <Reveal delay={0.8} scale={0.95} duration={1.2}>
                <GiftModal />
              </Reveal>
            </div>
          </section>

          {/* Guestbook Section */}
          <section id="wishes" className="py-16 px-8 bg-neutral">
            <Reveal>
              <div className="text-center space-y-3 mb-12 md:mb-16">
                <MessageSquare className="mx-auto text-secondary" size={32} md:size={40} />
                <h2 className="italiana-font text-3xl text-primary tracking-wide">Guestbook</h2>
                <p className="text-xs text-primary/60 serif-font italic">Berikan ucapan terbaik untuk kedua mempelai.</p>
              </div>
            </Reveal>

            <Guestbook guestName={guestName} />
          </section>

          {/* Prayer Section */}
          <section className="py-24 px-8 relative overflow-hidden flex items-center justify-center min-h-[500px][600px]">
            {/* Gallery Slideshow Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentGalleryIndex}
                  src={`/images/galeri${currentGalleryIndex + 1}.jpg`}
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
          <section className="py-24 px-8 text-center space-y-12 bg-neutral relative overflow-hidden">
            {/* Layered Background Patterns */}
            <div className="absolute inset-0 bg-texture opacity-10 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply">
              <img src={WEDDING_CONFIG.floralBg} alt="" className="w-full h-full object-cover" />
            </div>

            <LeafOrnament className="absolute -bottom-20 -left-20 w-80 h-80 text-primary opacity-[0.03]" rotate={-45} />
            <LeafOrnament className="absolute -top-20 -right-20 w-80 h-80 text-primary opacity-[0.03]" rotate={135} />

            <div className="relative z-10 max-w-2xl mx-auto space-y-12">
              <Reveal delay={0.2} y={20} duration={1.8}>
                <div className="space-y-6">
                  <p className="serif-font text-sm italic leading-relaxed text-primary/80 px-2 max-w-md mx-auto">
                    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir serta memberikan doa restu."
                  </p>
                </div>
              </Reveal>

              <div className="space-y-8">
                <Reveal delay={0.6} y={15} duration={1.5}>
                  <p className="outfit-font text-[12px] uppercase tracking-[0.6em] text-gold font-bold">Terima Kasih</p>
                </Reveal>
                <Reveal delay={0.8} scale={0.9} duration={2}>
                  <h2 className="italiana-font text-5xl text-primary drop-shadow-sm">Ayu & Rudi</h2>
                </Reveal>
              </div>

              {/* Refined Circular Couple Photo */}
              <Reveal delay={1.2} scale={0.8} duration={1.5}>
                <div className="flex justify-center">
                  <div className="relative w-48 h-48 rounded-full p-[1px] bg-primary/20 shadow-2xl overflow-hidden group">
                    <div className="w-full h-full rounded-full overflow-hidden border-[1px] border-primary/20">
                      <img
                        src="/images/couple.jpg"
                        alt="Ayu & Rudi"
                        className="w-full h-full object-cover scale-[1.05] group-hover:scale-110 transition-transform duration-1000"
                        style={{ objectPosition: 'center 35%' }}
                      />
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={1.6} y={10} duration={1.5}>
                <div className="space-y-12 pt-6">
                  <p className="serif-font text-base font-bold italic text-primary/80">Wassalamu'alaikum Wr. Wb.</p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Footer */}
          <footer className="py-12 px-8 text-center bg-primary text-neutral/40 space-y-6">
            <Reveal delay={0.2} y={15} duration={1.5}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.4em] font-bold">Created with Love by</p>
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
                <p className="text-[8px] uppercase tracking-widest pt-4">© 2026 IT PALUGADA. All rights reserved.</p>
              </div>
            </Reveal>
          </footer>
        </main>
      </div>

      {/* Floating Nav */}
      {isOpen && <FloatingNav />}
    </div>
  );
};

// --- Sub-components ---

const GalleryItem = ({ index }: { index: number }) => {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsZoomed(true)}
        className="aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer"
      >
        <img
          src={`/images/galeri${index + 1}.jpg`}
          alt={`Gallery ${index + 1}`}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-[2000] bg-primary/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.button
              className="absolute top-10 right-10 text-neutral"
              whileTap={{ scale: 0.9 }}
            >
              <X size={32} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={`/images/galeri${index + 1}.jpg`}
              className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const GiftModal = () => {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShow(true)}
        className="px-10 py-5 bg-primary text-neutral rounded-full font-bold text-[10px] tracking-[0.3em] uppercase shadow-xl hover:shadow-primary/20 transition-all flex items-center gap-3 mx-auto"
      >
        <Gift size={16} />
        KIRIM HADIAH
      </motion.button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.9 }}
              className="bg-[#FDFBF7] w-full max-w-[420px] rounded-[3rem] p-8 md:p-10 relative overflow-hidden text-primary shadow-2xl border-[6px] border-[#C19A5B]/10"
            >
              <button
                onClick={() => setShow(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-black/5 hover:bg-black/10 rounded-full flex items-center justify-center transition-colors z-20"
              >
                <X size={20} className="opacity-60" />
              </button>

              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="italiana-font text-4xl md:text-5xl text-[#C19A5B] drop-shadow-sm">Wedding Gift</h3>
                </div>

                <div className="space-y-6">
                  {/* Bank Card (BCA Black Titanium Mastercard Style) */}
                  <div className="relative aspect-[1.6/1] bg-[#1a1a1a] rounded-[2rem] p-7 text-white shadow-[0_25px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-white/10 group">
                    {/* Dark Brushed Metal Background Part 1 */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#222222]" />

                    {/* Metallic Curve Accent (Left Side) */}
                    <div
                      className="absolute top-0 bottom-0 left-0 w-[45%] bg-[#333] opacity-40"
                      style={{
                        clipPath: 'ellipse(100% 80% at 0% 50%)',
                        backgroundImage: 'linear-gradient(90deg, #444 0%, #222 100%), repeating-linear-gradient(0deg, transparent 0, transparent 1px, rgba(255,255,255,0.03) 1px, rgba(255,255,255,0.03) 2px)'
                      }}
                    />

                    {/* Glossy Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] pointer-events-none" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {/* Real BCA Logo (Force to White) */}
                          <img
                            src="/images/bca.png"
                            alt="BCA"
                            className="h-7 w-auto object-contain brightness-0 invert"
                          />
                        </div>
                        <div className="text-right">
                          <p className="italiana-font text-[14px] font-bold tracking-[0.1em] text-[#C19A5B]">Wedding Gift</p>
                        </div>
                      </div>

                      {/* Silver Chip */}
                      <div className="w-11 h-8 bg-gradient-to-br from-[#d1d1d1] via-[#ebebeb] to-[#a1a1a1] rounded-lg shadow-inner relative flex items-center justify-center overflow-hidden border border-black/20 opacity-90 mx-1">
                        <div className="absolute inset-x-0 h-[0.5px] bg-black/10 top-2" />
                        <div className="absolute inset-x-0 h-[0.5px] bg-black/10 bottom-2" />
                        <div className="absolute inset-y-0 w-[0.5px] bg-black/10 left-3" />
                        <div className="absolute inset-y-0 w-[0.5px] bg-black/10 right-3" />
                      </div>

                      <div className="space-y-4">
                        <div className="relative">
                          {/* Contactless Icon */}
                          <div className="absolute -top-6 right-0 opacity-40">
                            <div className="flex gap-[2px] items-end">
                              {[1, 1.5, 2, 2.5].map((h, i) => (
                                <div key={i} className="w-[1.5px] bg-white rounded-full" style={{ height: `${h * 4}px`, transform: `skewX(-20deg)` }} />
                              ))}
                            </div>
                          </div>
                          <p className="text-[1.35rem] md:text-[1.8rem] font-bold tracking-[0.25em] outfit-font text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center">
                            {WEDDING_CONFIG.bankAccount}
                          </p>
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="space-y-0.5">
                            <p className="text-[7px] font-bold tracking-[0.3em] uppercase text-white/40">authorized signature</p>
                            <p className="text-[12px] md:text-[14px] font-bold tracking-[0.1em] uppercase text-white/80">{WEDDING_CONFIG.bankAccountName}</p>
                          </div>

                          {/* Mastercard Logo */}
                          <div className="flex -space-x-3 mb-1">
                            <div className="w-9 h-9 rounded-full bg-[#EB001B]/90 shadow-lg" />
                            <div className="w-9 h-9 rounded-full bg-[#F79E1B]/90 shadow-lg mix-blend-screen" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => copyToClipboard(WEDDING_CONFIG.bankAccountToCopy)}
                      className="w-full bg-gradient-to-r from-[#C19A5B] to-[#A67C3D] text-white py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-[#C19A5B]/20 outfit-font text-[10px] font-bold tracking-[0.25em] uppercase"
                    >
                      <Copy size={16} />
                      {copied ? 'BERHASIL DISALIN' : 'SALIN NO REKENING'}
                    </motion.button>

                    <AnimatePresence>
                      {copied && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: -45 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-4 py-1.5 rounded-full font-bold tracking-widest whitespace-nowrap pointer-events-none"
                        >
                          COPIED!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Physical Gift Section */}
                  <div className="bg-[#FAF9F6] rounded-[2rem] p-8 border-2 border-dashed border-[#C19A5B]/20 space-y-5 relative">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-[#C19A5B]/10 text-[#C19A5B] rounded-2xl flex items-center justify-center shadow-inner">
                        <Gift size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-sm tracking-tight text-primary">Kirim Hadiah Fisik</p>
                        <p className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Alamat Pengiriman</p>
                      </div>
                    </div>
                    <div className="pl-1 space-y-2">
                      <p className="text-xs md:text-sm leading-relaxed text-primary/70 serif-font italic">
                        {WEDDING_CONFIG.physicalGiftAddress}
                      </p>
                      <p className="text-xs font-bold text-[#C19A5B] serif-font">
                        {WEDDING_CONFIG.physicalGiftReceiver}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
      alert(`Gagal mengirim ucapan. Silakan coba lagi. Detail Error: ${err.message || 'Koneksi gagal/Database tidak ditemukan.'}`);
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
    <div className="space-y-16">
      {/* Enhanced Form */}
      <form onSubmit={handleSubmit} className="design-card !p-8 md:!p-10 space-y-8 shadow-xl border-white/40 bg-white/60">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <label className="outfit-font text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40 pl-1">Nama Lengkap</label>
            <input
              type="text"
              value={displayName}
              readOnly
              className="w-full bg-primary/5 border border-primary/10 rounded-2xl px-5 py-4 text-sm focus:outline-none sans-font text-primary/80 shadow-sm cursor-not-allowed font-medium"
              placeholder="Nama dari undangan"
            />
          </div>

          <div className="space-y-2.5">
            <label className="outfit-font text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40 pl-1">Kehadiran</label>
            <div className="flex gap-2">
              {(['Hadir', 'Tidak Hadir', 'Masih Ragu'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatus(opt)}
                  className={cn(
                    "flex-1 py-4 px-2 outfit-font text-[9px] md:text-[10px] rounded-2xl border transition-all font-bold uppercase tracking-widest flex items-center justify-center gap-1.5",
                    status === opt
                      ? "bg-primary text-neutral border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "bg-white/80 text-primary/40 border-primary/5 hover:border-primary/20"
                  )}
                >
                  <span className="opacity-80">
                    {opt === 'Hadir' ? '✓' : opt === 'Tidak Hadir' ? '✗' : '?'}
                  </span>
                  {opt === 'Hadir' ? 'Hadir' : opt === 'Tidak Hadir' ? 'Absen' : 'Ragu'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="outfit-font text-[10px] uppercase tracking-[0.3em] font-bold text-primary/40 pl-1">Ucapan & Doa Restu</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-white/80 border border-primary/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all resize-none sans-font placeholder:text-primary/20 shadow-sm"
            placeholder="Tuliskan pesan & doa tulus Anda..."
            rows={4}
            required
          />
        </div>

        <motion.button
          disabled={isSubmitting || !displayName}
          whileHover={isSubmitting || !displayName ? {} : { scale: 1.01, backgroundColor: 'var(--color-primary)' }}
          whileTap={isSubmitting || !displayName ? {} : { scale: 0.98 }}
          className={cn(
            "btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-[11px] shadow-xl transition-all",
            (isSubmitting || !displayName) && "opacity-70 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Mengirim...
            </div>
          ) : (
            <>
              <Send size={16} className="opacity-60" />
              Kirim Ucapan Terbaik
            </>
          )}
        </motion.button>
      </form>

      {/* Wishes Count */}
      {!isLoading && wishes.length > 0 && (
        <div className="text-center">
          <p className="outfit-font text-[10px] uppercase tracking-[0.3em] text-primary/40 font-bold">
            {wishes.length} Ucapan & Doa
          </p>
        </div>
      )}

      {/* Modern Wishes Feed */}
      <div className="space-y-8 px-2 -mx-2">
        {isLoading ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="outfit-font text-[10px] uppercase tracking-[0.3em] text-primary/40 font-bold">Memuat Ucapan...</p>
          </div>
        ) : wishes.length === 0 ? (
          <div className="py-20 text-center opacity-40">
            <MessageSquare className="mx-auto mb-4" size={32} />
            <p className="serif-font italic">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {paginatedWishes.map((wish) => (
                <motion.div
                  key={wish.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative group"
                >
                  {/* Glassmorphism Card */}
                  <div className="bg-white/70 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-primary/10 shadow-lg hover:shadow-[0_25px_50px_rgba(0,0,0,0.06)] transition-all duration-700 relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      {/* Name & Date Part */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/5 flex items-center justify-center border border-black/5 shadow-inner">
                          <span className="serif-font text-xl md:text-2xl text-primary/60 font-medium">
                            {wish.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="serif-font text-lg md:text-xl text-primary font-medium tracking-normal">
                            {wish.name}
                          </p>
                          <div className="flex items-center gap-1.5 opacity-40">
                            <Clock size={10} />
                            <p className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                              {wish.timestamp.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                              <span>•</span>
                              {wish.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="pl-0 md:pl-[4.5rem]">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8.5px] font-bold uppercase tracking-widest bg-white shadow-sm border",
                          wish.status === 'Hadir'
                            ? "text-green-600 border-green-100"
                            : wish.status === 'Tidak Hadir'
                              ? "text-red-500 border-red-100"
                              : "text-gray-500 border-gray-100"
                        )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full",
                            wish.status === 'Hadir' ? "bg-green-500" : wish.status === 'Tidak Hadir' ? "bg-red-500" : "bg-gray-400"
                          )} />
                          {wish.status === 'Hadir' ? 'Hadir' : wish.status === 'Tidak Hadir' ? 'Absen' : 'Ragu'}
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="pl-0 md:pl-[4.5rem] pt-1 flex gap-2 md:gap-3 items-start">
                        <div className="text-primary/10 text-2xl font-bold font-serif leading-none italic mt-0.5">"</div>
                        <p className="serif-font text-sm md:text-base text-primary/60 italic leading-relaxed pt-1">
                          {wish.message}
                        </p>
                      </div>

                      {/* Reply Box */}
                      {wish.reply && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          className="mt-6 md:mt-8 pl-0 md:pl-[4.5rem] relative"
                        >
                          <div className="bg-[#f8f8f8] p-5 md:p-6 rounded-2xl border border-primary/5 space-y-4 shadow-inner">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center text-primary/40">
                                  <Heart size={12} fill="currentColor" className="opacity-40" />
                                </div>
                                <p className="outfit-font text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40">Balasan Mempelai</p>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-30 sm:pr-2">
                                <Clock size={10} />
                                <p className="text-[8px] font-bold uppercase tracking-widest flex items-center gap-1">
                                  {wish.timestamp.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                                  <span>•</span>
                                  {wish.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace('.', ':')}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm md:text-base text-primary/60 italic serif-font leading-relaxed pl-1 md:pl-2">
                              {wish.reply}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all",
                    currentPage === 1
                      ? "opacity-30 cursor-not-allowed border-primary/10"
                      : "border-primary/20 hover:bg-primary hover:text-neutral"
                  )}
                >
                  ‹
                </motion.button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <motion.button
                    key={page}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center outfit-font text-xs font-bold transition-all",
                      currentPage === page
                        ? "bg-primary text-neutral shadow-lg shadow-primary/20"
                        : "border border-primary/10 text-primary/50 hover:border-primary/30"
                    )}
                  >
                    {page}
                  </motion.button>
                ))}
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={cn(
                    "w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all",
                    currentPage === totalPages
                      ? "opacity-30 cursor-not-allowed border-primary/10"
                      : "border-primary/20 hover:bg-primary hover:text-neutral"
                  )}
                >
                  ›
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const FloatingNav = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const navItems = [
    { icon: <Home size={20} />, label: 'Home', id: 'hero' },
    { icon: <Heart size={20} />, label: 'Couple', id: 'profile' },
    { icon: <CalendarIcon size={20} />, label: 'Event', id: 'event' },
    { icon: <BookOpen size={20} />, label: 'Story', id: 'story' },
    { icon: <Camera size={20} />, label: 'Gallery', id: 'gallery' },
    { icon: <MessageSquare size={20} />, label: 'Wishes', id: 'wishes' },
  ];

  useEffect(() => {
    const mainElement = document.querySelector('main');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.3,
        root: mainElement
      }
    );

    navItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-[380px] lg:max-w-none lg:w-[400px] lg:left-auto lg:translate-x-0 lg:right-[25px]"
    >
      <div className="w-full bg-[#FDFBF7]/90 backdrop-blur-md rounded-full px-3 md:px-6 py-2.5 md:py-3 flex items-center justify-between shadow-xl border border-[#E8E1D5] relative overflow-hidden">
        {navItems.map((item, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.9 }}
            onClick={() => scrollTo(item.id)}
            className={cn(
              "relative flex items-center justify-center transition-all duration-300",
              activeSection === item.id ? "text-[#C19A5B] bg-primary/5 px-4 py-1.5 rounded-full" : "text-[#8C8479] hover:text-[#C19A5B] px-2 py-1.5"
            )}
          >
            <span className="relative z-10 scale-90 md:scale-100">{item.icon}</span>
            <span className={cn(
              "hidden md:block uppercase tracking-wider font-medium whitespace-nowrap transition-all duration-300 overflow-hidden",
              activeSection === item.id ? "max-w-[100px] opacity-100 ml-2 text-[9px]" : "max-w-0 opacity-0 ml-0 text-[0px]"
            )}>
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default App;
