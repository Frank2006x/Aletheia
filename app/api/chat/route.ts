import { NextRequest, NextResponse } from "next/server";
import { invokeCsvAgent } from "@/core/agent/pdf-agent";
import { extractCsvText } from "@/core/tool/csv-loader";
import { db } from "@/core/db";
import { chatThreads, chatMessages, csvUploads } from "@/core/db/schema";
import { eq } from "drizzle-orm";
import type { AgentResponse, ChatRequest } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, pdfUploadId, threadId } = body;

    // Validate inputs
    if (!message || !pdfUploadId || !threadId) {
      return NextResponse.json(
        { error: "message, pdfUploadId, and threadId are required" },
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

    // Check if thread exists, create if not
    let [thread] = await db
      .select()
      .from(chatThreads)
      .where(eq(chatThreads.id, threadId))
      .limit(1);

    if (!thread) {
      [thread] = await db
        .insert(chatThreads)
        .values({
          id: threadId,
          csvUploadId: upload.id,
        })
        .returning();
    }

    // Save user message to database
    await db.insert(chatMessages).values({
      threadId: thread.id,
      role: "user",
      content: message,
    });

    // Extract CSV text for context
    const csvContext = await extractCsvText(upload.fileUrl);

    // Invoke the agent
    const result = await invokeCsvAgent(message, csvContext, threadId);

    // Save AI response to database
    await db.insert(chatMessages).values({
      threadId: thread.id,
      role: "assistant",
      content: result.response,
      chartConfig: result.chartConfig || null,
    });

    const response: AgentResponse = {
      message: result.response,
      chartConfig: result.chartConfig,
      threadId,
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
