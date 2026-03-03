"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import {
    PlusCircle, Copy, Check, Link2, Clock, FileText,
    BarChart3, Loader2, ChevronLeft,
} from "lucide-react";

interface LinkItem {
    id: string;
    token: string;
    uploadUrl: string;
    status: "pending" | "used";
    createdAt: string;
    report: {
        id: string;
        fileName: string;
        fileHash: string;
        ipfsCid: string | null;
        ipfsUrl: string | null;
        uploadedAt: string;
    } | null;
}

export default function InvestorDashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newLink, setNewLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!isPending && !session) router.push("/sign-in");
    }, [session, isPending, router]);

    // Register role on first login
    const searchParams = useSearchParams();
    useEffect(() => {
        if (!session) return;
        if (searchParams.get("role") === "investor") {
            fetch("/api/role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: "investor" }),
            }).then(() => router.replace("/investor/dashboard", { scroll: false }));
        }
    }, [session, searchParams, router]);

    useEffect(() => {
        if (session) fetchLinks();
    }, [session]);

    const fetchLinks = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/links");
            const data = await res.json();
            if (data.success) setLinks(data.links);
        } finally {
            setLoading(false);
        }
    };

    const createLink = async () => {
        setCreating(true);
        try {
            const res = await fetch("/api/links", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setNewLink(data.link.uploadUrl);
                await fetchLinks();
            }
        } finally {
            setCreating(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isPending || !session) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
            </div>
        );
    }

    const stats = [
        { label: "Total Links", value: links.length, icon: <Link2 className="w-4 h-4 text-white/40" /> },
        { label: "Pending", value: links.filter((l) => l.status === "pending").length, icon: <Clock className="w-4 h-4 text-amber-400/70" /> },
        { label: "Reports Received", value: links.filter((l) => l.status === "used").length, icon: <FileText className="w-4 h-4 text-primary/70" /> },
    ];

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/70 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <h1 className="text-xl font-bold text-white tracking-tight">Investor Dashboard</h1>
                    </div>
                    <p className="text-xs text-white/35 mt-0.5 pl-7">{session.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push("/investor/profile")}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Profile
                    </button>
                    <button
                        onClick={createLink}
                        disabled={creating}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black text-sm font-semibold rounded-xl disabled:opacity-40 transition-all"
                    >
                        {creating ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                        ) : (
                            <><PlusCircle className="w-4 h-4" /> Create Upload Link</>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* New link banner */}
                {newLink && (
                    <div className="bg-primary/[0.06] border border-primary/25 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Check className="w-4 h-4 text-primary" />
                            <p className="text-sm font-semibold text-primary">New upload link created! Send this to your supplier:</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 bg-black/50 border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white/70 font-mono break-all">
                                {newLink}
                            </code>
                            <button
                                onClick={() => copyToClipboard(newLink)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary/90 text-black text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
                            >
                                {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                            </button>
                        </div>
                        <button onClick={() => setNewLink(null)} className="text-xs text-white/25 hover:text-white/50 mt-2 underline underline-offset-2 transition-colors">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-5 flex flex-col items-center gap-1">
                            {stat.icon}
                            <p className="text-3xl font-bold text-white tabular-nums">{stat.value}</p>
                            <p className="text-xs text-white/35 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Links table */}
                <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-white/40" />
                        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Upload Links</h2>
                    </div>
                    {loading ? (
                        <div className="py-16 flex flex-col items-center gap-3 text-white/30 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin text-primary/50" />
                            Loading links...
                        </div>
                    ) : links.length === 0 ? (
                        <div className="py-16 text-center space-y-2">
                            <Link2 className="w-8 h-8 text-white/10 mx-auto" />
                            <p className="text-white/30 text-sm">No links yet.</p>
                            <p className="text-white/20 text-xs">Click <span className="text-primary/60 font-medium">Create Upload Link</span> to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {["Token", "Status", "Created", "Report", "Actions"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {links.map((link) => (
                                    <tr key={link.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-white/40">{link.token.substring(0, 12)}...</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${link.status === "used"
                                                    ? "bg-primary/10 text-primary border border-primary/20"
                                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${link.status === "used" ? "bg-primary" : "bg-amber-400"}`} />
                                                {link.status === "used" ? "Uploaded" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/35 text-xs">{new Date(link.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-white/50">
                                            {link.report ? (
                                                <div className="space-y-1">
                                                    <p className="font-medium text-white/70 truncate max-w-[160px] text-xs">{link.report.fileName}</p>
                                                    {link.report.ipfsCid && (
                                                        <a href={link.report.ipfsUrl ?? "#"} target="_blank" rel="noopener noreferrer"
                                                            className="text-xs text-primary/70 hover:text-primary font-mono underline underline-offset-2 transition-colors">
                                                            {link.report.ipfsCid.substring(0, 20)}...
                                                        </a>
                                                    )}
                                                </div>
                                            ) : <span className="text-white/20">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {link.status === "pending" && (
                                                    <button onClick={() => copyToClipboard(link.uploadUrl)}
                                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-white/[0.10] text-white/50 hover:text-white hover:border-white/20 transition-all">
                                                        <Copy className="w-3 h-3" /> Copy Link
                                                    </button>
                                                )}
                                                {link.status === "used" && (
                                                    <button onClick={() => router.push(`/upload/${link.token}`)}
                                                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all">
                                                        <BarChart3 className="w-3 h-3" /> View Report
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
