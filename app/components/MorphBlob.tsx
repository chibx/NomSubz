"use client";

import { useEffect, useRef } from "react";

/**
 * Cinematic morphing blob — graphite body, wine (#753041) heat bleeding
 * through the lower edge, soft ambient rose behind. Pure canvas, no assets.
 */
export function MorphBlob({ size = 620 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.30;
    const SEGMENTS = 180;

    let raf = 0;
    let t = 0;

    // radius field — layered sine noise for the organic morph
    function radius(theta: number, time: number) {
      return (
        R *
        (1 +
          0.10 * Math.sin(3 * theta + time * 0.7) +
          0.06 * Math.sin(5 * theta - time * 0.45) +
          0.045 * Math.sin(7 * theta + time * 0.9) +
          0.025 * Math.sin(11 * theta - time * 0.6))
      );
    }

    function blobPath(time: number, scale = 1) {
      ctx!.beginPath();
      for (let i = 0; i <= SEGMENTS; i++) {
        const theta = (i / SEGMENTS) * Math.PI * 2;
        const r = radius(theta, time) * scale;
        const x = cx + r * Math.cos(theta);
        const y = cy + r * Math.sin(theta);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.closePath();
    }

    function draw() {
      t += 0.008;
      ctx!.clearRect(0, 0, size, size);

      // ── ambient rose halo behind everything
      const halo = ctx!.createRadialGradient(cx, cy + R * 0.4, 0, cx, cy, R * 2.1);
      halo.addColorStop(0, "rgba(117,48,65,0.14)");
      halo.addColorStop(0.55, "rgba(160,90,115,0.05)");
      halo.addColorStop(1, "rgba(160,90,115,0)");
      ctx!.fillStyle = halo;
      ctx!.fillRect(0, 0, size, size);

      // ── wine heat glow — slightly larger blob, blurred, offset down
      ctx!.save();
      ctx!.filter = "blur(28px)";
      ctx!.translate(0, R * 0.18);
      blobPath(t + 0.5, 1.02);
      const heat = ctx!.createLinearGradient(cx, cy - R, cx, cy + R * 1.3);
      heat.addColorStop(0, "rgba(117,48,65,0)");
      heat.addColorStop(0.6, "rgba(117,48,65,0.35)");
      heat.addColorStop(1, "rgba(150,55,80,0.85)");
      ctx!.fillStyle = heat;
      ctx!.fill();
      ctx!.restore();

      // ── main graphite body
      blobPath(t);
      const body = ctx!.createLinearGradient(cx - R * 0.4, cy - R * 1.1, cx + R * 0.3, cy + R * 1.15);
      body.addColorStop(0, "#EFEFF2");
      body.addColorStop(0.32, "#C3C4CA");
      body.addColorStop(0.62, "#7E7F86");
      body.addColorStop(0.86, "#3E3F45");
      body.addColorStop(1, "#232428");
      ctx!.fillStyle = body;
      ctx!.fill();

      // ── wine bleed inside the body (clipped) — burns up from the bottom
      ctx!.save();
      blobPath(t);
      ctx!.clip();
      const bleed = ctx!.createRadialGradient(
        cx - R * 0.25, cy + R * 1.05, 0,
        cx - R * 0.25, cy + R * 1.05, R * 1.35,
      );
      bleed.addColorStop(0, "rgba(190,70,100,0.9)");
      bleed.addColorStop(0.35, "rgba(150,55,80,0.55)");
      bleed.addColorStop(0.7, "rgba(117,48,65,0.12)");
      bleed.addColorStop(1, "rgba(117,48,65,0)");
      ctx!.fillStyle = bleed;
      ctx!.fill();

      // ── specular highlight, top-left
      const spec = ctx!.createRadialGradient(
        cx - R * 0.45, cy - R * 0.55, 0,
        cx - R * 0.45, cy - R * 0.55, R * 0.9,
      );
      spec.addColorStop(0, "rgba(255,255,255,0.75)");
      spec.addColorStop(0.35, "rgba(255,255,255,0.18)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.fillStyle = spec;
      ctx!.fill();
      ctx!.restore();

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => cancelAnimationFrame(raf);
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: "block" }}
      aria-hidden
    />
  );
}
