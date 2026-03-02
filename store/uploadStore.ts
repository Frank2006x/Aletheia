import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AutoAnalysisResult } from "@/types";

interface UploadState {
  pdfUploadId: string;
  threadId: string;
  autoAnalysis: AutoAnalysisResult | null;
  setPdfUploadId: (id: string) => void;
  setAutoAnalysis: (analysis: AutoAnalysisResult | null) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadState>()(
  persist(
    (set) => ({
      pdfUploadId: "",
      threadId: typeof crypto !== "undefined" ? crypto.randomUUID() : "",
      autoAnalysis: null,
      setPdfUploadId: (id) => set({ pdfUploadId: id }),
      setAutoAnalysis: (analysis) => set({ autoAnalysis: analysis }),
      reset: () =>
        set({
          pdfUploadId: "",
          autoAnalysis: null,
          threadId: crypto.randomUUID(),
        }),
    }),
    {
      name: "upload-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
