import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, #e4e4e7 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.6,
          display: "flex",
        }} />
        <div style={{
          position: "absolute", right: -20, bottom: -40,
          fontSize: "320px", fontWeight: 900, color: "#f4f4f5",
          letterSpacing: "-0.05em", lineHeight: 1, display: "flex",
        }}>N</div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
          <div style={{
            width: "44px", height: "44px", background: "#0A0A0A",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#0A0A0A", letterSpacing: "-0.02em" }}>NomSubz</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f4f4f5", borderRadius: "100px", padding: "6px 14px", width: "fit-content",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0A0A0A" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#6B6B70", letterSpacing: "0.04em" }}>POWERED BY NOMBA</span>
          </div>
          <div style={{ fontSize: "72px", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.04em", lineHeight: 1.02, display: "flex", flexDirection: "column" }}>
            <span>Recurring billing,</span>
            <span style={{ color: "#6B6B70" }}>built for Nigeria.</span>
          </div>
          <div style={{ fontSize: "20px", color: "#6B6B70", fontWeight: 400, lineHeight: 1.5, maxWidth: "580px", display: "flex" }}>
            Subscription plans, automated invoicing, and Nomba card payments managed from one clean dashboard.
          </div>
        </div>
        <div style={{ display: "flex", gap: "40px", position: "relative" }}>
          {[
            { value: "2.4M+", label: "NGN processed monthly" },
            { value: "1,284", label: "Active subscribers" },
            { value: "99.9%", label: "Billing uptime" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#0A0A0A", letterSpacing: "-0.03em" }}>{s.value}</span>
              <span style={{ fontSize: "13px", color: "#6B6B70", fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
