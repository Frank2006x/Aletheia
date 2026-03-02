"use client";

import HeroScroll from "@/components/HeroScroll";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-background">
      <HeroScroll />
      <section style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
        {/* Background video */}
        <video
          src="/ball.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
        />

        {/* Overlay content */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "48px",
          gap: "32px",
        }}>
          {/* Headline */}
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.15,
            maxWidth: "420px",
            margin: 0,
          }}>
            Why It Works<br />for Everyone
          </h2>

          {/* Cards row */}
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {/* Card 1 */}
            <div style={{
              flex: "1 1 260px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: "16px",
              padding: "28px 28px 32px",
            }}>
              <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "1.05rem", marginBottom: "14px" }}>
                New to Crypto
              </p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: 1.7, margin: 0 }}>
                Avoid beginner mistakes with real-time, understandable advice. Get plain-English breakdowns of complex DeFi interactions. Learn while transacting—no steep learning curve.
              </p>
            </div>

            {/* Card 2 */}
            <div style={{
              flex: "1 1 260px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              borderRadius: "16px",
              padding: "28px 28px 32px",
            }}>
              <p style={{ color: "var(--primary)", fontWeight: 600, fontSize: "1.05rem", marginBottom: "14px" }}>
                DeFi Power User
              </p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem", lineHeight: 1.7, margin: 0 }}>
                Maximize your trading efficiency by saving time, gas, and money. Identify risks that others overlook using live sentiment analysis and smart contract scans. Enhance your trading strategy with behavioral insights and tailored suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
