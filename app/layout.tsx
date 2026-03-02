import type { Metadata } from "next";
import { Saira } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Aletheia",
  description:
    "AI-powered platform built on truth. Verifiable, transparent, auditable, immutable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${saira.variable}`}>
      <body className="antialiased">
        <LenisProvider>
          <ScrollProgress />
          <Navbar />
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}
