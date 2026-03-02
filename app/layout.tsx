import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synthio — Intelligence that cannot be compromised",
  description:
    "AI-powered platform built on truth. Verifiable, transparent, auditable, immutable.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
        style={{ backgroundColor: "#050505" }}
      >
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
