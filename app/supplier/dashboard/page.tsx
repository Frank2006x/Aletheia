"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
    FileText, Link2, BarChart3, Loader2, ChevronLeft,
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

export default function SupplierDashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isPending && !session) router.push("/sign-in");
    }, [session, isPending, router]);

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

    if (isPending || !session) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#050505]">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>
        );
    }

    const submitted = links.filter((l) => l.status === "used").length;
    const pending = links.filter((l) => l.status === "pending").length;

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-black/70 backdrop-blur-xl border-b border-white/[0.08] px-6 py-4 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        <h1 className="text-xl font-bold text-white tracking-tight">Supplier Dashboard</h1>
                    </div>
                    <p className="text-xs text-white/35 mt-0.5 pl-7">{session.user.email}</p>
                </div>
                <button
                    onClick={() => router.push("/supplier/profile")}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                >
                    <ChevronLeft className="w-3.5 h-3.5" /> Profile
                </button>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Assigned Links", value: links.length, icon: <Link2 className="w-4 h-4 text-white/40" /> },
                        { label: "Pending Upload", value: pending, icon: <Link2 className="w-4 h-4 text-amber-400/70" /> },
                        { label: "Reports Submitted", value: submitted, icon: <FileText className="w-4 h-4 text-indigo-400/70" /> },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-5 flex flex-col items-center gap-1">
                            {stat.icon}
                            <p className="text-3xl font-bold text-white tabular-nums">{stat.value}</p>
                            <p className="text-xs text-white/35 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Reports table */}
                <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-white/40" />
                        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">My Reports</h2>
                    </div>
                    {loading ? (
                        <div className="py-16 flex flex-col items-center gap-3 text-white/30 text-sm">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-400/50" />
                            Loading reports...
                        </div>
                    ) : links.length === 0 ? (
                        <div className="py-16 text-center space-y-2">
                            <FileText className="w-8 h-8 text-white/10 mx-auto" />
                            <p className="text-white/30 text-sm">No reports yet.</p>
                            <p className="text-white/20 text-xs">Upload to a link shared by your investor to get started.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/[0.06]">
                                    {["File", "Status", "Uploaded", "IPFS", "View"].map((h) => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-white/30 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.04]">
                                {links.map((link) => (
                                    <tr key={link.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 text-white/60 text-xs font-medium max-w-[160px] truncate">
                                            {link.report?.fileName ?? <span className="text-white/20 italic">Not uploaded</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${link.status === "used"
                                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${link.status === "used" ? "bg-indigo-400" : "bg-amber-400"}`} />
                                                {link.status === "used" ? "Submitted" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/35 text-xs">
                                            {link.report ? new Date(link.report.uploadedAt).toLocaleDateString() : "—"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {link.report?.ipfsCid ? (
                                                <a href={link.report.ipfsUrl ?? "#"} target="_blank" rel="noopener noreferrer"
                                                    className="text-xs text-indigo-400/70 hover:text-indigo-400 font-mono underline underline-offset-2 transition-colors">
                                                    {link.report.ipfsCid.substring(0, 16)}...
                                                </a>
                                            ) : <span className="text-white/20">—</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {link.status === "used" && (
                                                <button onClick={() => router.push(`/upload/${link.token}`)}
                                                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-500/20 transition-all">
                                                    <BarChart3 className="w-3 h-3" /> View Report
                                                </button>
                                            )}
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
