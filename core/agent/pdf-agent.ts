import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createAgent } from "langchain";
import { HumanMessage } from "@langchain/core/messages";
import { chartGeneratorTool } from "@/core/tool/chart-generator";
import { reportAnalyzerTool } from "@/core/tool/report-analyzer";
import { autoChartGeneratorTool } from "@/core/tool/auto-chart-generator";
import { z } from "zod";
import type { ChartConfig, ReportAnalysis, AutoAnalysisResult } from "@/types";

// Structured output schema for auto-analysis
const AutoAnalysisSchema = z.object({
  summary: z
    .string()
    .describe("Brief executive summary of the sustainability report"),
  esgScore: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall ESG/GRI compliance score (0-100)"),
  charts: z
    .array(
      z.object({
        type: z.enum(["bar", "line", "pie", "doughnut"]).describe("Chart type"),
        title: z.string().describe("Chart title"),
        labels: z.array(z.string()).describe("Chart labels"),
        datasets: z.array(
          z.object({
            label: z.string(),
            data: z.array(z.number()),
            backgroundColor: z.string().or(z.array(z.string())).optional(),
            borderColor: z.string().or(z.array(z.string())).optional(),
          }),
        ),
        insight: z.string().optional().describe("Key insight from this chart"),
      }),
    )
    .min(2)
    .max(3)
    .describe("2-3 key overview charts"),
  merits: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe("Top strengths in data reporting"),
  improvements: z
    .array(z.string())
    .min(3)
    .max(6)
    .describe("Key areas needing improvement"),
  griCompliance: z.object({
    score: z.number().min(0).max(100).describe("GRI compliance percentage"),
    coveredStandards: z.array(z.string()).describe("GRI standards covered"),
    missingStandards: z.array(z.string()).describe("Missing GRI standards"),
  }),
  recommendations: z
    .array(z.string())
    .min(3)
    .max(5)
    .describe("Actionable recommendations"),
});

/**
 * Creates a LangChain v1 agent with CSV analysis, chart generation, and GRI report evaluation
 */
