"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LogOut, Mail, ShieldCheck, CalendarDays, Chrome,
    Loader2, TrendingUp, BarChart3, ArrowRight,
} from "lucide-react";

// Isolated so useSearchParams is inside a Suspense boundary
function RoleRegistrar({
    session, router, onDone,
}: {
    session: { user: { id: string } } | null;
    router: ReturnType<typeof useRouter>;
    onDone: () => void;
}) {
    const searchParams = useSearchParams();
    useEffect(() => {
        if (!session) return;
        const setup = async () => {
            if (searchParams.get("role") === "investor") {
                await fetch("/api/role", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: "investor" }),
                });
                router.replace("/investor/profile", { scroll: false });
            }
            onDone();
        };
        setup();
    }, [session, searchParams, router, onDone]);
    return null;
}

export default function InvestorProfilePage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        if (!isPending && !session) router.push("/sign-in");
    }, [isPending, session, router]);

    const handleSignOut = async () => {
        await signOut({ fetchOptions: { onSuccess: () => router.push("/sign-in") } });
    };

    if (isPending || !session || !registered) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <Suspense fallback={null}>
                    <RoleRegistrar session={session} router={router} onDone={() => setRegistered(true)} />
                </Suspense>
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
        );
    }

    const { user } = session;
    const initials = user.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";
    const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric", month: "short", day: "numeric",
    });

    return (
        <div className="min-h-screen bg-[#050505]">
            <Suspense fallback={null}>
                <RoleRegistrar session={session} router={router} onDone={() => setRegistered(true)} />
            </Suspense>
            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-[0.05]"
                    style={{ background: "radial-gradient(ellipse, oklch(72.786% 0.24093 143.274) 0%, transparent 70%)", filter: "blur(80px)" }} />
            </div>

            {/* Topbar */}
            <div className="sticky top-0 z-10 bg-black/60 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-white/80">Aletheia</span>
                    <span className="text-white/20">/</span>
                    <span className="text-white/40">Investor Profile</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}
                    className="text-white/30 hover:text-red-400 hover:bg-red-500/10 gap-1.5">
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                </Button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 grid grid-cols-12 gap-4 sm:gap-6"
            >
                {/* Left — Identity */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                    <Card className="bg-[#0c0c0c] border-white/[0.07] rounded-2xl overflow-hidden shadow-xl p-0 gap-0">
                        <div className="h-1 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent" />
                        <CardContent className="pt-8 pb-7 flex flex-col items-center text-center px-7">
                            <div className="relative mb-5">
                                <div className="absolute inset-[-4px] rounded-2xl"
                                    style={{ boxShadow: "0 0 22px 5px oklch(72.786% 0.24093 143.274 / 0.18)" }} />
                                <Avatar className="w-24 h-24 rounded-2xl ring-2 ring-white/[0.08] relative">
                                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} className="rounded-2xl object-cover" />
                                    <AvatarFallback className="rounded-2xl text-3xl font-bold"
                                        style={{ background: "oklch(72.786% 0.24093 143.274 / 0.1)", color: "oklch(72.786% 0.24093 143.274)" }}>
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                {user.emailVerified && (
                                    <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center ring-2 ring-[#0c0c0c]">
                                        <ShieldCheck className="w-3.5 h-3.5 text-black" />
                                    </span>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">{user.name ?? "User"}</h2>
                            <p className="text-xs text-white/35 mt-1 break-all">{user.email}</p>
                            <Badge className="mt-4 items-center gap-1.5 px-3 py-1 border bg-primary/10 border-primary/25 text-primary text-xs font-semibold">
                                <TrendingUp className="w-3 h-3" /> Investor
                            </Badge>
                        </CardContent>
                    </Card>

                    <Button onClick={() => router.push("/investor/dashboard")}
                        className="w-full flex items-center justify-between bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl px-5 h-11 group">
                        <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Open Dashboard</div>
                        <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </div>

                {/* Right — Details */}
                <div className="col-span-12 lg:col-span-8">
                    <Card className="bg-[#0c0c0c] border-white/[0.07] rounded-2xl shadow-xl gap-0 p-0">
                        <CardHeader className="px-7 pt-6 pb-4">
                            <CardTitle className="text-sm font-semibold text-white/60 uppercase tracking-widest">Account Details</CardTitle>
                        </CardHeader>
                        <Separator className="bg-white/[0.05]" />
                        <CardContent className="px-7 py-2">
                            {[
                                { icon: Mail, label: "Email", value: user.email },
                                { icon: Chrome, label: "Sign-in provider", value: "Google OAuth 2.0" },
                                { icon: CalendarDays, label: "Member since", value: joinedDate },
                            ].map(({ icon: Icon, label, value }, i, arr) => (
                                <div key={label}>
                                    <div className="flex items-center gap-4 py-4">
                                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-3.5 h-3.5 text-white/30" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-white/25 uppercase tracking-widest">{label}</p>
                                            <p className="text-sm text-white/70 font-medium mt-0.5 truncate">{value}</p>
                                        </div>
                                    </div>
                                    {i < arr.length - 1 && <Separator className="bg-white/[0.04]" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}
