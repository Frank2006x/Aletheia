"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full relative bg-background border-t border-border pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
             
              <span className="text-foreground font-bold text-xl tracking-tight">Aletheia</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Building the verifiable foundation for the next generation of artificial intelligence. Auditable, immutable, and transparent.
            </p>
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Global Network Active</span>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-foreground font-bold text-sm mb-6 uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Intelligence</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Model Verification</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">State History</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Scalability</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold text-sm mb-6 uppercase tracking-widest">Network</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Explorers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Node Validators</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Governance</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Staking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-foreground font-bold text-sm mb-6 uppercase tracking-widest">Contact</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Twitter</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Discord</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Github</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">Documentation</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-muted-foreground text-xs font-medium">
            &copy; {new Date().getFullYear()} Aletheia Labs. All rights reserved.
          </div>
          <div className="flex items-center gap-8">
            <Link href="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors duration-200">Privacy Policy</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors duration-200">Terms of Service</Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors duration-200">Security Audit</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
