import { NextRequest, NextResponse } from "next/server";
import { invokeCsvAgent } from "@/core/agent/pdf-agent";
import { db } from "@/core/db";
import { csvUploads } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import type { AgentResponse, ChatRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, pdfUploadId, threadId } = body;

    // Validate inputs
    if (!message || !pdfUploadId) {
      return NextResponse.json(
        { error: "message and pdfUploadId are required" },
        { status: 400 },
      );
    }

    // Get CSV upload info from database
    const [upload] = await db
      .select()
      .from(csvUploads)
      .where(eq(csvUploads.id, pdfUploadId))
      .limit(1);

    if (!upload) {
      return NextResponse.json(
        { error: "CSV upload not found" },
        { status: 404 },
      );
    }

    // Format parsed CSV data for agent context
    const parsedData = upload.parsedData as Array<Record<string, string>>;
    
    if (!parsedData || parsedData.length === 0) {
      return NextResponse.json(
        { error: "No data found in CSV upload" },
        { status: 400 },
      );
    }

    // Convert parsed data to readable format
    const headers = Object.keys(parsedData[0] || {});
    const csvContext = [
      headers.join(","),
      ...parsedData.map(row => headers.map(h => row[h]).join(","))
    ].join("\n");

    // Invoke the agent
    const result = await invokeCsvAgent(message, csvContext, threadId || "default");

    const response: AgentResponse = {
      message: result.response,
      chartConfig: result.chartConfig,
      threadId: threadId || "default",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process chat message",
      },
      { status: 500 },
    );
  }
}

