"use client";

import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      <nav className="flex items-center justify-between px-6 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.01] backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Brand */}
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="text-white text-xs">Α</span>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Aletheia
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            Intelligence
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            Audit
          </Link>
          <Link
            href="#"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            Scale
          </Link>
        </div>

        {/* CTA */}
        <div>
          <button className="px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] active:scale-95">
            Get started
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
