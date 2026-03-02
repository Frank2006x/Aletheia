"use client";

import HeroScroll from "@/components/landingpage/HeroScroll";
import Features from "@/components/landingpage/Features";
import HowItWorks from "@/components/landingpage/HowItWorks";
import Footer from "@/components/landingpage/Footer";

export default function Home() {
  return (
    <main className="bg-[#050505]">
      <HeroScroll />
      <Features />
      <HowItWorks />

      <section id="value-created" className="relative w-full h-screen overflow-hidden flex flex-col justify-end bg-black">
        {/* Background video */}
        <video
          src="/ball.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        {/* Overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />

        {/* Overlay content */}
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-24 pb-16 md:pb-24 pt-32 flex flex-col xl:flex-row gap-12 xl:gap-24 xl:items-end max-w-[1400px] mx-auto">
          {/* Headline */}
          <div className="flex-shrink-0">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 tracking-tight leading-[1.1]">
              Value Created<br />for Everyone
            </h2>
          </div>

          {/* Cards row */}
          <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
            {/* Supplier Card */}
            <div className="flex-1 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/[0.06] transition-all duration-500">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold mb-6 border border-emerald-500/20">
                For Suppliers
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Effortless Compliance</h3>
              <p className="text-white/60 leading-relaxed text-[15px]">
                No technical integration or manual data entry. Upload your existing ESG report or statements once, and our AI does the rest. Gain instant access to the same analytics the investors see, and use conversational AI to understand how your metrics compare to industry benchmarks.
              </p>
            </div>

            {/* Investor Card */}
            <div className="flex-1 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/[0.06] transition-all duration-500">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-semibold mb-6 border border-indigo-500/20">
                For Investors
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Unshakeable Certainty</h3>
              <p className="text-white/60 leading-relaxed text-[15px]">
                Eliminate greenwashing. Every data point is cryptographically anchored to the blockchain, creating a fully transparent and immutable audit trail. Instantly query thousands of supplier submissions with AI to surface risks and track scope emissions with pinpoint accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
