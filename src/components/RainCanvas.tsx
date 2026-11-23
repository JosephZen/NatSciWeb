"use client";

import React, { useEffect, useRef, useState } from "react";
import { CloudRain, CloudOff } from "lucide-react";

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

export default function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const maxDrops = 75;
    const drops: RainDrop[] = Array.from({ length: maxDrops }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 3 + Math.random() * 5,
      length: 12 + Math.random() * 18,
      opacity: 0.15 + Math.random() * 0.25,
    }));

    const ripples: Ripple[] = [];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update rain drops
      ctx.lineWidth = 1.2;
      for (const drop of drops) {
        ctx.strokeStyle = `rgba(164, 214, 185, ${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1.5, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 0.6; // slight angle imitation of tropical breeze

        if (drop.y > height) {
          // Trigger a ripple at bottom
          if (Math.random() > 0.4) {
            ripples.push({
              x: drop.x,
              y: height - Math.random() * 20,
              radius: 1,
              maxRadius: 10 + Math.random() * 14,
              opacity: 0.35,
            });
          }
          drop.y = -drop.length;
          drop.x = Math.random() * (width + 100);
        }
      }

      // Draw and update water ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.strokeStyle = `rgba(180, 225, 200, ${r.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();

        r.radius += 0.4;
        r.opacity -= 0.008;

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [enabled]);

  return (
    <>
      {enabled && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none fixed inset-0 z-10 opacity-70"
          aria-hidden="true"
        />
      )}
      <button
        type="button"
        onClick={() => setEnabled(!enabled)}
        className="fixed top-4 right-4 z-40 flex items-center gap-1.5 rounded-full border border-forest-600/40 bg-forest-900/80 px-3 py-1.5 text-xs text-parchment-200 shadow-md backdrop-blur-md transition-all hover:bg-forest-800 hover:text-white"
        title={enabled ? "Mute Rainforest Rain" : "Enable Rainforest Rain"}
      >
        {enabled ? <CloudRain className="h-3.5 w-3.5 text-emerald-400" /> : <CloudOff className="h-3.5 w-3.5 text-parchment-400" />}
        <span className="font-medium">{enabled ? "Rain On" : "Rain Off"}</span>
      </button>
    </>
  );
}
