import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Report analysis tool following GRI (Global Reporting Initiative) sustainability standards
 * Analyzes CSV data quality, completeness, and compliance with reporting frameworks
 */
export const reportAnalyzerTool = new DynamicStructuredTool({
  name: "analyze_sustainability_report",
  description:
    "Analyze a sustainability report CSV following GRI (Global Reporting Initiative) standards. Evaluate data quality, identify strengths (merits) and areas for improvement. Use this to assess report completeness, data coverage, compliance with GRI 300-series environmental standards (emissions, energy, water, waste), and provide actionable recommendations.",
  schema: z.object({
    merits: z
      .array(z.string())
      .describe(
        "List of positive aspects: complete data coverage, comprehensive metrics, multi-year trends, GRI-aligned indicators, good practices",
      ),
    improvements: z
      .array(z.string())
      .describe(
        "List of areas needing improvement: missing data points, incomplete metrics, gaps in GRI coverage, data quality issues, missing disclosures",
      ),
    griCompliance: z
      .object({
        score: z
          .number()
          .min(0)
          .max(100)
          .describe("Overall GRI compliance score (0-100)"),
        coveredStandards: z
          .array(z.string())
          .describe("GRI standards covered (e.g., GRI 305, GRI 302)"),
        missingStandards: z
          .array(z.string())
          .describe("Key GRI standards missing from the report"),
      })
      .describe("GRI framework compliance assessment"),
    recommendations: z
      .array(z.string())
      .describe(
        "Specific, actionable recommendations for improving the report quality and GRI alignment",
      ),
    dataQuality: z
      .object({
        completeness: z
          .number()
          .min(0)
          .max(100)
          .describe("Data completeness percentage"),
        consistency: z.string().describe("Assessment of data consistency"),
        reliability: z.string().describe("Assessment of data reliability"),
      })
      .optional()
      .describe("Overall data quality metrics"),
  }),
  func: async ({
    merits,
    improvements,
    griCompliance,
    recommendations,
    dataQuality,
  }: {
    merits: string[];
    improvements: string[];
    griCompliance: {
      score: number;
      coveredStandards: string[];
      missingStandards: string[];
    };
    recommendations: string[];
    dataQuality?: {
      completeness: number;
      consistency: string;
      reliability: string;
    };
  }) => {
    const analysis = {
      merits,
      improvements,
      griCompliance,
      recommendations,
      dataQuality,
      analyzedAt: new Date().toISOString(),
    };

    return JSON.stringify(analysis, null, 2);
  },
});
