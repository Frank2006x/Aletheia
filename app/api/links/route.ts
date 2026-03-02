import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/core/db";
import { uploadLinks, csvUploads } from "@/core/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// POST /api/links — investor creates a new upload link
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = crypto.randomBytes(24).toString("hex"); // 48-char hex
    const [link] = await db
      .insert(uploadLinks)
      .values({
        token,
        investorUserId: session.user.id,
        status: "pending",
      })
      .returning();

    const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/upload/${token}`;

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        token: link.token,
        uploadUrl,
        status: link.status,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create link",
      },
      { status: 500 },
    );
  }
}

// GET /api/links — investor fetches all their links with report info
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const links = await db
      .select()
      .from(uploadLinks)
      .where(eq(uploadLinks.investorUserId, session.user.id))
      .orderBy(uploadLinks.createdAt);

    // For used links, fetch report summary
    const enriched = await Promise.all(
      links.map(async (link) => {
        let report = null;
        if (link.status === "used" && link.uploadId) {
          const [upload] = await db
            .select({
              id: csvUploads.id,
              fileName: csvUploads.fileName,
              fileHash: csvUploads.fileHash,
              ipfsCid: csvUploads.ipfsCid,
              ipfsUrl: csvUploads.ipfsUrl,
              uploadedAt: csvUploads.uploadedAt,
            })
            .from(csvUploads)
            .where(eq(csvUploads.id, link.uploadId));
          report = upload ?? null;
        }

        return {
          id: link.id,
          token: link.token,
          uploadUrl: `${process.env.NEXT_PUBLIC_APP_URL}/upload/${link.token}`,
          status: link.status,
          createdAt: link.createdAt,
          report,
        };
      }),
    );

    return NextResponse.json({ success: true, links: enriched });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch links",
      },
      { status: 500 },
    );
  }
}
