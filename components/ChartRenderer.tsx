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

interface ChartRendererProps {
  config: ChartConfig;
}

export default function ChartRenderer({ config }: ChartRendererProps) {
  const commonProps = {
    data: config.data,
    options: config.options || {},
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      {config.type === "bar" && <Bar {...commonProps} />}
      {config.type === "line" && <Line {...commonProps} />}
      {config.type === "pie" && <Pie {...commonProps} />}
      {config.type === "doughnut" && <Doughnut {...commonProps} />}
    </div>
  );
}
