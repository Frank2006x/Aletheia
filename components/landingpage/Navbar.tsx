"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { User } from "lucide-react";

const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      <nav className="flex items-center justify-between px-6 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.01] backdrop-blur-[20px] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        {/* Brand */}
        <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Aletheia
          </span>
        </div>

        {/* Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="#features"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            How it Works
          </Link>
          <Link
            href="#value-created"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
          >
            Value Created
          </Link>
        </div>

        {/* CTA / Profile */}
        <div>
          {user ? (
            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.05] hover:bg-white/[0.09] transition-all duration-200 group"
            >
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "Profile"}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: "oklch(72.786% 0.24093 143.274 / 0.25)",
                    color: "oklch(72.786% 0.24093 143.274)",
                  }}
                >
                  {user.name?.[0]?.toUpperCase() ?? <User className="w-3 h-3" />}
                </div>
              )}
              <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors max-w-[120px] truncate">
                {user.name?.split(" ")[0] ?? "Profile"}
              </span>
            </Link>
          ) : (
            <Link
              href="/sign-in"
              className="inline-block px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] active:scale-95"
            >
              Get started
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
