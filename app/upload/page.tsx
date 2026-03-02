"use client";

import UploadForm from "@/components/UploadForm";
import ChatInterface from "@/components/ChatInterface";
import { AnalysisDashboard } from "@/components/AnalysisDashboard";
import type { AutoAnalysisResult } from "@/types";
import { useUploadStore } from "@/store/uploadStore";

export default function UploadPage() {
  const {
    pdfUploadId,
    threadId,
    autoAnalysis,
    setPdfUploadId,
    setAutoAnalysis,
    reset,
  } = useUploadStore();

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
    <div className="h-screen bg-linear-to-br from-[#F8F9FA] to-[#E8F4F5] ">
      <div className="h-full flex flex-col">
        <div className="text-center py-6 px-4 bg-white shadow-sm">
          <h1 className="text-3xl font-bold text-[#1B4332] mb-2">
            Aletheia CSV Analyzer
          </h1>
          <p className="text-sm text-gray-600">
            Upload a sustainability report CSV and get instant AI-powered
            analysis
          </p>
        </div>

        {!pdfUploadId ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col ">
            <div className="text-center py-3 px-4 bg-white border-b">
              <p className="text-xs text-gray-600">
                CSV uploaded successfully. Thread ID: {threadId.substring(0, 8)}
                ...
              </p>
              <button
                onClick={reset}
                className="text-[#028090] hover:underline text-xs mt-1"
              >
                Upload a different CSV
              </button>
            </div>

            {/* Two-column layout: Analysis dashboard on left (75%), Chat on right (25%) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-0 overflow-hidden">
              {/* Left side: Analysis Dashboard */}
              {autoAnalysis && (
                <div className="h-full overflow-y-auto bg-white border-r">
                  <AnalysisDashboard analysis={autoAnalysis} />
                </div>
              )}

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
