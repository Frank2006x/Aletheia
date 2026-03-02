import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import type { ChartConfig } from "@/types";

/**
 * Chart generation tool for LangChain agent
 * Converts structured data into Chart.js configuration
 */
export const chartGeneratorTool = new DynamicStructuredTool({
  name: "generate_chart",
  description:
    "Generate a chart visualization from data. Use this when the user asks to visualize data, create a chart, or plot information. Provide the chart type, data values, labels, and title.",
  schema: z.object({
    type: z
      .enum(["bar", "line", "pie", "doughnut"])
      .describe("The type of chart to generate"),
    labels: z.array(z.string()).describe("Labels for the x-axis or categories"),
    datasets: z
      .array(
        z.object({
          label: z.string().describe("Dataset label/name"),
          data: z.array(z.number()).describe("Data values for this dataset"),
          backgroundColor: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .describe("Background color(s)"),
          borderColor: z
            .union([z.string(), z.array(z.string())])
            .optional()
            .describe("Border color(s)"),
        }),
      )
      .describe("Datasets to plot"),
    title: z.string().optional().describe("Chart title"),
  }),
  func: async ({
    type,
    labels,
    datasets,
    title,
  }: {
    type: "bar" | "line" | "pie" | "doughnut";
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
    }>;
    title?: string;
  }) => {
    // Generate default colors if not provided
    const defaultColors = [
      "rgba(2, 128, 144, 0.8)", // Electric teal
      "rgba(27, 67, 50, 0.8)", // Deep forest green
      "rgba(248, 249, 250, 0.8)", // Off-white
      "rgba(255, 99, 132, 0.8)",
      "rgba(54, 162, 235, 0.8)",
      "rgba(255, 206, 86, 0.8)",
      "rgba(75, 192, 192, 0.8)",
    ];

    const processedDatasets = datasets.map((dataset, idx: number) => ({
      ...dataset,
      backgroundColor:
        dataset.backgroundColor ||
        (type === "pie" || type === "doughnut"
          ? defaultColors
          : defaultColors[idx % defaultColors.length]),
      borderColor:
        dataset.borderColor ||
        (type === "pie" || type === "doughnut"
          ? defaultColors.map((c) => c.replace("0.8", "1"))
          : defaultColors[idx % defaultColors.length].replace("0.8", "1")),
      borderWidth: 2,
    }));

    const chartConfig: ChartConfig = {
      type,
      data: {
        labels,
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
            display: !!title,
            text: title || "",
          },
        },
        ...(type !== "pie" && type !== "doughnut"
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

    // Return the chart config as a JSON string
    return JSON.stringify(chartConfig);
  },
});
