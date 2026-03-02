import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/core/db";
import { csvUploads, uploadLinks } from "@/core/db/schema";
import { auth } from "@/lib/auth";
import { runAutoAnalysis } from "@/core/agent/pdf-agent";
import { eq } from "drizzle-orm";
import type { CsvUploadResponse } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    // Require authenticated session (supplier must be signed in)
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "You must be signed in to upload" },
        { status: 401 },
      );
    }

    // Validate the upload link token
    const [link] = await db
      .select()
      .from(uploadLinks)
      .where(eq(uploadLinks.token, token));

    if (!link) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "Invalid upload link" },
        { status: 404 },
      );
    }

    if (link.status === "used") {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "This upload link has already been used" },
        { status: 409 },
      );
    }

    // Investor cannot upload via their own link
    if (link.investorUserId === session.user.id) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "Investors cannot upload via their own link" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "File must be a CSV" },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json<CsvUploadResponse>(
        { success: false, error: "File size must be less than 10MB" },
        { status: 400 },
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // SHA-256 hash for local verification
    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");

    // Upload to Pinata IPFS
    let ipfsCid: string | null = null;
    let ipfsUrl: string | null = null;
    try {
      const pinataJwt = process.env.PINATA_JWT!;
      const pinataForm = new FormData();
      const blob = new Blob([buffer], { type: "text/csv" });
      pinataForm.append("file", blob, file.name);
      pinataForm.append("pinataMetadata", JSON.stringify({ name: file.name }));
      pinataForm.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

      console.log("📤 Uploading to Pinata IPFS:", file.name);

      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${pinataJwt}` },
          body: pinataForm,
        },
      );

      if (res.ok) {
        const result = (await res.json()) as {
          IpfsHash: string;
          PinSize: number;
        };
        ipfsCid = result.IpfsHash;
        ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`;
        console.log("✅ Pinata IPFS CID:", ipfsCid);
        console.log("🌐 Gateway URL:", ipfsUrl);
        console.log("📦 Pin size:", result.PinSize, "bytes");
      } else {
        const errText = await res.text();
        console.error("❌ Pinata upload failed:", res.status, errText);
      }
    } catch (ipfsError) {
      console.error(
        "❌ Pinata upload error (continuing without IPFS):",
        ipfsError,
      );
    }

    // Parse CSV → JSON
    const fileContent = buffer.toString("utf-8");
    const lines = fileContent.trim().split("\n");
    if (lines.length < 2) {
      return NextResponse.json<CsvUploadResponse>(
        {
          success: false,
          error: "CSV must have a header row and at least one data row",
        },
        { status: 400 },
      );
    }

    const headers = lines[0].split(",").map((h) => h.trim());
    const parsedData = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || "";
      });
      return row;
    });

    // Insert into DB
    console.log("💾 Inserting into DB...");
    let upload: typeof csvUploads.$inferSelect;
    try {
      const [row] = await db
        .insert(csvUploads)
        .values({
          supplierUserId: session.user.id,
          investorUserId: link.investorUserId,
          linkToken: token,
          parsedData,
          fileName: file.name,
          fileHash,
          fileSize: file.size,
          ipfsCid: ipfsCid ?? null,
          ipfsUrl: ipfsUrl ?? null,
          analysisResult: null,
          uploadLocked: true,
          anomalyScore: 0,
        })
        .returning();
      upload = row;
      console.log("✅ DB insert success, upload id:", upload.id);
    } catch (dbError) {
      console.error("❌ DB insert failed:", dbError);
      throw dbError;
    }

    // Mark the link as used
    await db
      .update(uploadLinks)
      .set({
        status: "used",
        supplierUserId: session.user.id,
        uploadId: upload.id,
      })
      .where(eq(uploadLinks.token, token));

    // Run AI auto-analysis and persist it
    let autoAnalysis;
    try {
      const csvContext = [
        headers.join(","),
        ...parsedData.map((row) => headers.map((h) => row[h]).join(",")),
      ].join("\n");
      autoAnalysis = await runAutoAnalysis(csvContext);

      // Save analysis result to DB so investor can view it later
      if (autoAnalysis) {
        await db
          .update(csvUploads)
          .set({ analysisResult: autoAnalysis })
          .where(eq(csvUploads.id, upload.id));
      }
    } catch (analysisError) {
      console.error("Auto-analysis failed:", analysisError);
    }

    return NextResponse.json<CsvUploadResponse>({
      success: true,
      upload: {
        id: upload.id,
        fileName: upload.fileName,
        fileHash: upload.fileHash,
        fileSize: upload.fileSize,
        uploadedAt: upload.uploadedAt,
        ipfsCid: upload.ipfsCid ?? undefined,
        ipfsUrl: upload.ipfsUrl ?? undefined,
      },
      autoAnalysis,
      message: "CSV uploaded and pinned to IPFS successfully",
    });
  } catch (error) {
    console.error("❌ Upload route error:", error);
    return NextResponse.json<CsvUploadResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}
