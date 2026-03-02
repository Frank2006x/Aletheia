"use client";

import HeroScroll from "@/components/landingpage/HeroScroll";
import Features from "@/components/landingpage/Features";
import HowItWorks from "@/components/landingpage/HowItWorks";
import Footer from "@/components/landingpage/Footer";
import Navbar from "@/components/landingpage/Navbar";
import ValueCreated from "@/components/landingpage/ValueCreated";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-[#050505]">
        <HeroScroll />
        <Features />
        <HowItWorks />
        <ValueCreated />
        <Footer />
      </main>
    </>
  );
}
