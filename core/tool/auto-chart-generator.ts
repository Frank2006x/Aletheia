import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import type { ChartConfig } from "@/types";

/**
 * Automatic chart generation tool for creating multiple overview charts from CSV data
 * Used during initial CSV analysis to provide visual summaries
 */
export const autoChartGeneratorTool = new DynamicStructuredTool({
  name: "generate_overview_charts",
  description:
    "Generate 2-3 key overview charts automatically from CSV data. Select the most important metrics for visualization (e.g., emissions over time, energy consumption trends, waste generation). Create charts that provide immediate insights into the sustainability data.",
  schema: z.object({
    charts: z
      .array(
        z.object({
          type: z
            .enum(["bar", "line", "pie", "doughnut"])
            .describe("Chart type"),
          labels: z
            .array(z.string())
            .describe("Labels for x-axis or categories"),
          datasets: z
            .array(
              z.object({
                label: z.string().describe("Dataset label/name"),
                data: z.array(z.number()).describe("Data values"),
                backgroundColor: z
                  .union([z.string(), z.array(z.string())])
                  .optional(),
                borderColor: z
                  .union([z.string(), z.array(z.string())])
                  .optional(),
              }),
            )
            .describe("Datasets to plot"),
          title: z.string().describe("Chart title"),
          insight: z
            .string()
            .optional()
            .describe("Key insight or finding from this chart"),
        }),
      )
      .min(1)
      .max(3)
      .describe("Array of 1-3 overview charts"),
  }),
  func: async ({
    charts,
  }: {
    charts: Array<{
      type: "bar" | "line" | "pie" | "doughnut";
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
      }>;
      title: string;
      insight?: string;
    }>;
  }) => {
    // Generate default colors
    const defaultColors = [
      "rgba(2, 128, 144, 0.8)", // Electric teal
      "rgba(27, 67, 50, 0.8)", // Deep forest green
      "rgba(34, 139, 34, 0.8)", // Forest green
      "rgba(255, 99, 132, 0.8)", // Red
      "rgba(54, 162, 235, 0.8)", // Blue
      "rgba(255, 206, 86, 0.8)", // Yellow
      "rgba(75, 192, 192, 0.8)", // Cyan
    ];

    const processedCharts = charts.map((chart) => {
      const processedDatasets = chart.datasets.map((dataset, idx) => ({
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
            : defaultColors[idx % defaultColors.length].replace("0.8", "1")),
        borderWidth: 2,
      }));

      const chartConfig: ChartConfig = {
        type: chart.type,
        data: {
          labels: chart.labels,
          datasets: processedDatasets,
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

    return JSON.stringify({ charts: processedCharts }, null, 2);
  },
});
