"use client";

import React from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface FloatingBookButtonProps {
  onClick: () => void;
  count: number;
}

export default function FloatingBookButton({ onClick, count }: FloatingBookButtonProps) {
  return (
    <motion.aside
      aria-label="Interactive Scrapbook Launcher"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-6 right-6 z-40 group"
    >
      {/* Tooltip on Hover */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-bark-900/95 px-3 py-1.5 text-xs font-medium text-parchment-100 shadow-xl border border-bark-700 pointer-events-none backdrop-blur-sm animate-fade-in">
        <Sparkles className="h-3 w-3 text-amber-400" />
        <span>Open Scrapbook Experience (ESC anytime)</span>
      </div>

      <button
        onClick={onClick}
        aria-label="Open Scrapbook Experience"
        className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-forest-700 via-forest-800 to-bark-900 text-parchment-100 shadow-2xl border-2 border-emerald-400/40 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      >
        {/* Ambient Pulsing Glow Ring */}
        <span className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md group-hover:bg-emerald-500/40 transition-colors animate-pulse" />

        {/* Book Spine 3D Texture imitation */}
        <div className="relative flex flex-col items-center justify-center">
          <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-amber-200 group-hover:text-amber-100 transition-colors" />
          <span className="text-[9px] font-mono tracking-tighter uppercase font-bold text-emerald-300 mt-0.5">
            Book
          </span>
        </div>

        {/* Total species counter badge */}
        <span className="absolute -top-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-bark-950 shadow-md border-2 border-white">
          {count}
        </span>
      </button>
    </motion.aside>
  );
}
