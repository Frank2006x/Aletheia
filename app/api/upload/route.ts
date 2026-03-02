import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/core/db";
import { csvUploads } from "@/core/db/schema";
import { runAutoAnalysis } from "@/core/agent/pdf-agent";
import type { CsvUploadResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const supplierId = formData.get("supplierId") as string;
    const investorId = formData.get("investorId") as string;

    if (!file) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!supplierId || !investorId) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "supplierId and investorId are required" },
        { status: 400 },
      );
    }

    // Validate file type
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "File must be a CSV" },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "File size must be less than 10MB" },
        { status: 400 },
      );
    }

    // Generate SHA-256 hash for file verification
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Parse CSV content to structured data
    const fileContent = buffer.toString("utf-8");
    const lines = fileContent.trim().split("\n");

    if (lines.length < 2) {
      return NextResponse.json<CsvUploadResponse>(
        {
          success: false,
          error: "CSV file must have header and at least one data row",
        },
        { status: 400 },
      );
    }

    // Parse CSV to JSON
    const headers = lines[0].split(",").map((h) => h.trim());
    const parsedData = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      return row;
    });

    // Store parsed CSV data in Neon database
    const [upload] = await db
      .insert(csvUploads)
      .values({
        supplierId,
        investorId,
        parsedData,
        fileName: file.name,
        fileHash: hash,
        fileSize: file.size,
        uploadLocked: true, // Permanent lock - cannot be re-uploaded
        anomalyScore: 0,
      })
      .returning();

    // Run automatic analysis on the CSV data
    let autoAnalysis;
    try {
      console.log("Starting auto-analysis for CSV upload...");
      // Convert parsedData back to CSV format for agent
      const csvContext = [
        headers.join(","),
        ...parsedData.map((row) => headers.map((h) => row[h]).join(",")),
      ].join("\n");

      autoAnalysis = await runAutoAnalysis(csvContext);
      console.log("Auto-analysis completed successfully");
    } catch (analysisError) {
      console.error(
        "Auto-analysis failed (upload still successful):",
        analysisError,
      );
      // Don't fail the upload if analysis fails
      autoAnalysis = undefined;
    }

    return NextResponse.json<CsvUploadResponse>({
      success: true,
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        fileHash: upload.fileHash,
        fileSize: upload.fileSize,
        uploadedAt: upload.uploadedAt,
      },
      autoAnalysis,
      message: "CSV uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json<CsvUploadResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload CSV",
      },
      { status: 500 },
    );
  }
}
