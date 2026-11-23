"use client";

import React, { useEffect, useRef } from "react";

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

  useEffect(() => {
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

    const maxDrops = 80;
    const drops: RainDrop[] = Array.from({ length: maxDrops }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 3.5 + Math.random() * 5.5,
      length: 14 + Math.random() * 20,
      opacity: 0.18 + Math.random() * 0.25,
    }));

    const ripples: Ripple[] = [];

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update falling rain streaks
      ctx.lineWidth = 1.3;
      for (const drop of drops) {
        ctx.strokeStyle = `rgba(168, 220, 192, ${drop.opacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x - 1.8, drop.y + drop.length);
        ctx.stroke();

        drop.y += drop.speed;
        drop.x -= 0.6; // gentle tropical wind angle

        if (drop.y > height) {
          // Trigger water ripple at the bottom
          if (Math.random() > 0.35) {
            ripples.push({
              x: drop.x,
              y: height - Math.random() * 25,
              radius: 1,
              maxRadius: 12 + Math.random() * 16,
              opacity: 0.38,
            });
          }
          drop.y = -drop.length;
          drop.x = Math.random() * (width + 120);
        }
      }

      // Draw and update gentle water ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.strokeStyle = `rgba(180, 230, 205, ${r.opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.38, 0, 0, Math.PI * 2);
        ctx.stroke();

        r.radius += 0.45;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-10 opacity-75"
      aria-hidden="true"
    />
  );
}
