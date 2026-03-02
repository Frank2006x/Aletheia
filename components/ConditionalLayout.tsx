"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/landingpage/Navbar";
import ScrollProgress from "@/components/landingpage/ScrollProgress";
import LenisProvider from "@/components/landingpage/LenisProvider";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/sign-in";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <LenisProvider>
      <ScrollProgress />
   
      {children}
    </LenisProvider>
  );
}


