import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AutoAnalysisResult } from "@/types";

interface CsvData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

interface UploadState {
  pdfUploadId: string;
  threadId: string;
  autoAnalysis: AutoAnalysisResult | null;
  csvData: CsvData | null;
  setPdfUploadId: (id: string) => void;
  setAutoAnalysis: (analysis: AutoAnalysisResult | null) => void;
  setCsvData: (data: CsvData | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>()(
  persist(
    (set) => ({
      pdfUploadId: "",
      threadId: typeof crypto !== "undefined" ? crypto.randomUUID() : "",
      autoAnalysis: null,
      csvData: null,
      setPdfUploadId: (id) => set({ pdfUploadId: id }),
      setAutoAnalysis: (analysis) => set({ autoAnalysis: analysis }),
      setCsvData: (data) => set({ csvData: data }),
      reset: () =>
        set({
          pdfUploadId: "",
          autoAnalysis: null,
          csvData: null,
          threadId: crypto.randomUUID(),
        }),
    }),
    {
      name: "upload-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
