import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { chartGeneratorTool } from "@/core/tool/chart-generator";
import type { ChartConfig } from "@/types";

/**
 * Creates a LangChain v1 agent with CSV data knowledge and chart generation capabilities
 */
export function createCsvAgent(csvContext: string) {
  // Initialize Google Gemini model
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  // System prompt with CSV context
  const systemPrompt = `You are an AI assistant analyzing CSV data from a company's sustainability report. You have access to the full dataset below.

**CSV DATA:**
${csvContext}

**YOUR CAPABILITIES:**
1. Answer questions about the data
2. Extract and analyze metrics from the dataset
3. Generate charts and visualizations when asked
4. Provide insights and trends
5. Calculate aggregations and comparisons

**INSTRUCTIONS:**
- Always base your answers on the CSV data provided
- When asked to create charts, use the generate_chart tool with accurate data from the CSV
- Be precise with numbers and cite specific rows/columns when relevant
- If information is not in the data, clearly state that
- For numerical questions, provide exact values from the dataset

Now, help the user with their question.`;

  // Create agent using LangChain v1 API
  const agent = createAgent({
    model: model,
    tools: [chartGeneratorTool],
    systemPrompt: systemPrompt,
  });

  return agent;
}

/**
 * Invokes the agent with a message and CSV data context
 */
export async function invokeCsvAgent(
  message: string,
  csvContext: string,
  threadId: string,
): Promise<{ response: string; chartConfig?: ChartConfig }> {
  const agent = createCsvAgent(csvContext);

  try {
    // Invoke the agent with just the user message
    const result = await agent.invoke(
      {
        messages: [new HumanMessage(message)],
      },
      {
        configurable: {
          thread_id: threadId,
        },
      },
    );

    // Extract the final message
    const messages = result.messages;
    const lastMessage = messages[messages.length - 1];
    const responseText = lastMessage.content as string;

    // Check if a chart was generated
    let chartConfig: ChartConfig | undefined;

    // Look for tool calls in the messages
    for (const msg of messages) {
      if (msg.additional_kwargs?.tool_calls) {
        for (const toolCall of msg.additional_kwargs.tool_calls) {
          if (toolCall.function?.name === "generate_chart") {
            // The tool result will be in the next message
            const toolResultIndex = messages.indexOf(msg) + 1;
            if (toolResultIndex < messages.length) {
              const toolResult = messages[toolResultIndex];
              if (toolResult.content) {
                try {
                  chartConfig = JSON.parse(toolResult.content as string);
                } catch (e) {
                  console.error("Failed to parse chart config:", e);
                }
              }
            }
          }
        }
      }
    }

    return {
      response: responseText,
      chartConfig,
    };
  } catch (error) {
    console.error("Error invoking agent:", error);
    throw new Error(
      `Agent invocation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
