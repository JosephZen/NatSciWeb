"use client";

import React, { useState } from "react";
import Image from "next/image";

interface SpeciesImageProps {
  src: string;
  alt: string;
  category: string;
  commonName: string;
  scientificName: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

const categoryIcons: Record<string, string> = {
  Insects: "🦗",
  Arachnids: "🕷️",
  "Flora & Flowers": "🌺",
  "Trees & Ferns": "🌿",
  "Birds & Reptiles": "🦎",
  "Small Fauna": "🦇",
};

const categoryGradients: Record<string, string> = {
  Insects: "from-[#1B382B] via-[#2A5239] to-[#12281D]",
  Arachnids: "from-[#2C1F16] via-[#483424] to-[#1D130C]",
  "Flora & Flowers": "from-[#381B26] via-[#542B3C] to-[#241018]",
  "Trees & Ferns": "from-[#183322] via-[#264D34] to-[#102417]",
  "Birds & Reptiles": "from-[#1B2936] via-[#2B4054] to-[#121D27]",
  "Small Fauna": "from-[#352516] via-[#523A25] to-[#21160C]",
};

export default function SpeciesImage({
  src,
  alt,
  category,
  commonName,
  scientificName,
  className = "",
  sizes,
  priority = false,
}: SpeciesImageProps) {
  const [hasError, setHasError] = useState(false);

  const icon = categoryIcons[category] || "🌱";
  const gradient = categoryGradients[category] || "from-[#1D3B2B] via-[#2C5B42] to-[#122E20]";

  if (hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br ${gradient} text-parchment-100 relative overflow-hidden select-none ${className}`}
      >
        <div className="absolute inset-2 border border-dashed border-amber-300/30 rounded-lg pointer-events-none" />
        <span className="text-4xl sm:text-5xl mb-2 filter drop-shadow">{icon}</span>
        <span className="font-serif font-bold text-base sm:text-lg text-amber-100 leading-tight">
          {commonName}
        </span>
        <span className="font-serif italic text-xs text-emerald-300 mt-0.5 opacity-90">
          {scientificName}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      sizes={sizes || "(max-width: 768px) 100vw, 500px"}
      priority={priority}
      onError={() => setHasError(true)}
    />
  );
}
