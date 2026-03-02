"use client";

import { useEffect } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LogOut,
  Mail,
  ShieldCheck,
  CalendarDays,
  UserRound,
  Chrome,
  Loader2,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users — must be in useEffect, never during render
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  };

  /* ── Loading ──────────────────────────────────────────────────── */
  if (isPending || !session) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "oklch(72.786% 0.24093 143.274)" }}
        />
      </div>
    );
  }

  const { user } = session;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const infoRows = [
    { icon: UserRound,    label: "Full Name",      value: user.name ?? "—" },
    { icon: Mail,         label: "Email",          value: user.email },
    { icon: CalendarDays, label: "Member Since",   value: joinedDate },
    { icon: Chrome,       label: "Auth Provider",  value: "Google OAuth" },
  ];

  /* ── Page ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-4">
      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full opacity-[0.09]"
          style={{
            background:
              "radial-gradient(ellipse, oklch(72.786% 0.24093 143.274) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-xl w-full">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <p className="text-xs text-white/35 tracking-[0.2em] uppercase mb-1">
            Account
          </p>
          <h1 className="text-3xl font-bold text-white">Your Profile</h1>
        </motion.div>

        {/* ── Identity card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <Card className="border-white/[0.07] bg-white/[0.025] overflow-hidden mb-4 shadow-none">
            {/* Banner */}
            <div
              className="h-20 w-full"
              style={{
                background:
                  "linear-gradient(135deg, oklch(72.786% 0.24093 143.274 / 0.18) 0%, oklch(0.7137 0.1434 254.624 / 0.12) 100%)",
              }}
            />

            <CardHeader className="pt-0 pb-4 -mt-10 px-6">
              <div className="flex items-end justify-between">
                {/* Avatar */}
                <Avatar className="w-20 h-20 ring-4 ring-[#050505] rounded-2xl">
                  <AvatarImage
                    src={user.image ?? undefined}
                    alt={user.name ?? "User"}
                    className="rounded-2xl object-cover"
                  />
                  <AvatarFallback
                    className="rounded-2xl text-lg font-bold"
                    style={{
                      background:
                        "oklch(72.786% 0.24093 143.274 / 0.18)",
                      color: "oklch(72.786% 0.24093 143.274)",
                    }}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {/* Sign-out */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-red-500/25 bg-red-500/[0.07] text-red-400 hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/40 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign out
                </Button>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">
                    {user.name ?? "Anonymous"}
                  </h2>
                  {user.emailVerified ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1 py-0"
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold border-amber-500/30 bg-amber-500/10 text-amber-400 py-0"
                    >
                      Unverified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/40 mt-0.5">Aletheia Member</p>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* ── Info card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
        >
          <Card className="border-white/[0.07] bg-white/[0.025] shadow-none">
            <CardContent className="p-0">
              {infoRows.map(({ icon: Icon, label, value }, idx) => (
                <div key={label}>
                  <div className="flex items-center gap-4 px-6 py-4">
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "oklch(72.786% 0.24093 143.274 / 0.08)",
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: "oklch(72.786% 0.24093 143.274)" }}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/35 uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      <p className="text-sm text-white/85 font-medium truncate">
                        {value}
                      </p>
                    </div>
                  </div>
                  {idx < infoRows.length - 1 && (
                    <Separator className="bg-white/[0.05] mx-6 w-auto" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
