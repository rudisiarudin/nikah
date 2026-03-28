import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Reveal } from './Reveal';
import { WEDDING_CONFIG } from '../config';
import Lottie from 'lottie-react';
import birdsData from '../../public/lottie_birds.json';

interface OpeningUIProps {
  onOpen: () => void;
  guestName: string;
}

export const OpeningUI: React.FC<OpeningUIProps> = ({ onOpen, guestName }) => {
  return (
    <motion.div
      exit={{ y: '-100%', opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
      className="fixed inset-0 z-[1000] flex flex-col lg:flex-row overflow-hidden bg-black"
    >
      {/* Panel Kiri (Mobil Full, Desktop 35%) */}
      <div className="relative z-20 w-full lg:w-[35%] h-full flex flex-col items-center justify-between text-center overflow-hidden text-white" style={{ padding: "16vh 20px 8vh 20px", boxSizing: "border-box" }}>
        
        {/* Lottie Birds Overlay Left */}
        <div className="absolute inset-0 z-[1] pointer-events-none opacity-40">
          <Lottie animationData={birdsData} loop={true} className="w-full h-full object-cover" />
        </div>

        {/* Image Background KHUSUS KIRI */}
        <div className="absolute inset-0 z-[-2] bg-[#5c4a3a]">
          <img src={WEDDING_CONFIG.coverImageLeft} alt="Cover Kiri" className="w-full h-full object-cover" />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 z-[-1]" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)" }}></div>

        {/* Decorative Ornaments (Top Corners) */}
        <div className="absolute top-[20px] left-[20px] w-[60px] h-[60px] border-t border-l border-white/40 opacity-60 z-10"></div>
        <div className="absolute top-[20px] right-[20px] w-[60px] h-[60px] border-t border-r border-white/40 opacity-60 z-10"></div>

        {/* Decorative Ornaments (Bottom Corners) */}
        <div className="absolute bottom-[20px] left-[20px] w-[60px] h-[60px] border-b border-l border-white/40 opacity-60 z-10"></div>
        <div className="absolute bottom-[20px] right-[20px] w-[60px] h-[60px] border-b border-r border-white/40 opacity-60 z-10"></div>

        {/* Names Section - Dihilangkan di Desktop agar tidak dobel dengan sebelah kanan */}
        <div className="w-full z-10 lg:hidden">
          <Reveal delay={0.2} y={20}>
            <p className="outfit-font text-[11px] uppercase tracking-[0.4em] mb-[12px] opacity-90 font-normal">
              The Wedding of
            </p>
          </Reveal>
          <Reveal delay={0.4} scale={0.9} duration={1}>
            <h1 className="italiana-font font-normal m-0 mb-[10px] whitespace-nowrap leading-none tracking-wide text-[clamp(60px,12vw,72px)] drop-shadow-xl flex items-center justify-center gap-4" style={{ textShadow: "2px 4px 10px rgba(0,0,0,0.3)" }}>
              <span>Ayu</span>
              <span className="text-[0.6em] opacity-50 font-light italic">&</span>
              <span>Rudi</span>
            </h1>
          </Reveal>
          <Reveal delay={0.6} y={10}>
            <p className="outfit-font text-[14px] opacity-95 tracking-[0.3em] font-normal">
              {WEDDING_CONFIG.weddingDate}
            </p>
          </Reveal>
        </div>

        {/* Guest Section */}
        <div className="w-full mt-auto mb-[40px] lg:mt-0 lg:mb-0 lg:flex-1 lg:flex lg:flex-col lg:justify-center z-10">
          <Reveal delay={0.8} y={20}>
            <p className="serif-font text-[13px] mb-[15px] opacity-90 tracking-[0.08em] italic">
              Kepada Yth. Bapak/Ibu/Saudara/i:
            </p>
          </Reveal>
          <Reveal delay={1} scale={1.1} duration={1}>
            <h2 className="outfit-font text-[38px] lg:text-[46px] font-normal m-0 mb-[15px] capitalize tracking-[0.02em] text-white" style={{ textShadow: "1px 2px 5px rgba(0,0,0,0.2)" }}>
              {guestName}
            </h2>
          </Reveal>
          <Reveal delay={1.2} scale={0} duration={0.8}>
              <div className="w-[40px] h-[1px] bg-white/40 mx-auto mb-[15px]"></div>
          </Reveal>
          <Reveal delay={1.4} y={10}>
            <p className="outfit-font text-[9px] opacity-70 max-w-[280px] mx-auto leading-[1.6] tracking-[0.1em]">
              MOHON MAAF JIKA ADA KESALAHAN PENULISAN NAMA DAN GELAR
            </p>
          </Reveal>
        </div>

        {/* Button Section */}
        <div className="w-full z-10 lg:pb-12">
          <Reveal delay={1.6} y={20}>
            <motion.button
              onClick={onOpen}
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.15)", borderColor: "rgba(255, 255, 255, 0.8)", letterSpacing: "0.35em" }}
              whileTap={{ scale: 0.95 }}
              className="mx-auto flex items-center justify-center gap-[15px] cursor-pointer backdrop-blur-[8px] transition-all duration-500 uppercase w-fit text-[#fff] text-[11px] font-medium tracking-[0.3em] px-[35px] py-[12px] rounded-[4px]"
              style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.4)" }}
            >
              <MessageSquare size={14} />
              OPEN INVITATION
            </motion.button>
          </Reveal>
        </div>
      </div>

      {/* Panel Kanan (Hanya Desktop) */}
      <div className="hidden lg:flex w-[65%] h-full relative z-10 flex-col items-center justify-center text-center pointer-events-none overflow-hidden">
        {/* Lottie Birds Overlay Right */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30 scale-x-[-1]">
          <Lottie animationData={birdsData} loop={true} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 z-[-1]">
          <img src={WEDDING_CONFIG.coverImageRight} alt="Cover Kanan" className="w-full h-full object-cover lg:object-[center_30%]" />
          <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
        </div>
        <div className="space-y-6 lg:mb-20">
          <Reveal delay={0.2} y={20}>
            <p className="outfit-font text-sm uppercase tracking-[0.6em] font-bold text-white drop-shadow-xl opacity-90">The Wedding of</p>
          </Reveal>
          <Reveal delay={0.4} scale={0.9} duration={1}>
            <h1 className="italiana-font text-7xl lg:text-[6rem] text-white drop-shadow-2xl leading-none flex items-center justify-center gap-4">
              <span>Ayu</span>
              <span className="text-4xl lg:text-5xl opacity-50 font-light italic">&</span>
              <span>Rudi</span>
            </h1>
          </Reveal>
          <Reveal delay={0.6} y={-20}>
            <p className="serif-font text-xl tracking-[0.4em] font-bold text-white drop-shadow-xl mt-4 opacity-90">
              {WEDDING_CONFIG.weddingDate}
            </p>
          </Reveal>
        </div>
      </div>

    </motion.div>
  );
};
