"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { CsvUploadResponse, AutoAnalysisResult } from "@/types";
import { UploadCloud, FileCheck2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface CsvData {
  headers: string[];
  rows: string[][];
  fileName: string;
}

interface UploadFormProps {
  onUploadSuccess: (
    uploadId: string,
    csvData: CsvData,
    autoAnalysis?: AutoAnalysisResult,
  ) => void;
}

export default function UploadForm({ onUploadSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [supplierId, setSupplierId] = useState<string>("");
  const [investorId, setInvestorId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsv = async (file: File): Promise<CsvData> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split("\n").filter((line) => line.trim());
          const headers = lines[0].split(",").map((h) => h.trim());
          const rows = lines
            .slice(1)
            .map((line) => line.split(",").map((cell) => cell.trim()));
          resolve({ headers, rows, fileName: file.name });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.type !== "text/csv" &&
        !selectedFile.name.endsWith(".csv")
      ) {
        setError("Please select a CSV file");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
      setSuccess("");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.type !== "text/csv" && !dropped.name.endsWith(".csv")) {
        setError("Please select a CSV file");
        return;
      }
      setFile(dropped);
      setError("");
      setSuccess("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    if (!supplierId || !investorId) {
      setError("Please enter both Supplier ID and Investor ID");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const csvData = await parseCsv(file);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplierId", supplierId);
      formData.append("investorId", investorId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data: CsvUploadResponse = await response.json();

      if (data.success && data.upload) {
        setSuccess("CSV uploaded successfully!");
        onUploadSuccess(data.upload.id, csvData, data.autoAnalysis);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-[#0a0a0a] border border-white/[0.08]">
      <CardHeader className="pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <UploadCloud className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Upload Company Data
          </CardTitle>
        </div>
        <CardDescription className="text-white/40 text-sm pl-10">
          Upload your CSV file to begin analysis
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Supplier ID */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Supplier ID
          </label>
          <Input
            type="text"
            placeholder="Enter Supplier UUID"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            disabled={uploading}
            className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20 rounded-lg"
          />
        </div>

        {/* Investor ID */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            Investor ID
          </label>
          <Input
            type="text"
            placeholder="Enter Investor UUID"
            value={investorId}
            onChange={(e) => setInvestorId(e.target.value)}
            disabled={uploading}
            className="bg-white/[0.04] border-white/[0.10] text-white placeholder:text-white/25 focus:border-primary/50 focus:ring-primary/20 rounded-lg"
          />
        </div>

        {/* File Drop Zone */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
            CSV File
          </label>
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 cursor-pointer transition-all duration-200 ${dragOver
                ? "border-primary/60 bg-primary/5"
                : file
                  ? "border-primary/30 bg-primary/[0.04]"
                  : "border-white/[0.10] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
              className="hidden"
            />
            {file ? (
              <>
                <FileCheck2 className="w-8 h-8 text-primary" />
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-white/40">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
                </p>
              </>
            ) : (
              <>
                <UploadCloud className={`w-8 h-8 ${dragOver ? "text-primary" : "text-white/30"}`} />
                <p className="text-sm text-white/50">
                  <span className="text-primary font-medium">Click to upload</span> or drag & drop
                </p>
                <p className="text-xs text-white/25">CSV files only</p>
              </>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || !supplierId || !investorId || uploading}
          className="w-full bg-primary hover:bg-primary/90 text-black font-semibold rounded-xl py-5 disabled:opacity-30 transition-all duration-300"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading & Analyzing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              Upload CSV
            </span>
          )}
        </Button>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 bg-red-500/[0.08] border border-red-500/20 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="flex items-start gap-2.5 p-3 bg-primary/[0.08] border border-primary/20 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-primary/90">{success}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
