"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
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
  RotateCcw,
} from "lucide-react";
import { SpeciesItem } from "@/lib/species";

interface ScrapbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  speciesList: SpeciesItem[];
  initialIndex?: number;
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
      filter.frequency.setValueAtTime(800, ctx.currentTime);
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
}: ScrapbookModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState<number>(1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCover, setShowCover] = useState(false);

  const playSoundRef = useRef<() => void>(() => {});

  useEffect(() => {
    playSoundRef.current = createPageTurnAudio();
  }, []);

  const playTurn = useCallback(() => {
    if (soundEnabled && playSoundRef.current) {
      playSoundRef.current();
    }
  }, [soundEnabled]);

  // Sync initialIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      const idx = initialIndex >= 0 && initialIndex < speciesList.length ? initialIndex : 0;
      setCurrentIndex(idx);
      setShowCover(false);
    }
  }, [isOpen, initialIndex, speciesList.length]);

  const nextPage = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setDirection(1);
    playTurn();
    setCurrentIndex((prev) => (prev + 1 < speciesList.length ? prev + 1 : 0));
    setTimeout(() => setIsFlipping(false), 550);
  }, [isFlipping, playTurn, speciesList.length]);

  const prevPage = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    setDirection(-1);
    playTurn();
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : speciesList.length - 1));
    setTimeout(() => setIsFlipping(false), 550);
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
      opacity: 0.25,
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
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    exit: (dir: number) => ({
      rotateY: dir > 0 ? -45 : 45,
      opacity: 0.25,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Darkened Rainforest Canopy Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#07130c]/90 backdrop-blur-md"
        />

        {/* Modal Outer Container with 3D Perspective */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: "spring", damping: 26, stiffness: 240 }}
          style={{ perspective: "2200px" }}
          className="relative z-10 w-full max-w-5xl my-auto select-none"
        >
          {/* Top Vintage Brass Control Bar */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-bark-950 via-bark-900 to-bark-950 px-4 py-3 text-parchment-200 border-x-4 border-t-4 border-bark-800 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium tracking-wide">
              <BookOpen className="h-4 w-4 text-emerald-400 flex-shrink-0" />
              <span className="font-serif font-bold text-amber-200 hidden xs:inline">
                Natural Science Scrapbook
              </span>
              <span className="text-bark-500 hidden sm:inline">|</span>
              <span className="hidden sm:inline text-xs text-parchment-300">
                Flip pages with <kbd className="px-1.5 py-0.5 rounded bg-bark-800 text-parchment-100 border border-bark-700 font-mono text-[10px]">◀</kbd> <kbd className="px-1.5 py-0.5 rounded bg-bark-800 text-parchment-100 border border-bark-700 font-mono text-[10px]">▶</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-bark-800 text-parchment-100 border border-bark-700 font-mono text-[10px]">ESC</kbd>
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
                className="flex items-center gap-1 rounded-lg bg-bark-800/80 px-2.5 py-1 text-xs text-amber-300 hover:bg-bark-700 transition-colors"
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

          {/* THE 3D BOOK CASING & PAGES */}
          <div className="relative overflow-hidden rounded-b-2xl border-x-4 border-b-4 border-bark-800 bg-[#E8DCB8] shadow-scrapbook">
            
            {/* VIEW A: CLOSED ORNATE LEATHER BOOK COVER */}
            {showCover ? (
              <motion.div
                initial={{ rotateY: -70, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 70, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                className="relative flex flex-col items-center justify-center p-8 sm:p-16 min-h-[540px] bg-gradient-to-br from-[#2D1B11] via-[#3F281B] to-[#1F120A] text-parchment-100 text-center shadow-inner"
              >
                {/* Embossed Ornate Borders */}
                <div className="absolute inset-4 sm:inset-8 border-4 border-amber-600/60 rounded-xl pointer-events-none" />
                <div className="absolute inset-6 sm:inset-10 border border-dashed border-amber-400/40 rounded-lg pointer-events-none" />

                {/* Corner Brass Ornaments */}
                <div className="absolute top-8 left-8 text-amber-400/70 text-2xl font-serif">❧</div>
                <div className="absolute top-8 right-8 text-amber-400/70 text-2xl font-serif">☙</div>
                <div className="absolute bottom-8 left-8 text-amber-400/70 text-2xl font-serif">❧</div>
                <div className="absolute bottom-8 right-8 text-amber-400/70 text-2xl font-serif">☙</div>

                {/* Gold Embossed Title */}
                <div className="max-w-xl mx-auto space-y-4 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/60 border border-amber-500/50 text-amber-300 text-xs font-mono uppercase tracking-widest">
                    <span>NATURAL SCIENCES FIELD ARCHIVE</span>
                  </div>

                  <h1 className="text-3xl sm:text-5xl font-serif font-black text-amber-100 tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                    Picture Book of Wild Life and Plants
                  </h1>

                  <p className="font-serif italic text-amber-200/90 text-sm sm:text-base">
                    A Campus Biodiversity Expedition Journal &amp; Herbarium
                  </p>

                  <div className="pt-6">
                    <button
                      onClick={() => {
                        playTurn();
                        setShowCover(false);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-bark-950 font-serif font-bold text-sm sm:text-base shadow-xl hover:from-amber-500 hover:to-amber-600 hover:scale-105 active:scale-95 transition-all"
                    >
                      <BookOpen className="h-5 w-5" />
                      <span>Open First Page ({speciesList[0].commonName})</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Spine Details */}
                <div className="absolute bottom-12 font-mono text-[11px] text-amber-400/60 tracking-widest">
                  CAMPUS HERBARIUM • 60 FIELD SPECIMENS CATALOGED
                </div>
              </motion.div>
            ) : (
              /* VIEW B: OPEN TWO-PAGE SCRAPBOOK SPREAD WITH 3D PAGE TURN */
              <div className="relative p-3 sm:p-6 lg:p-8 bg-[#F4EBD9]">
                
                {/* Physical Book Central Crease & Binding Shadow */}
                <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-12 bg-gradient-to-r from-black/15 via-black/35 to-black/15 pointer-events-none z-30 shadow-inner" />
                <div className="hidden lg:block absolute inset-y-0 left-1/2 -translate-x-1/2 border-r-2 border-dashed border-bark-900/30 pointer-events-none z-30" />

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
                    className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 relative z-20"
                  >
                    
                    {/* LEFT PAGE: Visual Polaroid & Classification Stamp */}
                    <div className="relative flex flex-col items-center justify-between bg-[#FAF6EE] p-5 sm:p-6 rounded-xl border border-parchment-300 shadow-sm overflow-hidden">
                      
                      {/* Realistic Page Lighting Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/[0.04] to-transparent pointer-events-none" />

                      {/* Washi Tape Corner Accents */}
                      <div className="absolute -top-3 left-6 w-24 h-6 bg-[#C4AC7B]/75 transform -rotate-3 rounded-sm shadow-sm pointer-events-none border border-parchment-400 z-10" />
                      <div className="absolute -top-3 right-6 w-24 h-6 bg-[#B8DCB3]/75 transform rotate-2 rounded-sm shadow-sm pointer-events-none border border-moss-300 z-10" />

                      {/* Top Stamp Label */}
                      <div className="w-full flex items-center justify-between pb-3 border-b border-parchment-300 text-xs text-bark-700 font-mono uppercase tracking-wider relative z-10">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 text-forest-600" />
                          <span className="font-bold">{current.category}</span>
                        </div>
                        <span className="font-semibold text-forest-800">
                          SPECIMEN #{current.id.toString().padStart(3, "0")}
                        </span>
                      </div>

                      {/* Polaroid Frame with Slight Angle */}
                      <div className="my-3 sm:my-4 w-full bg-white p-3 pb-5 rounded shadow-polaroid border border-stone-200 transform -rotate-1 transition-transform hover:rotate-0 relative z-10">
                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-stone-100 border border-stone-200">
                          <Image
                            src={current.imagePath}
                            alt={current.commonName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 500px"
                            priority
                          />
                        </div>

                        {/* Polaroid Handwritten Caption */}
                        <div className="mt-3 text-center">
                          <p className="font-serif text-lg font-bold text-bark-900 leading-tight">
                            {current.commonName}
                          </p>
                          <p className="font-serif italic text-xs text-forest-700">
                            {current.scientificName}
                          </p>
                        </div>
                      </div>

                      {/* Origin Stamped Box */}
                      <div className="w-full rounded-lg bg-parchment-100 p-3 border border-dashed border-bark-400/60 text-xs text-bark-800 relative z-10">
                        <div className="flex items-center gap-1.5 font-bold text-forest-800 mb-1">
                          <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Geographic Origin &amp; Habitat:</span>
                        </div>
                        <p className="leading-relaxed text-stone-700">{current.origin}</p>
                      </div>

                      {/* Dog-ear corner hint on bottom-left for previous page */}
                      <button
                        onClick={prevPage}
                        className="absolute bottom-0 left-0 w-10 h-10 group/peel focus:outline-none"
                        title="Turn to Previous Page"
                      >
                        <div className="w-0 h-0 border-b-[36px] border-b-bark-300 border-r-[36px] border-r-transparent group-hover/peel:border-b-amber-500 transition-colors shadow-sm" />
                      </button>
                    </div>

                    {/* RIGHT PAGE: Botanical Field Notes & Sticky Fun Fact */}
                    <div className="relative flex flex-col justify-between bg-[#FAF6EE] p-5 sm:p-6 rounded-xl border border-parchment-300 shadow-sm overflow-hidden">
                      
                      {/* Realistic Page Lighting Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-l from-stone-900/[0.04] to-transparent pointer-events-none" />

                      {/* Washi Tape Accent */}
                      <div className="absolute -top-3 right-10 w-24 h-6 bg-[#EFE5D1]/85 transform rotate-1 rounded-sm shadow-sm pointer-events-none border border-parchment-400 z-10" />

                      <div className="relative z-10">
                        {/* Page Header */}
                        <div className="border-b-2 border-forest-800/20 pb-3 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[11px] font-bold text-forest-600 tracking-widest uppercase">
                              FIELD OBSERVATION
                            </span>
                            <span className="text-[11px] font-mono text-stone-500">
                              PAGE {currentIndex + 1} OF {speciesList.length}
                            </span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-serif font-black text-forest-950 mt-1 leading-tight">
                            {current.commonName}
                          </h2>
                          <p className="text-sm font-serif italic text-forest-700 font-medium mt-0.5">
                            {current.scientificName}
                          </p>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-1.5 mb-4">
                          <h3 className="font-mono text-xs font-bold uppercase text-bark-700 tracking-wider">
                            Description &amp; Physical Traits
                          </h3>
                          <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-sans bg-parchment-50 p-3.5 rounded-lg border border-parchment-200">
                            {current.description}
                          </p>
                        </div>

                        {/* Yellow Sticky Note for FUN FACT with Push Pin */}
                        <div className="relative mt-3 bg-[#FFF9C4] p-4 pt-5 rounded-md shadow-md border-l-4 border-amber-400 transform rotate-1">
                          {/* Push Pin Visual */}
                          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow-md border border-red-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                          </div>

                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1 uppercase tracking-wide">
                            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                            <span>Explorer&apos;s Fun Fact!</span>
                          </div>

                          <p className="text-sm sm:text-base text-stone-900 font-medium leading-relaxed font-serif">
                            &ldquo;{current.funFact}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Bottom Book Page Controls with Animated Turning Action */}
                      <div className="mt-5 pt-4 border-t border-parchment-300 flex items-center justify-between relative z-10">
                        <button
                          onClick={prevPage}
                          disabled={isFlipping}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bark-800 text-parchment-100 text-xs sm:text-sm font-medium hover:bg-forest-800 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span>Turn Back</span>
                        </button>

                        <div className="text-center font-serif text-xs text-bark-800 font-bold">
                          — {currentIndex + 1} —
                        </div>

                        <button
                          onClick={nextPage}
                          disabled={isFlipping}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-800 text-parchment-100 text-xs sm:text-sm font-medium hover:bg-forest-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
                        >
                          <span>Turn Page</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Dog-ear corner hint on bottom-right for next page turn */}
                      <button
                        onClick={nextPage}
                        className="absolute bottom-0 right-0 w-10 h-10 group/peel focus:outline-none"
                        title="Turn to Next Page"
                      >
                        <div className="w-0 h-0 border-b-[36px] border-b-forest-300 border-l-[36px] border-l-transparent group-hover/peel:border-b-amber-500 transition-colors shadow-sm ml-auto" />
                      </button>

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
