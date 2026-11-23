"use client";

import React from "react";
import { BookOpen, Sparkles } from "lucide-react";

interface FloatingBookButtonProps {
  onClick: () => void;
  count: number;
}

export default function FloatingBookButton({ onClick, count }: FloatingBookButtonProps) {
  return (
    <aside
      aria-label="Interactive Scrapbook Launcher"
      className="fixed bottom-6 right-6 z-40 group pointer-events-auto"
    >
      {/* Tooltip on Hover */}
      <div className="absolute bottom-full right-0 mb-3 hidden sm:group-hover:flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-bark-950/95 px-3 py-1.5 text-xs font-serif font-bold text-parchment-100 shadow-2xl border border-amber-600/40 pointer-events-none backdrop-blur-md animate-bounce">
        <Sparkles className="h-3.5 w-3.5 text-amber-400" />
        <span>Open Scrapbook Cover ({count} Specimens)</span>
      </div>

      <button
        type="button"
        onClick={onClick}
        aria-label="Open Scrapbook Experience"
        className="relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-[#2D1A10] via-[#4A2D1B] to-[#1E110A] text-parchment-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.6),0_0_0_2px_rgba(217,119,54,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(46,125,50,0.5),0_0_0_3px_rgba(102,187,106,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
      >
        {/* Glowing Ambient Ring */}
        <span className="absolute -inset-1.5 rounded-2xl bg-emerald-500/25 blur-md group-hover:bg-emerald-500/45 transition-colors animate-pulse pointer-events-none" />

        {/* Mini Book Corner Brass Details */}
        <span className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400/80 rounded-tl-sm pointer-events-none" />
        <span className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400/80 rounded-tr-sm pointer-events-none" />
        <span className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400/80 rounded-bl-sm pointer-events-none" />
        <span className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400/80 rounded-br-sm pointer-events-none" />

        {/* Central Book Icon with Mini Leaf Accent */}
        <div className="relative flex flex-col items-center justify-center z-10">
          <BookOpen className="h-7 w-7 text-amber-300 group-hover:text-amber-100 group-hover:rotate-6 transition-all drop-shadow" />
          <span className="text-[10px] font-serif font-black tracking-wider uppercase text-amber-200 mt-0.5">
            BOOK
          </span>
        </div>

        {/* Total species counter badge */}
        <span className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-[11px] font-mono font-black text-bark-950 shadow-lg border-2 border-white z-20">
          {count}
        </span>
      </button>
    </aside>
  );
}
