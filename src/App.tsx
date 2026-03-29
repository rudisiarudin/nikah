import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
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
  BookOpen,
  Lock
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
    <div className={cn("flex gap-3 md:gap-5", className || "justify-start")}>
      {items.map((item, i) => (
        <div key={i} className="text-center flex flex-col items-center">
          <div className="cinzel-font text-[22px] md:text-[26px] font-bold text-gold leading-none">
            {String(item.value).padStart(2, '0')}
          </div>
          <div className="outfit-font text-[7px] md:text-[8px] font-bold tracking-[0.25em] text-primary/40 mt-2 uppercase">
            {item.label}
          </div>
        </div>
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<number | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
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

  // State previously declared above

  useEffect(() => {
    const storyInterval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % (WEDDING_CONFIG.storyImages?.length || 1));
    }, 5000);
    const galleryInterval = setInterval(() => {
      setCurrentGalleryIndex((prev) => (prev + 1) % 7); // galeri1-7
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
          className="fixed bottom-24 right-6 md:right-[2%] z-[100] w-14 h-14 bg-primary/95 backdrop-blur-xl text-neutral rounded-full flex items-center justify-center shadow-2xl border border-neutral/20 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          {isPlaying ? (
            <div className="relative flex items-end gap-[3px] h-4">
              {[0.6, 1, 0.4, 0.8, 0.5, 0.9, 0.4].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ["20%", "100%", "20%"],
                    opacity: [0.4, 1, 0.4]
                  }}
                  transition={{
                    duration: 0.5 + i * 0.1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-[1.5px] bg-neutral rounded-full"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
          ) : (
            <VolumeX size={20} className="relative z-10" />
          )}
        </motion.button>
      )}

      {/* Custom Desktop Cursor */}
      <CustomCursor />

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

            <div className="relative z-10 space-y-6 max-w-[340px]">
              <div className="space-y-3 text-left">
                <Reveal delay={0.2} y={15} duration={1.5}>
                  <p className="cinzel-font text-[11px] uppercase tracking-[0.5em] text-primary/60 font-bold mb-1">
                    The Wedding of
                  </p>
                </Reveal>
                <Reveal delay={0.5} scale={1} y={30} duration={1.8}>
                  <h1 className="italiana-font text-[52px] leading-none text-[#4A4E3F] flex items-center justify-start gap-4">
                    <span>Ayu</span>
                    <span className="text-3xl text-primary/30 font-light italic">&</span>
                    <span>Rudi</span>
                  </h1>
                </Reveal>
              </div>

              <Reveal delay={0.8} y={20} duration={1.5}>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Countdown targetDate="2026-08-02T08:00:00" className="gap-4 justify-start" />
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
                    <h3 className="cinzel-font text-base font-bold text-primary tracking-[0.2em] uppercase whitespace-nowrap">
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
                      className="flex items-center gap-2 px-6 py-3 border-2 border-primary/80 text-primary rounded-full outfit-font text-[9.5px] font-bold uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all duration-300"
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
                  animate={{ y: [0, -8, 0], scale: [1, 1.12, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
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
                <div className="flex flex-row-reverse bg-[#4A4E3F] rounded-[25px] overflow-hidden shadow-2xl border border-primary/20 w-full min-h-[220px]">
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
                    <div className="absolute inset-0 bg-gradient-to-l from-[#4A4E3F] via-[#4A4E3F]/70 to-transparent pointer-events-none" />
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

              {/* Groom Card: Dark Theme (Matched with Bride) */}
              <Reveal y={40} className="w-full">
                <div className="flex flex-row bg-[#4A4E3F] rounded-[25px] overflow-hidden shadow-2xl border border-primary/20 w-full min-h-[220px]">
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
                    {/* Correct Gradient to Fade into the Text Side (Left) - Use matching dark color */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#4A4E3F] via-[#4A4E3F]/70 to-transparent pointer-events-none" />
                  </div>
                </div>
              </Reveal>
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
                <p className="outfit-font text-[10px] uppercase tracking-[0.6em] text-primary/40 font-bold">Save the Date</p>
                <h2 className="display-font text-4xl text-primary italic">Waktu & Tempat</h2>
                <div className="h-[1px] w-12 bg-primary/20 mx-auto mt-4" />
              </div>
            </Reveal>

            <div className="max-w-3xl mx-auto relative z-10">
              <Reveal y={50}>
                <div className="relative rounded-[25px] overflow-hidden shadow-2xl border border-white/10 min-h-[600px] flex flex-col justify-center text-white py-16 px-8">
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
                          className="inline-flex items-center gap-3 px-10 py-4 border border-white/40 rounded-full backdrop-blur-md text-[9.5px] font-bold tracking-[0.3em] uppercase transition-all duration-300 w-full sm:w-auto text-center justify-center font-outfit"
                        >
                          <MapPin size={14} className="opacity-60" />
                          Peta Lokasi
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
                  <h2 className="italiana-font text-4xl text-neutral drop-shadow-sm">Dresscode</h2>
                  <div className="flex items-center justify-center gap-4 opacity-40">
                    <div className="h-[0.5px] w-8 bg-neutral" />
                    <p className="outfit-font text-[9px] uppercase tracking-[0.4em] text-neutral/90 whitespace-nowrap">
                      Suggested Color Palette
                    </p>
                    <div className="h-[0.5px] w-8 bg-neutral" />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 max-w-sm mx-auto">
                  {[
                    { color: '#422B1E', name: 'DEEP EARTH' },
                    { color: '#722B14', name: 'BURNT SIENNA' },
                    { color: '#8A5A2E', name: 'TERRACOTTA' },
                    { color: '#968D60', name: 'SAGE LEAF' },
                    { color: '#E3BE8D', name: 'WARM SAND' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center gap-3 group w-[80px]"
                    >
                      <div className="relative">
                        {/* Designer Ring Effect */}
                        <div className="absolute -inset-1.5 rounded-full border border-neutral/20 group-hover:border-neutral/40 transition-colors duration-500" />

                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="w-12 h-12 rounded-full border-2 border-white shadow-xl relative z-10 cursor-help"
                          style={{
                            backgroundColor: item.color,
                            boxShadow: `0 8px 20px -5px ${item.color}88`
                          }}
                        />
                      </div>
                      <span className="outfit-font text-[7.5px] font-bold uppercase tracking-[0.25em] text-neutral/50 transition-colors duration-300">
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
                  <h2 className="italiana-font text-3xl text-[#4A4E3F]">Our Love Story</h2>
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
                      <div className="bg-white/80 backdrop-blur-sm rounded-[10px] border border-primary/5 shadow-lg p-8 relative overflow-hidden group">
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
            <LeafOrnament className="absolute -top-20 -right-20 w-64 h-64 text-primary opacity-5" rotate={120} parallaxSpeed={0.4} />

            <Reveal y={30}>
              <div className="text-center space-y-3 mb-12 md:mb-16">
                <p className="outfit-font text-[9px] uppercase tracking-[0.8em] opacity-40">Our Moments</p>
                <h2 className="italiana-font text-4xl text-primary">Our Gallery</h2>
                <div className="h-[1px] w-10 bg-secondary/30 mx-auto" />
              </div>
            </Reveal>

            {/* Cinematic Video */}
            <Reveal y={30} delay={0.2}>
              <div className="relative rounded-[10px] overflow-hidden border border-primary/10 shadow-lg mb-6">
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

            <div className="columns-2 gap-1.5 space-y-1.5 md:columns-3 md:gap-3 md:space-y-3 px-2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <Reveal
                  key={i}
                  delay={i * 0.15}
                  y={40}
                  scale={0.95}
                  duration={1.2}
                  className="break-inside-avoid"
                >
                  <GalleryItem
                    index={i}
                    onClick={() => setSelectedGalleryImage(i)}
                    className={cn(
                      "w-full",
                      // Masonry simulation with varying heights/aspects
                      i === 0 ? "aspect-[3/4]" :
                        i === 1 ? "aspect-square" :
                          i === 2 ? "aspect-[2/3]" :
                            i === 3 ? "aspect-[3/2]" :
                              i === 4 ? "aspect-[4/5]" :
                                i === 5 ? "aspect-square" :
                                  i === 6 ? "aspect-[2/3]" : "aspect-square"
                    )}
                  />
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
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Gift className="mx-auto mb-2 text-gold/60" size={40} />
                </motion.div>
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
          <section id="wishes" className="py-16 px-3 md:px-8 bg-neutral relative">
            <Reveal>
              <div className="text-center space-y-3 mb-12 md:mb-16">
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <MessageSquare className="mx-auto text-secondary" size={36} />
                </motion.div>
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

            <LeafOrnament className="absolute -bottom-20 -left-20 w-80 h-80 text-primary opacity-[0.03]" rotate={-45} parallaxSpeed={-0.3} />
            <LeafOrnament className="absolute -top-20 -right-20 w-80 h-80 text-primary opacity-[0.03]" rotate={135} parallaxSpeed={0.5} />

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
          <footer className="py-16 px-8 text-center bg-[#4A4E3F] text-neutral/40 space-y-6">
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
              layoutId={`image-${selectedGalleryImage}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={`/images/galeri${selectedGalleryImage + 1}.jpg`}
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

// --- Sub-components ---

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

const GalleryItem = ({ index, className, onClick }: { index: number; className?: string; onClick: () => void }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative rounded-[15px] overflow-hidden shadow-2xl cursor-pointer group border border-white/10",
        className
      )}
    >
      <motion.div
        className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10"
      />
      <motion.img
        layoutId={`image-${index}`}
        src={`/images/galeri${index + 1}.jpg`}
        alt={`Gallery ${index + 1}`}
        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        loading="lazy"
      />

      {/* Subtle Overlay Label */}
      <div className="absolute bottom-4 left-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
        <p className="outfit-font text-[8px] uppercase tracking-[0.3em] text-white font-bold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full">
          Moment {index + 1}
        </p>
      </div>
    </motion.div>
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

      {createPortal(
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[5000] bg-black/60 backdrop-blur-[20px] flex items-center justify-center p-4 sm:p-6"
            >
              <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                className="bg-[#FDFBF7] w-full max-w-[400px] max-h-[85vh] rounded-[30px] relative text-primary shadow-2xl overflow-hidden flex flex-col border border-white/40"
              >
                {/* Absolute Header Area */}
                <div className="absolute top-5 right-5 z-50">
                  <button
                    onClick={() => setShow(false)}
                    className="w-10 h-10 bg-neutral/90 backdrop-blur-md border border-black/5 rounded-full flex items-center justify-center shadow-lg hover:bg-white active:scale-90 transition-all pointer-events-auto"
                  >
                    <X size={20} className="text-primary/70" />
                  </button>
                </div>

                {/* Internal Scroll Area */}
                <div className="overflow-y-auto w-full pt-16 pb-12 px-6 sm:px-10 custom-scrollbar">
                  <div className="text-center mb-8">
                    <h3 className="italiana-font text-3xl md:text-4xl text-primary mb-3">Wedding Gift</h3>
                    <div className="h-[1px] w-10 bg-primary/20 mx-auto" />
                  </div>

                  <div className="space-y-6">
                    {/* BCA Blue Debit Card */}
                    <div className="relative aspect-[1.586/1] w-full rounded-[20px] p-6 text-white shadow-[0_20px_40px_-15px_rgba(0,82,156,0.6)] overflow-hidden border border-white/20 select-none bg-gradient-to-br from-[#1b64a6] via-[#00529C] to-[#013366]">
                      {/* Gloss / Card Texture Overlay */}
                      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

                      {/* Light reflection effect */}
                      <div className="absolute top-0 right-[-30%] w-[150%] h-[150%] bg-gradient-to-bl from-white/10 via-transparent to-transparent rotate-[35deg] pointer-events-none" />

                      <div className="relative z-10 h-full flex flex-col justify-between">
                        {/* Top bar: Bank Logo & Debit Text */}
                        <div className="flex justify-between items-start">
                          <img src="/images/bca.png" alt="BCA" className="h-[22px] w-auto brightness-0 invert opacity-90" />
                          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-md text-[8px] font-bold tracking-[0.25em] outfit-font text-white uppercase shadow-sm">DEBIT</div>
                        </div>

                        {/* Microchip */}
                        <div className="w-12 h-9 bg-gradient-to-br from-[#ffd700] via-[#eedd82] to-[#b8860b] rounded-[6px] shadow-sm border border-black/10 relative overflow-hidden flex flex-col justify-between p-[3px]">
                          {/* Chip internal lines */}
                          <div className="absolute inset-0 opacity-40">
                            <div className="w-full h-full border-[0.5px] border-black/40 rounded-[4px]" />
                            <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-black/40" />
                            <div className="absolute top-0 left-1/2 w-[0.5px] h-full bg-black/40" />
                            <div className="absolute top-1/4 left-0 w-full h-[0.5px] bg-black/40" />
                            <div className="absolute bottom-1/4 left-0 w-full h-[0.5px] bg-black/40" />
                          </div>
                        </div>

                        {/* Card Numbers & Bottom Bar */}
                        <div className="space-y-3">
                          <p className="text-[1.35rem] sm:text-[1.6rem] font-medium tracking-[0.25em] text-white/95 drop-shadow-md font-mono" style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.3)" }}>
                            {WEDDING_CONFIG.bankAccount}
                          </p>

                          <div className="flex justify-between items-end">
                            <p className="text-[11px] sm:text-[13px] font-bold tracking-widest uppercase outfit-font text-white/90 drop-shadow-sm">
                              {WEDDING_CONFIG.bankAccountName}
                            </p>

                            {/* Mastercard style circles */}
                            <div className="flex -space-x-3 opacity-60">
                              <div className="w-8 h-8 rounded-full bg-[#EB001B] mix-blend-screen" />
                              <div className="w-8 h-8 rounded-full bg-[#F79E1B] mix-blend-screen" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Primary Color Copy Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => copyToClipboard(WEDDING_CONFIG.bankAccountToCopy)}
                      className="w-full bg-primary hover:bg-primary/90 text-neutral py-[18px] rounded-full flex items-center justify-center gap-3 shadow-xl shadow-primary/20 outfit-font text-[10px] font-bold tracking-[0.3em] uppercase transition-all border border-black/5"
                    >
                      <Copy size={16} />
                      {copied ? 'BERHASIL DISALIN' : 'SALIN NO REKENING'}
                    </motion.button>

                    {/* Physical Gift Section */}
                    <div className="bg-[#EFEDE7] rounded-[25px] p-7 space-y-5 border border-black/5">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-primary">
                          <Gift size={22} />
                        </div>
                        <p className="font-bold text-sm tracking-tight text-primary outfit-font">Kirim Hadiah Fisik</p>
                      </div>
                      <div className="pl-1 space-y-2">
                        <p className="text-[11px] leading-6 text-primary/70 outfit-font italic font-medium">
                          {WEDDING_CONFIG.physicalGiftAddress}
                        </p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] pt-2">
                          (Penerima: {WEDDING_CONFIG.bankAccountName})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
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
    <div className="space-y-6 md:space-y-8">
      {/* Elegant Minimalist Form */}
      {/* Modern Card Form Option */}
      {!displayName ? (
        <div className="max-w-xl mx-auto py-10 relative z-10 px-4">
          <div className="bg-[#fcfbf9] border border-dashed border-[#C19A5B]/50 rounded-[20px] p-8 md:p-12 text-center space-y-6 shadow-sm">
            <div className="flex justify-center">
              <Lock size={32} className="text-[#C19A5B] opacity-80" />
            </div>
            <p className="outfit-font text-[11px] md:text-sm text-primary/70 font-medium leading-[1.8] max-w-sm mx-auto">
              Mohon maaf, fitur pengiriman ucapan hanya tersedia bagi tamu undangan yang menerima tautan khusus.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto pb-4 relative z-10 px-0 sm:px-4">
          <div className="bg-white/95 backdrop-blur-md rounded-[25px] sm:rounded-[30px] p-6 sm:p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-primary/5 space-y-8 w-full">
            
            <div className="space-y-3 relative">
              <label className="outfit-font text-[9.5px] uppercase tracking-[0.3em] font-bold text-primary/40 pl-2">Nama Lengkap</label>
              <div className="bg-primary/5 rounded-[15px] px-5 py-4 border border-transparent">
                <input
                  type="text"
                  value={displayName}
                  readOnly
                  className="w-full bg-transparent text-lg italic serif-font text-primary/80 focus:outline-none cursor-not-allowed placeholder:opacity-0"
                  placeholder="Nama dari undangan"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="outfit-font text-[9.5px] uppercase tracking-[0.3em] font-bold text-primary/40 pl-2 block">Kehadiran</label>
              <div className="flex gap-2.5">
                {(['Hadir', 'Tidak Hadir', 'Masih Ragu'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStatus(opt)}
                    className={cn(
                      "flex-1 py-4 px-2 outfit-font text-[9px] rounded-[15px] transition-all font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2",
                      status === opt
                        ? "bg-primary text-[#FDFBF7] shadow-lg shadow-primary/20 border border-primary"
                        : "bg-white text-primary/40 border border-primary/10 shadow-sm hover:border-primary/30"
                    )}
                  >
                    <span className="text-[10px] leading-none opacity-80 mt-[1px]">
                      {opt === 'Hadir' ? '✓' : opt === 'Tidak Hadir' ? '✕' : '?'}
                    </span>
                    {opt === 'Hadir' ? 'Hadir' : opt === 'Tidak Hadir' ? 'Absen' : 'Ragu'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 relative">
              <label className="outfit-font text-[9.5px] uppercase tracking-[0.3em] font-bold text-primary/40 pl-2">Ucapan & Doa Restu</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white border border-primary/10 rounded-[15px] px-5 py-5 text-base italic focus:outline-none focus:border-primary/40 transition-colors resize-none serif-font text-primary placeholder:text-primary/30 shadow-sm"
                placeholder="Tuliskan pesan & doa tulus Anda..."
                rows={3}
                required
              />
            </div>

            <div className="pt-2">
              <motion.button
                disabled={isSubmitting || !displayName}
                whileHover={isSubmitting || !displayName ? {} : { scale: 1.02, y: -2 }}
                whileTap={isSubmitting || !displayName ? {} : { scale: 0.98 }}
                className={cn(
                  "w-full py-5 bg-primary text-[#FDFBF7] rounded-full font-bold text-[10px] tracking-[0.3em] uppercase shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3",
                  (isSubmitting || !displayName) && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Mengirim...
                  </div>
                ) : (
                  <>
                    <Send size={15} className="opacity-80" />
                    <span className="mt-[1px]">Kirim Ucapan Terbaik</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </form>
      )}

      {/* Wishes Count */}
      {!isLoading && wishes.length > 0 && (
        <div className="text-center">
          <p className="outfit-font text-[10px] uppercase tracking-[0.3em] text-primary/40 font-bold">
            {wishes.length} Ucapan & Doa
          </p>
        </div>
      )}

      {/* Modern Wishes Feed */}
      <div className="space-y-6 md:space-y-8 px-0">
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white/95 backdrop-blur-md rounded-[25px] p-6 shadow-sm border border-primary/5 group relative"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center flex-shrink-0 border border-transparent">
                      <span className="italiana-font text-2xl text-primary/60 mt-1">
                        {wish.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="serif-font text-xl md:text-2xl text-primary">{wish.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-primary/40 outfit-font text-[8.5px] uppercase tracking-[0.2em] mt-1">
                            {wish.timestamp.toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="w-1 h-1 bg-primary/20 rounded-full hidden sm:block mt-1" />
                          <span className={cn(
                            "px-2 py-1 rounded-[10px] text-[8.5px] font-bold uppercase tracking-[0.15em] outfit-font flex items-center gap-1 mt-1",
                            wish.status === 'Hadir' ? "bg-primary/5 text-primary" :
                            wish.status === 'Tidak Hadir' ? "bg-white border border-primary/10 text-primary/40" :
                            "bg-white border border-primary/10 text-primary/50"
                          )}>
                            <span className="text-[10px] leading-none opacity-80 mt-[1px]">
                              {wish.status === 'Hadir' ? '✓' : wish.status === 'Tidak Hadir' ? '✕' : '?'}
                            </span>
                            {wish.status === 'Hadir' ? 'Hadir' : wish.status === 'Tidak Hadir' ? 'Absen' : 'Ragu'}
                          </span>
                        </div>
                      </div>

                      <div className="relative pt-1">
                        <p className="serif-font text-primary/80 italic text-base md:text-lg leading-relaxed">
                          "{wish.message}"
                        </p>
                      </div>
                      
                      {/* Reply Box */}
                      {wish.reply && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          className="mt-6 p-4 md:p-5 bg-primary/5 rounded-[15px] relative"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Heart size={10} fill="currentColor" className="text-primary/30" />
                              <p className="outfit-font text-[8px] font-bold uppercase tracking-[0.3em] text-primary/40">Balasan Mempelai</p>
                            </div>
                            <p className="text-base text-primary/70 italic serif-font leading-relaxed pl-1">
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
