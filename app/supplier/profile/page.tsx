"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    LogOut, Mail, ShieldCheck, CalendarDays, Chrome,
    Loader2, Truck, BarChart3, ArrowRight, Activity, Lock,
} from "lucide-react";

function GridBackground() {
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="sup-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#sup-grid)" />
            </svg>
        </div>
    );
}

export default function SupplierProfilePage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [registered, setRegistered] = useState(false);

    // Register supplier role in DB on first visit
    useEffect(() => {
        if (!session) return;
        const setup = async () => {
            const paramRole = searchParams.get("role");
            if (paramRole === "supplier") {
                await fetch("/api/role", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: "supplier" }),
                });
                router.replace("/supplier/profile", { scroll: false });
            }
            setRegistered(true);
        };
        setup();
    }, [session, searchParams, router]);

    useEffect(() => {
        if (!isPending && !session) router.push("/sign-in");
    }, [isPending, session, router]);

    const handleSignOut = async () => {
        await signOut({ fetchOptions: { onSuccess: () => router.push("/sign-in") } });
    };

    if (isPending || !session || !registered) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.05]"
                    style={{ background: "radial-gradient(ellipse, rgba(99,102,241,1) 0%, transparent 70%)", filter: "blur(80px)" }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="relative bg-[#0c0c0c] border border-white/[0.08] rounded-3xl overflow-hidden mb-3 shadow-2xl">
                    <GridBackground />
                    {/* Indigo top accent */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500/60 via-indigo-500/20 to-transparent" />

                    <div className="relative px-8 pt-8 pb-7">
                        {/* Avatar */}
                        <div className="flex flex-col items-center text-center mb-7">
                            <div className="relative mb-4">
                                <div className="absolute inset-[-3px] rounded-2xl"
                                    style={{ boxShadow: "0 0 20px 4px rgba(99,102,241,0.25)" }} />
                                <Avatar className="w-20 h-20 rounded-2xl ring-2 ring-white/[0.10] relative">
                                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} className="rounded-2xl object-cover" />
                                    <AvatarFallback className="rounded-2xl text-2xl font-bold"
                                        style={{ background: "rgba(99,102,241,0.12)", color: "rgba(129,140,248,1)" }}>
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                {user.emailVerified && (
                                    <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center ring-2 ring-[#0c0c0c]">
                                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">{user.name ?? "User"}</h1>
                            <p className="text-sm text-white/35 mt-1">{user.email}</p>
                            <Badge className="mt-3 flex items-center gap-1.5 px-3 py-1 border bg-indigo-500/10 border-indigo-500/25 text-indigo-400 text-xs font-semibold">
                                <Truck className="w-3 h-3" />
                                Supplier
                                <Separator orientation="vertical" className="h-3 bg-current opacity-20 mx-0.5" />
                                <span className="opacity-50 font-normal">ESG Report Submitter</span>
                            </Badge>
                        </div>

                        {/* Stat chips */}
                        <div className="grid grid-cols-3 gap-2 mb-7">
                            {[
                                { icon: Activity, label: "Status", value: "Active" },
                                { icon: Lock, label: "Auth", value: "Google" },
                                { icon: CalendarDays, label: "Since", value: joinedDate.split(",")[1]?.trim() ?? joinedDate },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex flex-col items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
                                    <Icon className="w-3.5 h-3.5 text-white/25 mb-0.5" />
                                    <p className="text-[10px] text-white/25 uppercase tracking-wider">{label}</p>
                                    <p className="text-xs font-semibold text-white/70 text-center leading-tight">{value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Info rows */}
                        <div className="space-y-px rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] mb-6">
                            {[
                                { icon: Mail, label: "Email address", value: user.email },
                                { icon: Chrome, label: "Sign-in provider", value: "Google OAuth 2.0" },
                            ].map(({ icon: Icon, label, value }, i, arr) => (
                                <div key={label}>
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        <Icon className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-white/25 uppercase tracking-wider">{label}</p>
                                            <p className="text-sm text-white/65 font-medium truncate">{value}</p>
                                        </div>
                                    </div>
                                    {i < arr.length - 1 && <div className="h-px bg-white/[0.04] mx-4" />}
                                </div>
                            ))}
                        </div>

                        {/* Dashboard CTA */}
                        <button
                            onClick={() => router.push("/supplier/dashboard")}
                            className="w-full flex items-center justify-between px-5 py-3.5 bg-indigo-500 hover:bg-indigo-500/90 text-white rounded-xl font-semibold text-sm transition-all group"
                        >
                            <div className="flex items-center gap-2.5">
                                <BarChart3 className="w-4 h-4" />
                                Open Supplier Dashboard
                            </div>
                            <ArrowRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Sign out */}
                <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-white/20 hover:text-red-400 border border-white/[0.05] hover:border-red-500/20 rounded-2xl transition-all"
                >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign out of Aletheia
                </button>
            </motion.div>
        </div>
    );
}
