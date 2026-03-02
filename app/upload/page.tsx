"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ChatInterface from "@/components/ChatInterface";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import type { AutoAnalysisResult } from "@/types";

export default function UploadPage() {
  const [pdfUploadId, setPdfUploadId] = useState<string>("");
  const [threadId] = useState<string>(() => crypto.randomUUID());
  const [autoAnalysis, setAutoAnalysis] = useState<AutoAnalysisResult | null>(
    null,
  );

  const handleUploadSuccess = (
    uploadId: string,
    analysis?: AutoAnalysisResult,
  ) => {
    setPdfUploadId(uploadId);
    if (analysis) {
      setAutoAnalysis(analysis);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F8F9FA] to-[#E8F4F5] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1B4332] mb-4">
            Aletheia CSV Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Upload a sustainability report CSV and get instant AI-powered
            analysis
          </p>
        </div>

        {!pdfUploadId ? (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                CSV uploaded successfully. Thread ID: {threadId.substring(0, 8)}
                ...
              </p>
              <button
                onClick={() => {
                  setPdfUploadId("");
                  setAutoAnalysis(null);
                }}
                className="text-[#028090] hover:underline text-sm mt-2"
              >
                Upload a different CSV
              </button>
            </div>

            {/* Two-column layout: Analysis dashboard on left, Chat on right */}
            <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-6 h-[calc(100vh-250px)]">
              {/* Left side: Analysis Dashboard */}
              {autoAnalysis && (
                <div className="order-1 h-full overflow-hidden border rounded-lg bg-white shadow-lg">
                  <AnalysisDashboard analysis={autoAnalysis} />
                </div>
              )}

              {/* Right side: Chat Interface */}
              <div className="order-2 h-full overflow-hidden">
                <ChatInterface pdfUploadId={pdfUploadId} threadId={threadId} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
