"use client";

import { useEffect, useState, use } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { CsvPreview } from "@/components/CsvPreview";
import ChatInterface from "@/components/ChatInterface";
import type { AutoAnalysisResult, CsvUploadResponse } from "@/types";

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
  const [autoAnalysis, setAutoAnalysis] = useState<AutoAnalysisResult | null>(
    null,
  );
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"analysis" | "csv">("analysis");
  const [threadId] = useState(() => crypto.randomUUID());

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.push(`/sign-in?callbackUrl=/upload/${token}`);
    }
  }, [session, isPending, router, token]);

  // Fetch link details once authenticated
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
          // Use stored analysis result from DB
          if (data.report.autoAnalysis) {
            setAutoAnalysis(data.report.autoAnalysis as AutoAnalysisResult);
          }
          // Rebuild csvData from parsedData for CsvPreview
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
        const rows = lines
          .slice(1)
          .map((l) => l.split(",").map((c) => c.trim()));
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

      // Refresh link status
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

  // ─── Report view (after upload or already used) ────────────
  const showReport =
    (linkData?.status === "used" && reportData) || autoAnalysis;

  if (showReport) {
    const effectiveUploadId = uploadId ?? reportData?.id ?? "";
    return (
      <div className="h-screen flex flex-col bg-[#F8F9FA]">
        {/* Header */}
        <div className="bg-white shadow-sm border-b px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1B4332]">
              Sustainability Report
            </h1>
            <p className="text-xs text-gray-500">
              {reportData?.fileName ?? csvData?.fileName ?? "Report"}
              {(reportData?.ipfsCid ?? null) && (
                <span className="ml-2">
                  · IPFS:{" "}
                  <a
                    href={reportData?.ipfsUrl ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#028090] font-mono hover:underline"
                  >
                    {reportData!.ipfsCid!.substring(0, 20)}...
                  </a>
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("analysis")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeView === "analysis"
                  ? "bg-[#1B4332] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Analysis
            </button>
            <button
              onClick={() => setActiveView("csv")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeView === "csv"
                  ? "bg-[#1B4332] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              CSV Data
            </button>
            {isInvestor && (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                ← Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_1fr] overflow-hidden">
          <div className="h-full overflow-y-auto bg-white border-r">
            {activeView === "analysis" && autoAnalysis && (
              <AnalysisDashboard analysis={autoAnalysis} />
            )}
            {activeView === "csv" && csvData && (
              <CsvPreview
                headers={csvData.headers}
                rows={csvData.rows}
                fileName={csvData.fileName}
              />
            )}
            {activeView === "analysis" && !autoAnalysis && reportData && (
              <div className="p-6 text-gray-500 text-sm">
                Analysis data not available. The raw CSV is accessible on IPFS.
              </div>
            )}
          </div>
          <div className="h-full overflow-hidden bg-white">
            <ChatInterface
              pdfUploadId={effectiveUploadId}
              threadId={threadId}
            />
          </div>
        </div>
      </div>
    );
  }

  // ─── Investor viewing their own pending link ───────────────
  if (isInvestor && linkData?.status === "pending") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ca8a04"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Waiting for Supplier
          </h2>
          <p className="text-sm text-gray-500">
            This link is pending. Share it with your supplier so they can upload
            their sustainability CSV.
          </p>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs font-mono text-gray-600 break-all">
            {`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/upload/${token}`}
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-2.5 bg-[#1B4332] text-white text-sm font-medium rounded-lg hover:bg-[#2D5F4C] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Supplier upload form ──────────────────────────────────
  return (
    <div className="h-screen flex items-center justify-center bg-[#F8F9FA]">
      <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-md w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1B4332]">
            Upload Sustainability Report
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            You&apos;ve been invited to upload your CSV sustainability data.
            This file will be pinned to IPFS for tamper-proof storage.
          </p>
        </div>

        {/* File drop zone */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            file
              ? "border-[#1B4332] bg-[#E8F4F5]"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {file ? (
            <div className="space-y-2">
              <div className="text-2xl">📄</div>
              <p className="font-medium text-[#1B4332]">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-red-500 hover:underline"
              >
                Remove
              </button>
            </div>
          ) : (
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
              <div className="space-y-2 text-gray-500">
                <div className="text-3xl">☁️</div>
                <p className="font-medium text-sm">
                  Click to select your CSV file
                </p>
                <p className="text-xs">Max 10MB · .csv only</p>
              </div>
            </label>
          )}
        </div>

        {uploadError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {uploadError}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full py-3 bg-[#1B4332] text-white font-medium rounded-xl hover:bg-[#2D5F4C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Uploading & Analyzing...
            </>
          ) : (
            "Upload & Analyze"
          )}
        </button>

        <p className="text-xs text-center text-gray-400">
          Signed in as{" "}
          <span className="font-medium">{session?.user.email}</span>
        </p>
      </div>
    </div>
  );
}

function FullPageSpinner({ message }: { message: string }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 bg-[#F8F9FA]">
      <svg
        className="animate-spin h-6 w-6 text-[#1B4332]"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}

function FullPageError({ message }: { message: string }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-3 bg-[#F8F9FA]">
      <div className="bg-white rounded-2xl border shadow-sm p-8 max-w-sm text-center space-y-3">
        <div className="text-4xl">❌</div>
        <h2 className="font-semibold text-gray-800">Link Error</h2>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
