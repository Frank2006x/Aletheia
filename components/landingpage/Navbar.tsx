"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { User, Menu, X } from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileClick = async () => {
    try {
      const res = await fetch("/api/role");
      const data = await res.json();
      const role = data.role as "investor" | "supplier" | null;
      if (role === "supplier") {
        router.push("/supplier/profile");
      } else {
        router.push("/investor/profile");
      }
    } catch {
      router.push("/investor/profile");
    }
  };

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#value-created", label: "Value Created" },
  ];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.01] backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Brand */}
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Aletheia
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side: CTA / Profile + Hamburger */}
        <div className="flex items-center gap-2">
          {/* CTA / Profile — always visible */}
          <div>
            {user ? (
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.09] transition-all duration-200 group"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.image} alt={user.name ?? "Profile"} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{ background: "oklch(72.786% 0.24093 143.274 / 0.25)", color: "oklch(72.786% 0.24093 143.274)" }}
                  >
                    {user.name?.[0]?.toUpperCase() ?? <User className="w-3 h-3" />}
                  </div>
                )}
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors max-w-[120px] truncate hidden sm:inline">
                  {user.name?.split(" ")[0] ?? "Profile"}
                </span>
              </button>
            ) : (
              <Link
                href="/sign-in"
                className="inline-block px-4 sm:px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] active:scale-95"
              >
                Get started
              </Link>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.09] transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4 text-white/80" />
            ) : (
              <Menu className="w-4 h-4 text-white/80" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-2 rounded-2xl border border-white/[0.08] bg-black/80 backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.05] transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
