import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/core/db";
import { csvUploads } from "@/core/db/schema";
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

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    // Store metadata in Neon database
    const [upload] = await db
      .insert(csvUploads)
      .values({
        supplierId,
        investorId,
        fileUrl: blob.url,
        fileName: file.name,
        fileHash: hash,
        fileSize: file.size,
        uploadLocked: true, // Permanent lock - cannot be re-uploaded
        anomalyScore: 0,
      })
      .returning();

    return NextResponse.json<CsvUploadResponse>({
      success: true,
      upload: {
        id: upload.id,
        fileUrl: upload.fileUrl,
        fileName: upload.fileName,
        fileHash: upload.fileHash,
        uploadedAt: upload.uploadedAt,
      },
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
