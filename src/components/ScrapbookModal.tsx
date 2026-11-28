"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  MapPin,
  Tag,
  Volume2,
  VolumeX,
  BookMarked,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { SpeciesItem } from "@/lib/species";
import SpeciesImage from "./SpeciesImage";
import WhiteMesh3D from "./WhiteMesh3D";

interface ScrapbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesList: SpeciesItem[];
  initialIndex?: number;
  initialShowCover?: boolean;
}

// Synthesize authentic paper turn sound via Web Audio API (Zero external assets needed)
function createPageTurnAudio() {
  if (typeof window === "undefined") return () => {};

  return () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Generate paper friction white-noise buffer
      const bufferSize = ctx.sampleRate * 0.22; // 220ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to mimic paper rustling & swooshing frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(850, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.2);
      filter.Q.setValueAtTime(1.8, ctx.currentTime);

      // Volume envelope (gentle rustle attack and decay)
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.21);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.22);
    } catch {
      // Audio context silently ignored if blocked by browser policy
    }
  };
}

export default function ScrapbookModal({
  isOpen,
  onClose,
  speciesList,
  initialIndex = 0,
  initialShowCover = false,
}: ScrapbookModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<number>(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCover, setShowCover] = useState(initialShowCover);
  // On mobile & tablet (< lg), let user view either Photo page or Notes page (never vertically stacked!)
  const [mobileTab, setMobileTab] = useState<"photo" | "notes">("photo");

  const playSoundRef = useRef<() => void>(() => {});

  useEffect(() => {
    playSoundRef.current = createPageTurnAudio();
  }, []);

  const playTurn = useCallback(() => {
    if (soundEnabled && playSoundRef.current) {
      playSoundRef.current();
    }
  }, [soundEnabled]);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      const idx = initialIndex >= 0 && initialIndex < speciesList.length ? initialIndex : 0;
      setCurrentIndex(idx);
      setShowCover(initialShowCover);
      setMobileTab("photo");
    }
  }, [isOpen, initialIndex, initialShowCover, speciesList.length]);

  const nextPage = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setDirection(1);
    playTurn();
    setCurrentIndex((prev) => (prev + 1 < speciesList.length ? prev + 1 : 0));
    setTimeout(() => setIsFlipping(false), 500);
  }, [isFlipping, playTurn, speciesList.length]);

  const prevPage = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setDirection(-1);
    playTurn();
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : speciesList.length - 1));
    setTimeout(() => setIsFlipping(false), 500);
  }, [isFlipping, playTurn, speciesList.length]);

  // Handle ESC key and arrow navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        nextPage();
      } else if (e.key === "ArrowLeft") {
        prevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, nextPage, prevPage, onClose]);

  if (!isOpen || speciesList.length === 0) return null;

  const current = speciesList[currentIndex];

  // 3D realistic book page turning variants
  const bookSpreadVariants: Variants = {
    enter: (dir: number) => ({
      rotateY: dir > 0 ? 45 : -45,
      opacity: 0.3,
      scale: 0.97,
      boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.45)",
      transition: {
        duration: 0.2,
      },
    }),
    center: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      boxShadow: "0 15px 35px -5px rgba(24, 63, 46, 0.3)",
      transition: {
        duration: 0.48,
        ease: "easeInOut",
      },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -45 : 45,
      opacity: 0.3,
      scale: 0.97,
      boxShadow: "0 30px 60px -12px rgba(0, 0, 0, 0.45)",
      transition: {
        duration: 0.45,
        ease: "easeInOut",
      },
    }),
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
        {/* Darkened Rainforest Canopy Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#06120b]/90 backdrop-blur-md"
        />

        {/* Modal Outer Container with 3D Perspective */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 25 }}
          transition={{ type: "spring", damping: 26, stiffness: 240 }}
          style={{ perspective: "2200px" }}
          className="relative z-10 w-full max-w-5xl my-auto select-none"
        >
          {/* Top Vintage Brass Control Bar */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-bark-950 via-bark-900 to-bark-950 px-3 sm:px-5 py-2.5 text-parchment-200 border-x-4 border-t-4 border-bark-800 shadow-xl">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide">
              <BookOpen className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="font-serif font-bold text-amber-200 hidden xs:inline">
                Campus Field Journal &amp; Scrapbook
              </span>
              <span className="text-bark-600 hidden sm:inline">|</span>
              <span className="hidden sm:inline text-xs text-parchment-300">
                Turn pages with <kbd className="px-1.5 py-0.5 rounded bg-bark-800 text-parchment-100 border border-bark-700 font-mono text-[10px]">◀</kbd> <kbd className="px-1.5 py-0.5 rounded bg-bark-800 text-parchment-100 border border-bark-700 font-mono text-[10px]">▶</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-bark-800 text-parchment-100 border border-bark-700 font-mono text-[10px]">ESC</kbd>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex items-center gap-1 rounded-lg bg-bark-800/80 px-2 py-1 text-xs text-parchment-300 hover:bg-bark-700 hover:text-white transition-colors"
                title={soundEnabled ? "Mute Page Turning Sound" : "Enable Page Turning Sound"}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-parchment-400" />
                )}
                <span className="hidden md:inline font-mono text-[11px]">
                  {soundEnabled ? "Sound On" : "Muted"}
                </span>
              </button>

              {/* Cover Toggle */}
              <button
                onClick={() => {
                  playTurn();
                  setShowCover(!showCover);
                }}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  showCover
                    ? "bg-amber-600 text-bark-950 font-bold"
                    : "bg-bark-800/80 text-amber-300 hover:bg-bark-700"
                }`}
                title="View Book Cover"
              >
                <BookMarked className="h-3.5 w-3.5" />
                <span className="font-serif">{showCover ? "Open Pages" : "Book Cover"}</span>
              </button>

              {/* Page Number Indicator */}
              <span className="rounded bg-forest-950/80 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300 border border-forest-700/60">
                {currentIndex + 1} / {speciesList.length}
              </span>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="flex items-center justify-center rounded-full bg-bark-800 p-1.5 text-parchment-300 hover:bg-red-950 hover:text-red-200 transition-colors"
                title="Close Scrapbook (ESC)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* THE 3D BOOK CASING */}
          <div className="relative overflow-hidden rounded-b-2xl border-x-4 border-b-4 border-bark-800 bg-[#E8DCB8] shadow-scrapbook">
            
            {/* ======================================================== */}
            {/* VIEW A: PLAYFUL, OVERLY-USED SCRAPBOOK COVER WITH LEAVES */}
            {/* ======================================================== */}
            {showCover ? (
              <motion.div
                initial={{ rotateY: -60, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 60, opacity: 0 }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
                className="relative flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 min-h-[500px] sm:min-h-[560px] bg-gradient-to-br from-[#452A18] via-[#52331E] to-[#2B180D] text-parchment-100 text-center shadow-inner overflow-hidden"
              >
                {/* Worn Book Spine Cloth Binding with Visible Stitches */}
                <div className="absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-[#1E110A] via-[#2D1B11] to-[#3B2517] border-r-2 border-dashed border-[#A88E65]/50 z-20 shadow-md">
                  <div className="h-full flex flex-col justify-around py-8 items-center opacity-70">
                    <span className="text-amber-200 text-xs">✖</span>
                    <span className="text-amber-200 text-xs">✖</span>
                    <span className="text-amber-200 text-xs">✖</span>
                    <span className="text-amber-200 text-xs">✖</span>
                    <span className="text-amber-200 text-xs">✖</span>
                  </div>
                </div>

                {/* Overly Used Book Wear: Weathered Coffee Ring Stain */}
                <div className="absolute top-8 right-12 w-28 h-28 sm:w-36 sm:h-36 rounded-full border-[6px] border-[#221208]/30 border-dashed pointer-events-none transform rotate-12 blur-[0.5px]">
                  <div className="w-full h-full rounded-full bg-[#221208]/15" />
                </div>

                {/* Scuffed Brass Corners */}
                <div className="absolute top-3 left-12 w-12 h-12 border-t-4 border-l-4 border-amber-600/70 rounded-tl-lg pointer-events-none" />
                <div className="absolute top-3 right-3 w-12 h-12 border-t-4 border-r-4 border-amber-600/70 rounded-tr-lg pointer-events-none" />
                <div className="absolute bottom-3 left-12 w-12 h-12 border-b-4 border-l-4 border-amber-600/70 rounded-bl-lg pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-12 h-12 border-b-4 border-r-4 border-amber-600/70 rounded-br-lg pointer-events-none" />

                {/* PLAYFUL PRESSED LEAVES SCATTERED ACROSS COVER */}
                {/* Leaf 1: Big Tropical Monstera Leaf pinned on Top-Left */}
                <div className="absolute top-6 left-16 sm:left-24 transform -rotate-12 pointer-events-none select-none z-10 group">
                  {/* Washi Tape over stem */}
                  <div className="absolute -top-2 left-2 w-16 h-5 bg-[#C5E1A5]/80 transform rotate-6 border border-[#AED581] shadow-sm z-20" />
                  <svg className="w-20 h-20 sm:w-28 sm:h-28 text-emerald-700/80 filter drop-shadow-md" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 10 C30 10, 15 28, 15 50 C15 72, 30 90, 50 90 C70 90, 85 72, 85 50 C85 28, 70 10, 50 10 Z M50 20 C60 30, 65 42, 60 55 C52 48, 48 35, 50 20 Z M35 35 C42 45, 40 58, 30 65 C25 52, 28 40, 35 35 Z M65 58 C68 46, 75 42, 80 50 C78 60, 70 65, 65 58 Z" />
                  </svg>
                  <span className="text-[10px] font-mono text-emerald-200/75 bg-bark-950/70 px-1 rounded absolute bottom-0 left-2">
                    Monstera sp.
                  </span>
                </div>

                {/* Leaf 2: Green Fern Frond taped on Top-Right */}
                <div className="absolute top-10 right-16 sm:right-28 transform rotate-18 pointer-events-none select-none z-10">
                  <div className="absolute -top-1 right-2 w-14 h-5 bg-[#FFF59D]/80 transform -rotate-12 border border-[#FFEE58] shadow-sm z-20" />
                  <svg className="w-16 h-24 sm:w-24 sm:h-32 text-emerald-600/85 filter drop-shadow" viewBox="0 0 60 100" fill="currentColor">
                    <path d="M30 5 Q35 25 30 95 M30 20 Q10 15 5 25 M30 30 Q50 25 55 35 M30 40 Q10 35 8 45 M30 50 Q50 45 52 55 M30 60 Q12 55 10 65 M30 70 Q48 65 50 75" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                  </svg>
                  <span className="text-[10px] font-mono text-amber-200/75 bg-bark-950/70 px-1 rounded absolute bottom-2 right-1">
                    Polypodiopsida
                  </span>
                </div>

                {/* Leaf 3: Golden Ginkgo Fan Leaf taped at Bottom-Left */}
                <div className="absolute bottom-10 left-16 sm:left-24 transform rotate-12 pointer-events-none select-none z-10">
                  <div className="absolute -top-2 left-1 w-14 h-5 bg-[#FFCCBC]/85 transform rotate-3 border border-[#FFAB91] shadow-sm z-20" />
                  <svg className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500/85 filter drop-shadow" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 90 Q48 60 50 45 Q20 35 25 15 Q50 30 50 25 Q50 30 75 15 Q80 35 50 45 Z" />
                  </svg>
                  <span className="text-[10px] font-mono text-amber-300/80 bg-bark-950/70 px-1 rounded absolute bottom-0 left-1">
                    Ginkgo biloba
                  </span>
                </div>

                {/* Leaf 4: Tropical Palm Frond taped on Bottom-Right */}
                <div className="absolute bottom-8 right-16 sm:right-24 transform -rotate-15 pointer-events-none select-none z-10">
                  <div className="absolute -top-2 right-2 w-14 h-5 bg-[#B2DFDB]/80 transform -rotate-6 border border-[#80CBC4] shadow-sm z-20" />
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 text-lime-600/80 filter drop-shadow" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M20 90 Q50 50 85 20 M85 20 Q65 30 50 45 M85 20 Q70 40 60 60 M85 20 Q55 25 35 35 M85 20 Q50 35 30 55 M85 20 Q60 50 45 75" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  </svg>
                  <span className="text-[10px] font-mono text-lime-200/80 bg-bark-950/70 px-1 rounded absolute bottom-0 right-1">
                    Arecaceae
                  </span>
                </div>

                {/* Weathered Circular Ink Stamp */}
                <div className="absolute top-1/2 left-8 sm:left-14 -translate-y-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-red-700/60 border-dashed flex flex-col items-center justify-center text-red-600/70 transform -rotate-18 pointer-events-none select-none">
                  <span className="text-[9px] font-mono tracking-widest uppercase font-bold">CAMPUS FIELD</span>
                  <span className="text-xl font-bold">HERBARIUM</span>
                  <span className="text-[8px] font-mono tracking-wider">NATSCI • 2026</span>
                </div>

                {/* CENTRAL SCRAPBOOK COVER TITLE (Handmade Kraft Plaque) */}
                <div className="max-w-xl mx-auto space-y-4 relative z-30 px-4 py-6 sm:py-8 bg-[#FAF6EE] text-bark-950 rounded-xl shadow-2xl border-2 border-parchment-400 transform -rotate-0.5">
                  
                  {/* 3D Spinning Meme Cat perched outside the text border (O-I-A-O-I-A-A) */}
                  <div className="absolute -top-14 -right-4 sm:-top-18 sm:-right-8 z-40 pointer-events-auto">
                    <WhiteMesh3D />
                  </div>

                  {/* Washi Tape on Title Plaque Corners */}
                  <div className="absolute -top-3.5 left-8 w-24 h-6 bg-[#C4AC7B]/90 transform -rotate-3 border border-parchment-500 shadow-sm" />
                  <div className="absolute -top-3.5 right-8 w-24 h-6 bg-[#AED581]/90 transform rotate-2 border border-[#9CCC65] shadow-sm" />

                  {/* Little Hand-Drawn Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900 text-emerald-200 text-[11px] font-mono uppercase tracking-widest shadow-sm">
                    <span>🌿 BOTANICAL &amp; WILDLIFE JOURNAL 🌿</span>
                  </div>

                  {/* Main Playful Title */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-forest-950 tracking-tight leading-tight">
                    Picture Book of Wild Life &amp; Plants
                  </h1>

                  <p className="font-serif italic text-forest-800 text-sm sm:text-base font-medium">
                    &ldquo;Field observations, pressed leaves, and natural wonders documented across our campus.&rdquo;
                  </p>

                  <div className="pt-2 sm:pt-4">
                    <button
                      onClick={() => {
                        playTurn();
                        setShowCover(false);
                      }}
                      className="group inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-forest-800 via-forest-700 to-forest-800 text-parchment-100 font-serif font-bold text-sm sm:text-base shadow-xl hover:from-forest-700 hover:to-forest-600 hover:scale-105 active:scale-95 transition-all border border-emerald-400/30"
                    >
                      <BookOpen className="h-5 w-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                      <span>Open Journal to Page 1 ({speciesList[0].commonName})</span>
                    </button>
                  </div>

                  {/* Playful student scribbles */}
                  <div className="flex items-center justify-between pt-2 border-t border-parchment-300 text-[11px] font-mono text-stone-600">
                    <span>Expedition Specimen Log #001–#060</span>
                    <span className="text-forest-700 font-bold">✔ 60 Species Documented</span>
                  </div>
                </div>

                {/* Ribbon bookmark sticking out of the bottom */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-10 bg-red-700 shadow-md border-x border-red-900 pointer-events-none z-40 clip-path-ribbon" />
              </motion.div>
            ) : (
              /* ======================================================== */
              /* VIEW B: SCRAPBOOK PAGES (NEVER VERTICAL ON MOBILE/TABLET!) */
              /* ======================================================== */
              <div className="relative p-2 sm:p-4 lg:p-6 bg-[#F4EBD9]">
                
                {/* Physical Book Central Crease on Desktop (lg:) */}
                <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-black/15 via-black/35 to-black/15 pointer-events-none z-30 shadow-inner" />
                <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 border-r-2 border-dashed border-bark-900/30 pointer-events-none z-30" />

                {/* TABLET / MOBILE VIEWPORT TOGGLE (Prevents vertical stacking!) */}
                <div className="lg:hidden flex items-center justify-center gap-2 mb-3 bg-bark-950/70 p-1.5 rounded-xl border border-bark-700/80 w-fit mx-auto shadow-sm">
                  <button
                    onClick={() => setMobileTab("photo")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                      mobileTab === "photo"
                        ? "bg-forest-700 text-parchment-100 shadow"
                        : "text-parchment-300 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-amber-300" />
                    <span>Photo &amp; Specimen</span>
                  </button>
                  <button
                    onClick={() => setMobileTab("notes")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all ${
                      mobileTab === "notes"
                        ? "bg-forest-700 text-parchment-100 shadow"
                        : "text-parchment-300 hover:text-white"
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5 text-amber-300" />
                    <span>Field Notes &amp; Fun Fact</span>
                  </button>
                </div>

                {/* Animated 3D Page Turn Layer */}
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={bookSpreadVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative z-20"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
                      
                      {/* ==================================================== */}
                      {/* LEFT PAGE: Visual Polaroid & Classification Stamp    */}
                      {/* (Visible on desktop OR when mobileTab === 'photo')   */}
                      {/* ==================================================== */}
                      <div
                        className={`relative flex flex-col items-center justify-between bg-[#FAF6EE] p-4 sm:p-5 rounded-xl border border-parchment-300 shadow-sm overflow-hidden ${
                          mobileTab === "notes" ? "hidden lg:flex" : "flex"
                        }`}
                      >
                        {/* Washi Tape Corner Accents */}
                        <div className="absolute -top-3 left-6 w-20 h-5 bg-[#C4AC7B]/75 transform -rotate-3 rounded-sm shadow-sm pointer-events-none border border-parchment-400 z-10" />
                        <div className="absolute -top-3 right-6 w-20 h-5 bg-[#B8DCB3]/75 transform rotate-2 rounded-sm shadow-sm pointer-events-none border border-moss-300 z-10" />

                        {/* Top Stamp Label */}
                        <div className="w-full flex items-center justify-between pb-2 border-b border-parchment-300 text-xs text-bark-700 font-mono uppercase tracking-wider relative z-10">
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-forest-600" />
                            <span className="font-bold">{current.category}</span>
                          </div>
                          <span className="font-semibold text-forest-800">
                            SPECIMEN #{current.id.toString().padStart(3, "0")}
                          </span>
                        </div>

                        {/* Polaroid Frame with Slight Angle */}
                        <div className="my-2 sm:my-3 w-full max-w-[380px] bg-white p-2.5 sm:p-3 pb-4 rounded shadow-polaroid border border-stone-200 transform -rotate-1 transition-transform hover:rotate-0 relative z-10">
                          <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-stone-100 border border-stone-200">
                            <SpeciesImage
                              src={current.imagePath}
                              alt={current.commonName}
                              category={current.category}
                              commonName={current.commonName}
                              scientificName={current.scientificName}
                              priority
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          </div>

                          {/* Polaroid Handwritten Caption */}
                          <div className="mt-2.5 text-center">
                            <p className="font-serif text-base sm:text-lg font-bold text-bark-900 leading-tight">
                              {current.commonName}
                            </p>
                            <p className="font-serif italic text-xs text-forest-700">
                              {current.scientificName}
                            </p>
                          </div>
                        </div>

                        {/* Origin Stamped Box */}
                        <div className="w-full rounded-lg bg-parchment-100 p-2.5 sm:p-3 border border-dashed border-bark-400/60 text-xs text-bark-800 relative z-10">
                          <div className="flex items-center gap-1.5 font-bold text-forest-800 mb-0.5">
                            <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Geographic Origin:</span>
                          </div>
                          <p className="leading-relaxed text-stone-700 line-clamp-2 sm:line-clamp-none">
                            {current.origin}
                          </p>
                        </div>

                        {/* Bottom Book Page Controls for Mobile 'Photo' Tab */}
                        <div className="lg:hidden w-full mt-3 pt-2 border-t border-parchment-300 flex items-center justify-between">
                          <button
                            onClick={prevPage}
                            disabled={isFlipping}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bark-800 text-parchment-100 text-xs font-medium"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span>Prev</span>
                          </button>
                          <button
                            onClick={() => setMobileTab("notes")}
                            className="text-xs font-serif font-bold text-forest-700 underline"
                          >
                            View Field Notes ➔
                          </button>
                          <button
                            onClick={nextPage}
                            disabled={isFlipping}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forest-800 text-parchment-100 text-xs font-medium"
                          >
                            <span>Next</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Dog-ear corner hint on bottom-left for previous page */}
                        <button
                          onClick={prevPage}
                          className="hidden lg:block absolute bottom-0 left-0 w-10 h-10 group/peel focus:outline-none"
                          title="Turn to Previous Page"
                        >
                          <div className="w-0 h-0 border-b-[36px] border-b-bark-300 border-r-[36px] border-r-transparent group-hover/peel:border-b-amber-500 transition-colors shadow-sm" />
                        </button>
                      </div>

                      {/* ==================================================== */}
                      {/* RIGHT PAGE: Botanical Field Notes & Sticky Fun Fact  */}
                      {/* (Visible on desktop OR when mobileTab === 'notes')   */}
                      {/* ==================================================== */}
                      <div
                        className={`relative flex flex-col justify-between bg-[#FAF6EE] p-4 sm:p-5 rounded-xl border border-parchment-300 shadow-sm overflow-hidden ${
                          mobileTab === "photo" ? "hidden lg:flex" : "flex"
                        }`}
                      >
                        {/* Washi Tape Accent */}
                        <div className="absolute -top-3 right-10 w-20 h-5 bg-[#EFE5D1]/85 transform rotate-1 rounded-sm shadow-sm pointer-events-none border border-parchment-400 z-10" />

                        <div className="relative z-10">
                          {/* Page Header */}
                          <div className="border-b-2 border-forest-800/20 pb-2.5 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] sm:text-[11px] font-bold text-forest-600 tracking-widest uppercase">
                                FIELD OBSERVATION
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-mono text-stone-500">
                                PAGE {currentIndex + 1} OF {speciesList.length}
                              </span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-serif font-black text-forest-950 mt-1 leading-tight">
                              {current.commonName}
                            </h2>
                            <p className="text-xs sm:text-sm font-serif italic text-forest-700 font-medium">
                              {current.scientificName}
                            </p>
                          </div>

                          {/* Description Section */}
                          <div className="space-y-1 mb-3">
                            <h3 className="font-mono text-[11px] font-bold uppercase text-bark-700 tracking-wider">
                              Description &amp; Physical Traits
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans bg-parchment-50 p-3 rounded-lg border border-parchment-200">
                              {current.description}
                            </p>
                          </div>

                          {/* Yellow Sticky Note for FUN FACT with Push Pin */}
                          <div className="relative mt-2 bg-[#FFF9C4] p-3.5 pt-4 rounded-md shadow-md border-l-4 border-amber-400 transform rotate-0.5">
                            {/* Push Pin Visual */}
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow-md border border-red-800 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1 uppercase tracking-wide">
                              <Sparkles className="h-3 w-3 text-amber-700" />
                              <span>Explorer&apos;s Fun Fact!</span>
                            </div>

                            <p className="text-xs sm:text-sm text-stone-900 font-medium leading-relaxed font-serif">
                              &ldquo;{current.funFact}&rdquo;
                            </p>
                          </div>
                        </div>

                        {/* Bottom Book Page Controls */}
                        <div className="mt-4 pt-3 border-t border-parchment-300 flex items-center justify-between relative z-10">
                          <button
                            onClick={prevPage}
                            disabled={isFlipping}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bark-800 text-parchment-100 text-xs font-medium hover:bg-forest-800 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                            <span>Turn Back</span>
                          </button>

                          <div className="lg:hidden">
                            <button
                              onClick={() => setMobileTab("photo")}
                              className="text-xs font-serif font-bold text-forest-700 underline"
                            >
                              ◀ View Photo
                            </button>
                          </div>

                          <div className="hidden lg:block text-center font-serif text-xs text-bark-800 font-bold">
                            — {currentIndex + 1} —
                          </div>

                          <button
                            onClick={nextPage}
                            disabled={isFlipping}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-forest-800 text-parchment-100 text-xs font-medium hover:bg-forest-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                          >
                            <span>Turn Page</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Dog-ear corner hint on bottom-right for next page turn */}
                        <button
                          onClick={nextPage}
                          className="hidden lg:block absolute bottom-0 right-0 w-10 h-10 group/peel focus:outline-none"
                          title="Turn to Next Page"
                        >
                          <div className="w-0 h-0 border-b-[36px] border-b-forest-300 border-l-[36px] border-l-transparent group-hover/peel:border-b-amber-500 transition-colors shadow-sm ml-auto" />
                        </button>

                      </div>

                    </div>
                  </motion.div>
                </AnimatePresence>

              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
