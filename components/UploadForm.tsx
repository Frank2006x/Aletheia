"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CsvUploadResponse, AutoAnalysisResult } from "@/types";

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
      // Parse CSV data
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-[#1B4332]">
          Upload Company Data
        </CardTitle>
        <CardDescription>
          Upload your CSV file to begin analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Supplier ID
          </label>
          <Input
            type="text"
            placeholder="Enter Supplier UUID"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Investor ID
          </label>
          <Input
            type="text"
            placeholder="Enter Investor UUID"
            value={investorId}
            onChange={(e) => setInvestorId(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">CSV File</label>
          <Input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
          {file && (
            <p className="text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file || !supplierId || !investorId || uploading}
          className="w-full bg-[#028090] hover:bg-[#026978]"
        >
          {uploading ? "Uploading & Analyzing..." : "Upload CSV"}
        </Button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
