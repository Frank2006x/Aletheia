"use client";

import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from "chart.js";
import type { ChartConfig } from "@/types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Vibrant color palette for dark backgrounds
const VIVID_COLORS = [
  "rgba(52, 211, 153, 0.85)", // emerald (primary)
  "rgba(99, 102, 241, 0.85)", // indigo
  "rgba(244, 114, 182, 0.85)", // pink
  "rgba(251, 191, 36, 0.85)", // amber
  "rgba(56, 189, 248, 0.85)", // sky
  "rgba(167, 139, 250, 0.85)", // violet
  "rgba(249, 115, 22, 0.85)", // orange
  "rgba(20, 184, 166, 0.85)", // teal
];

const VIVID_BORDERS = [
  "rgba(52, 211, 153, 1)",
  "rgba(99, 102, 241, 1)",
  "rgba(244, 114, 182, 1)",
  "rgba(251, 191, 36, 1)",
  "rgba(56, 189, 248, 1)",
  "rgba(167, 139, 250, 1)",
  "rgba(249, 115, 22, 1)",
  "rgba(20, 184, 166, 1)",
];

// Inject colors into datasets without touching any logic
function injectColors(data: ChartConfig["data"]): ChartConfig["data"] {
  if (!data || !data.datasets) return data;
  return {
    ...data,
    datasets: data.datasets.map((ds, i) => ({
      ...ds,
      // For pie/doughnut with multiple segments, use full palette; otherwise per-dataset color
      backgroundColor:
        Array.isArray(ds.backgroundColor) && ds.backgroundColor.length > 1
          ? VIVID_COLORS
          : VIVID_COLORS[i % VIVID_COLORS.length],
      borderColor:
        Array.isArray(ds.borderColor) && ds.borderColor.length > 1
          ? VIVID_BORDERS
          : VIVID_BORDERS[i % VIVID_BORDERS.length],
      borderWidth: ds.borderWidth ?? 2,
    })),
  };
}

interface ChartRendererProps {
  config: ChartConfig;
}

export default function ChartRenderer({ config }: ChartRendererProps) {
  const coloredData = injectColors(config.data);

  // Build dark-themed chart options as a plain object to avoid TS strictness issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const darkOptions: any = {
    ...(config.options ?? {}),
    plugins: {
      ...(config.options?.plugins ?? {}),
      legend: {
        ...(config.options?.plugins?.legend ?? {}),
        labels: {
          color: "rgba(255,255,255,0.7)",
          font: { size: 11 },
          ...(config.options?.plugins?.legend
            ? ((config.options.plugins.legend as Record<string, unknown>)
                .labels ?? {})
            : {}),
        },
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.9)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        titleColor: "#fff",
        bodyColor: "rgba(255,255,255,0.7)",
        ...(config.options?.plugins ?? {}),
      },
    },
    ...(config.type !== "pie" && config.type !== "doughnut"
      ? {
          scales: {
            x: {
              ticks: { color: "rgba(255,255,255,0.5)", font: { size: 10 } },
              grid: { color: "rgba(255,255,255,0.06)" },
              ...(config.options?.scales?.x ?? {}),
            },
            y: {
              ticks: { color: "rgba(255,255,255,0.5)", font: { size: 10 } },
              grid: { color: "rgba(255,255,255,0.06)" },
              ...(config.options?.scales?.y ?? {}),
            },
            ...(config.options?.scales ?? {}),
          },
        }
      : {}),
  };

  const commonProps = {
    data: coloredData,
    options: darkOptions,
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-black rounded-xl border border-white/[0.08]">
      {config.type === "bar" && <Bar {...commonProps} />}
      {config.type === "line" && <Line {...commonProps} />}
      {config.type === "pie" && <Pie {...commonProps} />}
      {config.type === "doughnut" && <Doughnut {...commonProps} />}
    </div>
  );
}
