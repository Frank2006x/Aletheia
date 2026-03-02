import { NextRequest, NextResponse } from "next/server";
import { db } from "@/core/db";
import { uploadLinks, csvUploads } from "@/core/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// GET /api/links/[token] — get link status + report if uploaded
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [link] = await db
      .select()
      .from(uploadLinks)
      .where(eq(uploadLinks.token, token));

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Only investor who created it or the supplier who used it can access
    const isInvestor = link.investorUserId === session.user.id;
    const isSupplier = link.supplierUserId === session.user.id;
    // For pending links: any authenticated user can access (they need to upload)
    const isPending = link.status === "pending";

    if (!isInvestor && !isSupplier && !isPending) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let report = null;
    if (link.status === "used" && link.uploadId) {
      const [upload] = await db
        .select()
        .from(csvUploads)
        .where(eq(csvUploads.id, link.uploadId));
      report = upload
        ? {
            ...upload,
            autoAnalysis: upload.analysisResult ?? null,
          }
        : null;
    }

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        token: link.token,
        status: link.status,
        createdAt: link.createdAt,
        investorUserId: link.investorUserId,
        supplierUserId: link.supplierUserId,
      },
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch link",
      },
      { status: 500 },
    );
  }
}
