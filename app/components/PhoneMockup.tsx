"use client";

import { useEffect, useState } from "react";

export function PhoneMockup() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`transition-all duration-1000 ${loaded ? "animate-float opacity-100" : "opacity-0"}`}
      style={{
        transform: loaded ? undefined : "perspective(1000px) rotateY(-18deg) rotateX(6deg) translateY(40px) scale(0.92)",
        animation: loaded ? "tilt-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards, float 5s ease-in-out 1s infinite" : undefined,
      }}
    >
      {/* Phone shell */}
      <div
        className="relative overflow-hidden rounded-[42px] shadow-2xl"
        style={{
          width: 260,
          height: 530,
          background: "linear-gradient(145deg, #1a0f14, #0d0609)",
          border: "1px solid rgba(196,137,154,0.15)",
          boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-4 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />

        {/* Screen content */}
        <div className="absolute inset-0 overflow-hidden rounded-[42px] pt-10" style={{ background: "#0F0A0D" }}>

          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pb-4 pt-2">
            <span className="text-[10px] font-bold text-white/60">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5">
                {[3, 4, 5].map(h => <div key={h} style={{ width: 3, height: h, borderRadius: 2, background: "rgba(255,255,255,0.5)" }} />)}
              </div>
              <svg width="12" height="10" fill="none" viewBox="0 0 24 24">
                <path d="M1.5 8.5C5.5 4.5 18.5 4.5 22.5 8.5" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M5 12c2.8-2.8 12-2.8 14 0" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="12" cy="16" r="2" fill="rgba(255,255,255,0.5)" />
              </svg>
              <div style={{ width: 22, height: 10, borderRadius: 3, border: "1px solid rgba(255,255,255,0.3)", padding: "1px 1px" }}>
                <div style={{ width: "75%", height: "100%", borderRadius: 2, background: "#4ade80" }} />
              </div>
            </div>
          </div>

          {/* App header */}
          <div className="flex items-center justify-between px-5 pb-4">
            <div>
              <p className="text-[10px] font-medium" style={{ color: "rgba(196,137,154,0.8)" }}>Good morning</p>
              <p className="text-[14px] font-black text-white">Dashboard</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(117,48,65,0.4)" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#c4899a" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-2 px-4 pb-4">
            {[
              { label: "Revenue", value: "₦2.4M", up: true },
              { label: "Subscribers", value: "1,284", up: true },
              { label: "Active plans", value: "6", up: false },
              { label: "Churn rate", value: "2.1%", up: false },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="mb-1 text-[9px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                <p className="text-[14px] font-black text-white">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div className="px-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Recent</p>
            {[
              { name: "Acme Corp", plan: "Pro Monthly", status: "active" },
              { name: "Foodco Ltd", plan: "Basic Weekly", status: "active" },
              { name: "TechNG", plan: "Enterprise", status: "paused" },
            ].map((r) => (
              <div key={r.name} className="mb-2 flex items-center justify-between rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <p className="text-[11px] font-semibold text-white">{r.name}</p>
                  <p className="text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>{r.plan}</p>
                </div>
                <div className="rounded-full px-2 py-0.5 text-[8px] font-bold"
                  style={{
                    background: r.status === "active" ? "rgba(74,222,128,0.15)" : "rgba(156,163,175,0.15)",
                    color: r.status === "active" ? "#4ade80" : "#9ca3af",
                  }}>
                  {r.status}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom nav */}
          <div className="absolute bottom-0 inset-x-0 flex items-center justify-around px-4 py-3"
            style={{ background: "rgba(255,255,255,0.03)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {["Home", "Plans", "Customers", "Settings"].map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className="h-4 w-4 rounded-sm" style={{ background: i === 0 ? "#753041" : "rgba(255,255,255,0.15)" }} />
                <span className="text-[8px] font-medium" style={{ color: i === 0 ? "#c4899a" : "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-[42px]"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)" }} />
      </div>

      {/* Glow under phone */}
      <div className="mx-auto mt-4 h-8 w-48 blur-2xl rounded-full"
        style={{ background: "rgba(117,48,65,0.35)" }} />
    </div>
  );
}