export function createCsvAgent(csvContext: string) {
  // Initialize Google Gemini model
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  });

  // System prompt with CSV context and GRI framework
  const systemPrompt = `You are an AI assistant analyzing CSV data from a company's sustainability report. You have access to the full dataset below.

**CSV DATA:**
${csvContext}

**YOUR CAPABILITIES:**
1. Answer questions about the data
2. Extract and analyze metrics from the dataset
3. Generate charts and visualizations when asked
4. Evaluate report quality following GRI (Global Reporting Initiative) standards
5. Assess GRI compliance (particularly GRI 300-series environmental standards: GRI 302-Energy, GRI 303-Water, GRI 305-Emissions, GRI 306-Waste)
6. Provide insights, trends, and recommendations

**GRI FRAMEWORK REFERENCE:**
- GRI 302: Energy consumption, energy intensity, reduction
- GRI 303: Water withdrawal, consumption, discharge
- GRI 305: GHG emissions (Scope 1, 2, 3), emissions intensity, reductions
- GRI 306: Waste generation, diversion, disposal
- GRI 307: Environmental compliance

**INSTRUCTIONS:**
- Always base your answers on the CSV data provided
- When asked to create charts, use the generate_chart tool with accurate data from the CSV
- When analyzing report quality, use the analyze_sustainability_report tool to assess against GRI standards
- For auto-analysis, use generate_overview_charts to create 2-3 key visualizations
- Be precise with numbers and cite specific rows/columns when relevant
- Identify which GRI standards are covered by the available data
- Note gaps in GRI compliance (e.g., missing Scope 3 emissions, incomplete water data)
- If information is not in the data, clearly state that
- For numerical questions, provide exact values from the dataset

Now, help the user with their question.`;

  // Create agent using LangChain v1 API with all tools
  const agent = createAgent({
    model: model,
    tools: [chartGeneratorTool, reportAnalyzerTool, autoChartGeneratorTool],
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
): Promise<{
  response: string;
  chartConfig?: ChartConfig;
  reportAnalysis?: ReportAnalysis;
}> {
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

    // Check if a chart or analysis was generated
    let chartConfig: ChartConfig | undefined;
    let reportAnalysis: ReportAnalysis | undefined;

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

          if (toolCall.function?.name === "analyze_sustainability_report") {
            // The tool result will be in the next message
            const toolResultIndex = messages.indexOf(msg) + 1;
            if (toolResultIndex < messages.length) {
              const toolResult = messages[toolResultIndex];
              if (toolResult.content) {
                try {
                  reportAnalysis = JSON.parse(toolResult.content as string);
                } catch (e) {
                  console.error("Failed to parse report analysis:", e);
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
      reportAnalysis,
    };
  } catch (error) {
    console.error("Error invoking agent:", error);
    throw new Error(
      `Agent invocation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Runs automatic analysis on CSV upload using structured output
 * Guarantees consistent, error-free structure for initial report
 */
export async function runAutoAnalysis(
  csvContext: string,
): Promise<AutoAnalysisResult> {
  try {
    // Initialize model with structured output
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0.7,
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Use withStructuredOutput for guaranteed schema compliance
    const structuredModel = model.withStructuredOutput(AutoAnalysisSchema);

    const analysisPrompt = `Analyze this sustainability CSV data following GRI standards and provide a comprehensive initial report.

**CSV DATA:**
${csvContext}

**YOUR TASK:**
Provide a complete ESG/sustainability analysis with:

1. **ESG Score (0-100)**: Overall compliance score based on GRI standards coverage and data quality
2. **Charts (2-3)**: Generate the most important visualizations:
   - Time series showing trends (emissions, energy, water, or waste over years)
   - Key performance indicators
   - Most significant metrics that show company performance
3. **Merits (3-6 items)**: Identify strengths:
   - Complete data coverage
   - Comprehensive metrics
   - Good practices
   - Positive trends
   - Strong GRI alignment
4. **Improvements (3-6 items)**: Identify areas needing work:
   - Missing data points
   - Incomplete metrics
   - Gaps in GRI coverage
   - Data quality issues
   - Concerning trends
5. **GRI Compliance**: Assess which GRI standards are covered (GRI 302-Energy, 303-Water, 305-Emissions, 306-Waste, 401-Employment, 403-Safety, 404-Training, 405-Diversity, 407-Compliance)
6. **Recommendations (3-5)**: Specific, actionable steps to improve reporting

Be precise, data-driven, and reference specific metrics from the CSV.`;

    const result = await structuredModel.invoke(analysisPrompt);

    // Process charts to match ChartConfig format
    const processedCharts = result.charts.map((chart) => {
      const defaultColors = [
        "rgba(2, 128, 144, 0.8)",
        "rgba(27, 67, 50, 0.8)",
        "rgba(34, 139, 34, 0.8)",
        "rgba(255, 99, 132, 0.8)",
        "rgba(54, 162, 235, 0.8)",
      ];

      const chartConfig: ChartConfig = {
        type: chart.type,
        data: {
          labels: chart.labels,
          datasets: chart.datasets.map((dataset, idx) => ({
            ...dataset,
            backgroundColor:
              dataset.backgroundColor ||
              (chart.type === "pie" || chart.type === "doughnut"
                ? defaultColors
                : defaultColors[idx % defaultColors.length]),
            borderColor:
              dataset.borderColor ||
              (chart.type === "pie" || chart.type === "doughnut"
                ? defaultColors.map((c) => c.replace("0.8", "1"))
                : defaultColors[idx % defaultColors.length].replace(
                    "0.8",
                    "1",
                  )),
            borderWidth: 2,
          })),
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            title: {
              display: true,
              text: chart.title,
            },
          },
          ...(chart.type !== "pie" && chart.type !== "doughnut"
            ? {
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }
            : {}),
        },
      };

      return {
        chartConfig,
        insight: chart.insight,
      };
    });

    return {
      summary: result.summary,
      esgScore: result.esgScore,
      charts: processedCharts,
      analysis: {
        merits: result.merits,
        improvements: result.improvements,
        griCompliance: result.griCompliance,
        recommendations: result.recommendations,
        analyzedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Error in auto-analysis:", error);

    // Fallback structure if analysis fails
    return {
      summary: "Analysis failed. Please check the CSV format and try again.",
      esgScore: 0,
      charts: [],
      analysis: {
        merits: ["CSV uploaded successfully"],
        improvements: [
          "Unable to complete analysis - please verify CSV format",
        ],
        griCompliance: {
          score: 0,
          coveredStandards: [],
          missingStandards: ["Analysis incomplete"],
        },
        recommendations: [
          "Verify CSV format matches the recommended structure",
        ],
        analyzedAt: new Date().toISOString(),
      },
    };
  }
}
