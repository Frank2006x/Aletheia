"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import ChatInterface from "@/components/ChatInterface";

export default function UploadPage() {
  const [pdfUploadId, setPdfUploadId] = useState<string>("");
  const [threadId] = useState<string>(() => crypto.randomUUID());

  const handleUploadSuccess = (uploadId: string) => {
    setPdfUploadId(uploadId);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#F8F9FA] to-[#E8F4F5] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1B4332] mb-4">
            Aletheia PDF Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Upload a sustainability report and ask questions powered by AI
          </p>
        </div>

        {!pdfUploadId ? (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                PDF uploaded successfully. Thread ID:{" "}
                {threadId.substring(0, 8)}...
              </p>
              <button
                onClick={() => setPdfUploadId("")}
                className="text-[#028090] hover:underline text-sm mt-2"
              >
                Upload a different PDF
              </button>
            </div>
            <ChatInterface pdfUploadId={pdfUploadId} threadId={threadId} />
          </div>
        )}
      </div>
    </div>
  );
}
