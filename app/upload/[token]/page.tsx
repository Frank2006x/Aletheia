"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { CsvPreview } from "@/components/CsvPreview";
import ChatInterface from "@/components/ChatInterface";
import type { AutoAnalysisResult, CsvUploadResponse } from "@/types";
import {
  Loader2,
  AlertCircle,
  UploadCloud,
  FileCheck2,
  X,
  ChevronLeft,
} from "lucide-react";

interface LinkData {
  token: string;
  status: "pending" | "used";
  investorUserId: string;
  supplierUserId: string | null;
  createdAt: string;
}

interface ReportData {
  id: string;
  fileName: string;
  fileHash: string;
  ipfsCid: string | null;
  ipfsUrl: string | null;
  uploadedAt: string;
  parsedData: Record<string, string>[];
}

interface CsvData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

export default function TokenUploadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [linkData, setLinkData] = useState<LinkData | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [linkLoading, setLinkLoading] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Post-upload state
  const [autoAnalysis, setAutoAnalysis] = useState<AutoAnalysisResult | null>(null);
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"analysis" | "csv">("analysis");
  const [threadId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/sign-in?callbackUrl=/upload/${token}`);
    }
  }, [session, isPending, router, token]);

  useEffect(() => {
    if (!session) return;
    const fetchLink = async () => {
      setLinkLoading(true);
      try {
        const res = await fetch(`/api/links/${token}`);
        const data = await res.json();
        if (!data.success) {
          setLinkError(data.error ?? "Link not found");
          return;
        }
        setLinkData(data.link);
        if (data.report) {
          setReportData(data.report);
          if (data.report.autoAnalysis) {
            setAutoAnalysis(data.report.autoAnalysis as AutoAnalysisResult);
          }
          if (data.report.parsedData?.length > 0) {
            const headers = Object.keys(data.report.parsedData[0]);
            const rows = data.report.parsedData.map(
              (row: Record<string, string>) => headers.map((h) => row[h] ?? ""),
            );
            setCsvData({ headers, rows, fileName: data.report.fileName });
          }
        }
      } catch {
        setLinkError("Failed to load link details");
      } finally {
        setLinkLoading(false);
      }
    };
    fetchLink();
  }, [session, token]);

  const parseCsv = (file: File): Promise<CsvData> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((l) => l.trim());
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows = lines.slice(1).map((l) => l.split(",").map((c) => c.trim()));
        resolve({ headers, rows, fileName: file.name });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const parsed = await parseCsv(file);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/upload/${token}`, {
        method: "POST",
        body: formData,
      });
      const data: CsvUploadResponse = await res.json();

      if (!data.success) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }

      setCsvData(parsed);
      setUploadId(data.upload?.id ?? null);
      if (data.autoAnalysis) setAutoAnalysis(data.autoAnalysis);

      const linkRes = await fetch(`/api/links/${token}`);
      const linkJson = await linkRes.json();
      if (linkJson.success) setLinkData(linkJson.link);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ─── Loading states ────────────────────────────────────────
  if (isPending || (!session && !isPending)) {
    return <FullPageSpinner message="Checking authentication..." />;
  }
  if (linkLoading) {
    return <FullPageSpinner message="Loading upload link..." />;
  }
  if (linkError) {
    return <FullPageError message={linkError} />;
  }

  const isInvestor = linkData?.investorUserId === session?.user.id;
  const showReport = (linkData?.status === "used" && reportData) || autoAnalysis;

  // ─── Report view ────────────────────────────────────────────
  if (showReport) {
    const effectiveUploadId = uploadId ?? reportData?.id ?? "";
    return (
      <div className="h-screen flex flex-col bg-[#050505]">
        {/* Header */}
        <div className="relative text-center py-3 px-3 sm:px-4 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl flex-shrink-0 z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 max-w-screen-xl mx-auto">
            <div className="text-left">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Sustainability Report</h1>
              <p className="text-xs text-white/35 mt-0.5 hidden sm:block">
                {reportData?.fileName ?? csvData?.fileName ?? "Report"}
                {reportData?.ipfsCid && (
                  <span className="ml-2">
                    · IPFS:{" "}
                    <a
                      href={reportData?.ipfsUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary/70 font-mono hover:text-primary transition-colors underline underline-offset-2"
                    >
                      {reportData!.ipfsCid!.substring(0, 20)}...
                    </a>
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["analysis", "csv"] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeView === view
                    ? "bg-primary text-black"
                    : "bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]"
                    }`}
                >
                  {view === "analysis" ? "Analysis" : "CSV Data"}
                </button>
              ))}
              <button
                onClick={() => router.push(isInvestor ? "/investor/dashboard" : "/supplier/dashboard")}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.05] text-white/50 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-all"
              >
                <ChevronLeft className="w-3 h-3" /> Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[3fr_1fr] overflow-hidden">
          <div className="flex-1 lg:h-full overflow-y-auto bg-[#050505] border-b lg:border-b-0 lg:border-r border-white/[0.08] min-h-0" data-lenis-prevent>
            {activeView === "analysis" && autoAnalysis && (
              <AnalysisDashboard analysis={autoAnalysis} />
            )}
            {activeView === "csv" && csvData && (
              <CsvPreview headers={csvData.headers} rows={csvData.rows} fileName={csvData.fileName} />
            )}
            {activeView === "analysis" && !autoAnalysis && reportData && (
              <div className="p-8 text-white/30 text-sm text-center mt-16">
                Analysis data not available. The raw CSV is accessible on IPFS.
              </div>
            )}
          </div>
          <div className="h-[50vh] lg:h-full overflow-hidden bg-black/30" data-lenis-prevent>
            <ChatInterface pdfUploadId={effectiveUploadId} threadId={threadId} />
          </div>
        </div>
      </div>
    );
  }

  // ─── Investor viewing pending link ─────────────────────────
  if (isInvestor && linkData?.status === "pending") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050505]">
        <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 max-w-md w-full text-center space-y-4 mx-4">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white">Waiting for Supplier</h2>
          <p className="text-sm text-white/40 leading-relaxed">
            This link is pending. Share it with your supplier so they can upload their sustainability CSV.
          </p>
          <div className="bg-black/50 border border-white/[0.08] rounded-xl px-4 py-3 text-xs font-mono text-white/40 break-all text-left">
            {`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/upload/${token}`}
          </div>
          <button
            onClick={() => router.push(isInvestor ? "/investor/dashboard" : "/supplier/dashboard")}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-black text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Supplier upload form ──────────────────────────────────
  return (
    <div className="h-screen flex items-center justify-center bg-[#050505]">
      <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 max-w-md w-full space-y-6 mx-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-white">Upload Sustainability Report</h1>
          </div>
          <p className="text-sm text-white/40 mt-2 leading-relaxed">
            You&apos;ve been invited to upload your CSV sustainability data. This file will be pinned to IPFS for tamper-proof storage.
          </p>
        </div>

        {/* File drop zone */}
        <label className="cursor-pointer block">
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (!f.name.endsWith(".csv")) {
                  setUploadError("Please select a CSV file");
                  return;
                }
                setFile(f);
                setUploadError(null);
              }
            }}
          />
          <div className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${file
            ? "border-primary/40 bg-primary/[0.04]"
            : "border-white/[0.10] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
            }`}>
            {file ? (
              <>
                <FileCheck2 className="w-8 h-8 text-primary" />
                <p className="font-medium text-white text-sm">{file.name}</p>
                <p className="text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setFile(null); }}
                  className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              </>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 text-white/25" />
                <p className="text-sm text-white/50">
                  <span className="text-primary font-medium">Click to select</span> your CSV file
                </p>
                <p className="text-xs text-white/25">Max 10MB · .csv only</p>
              </>
            )}
          </div>
        </label>

        {uploadError && (
          <div className="flex items-start gap-2.5 p-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{uploadError}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {uploading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading & Analyzing...</>
          ) : (
            <><UploadCloud className="w-4 h-4" /> Upload & Analyze</>
          )}
        </button>

        <p className="text-xs text-center text-white/25">
          Signed in as <span className="text-white/40 font-medium">{session?.user.email}</span>
        </p>
      </div>
    </div>
  );
}

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 bg-[#050505]">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
      <p className="text-sm text-white/35">{message}</p>
    </div>
  );
}

function FullPageError({ message }: { message: string }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 bg-[#050505]">
      <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-2xl p-8 max-w-sm text-center space-y-3">
        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <h2 className="font-semibold text-white">Link Error</h2>
        <p className="text-sm text-white/40">{message}</p>
      </div>
    </div>
  );
}
