import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

/**
 * Loads and parses a CSV from a URL (Vercel Blob URL)
 * Returns chunked documents ready for LangChain processing
 */
export async function loadCsvFromUrl(url: string): Promise<Document[]> {
  try {
    // Fetch the CSV from Vercel Blob
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }

    const text = await response.text();
    const blob = new Blob([text], { type: "text/csv" });

    // Create a CSVLoader instance
    const loader = new CSVLoader(blob);

    // Load the documents
    const docs = await loader.load();

    // Split documents into smaller chunks for better context handling
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    return splitDocs;
  } catch (error) {
    console.error("Error loading CSV:", error);
    throw new Error(
      `Failed to load CSV from URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Extracts all text content from a CSV for context injection
 */
export async function extractCsvText(url: string): Promise<string> {
  const docs = await loadCsvFromUrl(url);
  return docs.map((doc) => doc.pageContent).join("\n\n");
}
