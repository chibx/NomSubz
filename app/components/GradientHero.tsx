"use client";

import { useEffect, useRef } from "react";

type Blob = { x: number; y: number; vx: number; vy: number; r: number; c: string; a: number };

function makeBlobs(w: number, h: number): Blob[] {
  return [
    { x: w * 0.15, y: h * 0.25, vx: 0.28, vy: 0.18, r: w * 0.42, c: "180,120,140", a: 0.18 },
    { x: w * 0.75, y: h * 0.15, vx: -0.22, vy: 0.28, r: w * 0.36, c: "160,90,115", a: 0.12 },
    { x: w * 0.5,  y: h * 0.7,  vx: 0.18, vy: -0.24, r: w * 0.30, c: "210,170,185", a: 0.14 },
    { x: w * 0.88, y: h * 0.55, vx: -0.26, vy: -0.16, r: w * 0.28, c: "117,48,65", a: 0.09 },
    { x: w * 0.28, y: h * 0.78, vx: 0.14, vy: -0.30, r: w * 0.24, c: "200,155,170", a: 0.11 },
    { x: w * 0.6,  y: h * 0.35, vx: -0.16, vy: 0.22, r: w * 0.20, c: "230,200,210", a: 0.10 },
  ];
}

export function GradientHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let blobs: Blob[] = [];
    let raf = 0;

    function setup() {
      const p = canvas!.parentElement;
      canvas!.width = p?.offsetWidth || window.innerWidth;
      canvas!.height = p?.offsetHeight || 700;
      blobs = makeBlobs(canvas!.width, canvas!.height);
    }
    setup();
    window.addEventListener("resize", setup);

    function draw() {
      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      const w = canvas!.width, h = canvas!.height;
      ctx.clearRect(0, 0, w, h);

      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0,    `rgba(${b.c},${b.a})`);
        g.addColorStop(0.5,  `rgba(${b.c},${b.a * 0.5})`);
        g.addColorStop(1,    `rgba(${b.c},0)`);
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        b.x += b.vx; b.y += b.vy;
        if (b.x < -b.r * 0.3) b.vx = Math.abs(b.vx);
        if (b.x > w + b.r * 0.3) b.vx = -Math.abs(b.vx);
        if (b.y < -b.r * 0.3) b.vy = Math.abs(b.vy);
        if (b.y > h + b.r * 0.3) b.vy = -Math.abs(b.vy);
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", setup); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ filter: "blur(70px)", opacity: 0.9 }}
    />
  );
}
