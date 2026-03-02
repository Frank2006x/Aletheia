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
    <div className="h-screen bg-linear-to-br from-[#F8F9FA] to-[#E8F4F5] ">
      <div className="h-full flex flex-col">
        <div className="relative text-center py-6 px-4 bg-white shadow-sm">
          <h1 className="text-3xl font-bold text-[#1B4332] mb-2">
            Aletheia CSV Analyzer
          </h1>
          <p className="text-sm text-gray-600">
            Upload a sustainability report CSV and get instant AI-powered
            analysis
          </p>
          {pdfUploadId && (
            <button
              onClick={reset}
              className="absolute top-6 right-4 px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center gap-2"
              title="Reset Analysis"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
          <div className="flex-1 flex items-center justify-center p-4">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col ">
            {/* View Toggle */}
            <div className="bg-white border-b px-4 py-2 flex gap-2">
              <button
                onClick={() => setActiveView("analysis")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === "analysis"
                    ? "bg-[#1B4332] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Analysis Dashboard
              </button>
              <button
                onClick={() => setActiveView("csv")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === "csv"
                    ? "bg-[#1B4332] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                CSV Preview
              </button>
            </div>

            {/* Two-column layout: Analysis/CSV dashboard on left (75%), Chat on right (25%) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-0 overflow-hidden">
              {/* Left side: Analysis Dashboard or CSV Preview */}
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
              </div>

              {/* Right side: Chat Interface */}
              <div className="h-full overflow-hidden bg-white">
                <ChatInterface pdfUploadId={pdfUploadId} threadId={threadId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
