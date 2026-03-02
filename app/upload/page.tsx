"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ChatInterface from "@/components/ChatInterface";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import { CsvPreview } from "@/components/CsvPreview";
import type { AutoAnalysisResult } from "@/types";
import { useUploadStore } from "@/store/uploadStore";

export default function UploadPage() {
  const {
    pdfUploadId,
    threadId,
    autoAnalysis,
    csvData,
    setPdfUploadId,
    setAutoAnalysis,
    setCsvData,
    reset,
  } = useUploadStore();

  const [activeView, setActiveView] = useState<"analysis" | "csv">("analysis");

  const handleUploadSuccess = (
    uploadId: string,
    csvDataParsed: { headers: string[]; rows: string[][]; fileName: string },
    analysis?: AutoAnalysisResult,
  ) => {
    setPdfUploadId(uploadId);
    setCsvData(csvDataParsed);
    if (analysis) {
      setAutoAnalysis(analysis);
    }
  };

  return (
    <div className="h-screen bg-[#050505] flex flex-col overflow-hidden">
      {/* Header — fixed at top */}
      <div className="relative text-center py-5 px-4 border-b border-white/[0.08] bg-black/40 backdrop-blur-xl flex-shrink-0 z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Aletheia
        </h1>
        <p className="text-sm text-white/40 mt-1">
          Upload a sustainability report CSV and get instant AI-powered analysis
        </p>
        {pdfUploadId && (
          <button
            onClick={reset}
            className="absolute top-1/2 -translate-y-1/2 right-4 px-4 py-2 text-sm font-medium text-red-400 border border-red-500/40 rounded-full hover:bg-red-500/10 transition-all duration-300 flex items-center gap-2"
            title="Reset Analysis"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Reset
          </button>
        )}
      </div>

      {!pdfUploadId ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Left — image cropped to its right portion */}
          <div className="hidden md:block w-1/2 relative flex-shrink-0 overflow-hidden">
            <img
              src="/esg.jpeg"
              alt="ESG background"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "right center" }}
            />
            {/* Subtle right-edge fade into the form panel */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60" />
            {/* Bottom caption */}
            <div className="absolute bottom-10 left-8 right-8 z-10">
              <p className="text-white/90 text-lg font-semibold leading-snug max-w-xs drop-shadow-lg">
                Verifiable ESG data,<br />anchored to the blockchain.
              </p>
              <p className="text-white/50 text-sm mt-1.5 drop-shadow">
                Transparent · Auditable · Immutable
              </p>
            </div>
          </div>

          {/* Right — dark form panel */}
          <div className="flex-1 flex items-center justify-center bg-[#050505] px-8 py-10">
            <div className="w-full max-w-md">
              <UploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Toggle */}
          <div className="border-b border-white/[0.08] px-4 py-2.5 flex gap-2 bg-black/20 flex-shrink-0">
            <button
              onClick={() => setActiveView("analysis")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${activeView === "analysis"
                ? "bg-primary text-black"
                : "bg-white/[0.05] text-white/60 border border-white/[0.08] hover:bg-white/10 hover:text-white"
                }`}
            >
              Analysis Dashboard
            </button>
            <button
              onClick={() => setActiveView("csv")}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${activeView === "csv"
                ? "bg-primary text-black"
                : "bg-white/[0.05] text-white/60 border border-white/[0.08] hover:bg-white/10 hover:text-white"
                }`}
            >
              CSV Preview
            </button>
          </div>

          {/* 75/25 split — left scrolls, right chat is fixed */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left — scrollable content (75%) */}
            <div
              className="flex-[3] overflow-y-auto border-r border-white/[0.08] bg-[#050505]"
              data-lenis-prevent
            >
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
            </div>

            {/* Right — fixed chat (25%) */}
            <div className="flex-1 overflow-hidden bg-black/30 min-w-[300px] max-w-[380px]">
              <ChatInterface pdfUploadId={pdfUploadId} threadId={threadId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
